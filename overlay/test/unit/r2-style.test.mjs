// r2 — Style layer and motion: behavioral tests for the pure style module
// (SDD RED). Spec: overlay/specs/r2-style-layer-and-motion.md §2, §3, §4
// (tests 1–11), plus the cases the analyst's contract added (T14–T18).
// Written before the implementation; the module follows these tests.
//
// Contract pinned here (pure module — no Services/Ci/Cc/IOUtils/PathUtils/DOM/
// setTimeout/Date/Math.random, zero imports, Node-testable on bare node --test;
// nothing in r2 is time-dependent, so there is no clock to inject — motion_ms
// is a *value*, never a delay the module waits on):
//
//   DEFAULTS_STYLE — frozen, exactly 16 keys in a normative order. The order
//     fixes emission order, `rejected` order, and therefore the message text.
//     Its values are literally what userChrome.css hardcodes today (asserted
//     against the stylesheet in r2-config.test.mjs), so an empty [style]
//     renders pixel-identical.
//   VALIDATORS — one total allow-list validator per key, (value) -> boolean.
//     Never throws for any input, never invokes toString/valueOf on it.
//     Validation is the CSS injection barrier: there is no escaping step
//     anywhere in the module, so no accepting set may contain a CSS
//     metacharacter.
//   buildStyle(table) -> {style, rejected} — per-KEY fallback, not per-source
//     (the deliberate inverse of f3's palette rule: a half-applied style layer
//     is merely less tuned, a half-applied palette is unreadable). Reads the
//     input only via Object.hasOwn; absent keys take their default and are NOT
//     reported; unknown keys are ignored silently; `rejected` is in
//     DEFAULTS_STYLE order, never input order. Never throws, never mutates its
//     input, never returns DEFAULTS_STYLE by identity.
//   emitStyleCss(style) -> ":root { --aether-*: …; }" — exactly 15 declarations
//     (motion is a gate, not a var), one balanced block, deterministic.
//     Re-validates internally (defined as emitting from buildStyle(x).style) so
//     glue cannot emit an unvalidated value even by mistake.
//
// Deliberate weakening on record: the spec wanted aether-config.sys.mjs to
// import DEFAULTS_STYLE. That file is owned by Foundation this pass, so the
// "one source of truth" claim is enforced by assertion in r2-config.test.mjs
// instead. An assertion is strictly weaker than an import — the two literals
// can drift for exactly as long as it takes someone to run the suite.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import {
  DEFAULTS_STYLE,
  VALIDATORS,
  buildStyle,
  emitStyleCss,
} from "../../chrome/JS/aether-style.sys.mjs";

// ---------------------------------------------------------------- fixtures

const KEYS = [
  "radius",
  "gap",
  "pad_y",
  "pad_x",
  "row_pad_y",
  "row_pad_x",
  "border",
  "panel_width",
  "panel_height",
  "opacity",
  "blur",
  "font",
  "font_size",
  "motion_ms",
  "motion_ease",
  "motion",
];

// Every key set to a value distinct from its default, so a source→slot mix-up
// is visible rather than accidentally correct.
const VALID = {
  radius: "8px",
  gap: "2rem",
  pad_y: "4px",
  pad_x: "12px",
  row_pad_y: "3px",
  row_pad_x: "10px",
  border: "2px",
  panel_width: "50rem",
  panel_height: "70vh",
  opacity: 96,
  blur: "6px",
  font: "JetBrains Mono",
  font_size: "14px",
  motion_ms: 200,
  motion_ease: "ease-out",
  motion: true,
};

// The 15 emitted var names, in emission order. `motion` is absent on purpose.
const VAR_NAMES = [
  "radius",
  "gap",
  "pad-y",
  "pad-x",
  "row-pad-y",
  "row-pad-x",
  "border",
  "panel-width",
  "panel-height",
  "opacity",
  "blur",
  "font",
  "font-size",
  "motion-ms",
  "motion-ease",
];

// The eleven keys validated as a single CSS <length>, and the two other
// string-valued keys. Derived by hand rather than from the module, so a
// validator quietly swapped for a looser one shows up here as a wrong list.
const LENGTH_KEYS = [
  "radius",
  "gap",
  "pad_y",
  "pad_x",
  "row_pad_y",
  "row_pad_x",
  "border",
  "panel_width",
  "panel_height",
  "blur",
  "font_size",
];

// A grammar-valid value of exactly `n` characters, per string-valued key. Used
// to fire at both sides of the 64-char cap for EVERY string key rather than the
// two the first draft of this file happened to pick.
const AT_LENGTH = {
  ...Object.fromEntries(LENGTH_KEYS.map(k => [k, n => `${"1".repeat(n - 2)}px`])),
  font: n => "a".repeat(n),
  motion_ease: n => `steps(1${"0".repeat(n - 8)})`,
};
const STRING_KEYS = Object.keys(AT_LENGTH);

// Assertion messages must survive the same hostile values the module does:
// String(Object.create(null)) and String({toString(){throw}}) both throw, and a
// test that dies in its own failure message tells you nothing.
function label(v) {
  try {
    if (typeof v === "symbol") return v.toString();
    if (typeof v === "function") return "[function]";
    if (typeof v === "object" && v !== null) return Object.prototype.toString.call(v);
    return String(v);
  } catch {
    // Object.prototype.toString.call() itself throws on a revoked Proxy (it
    // runs IsArray, which does). A labeller that dies on the very inputs this
    // file exists to fire at the module is not a labeller.
    return "[unlabelable]";
  }
}

// Reads one declaration's value out of emitted CSS. Anchored on the full var
// name + colon, so --aether-pad-y can never be read out of --aether-row-pad-y
// and --aether-font can never be read out of --aether-font-size.
const decl = (css, name) =>
  new RegExp(`--aether-${name}:\\s*([^;\\n]+);`).exec(css)?.[1];

// Values every validator must survive without throwing and without ever
// touching toString/valueOf on the input.
const HOSTILE_VALUES = [
  undefined,
  null,
  "",
  0,
  -0,
  NaN,
  Infinity,
  true,
  {},
  [],
  Symbol("x"),
  () => {},
  "x".repeat(5000),
  {
    toString() {
      throw new Error("boom");
    },
    valueOf() {
      throw new Error("boom");
    },
  },
  // A value whose own property read throws, and a value that is a revoked
  // Proxy: both are objects, so every validator must reject them on `typeof`
  // alone and never provoke the trap.
  {
    get anything() {
      throw new Error("boom");
    },
  },
  revoked(),
];

