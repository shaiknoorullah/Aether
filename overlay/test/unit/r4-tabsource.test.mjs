// r4 — Tab source: behavioral tests for the pure tab-panel source (SDD RED).
// Spec: overlay/specs/r4-panel-primitive-and-tab-panel.md §2 "The tab source",
// "Tab metadata", "Marks and pins", §3 (aether-tabsource.sys.mjs), §4 tests
// 9–16, plus the tolerance/purity cases the analyst's contract adds (20–23).
//
// Contract pinned here for overlay/chrome/JS/aether-tabsource.sys.mjs — pure,
// no Services/IOUtils/DOM and NO CLOCK (recency arrives as tab.lastAccessed,
// injected by the glue's TabSelect listener):
//
//   tab  = {id, url, title?, workspace?, lastAccessed?}  — id IS the f5 ref id
//   meta = {"<refId>": {rename?, tags?, pin?, mark?, workspace?}}
//
//   buildRows(tabs, metadata, {scope, workspace, currentId}) -> rows
//     pin block (pin 1–9 ascending) first, then MRU descending, with the
//     CURRENT tab last inside the MRU block (row 1 is the tab you came from,
//     so Enter is alt-tab). A pinned current tab stays in the pin block:
//     pins are positional addresses bound to 1–9 (analyst finding F8).
//   applyMeta(meta, change)      -> new table; null clears a field; mark is
//     unique per letter AND per tab; pin is unique within a workspace.
//   serializeMeta(meta)          -> {"schema":3,"tabMeta":{…}}, deterministic
//   deserializeMeta(input)       -> {schema, meta}; schema 2 / schema-less
//     files are tolerated; fields drop individually; an entry left with no
//     fields disappears; "__proto__" keys are inert.
//   markResolve(marks, char, {liveTabs, graveyard}) -> live tab FIRST, then
//     the graveyard record, else null.
//   TAB_ACTIONS / ACTION_COMMANDS — the action inventory (asserted against the
//     registry in r4-palette.test.mjs).
//
// Tests 18 and 19 (spec 15/16) exercise f4's graveyard record carrying an
// additive `meta` field. aether-graveyard.sys.mjs currently builds records
// from a fixed field list and whitelists id/url/title/closedAt/workspace on
// read, so `meta` is dropped at both ends: those two tests stay RED until an
// owner of that file lands the additive change (analyst finding F4).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildRows,
  applyMeta,
  serializeMeta,
  deserializeMeta,
  markResolve,
} from "../../chrome/JS/aether-tabsource.sys.mjs";

import {
  createStore,
  bury,
  exhume,
  serialize as graveSerialize,
  deserialize as graveDeserialize,
} from "../../chrome/JS/aether-graveyard.sys.mjs";

// ---------------------------------------------------------------- fixtures

const TABS = [
  { id: 1, url: "https://a.example/one", title: "One", workspace: "main", lastAccessed: 100 },
  { id: 2, url: "https://b.example/two", title: "Two", workspace: "main", lastAccessed: 300 },
  { id: 3, url: "https://c.example/three", title: "Three", workspace: "main", lastAccessed: 500 }, // current
  { id: 4, url: "https://d.example/four", title: "Four", workspace: "side", lastAccessed: 400 },
];

const MAIN = { scope: "workspace", workspace: "main", currentId: 3 };

const keysOf = rows => rows.map(r => r.key);

function deepFreeze(value, seen = new Set()) {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  Object.freeze(value);
  for (const v of Object.values(value)) deepFreeze(v, seen);
  return value;
}

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

// 12 (spec 9). MRU order with the current tab LAST -------------------------

test("tabsource: rows are MRU-ordered with the current tab last, so row 1 is the tab you came from", () => {
  const rows = buildRows(TABS, {}, MAIN);
  assert.deepEqual(
    keysOf(rows),
    ["2", "1", "3"],
    "second-most-recent first; plain MRU would be ['3','2','1'] and Enter would do nothing",
  );
  assert.equal(rows[0].key, "2", "Enter on row 1 is alt-tab");
  assert.equal(rows[rows.length - 1].current, true, "the current tab is the last row");
  assert.equal(rows.filter(r => r.current).length, 1, "exactly one row is the current one");
  assert.equal(rows[0].current, false);
});

test("tabsource: a tab with no lastAccessed sorts as least-recent instead of breaking the order", () => {
  const tabs = [
    { id: 1, url: "https://a.example/one", title: "One", workspace: "main" },
    { id: 2, url: "https://b.example/two", title: "Two", workspace: "main", lastAccessed: 300 },
    { id: 5, url: "https://e.example/five", title: "Five", workspace: "main", lastAccessed: "soon" },
    { id: 6, url: "https://f.example/six", title: "Six", workspace: "main", lastAccessed: NaN },
  ];
  const rows = buildRows(tabs, {}, { scope: "workspace", workspace: "main", currentId: null });
  assert.equal(rows[0].key, "2", "the only tab with a real timestamp leads");
  assert.deepEqual(
    keysOf(rows).slice(1),
    ["1", "5", "6"],
    "clockless tabs sort as 0 and tie-break on input order (stable)",
  );
});

test("tabsource: pinned rows sort above the MRU block, by pin number rather than recency", () => {
  const byPin = buildRows(TABS, { 1: { pin: 2 }, 2: { pin: 1 } }, MAIN);
  assert.deepEqual(keysOf(byPin), ["2", "1", "3"], "pin 1 then pin 2, then the MRU block");

  const swapped = buildRows(TABS, { 1: { pin: 1 }, 2: { pin: 2 } }, MAIN);
  assert.deepEqual(
    keysOf(swapped),
    ["1", "2", "3"],
    "swapping the pin numbers reorders the block — MRU alone would still say ['2','1','3']",
  );
  assert.equal(swapped[0].pin, 1);
  assert.equal(swapped[1].pin, 2);
  assert.equal(swapped[2].pin, null, "an unpinned row reports pin null, never undefined");
});

test("tabsource: a pinned current tab keeps its pin position instead of dropping to the bottom", () => {
  // Pins are positional addresses bound to the 1–9 keys, so the current-last
  // rule applies only inside the unpinned MRU block (analyst finding F8).
  const rows = buildRows(TABS, { 3: { pin: 1 } }, MAIN);
  assert.deepEqual(keysOf(rows), ["3", "2", "1"]);
  assert.equal(rows[0].current, true, "the pinned current tab stays where its number says");
});

// 13 (spec 10). scope --------------------------------------------------------

test("tabsource: scope 'workspace' hides other workspaces' tabs", () => {
  const rows = buildRows(TABS, {}, MAIN);
  assert.equal(keysOf(rows).includes("4"), false, "the 'side' tab is not in the 'main' panel");
  assert.equal(rows.length, 3);
  for (const row of rows) assert.equal(row.workspace, "main");
  assert.equal(rows.some(r => r.text.includes("@")), false, "no workspace suffix while scoped to one");
});

