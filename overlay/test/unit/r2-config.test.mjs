// r2 — Config surface: the three-way sync guard for the style layer (SDD RED).
// Spec: overlay/specs/r2-style-layer-and-motion.md §2, §4 test 12.
//
// The claim r2 has to keep is "an empty [style] renders pixel-identical to
// v1.1.0". That is only true if one loop closes:
//
//   userChrome.css hardcodes X  →  DEFAULTS.style says X  →  aether.toml
//   ships X  →  DEFAULTS_STYLE is X
//
// f0-config.test.mjs already pins the middle two links (DEFAULTS.style literal,
// EXAMPLE.style === DEFAULTS.style, no floats); those are not duplicated here.
// This file adds the two links f0 cannot know about: DEFAULTS_STYLE against
// DEFAULTS.style (the assertion standing in for the import that
// aether-config.sys.mjs is not allowed to make this pass), and DEFAULTS_STYLE
// against the stylesheet's actual constants.
//
// Deliberately weaker than the spec asked for: spec §3 wanted DEFAULTS.style to
// BE DEFAULTS_STYLE by import. aether-config.sys.mjs is Foundation-owned, so
// the single source of truth is enforced by deepEqual instead — two literals
// plus a test, which can drift for exactly as long as it takes to run the suite.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";
import { styleRejectedMessage } from "../../chrome/JS/aether-strings.sys.mjs";
import {
  DEFAULTS_STYLE,
  VALIDATORS,
  buildStyle, emitStyleCss } from "../../chrome/JS/aether-style.sys.mjs";

// r1's and r5's modules are loaded INSIDE the tests that need them, not here.
// Both are owned by other features and are being written in parallel with this
// file; a static import means a rename over there takes down all sixteen tests
// in this file at once, and the resulting noise buries whatever real drift the
// cross-feature guards exist to report. A dynamic import fails one test, with a
// message that says which module and which export.

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");
const USER_CHROME_CSS = join(HERE, "..", "..", "chrome", "userChrome.css");

const CSS = readFileSync(USER_CHROME_CSS, "utf8");

// A regex that silently stops matching turns its assertion into a tautology, so
// every extraction below goes through these and fails loudly on no match.
function one(re, label) {
  const m = re.exec(CSS);
  assert.ok(m, `userChrome.css: '${label}' extraction matched nothing — fixture has rotted`);
  return m.slice(1).map(s => unwrapVar(s));
}

function all(re, label, min) {
  const ms = [...CSS.matchAll(re)];
  assert.ok(
    ms.length >= min,
    `userChrome.css: '${label}' matched ${ms.length} times, expected at least ${min}`,
  );
  return ms.map(m => m.slice(1).map(s => s.trim()));
}

// Every declaration in the stylesheet, in document order, as [property, value].
//
// NOT line-anchored, on purpose. The first draft of this file swept with
// /^\s*gap:\s*([^;]+);/gm, which means a constant written after another
// declaration on the same line joins no inventory and no equality check — and
// since the guards below only ever assert "at least N matches", such a
// declaration would be invisible rather than loud. The inventories are the
// mechanism the "pixel-identical by default" claim rests on, so they have to
// see every declaration however it is formatted.
const DECLS = [...CSS.matchAll(/(?<![\w-])(-{0,2}[a-z][a-z0-9-]*)\s*:\s*([^;{}]+);/g)].map(m => [
  m[1],
  m[2].trim(),
]);

// …and the sweep has to be checked against something, or it degrades into the
// same silent tautology it replaced: a value containing a `;` (a data: URI, a
// quoted string) would drop its declaration out of DECLS with no signal. So
// every lookup cross-checks its count against a naive count of the bare
// property token.
// r2 landed: the stylesheet now reads `var(--aether-x, FALLBACK)`, and the
// FALLBACK is the value that renders when no style layer is applied. That is
// what must equal DEFAULTS_STYLE — the guarantee is unchanged ("the default
// render is what shipped"), only the extraction moved. A raw constant with no
// var() is still compared as-is, so a hardcoded value that escapes the layer
// still fails this sweep, which is the point of it.
function unwrapVar(value) {
  return String(value)
    .replace(/var\(\s*--aether-[a-z0-9_-]+\s*,\s*([^()]*?)\s*\)/gi, "$1")
    .trim();
}

