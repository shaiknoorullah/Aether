// Aether panel primitive (r4) — the pure state machine every panel surface
// runs on: a search query, a candidate list, a selection, multi-select marks,
// and an action ring. No Services, no DOM, no IOUtils, no clock — the glue
// (aether.uc.js) owns the element, the keyboard wiring and the dispatch, and
// the *source* (tabs here, r5's grouped settings next) owns what a row means.
//
// What this module deliberately does NOT do: it never renders, never sorts
// (row order is the source's, verbatim), never acts — moving the cursor is not
// an action, nothing hanging off a row is ever invoked, and no row field
// beyond `text` and the key is ever read.
//
// Selection and marks are addressed by STABLE ROW KEY, never by index. The row
// set changes under an open panel (a tab closes, a transfer finishes), so
// `replaceRows` re-resolves by key and reports `droppedMarks`: a mark whose row
// is gone is dropped and counted, never handed to whatever now sits at that
// index. That rule is the guard against a destructive action landing on the
// wrong row, and it is why marks are not indices.
//
// The MATCHER is part of the state for the same reason. Filtering is the other
// way the candidate set moves under the user, so the matcher a source declared
// (x3's fuzzy scorer, once it lands; substring until then) is remembered and
// re-used by every later filter and every replaceRows — a matcher passed once
// and forgotten would silently widen the list back to substring semantics on
// the next keystroke or the next row swap.
//
// And `targets(state)` is here, not in the glue: "one command over these six"
// is the command contract from the start, and the marks-else-selection
// precedence is exactly the rule whose silent inversion runs a destructive
// command over the wrong rows. The glue is not unit-tested; this is.

// Rows carry their own identity: `key`, else `id`. A source with neither
// passes its own `keyBy`, which is captured once at open and used by every
// later operation (including replaceRows, which takes no key function).
const DEFAULT_KEY_BY = row => row?.key ?? row?.id;

// A key is a string, always — numeric ids are coerced so that 7 and "7" are one
// identity. Anything else (missing, empty, an object, a throwing keyBy) means
// the row has no identity and is dropped. Keys are compared, never used as
// property names, so "__proto__"/"constructor"/"toString" are ordinary keys.
function keyOf(row, keyBy) {
  if (!row || typeof row !== "object") return null;
  let raw;
  try {
    raw = keyBy(row);
  } catch {
    return null;
  }
  if (typeof raw === "string") return raw === "" ? null : raw;
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  return null;
}

