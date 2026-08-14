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

// --------------------------------------------- parseToml: the {ok} result (r1)
// The parser keeps producing exactly the sections it always did — every config
// test above and every sync guard compares the return value to a plain object —
// and additionally reports whether the source was well-formed. `ok`, `sections`
// and `errorLine` are non-enumerable on purpose: a partially-read file must be
// *refusable* by the loader (r1), and the dotfile-shaped return value must stay
// byte-compatible for every existing caller.

test("parseToml: a well-formed source reports ok with no error line", () => {
  const cfg = parseToml(`
# a comment
[options]
scroll_step = 120

[keymap.normal]
"j" = "scroll_down"
`);
  assert.equal(cfg.ok, true);
  assert.equal(cfg.errorLine, null);
  assert.equal(cfg.sections, cfg, "sections is the parsed table itself");
  assert.deepEqual(cfg, {
    options: { scroll_step: 120 },
    keymap: { normal: { j: "scroll_down" } },
  });
});

test("parseToml: {ok, sections, errorLine} destructures", () => {
  const { ok, sections, errorLine } = parseToml(`[options]\nscroll_step = 1\n`);
  assert.equal(ok, true);
  assert.equal(errorLine, null);
  assert.deepEqual(sections, { options: { scroll_step: 1 } });
});

test("parseToml: the result's metadata never shows up as config", () => {
  const cfg = parseToml(`[options]\nscroll_step = 1\n`);
  assert.deepEqual(Object.keys(cfg), ["options"]);
  assert.equal(JSON.stringify(cfg), '{"options":{"scroll_step":1}}');
});

test("parseToml: the first line that is neither blank, comment, section nor key = value is rejected", () => {
  const cfg = parseToml(`
this line has no equals sign
[options]
scroll_step = 120
just garbage here
`);
  assert.equal(cfg.ok, false);
  assert.equal(cfg.errorLine, 2, "1-based, and the FIRST offending line");
});

test("parseToml: an unterminated section header is rejected", () => {
  const cfg = parseToml(`[options\nscroll_step = 120\n`);
  assert.equal(cfg.ok, false);
  assert.equal(cfg.errorLine, 1);
});

test("parseToml: a key with no name is rejected", () => {
  const cfg = parseToml(`[options]\n= 120\n`);
  assert.equal(cfg.ok, false);
  assert.equal(cfg.errorLine, 2);
});

test("parseToml: a file truncated mid-write is rejected, never half-merged", () => {
  // cut mid-key: a valid prefix followed by a fragment
  const cfg = parseToml(`[options]\nscroll_step = 120\nhint_ch`);
  assert.equal(cfg.ok, false, "a valid prefix plus a cut line is not a config");
  assert.equal(cfg.errorLine, 3);
});

test("parseToml: a key cut just after its '=' is rejected, not read as empty", () => {
  const cfg = parseToml(`[options]\nhint_chars = \n`);
  assert.equal(cfg.ok, false, "the other half of a mid-write");
  assert.equal(cfg.errorLine, 2);
});

test("parseToml: comments, blanks and quoted keys never trip the rejection", () => {
  const cfg = parseToml(`
# comment

  # indented comment
[keymap.reserved]
"C-w" = "tab_close"
widgets = ["mode", "url"]
hint_chars = "ab#cd"  # trailing comment
`);
  assert.equal(cfg.ok, true);
  assert.equal(cfg.errorLine, null);
});

test("parseToml: an empty source is well-formed", () => {
  assert.equal(parseToml("").ok, true);
  assert.equal(parseToml("\n\n  \n# only a comment\n").ok, true);
});

