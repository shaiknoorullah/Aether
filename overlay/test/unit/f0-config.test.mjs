// Unit tests for the pure functions in aether-config.sys.mjs.
// Runs on plain node:test — no browser globals, no npm deps.
// AetherConfig.load() (Services/IOUtils) is deliberately NOT exercised here;
// its merge semantics are covered via deepMerge(DEFAULTS, parseToml(...)).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parseToml,
  deepMerge,
  AetherConfig,
} from "../../chrome/JS/aether-config.sys.mjs";

// ---------------------------------------------------------------- parseToml

test("parseToml: top-level sections", () => {
  const cfg = parseToml(`
[options]
scroll_step = 200
`);
  assert.deepEqual(cfg, { options: { scroll_step: 200 } });
});

test("parseToml: nested sections via dotted headers", () => {
  const cfg = parseToml(`
[keymap.normal]
j = "scroll_down"

[keymap.reserved]
x = "tab_close"
`);
  assert.deepEqual(cfg, {
    keymap: {
      normal: { j: "scroll_down" },
      reserved: { x: "tab_close" },
    },
  });
});

test("parseToml: strings", () => {
  const cfg = parseToml(`hint_chars = "asdfghjkl"`);
  assert.equal(cfg.hint_chars, "asdfghjkl");
});

test("parseToml: integers, including negative", () => {
  const cfg = parseToml(`
step = 120
offset = -5
`);
  assert.equal(cfg.step, 120);
  assert.equal(cfg.offset, -5);
});

test("parseToml: booleans", () => {
  const cfg = parseToml(`
statusbar_clock = true
telemetry = false
`);
  assert.equal(cfg.statusbar_clock, true);
  assert.equal(cfg.telemetry, false);
});

test("parseToml: arrays of strings and ints", () => {
  const cfg = parseToml(`
chars = ["a", "b", "c"]
nums = [1, 2, 3]
`);
  assert.deepEqual(cfg.chars, ["a", "b", "c"]);
  assert.deepEqual(cfg.nums, [1, 2, 3]);
});

test("parseToml: full-line and trailing comments", () => {
  const cfg = parseToml(`
# a full-line comment
scroll_step = 120  # trailing comment
`);
  assert.deepEqual(cfg, { scroll_step: 120 });
});

test("parseToml: hash inside a quoted string is not a comment", () => {
  const cfg = parseToml(`hint_chars = "ab#cd"`);
  assert.equal(cfg.hint_chars, "ab#cd");
});

test('parseToml: quoted keys ("C-w" style)', () => {
  const cfg = parseToml(`
[keymap.reserved]
"C-w" = "tab_close"
"C-Tab" = "tab_next"
`);
  assert.deepEqual(cfg.keymap.reserved, {
    "C-w": "tab_close",
    "C-Tab": "tab_next",
  });
});

test("parseToml: malformed lines are skipped, not fatal", () => {
  const cfg = parseToml(`
this line has no equals sign
[options]
scroll_step = 120
just garbage here
`);
  assert.deepEqual(cfg, { options: { scroll_step: 120 } });
});

test("parseToml: blank input yields an empty object", () => {
  assert.deepEqual(parseToml(""), {});
  assert.deepEqual(parseToml("\n\n  \n# only a comment\n"), {});
});

// ---------------------------- deepMerge (AetherConfig.load merge semantics)

test("deepMerge: user value overrides default, siblings preserved", () => {
  const merged = deepMerge(
    AetherConfig.DEFAULTS,
    parseToml(`
[options]
scroll_step = 200
`),
  );
  assert.equal(merged.options.scroll_step, 200); // overridden
  assert.equal(merged.options.hint_chars, "asdfghjkl"); // default kept
  assert.equal(merged.options.statusbar_clock, true); // default kept
});

test("deepMerge: nested keymap override keeps the rest of the default keymap", () => {
  const merged = deepMerge(
    AetherConfig.DEFAULTS,
    parseToml(`
[keymap.normal]
j = "half_down"
`),
  );
  assert.equal(merged.keymap.normal.j, "half_down"); // overridden
  assert.equal(merged.keymap.normal.k, "scroll_up"); // default kept
  assert.equal(merged.keymap.reserved["C-w"], "tab_close"); // sibling section kept
});

test("deepMerge: extra keys with no default counterpart are added", () => {
  const merged = deepMerge(
    AetherConfig.DEFAULTS,
    parseToml(`
[keymap.normal]
q = "quit"
`),
  );
  assert.equal(merged.keymap.normal.q, "quit");
  assert.equal(merged.keymap.normal.j, "scroll_down");
});

test("deepMerge: arrays replace, not merge", () => {
  const merged = deepMerge({ list: [1, 2, 3] }, { list: [9] });
  assert.deepEqual(merged.list, [9]);
});

test("deepMerge: does not mutate DEFAULTS", () => {
  const before = JSON.stringify(AetherConfig.DEFAULTS);
  deepMerge(AetherConfig.DEFAULTS, {
    options: { scroll_step: 999 },
    keymap: { normal: { j: "nope" } },
  });
  assert.equal(JSON.stringify(AetherConfig.DEFAULTS), before);
});
