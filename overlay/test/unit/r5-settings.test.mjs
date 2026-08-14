// r5 — Settings panel: behavioral tests for the pure settings module (SDD RED).
// Spec: overlay/specs/r5-settings-panel.md §2, §3, §4 (tests 1–11) plus the
// guards the analyst's contract added (8b/8c/8d, the identical-layer provenance
// case, the non-vacuous round trip). Written before the implementation exists;
// aether-settings.sys.mjs follows these.
//
// Contract pinned by these tests — nothing here touches Services, IOUtils,
// PathUtils, the DOM, or a clock; every export is a function of its arguments:
//
//   OPEN_TABLES  ["keymap", "theme.colors"] — the two DEFAULTS subtrees the
//     schema deliberately does not enumerate (keys are a TOML act; no colour
//     picker). Exactly two, asserted, so a third cannot be added quietly.
//   SECTIONS     the 11 top-level sections, in DEFAULTS order.
//   ERRORS       {UNKNOWN_PATH, PREF_OWNED, UNSAFE_VALUE, INVALID_VALUE}.
//   TRR_MODES    {off: 0, fallback: 2, strict: 3}.
//   PROVENANCE   ["default", "dotfile", "local", "pref"].
//   SCHEMA       38 frozen entries, HAND-WRITTEN (not derived from DEFAULTS —
//     8b would be the only real assertion if it were), one per DEFAULTS leaf
//     outside the open tables: {path, section, key, type, enum?, default,
//     description, validator, pref?, restart?}.
//   schemaEntry(path)                    -> entry | null
//   validateValue(entry, value)          -> {ok:true} | {ok:false, error} (the WRITE gate)
//   buildRows(schema, layers)            -> rows with resolved value+provenance
//   setOverride(localTable, path, value[, schema])
//                                        -> {ok:true, table} | {ok:false, error, path}
//   resetOverride(localTable, path)      -> {ok:true, table} (never an error)
//   emitLocalToml(table)                 -> LOCAL_CONFIG_HEADER + sorted TOML
//   tomlLine(path, value)                -> the one line, or null (copy as TOML)
//   buildKeymapRows / buildCommandRows   -> §2's read-only sections (r5-config)
//   layersFromConfig(config, prefs)      -> {defaults, dotfile, local, prefs}
//   dohPrefs(privacyTable)               -> {"network.trr.mode", "network.trr.uri"}
//
// Three properties this file pins that the first pass got wrong, each with the
// value that proved it:
//   * a row's `valid` is the LOADER's rule and its `representable` is the
//     serialiser's — one boolean for both reported `default = "main "` (which
//     the loader uses) as invalid;
//   * every [style] validator IS r2's function, not a copy of its regex — the
//     copy admitted `radius = "-2px"`, which r2 renders as `2px`;
//   * a row's value is a frozen copy — it aliased AetherConfig.DEFAULTS'
//     unfrozen widget list.
//
// Two decisions these tests pin, because the spec left them ambiguous:
//   * `privacy.doh` / `privacy.doh_url` are FILE-owned (writeTarget "file").
//     `ai.enabled` is the only pref-owned row in v1.2.0. Test 9 asserts the
//     pref-owned set is exactly ["ai.enabled"] so a later pass cannot quietly
//     make DoH pref-owned and start lying in the provenance column.
//   * A row's panel identity is `key === path`; the trailing path segment is
//     exposed as `leaf`. (SCHEMA entries keep `key` as the trailing segment.)
//     This makes the settings source drive r4's primitive with its DEFAULT
//     keyBy, which is what "one primitive forever" has to mean.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import * as Settings from "../../chrome/JS/aether-settings.sys.mjs";
import {
  OPEN_TABLES,
  SECTIONS,
  ERRORS,
  TRR_MODES,
  PROVENANCE,
  SCHEMA,
  schemaEntry,
  validateValue,
  buildRows,
  setOverride,
  resetOverride,
  emitLocalToml,
  tomlLine,
  layersFromConfig,
  dohPrefs,
} from "../../chrome/JS/aether-settings.sys.mjs";

import { parseToml, deepMerge, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";
import { LOCAL_CONFIG_HEADER } from "../../chrome/JS/aether-strings.sys.mjs";
// The two loader-side rule owners. Imported STATICALLY on purpose: the module
// under test already imports both, so a break in either is already a break here
// — and these tests exist to make that break visible as a sentence rather than
// as a value the panel writes and the loader throws away.
import { VALIDATORS as STYLE_VALIDATORS, buildStyle } from "../../chrome/JS/aether-style.sys.mjs";
import { validateBaseUrl } from "../../chrome/JS/aether-ai-client.sys.mjs";

const DEFAULTS = AetherConfig.DEFAULTS;
const HERE = dirname(fileURLToPath(import.meta.url));
const MODULE_PATH = join(HERE, "..", "..", "chrome", "JS", "aether-settings.sys.mjs");

// ---------------------------------------------------------------- helpers

function walkLeaves(obj, prefix = "") {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) out.push(...walkLeaves(v, path));
    else out.push(path);
  }
  return out;
}

function leafAt(obj, path) {
  let cur = obj;
  for (const seg of String(path).split(".")) {
    if (!cur || typeof cur !== "object" || !Object.hasOwn(cur, seg)) return undefined;
    cur = cur[seg];
  }
  return cur;
}

function byPath(rows) {
  const map = new Map();
  for (const row of rows) map.set(row.path, row);
  return map;
}

function isOpen(path) {
  return OPEN_TABLES.some(t => path === t || path.startsWith(`${t}.`));
}

// An own "__proto__" key can only be planted through JSON.parse.
function withOwnProto(json) {
  return JSON.parse(json);
}

// Assertion messages must survive the same hostile values the module does — a
// null-prototype object has no toString, and a cyclic one has no JSON.
function show(v) {
  try {
    if (typeof v === "symbol") return "Symbol()";
    return JSON.stringify(v) ?? String(v);
  } catch {
    return "«unprintable»";
  }
}

// The shared four-layer fixture. `panels.scope` is present in BOTH files with
// the IDENTICAL value — the case that separates "provenance is the top layer
// that HAS the key" from "provenance is the top layer whose value differs".
const L = () => ({
  defaults: DEFAULTS,
  dotfile: {
    options: { scroll_step: 200 },
    theme: { source: "wal" },
    ai: { enabled: true },
    panels: { scope: "all" },
  },
  local: {
    options: { scroll_step: 300 },
    style: { radius: "8px" },
    panels: { scope: "all" },
  },
  prefs: { "aether.ai.enabled": false },
});

// 1. precedence × provenance, all four layers ---------------------------------

test("settings: buildRows resolves default < dotfile < local < pref, tagging each with its true source", () => {
  const rows = byPath(buildRows(SCHEMA, L()));

  assert.equal(rows.get("options.palette_max_items").value, 8);
  assert.equal(rows.get("options.palette_max_items").provenance, "default", "in no file → default");

  assert.equal(rows.get("theme.source").value, "wal");
  assert.equal(rows.get("theme.source").provenance, "dotfile", "only in aether.toml → dotfile");

  assert.equal(rows.get("style.radius").value, "8px");
  assert.equal(rows.get("style.radius").provenance, "local", "only in aether.local.toml → local");

  assert.equal(rows.get("ai.enabled").value, false);
  assert.equal(rows.get("ai.enabled").provenance, "pref", "the runtime pref outranks both files");

  assert.equal(rows.get("options.scroll_step").value, 300);
  assert.equal(rows.get("options.scroll_step").provenance, "local", "local shadows dotfile");

  for (const row of rows.values()) {
    assert.ok(PROVENANCE.includes(row.provenance), `${row.path}: provenance must be a known tag`);
  }
});

test("settings: a key present in dotfile and local with the SAME value is still tagged 'local'", () => {
  // Provenance is "the top layer that has the key", never "the top layer whose
  // value differs from the merge" — the latter passes every other case in this
  // file and then tells the user to edit the wrong file.
  const rows = byPath(buildRows(SCHEMA, L()));
  const scope = rows.get("panels.scope");
  assert.equal(scope.value, "all");
  assert.equal(scope.provenance, "local", "the override that is actually in force is the local one");
});

test("settings: an absent pref falls through to the file layer; an undefined pref value is not a pref", () => {
  const noPrefs = buildRows(SCHEMA, { ...L(), prefs: {} });
  const ai = byPath(noPrefs).get("ai.enabled");
  assert.equal(ai.value, true, "with no pref set the dotfile value is live");
  assert.equal(ai.provenance, "dotfile");

  const undef = buildRows(SCHEMA, { ...L(), prefs: { "aether.ai.enabled": undefined } });
  const ai2 = byPath(undef).get("ai.enabled");
  assert.equal(ai2.value, true, "a pref whose value is undefined is not a set pref");
  assert.equal(ai2.provenance, "dotfile");
});

