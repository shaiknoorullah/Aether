// Aether live config reload (r1) — pure diffing of two config objects into the
// set of reapply domains, plus the statusbar line that names them. No Services,
// no IOUtils, no DOM, no timers, no wall-clock: the watcher (one interval, the
// last-known mtimes, the stat-twice stability check) and applyConfig() are glue
// and live in aether-reload-service.sys.mjs / aether.uc.js.
//
// What this module owns:
//   DOMAIN_MAP     — the DECLARED, path-level map from a config path to the
//                    reapply domain that owns it (null = restart-only).
//   DOMAIN_ORDER   — the order live domains are rendered in.
//   domainForPath  — path → domain | null | undefined.
//   diffConfig     — the comparison, over DOMAIN_MAP only.
//   describeReload — the composed statusbar line.
//   deferKeymap    — whether a fresh keymap may be installed right now.
//
// What it deliberately does NOT do: a generic deep-diff. Only the paths
// DOMAIN_MAP declares are ever compared, so a key nobody has claimed cannot
// invent a reapply — and the coverage test makes an unclaimed DEFAULTS leaf
// fail loudly instead of silently never reloading.
//
// Every degradation goes toward "no change". A spurious reapply recolours the
// chrome, rebuilds the keymap and cancels the widget schedulers on a save that
// touched nothing; that is the bug this module exists to kill, so hostile
// input, cycles and over-deep nesting all resolve to "equal" rather than to a
// guess. That rule is absolute and includes a read that THROWS: an unreadable
// value is "we could not tell", which is not the same as "absent", and only
// the absent form may register as an edit.
//
// Two boundaries this module keeps on purpose:
//   - Paths no DOMAIN_MAP entry governs are invisible. A key the user invents
//     under a section with no section-level entry (graveyard.ttl,
//     [keymap.insert], options.whatever) is not reported as restart-only
//     either, because no restart honours it — nothing in the overlay reads it.
//     Coverage against DEFAULTS is the guard that keeps every key the overlay
//     DOES read owned.
//   - A section is one entry only when all of its leaves share one consumer.
//     [options] does not: most of it is read per-use, statusbar_clock is a
//     build-time input to the widget registry, and config_watch is the
//     watcher's own interval. Reporting "reloaded: options" for a value that
//     needed a rebuild is a claim the reload did not honour, which is the
//     failure mode this spec exists to remove — so [options] is per-leaf.
//   - Values compare as the parser's value domain: string, integer, boolean,
//     array-of-those, and sections of those. Date/RegExp are not reachable
//     from parseToml, so they are not special-cased.

import {
  reloadedMessage,
  RELOAD_NO_CHANGE_MESSAGE,
  restartRequiredMessage,
} from "./aether-strings.sys.mjs";

// PATH-level, not section-level: workspaces.resurrect is live-reloadable while
// its sibling workspaces.default is bound at profile construction, and
// [keymap.reserved] binds at window creation while [keymap.normal] does not.
// A section-level map cannot express either split.
//
// Entries never overlap (no key is a dotted prefix of another), so a path has
// exactly one owner and iteration order cannot decide it. null = restart-only:
// reported by name, never reapplied. Sections with a restart-only leaf get
// per-leaf entries on purpose — a NEW key under them then belongs to nothing
// and fails coverage loudly, which is the point.
export const DOMAIN_MAP = Object.freeze({
  theme: "theme",
  style: "style",
  "keymap.normal": "keymap",
  "keymap.reserved": null, // bound at window creation
  statusbar: "statusbar",
  // [options] is NOT one domain. Most of its leaves are read per-use through
  // opt() and so belong to the read-through "options" domain, but two are not:
  //   statusbar_clock is a BUILD-TIME input to resolveWidgets(config), which
  //     runs once when the statusbar is constructed. Classifying it as
  //     read-through would report "reloaded: options" while the clock stayed
  //     on the bar — the silent half-apply this spec exists to stop.
  //   config_watch is owned by the reload service (the interval itself), not
  //     by any per-window reapply, so it gets its own domain.
  // No bare `options` entry on purpose: a NEW options key then belongs to
  // nothing and fails the DEFAULTS coverage test loudly, which forces whoever
  // adds it to decide which of the three it is.
  "options.scroll_step": "options",
  "options.hint_chars": "options",
  "options.pending_timeout_ms": "options",
  "options.palette_max_items": "options",
  "options.which_key_ms": "options",
  "options.statusbar_clock": "statusbar",
  "options.config_watch": "watcher",
  boosts: "boosts",
  ai: "ai",
  focus: "focus",
  "workspaces.resurrect": "workspaces",
  "workspaces.default": null, // the starting workspace is built once
  "graveyard.cap": null, // the ring is sized once
  panels: "panels",
  privacy: "privacy",
});