// A Proxy that has been revoked: *every* operation on it throws, including
// Object.hasOwn and Object.prototype.toString.
function revoked() {
  const { proxy, revoke } = Proxy.revocable({ radius: "8px" }, {});
  revoke();
  return proxy;
}

// Tables — not values — that are hostile to read from. `buildStyle`'s "never
// throws" contract has to cover the container it was handed, not only the
// values inside it: a config can arrive from a synced dotfile, and a style pass
// that dies takes r1's whole reload with it.
const HOSTILE_TABLES = () => [
  // an accessor that throws on one key, with a perfectly good sibling
  {
    get radius() {
      throw new Error("boom");
    },
    gap: "2rem",
  },
  // an accessor that throws on every key
  Object.defineProperties(
    {},
    Object.fromEntries(
      KEYS.map(k => [
        k,
        {
          enumerable: true,
          configurable: true,
          get() {
            throw new Error("boom");
          },
        },
      ]),
    ),
  ),
  // a revoked Proxy: hasOwn itself throws
  revoked(),
  // traps that throw
  new Proxy(
    {},
    {
      has() {
        throw new Error("boom");
      },
      get() {
        throw new Error("boom");
      },
      getOwnPropertyDescriptor() {
        throw new Error("boom");
      },
    },
  ),
  // a trap that lies: reports every key as present, then throws on read
  new Proxy(
    {},
    {
      getOwnPropertyDescriptor() {
        return { value: 1, writable: true, enumerable: true, configurable: true };
      },
      get() {
        throw new Error("boom");
      },
    },
  ),
];

// Escape-shaped values, one per key. Every one is a string, so the boolean and
// integer keys reject them on type alone and the string keys on grammar.
const ESCAPES = {
  radius: "8px; } :root { --evil: 1",
  gap: "} html { display: none } {",
  pad_y: "0;}*{opacity:0",
  pad_x: "8px !important; --evil: 1",
  row_pad_y: "2px} #aether-statusbar { display: none",
  row_pad_x: 'url("http://evil.example/x")',
  border: "1px solid red; --evil: 1",
  panel_width: "38rem); } * { width: 0",
  panel_height: "60vh\n}\n* { display: none }\n{",
  opacity: "100%; } * { opacity: 0",
  blur: "0px) brightness(0",
  font: "monospace; background: url(http://x)",
  font_size: "12px;}html{font-size:0",
  motion_ms: "120ms; } * { transition: none",
  motion_ease: "cubic-bezier(0,0,0,0); } *{display:none",
  motion: "true; } * { display: none",
};

// 1. empty / missing [style] --------------------------------------------------

test("style: an empty or missing [style] table yields exactly the defaults, nothing rejected", () => {
  const inputs = [
    undefined,
    null,
    {},
    [],
    "",
    0,
    false,
    NaN,
    () => {},
    Object.create(null),
  ];
  for (const input of inputs) {
    const { style, rejected } = buildStyle(input);
    assert.deepEqual(style, DEFAULTS_STYLE, `input ${label(input)} must default`);
    assert.deepEqual(rejected, [], "an absent table rejects nothing");
  }
});

test("style: buildStyle returns a fresh plain object, never the frozen constant itself", () => {
  assert.ok(Object.isFrozen(DEFAULTS_STYLE), "DEFAULTS_STYLE must be frozen");
  // Every path that produces an all-defaults result, not just the empty table:
  // an early `return {style: DEFAULTS_STYLE}` shortcut would hand glue a frozen
  // shared object that later assignment silently fails (or throws) on.
  for (const input of [{}, undefined, null, "", 0, [], NaN, Object.create(null)]) {
    const a = buildStyle(input);
    const b = buildStyle(input);
    assert.notEqual(a.style, DEFAULTS_STYLE, `${label(input)}: callers must not get the constant`);
    assert.notEqual(a.style, b.style, `${label(input)}: each call gets its own object`);
    assert.notEqual(a.rejected, b.rejected, `${label(input)}: each call gets its own array`);
    assert.ok(!Object.isFrozen(a.style), `${label(input)}: the result must be writable`);
    assert.equal(
      Object.getPrototypeOf(a.style),
      Object.prototype,
      "the result must be a plain object, safe to spread and JSON.stringify",
    );
  }
});

// 2. every documented key round-trips ----------------------------------------

test("style: every configured key round-trips under its own --aether-* name", () => {
  const { style, rejected } = buildStyle(VALID);
  assert.deepEqual(rejected, [], "the VALID fixture must genuinely validate");
  assert.deepEqual(style, VALID, "every valid value survives verbatim");

  const css = emitStyleCss(style);
  assert.equal(decl(css, "radius"), "8px");
  assert.equal(decl(css, "gap"), "2rem");
  assert.equal(decl(css, "pad-y"), "4px");
  assert.equal(decl(css, "pad-x"), "12px");
  assert.equal(decl(css, "row-pad-y"), "3px");
  assert.equal(decl(css, "row-pad-x"), "10px");
  assert.equal(decl(css, "border"), "2px");
  assert.equal(decl(css, "panel-width"), "50rem");
  assert.equal(decl(css, "panel-height"), "70vh");
  assert.equal(decl(css, "opacity"), "96%", "opacity emits an integer percent");
  assert.equal(decl(css, "blur"), "6px");
  assert.equal(decl(css, "font"), "JetBrains Mono");
  assert.equal(decl(css, "font-size"), "14px");
  assert.equal(decl(css, "motion-ms"), "200ms", "motion_ms emits a duration");
  assert.equal(decl(css, "motion-ease"), "ease-out");
  assert.equal(
    decl(css, "motion"),
    undefined,
    "motion is the gate, not a var — it must emit no declaration of its own",
  );
});

// 3. per-key fallback, not per-source ----------------------------------------

test("style: one bad length degrades exactly that key — every other key still applies", () => {
  const base = buildStyle(VALID).style;
  const bads = [
    "8",
    "8pt",
    "calc(1px)",
    "",
    "0 8px",
    " 8px",
    "8px ",
    "1.2.3px",
    "..px",
    "100vmin",
    "var(--x)",
    8,
    null,
    {},
    ["8px"],
  ];
  for (const bad of bads) {
    const { style, rejected } = buildStyle({ ...VALID, radius: bad });
    assert.equal(style.radius, "2px", `radius ${JSON.stringify(bad)} must fall back`);
    assert.deepEqual(rejected, ["radius"], "exactly one key is named");
    // The whole point: nothing else moved.
    assert.equal(style.gap, "2rem");
    assert.equal(style.font, "JetBrains Mono");
    assert.equal(style.opacity, 96);
    const { radius: _bad, ...rest } = style;
    const { radius: _good, ...expected } = base;
    assert.deepEqual(rest, expected, "a bad radius must not revert the other 15 keys");
  }
});

