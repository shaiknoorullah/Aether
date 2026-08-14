// Aether tab source (r4) — the pure source behind the tab panel: row
// construction, the per-tab metadata table (rename/tags/pin/mark), its schema-3
// serde, and mark resolution. No Services, no DOM, no IOUtils, and NO CLOCK —
// recency arrives as `tab.lastAccessed`, fed by the glue's TabSelect listener,
// and the file I/O lives in aether-workspaces-service.sys.mjs.
//
// What this module deliberately does NOT do: it never enumerates gBrowser,
// never switches or closes anything (the actions below are names of registry
// commands, which the glue dispatches), and never renders — `row.text` is the
// one searchable string, and the renderer decides how to draw the parts beside
// it.
//
// The ordering rule is load-bearing: pins first (they are positional addresses
// bound to 1–9), then MRU descending, with the CURRENT tab last inside the
// unpinned block. Strict "most recent first" would put the tab you are already
// on at row 1 and Enter would do nothing; putting it last makes the panel
// alt-tab. A pinned current tab keeps its number's position.

// Metadata keys are f5 ref ids — non-negative integers, strings after JSON.
// "__proto__", "constructor", "1.5" and "-2" never pass, which is why nothing
// here can reach the prototype chain. `buildRows` keys rows by the SAME rule:
// a row the panel shows but the metadata table cannot key is a row whose
// rename, tag, pin and mark are silent no-ops.
const ID_KEY = /^(0|[1-9][0-9]*)$/;

const RENAME_MAX = 200;
const TAG_MAX = 32;
const TAGS_CAP = 16;
// A title is not ours to cap on disk, but the row's searchable text is scanned
// on every keystroke, so the parts that come from the page are clipped into it.
const TITLE_MAX = 200;

// Characters that can lie about what a row is, refused in every user-supplied
// field. \p{Cc} is the control set (\n, \r, \0, BEL — a rename that spans lines
// or truncates a row). \p{Cf} is the format set, which is the dangerous half:
// U+202E RIGHT-TO-LEFT OVERRIDE reverses the display of everything after it, so
// a rename ending in one renders the real title and host backwards — a single
// character defeating "a rename must never hide what the page actually is" —
// and the zero-width characters (U+200B, U+FEFF) render as nothing at all, so a
// mark set to one occupies a letter slot that no keystroke can ever reach.
// Refused whole rather than stripped: silently rewriting what someone typed is
// how you get a rename that is not the rename they read back.
const HIDDEN = /[\p{Cc}\p{Cf}]/u;
// A mark is additionally never a lone combining character (\p{M}) — it renders
// on top of the `'` prefix instead of beside it, and is likewise untypeable.
const HIDDEN_MARK = /[\p{Cc}\p{Cf}\p{M}]/u;

// The Tab-cycled action ring. Index 0 is what Enter does on open. Every one of
// these is also a registry command (ACTION_COMMANDS): the palette, a keybinding
// and later the agent reach exactly what the panel reaches.
export const TAB_ACTIONS = Object.freeze([
  "switch",
  "close",
  "duplicate",
  "rename",
  "tag",
  "pin",
  "move-to-workspace",
]);

export const ACTION_COMMANDS = Object.freeze({
  switch: "tab_select",
  close: "tab_close",
  duplicate: "tab_duplicate",
  rename: "tab_rename",
  tag: "tab_tag",
  pin: "tab_pin",
  "move-to-workspace": "tab_move_ws",
});

// --- field validation ---------------------------------------------------------
// Every field is validated the same way on write (applyMeta), on read
// (deserializeMeta) and on render (buildRows), so a hand-edited file cannot
// carry a value that the panel would then render or act on.

function ownGet(table, key) {
  if (!table || typeof table !== "object") return undefined;
  return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

// A metadata key: the ref id as a string, or null when the id is not one.
function idKey(id) {
  if (typeof id === "symbol" || typeof id === "function" || (id && typeof id === "object")) return null;
  const key = String(id);
  return ID_KEY.test(key) ? key : null;
}

function validRename(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.length > RENAME_MAX) return null;
  if (HIDDEN.test(trimmed)) return null;
  return trimmed;
}

