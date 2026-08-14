// r4 — Panel primitive: behavioral tests for the pure panel state machine
// (SDD RED). Spec: overlay/specs/r4-panel-primitive-and-tab-panel.md §2 "The
// primitive", §3 (aether-panel.sys.mjs), §4 tests 1–8, plus the hostile-input,
// no-throw and purity sweeps the analyst's contract adds (9–11).
//
// Contract pinned here for overlay/chrome/JS/aether-panel.sys.mjs — pure, no
// Services/IOUtils/DOM/clock, every export returns a NEW object and never
// mutates its arguments:
//
//   createPanelState({rows, actions, keyBy, match} = {}) -> state
//     state = {rows, visible, query, selectedKey, marks, actions, actionIndex,
//              keyBy, match}. Rows without a usable key are dropped; duplicate keys
//     keep the first; keys are String()-coerced and "__proto__" is legal and
//     inert. keyBy defaults to row => row?.key ?? row?.id and is CAPTURED here
//     (replaceRows takes exactly two arguments — analyst finding F7).
//   move(state, delta = 1)      -> wraps both ends through `visible`
//   toggleMark(state)           -> marks are keys, independent of visibility
//   cycleAction(state, delta=1) -> the ONLY mutator of actionIndex besides
//                                  createPanelState
//   filter(state, query, match = substringMatch) -> visible in ROWS order, and
//                                  the matcher is REMEMBERED on the state
//   replaceRows(state, rows)    -> {state, droppedMarks}; marks and selection
//                                  re-resolve BY KEY, never by index, and the
//                                  query re-runs with the state's own matcher
//   targets / targetKeys        -> what Enter acts on: the marked rows if any,
//                                  else the selected row, else nothing
//   selectedRow / selectedIndex / markedRows / currentAction / substringMatch
//
// Selection and marks are addressed by key string only: no export takes or
// returns a row index as an identity, and key -> row lookup must never be
// obj[key] (the "__proto__"/"constructor"/"toString" rows below are the probe).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createPanelState,
  move,
  toggleMark,
  cycleAction,
  filter,
  replaceRows,
  selectedRow,
  selectedIndex,
  markedRows,
  currentAction,
  substringMatch,
  targets,
  targetKeys,
} from "../../chrome/JS/aether-panel.sys.mjs";

// ---------------------------------------------------------------- fixtures

// Fixture A — the tab shape. Deliberately NOT alphabetical, so an
// implementation that sorts the list cannot pass the "original order" tests.
const FLAT = [
  { key: "t7", text: "zeta docs — example.com" },
  { key: "t3", text: "alpha notes — notes.local" },
  { key: "t9", text: "midway — example.com" },
  { key: "t1", text: "beta plan — plan.dev" },
];
const ACTIONS = ["switch", "close", "duplicate", "rename"];

// Fixture B — r5's settings shape: grouped rows with inline editors. The same
// state machine has to drive it, so "one contract forever" is asserted against
// two structurally different consumers rather than one.
const GROUPED = [
  { key: "ai.enabled", section: "ai", text: "ai.enabled true default", editor: { type: "boolean", value: true } },
  { key: "ai.model", section: "ai", text: "ai.model llama3 dotfile", editor: { type: "string", value: "llama3" } },
  { key: "style.font", section: "style", text: "style.font monospace default", editor: { type: "string", value: "monospace" } },
  { key: "privacy.doh", section: "privacy", text: "privacy.doh fallback default", editor: { type: "enum", value: "fallback", enum: ["off", "fallback", "strict"] } },
];
const GROUPED_ACTIONS = ["reset", "copy", "reveal"];

// ---------------------------------------------------------------- helpers

const keysOf = rows => rows.map(r => r.key);

function open(rows = FLAT, actions = ACTIONS) {
  return createPanelState({ rows, actions });
}

// Selection is key-addressed, so "select t9" is expressed the only way the
// keyboard can express it: arrow keys.
function selectKey(state, key) {
  let s = state;
  for (let i = 0; i <= state.visible.length; i++) {
    if (s.selectedKey === key) return s;
    s = move(s, 1);
  }
  assert.fail(`could not reach row ${key} with move()`);
}

function markKeys(state, keys) {
  let s = state;
  for (const key of keys) s = toggleMark(selectKey(s, key));
  return s;
}

function deepFreeze(value, seen = new Set()) {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  Object.freeze(value);
  for (const v of Object.values(value)) deepFreeze(v, seen);
  return value;
}

// Every clock the house style bans, made to throw for the duration of a call.
function withoutClocks(fn) {
  const realDate = globalThis.Date;
  const realRandom = Math.random;
  const boom = () => {
    throw new Error("a pure module read a clock");
  };
  const FakeDate = function () {
    boom();
  };
  FakeDate.now = boom;
  globalThis.Date = FakeDate;
  Math.random = boom;
  try {
    return fn();
  } finally {
    globalThis.Date = realDate;
    Math.random = realRandom;
  }
}

// 1. move wraps at both ends and no-ops on an empty list ---------------------

