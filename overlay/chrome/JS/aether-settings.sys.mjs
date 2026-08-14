// Aether settings schema (r5) — the one hand-written table of every option the
// panel can show, plus the pure logic around it: layer resolution with
// provenance, the override table the panel owns, and the serialiser that writes
// it back. No Services, no IOUtils, no DOM, no clock, no module-level mutable
// state; the glue (aether.uc.js) owns the atomic write, the pref writes and the
// reload trigger.
//
// What this module deliberately does NOT do:
//   * it never touches the hand-written dotfile — it does not even name it; the
//     only file it can describe is the machine-local override table, and the
//     layer mapping goes through AetherConfig.SOURCE_FILES positionally;
//   * it never enumerates the two open tables (keys and colours). Editing keys
//     stays a TOML act and there is no colour picker, so per-leaf coverage is
//     the wrong shape for both;
//   * it never escapes a value. An exact emit -> parse round-trip and escaping
//     cannot both hold against the shipped parser (a quoted value is sliced
//     verbatim and the parser is line-based), so a value the parser could not
//     reproduce is REFUSED at the write boundary and DROPPED at the emit
//     boundary. Round-trip becomes exact by construction.
//
// Two properties are kept apart deliberately, because one boolean for both is
// how a panel ends up lying about a working config:
//   * `valid`        — the value satisfies the rule the LOADER applies. Where a
//                      loader-side rule exists it is imported, not retyped:
//                      r2's VALIDATORS own every [style] key and f7's
//                      validateBaseUrl owns ai.base_url, so the panel cannot
//                      drift into refusing a value the browser is happily using
//                      (or, worse, accepting one the loader drops).
//   * `representable` — aether.local.toml could carry this exact value back.
//                      That is a property of the SERIALISER, not of the config,
//                      so a trailing-space workspace name reads valid and
//                      unrepresentable rather than "invalid".
//
// Every export is total: nothing throws, on any input, in any position.

import { AetherConfig } from "./aether-config.sys.mjs";
import { LOCAL_CONFIG_HEADER } from "./aether-strings.sys.mjs";
import { VALIDATORS as STYLE_VALIDATORS } from "./aether-style.sys.mjs";
import { validateBaseUrl } from "./aether-ai-client.sys.mjs";
import { parseBinding } from "./aether-keys.sys.mjs";

const DEFAULTS = AetherConfig.DEFAULTS;

// The two DEFAULTS subtrees the panel browses but never enumerates as rows.
// Exactly two, frozen, so a third can never be added quietly.
export const OPEN_TABLES = Object.freeze(["keymap", "theme.colors"]);

// DEFAULTS' own section order, which is also SCHEMA's row order.
export const SECTIONS = Object.freeze([
  "options",
  "statusbar",
  "ai",
  "focus",
  "graveyard",
  "workspaces",
  "boosts",
  "theme",
  "style",
  "panels",
  "privacy",
]);

export const ERRORS = Object.freeze({
  UNKNOWN_PATH: "unknown_path",
  PREF_OWNED: "pref_owned",
  UNSAFE_VALUE: "unsafe_value",
  INVALID_VALUE: "invalid_value",
});

// Lowest precedence first — the tag a row carries names the top layer that HAS
// the key, never the top layer whose value happens to differ.
export const PROVENANCE = Object.freeze(["default", "dotfile", "local", "pref"]);

// [privacy] doh -> network.trr.mode. 0 = off, 2 = DoH with plain-DNS fallback,
// 3 = DoH only. The TOML is the authority; the pref is an implementation detail.
export const TRR_MODES = Object.freeze({ off: 0, fallback: 2, strict: 3 });

// A section or key that would graft onto Object.prototype is never walked,
// never copied and never emitted — the same rule the loader applies.
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

// Copy/emit depth cap: a cyclic or absurdly nested table terminates instead of
// blowing the stack.
const MAX_DEPTH = 16;