// Message order. Stable and declared, so the same reload reads the same way in
// every window and between runs — alphabetical or insertion order would drift.
export const DOMAIN_ORDER = Object.freeze([
  "theme",
  "style",
  "keymap",
  "statusbar",
  "options",
  "watcher",
  "boosts",
  "ai",
  "focus",
  "workspaces",
  "panels",
  "privacy",
]);

// Past this many levels below a governed path the comparison answers "equal".
// Real config nests three deep at most (theme.colors.bg); a structure deeper
// than this is not something reload can meaningfully reapply, so the bound
// degrades toward no change rather than toward a reapply it cannot verify.
const MAX_DEPTH = 8;

// WIDTH is bounded exactly like depth, and for the same reason. The widest real
// config container is [keymap.normal] at ~21 keys; the widest array is the
// eight-entry widget list. A container claiming more members than this is not
// something reload can meaningfully compare, and trusting a self-reported width
// is how a hostile `length` freezes the chrome: a proxy answering 2**31 makes
// the loop below run for hours on the main thread, inside the reload path.
// Past the bound the answer is "equal", per the degradation rule above.
const MAX_ITEMS = 1024;

// UNREADABLE, not "absent". A throwing accessor, a revoked proxy or a hostile
// exotic object answers this sentinel, and every comparison it touches resolves
// to "equal". Returning undefined instead would read as "the section was
// deleted" and reapply the whole domain — a hostile getter on [theme] would
// recolour the chrome and nag for a restart on every save.
const FAILED = Symbol("aether.unreadable");

// Even Array.isArray throws — on a revoked proxy. Unreadable arrayness answers
// "not an array", which routes into the section comparison, which is itself
// failure-tolerant.
function isArraySafe(v) {
  try {
    return Array.isArray(v);
  } catch {
    return false;
  }
}

const isPlainObject = v => v !== null && typeof v === "object" && !isArraySafe(v);

// A config can arrive from a synced dotfile; a hostile accessor anywhere in it
// must read as unreadable rather than take the whole reload down.
function safeRead(obj, key) {
  try {
    return obj[key];
  } catch {
    return FAILED;
  }
}

function safeKeys(obj) {
  try {
    return Object.keys(obj); // enumerable OWN keys only
  } catch {
    return FAILED;
  }
}

// Own-property walk. Inherited sections are invisible: something reachable only
// through the prototype chain is not this config's content, and diffing it is
// exactly the consequence prototype pollution is after. A non-object container
// mid-path reads as absent (a scalar where a section was IS an edit), while a
// read that throws reads as FAILED, so one broken section cannot derail the
// rest and cannot invent one either.
function at(root, path) {
  let cur = root;
  for (const seg of path.split(".")) {
    if (cur === FAILED) return FAILED;
    if (!isPlainObject(cur)) return undefined;
    let owned;
    try {
      owned = Object.hasOwn(cur, seg);
    } catch {
      return FAILED;
    }
    if (!owned) return undefined;
    cur = safeRead(cur, seg);
  }
  return cur;
}

// Structural comparison, bounded. Arrays compare IN ORDER — widget order is the
// widget config. Only enumerable own keys count, so the non-enumerable parse
// metadata parseToml hangs on its result ({ok, sections, errorLine}) describes
// the load and never the config.
function deepEqual(a, b, depth) {
  if (Object.is(a, b)) return true;
  if (a === FAILED || b === FAILED) return true; // unreadable → "we could not tell" → equal
  if (depth >= MAX_DEPTH) return true; // bounded: cycles and deep nesting → equal

  const aIsArray = isArraySafe(a);
  if (aIsArray !== isArraySafe(b)) return false;

  if (aIsArray) {
    const aLen = safeRead(a, "length"); // a hostile proxy throws even on .length
    const bLen = safeRead(b, "length");
    if (aLen === FAILED || bLen === FAILED) return true;
    // An unreadable WIDTH is unreadable input, same as an unreadable value. A
    // proxy may report NaN (where aLen !== bLen is true and would invent a
    // widget reorder out of NaN !== NaN), a float, or 2**31 (where the loop
    // below never returns). Both shapes answer "equal", never a reapply.
    if (!Number.isSafeInteger(aLen) || !Number.isSafeInteger(bLen)) return true;
    if (aLen > MAX_ITEMS || bLen > MAX_ITEMS) return true;
    if (aLen !== bLen) return false;
    for (let i = 0; i < aLen; i++) {
      if (!deepEqual(safeRead(a, i), safeRead(b, i), depth + 1)) return false;
    }
    return true;
  }

  if (!isPlainObject(a) || !isPlainObject(b)) return false; // scalar vs section, or a type change

  const aKeys = safeKeys(a);
  const bKeys = safeKeys(b);
  if (aKeys === FAILED || bKeys === FAILED) return true; // unenumerable → equal
  if (aKeys.length > MAX_ITEMS || bKeys.length > MAX_ITEMS) return true; // bounded width
  if (aKeys.length !== bKeys.length) return false; // added or removed keys
  for (const key of aKeys) {
    let owned;
    try {
      owned = Object.hasOwn(b, key);
    } catch {
      continue; // unreadable, so not a difference we may claim
    }
    if (!owned) return false;
    if (!deepEqual(safeRead(a, key), safeRead(b, key), depth + 1)) return false;
  }
  return true;
}