test("tabsource: scope 'all' includes every workspace and each row names its own", () => {
  const rows = buildRows(TABS, {}, { scope: "all", workspace: "main", currentId: 3 });
  assert.equal(rows.length, 4);
  assert.ok(keysOf(rows).includes("4"), "the other workspace's tab is included");
  for (const row of rows) {
    assert.equal(typeof row.workspace, "string");
    assert.notEqual(row.workspace, "", "every row names a workspace");
  }
  assert.ok(rows.find(r => r.key === "4").text.includes("@side"), "and the row text says which one");
  assert.ok(rows.find(r => r.key === "1").text.includes("@main"));
});

test("tabsource: a missing or empty workspace degrades to showing every tab, never an empty panel", () => {
  for (const workspace of [null, undefined, "", 42]) {
    const rows = buildRows(TABS, {}, { scope: "workspace", workspace, currentId: 3 });
    assert.equal(rows.length, 4, `workspace ${String(workspace)}: a broken config must not empty the panel`);
  }
  const unknownScope = buildRows(TABS, {}, { scope: "sideways", workspace: "main", currentId: 3 });
  assert.equal(unknownScope.length, 3, "an unknown scope falls back to 'workspace'");
});

// 14 (spec 11). a rename never hides the origin ------------------------------

test("tabsource: a renamed tab exposes the rename AND the real title, rename first", () => {
  const rows = buildRows(TABS, { 1: { rename: "Deploy runbook" } }, MAIN);
  const row = rows.find(r => r.key === "1");
  assert.equal(row.rename, "Deploy runbook");
  assert.equal(row.title, "One", "the real title is untouched");
  assert.ok(row.text.includes("Deploy runbook"), "the row shows the rename");
  assert.ok(row.text.includes("One"), "and never hides what the page actually is");
  assert.ok(
    row.text.indexOf("Deploy runbook") < row.text.indexOf("One"),
    "rename first, real title after it",
  );
  const other = rows.find(r => r.key === "2");
  assert.equal(other.rename, null, "an unrenamed tab reports rename null");
});

test("tabsource: clearing a rename restores the plain title", () => {
  const meta = applyMeta({}, { id: 1, rename: "Deploy runbook" });
  assert.equal(meta["1"].rename, "Deploy runbook");
  const cleared = applyMeta(meta, { id: 1, rename: null });
  const row = buildRows(TABS, cleared, MAIN).find(r => r.key === "1");
  assert.equal(row.rename, null);
  assert.equal(row.title, "One");
  assert.ok(row.text.includes("One"));
});

test("tabsource: row text carries pin, mark, tags and host in a fixed, complete order", () => {
  const meta = { 1: { pin: 3, mark: "a", tags: ["work", "deploy"] } };
  const row = buildRows(TABS, meta, MAIN).find(r => r.key === "1");
  assert.equal(row.pin, 3);
  assert.equal(row.mark, "a");
  assert.deepEqual(row.tags, ["work", "deploy"]);
  assert.equal(row.host, "a.example");
  for (const part of ["3", "'a", "One", "a.example", "#work", "#deploy"]) {
    assert.ok(row.text.includes(part), `row text must carry ${part}`);
  }
  assert.ok(row.text.indexOf("3") < row.text.indexOf("'a"), "pin before mark");
  assert.ok(row.text.indexOf("'a") < row.text.indexOf("One"), "mark before the name");
  assert.ok(row.text.indexOf("One") < row.text.indexOf("#work"), "tags trail the name");
  const bare = buildRows(TABS, {}, MAIN).find(r => r.key === "1");
  assert.deepEqual(bare.tags, [], "an untagged tab reports an empty array, not undefined");
  assert.equal(bare.mark, null);
  assert.equal(bare.text.includes("'"), false, "absent parts are omitted, not rendered blank");
});

// 15 (spec 12). round trip + hostile metadata --------------------------------

test("tabsource: tags round-trip through serializeMeta/deserializeMeta", () => {
  const meta = applyMeta({}, { id: 2, tags: ["work", "deploy"] });
  const { schema, meta: back } = deserializeMeta(serializeMeta(meta));
  assert.equal(schema, 3);
  assert.deepEqual(back["2"].tags, ["work", "deploy"], "order and content survive the file");
});

test("tabsource: hostile metadata drops per field, empties disappear, and nothing pollutes the prototype", () => {
  // JSON text is the only way to plant own "__proto__"/"constructor" keys.
  const hostile = `{"schema":3,"tabMeta":{
    "__proto__":{"mark":"z"},
    "constructor":{"pin":1},
    "1.5":{"rename":"x"},
    "-2":{"rename":"x"},
    "3":{"rename":"${"x".repeat(5000)}"},
    "4":{"tags":"notanarray"},
    "5":{"pin":"3"},
    "6":{"pin":0},
    "7":{"pin":10},
    "8":{"mark":"ab"},
    "9":{"mark":" "},
    "10":{"tags":["ok",42,"","${"y".repeat(500)}"]},
    "11":{"rename":"keep","tags":["a"]},
    "12":null,
    "13":[],
    "14":{}
  }}`;

  let out;
  assert.doesNotThrow(() => {
    out = deserializeMeta(hostile);
  }, "a hostile file must never throw");
  const meta = out.meta;

  assert.deepEqual(meta["11"], { rename: "keep", tags: ["a"] }, "the one honest entry survives intact");
  assert.deepEqual(meta["10"].tags, ["ok"], "invalid tags drop individually, the valid one stays");

  for (const key of ["3", "4", "5", "6", "7", "8", "9", "12", "13", "14", "__proto__", "constructor", "1.5", "-2"]) {
    assert.equal(
      Object.keys(meta).includes(key),
      false,
      `entry ${key} must be gone: every field was invalid, so nothing is left to keep`,
    );
  }

  assert.equal(meta.mark, undefined, "the planted __proto__ entry was not spliced into the prototype chain");
  assert.equal(meta.pin, undefined);
  assert.equal({}.mark, undefined, "no prototype pollution");
  assert.equal(Object.prototype.pin, undefined, "no prototype pollution");
  assert.equal(Object.getPrototypeOf(meta), Object.prototype, "an ordinary, serializable table");
});

test("tabsource: a valid entry beside hostile siblings still round-trips byte-for-byte", () => {
  const { meta } = deserializeMeta(`{"schema":3,"tabMeta":{"__proto__":{"mark":"z"},"11":{"rename":"keep"}}}`);
  const text = serializeMeta(meta);
  assert.equal(text.includes("__proto__"), false, "the hostile key is not re-emitted");
  assert.deepEqual(deserializeMeta(text).meta, meta);
});