test("parseToml: a section literally named ok keeps its own value", () => {
  // The metadata is additive, never a squatter on the user's namespace: a
  // dotfile that uses one of the metadata names simply wins, and the parse
  // degrades to the shipped forgiving behaviour rather than losing data.
  const cfg = parseToml(`[ok]\nsafe = 1\n`);
  assert.deepEqual(cfg.ok, { safe: 1 });
  assert.deepEqual(cfg, { ok: { safe: 1 } });
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

// security: prototype pollution via dotfile section/key names must be inert
import { test as ptest } from "node:test";
import passert from "node:assert/strict";
ptest("parseToml never grafts onto Object.prototype", () => {
  const evil = [
    "[__proto__]", 'polluted = "yes"',
    "[a.__proto__.b]", 'x = 1',
    "[constructor.prototype]", 'y = 2',
    "[ok]", '"__proto__" = "no"', 'safe = 1',
  ].join("\n");
  const out = parseToml(evil);
  passert.equal({}.polluted, undefined);
  passert.equal(Object.prototype.polluted, undefined);
  passert.equal({}.x, undefined);
  passert.equal({}.y, undefined);
  passert.equal(out.ok.safe, 1);
  passert.equal(Object.hasOwn(out.ok, "__proto__"), false);
});

// ------------------------------------------- v1.2.0 shared config surface (r1–r5)
// The f1 sync guard already asserts the whole example TOML parses to exactly
// DEFAULTS; these name the individual keys so a drift reports which one.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const EXAMPLE_TOML = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "config",
  "aether.toml",
);
const EXAMPLE = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));

test("config: the example dotfile is itself well-formed under the strict parser", () => {
  assert.equal(EXAMPLE.ok, true, "overlay/config/aether.toml must parse cleanly");
  assert.equal(EXAMPLE.errorLine, null);
});

test("config: options.config_watch defaults to true (r1: save-to-apply)", () => {
  assert.equal(AetherConfig.DEFAULTS.options.config_watch, true);
  assert.equal(EXAMPLE.options.config_watch, true);
});

test("config: options.which_key_ms defaults to 400 (r3)", () => {
  assert.equal(AetherConfig.DEFAULTS.options.which_key_ms, 400);
  assert.equal(EXAMPLE.options.which_key_ms, 400);
});

test("config: [style] defaults are the values userChrome.css hardcodes today (r2)", () => {
  assert.deepEqual(AetherConfig.DEFAULTS.style, {
    radius: "2px",
    gap: "1em",
    pad_y: "0",
    pad_x: "8px",
    row_pad_y: "2px",
    row_pad_x: "8px",
    border: "1px",
    panel_width: "38rem",
    panel_height: "60vh",
    opacity: 100,
    blur: "0",
    font: "monospace",
    font_size: "12px",
    motion_ms: 120,
    motion_ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    motion: true,
  });
  assert.deepEqual(EXAMPLE.style, AetherConfig.DEFAULTS.style);
});

test("config: [style] carries no floats — the parser has no float branch (r2)", () => {
  for (const [key, value] of Object.entries(AetherConfig.DEFAULTS.style)) {
    if (typeof value === "number") {
      assert.ok(Number.isInteger(value), `style.${key} must be an integer`);
    }
  }
});

test("config: [panels] scope defaults to the current workspace (r4)", () => {
  assert.equal(AetherConfig.DEFAULTS.panels.scope, "workspace");
  assert.equal(EXAMPLE.panels.scope, "workspace");
});

test("config: [privacy] doh defaults to fallback with a resolver url (r5)", () => {
  assert.equal(AetherConfig.DEFAULTS.privacy.doh, "fallback");
  assert.equal(
    AetherConfig.DEFAULTS.privacy.doh_url,
    "https://dns.quad9.net/dns-query",
  );
  assert.deepEqual(EXAMPLE.privacy, AetherConfig.DEFAULTS.privacy);
});

test("config: v1.2.0 rebinds only what its specs cut, and never 'r'", () => {
  const { normal } = AetherConfig.DEFAULTS.keymap;
  // The collision this guard exists for: config reload must never take the key
  // page reload already owns.
  assert.equal(normal.r, "reload", "'r' is still page reload, never config reload");
  assert.equal(normal[":"], "palette");
  // r4 rebinds T deliberately — the vertical strip it toggled is deleted, and
  // f4's sidebar prefs are reverted in the same change so the native strip
  // cannot render in its place.
  assert.equal(normal.T, "tabs");
  assert.equal(normal.m, "mark_set<char>");
  assert.equal(normal["1"], "tab_pin_goto 1");
  assert.equal(normal["?"], "which_key");
});
