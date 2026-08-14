// r5 — Settings Panel, config + registry surface (SDD RED). Spec:
// overlay/specs/r5-settings-panel.md §2 "TOML surface", §4 tests 12–14.
//
// Three separate contracts live here, deliberately in one file because none of
// them is about aether-settings.sys.mjs's own logic:
//
//   12  the [privacy] sync guard — DEFAULTS.privacy and overlay/config/aether.toml
//       must stay one source of truth (the f3-config.test.mjs pattern every
//       prior spec extends). This one is GREEN today and is a drift guard.
//   13  the registry entries the panel is reached through: `settings` and
//       `describe`, both completable and both carrying a description, since
//       :describe renders exactly that string.
//   §2  the read-only sections — the keymap browser and the command list with
//       descriptions (":describe finding its home"), including which commands
//       are UNBOUND. Pure logic (REGISTRY keys minus keymap values), so it is
//       buildKeymapRows/buildCommandRows in the settings module, not glue.
//   14  the contract test that keeps "one panel primitive forever" honest — the
//       settings source drives r4's state machine unmodified, asserted with the
//       SAME op sequence against a flat source, so the claim is tested against
//       two consumers rather than one.
//
// Tests 12 and 13 import statically. Test 14 imports aether-settings.sys.mjs
// and r4's aether-panel.sys.mjs DYNAMICALLY on purpose: aether-settings does not
// exist yet and aether-panel is landing in the same pass, and a static import
// would take the two green guards down with them.
//
// r4 SURFACE USED BY TEST 14 (r4's shipped exports; if any of them is renamed
// this test reds on the NAME rather than on the behaviour — that is the
// coordination signal, not a settings bug):
//   createPanelState({rows, actions, keyBy?})   keyBy defaults to row.key ?? row.id
//   move / toggleMark / cycleAction / filter    the keyboard contract
//   replaceRows(state, rows) -> {state, droppedMarks}
//   selectedRow / selectedIndex / markedRows / currentAction   the readers
//
// r5 SUPPLIES, and r4 consumes: `row.key === row.path` (the stable identity, so
// the DEFAULT keyBy works and marks survive a reload), `row.section` (grouping),
// `row.text` (the filter haystack). The trailing path segment is `row.leaf`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";
import { REGISTRY, commandEntry, describeCommand, complete } from "../../chrome/JS/aether-palette.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

// ==================================================================== 12 ====

test("config: DEFAULTS.privacy carries the DoH surface r5 owns", () => {
  assert.ok(AetherConfig.DEFAULTS.privacy, "DEFAULTS has no [privacy] section");
  assert.equal(AetherConfig.DEFAULTS.privacy.doh, "fallback", "the shipped default is the middle mode");
  assert.equal(typeof AetherConfig.DEFAULTS.privacy.doh_url, "string");
  assert.match(
    AetherConfig.DEFAULTS.privacy.doh_url,
    /^https:\/\//,
    "a DoH resolver reached over plain http would defeat the point",
  );
});

test("config: the example aether.toml [privacy] section parses identically to DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.equal(parsed.ok, true, `the shipped example config does not parse (line ${parsed.errorLine})`);
  assert.ok(parsed.privacy, "the example aether.toml has no [privacy] section");
  assert.deepEqual(
    parsed.privacy,
    AetherConfig.DEFAULTS.privacy,
    "overlay/config/aether.toml [privacy] and DEFAULTS drifted apart",
  );
});

// ==================================================================== 13 ====