// 16 (spec 13). schema tolerance and byte-stable round trip ------------------

test("tabsource: a schema-2 workspaces file deserializes to schema 2 with empty tab metadata", () => {
  const v2 = JSON.stringify({ schema: 2, active: "main", workspaces: [], contexts: {} });
  let out;
  assert.doesNotThrow(() => {
    out = deserializeMeta(v2);
  });
  assert.equal(out.schema, 2, "the file's own schema is reported, not assumed to be 3");
  assert.deepEqual(out.meta, {});
});

test("tabsource: a schema-less v1 file deserializes to schema 0 with empty tab metadata", () => {
  const v1 = JSON.stringify({ active: "main", workspaces: [] });
  const out = deserializeMeta(v1);
  assert.equal(out.schema, 0);
  assert.deepEqual(out.meta, {});
});

test("tabsource: bad JSON and non-string input deserialize to an empty, schema-0 result", () => {
  for (const bad of ["{ not json", null, undefined, 42, "", [], () => {}, true]) {
    let out;
    assert.doesNotThrow(() => {
      out = deserializeMeta(bad);
    }, `input ${String(bad)}`);
    assert.equal(out.schema, 0, `input ${String(bad)} → schema 0`);
    assert.deepEqual(out.meta, {}, `input ${String(bad)} → empty meta`);
  }
  const parsed = deserializeMeta({ schema: 3, tabMeta: { 2: { rename: "Two" } } });
  assert.equal(parsed.schema, 3, "an already-parsed object is accepted too");
  assert.equal(parsed.meta["2"].rename, "Two");
  assert.deepEqual(deserializeMeta({ schema: 3, tabMeta: "nope" }).meta, {}, "a non-object tabMeta → {}");
  assert.equal(deserializeMeta({ schema: "3", tabMeta: {} }).schema, 0, "a non-integer schema → 0");
});

test("tabsource: a schema-3 table serializes byte-stably across repeated round trips", () => {
  // Fields are written in an order deliberately opposite to the emission
  // order, and entry 10 is created before entry 2 — an implementation that
  // emits insertion order produces a different second pass.
  let m = applyMeta({}, { id: 10, mark: "z" });
  m = applyMeta(m, { id: 10, pin: 3 });
  m = applyMeta(m, { id: 10, rename: "Ten" });
  m = applyMeta(m, { id: 10, tags: ["b", "a"] });
  m = applyMeta(m, { id: 2, tags: ["work"] });
  m = applyMeta(m, { id: 2, rename: "Two" });

  const a = serializeMeta(m);
  const b = serializeMeta(deserializeMeta(a).meta);
  const c = serializeMeta(deserializeMeta(b).meta);
  assert.equal(a, b, "one round trip is byte-identical");
  assert.equal(a, c, "and so is the next — the order is canonical, not accidental");

  const envelope = JSON.parse(a);
  assert.equal(envelope.schema, 3, "schema 3 is what gets written");
  assert.deepEqual(Object.keys(envelope.tabMeta).sort(), ["10", "2"]);
  const entry = a.slice(a.indexOf('"2"'));
  assert.ok(
    entry.indexOf('"rename"') < entry.indexOf('"tags"'),
    "fields are emitted rename, tags, pin, mark — never insertion order",
  );
});

test("tabsource: entry keys are emitted in numeric order even past the array-index range", () => {
  // Ids 2 and 10 CANNOT prove this: JSON.stringify re-orders array-index-like
  // keys numerically all by itself, so `"2"` precedes `"10"` even in an
  // implementation that sorts its keys lexicographically or not at all. Ids
  // above 2^32-1 are ordinary string keys, so they are emitted in whatever
  // order the implementation inserted them — which is the only place the
  // canonical-order rule is observable, and the only place a lexicographic
  // sort ("10000000000" < "4294967296") produces a different file.
  let m = applyMeta({}, { id: 10000000000, rename: "Big" });
  m = applyMeta(m, { id: 4294967296, rename: "Boundary" });
  m = applyMeta(m, { id: 2, rename: "Two" });

  const a = serializeMeta(m);
  assert.ok(
    a.indexOf('"4294967296"') < a.indexOf('"10000000000"'),
    "entry keys ascend numerically, not lexicographically and not by insertion",
  );
  assert.ok(a.indexOf('"2"') < a.indexOf('"4294967296"'));
  assert.equal(serializeMeta(deserializeMeta(a).meta), a, "and the file stays byte-stable across a round trip");

  // The same table built in a different order must produce the same bytes.
  let n = applyMeta({}, { id: 4294967296, rename: "Boundary" });
  n = applyMeta(n, { id: 2, rename: "Two" });
  n = applyMeta(n, { id: 10000000000, rename: "Big" });
  assert.equal(serializeMeta(n), a, "insertion order cannot leak into the file");
});

test("tabsource: serializeMeta on garbage still writes a loadable, empty schema-3 envelope", () => {
  for (const bad of [null, undefined, 42, "meta", [], () => {}]) {
    let text;
    assert.doesNotThrow(() => {
      text = serializeMeta(bad);
    }, `meta ${String(bad)}`);
    assert.deepEqual(JSON.parse(text), { schema: 3, tabMeta: {} });
  }
});

// 17 (spec 14). markResolve — live first, then the graveyard -----------------

test("tabsource: a mark on an open tab resolves to that tab", () => {
  const m = applyMeta({}, { id: 2, mark: "r" });
  const hit = markResolve(m, "r", { liveTabs: TABS, graveyard: [] });
  assert.equal(hit.kind, "tab");
  assert.equal(hit.id, 2);
  assert.equal(hit.tab.url, "https://b.example/two", "the resolution hands back the tab itself");
});

test("tabsource: when a letter exists in both stores, the live tab wins", () => {
  const m = applyMeta({}, { id: 2, mark: "r" });
  const graveyard = [{ id: 99, url: "https://old.example/gone", title: "Old", closedAt: 1, meta: { mark: "r" } }];

  const live = markResolve(m, "r", { liveTabs: TABS, graveyard });
  assert.equal(live.kind, "tab", "a graveyard-first implementation would resurrect instead of switching");
  assert.equal(live.id, 2);

  const closed = markResolve(m, "r", { liveTabs: TABS.filter(t => t.id !== 2), graveyard });
  assert.equal(closed.kind, "graveyard", "with the tab closed, the same letter reaches the record");
  assert.equal(closed.id, 99);
  assert.equal(closed.record.title, "Old");
});