test("settings: a layer value that fails its validator keeps its true provenance and is flagged invalid", () => {
  // buildRows never substitutes: lying about where a bad value came from is
  // exactly what makes a layered config incomprehensible.
  const rows = byPath(
    buildRows(SCHEMA, {
      defaults: DEFAULTS,
      dotfile: {},
      local: { style: { radius: "8pt" } },
      prefs: {},
    }),
  );
  const radius = rows.get("style.radius");
  assert.equal(radius.value, "8pt", "the live value is shown as it is");
  assert.equal(radius.provenance, "local");
  assert.equal(radius.valid, false, "…and flagged, not silently replaced by the default");

  const ok = byPath(buildRows(SCHEMA, L())).get("style.radius");
  assert.equal(ok.valid, true, "a good value is not flagged");
});

test("settings: buildRows mutates neither the schema nor the layers, and tolerates hostile layer tables", () => {
  const layers = L();
  const snapshot = JSON.stringify(layers);
  const schemaBefore = SCHEMA.map(e => e.path).join("|");

  const hostile = withOwnProto(
    '{"options":{"__proto__":{"polluted":1},"scroll_step":150},"__proto__":{"boom":1}}',
  );
  let rows;
  assert.doesNotThrow(() => {
    rows = buildRows(SCHEMA, { defaults: DEFAULTS, dotfile: hostile, local: null, prefs: 42 });
  }, "an adversarial dotfile table must not throw");
  assert.equal(rows.length, 38);
  assert.equal(byPath(rows).get("options.scroll_step").value, 150, "the honest sibling still resolves");
  assert.equal({}.polluted, undefined, "no prototype pollution from a layer walk");
  assert.equal({}.boom, undefined);

  buildRows(SCHEMA, layers);
  assert.equal(JSON.stringify(layers), snapshot, "layers untouched");
  assert.equal(SCHEMA.map(e => e.path).join("|"), schemaBefore, "schema untouched");
  assert.notStrictEqual(buildRows(SCHEMA, layers), buildRows(SCHEMA, layers), "a fresh array each call");
});

test("settings: 'valid' is the loader's rule and 'representable' is the file's — never one boolean for both", () => {
  // A row that reads `invalid` for a value the browser is happily using is the
  // same unanswerable failure ("is the panel broken or is the setting?") that
  // the pref-provenance rule exists to prevent, so the two questions stay two.
  const rows = byPath(
    buildRows(SCHEMA, {
      defaults: DEFAULTS,
      local: {
        workspaces: { default: "main " }, // NAME_RE accepts it; the file cannot carry it
        ai: { base_url: "http://127.0.0.1:11434/v1?x=1" }, // f7 accepts it; so must the row
        style: { radius: "8pt" }, // r2 rejects it: genuinely invalid
        statusbar: { widgets: ["mode", "ur,l"] }, // parseValue would split it
      },
    }),
  );

  const name = rows.get("workspaces.default");
  assert.equal(name.value, "main ");
  assert.equal(name.valid, true, "the loader reads and uses this value");
  assert.equal(name.representable, false, "…and the local file could not carry it back");

  const url = rows.get("ai.base_url");
  assert.equal(url.valid, true, "a working gateway URL is not 'invalid'");
  assert.equal(url.representable, true);

  const radius = rows.get("style.radius");
  assert.equal(radius.valid, false, "a value r2 drops is invalid, full stop");

  const widgets = rows.get("statusbar.widgets");
  assert.equal(widgets.representable, false, "a comma inside an element cannot come back as one element");

  // Every row, both properties, computed from the entry and the value only.
  for (const row of rows.values()) {
    const entry = schemaEntry(row.path);
    assert.equal(row.valid, entry.validator(row.value) === true, `${row.path}: valid is the entry's rule`);
    assert.equal(
      row.representable && row.valid && row.writeTarget === "file",
      setOverride({}, row.path, row.value).ok,
      `${row.path}: the two flags together are exactly "the panel could write this"`,
    );
  }
});

test("settings: a row's value is a copy — a consumer cannot reach back into DEFAULTS or a layer", () => {
  const dotfile = { statusbar: { widgets: ["mode", "url"] } };
  const row = byPath(buildRows(SCHEMA, { defaults: DEFAULTS, dotfile })).get("statusbar.widgets");
  assert.deepEqual(row.value, ["mode", "url"]);
  assert.notStrictEqual(row.value, dotfile.statusbar.widgets, "the row does not alias the layer");
  assert.ok(Object.isFrozen(row.value), "a row is read-only data, like entry.default");
  assert.throws(() => row.value.push("zzz"), "a consumer that mutates a row fails on its own copy");
  assert.deepEqual(dotfile.statusbar.widgets, ["mode", "url"], "the layer is untouched");

  // …and the same through the defaults layer, which is the shared, unfrozen
  // AetherConfig.DEFAULTS: one panel consumer that sorts a list must not be able
  // to reorder the statusbar for the whole process.
  const before = [...DEFAULTS.statusbar.widgets];
  const fromDefaults = byPath(buildRows(SCHEMA, layersFromConfig(null))).get("statusbar.widgets");
  assert.notStrictEqual(fromDefaults.value, DEFAULTS.statusbar.widgets, "…nor the shipped defaults");
  assert.throws(() => fromDefaults.value.sort());
  assert.deepEqual(DEFAULTS.statusbar.widgets, before, "DEFAULTS survived");
  assert.deepEqual(fromDefaults.value, before, "and the row still shows the default");
});

test("settings: rows carry writeTarget, restart and the pref name from the schema, not from the value", () => {
  const rows = byPath(buildRows(SCHEMA, L()));
  assert.equal(rows.get("ai.enabled").writeTarget, "pref");
  assert.equal(rows.get("ai.enabled").pref, "aether.ai.enabled");
  assert.equal(rows.get("privacy.doh").writeTarget, "file", "DoH is TOML-authoritative");
  assert.equal(rows.get("privacy.doh_url").writeTarget, "file");
  assert.equal(rows.get("style.radius").writeTarget, "file");

  assert.equal(rows.get("graveyard.cap").restart, true, "ring size is fixed at startup");
  assert.equal(rows.get("workspaces.default").restart, true);
  assert.equal(rows.get("style.radius").restart, false, "restart is a boolean on every row");
  assert.equal(
    [...rows.values()].filter(r => r.restart).map(r => r.path).sort().join(","),
    "graveyard.cap,workspaces.default",
  );
});

// 2. schema-driven enumeration, both directions -------------------------------

test("settings: with no files at all, every schema row still exists tagged 'default' at its default value", () => {
  const rows = buildRows(SCHEMA, { defaults: DEFAULTS, dotfile: {}, local: {}, prefs: {} });
  assert.equal(rows.length, 38, "the panel enumerates the schema, not the files");
  for (const row of rows) {
    assert.equal(row.provenance, "default", `${row.path} came from no file`);
    assert.deepEqual(row.value, row.default, `${row.path} shows its default`);
  }
});

test("settings: keys the files invent — and the open tables — never become rows", () => {
  const rows = buildRows(SCHEMA, {
    defaults: DEFAULTS,
    dotfile: {
      options: { bogus: 1 },
      keymap: { normal: { z: "hints" } },
      theme: { colors: { bg: "#000000" } },
    },
    local: {},
    prefs: {},
  });
  assert.equal(rows.length, 38, "a file cannot add a row");
  assert.equal(
    rows.some(r => r.path === "options.bogus" || isOpen(r.path)),
    false,
    "no invented key, no keybinding, no colour slot",
  );
});

test("settings: rows come back in SCHEMA order with sections contiguous", () => {
  const rows = buildRows(SCHEMA, L());
  assert.deepEqual(rows.map(r => r.path), SCHEMA.map(e => e.path), "row order is schema order");
  const seen = [];
  for (const row of rows) {
    if (seen[seen.length - 1] !== row.section) {
      assert.equal(seen.includes(row.section), false, `${row.section} appears in two runs`);
      seen.push(row.section);
    }
  }
  assert.deepEqual(seen, [...SECTIONS], "sections appear once each, in SECTIONS order");
});