test("palette: settings and describe are registered, described, and reachable by completion", () => {
  for (const name of ["settings", "describe"]) {
    const entry = commandEntry(String(name).replace(/<char>$/, "").split(" ")[0]);
    assert.ok(entry, `${name} is missing from REGISTRY`);
    assert.equal(typeof entry.description, "string");
    assert.ok(entry.description.trim().length > 0, `${name} has no description`);
    assert.notEqual(entry.description, name, `${name}'s description must not fall back to its own name`);
    assert.ok(["read", "navigate", "mutate-local", "mutate-remote", "dangerous"].includes(entry.risk));
  }
  assert.equal(commandEntry("describe").usage, "describe [command]");
  assert.equal(commandEntry("describe").min, 0, "describe with no argument opens the panel on the command list");
  // OPEN, deliberately unasserted: spec §2 says both new commands are
  // "completable, agent-callable", but REGISTRY ships `settings` with
  // `agent: false` while `describe` carries no flag. The pair contradicts
  // itself as well as the spec, and aether-palette.sys.mjs is Foundation-owned
  // — pinning either answer here would freeze a decision that is not r5's to
  // make. It is reported as blocking instead.
});

test("palette: :describe renders the registry description, not the bare command name", () => {
  // :describe finding its home in the panel is the whole reason descriptions
  // are mandatory — a command whose description is its own name is invisible.
  assert.equal(describeCommand("settings"), commandEntry("settings").description);
  assert.notEqual(describeCommand("settings"), "settings");
  // and an unregistered name still renders something rather than vanishing
  assert.equal(describeCommand("not_a_command"), "not_a_command");
});

test("palette: completion finds settings and describe from their prefixes", () => {
  assert.ok(complete("set", REGISTRY, 8).includes("settings"), "typing ':set' must offer settings");
  assert.ok(complete("desc", REGISTRY, 8).includes("describe"));
  assert.ok(complete("settings", REGISTRY, 8).includes("settings"), "the full name completes to itself");
  assert.equal(complete("zzz", REGISTRY, 8).length, 0);
});

// ==================================================================== 14 ====
// The settings source drives r4's primitive unmodified.

async function panelModule() {
  return import("../../chrome/JS/aether-panel.sys.mjs");
}

async function settingsModule() {
  return import("../../chrome/JS/aether-settings.sys.mjs");
}

const LAYERS = {
  defaults: AetherConfig.DEFAULTS,
  dotfile: { options: { scroll_step: 200 }, theme: { source: "wal" }, ai: { enabled: true } },
  local: { options: { scroll_step: 300 }, style: { radius: "8px" } },
  prefs: { "aether.ai.enabled": false },
};

const ACTIONS = ["edit", "reset", "copy", "reveal"];

// Marked rows' POSITIONS in the visible list. Comparing raw keys across two
// sources would be comparing "options.statusbar_clock" against "tab-2" and could
// never match; what "one primitive" claims is that the same rows get marked in
// the same places.
function markedPositions(panel, state) {
  const marked = new Set(panel.markedRows(state));
  return state.visible.map((row, i) => (marked.has(row) ? i : -1)).filter(i => i >= 0);
}

function trace(panel, state) {
  return {
    index: panel.selectedIndex(state),
    action: ACTIONS.indexOf(panel.currentAction(state)),
    marked: markedPositions(panel, state),
  };
}

test("panel: the settings rows carry the identity, grouping and search fields r4 consumes", async () => {
  const { SCHEMA, buildRows } = await settingsModule();
  const rows = buildRows(SCHEMA, LAYERS);

  assert.equal(rows.length, 38);
  for (const row of rows) {
    assert.equal(row.key, row.path, `${row.path}: the panel identity is the path`);
    assert.equal(row.leaf, row.path.split(".").pop(), `${row.path}: leaf is the trailing segment`);
    assert.equal(row.section, row.path.split(".")[0], `${row.path}: rows group by section`);
    assert.equal(row.label, row.path, `${row.path}: the rendered label is the path`);
    assert.equal(row.text, `${row.path} ${row.description}`, `${row.path}: search covers name and copy`);
  }
  assert.equal(new Set(rows.map(r => r.key)).size, 38, "every row has a distinct identity");
});