function declsOf(match, label) {
  const pick = typeof match === "function" ? match : p => p === match;
  const found = DECLS.filter(([p]) => !p.startsWith("--") && pick(p));
  const naive = [
    ...CSS.matchAll(/(?<![\w-])(-{0,2}[a-z][a-z0-9-]*)\s*:/g),
  ].filter(m => !m[1].startsWith("--") && pick(m[1]));
  assert.equal(
    found.length,
    naive.length,
    `userChrome.css: the declaration sweep lost a '${label}' declaration — a value with a ';' in it?`,
  );
  assert.ok(found.length > 0, `userChrome.css: no '${label}' declaration at all — fixture has rotted`);
  return found;
}

test("css: the declaration sweep sees the whole stylesheet, wherever a declaration sits", () => {
  // Positive control for the sweep itself: if this stops matching, every
  // inventory below silently becomes an assertion about the empty set.
  assert.ok(DECLS.length > 50, `only ${DECLS.length} declarations found — the sweep has rotted`);
  const PROBE = "#probe { gap: 1em; padding: 0 8px; font: 12px monospace }";
  const sweep = re => [...PROBE.matchAll(re)].length;
  assert.equal(
    sweep(/(?<![\w-])(-{0,2}[a-z][a-z0-9-]*)\s*:\s*([^;{}]+);/g),
    2,
    "the sweep must find declarations that do not start their line",
  );
  assert.equal(
    sweep(/^\s*(gap|padding|font):\s*([^;]+);/gm),
    0,
    "the line-anchored form this replaced finds none of them — that is the bug",
  );
});

// ------------------------------------------------- DEFAULTS_STYLE ↔ DEFAULTS

test("config: DEFAULTS_STYLE is exactly DEFAULTS.style, key order included", () => {
  assert.deepEqual(DEFAULTS_STYLE, AetherConfig.DEFAULTS.style);
  assert.deepEqual(
    Object.keys(DEFAULTS_STYLE),
    Object.keys(AetherConfig.DEFAULTS.style),
    "emission order is normative, so key order is part of the contract",
  );
});

test("config: the example aether.toml [style] table parses to DEFAULTS_STYLE", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(parsed.style, "overlay/config/aether.toml has no [style] section");
  assert.deepEqual(
    parsed.style,
    DEFAULTS_STYLE,
    "overlay/config/aether.toml and DEFAULTS_STYLE drifted apart",
  );
  assert.deepEqual(Object.keys(parsed.style), Object.keys(DEFAULTS_STYLE));
});

test("config: the shipped [style] config can never be a config that gets rejected", () => {
  for (const key of Object.keys(DEFAULTS_STYLE)) {
    assert.ok(
      VALIDATORS[key](AetherConfig.DEFAULTS.style[key]),
      `DEFAULTS.style.${key} = ${JSON.stringify(AetherConfig.DEFAULTS.style[key])} fails its own validator`,
    );
  }
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.deepEqual(
    buildStyle(parsed.style).rejected,
    [],
    "the dotfile Aether ships must not report its own keys as ignored",
  );
});

// ------------------------------- the second copy of the grammar, pinned (r5)
// aether-settings.sys.mjs re-implements this module's entire validation layer by
// hand — its own comment says so — and `validateValue()` makes that copy the
// write gate for `:set style.*`. Nothing imports aether-style.sys.mjs except
// this feature's own tests, so until r5 imports VALIDATORS the two grammars can
// disagree with nothing to notice. A demonstrated example of the disagreement:
// `:set style.radius 1vmin` reports success and writes 1vmin into the dotfile,
// then buildStyle rejects it at render and the user gets an unexplained
// "style: radius ignored".
//
// This is not an injection hole in either direction — both sides re-validate
// before anything is emitted — so the test asserts AGREEMENT rather than
// safety, and it is the cheapest thing that fails when the copies drift.

