// Aether theming — pure palette logic. Parses pywal colors.json and the
// base16-style [theme.colors] TOML table into a validated {bg, fg, accent,
// color0..15} map and emits it as --aether-* CSS custom properties. No
// Services, no IOUtils, no DOM — glue in aether.uc.js reads files and swaps
// the <style id="aether-theme"> text.
//
// Validation is the CSS injection barrier: a source is all-or-nothing, and
// anything that is not strict #rrggbb never reaches emission.

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// bg/fg/color0..15 are required in every source; accent is optional and
// defaults to color4.
const REQUIRED_KEYS = [
  "bg",
  "fg",
  ...Array.from({ length: 16 }, (_, i) => `color${i}`),
];
const PALETTE_KEYS = ["bg", "fg", "accent", ...REQUIRED_KEYS.slice(2)];

// Builtin fallback — gruvbox dark, the exact hexes userChrome.css shipped
// with before theming. Also the one source of truth for DEFAULTS.theme.colors
// and the example TOML.
export const GRUVBOX = Object.freeze({
  bg: "#1d2021",
  fg: "#ebdbb2",
  accent: "#458588",
  color0: "#282828",
  color1: "#cc241d",
  color2: "#98971a",
  color3: "#d79921",
  color4: "#458588",
  color5: "#b16286",
  color6: "#689d6a",
  color7: "#a89984",
  color8: "#928374",
  color9: "#fb4934",
  color10: "#b8bb26",
  color11: "#fabd2f",
  color12: "#83a598",
  color13: "#d3869b",
  color14: "#8ec07c",
  color15: "#ebdbb2",
});

function normalizeHex(v) {
  return typeof v === "string" && HEX_RE.test(v) ? v.toLowerCase() : null;
}

// Strict completeness + #rrggbb on every slot (case-insensitive).
export function validatePalette(obj) {
  if (!obj || typeof obj !== "object") return false;
  return PALETTE_KEYS.every(k => normalizeHex(obj[k]) !== null);
}

// {bg, fg, color0..15, accent?} raw values → validated lowercase palette,
// or null. All-or-nothing: one bad or missing slot rejects everything.
function buildPalette(raw) {
  if (!raw || typeof raw !== "object") return null;
  const out = {};
  for (const k of REQUIRED_KEYS) {
    const v = normalizeHex(raw[k]);
    if (v === null) return null;
    out[k] = v;
  }
  const accent = raw.accent === undefined ? out.color4 : normalizeHex(raw.accent);
  if (accent === null) return null;
  return { bg: out.bg, fg: out.fg, accent, ...pick(out, REQUIRED_KEYS.slice(2)) };
}

function pick(obj, keys) {
  return Object.fromEntries(keys.map(k => [k, obj[k]]));
}

// pywal ~/.cache/wal/colors.json text → palette | null. Never throws.
export function parseWalJson(text) {
  if (typeof text !== "string") return null;
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const raw = {
    bg: obj.special?.background,
    fg: obj.special?.foreground,
  };
  for (let i = 0; i < 16; i++) raw[`color${i}`] = obj.colors?.[`color${i}`];
  return buildPalette(raw);
}

// [theme.colors] TOML table → palette | null. Same validation as wal.
export function parseThemeColors(table) {
  return buildPalette(table);
}

// Pick the palette to apply. auto: wal → toml → builtin; a forced source
// falls back to builtin only — a broken dotfile or wal run never bricks the
// chrome. sourceUsed reports what actually applied.
export function resolvePalette({ source = "auto", walText = null, tomlColors = null } = {}) {
  const wal = () => {
    const p = parseWalJson(walText);
    return p && { palette: p, sourceUsed: "wal" };
  };
  const toml = () => {
    const p = parseThemeColors(tomlColors);
    return p && { palette: p, sourceUsed: "toml" };
  };
  const builtin = { palette: GRUVBOX, sourceUsed: "builtin" };
  switch (source) {
    case "wal":
      return wal() ?? builtin;
    case "toml":
      return toml() ?? builtin;
    case "builtin":
      return builtin;
    default: // "auto" (and anything unrecognized degrades to auto)
      return wal() ?? toml() ?? builtin;
  }
}

// Palette → ":root { --aether-*: …; }" text for the chrome style element.
// Only validated palettes are emitted; anything else emits the builtin.
export function emitCss(palette) {
  const p = validatePalette(palette) ? palette : GRUVBOX;
  const decls = PALETTE_KEYS.map(k => `  --aether-${k}: ${p[k].toLowerCase()};`);
  return `:root {\n${decls.join("\n")}\n}\n`;
}

// "~/x" + home → home/x; everything else passes through unchanged.
export function expandPath(path, home) {
  if (typeof path !== "string") return path;
  if (path === "~") return home;
  if (path.startsWith("~/")) return home + path.slice(1);
  return path;
}
