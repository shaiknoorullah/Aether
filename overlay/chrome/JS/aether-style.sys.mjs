// Aether style layer (r2) — pure. Owns the second var layer that sits beside
// f3's palette: radius, gaps, split padding, panel box, opacity, blur, font
// family/size, and motion (duration + easing + one master switch). It owns
// DEFAULTS_STYLE (the builtin, the DEFAULTS.style literal, and the example
// TOML are meant to be one set of values, so an empty [style] renders
// pixel-identical), one typed allow-list validator per key, the per-key merge,
// and the ":root { … }" text.
//
// It deliberately does NOT own: reading the dotfile, the <style> element, the
// reduced-motion override (a static CSS rule, not a listener), or any notion
// of elapsed time — motion_ms is a *value* this module writes into a var, never
// a delay it waits on, so there is no clock to inject. Zero imports: this is
// the leaf, and aether-config depends on it rather than the other way round.
//
// Validation is the CSS injection barrier, exactly as in aether-theme: every
// validator is an allow-list, rejection is the only defence, and there is no
// escaping step anywhere below. Nothing that fails a validator ever reaches
// emission — so no accepting grammar may admit a CSS metacharacter.
//
// The one deliberate divergence from f3: fallback is per KEY, not per source.
// A half-applied palette is unreadable, so colours are all-or-nothing; a
// half-applied style layer is merely less tuned, so a bad radius costs you the
// radius and nothing else.

// Longest value any key may carry. The grammars below have unbounded digit and
// name repetition, so without this a megabyte-long radius would validate and be
// emitted verbatim. Checked before any regex runs, which also keeps a hostile
// value from being scanned at all.
const MAX_LEN = 64;

// A single CSS length: a bare `0`, or an UNSIGNED decimal with one of six
// units. No calc(), no var(), no multi-value shorthand — a two-value "0 8px" is
// why padding is split into pad_y/pad_x rather than widening this.
//
// Unsigned on purpose. Not one of the eleven keys validated by this grammar
// reaches a CSS property that admits a negative: border-radius, gap, padding,
// border-width, width, max-height, blur() and font-size are all [0,∞]. A
// negative therefore cannot express anything — it can only produce an invalid
// declaration, and `font: -4px monospace` fails for exactly the reason
// RESERVED_FAMILIES exists (see below): an invalid-at-computed-value-time
// declaration resolves to `unset`, NOT to the var() fallback, so the surface
// loses size and family at once while `rejected` stays empty. A sign the schema
// has no use for is admitted nowhere.
//
// (The narrower sibling question — `%` is invalid for `border-width` and
// `blur()` though valid for the other nine keys — is left open on purpose; see
// the "percentages" test in r2-style.test.mjs for why it costs more than it
// buys today.)
const LENGTH_RE = /^(?:0|(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:px|rem|em|%|vh|vw))$/;

// A font *family name*, emitted verbatim as the family component of the `font`
// shorthand: words of
// letters/digits/underscore/hyphen, each starting with a letter, separated by
// exactly one space. Not a char class with ' ' in it — leading, trailing and
// doubled spaces are all rejected. No quotes, no commas, no url(), no fallback
// list. A config that can fetch a font is a config that can phone home.
const FAMILY_RE = /^[A-Za-z][A-Za-z0-9_-]*(?: [A-Za-z][A-Za-z0-9_-]*)*$/;

// …minus the identifiers that are not family names at all. The value is emitted
// into the `font` SHORTHAND (`font: <size> <family>`), and a CSS-wide keyword is
// not a permitted shorthand component — `font: 12px inherit` is an invalid
// declaration, so the statusbar would lose its font entirely. That is the
// wholesale degradation per-key fallback exists to prevent, arriving through a
// value the grammar said was fine. `default` is reserved by CSS Fonts for the
// same reason. Compared case-insensitively: CSS keywords are ASCII
// case-insensitive, so `Inherit` is the same hazard as `inherit`.
const RESERVED_FAMILIES = new Set([
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
  "default",
]);

function isFamily(v) {
  return isText(v, FAMILY_RE) && !RESERVED_FAMILIES.has(v.toLowerCase());
}

// An <easing-function>: the seven keywords, a four-argument cubic-bezier, or
// steps() with an optional jump term. steps() takes a POSITIVE integer — a
// leading digit of 0 makes `steps(0)` (and `steps(007)`) invalid CSS, which
// would silently kill the transition it was meant to shape, so the grammar
// refuses it rather than emitting a value the engine will drop. Anchored and
// whitespace-exact — the only separator allowed inside the parens is "," or
// ", ", never a tab or newline,
// and the whole production is anchored so a payload cannot ride along after a
// valid prefix. Assembled from one signed-decimal fragment so the four
// arguments cannot drift apart.
const DECIMAL = String.raw`-?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)`;
const KEYWORDS = "linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end";
const JUMPS = "jump-start|jump-end|jump-none|jump-both|start|end";
const EASE_RE = new RegExp(
  `^(?:${KEYWORDS}` +
    `|cubic-bezier\\((?:${DECIMAL}, ?){3}${DECIMAL}\\)` +
    `|steps\\([1-9][0-9]*(?:, ?(?:${JUMPS}))?\\))$`,
);