test("style: rejected keys are listed in DEFAULTS_STYLE order, not the order the dotfile used", () => {
  // font is written first, radius last; DEFAULTS_STYLE order is radius (0)
  // then font (11). The message text must not depend on how the user's TOML
  // happened to be sorted.
  const input = {};
  input.font = "a,b";
  input.gap = "2rem";
  input.radius = "8pt";
  const { style, rejected } = buildStyle(input);
  assert.deepEqual(rejected, ["radius", "font"]);
  assert.equal(style.radius, "2px");
  assert.equal(style.font, "monospace");
  assert.equal(style.gap, "2rem", "the valid sibling still applies");
});

// 4. injection guard ----------------------------------------------------------

test("style: a value shaped to escape the declaration block is rejected, not escaped", () => {
  const { style, rejected } = buildStyle({ radius: "8px; } :root { --evil: 1" });
  assert.equal(style.radius, "2px");
  assert.deepEqual(rejected, ["radius"]);
});

test("style: a table where all 16 keys carry escape payloads emits exactly the default block", () => {
  const { style, rejected } = buildStyle(ESCAPES);
  assert.deepEqual(style, DEFAULTS_STYLE, "every hostile key falls back");
  assert.deepEqual(rejected, KEYS, "all 16 are named, in DEFAULTS_STYLE order");

  const css = emitStyleCss(style);
  assert.equal((css.match(/\{/g) ?? []).length, 1, "exactly one opening brace");
  assert.equal((css.match(/\}/g) ?? []).length, 1, "exactly one closing brace");
  assert.ok(!css.includes("--evil"), "no attacker-named custom property");
  assert.ok(!css.includes("display"), "no attacker declaration survived");
  assert.equal(
    css,
    emitStyleCss(DEFAULTS_STYLE),
    "a fully hostile table is byte-identical to the default render",
  );

  // Every interior line is a single well-formed declaration: no payload can be
  // hiding inside one, and no second block can have been opened.
  const lines = css.split("\n").slice(1, -2);
  for (const line of lines) {
    assert.match(line, /^ {2}--aether-[a-z0-9-]+: [^;{}]+;$/, `stray line: ${line}`);
  }
});

// 5. grammar rejection, not escaping -----------------------------------------

test("style: a font family carrying a url() payload is rejected by grammar", () => {
  const { style, rejected } = buildStyle({ font: "monospace; background: url(http://x)" });
  assert.deepEqual(rejected, ["font"]);
  assert.equal(style.font, "monospace");
});

test("style: an easing carrying a rule-closing payload is rejected by grammar", () => {
  const { style, rejected } = buildStyle({
    motion_ease: "cubic-bezier(0,0,0,0); } *{display:none",
  });
  assert.deepEqual(rejected, ["motion_ease"]);
  assert.equal(style.motion_ease, "cubic-bezier(0.22, 1, 0.36, 1)");
});

test("style: rejection is the only barrier — nothing is ever escaped into the output", () => {
  // An implementation that backslash-escaped instead of rejecting would emit
  // `url` (escaped) and would contain a backslash. Both must be absent.
  const css = emitStyleCss({ font: "monospace; background: url(http://x)" });
  assert.ok(!css.includes("\\"), "no escaping step may exist");
  assert.ok(!css.includes("url"), "a rejected payload never reaches emission");
  assert.equal(css, emitStyleCss(DEFAULTS_STYLE));
});

test("style: the grammars are not vacuously strict — real values pass", () => {
  assert.deepEqual(
    buildStyle({ font: "JetBrains Mono", motion_ease: "linear" }).rejected,
    [],
  );
  for (const ease of [
    "linear",
    "ease",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "step-start",
    "step-end",
    "cubic-bezier(0.22, 1, 0.36, 1)",
    "cubic-bezier(.25,.1,.25,1)",
    "cubic-bezier(0, -0.5, 1, 1.5)",
    "steps(4)",
    "steps(4, jump-end)",
    "steps(2, end)",
  ]) {
    const { style, rejected } = buildStyle({ motion_ease: ease });
    assert.deepEqual(rejected, [], `${ease} must be accepted`);
    assert.equal(style.motion_ease, ease);
  }
  for (const family of ["monospace", "JetBrains Mono", "Fira Code", "IBM Plex Mono"]) {
    assert.deepEqual(buildStyle({ font: family }).rejected, [], `${family} must be accepted`);
  }
  for (const len of ["0", "0px", "8px", "1em", "38rem", "60vh", "50%", "1.5rem", ".5em"]) {
    assert.deepEqual(buildStyle({ radius: len }).rejected, [], `${len} must be accepted`);
  }
});

// 5d. the length grammar is unsigned -----------------------------------------

test("style: a negative length is rejected on every length key — no key in the schema admits one", () => {
  // Not one of the eleven length keys reaches a CSS property that accepts a
  // negative: border-radius, gap, padding, border-width, width, max-height,
  // blur() and font-size are all [0,∞]. So a sign cannot express anything here;
  // it can only produce an INVALID declaration, and an invalid-at-computed-
  // value-time declaration resolves to `unset`, not to the var() fallback the
  // stylesheet pass will write. `font: -4px monospace` therefore costs the
  // surface its size AND its family at once — the identical wholesale
  // degradation `RESERVED_FAMILIES` exists to prevent, arriving through a value
  // the grammar said was fine, with `rejected` empty and the statusbar silent.
  //
  // This test replaces an earlier one that required "-4px" to be ACCEPTED, so
  // it is also the note explaining why that requirement was wrong.
  for (const key of LENGTH_KEYS) {
    for (const bad of ["-4px", "-1%", "-0.5rem", "-.5em", "-0px", "-1vh", "-1vw", "-1em", "-0"]) {
      assert.deepEqual(
        buildStyle({ [key]: bad }).rejected,
        [key],
        `${key} = ${JSON.stringify(bad)} must be rejected — no length key admits a negative`,
      );
    }
    // and the unsigned twin of each still passes, so this is a sign ban and not
    // an accidental ban on the whole shape
    for (const good of ["4px", "1%", "0.5rem", ".5em", "0px", "1vh", "1vw", "1em", "0"]) {
      assert.deepEqual(buildStyle({ [key]: good }).rejected, [], `${key} = ${good}`);
    }
  }
  // No minus sign can reach the output through a length key, whatever the
  // grammar does or does not admit.
  for (const key of LENGTH_KEYS) {
    for (const bad of ["-4px", "-1%", "- 4px", "-"]) {
      const name = key.split("_").join("-");
      assert.equal(decl(emitStyleCss({ ...VALID, [key]: bad }), name), DEFAULTS_STYLE[key]);
    }
  }
  // The easing grammar keeps its sign: cubic-bezier control points are
  // legitimately negative, so the two decimal grammars are NOT the same grammar
  // and must not be "unified" by someone reading only the test above.
  assert.deepEqual(buildStyle({ motion_ease: "cubic-bezier(0, -0.5, 1, 1.5)" }).rejected, []);
});

