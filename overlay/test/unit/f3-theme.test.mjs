// f3 — Theming: behavioral tests for the pure theme module (SDD RED).
// Spec: overlay/specs/f3-theming.md §2, §3, §4 (tests 1–12).
//
// Contract pinned by these tests (implementation follows the tests):
//   GRUVBOX — builtin palette constant {bg, fg, accent, color0..color15},
//     every value lowercase #rrggbb; always passes validatePalette.
//   parseWalJson(text) -> palette | null
//     pywal colors.json: bg = special.background, fg = special.foreground,
//     color0..15 from colors.*; accent defaults to color4. All-or-nothing:
//     malformed JSON, any missing key, or any invalid hex rejects the whole
//     source (null) — never a partial palette, never a throw.
//   parseThemeColors(table) -> palette | null
//     base16-style [theme.colors] table; same validation; accent optional,
//     defaults to color4.
//   validatePalette(obj) -> truthy/falsy — strict #rrggbb + completeness.
//     Validation is the CSS injection barrier.
//   resolvePalette({source, walText, tomlColors}) -> {palette, sourceUsed}
//     source: "auto" | "wal" | "toml" | "builtin". auto precedence
//     wal → toml → builtin; forced sources fall back to builtin only.
//     sourceUsed reports what actually applied: "wal" | "toml" | "builtin".
//   emitCss(palette) -> ":root { --aether-bg: …; … }" — exactly one
//     declaration per palette key, balanced braces, no undefined text.
//   expandPath(path, home) — "~/x" → home + "/x"; everything else unchanged.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  GRUVBOX,
  parseWalJson,
  parseThemeColors,
  validatePalette,
  resolvePalette,
  emitCss,
  expandPath,
} from "../../chrome/JS/aether-theme.sys.mjs";

// ---------------------------------------------------------------- fixtures

const PALETTE_KEYS = [
  "bg",
  "fg",
  "accent",
  ...Array.from({ length: 16 }, (_, i) => `color${i}`),
];

// Distinct, valid hexes so source→slot mapping is checkable.
const walColor = i => `#4455${(0x10 + i).toString(16)}`; // #445510..#44551f

function makeWalObj() {
  return {
    special: {
      background: "#1d2021",
      foreground: "#ebdbb2",
      cursor: "#ebdbb2",
    },
    colors: Object.fromEntries(
      Array.from({ length: 16 }, (_, i) => [`color${i}`, walColor(i)]),
    ),
  };
}

function makeTomlColors() {
  const t = { bg: "#101418", fg: "#d0d4d8" };
  for (let i = 0; i < 16; i++) t[`color${i}`] = `#2233${(0x40 + i).toString(16)}`;
  return t;
}

// 1. valid pywal colors.json ------------------------------------------------

test("theme: valid wal json → bg/fg from special, color0..15 from colors, accent = color4", () => {
  const p = parseWalJson(JSON.stringify(makeWalObj()));
  assert.ok(p, "valid wal json must produce a palette");
  assert.equal(p.bg, "#1d2021");
  assert.equal(p.fg, "#ebdbb2");
  for (let i = 0; i < 16; i++) {
    assert.equal(p[`color${i}`], walColor(i), `color${i} must come from colors.color${i}`);
  }
  assert.equal(p.accent, walColor(4), "accent must default to color4");
});

// 2. malformed JSON -----------------------------------------------------------

test("theme: malformed JSON text → null, no throw", () => {
  let r;
  assert.doesNotThrow(() => {
    r = parseWalJson("{ not json at all");
  });
  assert.equal(r, null);
  assert.equal(parseWalJson(""), null);
});

// 3. invalid color value rejects the whole source -----------------------------

test("theme: wal json with an invalid color value rejects the whole source", () => {
  for (const bad of ["red", "#fff", "#zzzzzz"]) {
    const w = makeWalObj();
    w.colors.color3 = bad;
    assert.equal(
      parseWalJson(JSON.stringify(w)),
      null,
      `value '${bad}' must reject the whole source, not just the slot`,
    );
  }
});

// 4. missing key → no partial palettes ---------------------------------------