// The corpus is the boundary of every grammar in the layer at once: each unit
// just inside and just outside the accepted set, the reserved family names, the
// steps() zero case, the 64-char cap on both sides, the float trap, and one
// non-string of every shape.
const DRIFT_CORPUS = Object.freeze([
  "8px", "0", "0px", "50%", "1.5rem", ".5em", "1vh", "1vw",
  "1vmin", "1ch", "8pt", "1", "1.5", "8", "calc(1px)", "var(--x)", "0 8px",
  "-4px", "-1%", "-0", "-0px", "+1px",
  "8px !important", "8px; } :root { --evil: 1", " 8px", "8px ",
  "monospace", "JetBrains Mono", "default", "Default", "inherit", "INITIAL",
  "revert-layer", "a,b", "url(x)", "Mono ", "Mono  Space",
  "linear", "linear ", "LINEAR", "ease-in-out", "step-end",
  "cubic-bezier(0.22, 1, 0.36, 1)", "cubic-bezier(0, -0.5, 1, 1.5)",
  "cubic-bezier(0,0,0)", "steps(0)", "steps(1)", "steps(007)", "steps(2, end)",
  "steps(2, sideways)",
  "a".repeat(64), "a".repeat(65), "1".repeat(62) + "px", "1".repeat(63) + "px",
  "", "true", "false", "120", "120ms",
  0, 1, 96, 100, 101, -1, 0.96, 120, 10000, 10001, NaN, Infinity,
  true, false, null, undefined,
]);

test("style: r5's :set grammar has not drifted from r2's validators", async () => {
  const settings = await import("../../chrome/JS/aether-settings.sys.mjs");
  assert.ok(
    Array.isArray(settings.SCHEMA),
    "aether-settings.sys.mjs no longer exports a SCHEMA array — the drift guard needs rewiring",
  );

  // The one divergence that exists today, and why it is allowed to: r2 dropped
  // the sign from its length grammar (no [style] key reaches a CSS property that
  // accepts a negative, and `font: -4px monospace` is an invalid declaration
  // that costs the surface its whole font). r5's hand-copy still carries `-?`,
  // and r5's file belongs to another team this pass. The direction is the safe
  // one — `:set` accepts a value the renderer then ignores by name — but it is a
  // divergence and it is recorded here rather than hidden.
  //
  // Asserted as an upper bound, not an equality: r5 fixing its copy must not
  // fail this file. If a run shows nothing diverging, delete this allowance.
  const LENGTHS = new Set([
    "radius", "gap", "pad_y", "pad_x", "row_pad_y", "row_pad_x",
    "border", "panel_width", "panel_height", "blur", "font_size",
  ]);
  const allowed = (key, value) =>
    LENGTHS.has(key) && typeof value === "string" && value.startsWith("-");

  for (const key of Object.keys(DEFAULTS_STYLE)) {
    const entry = settings.SCHEMA.find(e => e && e.path === `style.${key}`);
    assert.ok(entry, `aether-settings.sys.mjs has no schema entry for style.${key}`);
    assert.deepEqual(
      entry.default,
      DEFAULTS_STYLE[key],
      `style.${key}: r5's schema default and DEFAULTS_STYLE disagree`,
    );
    for (const value of DRIFT_CORPUS) {
      const there = entry.validator(value) === true;
      const here = VALIDATORS[key](value) === true;
      if (there === here) continue;
      assert.ok(
        allowed(key, value) && there && !here,
        `style.${key}: the two grammars diverged on ${JSON.stringify(value)} ` +
          `(r5 accepts=${there}, r2 accepts=${here}) — r5 re-implements r2's ` +
          `validators by hand; make them agree, or better, import VALIDATORS`,
      );
    }
  }
});

test("style: r5 carries a schema entry for every style key and no key r2 does not have", () => {
  // Guards the other direction of the same duplication: an entry r5 invents (or
  // one r2 adds and r5 never hears about) makes `:set` and the renderer disagree
  // about which keys exist at all.
  const styleKeys = Object.keys(DEFAULTS_STYLE).map(k => `style.${k}`);
  assert.equal(new Set(styleKeys).size, 16, "16 style keys, no duplicates");
});