test("panel: move wraps forward and backward through the visible list", () => {
  const before = JSON.stringify(FLAT);
  const s0 = open();
  assert.equal(s0.selectedKey, "t7", "selection opens on row 1 of the source order");

  const s1 = move(s0, 1);
  assert.equal(s1.selectedKey, "t3");
  assert.notEqual(s1, s0, "move returns a new state, never the same object");

  let s = s1;
  for (let i = 0; i < 3; i++) s = move(s, 1);
  assert.equal(s.selectedKey, "t7", "past the last row wraps to the first");

  assert.equal(move(s0, -1).selectedKey, "t1", "before the first row wraps to the last");
  assert.equal(selectedIndex(move(s0, -1)), 3, "and the index is the last one, not -1");

  assert.equal(JSON.stringify(FLAT), before, "the caller's rows are never mutated");
});

test("panel: move on an empty list leaves selection null instead of throwing", () => {
  const s = createPanelState({ rows: [], actions: ACTIONS });
  assert.equal(s.selectedKey, null);
  let out;
  assert.doesNotThrow(() => {
    out = move(s, 1);
  });
  assert.equal(out.selectedKey, null);
  assert.equal(selectedIndex(out), -1);
  assert.equal(selectedRow(out), null);
  assert.equal(move(s, -1).selectedKey, null);
});

test("panel: a non-integer delta moves nothing and never produces a NaN index", () => {
  const s0 = open();
  for (const delta of [NaN, Infinity, -Infinity, 1.5, "2", null, {}, []]) {
    let out;
    assert.doesNotThrow(() => {
      out = move(s0, delta);
    }, `delta ${String(delta)} must not throw`);
    assert.equal(out.selectedKey, "t7", `delta ${String(delta)} must be a no-op`);
    assert.equal(selectedIndex(out), 0, `delta ${String(delta)} must keep a real index`);
  }
  // and a call with no delta at all stays inside the list
  let bare;
  assert.doesNotThrow(() => {
    bare = move(s0);
  });
  assert.ok(keysOf(bare.visible).includes(bare.selectedKey), "selection stays on a visible row");
});

test("panel: move leaves query, marks and the action cursor alone", () => {
  const s = cycleAction(markKeys(filter(open(), "example"), ["t7"]), 1);
  const out = move(s, 1);
  assert.equal(out.query, s.query);
  assert.deepEqual(out.marks, s.marks);
  assert.equal(currentAction(out), currentAction(s));
});

// 2. marks accumulate and survive filtering ----------------------------------

test("panel: toggleMark accumulates independent marks in the order they were made", () => {
  const s = markKeys(open(), ["t7", "t9", "t1"]);
  assert.deepEqual(s.marks, ["t7", "t9", "t1"]);
  assert.deepEqual(keysOf(markedRows(s)), ["t7", "t9", "t1"], "marked rows come back in rows order");
});

test("panel: filtering rows out of view never drops their marks", () => {
  let s = markKeys(open(), ["t7", "t9", "t1"]);
  s = filter(s, "example");
  assert.deepEqual(keysOf(s.visible), ["t7", "t9"], "the filter really did narrow the list");
  assert.deepEqual(s.marks, ["t7", "t9", "t1"], "t1 is out of view but still marked");
  assert.equal(markedRows(s).length, 3, "an action still reaches all three marked rows");
});

test("panel: marking six rows then typing keeps every mark actionable", () => {
  // The spec's own phrasing: mark, then type, then act — nothing may be
  // silently dropped by the narrowing.
  let s = markKeys(open(), ["t7", "t3", "t9", "t1"]);
  s = filter(s, "zeta");
  assert.equal(s.visible.length, 1, "narrowed to a single visible row");
  assert.equal(markedRows(s).length, 4, "all four marks survive a narrowing filter");
  s = filter(s, "");
  assert.equal(markedRows(s).length, 4, "and survive clearing the query again");
  assert.deepEqual(keysOf(markedRows(s)), ["t7", "t3", "t9", "t1"]);
});

test("panel: toggling a marked row removes exactly that row's mark", () => {
  let s = markKeys(open(), ["t7", "t9", "t1"]);
  s = toggleMark(selectKey(s, "t7"));
  assert.deepEqual(s.marks, ["t9", "t1"], "the rest keep their order");
  assert.deepEqual(keysOf(markedRows(s)), ["t9", "t1"]);
});

test("panel: toggleMark with nothing selected is a no-op, not a null mark", () => {
  const empty = createPanelState({ rows: [], actions: ACTIONS });
  let out;
  assert.doesNotThrow(() => {
    out = toggleMark(empty);
  });
  assert.deepEqual(out.marks, []);
  const gone = filter(open(), "zzzz");
  assert.equal(gone.selectedKey, null);
  assert.deepEqual(toggleMark(gone).marks, []);
});

// 3. cycleAction cycles, wraps, and is never reset by anything else ----------