test("tabsource: reassigning a letter moves it and leaves no duplicate", () => {
  const m = applyMeta({}, { id: 2, mark: "r" });
  const m2 = applyMeta(m, { id: 1, mark: "r" });
  assert.equal(
    Object.values(m2).filter(e => e.mark === "r").length,
    1,
    "one tab per letter — the old holder loses it silently",
  );
  assert.equal(m2["2"]?.mark, undefined, "and the emptied entry disappears entirely");
  assert.equal(markResolve(m2, "r", { liveTabs: TABS }).id, 1);
});

test("tabsource: one letter per tab — a second mark on the same tab replaces the first", () => {
  let m = applyMeta({}, { id: 2, mark: "r" });
  m = applyMeta(m, { id: 2, mark: "q" });
  assert.equal(m["2"].mark, "q");
  assert.equal(markResolve(m, "r", { liveTabs: TABS }), null, "the old letter no longer resolves");
  assert.equal(markResolve(m, "q", { liveTabs: TABS }).id, 2);
});

test("tabsource: a duplicate letter in a hostile file resolves to exactly one candidate", () => {
  const { meta } = deserializeMeta(`{"schema":3,"tabMeta":{"2":{"mark":"r"},"1":{"mark":"r"}}}`);
  assert.equal(
    Object.values(meta).filter(e => e.mark === "r").length,
    1,
    "cross-entry uniqueness is re-enforced on read, in ascending key order",
  );
  assert.equal(markResolve(meta, "r", { liveTabs: TABS }).id, 1, "the lower key wins, deterministically");
});

test("tabsource: markResolve returns null for a non-single-character or unknown letter, and never throws", () => {
  const m = applyMeta({}, { id: 2, mark: "r" });
  for (const char of ["rr", "", null, undefined, 42, [], {}, " "]) {
    assert.equal(markResolve(m, char, { liveTabs: TABS }), null, `char ${String(char)}`);
  }
  assert.equal(markResolve(m, "q", { liveTabs: TABS, graveyard: [] }), null, "an unused letter resolves to nothing");
  for (const marks of [null, undefined, 42, "meta", []]) {
    assert.equal(markResolve(marks, "r", { liveTabs: TABS }), null, `marks ${String(marks)}`);
  }
  let out;
  assert.doesNotThrow(() => {
    out = markResolve(null, null, null);
  });
  assert.equal(out, null);
  assert.equal(markResolve(m, "r"), null, "no stores given → nothing to resolve against");
});

test("tabsource: a single-code-point mark outside the BMP is one character, not two", () => {
  const m = applyMeta({}, { id: 3, mark: "😀" });
  assert.equal(m["3"].mark, "😀", "code points, not UTF-16 units");
  assert.equal(markResolve(m, "😀", { liveTabs: TABS }).id, 3);
});

// 18 (spec 15). metadata rides the graveyard record --------------------------
// RED and blocked: aether-graveyard.sys.mjs drops `meta` at bury and at
// deserialize (analyst finding F4). r4 owns neither that file nor its test.

test("tabsource: a renamed, tagged tab carries its metadata into the graveyard and back out", () => {
  let live = applyMeta({}, { id: 7, rename: "Deploy runbook" });
  live = applyMeta(live, { id: 7, tags: ["work"] });

  const store = createStore(10);
  const record = bury(store, {
    url: "https://a.example/one",
    title: "One",
    closedAt: 1_000,
    workspace: "main",
    meta: live["7"],
  });
  assert.deepEqual(record.meta, { rename: "Deploy runbook", tags: ["work"] }, "bury copies the metadata onto the record");

  const revived = graveDeserialize(graveSerialize(store), 10);
  const back = exhume(revived, record.id);
  assert.equal(back.meta.rename, "Deploy runbook", "and it survives the graveyard file");
  assert.deepEqual(back.meta.tags, ["work"]);

  // Resurrection hands the metadata to a FRESH ref id — the two stores share
  // no identifier, so the handoff is a field copy, not a cross-store lookup.
  const reborn = applyMeta({}, { id: 12, ...back.meta });
  const roundTripped = deserializeMeta(serializeMeta(reborn)).meta;
  assert.equal(roundTripped["12"].rename, "Deploy runbook", "the rename lands on the resurrected tab");
  assert.deepEqual(roundTripped["12"].tags, ["work"]);
  assert.equal(roundTripped["7"], undefined, "the dead tab's id is not resurrected with it");
});

// 19 (spec 16). malformed record meta → {} and the record survives ----------

test("tabsource: a graveyard record with malformed meta keeps its url and title, with meta = {}", () => {
  const text = JSON.stringify({
    records: [
      { id: 1, url: "https://a.example/a", title: "A", closedAt: 1, meta: "nope" },
      { id: 2, url: "https://b.example/b", title: "B", closedAt: 2, meta: [] },
      { id: 3, url: "https://c.example/c", title: "C", closedAt: 3, meta: { rename: 12 } },
      { id: 4, url: "https://d.example/d", title: "D", closedAt: 4 },
    ],
  }).replace(
    '"records":[',
    '"records":[{"id":5,"url":"https://e.example/e","title":"E","closedAt":5,"meta":{"__proto__":{"rename":"evil"}}},',
  );

  let store;
  assert.doesNotThrow(() => {
    store = graveDeserialize(text, 10);
  });
  assert.equal(store.records.length, 5, "malformed metadata never costs the record itself");
  for (const record of store.records) {
    assert.equal(typeof record.url, "string");
    assert.notEqual(record.url, "");
    assert.deepEqual(record.meta, {}, `record ${record.id}: unusable metadata degrades to an empty table`);
  }
  assert.equal({}.rename, undefined, "no prototype pollution");
  assert.equal(Object.prototype.rename, undefined, "no prototype pollution");
});

// 20. buildRows tolerance ----------------------------------------------------

test("tabsource: malformed tabs drop individually and the well-formed ones still render", () => {
  const tabs = [
    null,
    3,
    "nope",
    { id: 5 }, // no url
    { url: "https://x.example" }, // no id
    { id: 6, url: "", title: "t" }, // empty url
    { id: 0.5, url: "https://frac.example" }, // non-integer, non-string id
    { id: 7, url: "https://ok.example/page", title: null },
    ...TABS,
  ];
  let rows;
  assert.doesNotThrow(() => {
    rows = buildRows(tabs, {}, {});
  });
  const keys = keysOf(rows);
  assert.deepEqual(keys.sort(), ["1", "2", "3", "4", "7"], "only well-formed tabs survive");

  const seven = rows.find(r => r.key === "7");
  assert.equal(seven.title, "", "a non-string title becomes empty, never the text 'undefined'");
  assert.ok(seven.text.includes("ok.example"), "and the row falls back to the host so it is still findable");
  assert.equal(seven.text.includes("undefined"), false);
  assert.equal(seven.text.includes("null"), false);
});