test("settings: buildRows on garbage arguments returns an empty array rather than throwing", () => {
  for (const bad of [null, 42, "schema", {}, [], () => {}]) {
    let out;
    assert.doesNotThrow(() => {
      out = buildRows(bad, L());
    });
    assert.ok(Array.isArray(out), "always an array");
    assert.equal(out.length, 0, "a non-schema is never quietly replaced by the real one");
  }
  // Rows built from entries that are not entries are dropped one by one, so a
  // half-corrupt schema still renders the settings it can.
  const partial = buildRows([SCHEMA[0], null, "junk", { path: "options.bogus" }, SCHEMA[1]], L());
  assert.deepEqual(partial.map(r => r.path), [SCHEMA[0].path, SCHEMA[1].path]);

  assert.equal(buildRows(undefined, {}).length, 38, "an omitted schema is the real one");
  assert.equal(buildRows(SCHEMA, undefined).length, 38, "absent layers → everything at its default");
  assert.equal(
    buildRows(SCHEMA, undefined).every(r => r.provenance === "default"),
    true,
  );
});

// 3. setOverride purity, twice ------------------------------------------------

test("settings: setOverride returns a new table, never mutates the input, and two overrides both survive", () => {
  const t0 = {};
  const snap0 = structuredClone(t0);
  const r1 = setOverride(t0, "style.radius", "4px");
  assert.equal(r1.ok, true);
  assert.deepEqual(t0, snap0, "the input table is untouched");
  assert.notStrictEqual(r1.table, t0, "a new table comes back");
  assert.equal(r1.table.style.radius, "4px");

  const snap1 = structuredClone(r1.table);
  const r2 = setOverride(r1.table, "options.scroll_step", 200);
  assert.equal(r2.ok, true);
  assert.deepEqual(r1.table, snap1, "the first result is untouched by the second write");
  assert.equal(r2.table.style.radius, "4px", "the earlier override survives");
  assert.equal(r2.table.options.scroll_step, 200, "the new one lands");

  // untouched sections must not be shared: a later edit of the new table must
  // not reach back into the state the panel is still holding.
  assert.notStrictEqual(r2.table.style, r1.table.style, "no shared mutable section");
  r2.table.style.radius = "x";
  assert.equal(r1.table.style.radius, "4px", "mutating the new table cannot touch the old one");
});

test("settings: setOverride copies array values so the caller's array cannot leak into the table", () => {
  const widgets = ["mode", "url"];
  const r = setOverride({}, "statusbar.widgets", widgets);
  assert.equal(r.ok, true);
  assert.deepEqual(r.table.statusbar.widgets, ["mode", "url"]);
  assert.notStrictEqual(r.table.statusbar.widgets, widgets, "the table holds its own array");
  widgets.push("clock");
  assert.deepEqual(r.table.statusbar.widgets, ["mode", "url"], "later mutation cannot reach the table");
});

test("settings: setOverride treats a non-object local table as empty instead of throwing", () => {
  for (const bad of [undefined, null, 42, "toml", [], () => {}]) {
    let r;
    assert.doesNotThrow(() => {
      r = setOverride(bad, "style.radius", "4px");
    });
    assert.equal(r.ok, true);
    assert.equal(r.table.style.radius, "4px");
    assert.equal(Object.getPrototypeOf(r.table), Object.prototype, "a plain table comes back");
  }
});

// 4. resetOverride -------------------------------------------------------------

test("settings: resetOverride removes exactly one key and leaves its siblings alone", () => {
  const t = { options: { scroll_step: 200, hint_chars: "asdf" }, style: { radius: "4px" } };
  const snap = structuredClone(t);

  const r = resetOverride(t, "options.scroll_step");
  assert.equal(r.ok, true);
  assert.deepEqual(t, snap, "the input table is untouched");
  assert.equal(Object.hasOwn(r.table.options, "scroll_step"), false, "the key is gone");
  assert.equal(r.table.options.hint_chars, "asdf", "its sibling stays");
  assert.equal(r.table.style.radius, "4px", "the other section stays");
});

test("settings: resetting a section's last key removes the section, and the last key empties to {}", () => {
  let table = { options: { scroll_step: 200, hint_chars: "asdf" }, style: { radius: "4px" } };
  table = resetOverride(table, "options.scroll_step").table;
  table = resetOverride(table, "options.hint_chars").table;
  assert.equal(Object.hasOwn(table, "options"), false, "no orphan [options] header is left behind");

  table = resetOverride(table, "style.radius").table;
  assert.deepEqual(table, {}, "a fully-reset table is exactly {}");
  assert.deepEqual(parseToml(emitLocalToml(table)), {}, "…and emits a file that parses to nothing");
});

test("settings: resetOverride never errors — unknown, absent and hostile paths are silent no-ops", () => {
  const t = { style: { radius: "4px" } };
  const snap = structuredClone(t);
  for (const path of [
    "options.scroll_step", // never present
    "keymap.normal.j", // an open table
    "nonsense.key",
    "__proto__.x",
    "constructor.prototype.x",
    "",
    null,
    undefined,
    42,
    {},
  ]) {
    let r;
    assert.doesNotThrow(() => {
      r = resetOverride(t, path);
    }, `resetOverride must tolerate ${JSON.stringify(String(path))}`);
    assert.equal(r.ok, true, "reset has no error shape");
    assert.deepEqual(r.table, snap, "nothing was removed");
    assert.notStrictEqual(r.table, t, "still a fresh table");
  }
  assert.deepEqual(t, snap, "the input survived every call");
  assert.equal({}.x, undefined, "no prototype pollution");
});

// 5. exact round trip ----------------------------------------------------------

test("settings: emitLocalToml output parses back to the identical table, every type and every awkward literal", () => {
  const T = {
    options: { scroll_step: 200, which_key_ms: -1, hint_chars: "qwer", config_watch: false },
    statusbar: { widgets: ["mode", "url", "clock"] },
    style: {
      radius: "4px",
      blur: "0",
      opacity: 96,
      motion: false,
      motion_ease: "cubic-bezier(0.22, 1, 0.36, 1)",
      font: "JetBrains Mono",
    },
    theme: { source: "toml" },
    privacy: { doh: "strict", doh_url: "https://dns.quad9.net/dns-query" },
    ai: { model: "llama3.2" },
  };
  const text = emitLocalToml(T);
  assert.ok(text.startsWith(LOCAL_CONFIG_HEADER), "the file says what it is and how to undo it");
  assert.ok(text.endsWith("\n"), "the file ends with a newline");
  assert.ok(text.split("\n").length > 20, "the round trip is over a real file, not an empty one");

  const back = parseToml(text);
  assert.equal(back.ok, true, "the emitted file has no broken line");
  assert.deepEqual(back, T, "what the panel wrote is what the loader reads");
  // "0" must survive as a string (the parser's int rule runs on the raw text,
  // so an unquoted 0 would come back as the number 0 and change what CSS sees).
  assert.equal(typeof back.style.blur, "string");
  assert.equal(back.options.which_key_ms, -1, "a negative int round-trips as a number");
  assert.deepEqual(parseToml(emitLocalToml(back)), T, "emitting the parse is idempotent");
});

test("settings: emitLocalToml sorts sections and keys, so the same table always emits the same bytes", () => {
  const a = {};
  a.style = { radius: "4px", blur: "0" };
  a.ai = { model: "llama3.2" };
  const b = {};
  b.ai = { model: "llama3.2" };
  b.style = { blur: "0", radius: "4px" };

  const textA = emitLocalToml(a);
  assert.equal(textA, emitLocalToml(b), "insertion order cannot change the file");
  assert.equal(textA, emitLocalToml(a), "and the same table emits the same bytes every call");
  assert.ok(textA.indexOf("[ai]") < textA.indexOf("[style]"), "sections are lexicographic");
  assert.ok(textA.indexOf("blur") < textA.indexOf("radius"), "keys are lexicographic");
});

test("settings: emitLocalToml on an empty or garbage table emits the header and nothing else", () => {
  for (const bad of [{}, null, undefined, 42, "x", [], () => {}]) {
    let text;
    assert.doesNotThrow(() => {
      text = emitLocalToml(bad);
    });
    assert.equal(typeof text, "string");
    assert.ok(text.startsWith(LOCAL_CONFIG_HEADER));
    assert.deepEqual(parseToml(text), {}, "no section, no key, no half-line");
    assert.equal(parseToml(text).ok, true);
  }
});

test("settings: emitLocalToml drops an unrepresentable entry whole and never emits a broken line", () => {
  const table = withOwnProto(
    '{"ai":{"model":"lla\\"ma","ok_key":"fine","__proto__":{"x":1}},' +
      '"bad.section":{"k":"v"},"style":{"bad\\"key":"v","radius":"4px"}}',
  );
  table.ai.nan = NaN;
  table.ai.fn = () => {};
  table.ai.nothing = null;
  table.ai.float = 1.5;
  table.ai.huge = 1e21; // an integer String() writes as "1e+21"
  table.ai.negzero = -0; // …and one it writes as "0"
  table.style.newline = "a\nb";
  table["bad#section"] = { k: "v" };
  table.style["k=v"] = "x";

  let text;
  assert.doesNotThrow(() => {
    text = emitLocalToml(table);
  });
  const back = parseToml(text);
  assert.equal(back.ok, true, "every emitted line is a line the shipped parser accepts");
  assert.deepEqual(back, { ai: { ok_key: "fine" }, style: { radius: "4px" } }, "bad entries dropped whole");
  assert.equal(text.includes("lla"), false, "no partial line for the dropped value");
  assert.equal(text.includes("bad"), false, "a section header the parser could not reproduce is not written");
  assert.equal(text.includes("1e+21"), false, "an integer that stringifies in exponent form is not a number");
  assert.equal({}.x, undefined, "no prototype pollution through a hostile table");
});