test("style: percentages on border and blur are a KNOWN, deliberate looseness", () => {
  // `%` is a valid <length-percentage> for nine of the eleven length keys, and
  // invalid for exactly two: `border-width: 50%` and `blur(50%)` are both
  // invalid CSS, and would degrade their declaration the same way a negative
  // would. They are accepted anyway, and this test is the record of the choice
  // rather than an oversight:
  //
  //   closing them needs a SECOND length grammar (unsigned-and-unitless-or-
  //   absolute) living beside this one — and r5's aether-settings.sys.mjs
  //   already carries a hand-copied duplicate of the single grammar we have.
  //   A second grammar means a fourth and fifth copy to keep in step by hand,
  //   which is precisely the thickness the maintenance budget cannot absorb.
  //   The honest fix is r5 importing VALIDATORS (see the drift test in
  //   r2-config.test.mjs); the tightening belongs in the same change, not
  //   before it.
  //
  // Pinned so that a later change here is a decision someone made, not a bug
  // someone "fixed".
  for (const key of ["border", "blur"]) {
    assert.deepEqual(buildStyle({ [key]: "50%" }).rejected, [], `${key} = 50% is accepted today`);
  }
});

test("style: easing shapes that are almost right are still rejected", () => {
  for (const ease of [
    "ease-in-out-back",
    "cubic-bezier(a,b,c,d)",
    "cubic-bezier(0,0,0)",
    "cubic-bezier(0,0,0,0,0)",
    "steps(2, )",
    "steps(-2)",
    "steps(2, sideways)",
    "cubic-bezier(0,\t0,0,0)",
    "cubic-bezier(0,\n0,0,0)",
    "linear ",
    "LINEAR",
  ]) {
    assert.deepEqual(buildStyle({ motion_ease: ease }).rejected, ["motion_ease"], ease);
  }
});

// 5b. `!important` — the metacharacter the escape fixtures never isolate ------

test("style: `!important` is rejected on its own, not merely as a rider on a `;` payload", () => {
  // Every `!important` in the ESCAPES fixture also carries a `;`, so the `;`
  // alone does all the rejecting there and a grammar that admitted a bare
  // `!important` would sail through the whole suite. It must not: `!important`
  // is meaningful on a custom-property declaration, so such a value would win
  // the cascade over every other rule in the chrome — a CSS metacharacter
  // escaping through the one barrier this module has.
  for (const key of LENGTH_KEYS) {
    for (const bad of [
      "8px !important",
      "8px!important",
      "0!important",
      "0 !important",
      "8px ! important",
      "8px !IMPORTANT",
    ]) {
      assert.deepEqual(
        buildStyle({ [key]: bad }).rejected,
        [key],
        `${key} = ${JSON.stringify(bad)} must be rejected`,
      );
    }
  }
  for (const bad of ["Mono !important", "Mono!important", "monospace !important"]) {
    assert.deepEqual(buildStyle({ font: bad }).rejected, ["font"], JSON.stringify(bad));
  }
  for (const bad of [
    "linear !important",
    "ease-out!important",
    "cubic-bezier(0, 0, 0, 0) !important",
    "steps(2) !important",
  ]) {
    assert.deepEqual(
      buildStyle({ motion_ease: bad }).rejected,
      ["motion_ease"],
      JSON.stringify(bad),
    );
  }
});

test("style: no accepted value can put a `!` into the emitted CSS", () => {
  // The blanket version of the test above: whatever the grammars do or do not
  // admit, `!` must be unreachable in output. Fired at every key at once so a
  // single loosened validator is enough to fail it.
  const payloads = ["8px !important", "!important", "important!", "a !b", "1px!"];
  for (const payload of payloads) {
    const table = Object.fromEntries(KEYS.map(k => [k, payload]));
    assert.ok(!emitStyleCss(table).includes("!"), `'${payload}' put a ! into the output`);
    for (const key of KEYS) {
      assert.ok(
        !emitStyleCss({ ...VALID, [key]: payload }).includes("!"),
        `${key} = '${payload}' put a ! into the output`,
      );
    }
  }
  assert.ok(!emitStyleCss(DEFAULTS_STYLE).includes("!"));
  assert.ok(!emitStyleCss(VALID).includes("!"));
});

// 5c. the unit set is exactly six --------------------------------------------

test("style: the accepted length units are exactly px, rem, em, %, vh, vw — nothing else", () => {
  // Positives alone cannot pin a set; a grammar that also took `s`, `deg` or
  // `fr` would satisfy every other length assertion in this file. Emitting a
  // time or an angle where a length belongs makes the declaration invalid, so
  // the barrier owns the unit list, not just the number shape.
  for (const unit of ["px", "rem", "em", "%", "vh", "vw"]) {
    assert.deepEqual(buildStyle({ radius: `1${unit}` }).rejected, [], `1${unit} must be accepted`);
  }
  for (const unit of [
    "pt", "pc", "cm", "mm", "in", "q", "Q",
    "ch", "ex", "cap", "ic", "lh", "rlh", "rex", "rch",
    "vmin", "vmax", "vb", "vi", "svh", "lvh", "dvh", "svw", "dvw",
    "cqw", "cqh", "cqi", "cqb", "cqmin", "cqmax",
    "s", "ms", "deg", "grad", "rad", "turn", "fr", "x", "dpi", "dppx", "hz",
    "PX", "REM", "Px", "pxx", "px2", "e m",
  ]) {
    assert.deepEqual(
      buildStyle({ radius: `1${unit}` }).rejected,
      ["radius"],
      `1${unit} must be rejected — the unit set is closed`,
    );
  }
  // and a bare number with no unit at all, in both shapes
  for (const bad of ["1", "1.5", ".5", "-1", "00", "0.0", "+1px"]) {
    assert.deepEqual(buildStyle({ radius: bad }).rejected, ["radius"], bad);
  }
  assert.deepEqual(buildStyle({ radius: "0" }).rejected, [], "a bare 0 is the one exception");
});