test("tabsource: buildRows with nothing at all returns an empty list", () => {
  assert.deepEqual(buildRows(undefined, undefined, undefined), []);
  assert.deepEqual(buildRows(null, null, null), []);
  assert.deepEqual(buildRows("tabs", {}, {}), []);
  assert.deepEqual(buildRows({}, {}, {}), []);
  assert.deepEqual(buildRows([], {}, MAIN), []);
});

test("tabsource: a garbage metadata table is ignored rather than fatal", () => {
  for (const bad of [null, undefined, "meta", 42, [], () => {}]) {
    let rows;
    assert.doesNotThrow(() => {
      rows = buildRows(TABS, bad, MAIN);
    }, `metadata ${String(bad)}`);
    assert.equal(rows.length, 3);
    for (const row of rows) {
      assert.equal(row.rename, null);
      assert.deepEqual(row.tags, []);
      assert.equal(row.pin, null);
      assert.equal(row.mark, null);
    }
  }
});

test("tabsource: buildRows and applyMeta share ONE id rule — no row exists that metadata cannot reach", () => {
  // The asymmetry this pins: buildRows once accepted any non-empty string or
  // any integer while applyMeta required an f5 ref id, so `{id: "a1"}` got a
  // row whose rename, tag, pin and mark were all silent no-ops with no failure
  // signal — and whose `tab_close a1` the glue would dispatch against an id no
  // store recognises. One rule, asserted as an equivalence rather than twice.
  const ids = [1, 0, 42, "7", "a1", -5, 1.5, 1e21, "", "__proto__", "constructor", null, undefined, true, {}, []];
  for (const id of ids) {
    const rows = buildRows([{ id, url: "https://s.example/s", title: "S" }], {}, {});
    const accepted = Object.keys(applyMeta({}, { id, rename: "Named" })).length === 1;
    assert.equal(
      rows.length === 1,
      accepted,
      `id ${String(id)}: a row must exist exactly when metadata can be written for it`,
    );
    if (accepted) assert.equal(rows[0].key, String(id), `id ${String(id)}: same key on both sides`);
  }

  const good = buildRows([{ id: 7, url: "https://s.example/s", title: "S" }], {}, {});
  assert.equal(good[0].key, "7");
  assert.equal(good[0].id, 7, "the row still reports the id it was given, for the command to use");
});

test("tabsource: a tab id that is not an f5 ref id is dropped rather than shown unactionable", () => {
  const rows = buildRows(
    [
      { id: "a1", url: "https://s.example/s", title: "S" },
      { id: 3, url: "https://ok.example/o", title: "OK" },
    ],
    {},
    {},
  );
  assert.deepEqual(keysOf(rows), ["3"], "the bad id drops individually, the good tab still renders");
});

// 21. host derivation ---------------------------------------------------------

test("tabsource: an unparseable url falls back to the raw string, never 'undefined'", () => {
  const rows = buildRows(
    [
      { id: 1, url: "not a url", title: "Broken" },
      { id: 2, url: "about:blank" },
      { id: 3, url: "https://good.example/path?q=1#frag", title: "Good" },
    ],
    {},
    {},
  );
  const byKey = Object.fromEntries(rows.map(r => [r.key, r]));
  assert.equal(byKey["1"].host, "not a url");
  assert.notEqual(byKey["2"], undefined, "an about: url still gets a row");
  assert.notEqual(byKey["2"].host, "", "a hostless url falls back to the url itself");
  assert.equal(byKey["2"].host, "about:blank");
  assert.equal(byKey["3"].host, "good.example", "the host is the host, not the whole url");
  for (const row of rows) {
    assert.equal(row.text.includes("undefined"), false, `row ${row.key} text`);
    assert.equal(row.text.includes("null"), false, `row ${row.key} text`);
    assert.equal(typeof row.url, "string");
  }
});

// 22. purity, clearing, and determinism --------------------------------------

test("tabsource: applyMeta never mutates the table it was given", () => {
  const meta = deepFreeze(applyMeta({}, { id: 1, rename: "One" }));
  const before = JSON.stringify(meta);
  let out;
  assert.doesNotThrow(() => {
    out = applyMeta(meta, { id: 2, tags: ["x"] });
  }, "a frozen table proves nothing is written in place");
  assert.notEqual(out, meta, "a new table comes back");
  assert.equal(JSON.stringify(meta), before);
  assert.equal(meta["2"], undefined);
  assert.equal(out["1"].rename, "One", "the untouched entry is carried over");
});

test("tabsource: null clears a field and an emptied entry disappears", () => {
  const meta = applyMeta({}, { id: 1, rename: "One" });
  const cleared = applyMeta(meta, { id: 1, rename: null });
  assert.equal(cleared["1"], undefined, "no fields left, so no entry left");

  let two = applyMeta({}, { id: 2, rename: "Two" });
  two = applyMeta(two, { id: 2, tags: ["work"] });
  const partly = applyMeta(two, { id: 2, rename: null });
  assert.equal(partly["2"].rename, undefined, "only the cleared field goes");
  assert.deepEqual(partly["2"].tags, ["work"], "the sibling field stays");
});

test("tabsource: an absent field is left alone, which is not the same as clearing it", () => {
  let m = applyMeta({}, { id: 1, rename: "One" });
  m = applyMeta(m, { id: 1, tags: ["work"] });
  assert.equal(m["1"].rename, "One", "a change that does not mention rename must not erase it");
  assert.deepEqual(m["1"].tags, ["work"]);
});

test("tabsource: an invalid field value is ignored, never written", () => {
  let m = applyMeta({}, { id: 1, rename: "One", pin: 2, mark: "a", tags: ["work"] });
  for (const change of [
    { id: 1, pin: 0 },
    { id: 1, pin: 10 },
    { id: 1, pin: "3" },
    { id: 1, pin: 1.5 },
    { id: 1, mark: "ab" },
    { id: 1, mark: " " },
    { id: 1, mark: 7 },
    { id: 1, rename: "" },
    { id: 1, rename: "   " },
    { id: 1, rename: "x".repeat(5000) },
    { id: 1, tags: "work" },
    { id: 1, tags: 42 },
  ]) {
    const out = applyMeta(m, change);
    assert.deepEqual(out["1"], m["1"], `change ${JSON.stringify(change)} must leave the entry as it was`);
  }
  const trimmed = applyMeta(m, { id: 1, rename: "  Renamed  " });
  assert.equal(trimmed["1"].rename, "Renamed", "a valid rename is trimmed and written");
});