test("panel: filtering the settings source narrows to exactly the matching rows, on text not just path", async () => {
  const { SCHEMA, buildRows } = await settingsModule();
  const panel = await panelModule();

  const rows = buildRows(SCHEMA, LAYERS);
  // No keyBy: the settings source is expected to work with the primitive's
  // default identity, which is what row.key === row.path buys.
  const state = panel.createPanelState({ rows, actions: ACTIONS });
  assert.equal(state.visible.length, 38, "an unfiltered settings panel shows every row");

  const narrowed = panel.filter(state, "theme");
  assert.deepEqual(
    narrowed.visible.map(r => r.path),
    ["theme.source", "theme.wal_json"],
    "the §5.2 search state — and only those two rows",
  );

  // Searching a word that appears ONLY in a description proves the filter reads
  // row.text. Without this, a source that omitted `text` entirely would still
  // pass the "theme" case, because r4 falls back to the row key.
  const target = rows.find(r => r.path === "ai.base_url");
  const paths = rows.map(r => r.path.toLowerCase()).join(" ");
  const word = target.description
    .toLowerCase()
    .split(/[^a-z]+/)
    .find(w => w.length >= 4 && !paths.includes(w));
  assert.ok(word, `ai.base_url's description ("${target.description}") must say something its path does not`);
  const byWord = panel.filter(state, word);
  assert.ok(
    byWord.visible.some(r => r.path === "ai.base_url"),
    `searching "${word}" must find the row whose description contains it`,
  );
  assert.ok(byWord.visible.length < 38, "…and must actually narrow the list");

  const restored = panel.filter(narrowed, "");
  assert.deepEqual(
    restored.visible.map(r => r.path),
    rows.map(r => r.path),
    "clearing the query restores every row in the original order",
  );
});

test("panel: the same op sequence drives the grouped settings source and a flat source identically", async () => {
  const { SCHEMA, buildRows } = await settingsModule();
  const panel = await panelModule();

  const settingsRows = buildRows(SCHEMA, LAYERS);
  // A flat source of the same size — r4's tab-panel shape: no sections, no
  // provenance, no inline editors. If the state machine treats grouping as
  // special, these two traces come apart.
  const flatRows = settingsRows.map((_, i) => ({ key: `tab-${i}`, text: `tab ${i}`, title: `Tab ${i}` }));

  const run = rows => {
    let s = panel.createPanelState({ rows, actions: ACTIONS });
    s = panel.move(s, 1);
    s = panel.move(s, 1);
    s = panel.toggleMark(s);
    s = panel.cycleAction(s);
    s = panel.move(s, 1);
    s = panel.toggleMark(s);
    s = panel.cycleAction(s);
    s = panel.move(s, -1);
    return s;
  };

  const a = run(settingsRows);
  const b = run(flatRows);

  // Absolute anchors first — without these, two identically-broken traces would
  // compare equal and the test would assert nothing at all.
  assert.equal(panel.selectedIndex(a), 2, "three downs and one up land on row 2");
  assert.equal(panel.currentAction(a), "copy", "two Tab presses land on the third action");
  assert.deepEqual(markedPositions(panel, a), [2, 3], "the two marked rows are rows 2 and 3");
  assert.deepEqual(
    panel.markedRows(a).map(r => r.path),
    ["options.statusbar_clock", "options.pending_timeout_ms"],
    "marks resolve to schema paths, which is what a settings mark has to mean",
  );
  assert.deepEqual(markedPositions(panel, b), [2, 3], "and to the same positions in the flat source");

  assert.deepEqual(trace(panel, a), trace(panel, b), "one primitive, two structurally different sources");
});

// ============================================================== §2 read-only
// "Read-only sections: the keymap (browsable, searchable, showing which
// commands are unbound — editing keys stays a TOML act, per r3's non-goal) and
// the command list with descriptions, which is `:describe` finding its home."
//
// Both are pure derivations of the registry and the keymap table, so both live
// in the settings module: `REGISTRY keys minus keymap values` is logic, and
// logic in glue is logic without a test.