test("style: a font family that is a CSS-wide keyword is rejected", () => {
  // The value is emitted into the `font` SHORTHAND, where a CSS-wide keyword is
  // not a permitted component — `font: 12px inherit` is an invalid declaration,
  // so the surface loses its font entirely. That is the wholesale degradation
  // per-key fallback exists to prevent, arriving through a value the family
  // grammar said was fine. `default` is reserved by CSS Fonts for the same
  // reason. Case-insensitive: CSS keywords are ASCII case-insensitive.
  for (const bad of [
    "inherit",
    "initial",
    "unset",
    "revert",
    "revert-layer",
    "default",
    "Inherit",
    "INITIAL",
    "Revert-Layer",
    "DEFAULT",
  ]) {
    const { style, rejected } = buildStyle({ font: bad });
    assert.deepEqual(rejected, ["font"], `font = ${bad} must be rejected`);
    assert.equal(style.font, "monospace");
  }
  // Generic families and ordinary names are unaffected — the ban is the
  // CSS-wide keyword set plus `default`, not "identifiers I recognise".
  for (const good of ["monospace", "serif", "sans-serif", "system-ui", "ui-monospace"]) {
    assert.deepEqual(buildStyle({ font: good }).rejected, [], good);
  }
});

test("style: steps() takes a positive integer — steps(0) is invalid CSS and is rejected", () => {
  for (const bad of ["steps(0)", "steps(00)", "steps(007)", "steps(0, end)", "steps(01)"]) {
    assert.deepEqual(buildStyle({ motion_ease: bad }).rejected, ["motion_ease"], bad);
  }
  for (const good of ["steps(1)", "steps(10)", "steps(4, jump-none)"]) {
    assert.deepEqual(buildStyle({ motion_ease: good }).rejected, [], good);
  }
});

test("style: family names that could close or extend a declaration are rejected", () => {
  for (const family of [
    '"quoted"',
    "a,b",
    "url(x)",
    "Fira/Code",
    "9Mono",
    "Mono;",
    "Mono{}",
    "Mono()",
    "Mono\\",
    "Mono'",
    "Mono\nOther",
    "Mono\tOther",
    "",
  ]) {
    assert.deepEqual(buildStyle({ font: family }).rejected, ["font"], JSON.stringify(family));
  }
});

test("style: a family name is words separated by single spaces — no leading, trailing or doubled space", () => {
  // The value is emitted verbatim as the family component of the `font`
  // SHORTHAND (`font: 12px monospace` is what userChrome.css:106,203 ship), so
  // the grammar is words-and-single-separators, not "letters plus any spaces".
  // A char class that simply includes ' ' would accept all four of these.
  // (Shorthand, not `font-family` — the distinction is what makes
  // RESERVED_FAMILIES load-bearing rather than dead weight, so the two must not
  // drift apart in prose.)
  for (const family of [" Mono", "Mono ", "Mono  Space", " ", "Mono   "]) {
    assert.deepEqual(
      buildStyle({ font: family }).rejected,
      ["font"],
      `${JSON.stringify(family)} must not validate`,
    );
  }
  for (const family of ["monospace", "JetBrains Mono", "IBM Plex Mono", "Fira Code", "SF_Mono-9"]) {
    assert.deepEqual(buildStyle({ font: family }).rejected, [], family);
  }
});

// 6. bounded numbers and the float trap --------------------------------------

test("style: opacity outside 0..100, or not an integer, is rejected and defaulted", () => {
  for (const bad of [-1, 101, 100.5, 0.96, "96", "0.96", "100", NaN, Infinity, -Infinity, null, true, false, [], {}]) {
    const { style, rejected } = buildStyle({ opacity: bad });
    assert.deepEqual(rejected, ["opacity"], `opacity ${label(bad)} must be rejected`);
    assert.equal(style.opacity, 100);
  }
  for (const good of [0, 1, 50, 100]) {
    const { style, rejected } = buildStyle({ opacity: good });
    assert.deepEqual(rejected, [], `opacity ${good} must be accepted`);
    assert.equal(style.opacity, good);
  }
});

test("style: motion_ms outside its bounded range, or not an integer, is rejected and defaulted", () => {
  for (const bad of [-1, 10001, 120.5, "120", "120ms", NaN, Infinity, null, true]) {
    const { style, rejected } = buildStyle({ motion_ms: bad });
    assert.deepEqual(rejected, ["motion_ms"], `motion_ms ${label(bad)} must be rejected`);
    assert.equal(style.motion_ms, 120);
  }
  for (const good of [0, 1, 120, 10000]) {
    const { style, rejected } = buildStyle({ motion_ms: good });
    assert.deepEqual(rejected, [], `motion_ms ${good} must be accepted`);
    assert.equal(style.motion_ms, good);
  }
});

// (The parser-boundary half of spec test 6 — that a bare `opacity = 0.96` in
// TOML arrives here as the STRING "0.96" and is rejected as such — lives in
// r2-config.test.mjs, which is the file allowed to import aether-config.)

// 7. motion = false is the one switch ----------------------------------------

test("style: motion = false emits a 0ms duration — one value disables every transition", () => {
  const off = emitStyleCss(buildStyle({ motion: false }).style);
  assert.equal(decl(off, "motion-ms"), "0ms");

  const offWithDuration = emitStyleCss(buildStyle({ motion: false, motion_ms: 400 }).style);
  assert.equal(decl(offWithDuration, "motion-ms"), "0ms", "the gate wins over the duration");
  assert.equal(
    decl(offWithDuration, "motion-ease"),
    "cubic-bezier(0.22, 1, 0.36, 1)",
    "the gate must not blank a second var",
  );
});

test("style: the motion gate applies only at emission — the configured duration survives in the model", () => {
  // r5 displays the configured number, and idempotence depends on buildStyle
  // not rewriting it.
  const { style, rejected } = buildStyle({ motion: false, motion_ms: 400 });
  assert.deepEqual(rejected, []);
  assert.equal(style.motion_ms, 400, "buildStyle must not zero the duration");
  assert.equal(style.motion, false);
});