test("settings: a key the emitter cannot reproduce is dropped; one it can is QUOTED, never dropped", () => {
  // The local file is a full config layer — the loader deep-merges it like any
  // source — so a key a user put there by hand has to survive the next panel
  // write. The shipped keymap's own `":" = "palette"` is the case: silently
  // deleting it is data loss dressed up as safety.
  const hand = [
    "[keymap.normal]",
    '":" = "palette"',
    '"?" = "which_key"',
    '"/" = "find"',
    '";" = "repeat"',
    '" g " = "spaced"',
    '"#" = "hash"',
    '"[" = "bracket"',
    '"\\\\" = "backslash"',
    "z = \"hints\"",
    "",
    "[style]",
    'radius = "4px"',
  ].join("\n");

  const parsed = parseToml(hand);
  assert.equal(parsed.ok, true, "the fixture itself is a file the shipped parser reads");
  assert.equal(Object.keys(parsed.keymap.normal).length, 9, "nine bindings went in");

  const text = emitLocalToml(parsed);
  const back = parseToml(text);
  assert.equal(back.ok, true, "…and nine come back out through a clean file");
  assert.deepEqual(back, parsed, "a panel write is key-set preserving over foreign content");

  // …and the write the user actually made still lands on top of it.
  const written = setOverride(parsed, "style.gap", "2em");
  assert.equal(written.ok, true);
  const after = parseToml(emitLocalToml(written.table));
  assert.deepEqual(
    Object.keys(after.keymap.normal).sort(),
    Object.keys(parsed.keymap.normal).sort(),
    "editing a style key must not delete four keybindings",
  );
  assert.equal(after.style.gap, "2em");
  assert.equal(after.keymap.normal[":"], "palette");

  // The three characters that genuinely cannot come back, and the section rules.
  const impossible = {
    a: { 'q"uote': 1, "eq=uals": 2, "new\nline": 3, keep: 4 },
    "dot.ted": { k: 1 },
    "hash#ed": { k: 1 },
    " padded ": { k: 1 },
    "": { k: 1 },
  };
  const round = parseToml(emitLocalToml(impossible));
  assert.equal(round.ok, true, "an unrepresentable key never produces a broken line");
  assert.deepEqual(round, { a: { keep: 4 } }, "each is dropped whole, its siblings kept");
});

test("settings: emitLocalToml survives depth and cycles — the acyclic prefix, then it stops", () => {
  const nested = { theme: { colors: { bg: "1px" } } };
  const text = emitLocalToml(nested);
  assert.ok(text.includes("[theme.colors]"), "a nested table emits a dotted header");
  assert.deepEqual(parseToml(text), nested);

  const cyclic = { style: { radius: "4px" } };
  cyclic.style.self = cyclic;
  let out;
  assert.doesNotThrow(() => {
    out = emitLocalToml(cyclic);
  }, "a cyclic table must not recurse forever");
  assert.ok(out.includes("4px"), "the acyclic prefix is still emitted");
  assert.equal(parseToml(out).ok, true);

  let deep = { leaf: "1px" };
  for (let i = 0; i < 40; i++) deep = { [`d${i}`]: deep };
  assert.doesNotThrow(() => emitLocalToml(deep), "40 levels deep must not throw");
});

test("settings: an integer the file cannot spell decimally is unrepresentable, not silently retyped", () => {
  // Number.isInteger does not imply decimal digits. 1e21 stringifies to "1e+21"
  // and parseValue reads that back as a STRING, and -0 stringifies to "0" and
  // reads back as +0 — both reachable without hostility, because parseValue
  // itself produces 1e21 from a long enough digit run.
  const fromParser = parseToml("[graveyard]\ncap = 1000000000000000000000");
  assert.equal(typeof fromParser.graveyard.cap, "number", "the parser really does produce it");
  assert.equal(fromParser.graveyard.cap, 1e21);

  const text = emitLocalToml(fromParser);
  const back = parseToml(text);
  assert.equal(back.ok, true);
  assert.equal(text.includes("1e+21"), false, "never a literal the parser reads as a string");
  assert.deepEqual(back, {}, "the entry is dropped whole rather than changing type");

  for (const value of [1e21, -1e21, 1e24, 9007199254740993, -0]) {
    assert.deepEqual(
      parseToml(emitLocalToml({ options: { scroll_step: value } })),
      {},
      `${show(value)} must not reach the file`,
    );
    const r = setOverride({}, "options.scroll_step", value);
    assert.equal(r.ok, false, `${show(value)} must not be writable`);
    assert.equal(r.error, ERRORS.UNSAFE_VALUE, `${show(value)}: unrepresentable, not merely out of range`);
  }
  // …and the property that matters, over every type the schema can hold: what
  // comes back is what went in, never a same-looking value of another type.
  const T = { options: { scroll_step: 200, which_key_ms: -1 }, style: { blur: "0", opacity: 0 } };
  const round = parseToml(emitLocalToml(T));
  for (const [section, table] of Object.entries(T)) {
    for (const [key, value] of Object.entries(table)) {
      assert.equal(typeof round[section][key], typeof value, `${section}.${key}: type survived`);
      assert.equal(Object.is(round[section][key], value), true, `${section}.${key}: identity survived`);
    }
  }
});

// 5b. copy as TOML -------------------------------------------------------------

test("settings: tomlLine is the exact line emitLocalToml would write, or nothing at all", () => {
  assert.equal(tomlLine("style.radius", "4px"), 'radius = "4px"');
  assert.equal(tomlLine("options.scroll_step", 200), "scroll_step = 200");
  assert.equal(tomlLine("options.config_watch", false), "config_watch = false");
  assert.equal(tomlLine("statusbar.widgets", ["mode", "url"]), 'widgets = ["mode", "url"]');
  assert.equal(tomlLine("keymap.normal.:", "palette"), '":" = "palette"', "a punctuation key is quoted");

  // byte-for-byte the same line the file gets: the panel promises "the exact
  // line, for pasting into the real dotfile", and glue re-deriving it is where
  // an unquoted or unfiltered one would come from.
  for (const [path, value] of [
    ["style.radius", "4px"],
    ["options.scroll_step", 200],
    ["statusbar.widgets", ["mode", "url"]],
    ["style.motion_ease", "cubic-bezier(0.22, 1, 0.36, 1)"],
  ]) {
    const written = setOverride({}, path, value);
    assert.equal(written.ok, true, path);
    const lines = emitLocalToml(written.table).split("\n");
    assert.ok(lines.includes(tomlLine(path, value)), `${path}: the copied line is the written line`);
  }

  for (const [path, value] of [
    ["ai.model", 'lla"ma'],
    ["ai.model", "lla\nma"],
    ["style.radius", 1.5],
    ["style.radius", 1e21],
    ["style.radius", -0],
    ["a.b", {}],
    ["a.b", null],
    ["a.b", undefined],
    ['a.q"uote', "x"],
    ["a.eq=uals", "x"],
    ["", "x"],
    [null, "x"],
    [42, "x"],
    [{}, "x"],
  ]) {
    assert.equal(tomlLine(path, value), null, `${show(path)} = ${show(value)}: no half-line ever leaves`);
  }
});