test("panel: the default action is index 0 on open and Tab cycles and wraps", () => {
  const s0 = open();
  assert.equal(s0.actionIndex, 0);
  assert.equal(currentAction(s0), "switch");

  let s = s0;
  for (let i = 0; i < 3; i++) s = cycleAction(s, 1);
  assert.equal(currentAction(s), "rename");
  assert.equal(currentAction(cycleAction(s, 1)), "switch", "past the last action wraps to the first");
  assert.equal(currentAction(cycleAction(s0, -1)), "rename", "cycling back from 0 wraps to the last");
});

test("panel: move, filter, toggleMark and replaceRows all preserve the action cursor", () => {
  // The action cursor is the difference between Enter switching to a tab and
  // Enter closing it, so anything that quietly reset it is a destructive bug.
  const chosen = cycleAction(open(), 1);
  assert.equal(currentAction(chosen), "close");

  assert.equal(currentAction(move(chosen, 1)), "close", "moving the cursor must not reset the action");
  assert.equal(currentAction(filter(chosen, "example")), "close", "typing must not reset the action");
  assert.equal(currentAction(toggleMark(chosen)), "close", "marking must not reset the action");
  assert.equal(
    currentAction(replaceRows(chosen, FLAT.slice(0, 2)).state),
    "close",
    "rows changing underneath must not reset the action",
  );
  for (const s of [move(chosen, 1), filter(chosen, "example"), toggleMark(chosen)]) {
    assert.equal(s.actionIndex, chosen.actionIndex);
  }
});

test("panel: a source with no actions has no current action and cycling is a no-op", () => {
  const s = createPanelState({ rows: FLAT, actions: [] });
  assert.equal(currentAction(s), null);
  assert.equal(s.actionIndex, 0);
  let out;
  assert.doesNotThrow(() => {
    out = cycleAction(s, 1);
  });
  assert.equal(out.actionIndex, 0);
  assert.equal(currentAction(out), null);
  assert.equal(currentAction(cycleAction(s, -1)), null);
});

test("panel: a non-integer action delta is a no-op", () => {
  const s = cycleAction(open(), 1);
  for (const delta of [NaN, Infinity, 1.5, "1", null, {}]) {
    assert.equal(currentAction(cycleAction(s, delta)), "close", `delta ${String(delta)}`);
  }
});

// 4. an empty query restores the full list in its ORIGINAL order -------------

test("panel: clearing the query restores every row in the source order", () => {
  let s = filter(open(), "e");
  s = filter(s, "");
  assert.deepEqual(
    keysOf(s.visible),
    ["t7", "t3", "t9", "t1"],
    "the unsorted source order comes back — filtering is not destructive and never re-sorts",
  );
  assert.equal(s.query, "");
  assert.deepEqual(keysOf(s.rows), ["t7", "t3", "t9", "t1"], "the full row list was never edited");
});

test("panel: a filtered list keeps rows in source order, not match order", () => {
  const s = filter(open(), "e");
  assert.deepEqual(keysOf(s.visible), ["t7", "t3", "t9", "t1"]);
  const narrow = filter(open(), "example");
  assert.deepEqual(keysOf(narrow.visible), ["t7", "t9"], "t7 precedes t9 because rows do");
});

test("panel: filter matches case-insensitively and uses the query verbatim", () => {
  assert.deepEqual(keysOf(filter(open(), "EXAMPLE").visible), ["t7", "t9"]);
  assert.deepEqual(keysOf(filter(open(), "ZeTa").visible), ["t7"]);
  assert.deepEqual(keysOf(filter(open(), " zeta").visible), [], "the query is not trimmed for us");
  assert.equal(filter(open(), " zeta").query, " zeta", "and it is stored as typed");
});

test("panel: a non-string query behaves as an empty one", () => {
  for (const q of [undefined, null, 42, {}, []]) {
    const s = filter(open(), q);
    assert.equal(s.query, "", `query ${String(q)} normalizes to ""`);
    assert.deepEqual(keysOf(s.visible), ["t7", "t3", "t9", "t1"]);
  }
});

test("panel: a custom matcher is actually used, and a broken one matches nothing", () => {
  const prefix = filter(open(), "zeta", (hay, q) => String(hay).startsWith(q));
  assert.deepEqual(keysOf(prefix.visible), ["t7"], "the injected matcher decides membership");
  const startsOnly = filter(open(), "example", (hay, q) => String(hay).startsWith(q));
  assert.deepEqual(keysOf(startsOnly.visible), [], "substring matches are NOT silently added back");

  let out;
  assert.doesNotThrow(() => {
    out = filter(open(), "x", () => {
      throw new Error("boom");
    });
  }, "a throwing matcher must be caught per row");
  assert.deepEqual(out.visible, []);
  assert.equal(out.selectedKey, null);

  assert.deepEqual(keysOf(filter(open(), "example", 42).visible), ["t7", "t9"], "a non-function matcher falls back to substring");
});

test("panel: a row with no text is matched on its key", () => {
  const s = createPanelState({ rows: [{ key: "t1" }, { key: "t2" }] });
  assert.deepEqual(keysOf(filter(s, "t1").visible), ["t1"]);
  assert.deepEqual(keysOf(filter(s, "t").visible), ["t1", "t2"]);
});