test("style: a non-boolean motion is rejected and motion stays on", () => {
  for (const bad of ["false", "true", 0, 1, null, "off"]) {
    const { style, rejected } = buildStyle({ motion: bad });
    assert.deepEqual(rejected, ["motion"], `motion ${label(bad)} must be rejected`);
    assert.equal(style.motion, true);
    const css = emitStyleCss(style);
    assert.equal(
      decl(css, "motion-ms"),
      "120ms",
      "a rejected gate must not silently disable motion",
    );
  }
});

test("style: motion = true emits the configured duration, not a zero", () => {
  const css = emitStyleCss(buildStyle({ motion: true, motion_ms: 300 }).style);
  assert.equal(decl(css, "motion-ms"), "300ms");
});

// 8. blur = "0" is valid ------------------------------------------------------

test("style: a bare 0 is a valid length and emits exactly 0 — disabling blur is not an error", () => {
  const { style, rejected } = buildStyle({ blur: "0", pad_y: "0" });
  assert.deepEqual(rejected, []);
  assert.equal(style.blur, "0");
  assert.equal(style.pad_y, "0");
  const css = emitStyleCss(style);
  assert.equal(decl(css, "blur"), "0", "not 0px, not 0%");
  assert.equal(decl(css, "pad-y"), "0");
});

// 9. emission shape -----------------------------------------------------------

test("style: emitStyleCss emits exactly the 15 var names, once each, in DEFAULTS_STYLE order", () => {
  const css = emitStyleCss(DEFAULTS_STYLE);
  assert.equal(typeof css, "string");
  assert.ok(css.startsWith(":root {"), "vars must land on :root");
  assert.equal((css.match(/\{/g) ?? []).length, 1);
  assert.equal((css.match(/\}/g) ?? []).length, 1);
  assert.ok(css.endsWith("}\n"), "one trailing newline after the closing brace");

  const all = (css.match(/--aether-[a-z0-9-]+\s*:/g) ?? []).map(s =>
    s.replace(/^--aether-/, "").replace(/\s*:$/, ""),
  );
  assert.equal(all.length, 15, "16 keys, 15 vars — motion is a gate, not a var");
  assert.equal(new Set(all).size, 15, "no duplicate declarations");
  assert.deepEqual(all, VAR_NAMES, "underscores become hyphens, order is normative");
});

test("style: emitted CSS never contains a stringified nothing", () => {
  for (const input of [DEFAULTS_STYLE, VALID, {}, ESCAPES]) {
    const css = emitStyleCss(buildStyle(input).style);
    for (const junk of ["undefined", "NaN", "[object", "null", "Symbol("]) {
      assert.ok(!css.includes(junk), `emitted CSS must never contain '${junk}'`);
    }
  }
});

test("style: every line inside the block is a single two-space-indented declaration", () => {
  const css = emitStyleCss(DEFAULTS_STYLE);
  const lines = css.split("\n");
  assert.equal(lines[0], ":root {");
  assert.equal(lines[lines.length - 2], "}");
  assert.equal(lines[lines.length - 1], "");
  for (const line of lines.slice(1, -2)) {
    assert.match(line, /^ {2}--aether-[a-z0-9-]+: [^;]+;$/, `stray line: ${line}`);
  }
  assert.equal(lines.length - 3, 15, "15 declaration lines");
});

test("style: emitStyleCss re-validates, so glue cannot emit an unvalidated value by mistake", () => {
  const fallback = emitStyleCss(DEFAULTS_STYLE);
  for (const input of [null, undefined, {}, [], "", 0, { radius: "8px;}" }, ESCAPES]) {
    assert.equal(emitStyleCss(input), fallback, `emitStyleCss(${label(input)}) must be safe`);
  }
  // and a partially valid table emits the valid half plus defaults
  const css = emitStyleCss({ radius: "9px", gap: "nope" });
  assert.equal(decl(css, "radius"), "9px");
  assert.equal(decl(css, "gap"), "1em");
});

test("style: emission is deterministic and independent of the input's key order", () => {
  const reversed = Object.fromEntries(Object.entries(VALID).reverse());
  assert.equal(emitStyleCss(VALID), emitStyleCss(VALID), "same input, same bytes");
  assert.equal(
    emitStyleCss(reversed),
    emitStyleCss(VALID),
    "output order comes from DEFAULTS_STYLE, never from iterating the input",
  );
  assert.deepEqual(Object.keys(buildStyle(reversed).style), KEYS);
});

// 10. the fallback can never itself fail -------------------------------------

test("style: every key has a validator and every validator has a key (guard)", () => {
  assert.deepEqual(Object.keys(VALIDATORS).sort(), Object.keys(DEFAULTS_STYLE).sort());
  assert.deepEqual(Object.keys(DEFAULTS_STYLE), KEYS, "key order is normative");
});

test("style: DEFAULTS_STYLE passes every validator — the fallback can never itself be rejected", () => {
  for (const key of KEYS) {
    assert.ok(VALIDATORS[key](DEFAULTS_STYLE[key]), `DEFAULTS_STYLE.${key} must validate`);
  }
  assert.deepEqual(buildStyle(DEFAULTS_STYLE), {
    style: { ...DEFAULTS_STYLE },
    rejected: [],
  });
});

test("style: no validator throws or returns a non-boolean, for any input", () => {
  for (const key of KEYS) {
    for (const value of HOSTILE_VALUES) {
      let out;
      assert.doesNotThrow(
        () => {
          out = VALIDATORS[key](value);
        },
        `VALIDATORS.${key} threw — validators must never invoke toString/valueOf on the input`,
      );
      assert.equal(typeof out, "boolean", `VALIDATORS.${key} must return a boolean`);
    }
  }
});

test("style: buildStyle agrees with VALIDATORS key by key, for every hostile value", () => {
  // Cross-checks the two exports against each other: an implementation whose
  // buildStyle validates by some second, divergent rule fails here. (A few
  // members of HOSTILE_VALUES are legitimately valid for a key or two — 0 is a
  // fine opacity, true is a fine motion — so the assertion is agreement, not
  // blanket rejection.)
  for (const value of HOSTILE_VALUES) {
    const table = Object.fromEntries(KEYS.map(k => [k, value]));
    let out;
    assert.doesNotThrow(() => {
      out = buildStyle(table);
    }, `hostile value ${label(value)} must not throw`);
    assert.deepEqual(Object.keys(out.style), KEYS);
    for (const key of KEYS) {
      if (VALIDATORS[key](value)) {
        assert.equal(out.style[key], value, `${key} validated, so it must be kept`);
        assert.ok(!out.rejected.includes(key), `${key} validated, so it must not be rejected`);
      } else {
        assert.deepEqual(out.style[key], DEFAULTS_STYLE[key], `${key} must fall back`);
        assert.ok(out.rejected.includes(key), `${key} failed, so it must be named`);
      }
    }
    assert.doesNotThrow(() => emitStyleCss(table));
  }
});