// Trimmed, deduped, first-seen order, capped — an unbounded tag list would end
// up in the config file verbatim.
function validTags(value) {
  if (!Array.isArray(value)) return null;
  const out = [];
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const tag = raw.trim();
    if (tag === "" || tag.length > TAG_MAX || out.includes(tag)) continue;
    if (HIDDEN.test(tag)) continue;
    out.push(tag);
    if (out.length === TAGS_CAP) break;
  }
  return out.length === 0 ? null : out;
}

// Pins address the 1–9 keys and nothing else.
function validPin(value) {
  return Number.isInteger(value) && value >= 1 && value <= 9 ? value : null;
}

// One code point, not one UTF-16 unit: an astral mark is a single character.
// It must also be a character you can both see and type: a zero-width, control
// or combining mark would hold its letter slot forever, invisible in the row
// and unreachable from `'<char>`.
function validMark(value) {
  if (typeof value !== "string" || value.trim() === "") return null;
  if (HIDDEN_MARK.test(value)) return null;
  return Array.from(value).length === 1 ? value : null;
}

function validWorkspace(value) {
  if (typeof value !== "string" || value === "") return null;
  return HIDDEN.test(value) ? null : value;
}

// One entry, with every unusable field dropped individually. `workspace` scopes
// pin uniqueness and is not content on its own: an entry left with nothing but
// a workspace is empty and disappears.
//
// Fields are read with ownGet, not `raw.rename`: an entry handed to us by a
// caller (rather than by JSON.parse) can inherit from a prototype, and an
// inherited "rename" would otherwise be sanitized, stored and rendered as if
// someone had typed it. Reads are guarded in the same direction as writes.
function sanitizeEntry(raw) {
  if (!isPlainObject(raw)) return null;
  const entry = {};
  const rename = validRename(ownGet(raw, "rename"));
  if (rename !== null) entry.rename = rename;
  const tags = validTags(ownGet(raw, "tags"));
  if (tags !== null) entry.tags = tags;
  const pin = validPin(ownGet(raw, "pin"));
  if (pin !== null) entry.pin = pin;
  const mark = validMark(ownGet(raw, "mark"));
  if (mark !== null) entry.mark = mark;
  if (!hasContent(entry)) return null;
  const workspace = validWorkspace(ownGet(raw, "workspace"));
  if (workspace !== null) entry.workspace = workspace;
  return entry;
}

function hasContent(entry) {
  return (
    entry.rename !== undefined ||
    entry.tags !== undefined ||
    entry.pin !== undefined ||
    entry.mark !== undefined
  );
}

// Accepts a Map, a plain object keyed by id, or a function; anything else means
// the caller has no live knowledge and the stored copies stand.
function workspaceLookup(source) {
  if (typeof source === "function") {
    return key => {
      try {
        return validWorkspace(source(key));
      } catch {
        return null;
      }
    };
  }
  if (source instanceof Map) return key => validWorkspace(source.get(key));
  if (isPlainObject(source)) return key => validWorkspace(ownGet(source, key));
  return () => null;
}

function keysAscending(table) {
  return Object.keys(table)
    .filter(key => ID_KEY.test(key))
    .sort((a, b) => Number(a) - Number(b));
}

// The whole table, sanitized, in ascending key order, with the cross-entry
// invariants re-enforced: one tab per mark letter, one tab per pin number per
// workspace. A hand-edited file with duplicates resolves the same way every
// time — the lower key keeps it — so `'a` and `tab_pin_goto 3` are never
// ambiguous. Every path that reads the table — write, read, AND render — goes
// through here, because an invariant enforced only on write is an invariant
// that a hand-edited (or, at v2.1, agent-written) file simply does not have.
//
// Which workspace a tab is actually in is the CALLER's to say. Pins are
// per-workspace, and the only authority on a tab's workspace is the tab: the
// `workspace` copy stored in an entry goes stale the moment `tab_move_ws` runs,
// and is absent entirely if the caller omitted it. So a live mapping wins
// wherever there is one (buildRows always has one — it is holding the tabs),
// and a known live workspace also replaces the stored copy, so the table heals
// itself and the next save records where the tab is rather than where it was.
// The stored copy is only the fallback that survives a restart, before any tab
// has been enumerated.
function canonicalTable(meta, workspaces) {
  const out = {};
  if (!isPlainObject(meta)) return out;
  const live = workspaceLookup(workspaces);
  const claimedMarks = new Set();
  const claimedPins = new Set();
  for (const key of keysAscending(meta)) {
    const entry = sanitizeEntry(ownGet(meta, key));
    if (!entry) continue;
    const liveWorkspace = live(key);
    if (liveWorkspace !== null) entry.workspace = liveWorkspace;
    if (entry.mark !== undefined) {
      if (claimedMarks.has(entry.mark)) delete entry.mark;
      else claimedMarks.add(entry.mark);
    }
    if (entry.pin !== undefined) {
      const slot = `${entry.workspace ?? ""}\u0000${entry.pin}`;
      if (claimedPins.has(slot)) delete entry.pin;
      else claimedPins.add(slot);
    }
    if (!hasContent(entry)) continue;
    out[key] = entry;
  }
  return out;
}