// Keyless rows drop individually; a duplicate key keeps the FIRST row, so a
// source that repeats itself cannot make a selectable ghost.
function normalizeRows(rows, keyBy) {
  if (!Array.isArray(rows)) return [];
  const out = [];
  const seen = new Set();
  for (const row of rows) {
    const key = keyOf(row, keyBy);
    if (key === null || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

// Actions are plain labels; the source maps them to registry commands.
function normalizeActions(actions) {
  if (!Array.isArray(actions)) return [];
  return actions.filter(a => typeof a === "string" && a !== "");
}

function normalizeMarks(marks) {
  if (!Array.isArray(marks)) return [];
  const out = [];
  for (const mark of marks) {
    if (typeof mark === "string" && mark !== "" && !out.includes(mark)) out.push(mark);
  }
  return out;
}

// The one state shape, for every source forever: no source-type branch exists.
function build(rows, visible, query, selectedKey, marks, actions, actionIndex, keyBy, match) {
  return {
    rows: rows.slice(),
    visible: visible.slice(),
    query,
    selectedKey,
    marks: marks.slice(),
    actions: actions.slice(),
    actionIndex,
    keyBy,
    match,
  };
}

// Every export starts here, so garbage in gives a neutral, well-formed state
// out instead of a throw that would take the chrome down with it.
function asState(state) {
  const s = state && typeof state === "object" ? state : {};
  const keyBy = typeof s.keyBy === "function" ? s.keyBy : DEFAULT_KEY_BY;
  const match = typeof s.match === "function" ? s.match : substringMatch;
  const rows = normalizeRows(s.rows, keyBy);
  const visible = normalizeRows(s.visible, keyBy);
  const actions = normalizeActions(s.actions);
  const actionIndex =
    Number.isInteger(s.actionIndex) && s.actionIndex >= 0 && s.actionIndex < actions.length
      ? s.actionIndex
      : 0;
  const selectedKey = pickSelection(visible, s.selectedKey, keyBy);
  return build(
    rows,
    visible,
    typeof s.query === "string" ? s.query : "",
    selectedKey,
    normalizeMarks(s.marks),
    actions,
    actionIndex,
    keyBy,
    match,
  );
}

function visibleKeys(state) {
  return state.visible.map(row => keyOf(row, state.keyBy));
}

// Selection follows row identity where it can, clamps to the first visible row
// where it cannot, and is null when there is nothing to select — never an index
// past the end, and never a row that is not on screen.
function pickSelection(visible, wanted, keyBy) {
  if (visible.length === 0) return null;
  if (typeof wanted === "string") {
    for (const row of visible) {
      if (keyOf(row, keyBy) === wanted) return wanted;
    }
  }
  return keyOf(visible[0], keyBy);
}

// Default matcher until x3's fuzzy scorer lands: case-insensitive substring, an
// empty query matches everything, and a non-string haystack is empty rather
// than coerced into an accidental match.
export function substringMatch(haystack, query) {
  const hay = typeof haystack === "string" ? haystack.toLowerCase() : "";
  const needle = typeof query === "string" ? query.toLowerCase() : "";
  return hay.includes(needle);
}

// A row is searched on its text; a textless row is still findable by its key.
function haystackOf(row, keyBy) {
  const text = row?.text;
  if (typeof text === "string" && text !== "") return text;
  return keyOf(row, keyBy) ?? "";
}

// Filtering is never destructive: `rows` is untouched and the result keeps the
// SOURCE order, so an MRU or pin ordering survives typing. A matcher that
// throws hides its row rather than the panel.
function applyQuery(rows, query, match, keyBy) {
  const matcher = typeof match === "function" ? match : substringMatch;
  return rows.filter(row => {
    try {
      return !!matcher(haystackOf(row, keyBy), query);
    } catch {
      return false;
    }
  });
}

// --- the API -----------------------------------------------------------------

export function createPanelState(options) {
  const o = options && typeof options === "object" ? options : {};
  const keyBy = typeof o.keyBy === "function" ? o.keyBy : DEFAULT_KEY_BY;
  const match = typeof o.match === "function" ? o.match : substringMatch;
  const rows = normalizeRows(o.rows, keyBy);
  const actions = normalizeActions(o.actions);
  return build(rows, rows, "", pickSelection(rows, null, keyBy), [], actions, 0, keyBy, match);
}

// Arrow keys. Wraps at both ends, no-ops on an empty list, and touches nothing
// else — not the query, not the marks, not the action cursor.
export function move(state, delta = 1) {
  const s = asState(state);
  const keys = visibleKeys(s);
  if (keys.length === 0) return { ...s, selectedKey: null };
  const step = Number.isInteger(delta) ? delta : 0;
  const cur = keys.indexOf(s.selectedKey);
  const next = cur === -1 ? 0 : (((cur + step) % keys.length) + keys.length) % keys.length;
  return { ...s, selectedKey: keys[next] };
}

// Ctrl+Space. Marks are keys, so they are independent of what is on screen:
// mark six rows, type, and all six are still actionable. Nothing selected is a
// no-op — a null must never enter the mark list, where it would later resolve
// to whatever row happened to be first.
export function toggleMark(state) {
  const s = asState(state);
  const key = s.selectedKey;
  if (typeof key !== "string") return s;
  const marks = s.marks.includes(key) ? s.marks.filter(m => m !== key) : [...s.marks, key];
  return { ...s, marks };
}

// Tab. The only mutator of actionIndex besides createPanelState: the action
// cursor is the difference between Enter switching to a tab and Enter closing
// it, so nothing else may quietly reset it.
export function cycleAction(state, delta = 1) {
  const s = asState(state);
  const count = s.actions.length;
  if (count === 0) return { ...s, actionIndex: 0 };
  const step = Number.isInteger(delta) ? delta : 0;
  const next = (((s.actionIndex + step) % count) + count) % count;
  return { ...s, actionIndex: next };
}

// Typing. The query is stored verbatim (not trimmed for the user) and a
// non-string query behaves as an empty one.
//
// The matcher is REMEMBERED on the state, not just used once. `replaceRows`
// re-runs the query over the new rows, and a forgotten matcher would silently
// re-run it as a substring search: the day x3's fuzzy matcher lands, every row
// swap (a tab closing, p1's delete, p3's transfer finishing) would widen the
// candidate list back to substring semantics under a cursor the user has
// already parked on a destructive action. Same failure mode as an index-
// addressed mark, arriving through the query instead.
// The matcher argument is OPTIONAL, and omitting it keeps the one the state
// already has rather than resetting it to substring — the glue calls this on
// every keystroke, so a `substringMatch` default parameter would quietly undo a
// source's declared matcher on the first character typed.
export function filter(state, query, match) {
  const s = asState(state);
  const q = typeof query === "string" ? query : "";
  const matcher = typeof match === "function" ? match : s.match;
  const visible = applyQuery(s.rows, q, matcher, s.keyBy);
  return {
    ...s,
    match: matcher,
    visible,
    query: q,
    selectedKey: pickSelection(visible, s.selectedKey, s.keyBy),
  };
}

// The row set changed under the open panel. Selection and marks re-resolve BY
// KEY against the new rows; the typed query is re-run over them; the action
// cursor stays exactly where the user left it. Marks whose rows are gone are
// dropped and COUNTED — the caller states the count (aether-strings'
// droppedMarksMessage) rather than acting on a neighbour.
export function replaceRows(state, rows) {
  const s = asState(state);
  const next = normalizeRows(rows, s.keyBy);
  const keys = new Set(next.map(row => keyOf(row, s.keyBy)));
  const marks = s.marks.filter(mark => keys.has(mark));
  // The state's matcher, never a fresh substring one: the candidate set must
  // not silently widen because the rows changed underneath.
  const visible = applyQuery(next, s.query, s.match, s.keyBy);
  return {
    state: build(
      next,
      visible,
      s.query,
      pickSelection(visible, s.selectedKey, s.keyBy),
      marks,
      s.actions,
      s.actionIndex,
      s.keyBy,
      s.match,
    ),
    droppedMarks: s.marks.length - marks.length,
  };
}

// --- readers ------------------------------------------------------------------

// The selected row itself, by reference — the payload is opaque to the panel.
export function selectedRow(state) {
  const s = asState(state);
  for (const row of s.visible) {
    if (keyOf(row, s.keyBy) === s.selectedKey) return row;
  }
  return null;
}

// Where the cursor sits in the VISIBLE list, for the renderer to scroll to.
// Never an index into `rows`, and -1 when there is no selection.
export function selectedIndex(state) {
  const s = asState(state);
  return visibleKeys(s).indexOf(s.selectedKey);
}

// The marked rows in source order, including the ones a filter hid.
export function markedRows(state) {
  const s = asState(state);
  return s.rows.filter(row => s.marks.includes(keyOf(row, s.keyBy)));
}

export function currentAction(state) {
  const s = asState(state);
  return s.actions.length === 0 ? null : s.actions[s.actionIndex] ?? null;
}

// What Enter acts on: the marked rows if there are any, else the selected row,
// else nothing. Always a LIST, because "apply this one command to these six" is
// the command contract from the start — a1's registry-is-the-API premise means
// ~30 argument-taking commands would otherwise have to be retrofitted with a
// set arity at v2.1, which is a rewrite. Marks win over the cursor: having
// marked six rows and then moved the cursor, the six are what you meant.
//
// Deliberately here and not in aether.uc.js: the glue is not unit-tested, and
// this precedence is exactly the rule whose silent inversion would run a
// destructive command over the wrong rows.
export function targets(state) {
  const s = asState(state);
  const marked = markedRows(s);
  if (marked.length > 0) return marked;
  const row = selectedRow(s);
  return row === null ? [] : [row];
}

// The keys of what Enter acts on, in the same order — what a multi-target
// command is actually dispatched with.
export function targetKeys(state) {
  const s = asState(state);
  return targets(s).map(row => keyOf(row, s.keyBy));
}