test("panel: the keymap browses as rows — every binding, with its command's description", async () => {
  const { buildKeymapRows } = await settingsModule();
  const keymap = AetherConfig.DEFAULTS.keymap;
  const rows = buildKeymapRows(keymap, REGISTRY);

  const expected = Object.keys(keymap.normal).length + Object.keys(keymap.reserved).length;
  assert.equal(rows.length, expected, "one row per shipped binding, both modes");

  const palette = rows.find(r => r.sequence === ":");
  assert.ok(palette, "a punctuation binding is a row like any other");
  assert.equal(palette.command, "palette");
  assert.equal(palette.mode, "normal");
  assert.equal(palette.known, true);
  assert.equal(palette.description, describeCommand("palette"), "one description, three surfaces");
  assert.equal(palette.readOnly, true, "editing keys stays a TOML act");

  for (const row of rows) {
    assert.equal(row.section, "keymap");
    assert.equal(row.key, `keymap.${row.mode}.${row.sequence}`, "a stable identity r4 can key by");
    assert.ok(row.text.includes(row.sequence) && row.text.includes(row.command), "searchable by both");
  }
  assert.equal(new Set(rows.map(r => r.key)).size, rows.length, "identities are distinct");
  assert.deepEqual(
    rows.map(r => r.key),
    buildKeymapRows(keymap, REGISTRY).map(r => r.key),
    "the order is deterministic, not iteration order",
  );

  // A typo'd or not-yet-loaded binding stays VISIBLE — that is the point of a
  // browser — while an unusable one is dropped on its own.
  const odd = buildKeymapRows(
    { normal: { q: "no_such_command", w: 42, e: "", r: "mark_set<char>", t: "tab_pin_goto 1" } },
    REGISTRY,
  );
  assert.deepEqual(odd.map(r => r.sequence), ["q", "r", "t"], "unusable bindings drop individually");
  assert.equal(odd[0].known, false, "an unknown command is shown, not hidden");
  assert.equal(odd[0].description, "", "…with no invented description");
  assert.equal(odd[1].awaitsArg, true, "a binding is read exactly as the engine reads it");
  assert.equal(odd[2].command, "tab_pin_goto", "…arguments included");
});

test("panel: the command list is every registry command, marked bound or unbound", async () => {
  const { buildCommandRows } = await settingsModule();
  const keymap = AetherConfig.DEFAULTS.keymap;
  const rows = buildCommandRows(REGISTRY, keymap);

  assert.equal(rows.length, Object.keys(REGISTRY).length, "one row per command, none hidden");
  assert.deepEqual(rows.map(r => r.name), [...rows.map(r => r.name)].sort(), "a browsable list is sorted");

  const byName = new Map(rows.map(r => [r.name, r]));
  assert.equal(byName.get("palette").description, describeCommand("palette"));
  assert.equal(byName.get("settings").description, commandEntry("settings").description);
  assert.equal(byName.get("describe").usage, "describe [command]", "usage rides along for :describe");

  // "showing which commands are unbound" — the whole reason this is computed
  // and not just listed.
  assert.equal(byName.get("scroll_down").bound, true, "j reaches it");
  assert.deepEqual([...byName.get("scroll_down").bindings], [{ mode: "normal", sequence: "j" }]);
  // Derived on both sides on purpose: binding a new chord is a normal change
  // and must not red this test, but "unbound" silently meaning nothing must.
  const fromKeymap = new Set(
    [...Object.values(keymap.normal), ...Object.values(keymap.reserved)]
      // parseBinding's normalization, both halves: `mark_set<char>` and
      // `tab_pin_goto 1` are bindings of mark_set and tab_pin_goto.
      .map(v => String(v).replace(/<char>$/, "").split(" ")[0])
      .filter(name => Object.hasOwn(REGISTRY, name)),
  );
  assert.deepEqual(
    rows.filter(r => r.bound).map(r => r.name).sort(),
    [...fromKeymap].sort(),
    "bound is exactly REGISTRY ∩ keymap",
  );
  assert.deepEqual(
    rows.filter(r => !r.bound).map(r => r.name).sort(),
    Object.keys(REGISTRY).filter(n => !fromKeymap.has(n)).sort(),
    "unbound is exactly the rest — the answer to 'what can this browser do that I have no key for'",
  );
  assert.ok(rows.some(r => !r.bound), "at least one command is reachable only by name");

  // tab_close is bound twice (x and C-w); both reach the one row.
  assert.deepEqual(
    [...byName.get("tab_close").bindings].map(b => `${b.mode}:${b.sequence}`).sort(),
    ["normal:x", "reserved:C-w"],
  );
  // With no keymap at all, every command reads unbound rather than throwing.
  assert.equal(buildCommandRows(REGISTRY).every(r => r.bound === false), true);
});