// --- metadata edits -----------------------------------------------------------

// One change against the table: `{id, rename?, tags?, pin?, mark?, workspace?}`.
// An absent field is left alone; `null` clears it; an invalid value is ignored
// rather than written over good data. A mark is unique per letter AND per tab;
// a pin is unique within its workspace. An entry with no fields left disappears
// instead of accreting forever. Never mutates the table it was given.
//
// `workspaces` is the optional live id → workspace mapping (see canonicalTable):
// pass it and pin uniqueness is scoped by where each tab IS; omit it and the
// stored copies are all there is to go on. The glue holds gBrowser, so it can
// always pass one.
//
// The id must be an f5 ref id — `buildRows` drops rows whose id is not one, for
// exactly this reason: a row the panel shows but this function refuses is a row
// whose rename, tag, pin and mark are silent no-ops.
export function applyMeta(meta, change, workspaces) {
  const table = canonicalTable(meta, workspaces);
  const id = isPlainObject(change) ? idKey(ownGet(change, "id")) : null;
  if (id === null) return table;

  const entry = { ...(table[id] ?? {}) };
  const setField = (name, validate) => {
    const value = ownGet(change, name);
    if (value === undefined) return false;
    if (value === null) {
      delete entry[name];
      return false;
    }
    const clean = validate(value);
    if (clean === null) return false;
    entry[name] = clean;
    return true;
  };

  setField("rename", validRename);
  setField("tags", validTags);
  const pinned = setField("pin", validPin);
  const marked = setField("mark", validMark);
  setField("workspace", validWorkspace);
  // A live workspace outranks whatever the change carried: `change.workspace`
  // is as capable of being stale as the stored copy was.
  const liveWorkspace = workspaceLookup(workspaces)(id);
  if (liveWorkspace !== null) entry.workspace = liveWorkspace;

  table[id] = entry;

  // Reassignment is silent: the previous holder simply loses the letter/number.
  // canonicalTable has already refreshed every stored workspace it had live
  // knowledge of, so this comparison is against where the tabs are now.
  for (const other of Object.keys(table)) {
    if (other === id) continue;
    if (marked && table[other].mark === entry.mark) delete table[other].mark;
    if (pinned && table[other].pin === entry.pin && (table[other].workspace ?? null) === (entry.workspace ?? null)) {
      delete table[other].pin;
    }
  }

  const out = {};
  for (const key of keysAscending(table)) {
    if (hasContent(table[key])) out[key] = table[key];
  }
  return out;
}

// --- serde (schema 3, additive over f5/b3's file) ------------------------------

// Deterministic bytes: entries ascend numerically, fields are emitted in a
// fixed order, so a save with no change rewrites the same file.
export function serializeMeta(meta, workspaces) {
  const table = canonicalTable(meta, workspaces);
  const tabMeta = {};
  for (const key of keysAscending(table)) {
    const entry = table[key];
    const ordered = {};
    if (entry.rename !== undefined) ordered.rename = entry.rename;
    if (entry.tags !== undefined) ordered.tags = entry.tags;
    if (entry.pin !== undefined) ordered.pin = entry.pin;
    if (entry.mark !== undefined) ordered.mark = entry.mark;
    if (entry.workspace !== undefined) ordered.workspace = entry.workspace;
    tabMeta[key] = ordered;
  }
  return JSON.stringify({ schema: 3, tabMeta });
}