test("tabsource: a hostile change id writes nothing and pollutes nothing", () => {
  const m = applyMeta({}, { id: 1, rename: "One" });
  for (const id of ["__proto__", "constructor", "prototype", "1.5", "-2", "abc", null, undefined, {}, []]) {
    const out = applyMeta(m, { id, mark: "a" });
    assert.deepEqual(out, m, `id ${String(id)} → a content-identical copy`);
    assert.notEqual(out, m, `id ${String(id)} → still a NEW table`);
  }
  assert.equal({}.mark, undefined, "no prototype pollution");
  assert.equal(Object.prototype.rename, undefined, "no prototype pollution");
  const garbage = applyMeta(m, null);
  assert.deepEqual(garbage, m, "a garbage change is a copy");
  assert.deepEqual(applyMeta(null, { id: 1, rename: "One" })["1"], { rename: "One" }, "a garbage table starts empty");
});

test("tabsource: tags are trimmed, deduped, capped, and kept in first-seen order", () => {
  const m = applyMeta({}, { id: 1, tags: ["  work ", "work", "deploy", "", "  ", "z".repeat(500)] });
  assert.deepEqual(m["1"].tags, ["work", "deploy"], "trimmed, deduped, invalid entries dropped");
  const many = applyMeta({}, { id: 1, tags: Array.from({ length: 40 }, (_, i) => `t${i}`) });
  assert.equal(many["1"].tags.length, 16, "capped at 16");
  assert.equal(many["1"].tags[0], "t0", "keeping the first ones");
});

// 23. pin uniqueness is per workspace ----------------------------------------

test("tabsource: pinning a number that is taken in the same workspace moves the pin", () => {
  let m = applyMeta({}, { id: 1, pin: 2, workspace: "main" });
  m = applyMeta(m, { id: 5, pin: 2, workspace: "main" });
  assert.equal(m["1"]?.pin, undefined, "the previous holder of pin 2 in 'main' loses it");
  assert.equal(m["5"].pin, 2);
});

test("tabsource: the same pin number in another workspace coexists", () => {
  let m = applyMeta({}, { id: 5, pin: 2, workspace: "main" });
  m = applyMeta(m, { id: 9, pin: 2, workspace: "side" });
  assert.equal(m["5"].pin, 2, "pins are per-workspace addresses");
  assert.equal(m["9"].pin, 2);

  const { meta } = deserializeMeta(serializeMeta(m));
  assert.equal(meta["5"].pin, 2, "and both survive a read, which re-enforces the invariant");
  assert.equal(meta["9"].pin, 2);
});

test("tabsource: a duplicate pin in the same workspace in a hostile file resolves to one holder", () => {
  const { meta } = deserializeMeta(
    `{"schema":3,"tabMeta":{"9":{"pin":2,"workspace":"main"},"1":{"pin":2,"workspace":"main"}}}`,
  );
  const holders = Object.entries(meta).filter(([, e]) => e.pin === 2 && e.workspace === "main");
  assert.equal(holders.length, 1, "one tab per pin number per workspace, enforced on read");
  assert.equal(holders[0][0], "1", "the lower key wins, deterministically");
});

test("tabsource: the pin slot follows the TAB's workspace, not a stale copy inside the entry", () => {
  // The entry's `workspace` is a denormalized copy of the tab's. `tab_move_ws`
  // changes the tab and not the copy, so a copy-scoped uniqueness rule protects
  // a slot in a workspace the tab has left. The live mapping is authoritative
  // wherever the caller has one, and buildRows always has one.
  const pinnedInMain = applyMeta({}, { id: 1, pin: 1, workspace: "main" });
  const moved = [
    { id: 1, url: "https://a.example/one", title: "One", workspace: "side", lastAccessed: 100 },
    { id: 2, url: "https://b.example/two", title: "Two", workspace: "main", lastAccessed: 200 },
  ];

  // (a) tab 1 has moved to "side": pinning 1 in "main" must not steal from it.
  const live = new Map(moved.map(t => [String(t.id), t.workspace]));
  const after = applyMeta(pinnedInMain, { id: 2, pin: 1, workspace: "main" }, live);
  assert.equal(after["1"].pin, 1, "tab 1 keeps its pin: it is not in 'main' any more");
  assert.equal(after["2"].pin, 1, "and tab 2 takes pin 1 in 'main'");
  assert.equal(after["1"].workspace, "side", "the stale copy is healed to where the tab actually is");

  // (b) the same call WITHOUT the live mapping still writes a table that
  // buildRows renders unambiguously — one pin 1 per workspace on screen.
  const blind = applyMeta(pinnedInMain, { id: 2, pin: 1, workspace: "main" });
  for (const table of [after, blind]) {
    const inSide = buildRows(moved, table, { scope: "workspace", workspace: "side", currentId: 9 });
    const inMain = buildRows(moved, table, { scope: "workspace", workspace: "main", currentId: 9 });
    assert.equal(inSide.filter(r => r.pin === 1).length <= 1, true, "at most one pin 1 on screen in 'side'");
    assert.equal(inMain.filter(r => r.pin === 1).length <= 1, true, "at most one pin 1 on screen in 'main'");
  }
});

test("tabsource: a live workspace mapping may be a Map, a plain object or a function", () => {
  const meta = applyMeta({}, { id: 1, pin: 1, workspace: "main" });
  for (const live of [
    new Map([["1", "side"]]),
    { 1: "side" },
    key => (key === "1" ? "side" : null),
  ]) {
    const out = applyMeta(meta, { id: 2, pin: 1, workspace: "main" }, live);
    assert.equal(out["1"].pin, 1, `mapping ${live?.constructor?.name ?? typeof live}: tab 1 is in 'side'`);
    assert.equal(out["2"].pin, 1);
  }
  const throwing = applyMeta(meta, { id: 2, pin: 1, workspace: "main" }, () => {
    throw new Error("boom");
  });
  assert.equal(throwing["2"].pin, 1, "a throwing lookup degrades to the stored copies, never to a throw");
  for (const junk of [null, undefined, 42, "main", []]) {
    assert.doesNotThrow(() => applyMeta(meta, { id: 2, pin: 1 }, junk), `mapping ${String(junk)}`);
  }
});

// 24. the invariants hold on the RENDER path, not only on write ---------------

test("tabsource: buildRows never renders two rows addressed by the same pin or the same mark", () => {
  // A hand-edited (or agent-written) file is the case that matters: applyMeta
  // never produces this, so an invariant enforced only on write is an invariant
  // the panel does not actually have. Both rows below claim pin 1 and mark 'a.
  const hostile = { 1: { mark: "a", pin: 1 }, 2: { mark: "a", pin: 1 } };
  const rows = buildRows(TABS, hostile, MAIN);
  assert.equal(rows.filter(r => r.pin === 1).length, 1, "one row addressed 1, not two");
  assert.equal(rows.filter(r => r.mark === "a").length, 1, "one row addressed 'a, not two");
  assert.equal(rows.filter(r => r.text.includes("'a")).length, 1, "and the row text says so too");

  // The winner is the same one markResolve and the file agree on: lowest key.
  assert.equal(rows.find(r => r.mark === "a").key, "1");
  assert.equal(markResolve(hostile, "a", { liveTabs: TABS }).id, 1, "render and resolution cannot disagree");
  assert.equal(deserializeMeta(serializeMeta(hostile)).meta["2"], undefined, "and neither can the file");
});