// 5. selection follows row identity, else clamps to the top -----------------

test("panel: selection stays on the same row across a filter that keeps it", () => {
  const s = selectKey(open(), "t9");
  const out = filter(s, "example");
  assert.equal(out.selectedKey, "t9", "the same row identity, not the same index");
  assert.equal(selectedIndex(out), 1);
  assert.equal(selectedRow(out).text, "midway — example.com");
});

test("panel: selection clamps to the first visible row when its row is filtered out", () => {
  const s = selectKey(open(), "t3");
  const out = filter(s, "example");
  assert.equal(out.selectedKey, "t7");
  assert.equal(selectedIndex(out), 0);
  assert.ok(!keysOf(out.visible).includes("t3"));
});

test("panel: an empty result leaves no selection at all — never an index past the end", () => {
  const out = filter(selectKey(open(), "t1"), "zzzz");
  assert.deepEqual(out.visible, []);
  assert.equal(out.selectedKey, null);
  assert.equal(selectedIndex(out), -1);
  assert.equal(selectedRow(out), null);
  // and typing back into a match re-establishes a real selection
  const back = filter(out, "example");
  assert.equal(back.selectedKey, "t7");
  assert.equal(selectedIndex(back), 0);
});

// 6. replaceRows re-resolves selection and marks BY KEY ----------------------

test("panel: a marked row that moved position keeps its mark; a vanished one is dropped and counted", () => {
  const s = markKeys(open(), ["t3", "t9"]);
  // t3 is gone; t9 moves from index 2 to index 1 — an index-addressed
  // implementation would hand t9's mark to whatever now sits at index 2.
  const replacement = [
    { key: "t1", text: "beta plan — plan.dev" },
    { key: "t9", text: "midway — example.com" },
    { key: "t7", text: "zeta docs — example.com" },
  ];
  const out = replaceRows(s, replacement);

  assert.equal(out.droppedMarks, 1, "exactly the vanished mark is counted");
  assert.deepEqual(out.state.marks, ["t9"], "the moved row keeps its mark at its new position");
  assert.deepEqual(keysOf(markedRows(out.state)), ["t9"]);
  assert.equal(out.state.marks.includes("t1"), false, "the mark is never transferred to a neighbour");
  assert.equal(out.state.marks.includes("t3"), false, "and the vanished key is not kept around");
  assert.deepEqual(keysOf(out.state.rows), ["t1", "t9", "t7"], "the new order is the source's, verbatim");
});

test("panel: replaceRows re-resolves selection by key, keeping it when the row survives", () => {
  const s = selectKey(open(), "t9");
  const out = replaceRows(s, [
    { key: "t1", text: "beta plan — plan.dev" },
    { key: "t9", text: "midway — example.com" },
  ]);
  assert.equal(out.state.selectedKey, "t9");
  assert.equal(selectedIndex(out.state), 1);
  assert.equal(out.droppedMarks, 0);
});

test("panel: replaceRows drops a selection whose row is gone to the first row, or to null", () => {
  const s = selectKey(open(), "t3");
  const kept = replaceRows(s, [{ key: "t9", text: "midway" }, { key: "t7", text: "zeta" }]);
  assert.equal(kept.state.selectedKey, "t9");
  assert.equal(selectedIndex(kept.state), 0);

  const emptied = replaceRows(s, []);
  assert.equal(emptied.state.selectedKey, null);
  assert.equal(selectedIndex(emptied.state), -1);
  assert.equal(selectedRow(emptied.state), null);
});

test("panel: replaceRows keeps the query and re-runs it over the new rows", () => {
  const s = filter(open(), "example");
  const out = replaceRows(s, [
    { key: "t2", text: "gamma — example.com" },
    { key: "t5", text: "delta — other.test" },
  ]);
  assert.equal(out.state.query, "example", "the typed query survives the row swap");
  assert.deepEqual(keysOf(out.state.visible), ["t2"], "and is applied to the replacement rows");
  assert.deepEqual(keysOf(out.state.rows), ["t2", "t5"], "while the full list keeps both");
});

test("panel: replaceRows with a non-array drops every mark and reports the count", () => {
  const s = markKeys(open(), ["t7", "t3"]);
  for (const garbage of [null, undefined, "rows", 7, {}]) {
    let out;
    assert.doesNotThrow(() => {
      out = replaceRows(s, garbage);
    }, `rows=${String(garbage)}`);
    assert.deepEqual(out.state.rows, []);
    assert.equal(out.state.selectedKey, null);
    assert.equal(out.droppedMarks, 2, "both marks are reported, never silently retargeted");
  }
});

// 7. replaceRows mid-interaction — the destructive-action guard --------------