// Emission order is normative: it fixes the order of the declarations, the
// order of `rejected`, and therefore the text of the message the statusbar
// shows. `motion` is last because it is a gate, not a var.
export const DEFAULTS_STYLE = Object.freeze({
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

const KEYS = Object.freeze(Object.keys(DEFAULTS_STYLE));

// Every validator is total: it must return a boolean for literally any input
// and never throw. The `typeof` guard comes first on every path so a value with
// a hostile toString/valueOf is never coerced.
function isText(v, re) {
  return typeof v === "string" && v.length <= MAX_LEN && re.test(v);
}

function isLength(v) {
  return isText(v, LENGTH_RE);
}

// A bounded unitless integer. Rejects floats on purpose: the TOML parser has no
// float branch, so a bare `opacity = 0.96` arrives here as the STRING "0.96",
// and a schema with no floats in it is the cheapest way to keep that honest.
function isCount(min, max) {
  return v => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
}

export const VALIDATORS = Object.freeze({
  radius: isLength,
  gap: isLength,
  pad_y: isLength,
  pad_x: isLength,
  row_pad_y: isLength,
  row_pad_x: isLength,
  border: isLength,
  panel_width: isLength,
  panel_height: isLength,
  opacity: isCount(0, 100),
  blur: isLength,
  font: isFamily,
  font_size: isLength,
  motion_ms: isCount(0, 10000),
  motion_ease: v => isText(v, EASE_RE),
  motion: v => typeof v === "boolean",
});

// Reading a property can throw: an accessor that throws, a Proxy whose has/get
// trap throws, a revoked Proxy. A [style] table can arrive from a synced
// dotfile or from glue, so a hostile read must degrade to ABSENT — take the
// default, report nothing — rather than take the style pass, and with it r1's
// whole reload, down. Same guard and same reasoning as aether-reload's
// safeRead. ABSENT is a module-private symbol, so no config value can forge it.
const ABSENT = Symbol("absent");

function safeRead(src, key) {
  try {
    return Object.hasOwn(src, key) ? src[key] : ABSENT;
  } catch {
    return ABSENT;
  }
}

// [style] table → {style, rejected}. Never throws, never mutates the input,
// never hands back the frozen constant. Own keys only, so an inherited or
// __proto__-borne value is invisible rather than adopted. A key the dotfile
// never mentions is defaulted silently — reporting it would turn a one-line
// [style] into fifteen lines of noise. An unknown key is dropped silently too,
// so a newer dotfile degrades quietly on an older Aether. "Never throws" covers
// the container as well as the values: a key whose read throws is indistinguish-
// able from a key that is not there, so it takes the same silent default.
export function buildStyle(table) {
  const src = table !== null && typeof table === "object" ? table : {};
  const style = {};
  const rejected = [];
  for (const key of KEYS) {
    const value = safeRead(src, key);
    if (value !== ABSENT) {
      if (VALIDATORS[key](value)) {
        style[key] = value;
        continue;
      }
      rejected.push(key);
    }
    style[key] = DEFAULTS_STYLE[key];
  }
  return { style, rejected };
}

// How each key reaches CSS. Lengths, the family and the easing go out verbatim
// (they got through an allow-list to be here); the two unitless counts pick up
// their unit at the boundary rather than in the model, so r5 can still show the
// configured number.
function declValue(style, key, durationMs) {
  switch (key) {
    case "opacity":
      return `${style.opacity}%`;
    case "motion_ms":
      return `${durationMs}ms`;
    default:
      return style[key];
  }
}

// Validated style → ":root { --aether-*: …; }". Re-validates its argument, so
// glue that forgets to call buildStyle first still cannot emit raw user input
// into privileged chrome. Deterministic: the order comes from DEFAULTS_STYLE,
// never from iterating the input.
//
// `motion = false` is the single switch — it zeroes the duration var at
// emission only, which disables every transition through one value while
// leaving the configured number intact in the model.
export function emitStyleCss(style) {
  const s = buildStyle(style).style;
  const durationMs = s.motion ? s.motion_ms : 0;
  const decls = [];
  for (const key of KEYS) {
    if (key === "motion") continue;
    const name = key.split("_").join("-");
    decls.push(`  --aether-${name}: ${declValue(s, key, durationMs)};`);
  }
  return `:root {\n${decls.join("\n")}\n}\n`;
}