// Forward-tolerant, backward-tolerant, and never fatal: a schema-2 (b3) or
// schema-less (v1) file reports its own schema and an empty tab table; bad
// JSON, a bad shape or a bad field degrades to the neutral value instead of
// bricking the panel. The result is an ordinary, serializable object.
export function deserializeMeta(input) {
  const empty = { schema: 0, meta: {} };
  let parsed = input;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      return empty;
    }
  }
  if (!isPlainObject(parsed)) return empty;
  return {
    schema: Number.isInteger(parsed.schema) ? parsed.schema : 0,
    meta: canonicalTable(parsed.tabMeta),
  };
}

// --- mark resolution ----------------------------------------------------------

// `'<char>`: the live tab first, then the graveyard record that carried the
// letter with it. Live-first is what makes the letter switch to the tab you
// still have open instead of resurrecting a duplicate of it.
export function markResolve(marks, char, options) {
  if (!isPlainObject(options)) return null;
  const letter = validMark(char);
  if (letter === null) return null;

  const liveTabs = Array.isArray(options.liveTabs) ? options.liveTabs : null;
  const table = canonicalTable(marks, liveTabs === null ? undefined : tabWorkspaces(liveTabs));
  const key = keysAscending(table).find(k => table[k].mark === letter) ?? null;

  if (key !== null && liveTabs !== null) {
    for (const tab of liveTabs) {
      if (tabKey(tab) === key) return { kind: "tab", id: tab.id, tab };
    }
  }
  // The graveyard's own table has no uniqueness rule to lean on: two records
  // can legitimately carry the same letter (mark `'r`, close it, mark `'r`
  // again, close that too). The NEWEST close wins, stated rather than inherited
  // from f4's newest-first array order — a caller that hands over a filtered or
  // re-sorted slice must still resurrect the tab the letter last meant.
  if (Array.isArray(options.graveyard)) {
    let best = null;
    for (const record of options.graveyard) {
      if (!isPlainObject(record)) continue;
      if (sanitizeEntry(ownGet(record, "meta"))?.mark !== letter) continue;
      const closedAt = Number.isFinite(record.closedAt) ? record.closedAt : -Infinity;
      if (best === null || closedAt > best.closedAt) best = { closedAt, record };
    }
    if (best !== null) return { kind: "graveyard", id: best.record.id, record: best.record };
  }
  return null;
}

// --- rows ---------------------------------------------------------------------

// A tab needs an identity and a url to be actionable; anything else drops
// individually rather than emptying the panel.
//
// The identity rule is idKey's, deliberately THE SAME ONE the metadata table
// uses: a tab whose id the table cannot key is a tab whose rename, tag, pin and
// mark would all be silent no-ops, and whose `tab_close <id>` the glue would
// dispatch with an id no store recognises. Showing such a row is worse than
// dropping it, and f5 hands out non-negative integer ref ids, so a row this
// drops is an upstream bug rather than a tab.
function tabKey(tab) {
  if (!isPlainObject(tab)) return null;
  return idKey(ownGet(tab, "id"));
}

// The live id → workspace mapping a tab list implies, for canonicalTable.
function tabWorkspaces(tabs) {
  const map = new Map();
  if (!Array.isArray(tabs)) return map;
  for (const tab of tabs) {
    const key = tabKey(tab);
    if (key === null || map.has(key)) continue;
    map.set(key, validWorkspace(ownGet(tab, "workspace")));
  }
  return map;
}

// The host is what makes a row findable by site. An unparseable or hostless url
// falls back to the url itself — never the text "undefined".
function hostOf(url) {
  try {
    const host = new URL(url).hostname;
    if (host) return host;
  } catch {
    // not a url; the raw string is still the most useful thing to show
  }
  return url;
}

function clip(value, max) {
  return typeof value === "string" && value.length > max ? value.slice(0, max) : value;
}

// A rename carrying an override is REFUSED, because someone typed it and can
// retype it. A page title carrying one cannot be refused — it is what the page
// calls itself, and dropping the row would hide the tab — so it is stripped
// instead: the row must read left to right, on one line, whatever the page
// would prefer.
const HIDDEN_GLOBAL = /[\p{Cc}\p{Cf}]/gu;
function stripHidden(value) {
  return typeof value === "string" ? value.replace(HIDDEN_GLOBAL, "") : "";
}