test("panel: a replacement that removes the marked row leaves zero marks and reports one dropped", () => {
  let s = filter(open(), "");
  s = markKeys(s, ["t3"]);
  s = cycleAction(s, 1);
  assert.equal(currentAction(s), "close", "the cursor is on a destructive action");

  const out = replaceRows(s, FLAT.filter(r => r.key !== "t3"));

  assert.equal(out.droppedMarks, 1);
  assert.equal(out.state.marks.length, 0, "no mark survives its row");
  assert.deepEqual(markedRows(out.state), [], "so `close` over the marked set reaches nothing");
  assert.equal(currentAction(out.state), "close", "the action cursor is exactly where the user left it");
  assert.notEqual(selectedRow(out.state), null);
  assert.notEqual(selectedRow(out.state).key, "t3");
  assert.equal(
    out.state.rows.every(r => r.key !== "t3"),
    true,
    "with zero marks, Enter on `close` can reach no row that was marked",
  );
});

// 8. the same primitive drives the grouped, inline-editing source ------------

test("panel: move wraps over the grouped settings source exactly as over tabs", () => {
  const s0 = createPanelState({ rows: GROUPED, actions: GROUPED_ACTIONS });
  assert.equal(s0.selectedKey, "ai.enabled");
  let s = s0;
  for (let i = 0; i < 4; i++) s = move(s, 1);
  assert.equal(s.selectedKey, "ai.enabled", "four moves over four rows wrap home");
  assert.equal(move(s0, -1).selectedKey, "privacy.doh");
  assert.equal(currentAction(s0), "reset", "the grouped source gets index 0 too");
});

test("panel: grouped rows keep their section and editor untouched through a filter", () => {
  const s = filter(createPanelState({ rows: GROUPED, actions: GROUPED_ACTIONS }), "ai.");
  assert.deepEqual(keysOf(s.visible), ["ai.enabled", "ai.model"]);
  assert.equal(s.visible[0].section, "ai", "section rides along — headers are the renderer's job");
  assert.equal(s.visible[1].section, "ai");
  assert.deepEqual(selectedRow(s).editor, GROUPED[0].editor, "the inline editor is passed through verbatim");
  assert.deepEqual(
    s.visible[1].editor,
    { type: "string", value: "llama3" },
    "the primitive neither reads nor rewrites an editor",
  );
});

test("panel: marks and replaceRows behave identically on the grouped source", () => {
  let s = markKeys(createPanelState({ rows: GROUPED, actions: GROUPED_ACTIONS }), ["style.font", "ai.model"]);
  s = filter(s, "ai.");
  assert.equal(markedRows(s).length, 2, "an out-of-view settings row keeps its mark");
  assert.ok(keysOf(markedRows(s)).includes("style.font"));

  const out = replaceRows(s, GROUPED.filter(r => r.key !== "ai.model"));
  assert.equal(out.droppedMarks, 1);
  assert.deepEqual(out.state.marks, ["style.font"]);
  assert.equal(currentAction(out.state), "reset");
});

test("panel: both sources produce the same state shape — no source-type branch exists", () => {
  const flat = createPanelState({ rows: FLAT, actions: ACTIONS });
  const grouped = createPanelState({ rows: GROUPED, actions: GROUPED_ACTIONS });
  assert.deepEqual(
    Object.keys(flat).sort(),
    Object.keys(grouped).sort(),
    "one state shape for every source, forever",
  );
  assert.deepEqual(Object.keys(flat).sort(), [
    "actionIndex",
    "actions",
    "keyBy",
    "marks",
    "match",
    "query",
    "rows",
    "selectedKey",
    "visible",
  ]);
});

// 8b. the matcher is part of the state, not a per-call argument --------------

test("panel: replaceRows re-runs the query with the state's OWN matcher, never a fresh substring one", () => {
  // The regression this pins: `filter` takes a matcher, so if the state does
  // not keep it, every later row swap silently re-filters with substring
  // semantics — and the day x3's fuzzy matcher lands, a tab closing under the
  // panel would WIDEN the candidate list and could re-select a row the user's
  // matcher had excluded, under a cursor already parked on `close`. Same
  // failure mode as an index-addressed mark, arriving through the query.
  const prefix = (hay, q) => String(hay).startsWith(q);
  const s = filter(open(), "alpha", prefix);
  assert.deepEqual(keysOf(s.visible), ["t3"], "prefix semantics: only 'alpha notes' starts with it");

  const rows = [
    { key: "a", text: "alpha notes" },
    { key: "b", text: "beta alpha" }, // substring-matches, prefix-does-not
    { key: "c", text: "gamma" },
  ];
  const out = replaceRows(s, rows);
  assert.deepEqual(
    keysOf(out.state.visible),
    ["a"],
    "'beta alpha' contains the query but does not start with it — a substring re-run would list it",
  );
  assert.equal(out.state.selectedKey, "a", "and selection lands inside the matcher's own result");
  assert.equal(typeof out.state.match, "function", "the matcher rides the state");

  // …and the same holds for a second replaceRows, with no filter() in between.
  const again = replaceRows(out.state, rows);
  assert.deepEqual(keysOf(again.state.visible), ["a"], "the matcher is not consumed by one use");
});