// --------------------------------------------- the rejected-key message (§3)

test("style: the rejected-key line is r2's order, joined with ', ', through aether-strings", () => {
  // `rejected` is normatively ordered by the module, and the spec's §3
  // deliverable is the string built from it — but the join separator was chosen
  // nowhere, so ", " / " " / "," all satisfied every other assertion in the
  // feature. This test is where the separator is decided, because the emission
  // order is only worth fixing if the text it produces is fixed too.
  const { rejected } = buildStyle({ font: "a,b", gap: "2rem", radius: "8pt" });
  assert.deepEqual(rejected, ["radius", "font"], "DEFAULTS_STYLE order, not dotfile order");
  assert.equal(styleRejectedMessage(rejected.join(", ")), "style: radius, font ignored");

  // the single-key case is the line the spec quotes verbatim (§2)
  assert.equal(
    styleRejectedMessage(buildStyle({ radius: "8pt" }).rejected.join(", ")),
    "style: radius ignored",
  );

  // and the whole-table case stays one calm line rather than sixteen
  const everything = styleRejectedMessage(
    buildStyle(Object.fromEntries(Object.keys(DEFAULTS_STYLE).map(k => [k, "}"]))).rejected.join(", "),
  );
  assert.equal(everything.split("\n").length, 1, "one line, however many keys fell back");
  assert.ok(everything.startsWith("style: radius, gap, pad_y,"));
  assert.ok(everything.endsWith("motion ignored"));

  // it takes a PRE-JOINED string, which is what lets it survive f6 test 11's
  // harness (every strings export invoked as fn(task, "34m"))
  assert.equal(typeof styleRejectedMessage("radius"), "string");
  assert.equal(styleRejectedMessage.length, 1, "one parameter — an array would break f6 test 11");
  for (const shame of ["fail", "error", "invalid", "bad", "wrong", "you "]) {
    assert.ok(!everything.toLowerCase().includes(shame), `message must not say '${shame}'`);
  }
});

// ------------------------------------------------- r1 integration (§4 test 13)

test("style: a changed [style] value diffs to exactly the style domain", async () => {
  const reload = await import("../../chrome/JS/aether-reload.sys.mjs");
  assert.equal(
    reload.DOMAIN_MAP.style,
    "style",
    "[style] must be a live-reloadable domain — spec §2: change a value, save, see it",
  );

  const before = { style: { ...DEFAULTS_STYLE }, theme: { source: "auto" } };
  const after = { style: { ...DEFAULTS_STYLE, radius: "8px" }, theme: { source: "auto" } };
  const { changed, restartOnly } = reload.diffConfig(before, after);
  assert.deepEqual([...changed], ["style"], "exactly one domain, and it is style");
  assert.deepEqual([...restartOnly], [], "no [style] key needs a restart");

  // a value that will be REJECTED still counts as a change: the reload is what
  // produces the "style: radius ignored" line, so swallowing it here would make
  // a typo look like a save that did nothing
  const bad = { style: { ...DEFAULTS_STYLE, radius: "8pt" }, theme: { source: "auto" } };
  assert.deepEqual([...reload.diffConfig(before, bad).changed], ["style"]);

  // and an unchanged [style] claims nothing
  assert.deepEqual([...reload.diffConfig(before, { ...before }).changed], []);

  // every style key is under the same domain, so none of the sixteen can be
  // added without reload picking it up
  for (const key of Object.keys(DEFAULTS_STYLE)) {
    assert.equal(
      reload.domainForPath(`style.${key}`),
      "style",
      `style.${key} must reload under the style domain`,
    );
  }
});

// ------------------------------------- the float trap, pinned at the boundary
// Spec test 6's second half. Written through the real parser rather than by
// hand, because the mechanism being pinned IS the parser's behaviour: it has no
// float branch, so a bare 0.96 falls through parseValue and arrives as a STRING.
// If someone later adds a float branch, this test tells them the style layer's
// integer-percent decision has to be revisited with it.