// "[pin] ['mark] [rename —] title — host [@workspace] [#tags]", with absent
// parts omitted rather than rendered blank. A rename never hides the real
// title: it precedes it, and the title stays.
function rowText({ pin, mark, rename, title: rawTitle, host: rawHost, tags, workspace }) {
  // rename and tags are capped where they are written; the title and the url
  // are the page's, so they are capped HERE — `text` is substring-scanned on
  // every keystroke, and a 200k-character title would otherwise make every
  // keystroke scan 200k characters per row. row.title and row.url stay verbatim
  // for the renderer.
  const title = clip(rawTitle, TITLE_MAX);
  const host = clip(rawHost, TITLE_MAX);
  const parts = [];
  if (pin !== null) parts.push(String(pin));
  if (mark !== null) parts.push(`'${mark}`);
  const label = rename !== null ? (title ? `${rename} — ${title}` : rename) : title;
  parts.push(label ? `${label} — ${host}` : host);
  if (workspace) parts.push(`@${workspace}`);
  for (const tag of tags) parts.push(`#${tag}`);
  return parts.join(" ");
}

// One tab's metadata as a DEAD tab carries it (spec r4 §3): the graveyard
// record's additive `meta` field, sanitized by exactly the rules the live table
// uses, degrading to {} when there is nothing usable rather than dropping the
// record. aether-graveyard.sys.mjs imports this instead of keeping its own copy
// of the whitelist — a second copy is a second set of rules to drift, and the
// two stores share no identifier, so the handoff is this field copy and nothing
// else.
export function sanitizeMeta(raw) {
  return sanitizeEntry(raw) ?? {};
}

// The panel's row list. Scope defaults to the current workspace; an unknown
// scope falls back to it, and a missing or empty workspace shows everything —
// a broken config must never render an empty panel.
export function buildRows(tabs, metadata, options) {
  if (!Array.isArray(tabs)) return [];
  const o = isPlainObject(options) ? options : {};
  const scopeAll = o.scope === "all";
  const workspace = validWorkspace(o.workspace);
  const currentKey = tabKey({ id: o.currentId });

  // The invariants are re-enforced HERE, not merely on write: the panel must
  // never render two rows both addressed `1` or both addressed `'a`, whatever a
  // hand-edited file says. The tabs themselves supply the live workspaces, so
  // pin uniqueness is scoped by where each tab is right now.
  const table = canonicalTable(metadata, tabWorkspaces(tabs));

  const rows = [];
  const seen = new Set();
  for (const tab of tabs) {
    const key = tabKey(tab);
    if (key === null || seen.has(key)) continue;
    if (typeof tab.url !== "string" || tab.url === "") continue;
    // A tab's workspace is the tab's own or none at all — never the panel's,
    // borrowed. A workspace-less tab belongs nowhere, so it shows in every
    // scope (hiding it entirely would be worse) but claims no workspace in the
    // row or in the row text.
    const ws = validWorkspace(ownGet(tab, "workspace")) ?? "";
    if (!scopeAll && workspace !== null && ws !== "" && ws !== workspace) continue;
    seen.add(key);

    const meta = ownGet(table, key) ?? {};
    const pin = meta.pin ?? null;
    const mark = meta.mark ?? null;
    const rename = meta.rename ?? null;
    const tags = meta.tags ? [...meta.tags] : [];
    const title = stripHidden(ownGet(tab, "title"));
    const host = stripHidden(hostOf(tab.url));
    rows.push({
      key,
      id: tab.id,
      url: tab.url,
      host,
      title,
      rename,
      tags,
      pin,
      mark,
      workspace: ws,
      current: key === currentKey,
      text: rowText({ pin, mark, rename, title, host, tags, workspace: scopeAll ? ws : "" }),
      recency: Number.isFinite(tab.lastAccessed) ? tab.lastAccessed : 0,
    });
  }

  const pinned = rows.filter(r => r.pin !== null);
  const mru = rows.filter(r => r.pin === null);
  const order = new Map(rows.map((r, i) => [r, i]));
  pinned.sort((a, b) => a.pin - b.pin || order.get(a) - order.get(b));
  mru.sort((a, b) => b.recency - a.recency || order.get(a) - order.get(b));

  // Row 1 is the tab you came from, so Enter is alt-tab. Pins keep their
  // positions: their number, not their recency, is their address.
  const currentAt = mru.findIndex(r => r.current);
  if (currentAt !== -1) mru.push(mru.splice(currentAt, 1)[0]);

  return [...pinned, ...mru].map(({ recency, ...row }) => row);
}