test("settings: over a generated corpus, the file never breaks and never changes a value it keeps", () => {
  // Deterministic (an LCG, not Math.random): a fuzz that cannot be re-run is a
  // fuzz that cannot be debugged. The invariant is the one the module claims —
  // every emitted line parses, every kept entry is byte-identical on the way
  // back, and nothing the input did not contain ever appears.
  let seed = 20260814;
  const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const pick = list => list[Math.floor(next() * list.length) % list.length];
  const KEYS = [
    "radius", "a b", ":", "?", "#", "[", "]", "\\", '"', "=", "\n", "", " x ",
    "__proto__", "constructor", "0", "-", "x.y", "ok_key", " ", "é",
  ];
  const VALUES = [
    "4px", "a b", 'q"uote', "line\nbreak", "#ffffff", "#nothex", "has#hash",
    "[bracket]", "back\\slash", " padded", "padded ", "", 0, -0, 1, -1, 200,
    1e21, 1.5, NaN, Infinity, true, false, null, undefined, ["a", "b"],
    ["a,b"], [], {}, "trail\t",
  ];

  for (let round = 0; round < 400; round++) {
    const table = {};
    const depth = 1 + Math.floor(next() * 2);
    for (let i = 0; i < 4; i++) {
      let cursor = table;
      for (let d = 0; d < depth; d++) {
        const section = pick(KEYS);
        if (!Object.hasOwn(cursor, section) || typeof cursor[section] !== "object") {
          cursor[section] = {};
        }
        cursor = cursor[section];
        if (typeof cursor !== "object" || cursor === null) break;
      }
      if (typeof cursor !== "object" || cursor === null) continue;
      cursor[pick(KEYS)] = pick(VALUES);
    }

    let text;
    assert.doesNotThrow(() => {
      text = emitLocalToml(table);
    }, `round ${round}`);
    const back = parseToml(text);
    assert.equal(back.ok, true, `round ${round}: emitted a line the parser rejects:\n${text}`);
    assert.equal(text.startsWith(LOCAL_CONFIG_HEADER), true, `round ${round}: header`);
    assert.equal(emitLocalToml(table), text, `round ${round}: emission is deterministic`);

    const walk = (kept, source, trail) => {
      for (const [key, value] of Object.entries(kept)) {
        const path = [...trail, key].join(".");
        assert.ok(source !== null && typeof source === "object", `round ${round}: invented ${path}`);
        assert.ok(Object.hasOwn(source, key), `round ${round}: ${path} was never in the table`);
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          walk(value, source[key], [...trail, key]);
        } else {
          assert.deepEqual(value, source[key], `round ${round}: ${path} changed crossing the file`);
        }
      }
    };
    walk(back, table, []);
    assert.deepEqual(parseToml(emitLocalToml(back)), back, `round ${round}: re-emitting is a fixed point`);
  }
  assert.equal({}.polluted, undefined, "no prototype pollution across the whole fuzz");
});

// 6. hostile values rejected, not escaped -------------------------------------

test("settings: setOverride refuses values the shipped parser cannot represent exactly", () => {
  const hostile = [
    ["ai.model", 'lla"ma'],
    ["ai.model", "lla\nma"],
    ["ai.model", "lla\rma"],
    ["ai.model", "lla\tma"],
    ["ai.model", "lla\u0000ma"],
    ["ai.model", "lla\u007fma"],
    ["ai.model", " llama"],
    ["ai.model", "llama "],
    ["boosts.dir", "~/x#y"],
    ["boosts.dir", "~/x]y"],
    ["boosts.dir", "~/x[y"],
    ["boosts.dir", "~/x\\y"],
    ["statusbar.widgets", ["mode", "ur,l"]],
    ["statusbar.widgets", ['mo"de']],
  ];
  for (const [path, value] of hostile) {
    const input = {};
    const r = setOverride(input, path, value);
    assert.equal(r.ok, false, `${path} = ${JSON.stringify(value)} must be refused`);
    assert.equal(r.error, ERRORS.UNSAFE_VALUE, `${path}: refused for being unrepresentable`);
    assert.equal(r.path, path, "the error names the path");
    assert.equal(r.table, undefined, "no table comes back on an error");
    assert.deepEqual(input, {}, "the table is untouched");
  }
});

test("settings: the deny-set is a filter, not a wall — commas, parentheses and interior spaces write fine", () => {
  // If this reds, the shipped DEFAULTS (motion_ease, a two-word font) became
  // unwritable through the panel, which is a worse bug than the injection.
  assert.equal(setOverride({}, "style.motion_ease", "cubic-bezier(0.22, 1, 0.36, 1)").ok, true);
  assert.equal(setOverride({}, "style.font", "JetBrains Mono").ok, true);
  assert.equal(setOverride({}, "ai.base_url", "http://127.0.0.1:11434/v1").ok, true);
  assert.equal(setOverride({}, "privacy.doh_url", "https://dns.quad9.net/dns-query").ok, true);
  assert.equal(setOverride({}, "statusbar.widgets", ["mode", "url", "clock"]).ok, true);
});

// 6b. the panel cannot write a value the LOADER rejects (spec §2) --------------

// One corpus, every [style] key, on purpose: the bug this replaces was found by
// eyeballing a hand-picked probe list that happened to contain no negative
// length, and r2's grammar is unsigned by design (`font: -4px monospace`
// resolves to `unset`, not to the var() fallback, so a negative loses the
// surface's size AND family while `rejected` stays empty).
const STYLE_CORPUS = [
  "0", "0px", "2px", "-2px", "-0px", "-1rem", "+2px", ".5em", "-.5em", "1.5rem",
  "8pt", "8", "100%", "-100%", "60vh", "38rem", "calc(1px)", "var(--x)",
  "1px;color:red", " 2px", "2px ", "2px\n", "2PX", "1e3px",
  "monospace", "JetBrains Mono", "inherit", "Inherit", "unset", "url(evil.woff)",
  "linear", "cubic-bezier(0.22, 1, 0.36, 1)", "cubic-bezier(-0.5, 1, 0.36, 1)",
  "steps(0)", "steps(3, end)", "wobble", "", "  ", `${"9".repeat(70)}px`,
  true, false, 0, -0, 1, 100, 101, -1, 120, 1.5, NaN, Infinity, -Infinity,
  1e21, 9007199254740993, null, undefined, [], {}, ["2px"],
];

test("settings: every [style] entry is r2's own validator, so the panel cannot write what r2 drops", () => {
  const keys = Object.keys(STYLE_VALIDATORS);
  assert.equal(keys.length, 16, "r2 owns sixteen style keys");
  assert.deepEqual(
    SCHEMA.filter(e => e.section === "style").map(e => e.key).sort(),
    [...keys].sort(),
    "the settings schema and r2's validator table describe the same key set",
  );

  let accepted = 0;
  for (const key of keys) {
    const entry = schemaEntry(`style.${key}`);
    assert.ok(entry, `style.${key} must be a schema path`);
    for (const value of STYLE_CORPUS) {
      const mine = entry.validator(value) === true;
      const theirs = STYLE_VALIDATORS[key](value) === true;
      assert.equal(
        mine,
        theirs,
        `style.${key} = ${show(value)}: the panel and r2 must not disagree, in either direction`,
      );

      // …and the end-to-end claim, through the real loader rather than through
      // a second copy of its regex: anything the panel writes, r2 keeps.
      if (setOverride({}, `style.${key}`, value).ok) {
        accepted++;
        const built = buildStyle({ [key]: value });
        assert.equal(built.style[key], value, `style.${key} = ${show(value)}: written, then dropped by r2`);
        assert.deepEqual(built.rejected, [], `style.${key} = ${show(value)}: r2 rejected a written value`);
      }
    }
  }
  assert.ok(accepted >= 16, "the corpus must actually get values through, or it proves nothing");
});

test("settings: a negative length is refused end to end — the panel, the file and the loader agree", () => {
  // The exact chain the panel runs: setOverride -> emitLocalToml -> parseToml ->
  // deepMerge -> buildStyle. A row reading `-2px / local / valid` over chrome
  // that renders 2px is precisely the "is the panel broken or is the setting"
  // failure the pref rule exists to prevent.
  for (const key of ["radius", "gap", "pad_y", "pad_x", "row_pad_y", "row_pad_x",
                     "border", "panel_width", "panel_height", "blur", "font_size"]) {
    const path = `style.${key}`;
    const r = setOverride({}, path, "-2px");
    assert.equal(r.ok, false, `${path} = "-2px" must be refused: r2 renders 2px for it`);
    assert.equal(r.error, ERRORS.INVALID_VALUE, path);

    // and if one ever did land in the file, the row says so rather than lying
    const rows = byPath(buildRows(SCHEMA, { local: { style: { [key]: "-2px" } } }));
    assert.equal(rows.get(path).valid, false, `${path}: a value r2 drops reads invalid`);
  }

  const merged = deepMerge(
    AetherConfig.DEFAULTS,
    parseToml(emitLocalToml({ style: { radius: "-2px" } })),
  );
  assert.equal(merged.style.radius, "-2px", "the file layer really does carry it through the merge");
  assert.equal(buildStyle(merged.style).style.radius, "2px", "…and r2 really does throw it away");
});