// --- the safety filter -------------------------------------------------------
// The injection barrier, applied BEFORE any validator. These characters are
// what the shipped parser cannot reproduce exactly (a `"` flips its
// in-string parity, a `#` starts a comment, `[`/`]` are section and array
// syntax, and the parser is line-based so a newline is unrepresentable at all).
// Commas, parens, `:`, `/` and INTERIOR spaces stay allowed — two shipped
// defaults need them.
const UNSAFE_CHARS = /["#\[\]\\\x00-\x1f\x7f]/;

// The one exception, and it is the only `#` this config legitimately carries: a
// strict six-digit hex colour, exactly f3's rule. Colours are an open table the
// panel never writes, but the serialiser still has to be able to reproduce one
// if a local table ever holds it — while an interior `#` (which becomes a
// comment the moment a quote goes missing) stays refused.
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function isSafeString(value) {
  if (typeof value !== "string") return false;
  if (value !== value.trim()) return false;
  if (HEX_COLOR_RE.test(value)) return true;
  return !UNSAFE_CHARS.test(value);
}

// Numbers are text once they reach a file, and String() is not a decimal-digit
// guarantee: an integer of 1e21 or more stringifies in exponential notation,
// which parseValue's /^-?\d+$/ does not match, so it would come back as the
// STRING "1e+21". `-0` stringifies as "0" and comes back as +0. Both are
// integers by Number.isInteger, both are reachable (parseValue turns a long
// digit run into 1e21, and Number("-0") is -0), and both silently change type
// or identity across the file — so both are unrepresentable, here and in
// emitValue, which is the same rule stated twice on purpose.
//
// A NON-integer is deliberately let through this filter: floats have no parser
// branch at all, which is a schema question, so they are rejected by the
// validators with INVALID_VALUE rather than blamed on the serialiser.
function isSafeNumber(value) {
  if (!Number.isInteger(value)) return true;
  return Number.isSafeInteger(value) && !Object.is(value, -0);
}

// Array elements carry one extra rule: parseValue splits an array on `,`, so a
// comma inside an element could never come back as one element.
function isSafeValue(value) {
  if (typeof value === "string") return isSafeString(value);
  if (typeof value === "number") return isSafeNumber(value);
  if (Array.isArray(value)) {
    for (const element of value) {
      if (typeof element !== "string") continue;
      if (!isSafeString(element) || element.includes(",")) return false;
    }
    return true;
  }
  return true;
}

// --- small total helpers -----------------------------------------------------

function isTable(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asTable(value) {
  return isTable(value) ? value : {};
}

// Read one own property as DATA — the descriptor, never an accessor. A layer,
// a registry and a keymap can all arrive from a file or from a mod, and a
// getter that runs during a render pass could return different rows for
// identical arguments.
function ownValue(table, key) {
  if (!isTable(table) && typeof table !== "function") return undefined;
  let descriptor;
  try {
    descriptor = Object.getOwnPropertyDescriptor(table, key);
  } catch {
    return undefined;
  }
  return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

// --- key safety --------------------------------------------------------------
// aether.local.toml is panel-owned but it is a full config LAYER: the loader
// deep-merges it like any source, so anything a user put there by hand has to
// survive the next panel write. The serialiser therefore preserves every key it
// can prove the parser reads back identically, and quotes the ones that are not
// bare identifiers — `[keymap.normal] ":" = "palette"` is the shipped default
// keymap's own shape, and dropping it silently is data loss, not safety.
//
// Bare when it is an identifier (so an ordinary file never churns), quoted
// otherwise. parseToml unquotes a key, so a quoted key is exact — with three
// characters excepted, each for a mechanical reason:
//   `"` flips the parser's in-string parity (comment stripping and the key's
//       own closing quote both read it),
//   `=` is found by indexOf BEFORE the key is unquoted, so it would split the
//       line inside the key,
//   a control character (newline included) cannot survive a line-based parser.
// An empty key is refused too: `"" = 1` unquotes to the empty key, which the
// parser counts as a broken line.
const BARE_KEY_RE = /^[A-Za-z0-9_-]+$/;
const UNSAFE_LEAF_KEY = /["=\x00-\x1f\x7f]/;

function isSafeKey(key) {
  return (
    typeof key === "string" &&
    key !== "" &&
    !UNSAFE_KEYS.has(key) &&
    !UNSAFE_LEAF_KEY.test(key)
  );
}

// A SECTION key is stricter, because a header is not quotable: parseToml reads
// `["a b"]` as the key `"a b"` WITH the quotes, splits the header on ".", and
// trims each part. So a section name has to be exactly what it emits — no dot,
// no bracket, no edge whitespace — and no `#`, which is stripped as a comment
// outside a string and would truncate the header to `[a`, breaking the file.
const UNSAFE_SECTION_KEY = /["#.\[\]\x00-\x1f\x7f]/;

function isSafeSectionKey(key) {
  return (
    typeof key === "string" &&
    key !== "" &&
    !UNSAFE_KEYS.has(key) &&
    !UNSAFE_SECTION_KEY.test(key) &&
    key === key.trim()
  );
}

function emitKey(key) {
  return BARE_KEY_RE.test(key) ? key : `"${key}"`;
}

// --- validators --------------------------------------------------------------
// Every validator is total: it returns a boolean for literally any input and
// never throws. The typeof guard comes first on every path so a value with a
// hostile toString is never coerced.

const MAX_TEXT = 256;

function isText(value, re, max = MAX_TEXT) {
  return typeof value === "string" && value.length <= max && re.test(value);
}

function isBool(value) {
  return typeof value === "boolean";
}

// A bounded unitless integer. Floats are rejected on purpose: the parser has no
// float branch, so a bare 0.96 arrives as the STRING "0.96".
function isCount(min, max) {
  return value =>
    typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

function isOneOf(values) {
  const allowed = Object.freeze([...values]);
  return value => typeof value === "string" && allowed.includes(value);
}

// Every [style] key is validated by r2's OWN validator function, taken from its
// module rather than retyped here. Spec §2 says the panel uses "the same
// validators the config layer uses", and a hand-kept copy is exactly how
// `radius = "-2px"` becomes writable in the panel and rejected by the loader:
// r2's length grammar is UNSIGNED on purpose (none of the eleven length keys
// admits a negative, and `font: -4px monospace` resolves to `unset` rather
// than to the var() fallback), and a copy drifts on the one character that
// matters. Identity, not agreement: there is nothing left to drift.
//
// A missing or non-function entry validates NOTHING rather than everything —
// an unwritable row is recoverable, a row that writes past the loader is not.
function styleValidator(key) {
  const fn = ownValue(STYLE_VALIDATORS, key);
  return typeof fn === "function" ? value => fn(value) === true : () => false;
}

// Hint labels: distinct lowercase letters. A repeated character would label two
// links the same, which makes one of them unreachable.
function isHintChars(value) {
  if (!isText(value, /^[a-z]{2,36}$/)) return false;
  return new Set(value).size === value.length;
}

// A filesystem path as a dotfile writes one: `~`, letters, digits and the
// punctuation a path needs. No quoting, no globbing, no shell metacharacters.
const PATH_RE = /^[A-Za-z0-9~/][A-Za-z0-9 ~/._-]*$/;
function isPath(value) {
  return isText(value, PATH_RE);
}

// http(s) on a loopback host, any port — f7's rule, imported rather than
// approximated. A regex of my own was strictly narrower (it refused a query
// string and an uppercase host that the client accepts), which made the panel
// report a working gateway as invalid and refuse to let the user retype it.
// The one divergence left is the length cap, which bounds a hostile value
// before URL parsing and cannot be reached by a real gateway URL.
function isLoopbackUrl(value) {
  if (typeof value !== "string" || value.length > MAX_TEXT) return false;
  return validateBaseUrl(value) === true;
}

// A resolver reached over plain http would defeat the point of the setting.
const RESOLVER_RE = /^https:\/\/[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::[0-9]{1,5})?(?:\/[A-Za-z0-9._~/-]*)?$/;
function isResolverUrl(value) {
  return isText(value, RESOLVER_RE);
}

const MODEL_RE = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
function isModelName(value) {
  return isText(value, MODEL_RE, 128);
}

const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9 _-]*$/;
function isName(value) {
  return isText(value, NAME_RE, 32);
}

const WIDGET_RE = /^[a-z][a-z0-9_]*$/;
function isWidgetList(value) {
  if (!Array.isArray(value) || value.length > 32) return false;
  return value.every(widget => isText(widget, WIDGET_RE, 32));
}

// --- the schema --------------------------------------------------------------
// Hand-written, deliberately: a schema generated from DEFAULTS would make the
// coverage guard vacuous and could not carry a description, a type tag or a
// validator. One entry per non-open leaf, in DEFAULTS walk order.

function option(path, type, value, description, validator, extra = {}) {
  const parts = String(path).split(".");
  return Object.freeze({
    path,
    section: parts[0],
    key: parts[parts.length - 1],
    type,
    ...(extra.values ? { enum: Object.freeze([...extra.values]) } : {}),
    default: Array.isArray(value) ? Object.freeze([...value]) : value,
    description,
    validator,
    ...(extra.pref ? { pref: extra.pref } : {}),
    ...(extra.restart ? { restart: true } : {}),
  });
}

const THEME_SOURCES = ["auto", "wal", "toml", "builtin"];
const PANEL_SCOPES = ["workspace", "all"];
const DOH_MODES = ["off", "fallback", "strict"];

export const SCHEMA = Object.freeze([
  option("options.scroll_step", "int", 120,
    "pixels moved by one scroll key press", isCount(1, 10000)),
  option("options.hint_chars", "string", "asdfghjkl",
    "letters used to label link hints", isHintChars),
  option("options.statusbar_clock", "bool", true,
    "show the clock widget in the statusbar", isBool),
  option("options.pending_timeout_ms", "int", 800,
    "milliseconds a partial chord waits for its next key", isCount(0, 10000)),
  option("options.palette_max_items", "int", 8,
    "rows the command palette shows at once", isCount(1, 100)),
  option("options.config_watch", "bool", true,
    "reload the config automatically when the file is saved", isBool),
  option("options.which_key_ms", "int", 400,
    "pause before the binding panel appears; -1 keeps it hidden", isCount(-1, 10000)),

  option("statusbar.widgets", "list",
    ["mode", "workspace", "focus", "url", "msg", "ai", "clock", "date"],
    "statusbar widgets, in the order they are drawn", isWidgetList),

  option("ai.enabled", "bool", false,
    "the local AI kill switch; off means no model is contacted", isBool,
    { pref: "aether.ai.enabled" }),
  option("ai.base_url", "string", "http://127.0.0.1:11434/v1",
    "OpenAI-compatible gateway URL; loopback hosts only", isLoopbackUrl),
  option("ai.model", "string", "llama3.2",
    "model name sent verbatim to the gateway", isModelName),

  option("focus.quiet_notifications", "bool", true,
    "silence web notifications while a focus session runs", isBool),

  option("graveyard.cap", "int", 500,
    "how many closed tabs the graveyard keeps", isCount(1, 100000),
    { restart: true }),

  option("workspaces.default", "string", "main",
    "workspace a fresh profile starts in", isName, { restart: true }),
  option("workspaces.resurrect", "bool", true,
    "put each tab back where it was when it returns", isBool),

  option("boosts.enabled", "bool", true,
    "master switch for the per-site CSS boosts", isBool),
  option("boosts.dir", "string", "~/.config/aether/boosts",
    "directory holding the per-site boost stylesheets", isPath),

  option("theme.source", "enum", "auto",
    "where colours come from: auto, wal, toml or builtin", isOneOf(THEME_SOURCES),
    { values: THEME_SOURCES }),
  option("theme.wal_json", "string", "~/.cache/wal/colors.json",
    "path to pywal's colors.json", isPath),

  option("style.radius", "string", "2px",
    "corner radius of Aether's own surfaces", styleValidator("radius")),
  option("style.gap", "string", "1em",
    "space between statusbar segments", styleValidator("gap")),
  option("style.pad_y", "string", "0",
    "vertical padding inside a panel", styleValidator("pad_y")),
  option("style.pad_x", "string", "8px",
    "horizontal padding inside a panel", styleValidator("pad_x")),
  option("style.row_pad_y", "string", "2px",
    "vertical padding inside one panel row", styleValidator("row_pad_y")),
  option("style.row_pad_x", "string", "8px",
    "horizontal padding inside one panel row", styleValidator("row_pad_x")),
  option("style.border", "string", "1px",
    "border width on Aether's own surfaces", styleValidator("border")),
  option("style.panel_width", "string", "38rem",
    "width of the palette and panel surfaces", styleValidator("panel_width")),
  option("style.panel_height", "string", "60vh",
    "maximum height of the palette and panel surfaces", styleValidator("panel_height")),
  option("style.opacity", "int", 100,
    "panel opacity, as a whole percent", styleValidator("opacity")),
  option("style.blur", "string", "0",
    "backdrop blur radius under a panel", styleValidator("blur")),
  option("style.font", "string", "monospace",
    "font family for Aether's own chrome", styleValidator("font")),
  option("style.font_size", "string", "12px",
    "font size for Aether's own chrome", styleValidator("font_size")),
  option("style.motion_ms", "int", 120,
    "transition duration in milliseconds", styleValidator("motion_ms")),
  option("style.motion_ease", "string", "cubic-bezier(0.22, 1, 0.36, 1)",
    "easing curve for panel transitions", styleValidator("motion_ease")),
  option("style.motion", "bool", true,
    "master switch for animation; off means 0ms everywhere", styleValidator("motion")),

  option("panels.scope", "enum", "workspace",
    "tab panel scope: the current workspace, or every one", isOneOf(PANEL_SCOPES),
    { values: PANEL_SCOPES }),

  option("privacy.doh", "enum", "fallback",
    "DNS over HTTPS mode: off, fallback or strict", isOneOf(DOH_MODES),
    { values: DOH_MODES }),
  option("privacy.doh_url", "string", "https://dns.quad9.net/dns-query",
    "resolver queried when DNS over HTTPS is on", isResolverUrl),
]);

// --- lookup and validation ---------------------------------------------------

function isEntry(entry) {
  return (
    isTable(entry) &&
    typeof entry.path === "string" &&
    entry.path !== "" &&
    typeof entry.type === "string"
  );
}

// A scan, never a property access on a path-keyed object: a lookup by property
// name is exactly how "toString" and "constructor" resolve to inherited junk.
// A passed schema REPLACES SCHEMA rather than extending it.
export function schemaEntry(path, schema = SCHEMA) {
  if (typeof path !== "string" || path === "") return null;
  if (!Array.isArray(schema)) return null;
  for (const entry of schema) {
    if (isEntry(entry) && entry.path === path) return entry;
  }
  return null;
}

// The entry's own rule, on its own — what the loader would do with this value.
// Total: a validator that throws answers false.
function validateSchemaValue(entry, value) {
  if (!isEntry(entry) || typeof entry.validator !== "function") return false;
  try {
    return entry.validator(value) === true;
  } catch {
    return false;
  }
}

// The WRITE gate. Order is normative: entry shape, then the safety filter, then
// the entry's own validator. The safety filter is the injection barrier and
// runs first so a grammar that happens to accept a quote can never open one.
// (buildRows deliberately does NOT use this — a row reports the two properties
// separately; see the header.)
export function validateValue(entry, value) {
  if (!isEntry(entry) || typeof entry.validator !== "function") {
    return { ok: false, error: ERRORS.UNKNOWN_PATH };
  }
  if (!isSafeValue(value)) return { ok: false, error: ERRORS.UNSAFE_VALUE };
  return validateSchemaValue(entry, value)
    ? { ok: true }
    : { ok: false, error: ERRORS.INVALID_VALUE };
}

// --- layers and rows ---------------------------------------------------------

const ABSENT = Object.freeze({ has: false, value: undefined });

// Walk one layer for one dotted path. Own keys only, prototype keys inert, a
// non-table anywhere along the way means the layer simply does not have it.
// Every read is a DESCRIPTOR read (ownValue): a layer can arrive from glue, and
// an accessor there would run code during a render pass and could make two
// buildRows calls on the same layers disagree.
function readPath(layer, path) {
  let cursor = layer;
  for (const part of String(path).split(".")) {
    if (UNSAFE_KEYS.has(part) || part === "") return ABSENT;
    if (!isTable(cursor)) return ABSENT;
    const value = ownValue(cursor, part);
    if (value === undefined) return ABSENT;
    cursor = value;
  }
  return { has: true, value: cursor };
}

// Pref names are flat keys with dots in them, never paths — a pref is read by
// its whole name or not at all. An explicitly-undefined pref is not a value.
function readPref(prefs, name) {
  if (typeof name !== "string" || UNSAFE_KEYS.has(name)) return ABSENT;
  if (!isTable(prefs)) return ABSENT;
  const value = ownValue(prefs, name);
  return value === undefined ? ABSENT : { has: true, value };
}

function resolve(entry, layers) {
  if (typeof entry.pref === "string") {
    const fromPref = readPref(layers.prefs, entry.pref);
    if (fromPref.has) return { value: fromPref.value, provenance: "pref" };
  }
  const fromLocal = readPath(layers.local, entry.path);
  if (fromLocal.has) return { value: fromLocal.value, provenance: "local" };
  const fromDotfile = readPath(layers.dotfile, entry.path);
  if (fromDotfile.has) return { value: fromDotfile.value, provenance: "dotfile" };
  const fromDefaults = readPath(layers.defaults, entry.path);
  if (fromDefaults.has) return { value: fromDefaults.value, provenance: "default" };
  return { value: entry.default, provenance: "default" };
}

// The panel's rows: one per schema entry, resolved value plus the provenance
// tag that makes a layered config comprehensible. `key` is the stable panel
// identity r4 keys, groups and filters by — the path, never an index.
export function buildRows(schema = SCHEMA, layers = {}) {
  if (!Array.isArray(schema)) return [];
  const source = isTable(layers) ? layers : {};
  const resolved = {
    defaults: asTable(source.defaults),
    dotfile: asTable(source.dotfile),
    local: asTable(source.local),
    prefs: asTable(source.prefs),
  };
  const rows = [];
  for (const entry of schema) {
    if (!isEntry(entry)) continue;
    const parts = entry.path.split(".");
    const { value, provenance } = resolve(entry, resolved);
    const description = typeof entry.description === "string" ? entry.description : "";
    rows.push({
      path: entry.path,
      section: typeof entry.section === "string" ? entry.section : parts[0],
      key: entry.path,
      leaf: parts[parts.length - 1],
      type: entry.type,
      ...(entry.enum ? { enum: entry.enum } : {}),
      description,
      default: entry.default,
      // A copy, frozen: the resolved value can BE the array inside DEFAULTS (a
      // layer the caller does not own and which is not frozen), so handing the
      // live reference out lets one panel consumer that sorts a list corrupt
      // the process-wide defaults.
      value: freezeValue(copyValue(value)),
      provenance,
      // The loader's rule, and nothing else. Running the serialiser's filter
      // here too would flag `default = "main "` — which the loader reads and
      // uses — as invalid, and "the panel says my working setting is broken"
      // is the same unanswerable question the pref rule exists to prevent.
      valid: validateSchemaValue(entry, value),
      // …and the serialiser's filter, named as the separate thing it is: can
      // aether.local.toml carry this exact value back?
      representable: isSafeValue(value),
      writeTarget: typeof entry.pref === "string" ? "pref" : "file",
      pref: typeof entry.pref === "string" ? entry.pref : undefined,
      restart: entry.restart === true,
      text: `${entry.path} ${description}`,
      label: entry.path,
    });
  }
  return rows;
}

// The loader publishes its per-source tables in precedence order; provenance is
// computed off them rather than guessed. The mapping is positional against
// AetherConfig.SOURCE_FILES, with the path suffix as the cross-check, so this
// module never has to name a file.
export function layersFromConfig(config, prefs = {}) {
  const names = Array.isArray(AetherConfig.SOURCE_FILES) ? AetherConfig.SOURCE_FILES : [];
  const sources =
    isTable(config) && Array.isArray(config.sources) ? config.sources : [];
  const tableAt = index => {
    const name = names[index];
    let source =
      typeof name === "string"
        ? sources.find(s => isTable(s) && typeof s.path === "string" && s.path.endsWith(name))
        : undefined;
    source ??= sources[index];
    const table = isTable(source) ? source.table : null;
    return isTable(table) ? table : {};
  };
  return {
    defaults: DEFAULTS,
    dotfile: tableAt(0),
    local: tableAt(1),
    prefs: asTable(prefs),
  };
}

// --- the override table ------------------------------------------------------

function copyValue(value) {
  return Array.isArray(value) ? value.slice() : value;
}

// Rows are read-only data. Freezing the copy makes a consumer that splices a
// list value throw on its own array rather than corrupt someone else's
// layer, and matches how entry.default is already published.
function freezeValue(value) {
  return Array.isArray(value) ? Object.freeze(value) : value;
}

// A plain deep copy: prototype keys dropped, arrays copied, depth capped so a
// cyclic table terminates. Anything that is not a table copies as empty.
function copyTable(value, depth = 0) {
  const out = {};
  if (!isTable(value) || depth >= MAX_DEPTH) return out;
  for (const key of Object.keys(value)) {
    if (UNSAFE_KEYS.has(key)) continue;
    const child = ownValue(value, key); // data, never an accessor
    if (child === undefined) continue;
    out[key] = isTable(child) ? copyTable(child, depth + 1) : copyValue(child);
  }
  return out;
}

// Write one leaf into a NEW override table. The panel cannot author a value the
// loader would reject, cannot author one the parser could not reproduce, and
// cannot author a key a pref would outrank — each of those comes back as the
// error shape instead, with the caller's table untouched.
//
// `schema` is the fourth argument and defaults to SCHEMA, so a caller that
// renders extra rows (x2's mods: "if they do, they appear here for free") can
// WRITE them as well as display them, and setOverride.length stays 3. An entry
// from such a schema is data, not code: its path is walked under the same
// prototype rule as everything else, so a mod cannot reach Object.prototype by
// declaring one.
export function setOverride(localTable, path, value, schema = SCHEMA) {
  const entry = schemaEntry(path, schema);
  if (!entry) return { ok: false, error: ERRORS.UNKNOWN_PATH, path };
  if (typeof entry.pref === "string") {
    return { ok: false, error: ERRORS.PREF_OWNED, path };
  }
  const parts = entry.path.split(".");
  if (parts.some(part => part === "" || UNSAFE_KEYS.has(part))) {
    return { ok: false, error: ERRORS.UNKNOWN_PATH, path };
  }
  const checked = validateValue(entry, value);
  if (!checked.ok) return { ok: false, error: checked.error, path };

  const table = copyTable(localTable);
  let cursor = table;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!isTable(cursor[parts[i]])) cursor[parts[i]] = {};
    cursor = cursor[parts[i]];
  }
  cursor[parts[parts.length - 1]] = copyValue(value);
  return { ok: true, table };
}

// Drop one leaf and every section it leaves empty — a fully reset table is
// exactly {}, so reverting through the panel and deleting the file agree.
// Never errors: an absent, unknown, prototype-shaped or garbage path is a no-op.
export function resetOverride(localTable, path) {
  const table = copyTable(localTable);
  if (typeof path !== "string" || path === "") return { ok: true, table };
  const parts = path.split(".");
  if (parts.some(part => part === "" || UNSAFE_KEYS.has(part))) return { ok: true, table };

  const chain = [table];
  let cursor = table;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = cursor[parts[i]];
    if (!isTable(next)) return { ok: true, table };
    cursor = next;
    chain.push(cursor);
  }
  const leaf = parts[parts.length - 1];
  if (!Object.hasOwn(cursor, leaf)) return { ok: true, table };
  delete cursor[leaf];
  for (let i = chain.length - 1; i > 0; i--) {
    if (Object.keys(chain[i]).length > 0) break;
    delete chain[i - 1][parts[i - 1]];
  }
  return { ok: true, table };
}

// --- emission ----------------------------------------------------------------

// A value the parser can reproduce EXACTLY, or null. Floats have no branch in
// the parser at all, so they are unrepresentable rather than rounded — and
// neither Number.isInteger nor String() implies decimal digits: 1e21 (which
// parseValue itself produces from a long enough digit run) stringifies to
// "1e+21" and reads back as a STRING, and -0 stringifies to "0" and reads back
// as +0. isSafeNumber is that rule; this branch and the write filter share it
// so the two boundaries cannot disagree.
function emitValue(value) {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    return Number.isInteger(value) && isSafeNumber(value) ? String(value) : null;
  }
  if (typeof value === "string") return isSafeString(value) ? `"${value}"` : null;
  if (Array.isArray(value)) {
    const parts = [];
    for (const element of value) {
      if (typeof element !== "string" || !isSafeString(element) || element.includes(",")) {
        return null;
      }
      parts.push(`"${element}"`);
    }
    return `[${parts.join(", ")}]`;
  }
  return null;
}

// Depth-first over the table, collecting one block per section. Ancestors are
// tracked by identity, so a cycle stops at the repeat instead of recursing.
function collectSections(table, prefix, blocks, ancestors) {
  if (!isTable(table) || ancestors.length >= MAX_DEPTH) return;
  if (ancestors.includes(table)) return;
  const lines = [];
  const children = [];
  for (const key of Object.keys(table).sort()) {
    const value = ownValue(table, key);
    if (isTable(value)) {
      // A child TABLE becomes a section header, which cannot be quoted.
      if (isSafeSectionKey(key)) children.push([key, value]);
      continue;
    }
    if (!isSafeKey(key)) continue;
    const literal = emitValue(value);
    if (literal === null) continue;
    lines.push(`${emitKey(key)} = ${literal}`);
  }
  if (lines.length > 0) blocks.push({ name: prefix, lines });
  for (const [key, value] of children) {
    collectSections(value, prefix ? `${prefix}.${key}` : key, blocks, [...ancestors, table]);
  }
}

// The override table as file text, always led by the generated header. Sections
// and keys sort, so a write that changes nothing produces the same bytes; an
// entry the parser could not reproduce is dropped WHOLE, never half-emitted —
// one bad value must not make the file unreadable.
export function emitLocalToml(table) {
  const blocks = [];
  collectSections(table, "", blocks, []);
  blocks.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  let text = LOCAL_CONFIG_HEADER;
  for (const block of blocks) {
    text += block.name === "" ? "" : `\n[${block.name}]\n`;
    text += `${block.lines.join("\n")}\n`;
  }
  return text;
}

// The `copy as TOML` action: the ONE line this value would occupy, byte for
// byte as emitLocalToml would write it, so what the user pastes into the
// hand-written dotfile is what the panel would have written to the local file —
// including the quoting of a key that is not a bare identifier. The row already
// names the [section] the line belongs under; this is the assignment.
//
// null when the file could not carry the value or the key exactly, which is the
// same all-or-nothing rule as the emitter: no half-line ever leaves this
// module, not even onto a clipboard.
export function tomlLine(path, value) {
  if (typeof path !== "string" || path === "") return null;
  const key = path.split(".").pop();
  if (!isSafeKey(key)) return null;
  const literal = emitValue(value);
  return literal === null ? null : `${emitKey(key)} = ${literal}`;
}

// --- the read-only sections --------------------------------------------------
// Spec §2: the keymap is browsable and searchable but never editable here
// (editing keys stays a TOML act, r3's non-goal), and the command list with
// descriptions is where :describe lives. Both are pure derivations — the
// registry and the keymap table are the inputs — so neither belongs in glue.
//
// Both take their registry as an ARGUMENT with no default: this module has no
// business deciding which registry is the real one, and a mod-extended registry
// has to render through exactly the same code as the shipped one.

function ownDescription(registry, command) {
  const entry = ownValue(registry, command);
  const value = ownValue(entry, "description");
  return typeof value === "string" ? value : "";
}

function ownText(table, key) {
  const value = ownValue(table, key);
  return typeof value === "string" ? value : "";
}

// Code-point order, locale-independent: the same keymap browses in the same
// order on every machine. (Which-key sorts by REMAINING keystrokes because it
// is completing a prefix; this is a reference list, so it reads alphabetically.)
function byCodePoint(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

// {normal: {j: "scroll_down"}, …} -> one row per binding, read-only. A binding
// whose value is not a usable command is dropped individually; an UNKNOWN
// command is kept and flagged `known: false`, because a typo'd binding staying
// visible is the entire point of a keymap browser.
export function buildKeymapRows(keymapTable, registry) {
  if (!isTable(keymapTable)) return [];
  const rows = [];
  for (const mode of Object.keys(keymapTable)) {
    if (UNSAFE_KEYS.has(mode)) continue;
    const table = ownValue(keymapTable, mode);
    if (!isTable(table)) continue;
    for (const sequence of Object.keys(table).sort(byCodePoint)) {
      if (UNSAFE_KEYS.has(sequence)) continue;
      const { command, awaitsArg } = parseBinding(ownValue(table, sequence));
      if (!command) continue;
      const known = isTable(ownValue(registry, command));
      const description = ownDescription(registry, command);
      rows.push({
        key: `keymap.${mode}.${sequence}`,
        section: "keymap",
        mode,
        sequence,
        command,
        awaitsArg,
        description,
        known,
        readOnly: true,
        label: `${mode}  ${sequence}`,
        text: `${sequence} ${command} ${description}`,
      });
    }
  }
  return rows;
}

// The registry -> one row per command, with the sequences that reach it and the
// `bound` flag spec §2 asks for ("showing which commands are unbound"). The
// keymap argument is optional: with none, every command reads unbound, which is
// true of a config with no keymap.
export function buildCommandRows(registry, keymapTable) {
  if (!isTable(registry)) return [];
  const bindings = new Map();
  for (const row of buildKeymapRows(keymapTable, registry)) {
    if (!bindings.has(row.command)) bindings.set(row.command, []);
    bindings.get(row.command).push(Object.freeze({ mode: row.mode, sequence: row.sequence }));
  }
  const rows = [];
  for (const name of Object.keys(registry).sort(byCodePoint)) {
    if (UNSAFE_KEYS.has(name)) continue;
    const entry = ownValue(registry, name);
    if (!isTable(entry)) continue;
    const description = ownText(entry, "description");
    const bound = bindings.get(name) ?? [];
    rows.push({
      key: `command.${name}`,
      section: "commands",
      name,
      command: name,
      description,
      usage: ownText(entry, "usage"),
      risk: ownText(entry, "risk"),
      bindings: Object.freeze(bound),
      bound: bound.length > 0,
      readOnly: true,
      label: name,
      text: `${name} ${description}`,
    });
  }
  return rows;
}

// --- DoH ---------------------------------------------------------------------

// The [privacy] table -> the two prefs it owns. A function of the TOML table
// and nothing else: taking a pref value as a second argument is exactly how
// "one setting, one authority" would be lost. An unknown mode falls back rather
// than throwing, and never resolves to 0 — a typo must not turn DoH off.
export function dohPrefs(privacyTable) {
  const table = isTable(privacyTable) ? privacyTable : {};
  const mode =
    typeof table.doh === "string" && Object.hasOwn(TRR_MODES, table.doh)
      ? TRR_MODES[table.doh]
      : TRR_MODES.fallback;
  const shipped = typeof DEFAULTS?.privacy?.doh_url === "string" ? DEFAULTS.privacy.doh_url : "";
  const url = table.doh_url;
  const uri = validateValue(schemaEntry("privacy.doh_url"), url).ok ? url : shipped;
  return { "network.trr.mode": mode, "network.trr.uri": uri };
}