test("theme: wal json missing a color key → source rejected, no partial palette", () => {
  const w = makeWalObj();
  delete w.colors.color7;
  assert.equal(parseWalJson(JSON.stringify(w)), null);
});

test("theme: wal json missing special.background → source rejected", () => {
  const w = makeWalObj();
  delete w.special.background;
  assert.equal(parseWalJson(JSON.stringify(w)), null);
});

// 5. uppercase hex normalized -------------------------------------------------

test("theme: uppercase hex accepted and normalized to lowercase", () => {
  const w = makeWalObj();
  w.special.background = "#1D2021";
  w.colors.color0 = "#ABCDEF";
  const p = parseWalJson(JSON.stringify(w));
  assert.ok(p, "uppercase hex must be accepted");
  assert.equal(p.bg, "#1d2021");
  assert.equal(p.color0, "#abcdef");
});

// 6. TOML colors table --------------------------------------------------------

test("theme: valid [theme.colors] table validates; accent absent defaults to color4", () => {
  const t = makeTomlColors(); // no accent key
  const p = parseThemeColors(t);
  assert.ok(p, "complete toml colors table must produce a palette");
  assert.equal(p.bg, t.bg);
  assert.equal(p.fg, t.fg);
  assert.equal(p.accent, t.color4, "absent accent must default to color4");
});

test("theme: [theme.colors] with an explicit accent keeps it", () => {
  const t = makeTomlColors();
  t.accent = "#a1b2c3";
  const p = parseThemeColors(t);
  assert.ok(p);
  assert.equal(p.accent, "#a1b2c3");
});

test("theme: incomplete or invalid [theme.colors] table → null", () => {
  const missing = makeTomlColors();
  delete missing.color15;
  assert.equal(parseThemeColors(missing), null);

  const invalid = makeTomlColors();
  invalid.fg = "not-a-color";
  assert.equal(parseThemeColors(invalid), null);
});

// 7. auto precedence ----------------------------------------------------------

test("theme: auto — valid wal wins, sourceUsed 'wal'", () => {
  const { palette, sourceUsed } = resolvePalette({
    source: "auto",
    walText: JSON.stringify(makeWalObj()),
    tomlColors: makeTomlColors(),
  });
  assert.equal(sourceUsed, "wal");
  assert.equal(palette.bg, "#1d2021");
  assert.equal(palette.color0, walColor(0));
});

test("theme: auto — invalid wal falls to toml colors, sourceUsed 'toml'", () => {
  const t = makeTomlColors();
  const { palette, sourceUsed } = resolvePalette({
    source: "auto",
    walText: "{ broken",
    tomlColors: t,
  });
  assert.equal(sourceUsed, "toml");
  assert.equal(palette.bg, t.bg);
});

test("theme: auto — missing wal file (null text) falls to toml", () => {
  const t = makeTomlColors();
  const { sourceUsed } = resolvePalette({
    source: "auto",
    walText: null,
    tomlColors: t,
  });
  assert.equal(sourceUsed, "toml");
});

test("theme: auto — both sources invalid → GRUVBOX, sourceUsed 'builtin'", () => {
  const { palette, sourceUsed } = resolvePalette({
    source: "auto",
    walText: "nope",
    tomlColors: { bg: "red" },
  });
  assert.equal(sourceUsed, "builtin");
  assert.deepEqual(palette, GRUVBOX);
});

// 8. forced sources -----------------------------------------------------------

test("theme: forced source 'toml' ignores a valid wal file", () => {
  const t = makeTomlColors();
  const { palette, sourceUsed } = resolvePalette({
    source: "toml",
    walText: JSON.stringify(makeWalObj()), // perfectly valid — must be ignored
    tomlColors: t,
  });
  assert.equal(sourceUsed, "toml");
  assert.equal(palette.bg, t.bg);
});

test("theme: forced source 'wal' with unreadable/invalid wal falls back to builtin, never a broken theme", () => {
  for (const walText of [null, "{ broken"]) {
    const { palette, sourceUsed } = resolvePalette({
      source: "wal",
      walText,
      tomlColors: makeTomlColors(), // valid toml must NOT be used when wal is forced
    });
    assert.equal(sourceUsed, "builtin");
    assert.deepEqual(palette, GRUVBOX);
    assert.ok(validatePalette(palette), "fallback palette must always validate");
  }
});