test("settings: ai.base_url is f7's rule, not a second opinion about loopback", () => {
  const urls = [
    "http://127.0.0.1:11434/v1",
    "http://127.0.0.1:11434/v1?x=1",
    "http://LOCALHOST:11434/v1",
    "https://localhost/v1",
    "http://[::1]:8080/v1",
    "http://127.0.0.1:11434/v1#frag",
    "http://example.com/v1",
    "http://127.0.0.1.example.com/v1",
    "file:///etc/passwd",
    "ftp://127.0.0.1/v1",
    "not a url",
    "",
  ];
  const entry = schemaEntry("ai.base_url");
  for (const url of urls) {
    assert.equal(
      entry.validator(url) === true,
      validateBaseUrl(url) === true,
      `${url}: the panel must accept exactly what the AI client accepts`,
    );
  }
  const working = "http://127.0.0.1:11434/v1?x=1";
  const row = byPath(buildRows(SCHEMA, { local: { ai: { base_url: working } } })).get("ai.base_url");
  assert.equal(row.valid, true, "a gateway URL the client uses must not read as invalid");
  assert.equal(setOverride({}, "ai.base_url", working).ok, true, "…and must be re-enterable");
});

test("settings: the refused values are exactly the ones the file could not carry back (rejection, not escaping)", () => {
  // Tests 5 and 6 are only jointly satisfiable because the write path REFUSES:
  // had these landed in a table, the emitted file would not round-trip.
  for (const value of ['lla"ma', "lla\nma", " llama", "llama "]) {
    const round = parseToml(emitLocalToml({ ai: { model: value } }));
    assert.notEqual(round.ai?.model, value, `${JSON.stringify(value)} cannot survive the file`);
  }
  const injected = parseToml(emitLocalToml({ ai: { model: 'x"\nenabled = true' } }));
  assert.equal(injected.ai?.enabled, undefined, "a value can never author a second key");
});

test("settings: validateValue reports the unsafe reason before it consults the validator", () => {
  const entry = schemaEntry("ai.model");
  assert.ok(entry, "ai.model is a schema path");
  assert.deepEqual(validateValue(entry, "llama3.2"), { ok: true });
  assert.equal(validateValue(entry, 'lla"ma').error, ERRORS.UNSAFE_VALUE, "safety first…");
  assert.equal(validateValue(entry, "lla ma!").error, ERRORS.INVALID_VALUE, "…then the grammar");
  assert.equal(validateValue(null, "x").error, ERRORS.UNKNOWN_PATH);
  assert.equal(validateValue(undefined, "x").error, ERRORS.UNKNOWN_PATH);
  assert.equal(validateValue({}, "x").error, ERRORS.UNKNOWN_PATH, "an entry without a type is no entry");
});

// 7. validator rejection before write -----------------------------------------

test("settings: a value the loader would reject is refused before the write, table untouched", () => {
  const invalid = [
    ["options.scroll_step", "abc"],
    ["options.scroll_step", 0.5],
    ["options.scroll_step", NaN],
    ["options.scroll_step", Infinity],
    ["options.scroll_step", "200"],
    ["options.scroll_step", 0],
    ["options.hint_chars", "aab"],
    ["options.hint_chars", "ASDF"],
    ["style.radius", "8pt"],
    ["style.radius", "8"],
    ["style.radius", "calc(1px)"],
    ["style.opacity", 101],
    ["style.opacity", 0.96],
    ["style.motion_ease", "wobble"],
    ["style.font", "url(evil.woff)"],
    ["theme.source", "neon"],
    ["privacy.doh", "on"],
    ["privacy.doh_url", "http://dns.example/x"],
    ["panels.scope", ""],
    ["statusbar.widgets", "mode"],
    ["statusbar.widgets", ["Mode"]],
    ["statusbar.widgets", [""]],
    ["ai.base_url", "http://example.com/v1"],
    ["options.config_watch", "true"],
    ["options.config_watch", 1],
    ["options.config_watch", null],
  ];
  for (const [path, value] of invalid) {
    const input = { style: { gap: "1em" } };
    const snap = structuredClone(input);
    const r = setOverride(input, path, value);
    assert.equal(r.ok, false, `${path} = ${JSON.stringify(value)} must not be writable`);
    assert.equal(r.error, ERRORS.INVALID_VALUE, `${path} = ${JSON.stringify(value)}`);
    assert.equal(r.table, undefined);
    assert.deepEqual(input, snap, "a rejected write changes nothing");
  }
});

test("settings: paths outside the schema — including the open tables and prototype keys — are unknown", () => {
  const unknown = [
    "keymap.normal.j",
    "keymap.reserved.C-w",
    "theme.colors.bg",
    "__proto__.polluted",
    "constructor.prototype.polluted",
    "prototype.x",
    "options",
    "options.bogus",
    "style.radius.x",
    "",
    ".",
    "..",
    null,
    undefined,
    42,
    {},
    ["style.radius"],
  ];
  for (const path of unknown) {
    const input = {};
    const r = setOverride(input, path, 1);
    assert.equal(r.ok, false, `${String(path)} must not be writable`);
    assert.equal(r.error, ERRORS.UNKNOWN_PATH, `${String(path)}`);
    assert.equal(r.table, undefined);
    assert.deepEqual(input, {}, "nothing was written");
    assert.equal(schemaEntry(path), null, `schemaEntry(${String(path)}) must be null`);
  }
  assert.equal({}.polluted, undefined, "no prototype pollution");
  assert.equal(Object.prototype.x, undefined);
});

test("settings: a caller-supplied schema is writable, not merely displayable", () => {
  // Spec §6: "x2 defines whether mods declare schema entries; if they do, they
  // appear here for free, which is the reason the schema is a data table."
  // Appearing read-only is not for free.
  const mod = Object.freeze({
    path: "mod.hello.size",
    section: "mod",
    key: "size",
    type: "int",
    default: 1,
    description: "how big hello is",
    validator: v => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 9,
  });
  const extended = [...SCHEMA, mod];

  assert.equal(buildRows(extended, {}).length, 39, "the mod row renders");
  const written = setOverride({}, "mod.hello.size", 2, extended);
  assert.equal(written.ok, true, "…and writes");
  assert.equal(written.table.mod.hello.size, 2);
  assert.deepEqual(parseToml(emitLocalToml(written.table)), { mod: { hello: { size: 2 } } });

  assert.equal(setOverride({}, "mod.hello.size", 2).error, ERRORS.UNKNOWN_PATH, "…only with its schema");
  assert.equal(setOverride({}, "mod.hello.size", 99, extended).error, ERRORS.INVALID_VALUE, "its own rule holds");
  assert.equal(setOverride.length, 3, "the schema is a defaulted 4th argument, not a required one");

  // A schema entry is DATA, from a mod, i.e. untrusted: its path is walked under
  // the same prototype rule as a user's, so declaring one cannot reach
  // Object.prototype.
  const hostile = [
    { path: "__proto__.polluted", type: "int", default: 0, validator: () => true },
    { path: "constructor.prototype.polluted", type: "int", default: 0, validator: () => true },
    { path: "a..b", type: "int", default: 0, validator: () => true },
    { path: "prototype.x", type: "int", default: 0, validator: () => true },
  ];
  for (const entry of hostile) {
    const r = setOverride({}, entry.path, 1, [entry]);
    assert.equal(r.ok, false, `${entry.path} must not be writable through a mod schema`);
    assert.equal(r.error, ERRORS.UNKNOWN_PATH, entry.path);
  }
  assert.equal({}.polluted, undefined, "no prototype pollution through a supplied schema");
  assert.equal(Object.prototype.polluted, undefined);
  assert.doesNotThrow(() => buildRows(hostile, { local: {} }), "…and rendering them is inert too");
});

test("settings: schemaEntry finds every schema path by value, not by property lookup", () => {
  for (const entry of SCHEMA) {
    const found = schemaEntry(entry.path);
    assert.ok(found, `${entry.path} must resolve`);
    assert.equal(found.path, entry.path);
    assert.equal(typeof found.validator, "function");
  }
  assert.equal(schemaEntry("toString"), null, "an inherited name is not a schema path");
  assert.equal(schemaEntry("hasOwnProperty"), null);
  assert.equal(schemaEntry("style.radius", []), null, "an empty schema resolves nothing");
});

// 8. coverage guard ------------------------------------------------------------

test("settings: SCHEMA covers every DEFAULTS leaf except exactly the two declared open tables", () => {
  const leaves = walkLeaves(DEFAULTS);
  // Canary on the walker, not on the schema: the keymap is an OPEN_TABLE, so a
  // new binding moves this number and nothing else. 82 -> 83 at integration,
  // when r3's `"?" = "which_key"` landed in DEFAULTS.keymap.normal.
  assert.equal(leaves.length, 94, "the walker really walked DEFAULTS (94 leaves today (r4 added 11 keymap bindings))");
  assert.deepEqual([...OPEN_TABLES], ["keymap", "theme.colors"], "exactly two exclusions, no quiet third");

  const expected = leaves.filter(p => !isOpen(p));
  assert.equal(expected.length, 38);
  assert.equal(SCHEMA.length, 38, "no duplicate and no missing entry");
  assert.deepEqual(SCHEMA.map(e => e.path), expected, "…in DEFAULTS order, so the panel reads like the file");
  assert.equal(new Set(SCHEMA.map(e => e.path)).size, 38, "paths are unique");
  assert.equal(SCHEMA.some(e => isOpen(e.path)), false, "no keybinding and no colour slot is Enter-editable");
  assert.deepEqual(
    [...SECTIONS],
    Object.keys(DEFAULTS).filter(k => k !== "keymap"),
    "SECTIONS is the DEFAULTS section order minus the open keymap table",
  );
});