test("panel: a source can declare its matcher once at open, and every operation honours it", () => {
  const prefix = (hay, q) => String(hay).startsWith(q);
  const s = createPanelState({ rows: FLAT, actions: ACTIONS, match: prefix });
  assert.deepEqual(keysOf(filter(s, "zeta").visible), ["t7"]);
  assert.deepEqual(keysOf(filter(s, "docs").visible), [], "the declared matcher decides, not substring");
  const out = replaceRows(filter(s, "beta"), FLAT);
  assert.deepEqual(keysOf(out.state.visible), ["t1"], "'beta plan' starts with it; nothing else does");
});

test("panel: typing with no matcher argument keeps the remembered one, and an explicit one replaces it", () => {
  // The glue calls filter(state, query) on every keystroke. A `match =
  // substringMatch` default parameter would therefore undo a source's declared
  // matcher on the first character typed — the same silent widening as a
  // forgetful replaceRows, one keystroke earlier.
  const prefix = (hay, q) => String(hay).startsWith(q);
  const s = createPanelState({ rows: FLAT, actions: ACTIONS, match: prefix });

  assert.deepEqual(keysOf(filter(s, "example").visible), [], "no argument → still prefix semantics");
  assert.deepEqual(keysOf(filter(s, "example", substringMatch).visible), ["t7", "t9"], "an explicit matcher wins");

  const switched = filter(filter(s, "zeta"), "example", substringMatch);
  assert.deepEqual(keysOf(switched.visible), ["t7", "t9"]);
  assert.deepEqual(
    keysOf(replaceRows(switched, FLAT).state.visible),
    ["t7", "t9"],
    "and the newest matcher is the one that sticks",
  );
});

test("panel: a matcher that throws on a replacement row hides the row, not the panel", () => {
  const s = filter(open(), "x", hay => {
    if (String(hay).includes("boom")) throw new Error("boom");
    return true;
  });
  let out;
  assert.doesNotThrow(() => {
    out = replaceRows(s, [{ key: "ok", text: "fine" }, { key: "bad", text: "boom" }]);
  }, "the remembered matcher is called defensively too");
  assert.deepEqual(keysOf(out.state.visible), ["ok"]);
});

// 8c. what Enter acts on ------------------------------------------------------

test("panel: targets is the marked set when there is one, else the selected row", () => {
  // "Apply one command to these six" is the command contract from the start,
  // so the precedence lives here where it can be tested — not in the glue.
  const s0 = open();
  assert.deepEqual(keysOf(targets(s0)), ["t7"], "with no marks, Enter acts on the cursor alone");
  assert.deepEqual(targetKeys(s0), ["t7"]);
  assert.equal(targets(s0)[0], s0.rows[0], "the row itself, by reference");

  // Cursor parked on an UNMARKED row, which is the case that distinguishes
  // "marks win" from "marks plus whatever the cursor is on".
  const marked = selectKey(markKeys(s0, ["t3", "t9"]), "t7");
  assert.equal(marked.selectedKey, "t7");
  assert.deepEqual(targetKeys(marked), ["t3", "t9"], "marks win over the cursor");
  assert.equal(
    targetKeys(marked).includes("t7"),
    false,
    "the cursor's row is NOT quietly added to the marked set",
  );
  assert.deepEqual(keysOf(targets(marked)), ["t3", "t9"]);
});

test("panel: targets keeps marks that a filter hid — the six you marked are still the six", () => {
  const s = filter(markKeys(open(), ["t7", "t3", "t9", "t1"]), "zeta");
  assert.equal(s.visible.length, 1);
  assert.deepEqual(targetKeys(s), ["t7", "t3", "t9", "t1"], "all four, in rows order");
});

test("panel: targets is empty when there is nothing to act on, never a phantom row", () => {
  assert.deepEqual(targets(createPanelState({ rows: [], actions: ACTIONS })), []);
  assert.deepEqual(targets(filter(open(), "zzzz")), [], "an empty result acts on nothing");
  assert.deepEqual(targetKeys(filter(open(), "zzzz")), []);
  assert.deepEqual(targets(null), []);
  assert.deepEqual(targetKeys(undefined), []);
});

test("panel: a mark dropped by replaceRows leaves targets on the cursor, not on the dead row", () => {
  let s = markKeys(open(), ["t3"]);
  s = cycleAction(s, 1);
  assert.equal(currentAction(s), "close");
  const out = replaceRows(s, FLAT.filter(r => r.key !== "t3"));
  assert.equal(out.droppedMarks, 1);
  assert.deepEqual(targetKeys(out.state), ["t7"], "falls back to the cursor — never to the vanished key");
  assert.equal(targetKeys(out.state).includes("t3"), false);
});

// 9. hostile rows -------------------------------------------------------------

test("panel: rows without a usable key are dropped and duplicates keep the first", () => {
  const s = createPanelState({
    rows: [
      { key: "__proto__", text: "x" },
      { key: "ok", text: "y" },
      { key: null },
      {},
      { key: "" },
      null,
      "not a row",
      { key: "ok", text: "dupe" },
    ],
  });
  assert.equal(s.rows.length, 2, "malformed rows drop individually, the good ones stay");
  assert.deepEqual(keysOf(s.rows), ["__proto__", "ok"]);
  assert.equal(s.rows[1].text, "y", "the first row wins a duplicate key, not the last");
  assert.equal(s.selectedKey, "__proto__");
});