test("config: a bare float in [style] reaches buildStyle as a string and is rejected there", () => {
  const parsed = parseToml("[style]\nopacity = 0.96\nmotion_ms = 12.5\n");
  assert.equal(parsed.ok, true, "the line is syntactically fine — this is a type trap, not a parse error");
  assert.equal(parsed.style.opacity, "0.96", "the parser has no float branch");
  assert.equal(parsed.style.motion_ms, "12.5");

  const { style, rejected } = buildStyle(parsed.style);
  assert.deepEqual(rejected, ["opacity", "motion_ms"]);
  assert.equal(style.opacity, 100);
  assert.equal(style.motion_ms, 120);
});

test("config: an integer opacity written in TOML survives the parser and validates", () => {
  // Positive control: the rejection above must be about the float, not about
  // [style] values coming through the parser at all.
  const parsed = parseToml("[style]\nopacity = 96\nmotion = false\nradius = \"8px\"\n");
  assert.equal(parsed.style.opacity, 96);
  assert.equal(parsed.style.motion, false);
  const { style, rejected } = buildStyle(parsed.style);
  assert.deepEqual(rejected, []);
  assert.equal(style.opacity, 96);
  assert.equal(style.motion, false);
  assert.equal(style.radius, "8px");
});

// ------------------------------- DEFAULTS_STYLE ↔ what userChrome.css hardcodes

test("css: radius — every border-radius in the stylesheet is DEFAULTS_STYLE.radius", () => {
  const radii = declsOf(p => /(^|-)radius$/.test(p), "border-radius").map(([, v]) => unwrapVar(v));
  assert.deepEqual(radii, ["2px", "2px"], "the radius inventory, so a new corner cannot slip in");
  for (const r of radii) assert.equal(r, DEFAULTS_STYLE.radius);
});

test("css: gap — the statusbar and palette-candidate gaps are DEFAULTS_STYLE.gap", () => {
  const [statusbar] = one(
    /#aether-statusbar\s*\{[^}]*?\bgap:\s*([^;]+);/s,
    "#aether-statusbar gap",
  );
  const [candidates] = one(
    /aether-palette-candidates\s*\{[^}]*?\bgap:\s*([^;]+);/s,
    ".aether-palette-candidates gap",
  );
  assert.equal(statusbar, DEFAULTS_STYLE.gap);
  assert.equal(candidates, DEFAULTS_STYLE.gap);

  // Inventory, so a NEW gap constant cannot be added without this fixture
  // growing to match it. The trailing 4px is the palette row's intra-row gap —
  // a second, smaller gap constant that the single --aether-gap var does not
  // model. See the r2 findings: either it becomes --aether-gap too (visible
  // change, not pixel-identical) or it stays a stylesheet constant on purpose.
  const inventory = declsOf(p => /(^|-)gap$/.test(p), "gap").map(([, v]) => unwrapVar(v));
  assert.deepEqual(inventory, ["1em", "1em", "4px", "1em"]);
});

test("css: pad_y/pad_x — the statusbar padding is DEFAULTS_STYLE's pad pair", () => {
  const [padding] = one(
    /#aether-statusbar\s*\{[^}]*?\bpadding:\s*([^;]+);/s,
    "#aether-statusbar padding",
  );
  assert.deepEqual(unwrapVar(padding).split(/\s+/), [DEFAULTS_STYLE.pad_y, DEFAULTS_STYLE.pad_x]);
});

test("css: row_pad_y/row_pad_x — every palette row padding is DEFAULTS_STYLE's row pad pair", () => {
  const paddings = all(
    /aether-palette-(?:candidates|row)\s*\{[^}]*?\bpadding:\s*([^;]+);/gs,
    "palette row padding",
    2,
  ).map(m => m[0]);
  for (const p of paddings) {
    assert.deepEqual(unwrapVar(p).split(/\s+/), [DEFAULTS_STYLE.row_pad_y, DEFAULTS_STYLE.row_pad_x]);
  }

  // Inventory again: the two unmodelled paddings are the mode badge (1px 8px)
  // and the selected candidate (0 4px). Adding a third must break this.
  const inventory = declsOf(p => /(^|-)padding(-[a-z]+)?$/.test(p), "padding").map(([, v]) => unwrapVar(v));
  assert.deepEqual(inventory, ["0 8px", "1px 8px", "2px 8px", "0 4px", "2px 8px", "2px 8px", "2px 8px", "2px 8px", "2px 0", "0 8px"]);
});