test("tabsource: buildRows sanitizes fields on the render path exactly as the write path does", () => {
  const rows = buildRows(TABS, { 1: { rename: "  Deploy  ", tags: ["  work ", "work", 42], pin: 99, mark: "ab" } }, MAIN);
  const row = rows.find(r => r.key === "1");
  assert.equal(row.rename, "Deploy", "trimmed on read, not just on write");
  assert.deepEqual(row.tags, ["work"], "invalid tags drop individually here too");
  assert.equal(row.pin, null, "an out-of-range pin is not rendered as an address");
  assert.equal(row.mark, null, "and neither is a two-character mark");
});

// 25. a rename can never hide what the page is -------------------------------

// Named by code point, never pasted in: a fixture nobody can see is a fixture
// nobody can review, and half of these do not survive being read in source at
// all. cp() is the only way this file ever spells one.
const cp = (...points) => String.fromCodePoint(...points);
const RLO = cp(0x202e); // RIGHT-TO-LEFT OVERRIDE
const ZWSP = cp(0x200b); // ZERO WIDTH SPACE

const HIDDEN_CHARS = [
  0x202e, // RIGHT-TO-LEFT OVERRIDE — reverses the display of everything after it
  0x202a, // LEFT-TO-RIGHT EMBEDDING
  0x2066, // LEFT-TO-RIGHT ISOLATE
  0x200b, // ZERO WIDTH SPACE
  0x200e, // LEFT-TO-RIGHT MARK
  0xfeff, // ZERO WIDTH NO-BREAK SPACE
  0x00ad, // SOFT HYPHEN
  0x0000, // NUL
  0x0007, // BEL
  0x000a, // LF
  0x000d, // CR
  0x0009, // TAB
].map(point => cp(point));

test("tabsource: bidi, control and zero-width characters are refused in a rename", () => {
  // U+202E reverses the display of everything after it, so a rename carrying
  // one renders the real title and host backwards — one invisible character
  // defeating the single rule the rename feature has, on a page whose host is
  // the whole point of reading the row.
  const page = [{ id: 1, url: "https://bank.example/login", title: "bank.example login", workspace: "main" }];
  for (const hidden of HIDDEN_CHARS) {
    // Embedded mid-string: the leading and trailing cases of the
    // whitespace-class ones are already handled by trim(), and the interesting
    // failure is the one trim cannot reach.
    const value = "safe" + hidden + "name";
    assert.deepEqual(
      applyMeta({}, { id: 1, rename: value }),
      {},
      "rename containing " + JSON.stringify(hidden) + " must be refused",
    );

    const forced = buildRows(page, { 1: { rename: value } }, MAIN)[0];
    assert.equal(forced.rename, null, "a file carrying " + JSON.stringify(hidden) + " renders no rename");
    assert.equal(forced.text.includes(hidden), false, "and the row text carries no hidden character at all");
    assert.ok(forced.text.includes("bank.example"), "so the row still says what the page actually is");
  }

  // A leading override is the worst case and is not whitespace, so trim cannot
  // save us from it.
  assert.deepEqual(applyMeta({}, { id: 1, rename: RLO + "safe" }), {}, "a leading override is refused too");

  assert.equal(applyMeta({}, { id: 1, rename: "Deploy runbook" })["1"].rename, "Deploy runbook", "ordinary text still works");
  assert.equal(
    applyMeta({}, { id: 1, rename: "Déploiement — 部署" })["1"].rename,
    "Déploiement — 部署",
    "and so does non-Latin text, which is not the same thing as an invisible one",
  );
});

test("tabsource: a rename is refused whole rather than silently rewritten", () => {
  const kept = applyMeta({}, { id: 1, rename: "Deploy runbook" });
  const attempt = applyMeta(kept, { id: 1, rename: "Deploy" + RLO + "runbook" });
  assert.equal(attempt["1"].rename, "Deploy runbook", "the good value is not overwritten by a refused one");
});

test("tabsource: hidden characters are refused in tags, per tag, and in workspace names", () => {
  const m = applyMeta({}, { id: 1, tags: ["work", "de" + RLO + "ploy", "ship" + ZWSP, "release"] });
  assert.deepEqual(m["1"].tags, ["work", "release"], "the bad tags drop individually, the good ones stay");

  const ws = applyMeta({}, { id: 1, pin: 1, workspace: "ma" + RLO + "in" });
  assert.equal(ws["1"].workspace, undefined, "a bidi workspace name is not stored");

  const rows = buildRows(
    [{ id: 1, url: "https://a.example/a", title: "A", workspace: "si" + RLO + "de" }],
    {},
    { scope: "all" },
  );
  assert.equal(rows[0].workspace, "", "nor rendered as a row's workspace");
  assert.equal(rows[0].text.includes(RLO), false);
});

test("tabsource: a mark must be a character you can both see and type", () => {
  // A mark nobody can see and nobody can type still occupies its letter slot,
  // forever, in a file a hand edit (or, at v2.1, an agent) can write.
  for (const hidden of [...HIDDEN_CHARS, cp(0x0301) /* COMBINING ACUTE ACCENT */]) {
    assert.deepEqual(
      applyMeta({}, { id: 1, mark: hidden }),
      {},
      "mark " + JSON.stringify(hidden) + " must be refused",
    );
    assert.equal(
      markResolve({ 1: { mark: hidden } }, hidden, { liveTabs: TABS }),
      null,
      "and a file carrying " + JSON.stringify(hidden) + " resolves to nothing",
    );
    assert.equal(
      buildRows(TABS, { 1: { mark: hidden } }, MAIN).some(r => r.mark !== null),
      false,
      "nor is it rendered as an address",
    );
  }
  assert.equal(applyMeta({}, { id: 1, mark: "a" })["1"].mark, "a", "ordinary letters still mark");
  assert.equal(applyMeta({}, { id: 1, mark: "é" })["1"].mark, "é", "and so does a precomposed accented letter");
  assert.equal(applyMeta({}, { id: 1, mark: cp(0x1f600) })["1"].mark, cp(0x1f600), "an astral mark is still one character");
});