// The domain that owns a path: the longest segment-aligned DOMAIN_MAP entry.
// null = restart-only, undefined = ungoverned (invisible to reload by design).
// Own entries only, and hostile input yields undefined — "__proto__" and
// "toString" name no domain.
export function domainForPath(path) {
  if (typeof path !== "string" || path === "") return undefined;
  let bestKey;
  for (const key of Object.keys(DOMAIN_MAP)) {
    if (path !== key && !path.startsWith(`${key}.`)) continue; // segment-aligned
    if (bestKey === undefined || key.length > bestKey.length) bestKey = key;
  }
  return bestKey === undefined ? undefined : DOMAIN_MAP[bestKey];
}

// Compare two configs over DOMAIN_MAP. Fresh Sets every call, neither argument
// read destructively or mutated, no module state — the same inputs always give
// the same answer. A config that is not an object degrades to no change.
export function diffConfig(oldCfg, newCfg) {
  const changed = new Set();
  const restartOnly = new Set();
  if (!isPlainObject(oldCfg) || !isPlainObject(newCfg)) return { changed, restartOnly };

  for (const [path, domain] of Object.entries(DOMAIN_MAP)) {
    const before = at(oldCfg, path);
    const after = at(newCfg, path);
    if (before === FAILED || after === FAILED) continue; // unreadable claims nothing
    if (before === undefined && after === undefined) continue; // absent everywhere
    if (deepEqual(before, after, 0)) continue;
    if (domain === null) restartOnly.add(path); // named once, by entry path
    else changed.add(domain);
  }
  return { changed, restartOnly };
}

// Sets, arrays, anything iterable — reduced to unique non-empty strings. Junk
// and non-iterables reduce to nothing, because a glue mistake should read as a
// calm line, not as a chrome exception.
//
// Callers pass a COLLECTION (what diffConfig returns), never a one-shot
// iterator: `[...input]` drains `set.values()`, and there is no honest way to
// render a drained iterator — rejecting it outright would render "nothing
// changed" on the FIRST call too, which is worse than on the second.
function normalize(input) {
  if (input === null || typeof input !== "object") return [];
  let iterator;
  try {
    iterator = input[Symbol.iterator];
  } catch {
    return [];
  }
  if (typeof iterator !== "function") return [];
  let items;
  try {
    items = [...input];
  } catch {
    return [];
  }
  const out = [];
  for (const item of items) {
    if (typeof item === "string" && item !== "" && !out.includes(item)) out.push(item);
  }
  return out;
}

// The statusbar line. Depends on the SET of domains, never on iteration order
// or container type: known domains render in DOMAIN_ORDER, anything a later
// spec (or a mod) adds renders after them, alphabetically. A no-op reload is a
// normal outcome and says so neutrally.
export function describeReload(changed, restartOnly) {
  const domains = normalize(changed);
  const known = DOMAIN_ORDER.filter(d => domains.includes(d));
  const extra = domains.filter(d => !DOMAIN_ORDER.includes(d)).sort();
  const ordered = [...known, ...extra];

  const head = ordered.length ? reloadedMessage(ordered.join(", ")) : RELOAD_NO_CHANGE_MESSAGE;

  const paths = normalize(restartOnly).sort();
  return paths.length ? `${head} — ${restartRequiredMessage(paths.join(", "))}` : head;
}

// POLARITY: true means DEFER. Only the exact mode "normal" installs a fresh
// keymap now; every other mode — and every non-string — waits for the next
// return to normal. Rebuilding the engine mid-insert drops you to normal
// mid-sentence and swallows the rest of your keystrokes, and hint mode has live
// child state besides. Deferring is always safe; applying is not.
export function deferKeymap(mode) {
  return mode !== "normal";
}