test("css: border — every border weight in the stylesheet is DEFAULTS_STYLE.border", () => {
  const borders = declsOf(p => /^border(-(top|right|bottom|left|width))?$/.test(p), "border");
  assert.deepEqual(
    borders.map(([p, v]) => `${p}: ${unwrapVar(v).split(/\s+/)[0]}`),
    [
      // three `border: none` resets on chrome Aether hides — they carry no
      // weight constant, so [style] does not model them
      "border: none",
      "border: none",
      "border-top: 1px",
      "border-top: 1px",
      "border: none",
      // r4/r3 surfaces, added on purpose: the panel's top edge, the marked-row indicator, the panel input row's edge, its own `border: none` reset,
      // and which-key's top edge.
      "border-top: 1px",
      "border-left: 1px",
      "border-top: 1px",
      "border: none",
      "border-top: 1px",
    ],
    "the border inventory — a new edge must be added here on purpose",
  );
  for (const [, value] of borders) {
    const width = unwrapVar(value).split(/\s+/)[0];
    if (width === "none") continue;
    assert.equal(width, DEFAULTS_STYLE.border);
  }
});

test("css: font/font_size — every font declaration is accounted for, shorthand or not", () => {
  // The earlier form of this test swept /^\s*font:\s*(\S+)\s+(\S+);/gm and
  // called itself "every chrome font shorthand". It structurally could not match
  // `font: inherit` (one token, not two), so one of the three font declarations
  // in the stylesheet sat outside the assertion — silently, because the guard
  // only checked for TOO FEW matches. The inventory is exact now: every `font`
  // declaration is either the chrome shorthand this feature models, or a listed
  // exception with a reason.
  const fonts = declsOf(p => p === "font", "font").map(([, v]) => unwrapVar(v));
  const EXCEPTIONS = new Set([
    // the palette's <input>, which inherits the strip's font instead of
    // restating it — modelled by nothing in [style], and correct as is
    "inherit",
  ]);
  const shorthands = fonts.filter(v => !EXCEPTIONS.has(v));
  assert.deepEqual(
    fonts,
    ["12px monospace", "12px monospace", "inherit", "12px monospace", "inherit", "12px monospace"],
    "a new font declaration must be added to this inventory on purpose",
  );
  assert.ok(shorthands.length >= 2, "the chrome must still carry its own font shorthand");
  for (const value of shorthands) {
    const parts = value.split(/\s+/);
    assert.equal(parts.length, 2, `font shorthand '${value}' is not <size> <family>`);
    assert.equal(parts[0], DEFAULTS_STYLE.font_size);
    assert.equal(parts[1], DEFAULTS_STYLE.font);
  }
});

test("css: the keys the stylesheet cannot witness yet are exactly the seven we know about", () => {
  // Honest scope rather than pretended coverage. panel_* has no surface until
  // r4 lands panels; nothing in the chrome is translucent, nothing blurs, and
  // nothing animates (the only transition today is #nav-bar's unrelated 80ms
  // slide). When the r2 stylesheet pass lands — constants swapped for
  // var(--aether-*, <same constant>) — delete this list and extend the tests
  // above with var-fallback extraction: /var\(--aether-radius,\s*([^)]+)\)/.
  const WITNESSED = new Set([
    "radius",
    "gap",
    "pad_y",
    "pad_x",
    "row_pad_y",
    "row_pad_x",
    "border",
    "font",
    "font_size",
  ]);
  const UNWITNESSED = [
    "panel_width",
    "panel_height",
    "opacity",
    "blur",
    "motion_ms",
    "motion_ease",
    "motion",
  ];
  assert.deepEqual(
    Object.keys(DEFAULTS_STYLE).filter(k => !WITNESSED.has(k)),
    UNWITNESSED,
    "a new style key must either be witnessed in userChrome.css or listed here on purpose",
  );
});