// 8b. the entries are literals that agree with DEFAULTS ------------------------

test("settings: every SCHEMA entry's default is the DEFAULTS leaf at its path, with a coherent section/key", () => {
  for (const e of SCHEMA) {
    assert.deepEqual(e.default, leafAt(DEFAULTS, e.path), `${e.path}: default drifted from DEFAULTS`);
    assert.equal(e.section, e.path.split(".")[0], `${e.path}: section must be the first segment`);
    assert.equal(e.key, e.path.split(".").pop(), `${e.path}: key must be the trailing segment`);
    assert.ok(SECTIONS.includes(e.section), `${e.path}: unknown section`);
    assert.ok(["bool", "int", "string", "enum", "list"].includes(e.type), `${e.path}: unknown type`);
    assert.equal(e.type === "enum", Array.isArray(e.enum), `${e.path}: enum values iff type enum`);
    if (e.type === "enum") {
      assert.ok(e.enum.length >= 2, `${e.path}: an enum of one is not a choice`);
      assert.ok(e.enum.includes(e.default), `${e.path}: the default must be one of the choices`);
    }
    assert.equal(typeof e.validator, "function", `${e.path}: needs a validator`);
    assert.ok(Object.isFrozen(e), `${e.path}: entries are frozen`);
  }
  assert.ok(Object.isFrozen(SCHEMA), "SCHEMA itself is frozen");
  assert.equal(schemaEntry("theme.source").enum.includes("wal"), true);
  assert.deepEqual([...schemaEntry("privacy.doh").enum], ["off", "fallback", "strict"]);
  assert.deepEqual([...schemaEntry("panels.scope").enum], ["workspace", "all"]);
});

// 8c. the shipped defaults are themselves writable -----------------------------

test("settings: every shipped default is accepted by its own validator and by setOverride", () => {
  // The fallback can never itself fail: a grammar that rejects pad_y = "0" or
  // blur = "0" makes a shipped default unwritable through the panel.
  for (const e of SCHEMA) {
    assert.equal(e.validator(e.default), true, `${e.path}: its own default must validate`);
    const r = setOverride({}, e.path, e.default);
    if (e.pref) {
      assert.equal(r.ok, false, `${e.path}: pref-owned rows never write the file`);
      assert.equal(r.error, ERRORS.PREF_OWNED, `${e.path}`);
    } else {
      assert.equal(r.ok, true, `${e.path}: its own default must be writable`);
      assert.deepEqual(r.table[e.section][e.key], e.default, `${e.path}: written verbatim`);
    }
  }
});

// 8d. round trip over the whole schema -----------------------------------------

test("settings: a table holding every writable default round-trips through the file exactly", () => {
  let table = {};
  let written = 0;
  for (const e of SCHEMA) {
    if (e.pref) continue;
    const r = setOverride(table, e.path, e.default);
    assert.equal(r.ok, true, `${e.path} must be writable`);
    table = r.table;
    written++;
  }
  assert.equal(written, 37, "37 file-owned rows, 1 pref-owned");
  const text = emitLocalToml(table);
  const back = parseToml(text);
  assert.equal(back.ok, true, "the fullest possible local file still parses clean");
  assert.deepEqual(back, table, "every type survives the round trip");
  assert.equal(Object.keys(back).length, 11, "all eleven sections made it");
});

// 9. pref-owned paths refuse to write ------------------------------------------

test("settings: a pref-owned path is refused unconditionally — it has no layer argument to consult", () => {
  for (const value of [true, false]) {
    const r = setOverride({}, "ai.enabled", value);
    assert.equal(r.ok, false, "writing the local file would be a no-op the user cannot see");
    assert.equal(r.error, ERRORS.PREF_OWNED);
    assert.equal(r.path, "ai.enabled");
    assert.equal(r.table, undefined);
  }
  const populated = { ai: { model: "llama3.2" }, style: { radius: "4px" } };
  const snap = structuredClone(populated);
  assert.equal(setOverride(populated, "ai.enabled", true).error, ERRORS.PREF_OWNED);
  assert.deepEqual(populated, snap, "a refused pref write touches nothing");
  assert.equal(setOverride.length, 3, "there is no layers argument: refusal is declarative");
});

test("settings: exactly one row is pref-owned, and DoH is not it", () => {
  assert.deepEqual(SCHEMA.filter(e => e.pref).map(e => e.path), ["ai.enabled"]);
  assert.equal(schemaEntry("ai.enabled").pref, "aether.ai.enabled");
  for (const path of ["privacy.doh", "privacy.doh_url"]) {
    assert.equal(schemaEntry(path).pref, undefined, `${path} is TOML-authoritative`);
    assert.equal(setOverride({}, path, schemaEntry(path).default).ok, true, `${path} writes the file`);
  }
});

// 10. descriptions --------------------------------------------------------------

test("settings: every schema entry has a one-line, distinct description that passes the f6 lexicon sweep", () => {
  const BANNED = /fail|streak|wasted|behind|should have|procrastinat/i;
  const seen = new Set();
  for (const e of SCHEMA) {
    assert.equal(typeof e.description, "string", `${e.path}: needs a description`);
    assert.ok(e.description.trim().length > 0, `${e.path}: description is empty`);
    assert.equal(e.description, e.description.trim(), `${e.path}: no edge whitespace`);
    assert.ok(!BANNED.test(e.description), `${e.path}: "${e.description}" carries shame vocabulary`);
    assert.ok(e.description.length <= 80, `${e.path}: description must fit one row`);
    assert.equal(e.description.includes("\n"), false, `${e.path}: one line`);
    assert.equal(seen.has(e.description), false, `${e.path}: duplicated description`);
    seen.add(e.description);
  }
});

// 11. DoH mapping ----------------------------------------------------------------

test("settings: the DoH enum maps to trr modes 0/2/3 and nothing else", () => {
  assert.equal(TRR_MODES.off, 0);
  assert.equal(TRR_MODES.fallback, 2);
  assert.equal(TRR_MODES.strict, 3);
  assert.equal(Object.keys(TRR_MODES).length, 3, "three modes, matching the enum");
  assert.deepEqual(Object.keys(TRR_MODES).sort(), [...schemaEntry("privacy.doh").enum].sort());

  assert.equal(dohPrefs({ doh: "off" })["network.trr.mode"], 0);
  assert.equal(dohPrefs({ doh: "fallback" })["network.trr.mode"], 2);
  assert.equal(dohPrefs({ doh: "strict" })["network.trr.mode"], 3);
});

test("settings: any unrecognised DoH value resolves to fallback rather than throwing or disabling DoH", () => {
  const bogus = [
    { doh: "on" },
    { doh: "" },
    { doh: 3 },
    { doh: {} },
    { doh: null },
    {},
    undefined,
    null,
    "strict",
    42,
    [],
    withOwnProto('{"__proto__":{"doh":"off"}}'),
    Object.create(null),
  ];
  for (const table of bogus) {
    let out;
    assert.doesNotThrow(() => {
      out = dohPrefs(table);
    }, `dohPrefs(${show(table)}) must not throw`);
    assert.equal(out["network.trr.mode"], 2, "an unknown value never silently turns DoH off");
    assert.equal(typeof out["network.trr.uri"], "string");
  }
});

test("settings: the DoH uri comes from the TOML table, and an unusable one falls back to the default", () => {
  assert.equal(
    dohPrefs({ doh: "strict", doh_url: "https://example.net/dns" })["network.trr.uri"],
    "https://example.net/dns",
  );
  for (const url of ['https://x"y', "http://x", " https://x", "https://x y", 42, undefined, null, {}]) {
    assert.equal(
      dohPrefs({ doh: "strict", doh_url: url })["network.trr.uri"],
      DEFAULTS.privacy.doh_url,
      `${String(url)} must not reach the pref`,
    );
  }
  assert.deepEqual(Object.keys(dohPrefs({})).sort(), ["network.trr.mode", "network.trr.uri"]);
  // The TOML value is the authority: the function has nowhere to read a pref
  // from, so no existing pref can ever participate in the result.
  assert.equal(dohPrefs.length, 1, "dohPrefs takes the TOML table and nothing else");
});