test("style: a negative zero never emits as -0", () => {
  const css = emitStyleCss(buildStyle({ opacity: -0, motion_ms: -0 }).style);
  assert.equal(decl(css, "opacity"), "0%");
  assert.equal(decl(css, "motion-ms"), "0ms");
  // Byte-equality with the +0 render, rather than a `!css.includes("-0")` that
  // no plausible implementation could ever fail: -0 must be indistinguishable
  // from 0 in the output, sign included, everywhere at once.
  assert.equal(css, emitStyleCss(buildStyle({ opacity: 0, motion_ms: 0 }).style));
});

// 13. the container itself is hostile ----------------------------------------

test("style: a table whose property reads throw degrades to defaults instead of throwing", () => {
  // The contract is "never throws" for the CONTAINER too, not only for the
  // values in it. A throwing accessor or a revoked Proxy must read as absent —
  // the same guard aether-reload's safeRead makes, for the same reason: a style
  // pass that dies takes r1's whole reload down with it.
  for (const table of HOSTILE_TABLES()) {
    let out;
    assert.doesNotThrow(() => {
      out = buildStyle(table);
    }, `buildStyle(${label(table)}) must not throw`);
    assert.deepEqual(Object.keys(out.style), KEYS);
    for (const key of KEYS) {
      if (key === "gap" && out.style.gap === "2rem") continue; // the good sibling
      assert.deepEqual(out.style[key], DEFAULTS_STYLE[key], `${key} must fall back`);
    }
    assert.deepEqual(out.rejected, [], "an unreadable key is absent, not rejected");

    let css;
    assert.doesNotThrow(() => {
      css = emitStyleCss(table);
    }, `emitStyleCss(${label(table)}) must not throw`);
    assert.equal(typeof css, "string");
    assert.equal((css.match(/\{/g) ?? []).length, 1);
  }
});

test("style: a readable sibling still applies when its neighbour's getter throws", () => {
  // Per-key degradation has to survive a hostile read as well as a hostile
  // value: one exploding accessor must not cost the keys around it.
  const { style, rejected } = buildStyle({
    get radius() {
      throw new Error("boom");
    },
    gap: "2rem",
    font: "JetBrains Mono",
  });
  assert.equal(style.radius, "2px", "the unreadable key takes its default");
  assert.equal(style.gap, "2rem", "the readable sibling still applies");
  assert.equal(style.font, "JetBrains Mono");
  assert.deepEqual(rejected, []);
});

test("style: each key is read at most once, so a counting getter cannot be re-entered", () => {
  const reads = [];
  const table = {};
  for (const key of KEYS) {
    Object.defineProperty(table, key, {
      enumerable: true,
      get() {
        reads.push(key);
        return DEFAULTS_STYLE[key];
      },
    });
  }
  buildStyle(table);
  assert.deepEqual(reads, KEYS, "one read per key, in DEFAULTS_STYLE order");
});

// 11. idempotence -------------------------------------------------------------

test("style: buildStyle's own output feeds back to an identical style with nothing left to reject", () => {
  const mixed = { ...VALID, radius: "8pt", opacity: 500, motion: "yes" };
  for (const input of [{}, VALID, ESCAPES, mixed]) {
    const a = buildStyle(input);
    const b = buildStyle(a.style);
    assert.deepEqual(b.style, a.style, "a second pass changes nothing");
    assert.deepEqual(b.rejected, [], "a validated table has nothing left to reject");
    assert.equal(emitStyleCss(b.style), emitStyleCss(a.style));
  }
});

// 14. prototype pollution -----------------------------------------------------

test("style: a __proto__ payload in the table is inert and never reaches the output", () => {
  const table = JSON.parse('{"__proto__":{"radius":"9px","gap":"9em"}}');
  const { style, rejected } = buildStyle(table);
  assert.equal(style.radius, "2px");
  assert.equal(style.gap, "1em");
  assert.deepEqual(rejected, [], "a payload key is unknown, not rejected");
  assert.equal({}.radius, undefined, "Object.prototype must be untouched");
  assert.equal(Object.prototype.gap, undefined);
});

test("style: inherited properties are invisible — only own keys are read", () => {
  const { style, rejected } = buildStyle(Object.create({ radius: "9px", gap: "9em" }));
  assert.equal(style.radius, "2px", "an inherited radius must not be adopted");
  assert.equal(style.gap, "1em");
  assert.deepEqual(rejected, []);
});

test("style: constructor and prototype are ordinary unknown keys, ignored in silence", () => {
  const { style, rejected } = buildStyle({
    constructor: { radius: "9px" },
    prototype: "x",
    __proto__: null,
  });
  assert.deepEqual(style, DEFAULTS_STYLE);
  assert.deepEqual(rejected, []);
  assert.equal(Object.getPrototypeOf(style), Object.prototype);
});

// 15. unknown keys are forward-tolerant --------------------------------------

test("style: unknown keys from a newer dotfile are dropped silently, never reported", () => {
  const { style, rejected } = buildStyle({ ...VALID, shadow: "0 0 8px", nope: 1 });
  assert.deepEqual(
    Object.keys(style),
    KEYS,
    "the result carries exactly the 16 known keys, in order",
  );
  assert.deepEqual(rejected, [], "naming them would turn a newer dotfile into noise");
  const css = emitStyleCss(style);
  assert.ok(!css.includes("--aether-shadow"));
  assert.ok(!css.includes("--aether-nope"));
});

// 16. absent is not rejected --------------------------------------------------

test("style: keys the dotfile never mentions are defaulted, not reported as ignored", () => {
  const { style, rejected } = buildStyle({ radius: "8px" });
  assert.equal(style.radius, "8px");
  assert.equal(style.gap, "1em", "an unmentioned key takes its default");
  assert.equal(style.motion_ms, 120);
  assert.deepEqual(
    rejected,
    [],
    "a one-line [style] must not report the other 15 keys as ignored",
  );
});

// 17. purity ------------------------------------------------------------------

const MODULE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "chrome",
  "JS",
  "aether-style.sys.mjs",
);

// Comments are prose and may legitimately name the things the code must not
// use; the ban is on code.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}