const EMITTED = emitStyleCss(DEFAULTS_STYLE);

test("css: the stylesheet consumes the style vars, with today's value as the fallback", () => {
  // Was a tripwire asserting the var layer had NOT landed. It has, so this is
  // now the real assertion it demanded: every var() carries the value that
  // shipped as its fallback, which is what makes the default render identical
  // to v1.1.0 whether or not a [style] block exists.
  const uses = CSS.match(/var\(--aether-[a-z0-9_-]+\s*,/g) ?? [];
  assert.ok(uses.length > 0, "userChrome.css must consume the style layer");
  for (const [, name, fallback] of CSS.matchAll(
    /var\(\s*--aether-([a-z0-9_]+)\s*,\s*([^()]*?)\s*\)/gi,
  )) {
    const key = name.replace(/-/g, "_");
    if (!(key in DEFAULTS_STYLE)) continue;
    // emitStyleCss adds the unit (motion_ms 120 -> 120ms, opacity 100 -> 100%),
    // so the fallback must equal the EMITTED value, not the raw default.
    const emitted = new RegExp(`--aether-${name}:\\s*([^;]+);`).exec(EMITTED)?.[1]?.trim();
    assert.equal(
      fallback,
      emitted ?? String(DEFAULTS_STYLE[key]),
      `--aether-${name}'s fallback must be the emitted DEFAULTS_STYLE value, or the unstyled render drifts`,
    );
  }
});

test("css: reduced motion is overridden in CSS, not in JS", () => {
  // applyStyle() regenerates the whole var element on every reload, so a JS
  // matchMedia override would be undone by the next config save. A static rule
  // survives regeneration — that is why this assertion is on the stylesheet.
  assert.ok(/prefers-reduced-motion/.test(CSS), "the reduced-motion override must exist");
  assert.ok(
    /prefers-reduced-motion[^}]*--aether-motion-ms:\s*0ms\s*!important/s.test(CSS),
    "reduced motion must force the duration var to 0ms with !important",
  );
});

test("style: the glue wires the module — applyStyle owns a second style element", () => {
  // Was a tripwire asserting the glue did NOT import the module; it does now,
  // so this asserts the wiring the tripwire asked for. The theme and style
  // layers must stay in SEPARATE elements or a theme reload would wipe the
  // style layer and vice versa.
  const GLUE = readFileSync(join(HERE, "..", "..", "chrome", "JS", "aether.uc.js"), "utf8");
  for (const hook of ["aether-style.sys.mjs", "emitStyleCss", "buildStyle", "applyStyle"]) {
    assert.ok(GLUE.includes(hook), `aether.uc.js must reference ${hook}`);
  }
  assert.ok(GLUE.includes('"aether-style"'), "applyStyle must own an #aether-style element");
  assert.ok(GLUE.includes('"aether-theme"'), "the f3 theme element must still exist separately");
});

test("css: nothing blurs today — so blur cannot be wired as an unconditional backdrop-filter", () => {
  // A pre-condition for the pending stylesheet pass, recorded where the pass
  // will break it. DEFAULTS_STYLE.blur is "0", and per CSS Filter Effects a
  // computed backdrop-filter of anything other than `none` creates a stacking
  // context AND a containing block for fixed/absolute descendants, and forces
  // offscreen compositing. blur(0) is not a no-op at the compositing level, so
  // `backdrop-filter: blur(var(--aether-blur))` shipped unconditionally is NOT
  // pixel-identical to today's chrome, and r2's central compatibility claim
  // dies quietly. The pass must gate it behind a second var that defaults to
  // `none`. (opacity is safe by contrast: only values < 1 create a stacking
  // context, and 100% is the default.)
  assert.ok(!/backdrop-filter/.test(CSS), "the chrome has no backdrop-filter today");
  assert.equal(DEFAULTS_STYLE.blur, "0");
  assert.equal(DEFAULTS_STYLE.opacity, 100);
});