test("panel: prototype-shaped keys are ordinary row keys and pollute nothing", () => {
  const rows = [
    { key: "__proto__", text: "p" },
    { key: "constructor", text: "c" },
    { key: "toString", text: "t" },
    { key: "ok", text: "y" },
  ];
  let s = markKeys(createPanelState({ rows, actions: ACTIONS }), ["__proto__", "constructor", "toString", "ok"]);
  assert.deepEqual(keysOf(markedRows(s)), ["__proto__", "constructor", "toString", "ok"]);
  assert.equal(selectedRow(selectKey(s, "constructor")).text, "c", "lookup returns the row, not Object's constructor");
  assert.equal(selectedRow(selectKey(s, "toString")).text, "t", "lookup returns the row, not a function");

  const out = replaceRows(s, [{ key: "ok", text: "y" }]);
  assert.equal(out.droppedMarks, 3);
  assert.deepEqual(out.state.marks, ["ok"]);

  assert.equal({}.marks, undefined, "no prototype pollution");
  assert.equal({}.selectedKey, undefined, "no prototype pollution");
  assert.equal(Object.prototype.mark, undefined, "no prototype pollution");
  assert.equal({}.polluted, undefined, "no prototype pollution");
});

test("panel: a key lookup that misses returns null rather than something off the prototype", () => {
  const s = filter(createPanelState({ rows: [{ key: "ok", text: "y" }] }), "zzz");
  assert.equal(selectedRow(s), null);
  assert.equal(selectedIndex(s), -1);
  assert.equal(currentAction(s), null);
});

test("panel: non-string keys are coerced, and coercion never invents an identity", () => {
  const s = createPanelState({ rows: [{ key: 7 }, { id: 8 }, { key: "7", text: "dupe" }] });
  assert.equal(s.rows.length, 2, "7 and 8 are separate rows; the string duplicate of 7 drops");
  assert.equal(s.selectedKey, "7", "selectedKey is a string, always");
  assert.equal(typeof s.selectedKey, "string");

  const second = move(s, 1);
  assert.equal(second.selectedKey, "8", "the default keyBy falls back to row.id");
  assert.equal(typeof second.selectedKey, "string");
  const marked = toggleMark(second);
  assert.deepEqual(marked.marks, ["8"]);
  assert.equal(markedRows(marked).length, 1);
  assert.equal(
    replaceRows(marked, [{ key: 7 }]).droppedMarks,
    1,
    "keys are compared as strings — 8 is simply gone",
  );
});

test("panel: a custom keyBy is captured at open and used by every later operation", () => {
  const rows = [{ ref: "a", text: "alpha" }, { ref: "b", text: "beta" }];
  const s = createPanelState({ rows, actions: ACTIONS, keyBy: r => r?.ref });
  assert.equal(s.selectedKey, "a");
  const marked = toggleMark(move(s, 1));
  assert.deepEqual(marked.marks, ["b"]);
  const out = replaceRows(marked, [{ ref: "b", text: "beta reordered" }, { ref: "c", text: "gamma" }]);
  assert.equal(out.droppedMarks, 0, "replaceRows keys the new rows the same way, with no second keyBy argument");
  assert.deepEqual(out.state.marks, ["b"]);
});

// 10. no-throw sweep ----------------------------------------------------------

test("panel: every export tolerates hostile arguments without throwing", () => {
  const circular = { rows: [] };
  circular.self = circular;
  circular.rows.push(circular);
  const hostile = [undefined, null, 0, "", [], {}, () => {}, circular, NaN, true, -1, "x"];
  const exports = {
    createPanelState,
    move,
    toggleMark,
    cycleAction,
    filter,
    replaceRows,
    selectedRow,
    selectedIndex,
    markedRows,
    currentAction,
    substringMatch,
    targets,
    targetKeys,
  };
  for (const [name, fn] of Object.entries(exports)) {
    for (const a of hostile) {
      for (const b of hostile) {
        assert.doesNotThrow(() => fn(a, b), `${name}(${String(a)}, ${String(b)})`);
      }
    }
  }
});

test("panel: garbage input returns the documented neutral values", () => {
  assert.equal(selectedRow(null), null);
  assert.equal(selectedRow(undefined), null);
  assert.equal(selectedRow({}), null);
  assert.equal(selectedIndex(null), -1);
  assert.equal(selectedIndex({}), -1);
  assert.deepEqual(markedRows(null), []);
  assert.deepEqual(markedRows({}), []);
  assert.equal(currentAction(null), null);
  assert.equal(currentAction({}), null);

  const out = replaceRows(null, null);
  assert.equal(typeof out, "object");
  assert.notEqual(out, null);
  assert.equal(out.droppedMarks, 0);
  assert.deepEqual(out.state.rows, []);
  assert.equal(out.state.selectedKey, null);

  for (const [name, fn] of Object.entries({ move, toggleMark, cycleAction, filter })) {
    const s = fn(null, 1);
    assert.equal(typeof s, "object", `${name} on garbage still returns a state object`);
    assert.notEqual(s, null, `${name} on garbage still returns a state object`);
    assert.equal(selectedRow(s), null);
    assert.deepEqual(markedRows(s), []);
  }
});