test("panel: the read-only sources drive r4's primitive, and tolerate a hostile registry", async () => {
  const { buildKeymapRows, buildCommandRows } = await settingsModule();
  const panel = await panelModule();
  const keymap = AetherConfig.DEFAULTS.keymap;

  // Same primitive, same default keyBy, no special casing for a read-only source.
  const rows = [...buildCommandRows(REGISTRY, keymap), ...buildKeymapRows(keymap, REGISTRY)];
  let state = panel.createPanelState({ rows, actions: ["copy"] });
  assert.equal(state.visible.length, rows.length);
  state = panel.filter(state, "scroll_down");
  assert.ok(state.visible.length >= 2, "the command row and its bindings both match");
  assert.ok(state.visible.every(r => r.text.includes("scroll_down")));

  // A registry is mod-extensible, i.e. untrusted: a getter must never run
  // during a render pass, and a prototype key must stay inert.
  const hostile = JSON.parse('{"__proto__":{"description":"pwned"},"ok":{"description":"fine"}}');
  let ran = 0;
  Object.defineProperty(hostile, "trap", {
    enumerable: true,
    get() {
      ran++;
      return { description: "x" };
    },
  });
  let out;
  assert.doesNotThrow(() => {
    out = buildCommandRows(hostile, { normal: { z: "ok" } });
  });
  assert.deepEqual(out.map(r => r.name), ["ok"], "a getter-backed entry is not data");
  assert.equal(ran, 0, "…and is never invoked");
  assert.equal(out[0].bound, true);
  assert.equal({}.description, undefined, "no prototype pollution");

  for (const bad of [null, undefined, 42, "registry", [], () => {}]) {
    assert.deepEqual(buildCommandRows(bad, keymap), [], `buildCommandRows(${String(bad)})`);
    assert.deepEqual(buildKeymapRows(bad, REGISTRY), [], `buildKeymapRows(${String(bad)})`);
    assert.doesNotThrow(() => buildKeymapRows(keymap, bad), "a missing registry means no descriptions");
  }
  assert.equal(buildKeymapRows(keymap, null).every(r => r.known === false), true);
});

test("panel: a config reload keeps the selection and the marks on the same paths", async () => {
  const { SCHEMA, buildRows } = await settingsModule();
  const panel = await panelModule();

  const rows = buildRows(SCHEMA, LAYERS);
  let state = panel.createPanelState({ rows, actions: ACTIONS });
  state = panel.move(state, 5);
  state = panel.toggleMark(state);
  const selectedPath = panel.selectedRow(state).path;
  const markedPaths = panel.markedRows(state).map(r => r.path);
  assert.equal(markedPaths.length, 1);

  // A reload changes VALUES, never the row set — row identity is the path,
  // which is exactly why the key is the path and not an index.
  const reloaded = buildRows(SCHEMA, { ...LAYERS, local: {} });
  const { state: next, droppedMarks } = panel.replaceRows(state, reloaded);

  assert.equal(droppedMarks, 0, "no mark may be dropped by a reload that removes no row");
  assert.equal(panel.selectedRow(next).path, selectedPath, "the cursor stays on the same setting");
  assert.deepEqual(panel.markedRows(next).map(r => r.path), markedPaths, "marks stay on the same paths");
  assert.notStrictEqual(panel.selectedRow(next), panel.selectedRow(state), "the rows really were replaced");
  assert.equal(
    next.visible.find(r => r.path === "options.scroll_step").value,
    200,
    "the row's value did follow the reload — the local layer is gone",
  );
  assert.equal(
    next.visible.find(r => r.path === "options.scroll_step").provenance,
    "dotfile",
    "…and its provenance moved down a layer with it",
  );
});