test("theme: forced source 'builtin' ignores both sources", () => {
  const { palette, sourceUsed } = resolvePalette({
    source: "builtin",
    walText: JSON.stringify(makeWalObj()),
    tomlColors: makeTomlColors(),
  });
  assert.equal(sourceUsed, "builtin");
  assert.deepEqual(palette, GRUVBOX);
});

// 9. the fallback can never itself fail --------------------------------------

test("theme: GRUVBOX passes validatePalette (guard)", () => {
  assert.ok(validatePalette(GRUVBOX));
  // and it is shaped exactly like every other palette
  assert.deepEqual(Object.keys(GRUVBOX).sort(), [...PALETTE_KEYS].sort());
  for (const [k, v] of Object.entries(GRUVBOX)) {
    assert.match(v, /^#[0-9a-f]{6}$/, `GRUVBOX.${k} must be lowercase #rrggbb`);
  }
});

// 10. emitCss shape -----------------------------------------------------------

test("theme: emitCss emits exactly one declaration per palette key, balanced braces, no undefined", () => {
  const css = emitCss(GRUVBOX);
  assert.equal(typeof css, "string");
  assert.ok(css.includes(":root"), "vars must land on :root");

  for (const key of PALETTE_KEYS) {
    const decl = new RegExp(`--aether-${key}\\s*:`, "g");
    const n = (css.match(decl) ?? []).length;
    assert.equal(n, 1, `--aether-${key} must be declared exactly once (got ${n})`);
  }
  // no stray declarations beyond the 19 palette keys
  const all = css.match(/--aether-[a-z0-9]+\s*:/g) ?? [];
  assert.equal(all.length, PALETTE_KEYS.length);

  assert.equal((css.match(/\{/g) ?? []).length, (css.match(/\}/g) ?? []).length);
  assert.ok(!css.includes("undefined"), "emitted CSS must never contain 'undefined'");

  // every value made it through verbatim
  for (const key of PALETTE_KEYS) {
    assert.ok(css.includes(GRUVBOX[key]), `emitted CSS must contain ${key}'s hex`);
  }
});

// 11. injection guard ---------------------------------------------------------

test("theme: values that could escape the declaration block are rejected by validation", () => {
  const evil = "#123456; } :root { --evil: 1";
  assert.ok(!validatePalette({ ...GRUVBOX, bg: evil }), "escape-shaped value must not validate");
  const w = makeWalObj();
  w.special.background = evil;
  assert.equal(parseWalJson(JSON.stringify(w)), null, "wal source carrying it is rejected whole");
  const t = makeTomlColors();
  t.accent = evil;
  assert.equal(parseThemeColors(t), null, "toml source carrying it is rejected whole");
});

test("theme: emitted CSS contains only the block's own braces — none sourced from values", () => {
  // resolvePalette output is the only thing glue ever emits; even fed hostile
  // sources it must come out as exactly one rule block.
  const w = makeWalObj();
  w.colors.color9 = "#123456; } :root { --evil: 1";
  const { palette } = resolvePalette({
    source: "auto",
    walText: JSON.stringify(w),
    tomlColors: { bg: "} html { display: none } {" },
  });
  const css = emitCss(palette);
  assert.equal((css.match(/\{/g) ?? []).length, 1, "exactly one opening brace");
  assert.equal((css.match(/\}/g) ?? []).length, 1, "exactly one closing brace");
  assert.ok(!css.includes("--evil"));
});

// 12. expandPath --------------------------------------------------------------

test("theme: expandPath expands leading ~/ against home", () => {
  assert.equal(expandPath("~/.cache/wal/colors.json", "/home/me"), "/home/me/.cache/wal/colors.json");
  assert.equal(expandPath("~/x", "/home/me"), "/home/me/x");
});

test("theme: expandPath passes absolute and ~-free paths through unchanged", () => {
  assert.equal(expandPath("/etc/colors.json", "/home/me"), "/etc/colors.json");
  assert.equal(expandPath("relative/colors.json", "/home/me"), "relative/colors.json");
});