test("tabsource: a page's OWN title cannot reverse or break the row either", () => {
  // A rename is refused because someone typed it and can retype it. A page
  // title cannot be refused — it is what the page calls itself, and dropping
  // the row would hide the tab — so it is stripped instead. The row still has
  // to read left to right, on one line.
  const evil = "Login" + RLO + " elpmaxe.knab";
  const rows = buildRows([{ id: 1, url: "https://bank.example/login", title: evil, workspace: "main" }], {}, MAIN);
  assert.equal(rows[0].title.includes(RLO), false, "the override is gone from the row's title");
  assert.equal(rows[0].text.includes(RLO), false, "and from its searchable text");
  assert.ok(rows[0].text.includes("bank.example"), "the host still says what the page actually is");

  const multiline = buildRows(
    [{ id: 2, url: "https://a.example/a", title: "line one" + cp(0x000a) + "line two" }],
    {},
    {},
  );
  assert.equal(multiline[0].text.includes(cp(0x000a)), false, "a title cannot span two rows");
  assert.ok(multiline[0].text.includes("line oneline two"));

  // An unparseable url is shown raw, so it gets the same treatment.
  const rawUrl = buildRows([{ id: 3, url: "not" + RLO + " a url", title: "T" }], {}, {});
  assert.equal(rawUrl[0].host.includes(RLO), false);
  assert.equal(rawUrl[0].text.includes(RLO), false);
});

// 26. entry fields are read as own properties --------------------------------

test("tabsource: an inherited field is not metadata — reads are own-property only", () => {
  const proto = { rename: "INHERITED", tags: ["ghost"], pin: 4, mark: "z", workspace: "elsewhere" };
  const change = Object.create(proto);
  change.id = 1;
  assert.deepEqual(applyMeta({}, change), {}, "a change inherits nothing writable");

  const entry = Object.create(proto);
  const rows = buildRows(TABS, { 1: entry }, MAIN);
  const row = rows.find(r => r.key === "1");
  assert.equal(row.rename, null, "and neither does a table entry");
  assert.deepEqual(row.tags, []);
  assert.equal(row.pin, null);
  assert.equal(row.mark, null);
  assert.equal(row.text.includes("INHERITED"), false);
  assert.equal(row.text.includes("ghost"), false);

  assert.deepEqual(deserializeMeta({ schema: 3, tabMeta: { 1: Object.create(proto) } }).meta, {});
  assert.equal(serializeMeta({ 1: Object.create(proto) }), '{"schema":3,"tabMeta":{}}');

  const inheritedId = Object.create({ id: 1 });
  inheritedId.rename = "x";
  assert.deepEqual(applyMeta({}, inheritedId), {}, "an inherited id is not an id either");
});

// 27. graveyard mark resolution does not lean on the caller's array order ----

test("tabsource: when two graveyard records carry the same letter, the NEWEST close wins", () => {
  // A letter can legitimately appear twice in the graveyard: mark 'r, close it,
  // mark 'r again, close that too. f4's store happens to be newest-first, but
  // resolution must not depend on a caller handing over an unfiltered,
  // unsorted slice of it.
  const older = { id: 11, url: "https://old.example/a", title: "Older", closedAt: 100, meta: { mark: "r" } };
  const newer = { id: 12, url: "https://new.example/b", title: "Newer", closedAt: 900, meta: { mark: "r" } };

  for (const order of [[newer, older], [older, newer]]) {
    const hit = markResolve({}, "r", { liveTabs: [], graveyard: order });
    assert.equal(hit.id, 12, "the most recently closed holder of the letter, whatever the array order");
    assert.equal(hit.record.title, "Newer");
  }

  const undated = [
    { id: 13, url: "https://x.example/x", title: "Undated", meta: { mark: "r" } },
    older,
  ];
  assert.equal(markResolve({}, "r", { liveTabs: [], graveyard: undated }).id, 11, "a dated record beats an undated one");
  assert.equal(
    markResolve({}, "r", { liveTabs: [], graveyard: [{ id: 14, url: "u", meta: { mark: "r" } }] }).id,
    14,
    "and an undated record still resolves when it is the only candidate",
  );
});

// 28. a row's workspace is the tab's own, never the panel's ------------------

test("tabsource: a workspace-less tab claims no workspace, and is hidden from no scope", () => {
  const tabs = [
    { id: 1, url: "https://a.example/a", title: "A", workspace: "main", lastAccessed: 200 },
    { id: 2, url: "https://b.example/b", title: "B", lastAccessed: 100 },
  ];
  const scoped = buildRows(tabs, {}, { scope: "workspace", workspace: "main", currentId: 1 });
  assert.deepEqual(keysOf(scoped).sort(), ["1", "2"], "a tab that belongs nowhere is not hidden everywhere");
  const orphan = scoped.find(r => r.key === "2");
  assert.equal(orphan.workspace, "", "but it does not get told it is in 'main'");

  const all = buildRows(tabs, {}, { scope: "all", workspace: "main", currentId: 1 });
  assert.ok(all.find(r => r.key === "1").text.includes("@main"));
  assert.equal(all.find(r => r.key === "2").text.includes("@"), false, "and no row names a workspace it is not in");
});

// 29. the searchable text is bounded --------------------------------------------

test("tabsource: a hostile title cannot make every keystroke scan a novel", () => {
  const long = "L".repeat(200_000);
  const rows = buildRows([{ id: 1, url: `https://x.example/${long}`, title: long }], {}, {});
  assert.ok(rows[0].text.length < 1000, "the searchable text is clipped, not the page's to unbound");
  assert.equal(rows[0].title, long, "while the real title is passed through verbatim for the renderer");
  assert.equal(rows[0].url.length, long.length + 18, "and so is the url");
});

// determinism ----------------------------------------------------------------

test("tabsource: buildRows and the serde pair read no clock and are byte-deterministic", () => {
  const meta = applyMeta(applyMeta({}, { id: 1, pin: 1 }), { id: 2, mark: "r" });
  const [a, b] = withoutClocks(() => [
    JSON.stringify(buildRows(TABS, meta, MAIN)) + serializeMeta(meta),
    JSON.stringify(buildRows(TABS, meta, MAIN)) + serializeMeta(meta),
  ]);
  assert.equal(a, b, "same inputs, byte-identical outputs, with Date and Math.random booby-trapped");
  assert.ok(a.includes('"key":"2"'));
});

test("tabsource: buildRows never mutates the tabs or metadata it is given", () => {
  const tabs = TABS.map(t => ({ ...t }));
  const meta = { 1: { pin: 1, tags: ["work"] } };
  const before = JSON.stringify({ tabs, meta });
  buildRows(tabs, meta, MAIN);
  buildRows(tabs, meta, { scope: "all", workspace: "main", currentId: 3 });
  assert.equal(JSON.stringify({ tabs, meta }), before, "the source data is read-only to the source builder");
  const rows = buildRows(tabs, meta, MAIN);
  rows[0].tags.push("mutated");
  assert.deepEqual(meta["1"].tags, ["work"], "a row's tags array is its own, not the metadata's");
});