test("style: the module is pure — no Services, no DOM, no timers, no clock, no imports", () => {
  const code = stripComments(readFileSync(MODULE_PATH, "utf8"));
  for (const banned of [
    /\bServices\b/,
    /\bIOUtils\b/,
    /\bPathUtils\b/,
    /\bCi\b/,
    /\bCc\b/,
    /\bdocument\b/,
    /\bwindow\b/,
    /\bsetTimeout\b/,
    /\bsetInterval\b/,
    /\bDate\b/,
    /Math\.random/,
    // performance.now() is a wall clock too; the first draft of this list
    // banned Date and stopped, so a clock could have walked straight in.
    /\bperformance\b/,
    /\bprocess\b/,
    /\bglobalThis\b/,
    /\bcrypto\b/,
    /\bfetch\b/,
    /\bXMLHttpRequest\b/,
    /\bqueueMicrotask\b/,
    /\brequestAnimationFrame\b/,
    /\brequestIdleCallback\b/,
    /\bIntl\b/,
    /\btoLocale/,
    /\blocaleCompare\b/,
    /\bChromeUtils\b/,
    /\bComponents\b/,
  ]) {
    assert.ok(!banned.test(code), `aether-style.sys.mjs must not reference ${banned}`);
  }
  // `^\s*import[\s({]` catches only a statement-initial static import: it misses
  // `const m = await import(...)` and it misses `export {x} from "./y.mjs"`,
  // which is an import wearing a different word. `import` is a reserved word, so
  // banning it outright costs nothing legitimate.
  assert.ok(
    !/\bimport\b/.test(code),
    "the style module must have zero imports — static, dynamic, or import.meta",
  );
  assert.ok(
    !/\bexport\b[^;\n]*\bfrom\b/.test(code),
    "an `export … from` is a re-export, which is an import — the leaf has none",
  );
  assert.ok(/\bexport const DEFAULTS_STYLE\b/.test(code), "positive control: the bans are not vacuous");
  // and the guard itself must reject the things it claims to: if these ever
  // stop matching, the bans above have quietly become no-ops.
  assert.ok(/\bimport\b/.test('const m = await import("./y.mjs");'));
  assert.ok(/\bexport\b[^;\n]*\bfrom\b/.test('export { x } from "./y.mjs";'));
  assert.ok(/\bperformance\b/.test("performance.now()"));
});

test("style: buildStyle never mutates the table it was given", () => {
  const before = structuredClone(VALID);
  buildStyle(VALID);
  emitStyleCss(VALID);
  assert.deepEqual(VALID, before);

  const hostile = { ...ESCAPES };
  const hostileBefore = structuredClone(hostile);
  buildStyle(hostile);
  assert.deepEqual(hostile, hostileBefore);
});

test("style: DEFAULTS_STYLE cannot be written through", () => {
  assert.throws(() => {
    DEFAULTS_STYLE.radius = "9px";
  }, TypeError);
  assert.equal(DEFAULTS_STYLE.radius, "2px");
});

// 18. the length cap ----------------------------------------------------------

test("style: the 64-char cap holds on EVERY string-valued key, not just the two it is easy to test", () => {
  // The grammars have unbounded digit/name repetition; without the cap a
  // megabyte-long radius would validate and be emitted verbatim. A cap wired
  // into `isLength` but not the family or easing validator (or vice versa)
  // passes a two-key version of this test and fails this one.
  assert.deepEqual(STRING_KEYS.length, 13, "11 lengths + font + motion_ease");
  for (const key of STRING_KEYS) {
    const at64 = AT_LENGTH[key](64);
    const over = AT_LENGTH[key](65);
    assert.equal(at64.length, 64, `${key} fixture must be 64 chars`);
    assert.equal(over.length, 65, `${key} fixture must be 65 chars`);
    assert.deepEqual(buildStyle({ [key]: at64 }).rejected, [], `${key}: 64 chars is inside the cap`);
    assert.deepEqual(buildStyle({ [key]: over }).rejected, [key], `${key}: 65 chars is over it`);
  }

  const huge = `${"1".repeat(1_000_000)}px`;
  assert.deepEqual(buildStyle({ radius: huge }).rejected, ["radius"]);
  assert.ok(!emitStyleCss({ radius: huge }).includes("111"));
  const hugeFamily = "a".repeat(1_000_000);
  assert.deepEqual(buildStyle({ font: hugeFamily }).rejected, ["font"]);
  const hugeEase = `steps(1${"0".repeat(1_000_000)})`;
  assert.deepEqual(buildStyle({ motion_ease: hugeEase }).rejected, ["motion_ease"]);
});

test("style: the cap is checked BEFORE the regex, so an oversized value is never scanned", () => {
  // This is a non-functional property with no behavioural witness — `length` and
  // `test` in either order produce the same boolean — so it is pinned at the
  // source. Reordering them (regex first) is exactly what the module's comment
  // says it does not do, and without this assertion that comment is decoration:
  // a 1MB value would be handed to the engine before being thrown away.
  const src = readFileSync(MODULE_PATH, "utf8");
  const body = /function isText\([\s\S]*?\n\}/.exec(src)?.[0];
  assert.ok(body, "isText is the single shared string gate — find it or this test is a lie");
  const capAt = body.indexOf("MAX_LEN");
  const reAt = body.search(/re\s*\.\s*test/);
  assert.ok(capAt !== -1, "isText must consult MAX_LEN");
  assert.ok(reAt !== -1, "isText must run the regex");
  assert.ok(capAt < reAt, "the length cap must be checked before the regex runs");
  // and every string key goes through that one gate, so the ordering is global
  for (const key of STRING_KEYS) {
    assert.equal(VALIDATORS[key](AT_LENGTH[key](65)), false, `${key} must share the cap`);
  }
});

// 19. documented decisions, pinned so they stay decisions ---------------------

test("style: magnitude is deliberately NOT bounded — only length is", () => {
  // A 62-digit panel width validates and is emitted verbatim. That is on
  // purpose: the barrier's job is to keep CSS metacharacters out of privileged
  // chrome, not to stop the author making their own chrome silly — it is their
  // dotfile. Bounding magnitude would mean parsing the number, which is a
  // second grammar to keep honest. Pinned so that if someone later decides the
  // opposite, they change a test that says why rather than "fixing a bug".
  const big = `${"9".repeat(60)}vw`;
  assert.equal(big.length, 62, "inside the 64-char cap");
  assert.deepEqual(buildStyle({ panel_width: big }).rejected, []);
  assert.equal(decl(emitStyleCss({ panel_width: big }), "panel-width"), big);
});