// layersFromConfig --------------------------------------------------------------

function fakeConfig(tables) {
  const config = { merged: true };
  Object.defineProperty(config, "sources", {
    value: AetherConfig.SOURCE_FILES.map((name, i) => ({
      path: `/home/me/.config/aether/${name}`,
      exists: tables[i] !== null,
      ok: true,
      errorLine: null,
      table: tables[i],
    })),
    enumerable: false,
  });
  return config;
}

test("settings: layersFromConfig splits the loaded sources into dotfile and local layers by file", () => {
  const layers = layersFromConfig(fakeConfig([{ theme: { source: "wal" } }, { style: { radius: "8px" } }]), {
    "aether.ai.enabled": false,
  });
  assert.deepEqual(layers.dotfile, { theme: { source: "wal" } }, "aether.toml is the dotfile layer");
  assert.deepEqual(layers.local, { style: { radius: "8px" } }, "aether.local.toml is the local layer");
  assert.equal(layers.defaults, DEFAULTS);
  assert.deepEqual(layers.prefs, { "aether.ai.enabled": false });

  const rows = byPath(buildRows(SCHEMA, layers));
  assert.equal(rows.get("theme.source").provenance, "dotfile");
  assert.equal(rows.get("style.radius").provenance, "local");
  assert.equal(rows.get("ai.enabled").provenance, "pref");
});

test("settings: an absent or unparsed source contributes nothing, and a garbage config still yields four layers", () => {
  const onlyDotfile = layersFromConfig(fakeConfig([{ theme: { source: "wal" } }, null]));
  assert.deepEqual(onlyDotfile.local, {}, "no local file → an empty local layer, not a crash");
  assert.equal(byPath(buildRows(SCHEMA, onlyDotfile)).get("theme.source").provenance, "dotfile");

  for (const bad of [undefined, null, 42, "config", {}, [], () => {}]) {
    let layers;
    assert.doesNotThrow(() => {
      layers = layersFromConfig(bad, { "aether.ai.enabled": true });
    }, `layersFromConfig(${show(bad)}) must not throw`);
    assert.equal(layers.defaults, DEFAULTS);
    assert.deepEqual(layers.dotfile, {});
    assert.deepEqual(layers.local, {});
    assert.deepEqual(layers.prefs, { "aether.ai.enabled": true });
    assert.equal(buildRows(SCHEMA, layers).length, 38, "the panel still enumerates everything");
  }
});

// module-level invariants ---------------------------------------------------------

test("settings: the module never names the hand-written dotfile and never reaches for a clock or a host API", () => {
  const src = readFileSync(MODULE_PATH, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert.equal(src.includes("aether.toml"), false, "aether.toml is mine; the module cannot even name it");
  for (const banned of [
    "Services.",
    "IOUtils",
    "PathUtils",
    "Date.now",
    "new Date",
    "Math.random",
    "setTimeout",
    "setInterval",
    "document.",
    "window.",
  ]) {
    assert.equal(src.includes(banned), false, `a pure module must not use ${banned}`);
  }
  const imports = [...src.matchAll(/from\s+"([^"]+)"/g)].map(m => m[1]).sort();
  assert.deepEqual(
    [...new Set(imports)],
    [
      "./aether-ai-client.sys.mjs", // f7's validateBaseUrl — the loader's rule for ai.base_url
      "./aether-config.sys.mjs", // DEFAULTS and SOURCE_FILES
      "./aether-keys.sys.mjs", // parseBinding — a binding read exactly as the engine reads it
      "./aether-strings.sys.mjs", // the generated header
      "./aether-style.sys.mjs", // r2's VALIDATORS — spec §2's "the same validators"
    ],
    "the settings module imports validators and copy from their owners, and nothing else",
  );
  // Each import is a PURE leaf; the list may not grow into glue.
  for (const banned of ["aether.uc.js", "aether-panel", "aether-widgets"]) {
    assert.equal(src.includes(banned), false, `the pure schema must not depend on ${banned}`);
  }
  assert.equal(src.includes("LOCAL_CONFIG_HEADER ="), false, "the header is imported, never re-declared");
});

test("settings: no export throws on any argument, in any position, and none of them pollutes Object.prototype", () => {
  const cyclic = { a: 1 };
  cyclic.self = cyclic;
  const VALUES = [
    undefined,
    null,
    0,
    "",
    "x",
    "style.radius",
    true,
    [],
    {},
    Object.create(null),
    () => {},
    Symbol("s"),
    { a: { b: { c: 1 } } },
    cyclic,
    withOwnProto('{"__proto__":{"polluted":1}}'),
    "\u0000\n\"]#",
  ];
  const label = show;

  for (const [name, fn] of Object.entries(Settings)) {
    if (typeof fn !== "function") continue;
    for (const v of VALUES) {
      for (const args of [[v], [v, v], [v, v, v], [SCHEMA[0], v], [{}, "style.radius", v], [SCHEMA, v]]) {
        assert.doesNotThrow(() => fn(...args), `${name}(… ${label(v)} …) must not throw`);
      }
    }
  }

  // and the declared shapes hold even for garbage
  assert.equal(Array.isArray(buildRows(null, null)), true);
  assert.equal(typeof emitLocalToml(null), "string");
  assert.equal(resetOverride(null, null).ok, true);
  assert.equal(setOverride(null, null, null).ok, false);
  assert.equal(schemaEntry(Symbol("s")), null);
  assert.equal(validateValue(SCHEMA[0], Symbol("s")).ok, false);
  assert.equal({}.polluted, undefined, "no prototype pollution after the whole sweep");
  assert.equal(Object.prototype.x, undefined);
  assert.equal({}.doh, undefined);
});

test("settings: a layer, a table or a value backed by an accessor is data — the code never runs", () => {
  // A layer arrives from glue and a local table arrives from a file that a mod
  // may have written. A getter that runs inside a render pass could make two
  // buildRows calls on the same layers disagree, and one that throws would take
  // the panel down with it.
  let ran = 0;
  const layer = { style: {} };
  Object.defineProperty(layer.style, "radius", {
    enumerable: true,
    get() {
      ran++;
      throw new Error("boom");
    },
  });
  Object.defineProperty(layer, "ai", {
    enumerable: true,
    get() {
      ran++;
      return { model: "pwned" };
    },
  });

  let rows;
  assert.doesNotThrow(() => {
    rows = byPath(buildRows(SCHEMA, { defaults: DEFAULTS, local: layer }));
  }, "a throwing layer must not take the panel down");
  assert.equal(ran, 0, "no accessor ran");
  assert.equal(rows.get("style.radius").provenance, "default", "an accessor-backed key is simply absent");
  assert.equal(rows.get("ai.model").value, "llama3.2");

  assert.doesNotThrow(() => setOverride(layer, "style.gap", "2em"));
  const written = setOverride(layer, "style.gap", "2em");
  assert.equal(written.ok, true);
  assert.deepEqual(written.table, { style: { gap: "2em" } }, "the copy carries data only");
  assert.equal(ran, 0);

  const emitted = { style: {} };
  Object.defineProperty(emitted.style, "blur", {
    enumerable: true,
    get() {
      ran++;
      return '0"\nradius = "9px';
    },
  });
  emitted.style.gap = "2em";
  const back = parseToml(emitLocalToml(emitted));
  assert.equal(ran, 0, "the serialiser does not run one either");
  assert.deepEqual(back, { style: { gap: "2em" } }, "…so it cannot author a second key");
});

test("settings: every validator is total — wrong-typed input is false, never a throw", () => {
  const cyclic = {};
  cyclic.self = cyclic;
  const WRONG = [undefined, null, 0, -1, 1.5, NaN, Infinity, "", "x", true, false, [], {}, cyclic, () => {}];
  for (const e of SCHEMA) {
    for (const v of WRONG) {
      let out;
      assert.doesNotThrow(() => {
        out = e.validator(v);
      }, `${e.path}: validator threw`);
      assert.equal(typeof out, "boolean", `${e.path}: validators answer true/false`);
      if (v !== null && v !== undefined && typeof v === "object") {
        assert.equal(out === true, e.type === "list" && Array.isArray(v), `${e.path}: objects are not values`);
      }
    }
    // the type each entry claims is the type it accepts
    if (e.type === "bool") {
      assert.equal(e.validator(true), true);
      assert.equal(e.validator("true"), false, `${e.path}: a string is not a bool`);
    }
    if (e.type === "int") {
      assert.equal(e.validator(1.5), false, `${e.path}: floats have no parser branch`);
      assert.equal(e.validator("1"), false, `${e.path}: a numeric string is not an int`);
    }
    if (e.type === "string" || e.type === "enum") {
      assert.equal(e.validator(1), false, `${e.path}: a number is not a string`);
    }
  }
});