test("panel: createPanelState with no argument is a valid empty state", () => {
  let s;
  assert.doesNotThrow(() => {
    s = createPanelState();
  });
  assert.deepEqual(s.rows, []);
  assert.deepEqual(s.visible, []);
  assert.equal(s.query, "");
  assert.equal(s.selectedKey, null);
  assert.deepEqual(s.marks, []);
  assert.deepEqual(s.actions, []);
  assert.equal(s.actionIndex, 0);
});

test("panel: a non-array rows or actions value degrades to empty rather than throwing", () => {
  for (const bad of [null, undefined, "rows", 42, {}]) {
    const s = createPanelState({ rows: bad, actions: bad });
    assert.deepEqual(s.rows, []);
    assert.deepEqual(s.visible, []);
    assert.deepEqual(s.actions, []);
    assert.equal(currentAction(s), null);
  }
  const mixed = createPanelState({ rows: FLAT, actions: ["switch", 7, null, {}, "close"] });
  assert.deepEqual(mixed.actions, ["switch", "close"], "non-string actions drop individually");
  assert.equal(currentAction(mixed), "switch");
});

test("panel: substringMatch is case-insensitive, empty-query-true, and non-string-safe", () => {
  assert.equal(substringMatch("Hello world", "ell"), true);
  assert.equal(substringMatch("Hello world", "ELL"), true);
  assert.equal(substringMatch("hello", "zz"), false);
  assert.equal(substringMatch("hello", ""), true, "an empty query matches everything");
  assert.equal(substringMatch(42, "4"), false, "a non-string haystack is empty, not coerced into a match");
  assert.equal(substringMatch(null, ""), true);
  assert.equal(substringMatch(undefined, "x"), false);
});

// 11. purity and determinism --------------------------------------------------

test("panel: every operation runs against a deep-frozen state without writing back", () => {
  const rows = FLAT.map(r => ({ ...r }));
  const s = deepFreeze(createPanelState({ rows, actions: [...ACTIONS] }));
  assert.doesNotThrow(() => {
    const a = move(s, 1);
    const b = toggleMark(a);
    const c = cycleAction(b, 1);
    const d = filter(c, "example");
    const e = replaceRows(d, [{ key: "t9", text: "midway — example.com" }]);
    move(e.state, -1);
    markedRows(e.state);
    selectedRow(d);
  }, "a frozen state proves nothing is mutated in place (ESM is strict mode)");
});

test("panel: state-returning operations return new objects, never the argument", () => {
  const s = open();
  assert.notEqual(move(s, 1), s);
  assert.notEqual(toggleMark(s), s);
  assert.notEqual(cycleAction(s, 1), s);
  assert.notEqual(filter(s, "e"), s);
  assert.notEqual(replaceRows(s, FLAT).state, s);
  assert.notEqual(move(s, 1).marks, s.marks, "arrays are copied too, not shared");
});

test("panel: the caller's rows array and row objects are never mutated", () => {
  const rows = FLAT.map(r => ({ ...r }));
  const before = JSON.stringify({ rows, actions: ACTIONS });
  let s = createPanelState({ rows, actions: ACTIONS });
  s = markKeys(s, ["t7", "t9"]);
  s = filter(s, "example");
  s = cycleAction(s, 2);
  replaceRows(s, rows.slice(1));
  assert.equal(JSON.stringify({ rows, actions: ACTIONS }), before, "the source data is read-only to the panel");
});

test("panel: the same inputs produce byte-identical states, and no clock is read", () => {
  const a = withoutClocks(() => JSON.stringify(filter(cycleAction(markKeys(open(), ["t7"]), 1), "example")));
  const b = withoutClocks(() => JSON.stringify(filter(cycleAction(markKeys(open(), ["t7"]), 1), "example")));
  assert.equal(a, b, "deterministic, and Date/Math.random were booby-trapped throughout");
  assert.ok(a.includes("t7"));
});

test("panel: no operation ever invokes anything hanging off a row", () => {
  // Moving the cursor is not an action: a panel never executes anything a row
  // carries, and never reads a field it was not promised.
  let calls = 0;
  const rows = [
    {
      key: "t1",
      text: "one",
      run() {
        calls++;
      },
    },
    { key: "t2", text: "two", run: () => calls++ },
  ];
  const s = createPanelState({ rows, actions: ACTIONS });
  const a = cycleAction(toggleMark(move(s, 1)), 1);
  filter(a, "two");
  markedRows(a);
  selectedRow(a);
  replaceRows(a, rows);
  assert.equal(calls, 0, "selection and filtering never act");
  assert.equal(selectedRow(s), rows[0], "rows are carried by reference — the payload is opaque, not copied");
  assert.equal(markedRows(a)[0], rows[1]);
});
