// Aether config loader: reads ~/.config/aether/aether.toml with a deliberately
// small TOML subset parser ([sections], key = string|int|bool|[strings], # comments).
// Falls back to built-in defaults on any failure — a broken dotfile must never
// brick the browser.

import { GRUVBOX } from "./aether-theme.sys.mjs";

const DEFAULTS = {
  options: {
    scroll_step: 120,
    hint_chars: "asdfghjkl",
    statusbar_clock: true,
    pending_timeout_ms: 800,
    palette_max_items: 8,
    config_watch: true, // r1: saving the config file is the reload; false = :config_reload only
    which_key_ms: 400, // r3: pause before the binding panel appears; 0 = instant, -1 = never
  },
  statusbar: {
    widgets: ["mode", "workspace", "focus", "url", "msg", "ai", "clock", "date"],
  },
  ai: {
    enabled: false, // the kill switch — OFF until the user enables it
    base_url: "http://127.0.0.1:11434/v1", // OpenAI-compatible gateway; loopback hosts only
    model: "llama3.2", // sent verbatim as the request "model"
  },
  focus: {
    quiet_notifications: true, // suppress web notifications during a session; restored on end
  },
  graveyard: {
    cap: 500, // ring size; oldest entries fall off past this
  },
  workspaces: {
    default: "main", // the workspace a fresh profile starts in (containerId 0)
    resurrect: true, // b3: off = never capture, never restore; existing records are left alone
  },
  boosts: {
    enabled: true, // master switch: off = no reads, no applies, :zap unavailable
    dir: "~/.config/aether/boosts", // <domain>.css dotfiles
  },
  theme: {
    source: "auto", // auto | wal | toml | builtin
    wal_json: "~/.cache/wal/colors.json",
    colors: GRUVBOX, // builtin, default, and example TOML are one source of truth
  },
  // r2: the second var layer. These are LITERALLY the values userChrome.css
  // hardcodes today (radius 2px at :116/:223, statusbar gap 1em and padding
  // "0 8px", palette row padding "2px 8px", 1px borders, 12px monospace), so an
  // empty [style] renders pixel-identical to v1.1.0. No floats anywhere — the
  // parser has no float branch and a bare 0.96 would become the string "0.96".
  style: {
    radius: "2px",
    gap: "1em",
    pad_y: "0",
    pad_x: "8px",
    row_pad_y: "2px",
    row_pad_x: "8px",
    border: "1px",
    panel_width: "38rem",
    panel_height: "60vh",
    opacity: 100, // integer percent
    blur: "0",
    font: "monospace",
    font_size: "12px",
    motion_ms: 120,
    motion_ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    motion: true, // master switch; false = 0ms everywhere
  },
  panels: {
    scope: "workspace", // workspace | all — default tab-panel scope (r4)
  },
  privacy: {
    doh: "fallback", // off | fallback | strict → network.trr.mode 0/2/3 (r5)
    doh_url: "https://dns.quad9.net/dns-query",
  },
  keymap: {
    normal: {
      a: "ai",
      j: "scroll_down",
      k: "scroll_up",
      d: "half_down",
      u: "half_up",
      gg: "top",
      gw: "ws_next",
      G: "bottom",
      H: "back",
      L: "forward",
      o: "open",
      O: "open_tab",
      t: "tab_new",
      x: "tab_close",
      J: "tab_next",
      K: "tab_prev",
      T: "tabs_toggle",
      r: "reload",
      f: "hints",
      i: "insert",
      ":": "palette",
      "?": "which_key",
    },
    reserved: {
      "C-w": "tab_close",
      "C-t": "tab_new",
      "C-n": "tab_new",
      "C-Tab": "tab_next",
    },
  },
};

function parseValue(raw) {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  if (v.startsWith("[") && v.endsWith("]")) {
    return v
      .slice(1, -1)
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(parseValue);
  }
  return v;
}

// The dotfile is user-trusted, but it can be synced from elsewhere; never let a
// section or key graft onto Object.prototype (prototype pollution).
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

// The metadata parseToml reports alongside the parsed sections. They are
// NON-ENUMERABLE own properties of the returned table, which is the whole
// trick: `{ok, sections, errorLine}` destructures and r1 can refuse a
// half-written file, while every shipped caller — deepMerge(DEFAULTS, parsed),
// every sync guard's deepEqual against DEFAULTS, JSON.stringify — sees exactly
// the table it saw in v1.1.0. A dotfile that owns one of these names keeps it
// (the section wins and the parse degrades to the forgiving behaviour) rather
// than losing data to a squatter.
const RESULT_KEYS = ["ok", "sections", "errorLine"];

function withParseResult(root, errorLine) {
  const meta = { ok: errorLine === null, sections: root, errorLine };
  for (const key of RESULT_KEYS) {
    if (Object.hasOwn(root, key)) continue;
    Object.defineProperty(root, key, {
      value: meta[key],
      enumerable: false,
      writable: false,
      configurable: true,
    });
  }
  return root;
}

// parseToml(text) -> the parsed table, plus non-enumerable {ok, sections,
// errorLine}. `ok` is false — with `errorLine` naming the FIRST offending
// 1-based line — as soon as a line is neither blank, a comment, a [section],
// nor `key = value`. Parsing still runs to the end (the table stays
// byte-compatible with what the forgiving parser produced); rejecting is the
// loader's job, so nothing half-applies.
export function parseToml(text) {
  const root = {};
  let section = root;
  let errorLine = null;
  const lines = String(text ?? "").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    let line = lines[i];
    // strip comments outside strings (good enough for our subset)
    const hash = line.indexOf("#");
    if (hash !== -1 && !isInsideString(line, hash)) line = line.slice(0, hash);
    line = line.trim();
    if (!line) continue;
    const sect = line.match(/^\[([^\]]+)\]$/);
    if (sect) {
      section = root;
      for (const part of sect[1].split(".").map(s => s.trim())) {
        if (UNSAFE_KEYS.has(part)) { section = Object.create(null); break; }
        if (!Object.hasOwn(section, part) || typeof section[part] !== "object") {
          section[part] = {};
        }
        section = section[part];
      }
      continue;
    }
    // Anything that is not `key = value` is a broken line — including an
    // unterminated [section, a bare word, and both halves of a mid-write cut
    // (`hint_ch` and `hint_chars = `).
    const eq = line.indexOf("=");
    if (eq === -1) {
      errorLine ??= lineNumber;
      continue;
    }
    let key = line.slice(0, eq).trim();
    const raw = line.slice(eq + 1).trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (!key || !raw) {
      errorLine ??= lineNumber;
      continue;
    }
    if (UNSAFE_KEYS.has(key)) continue;
    section[key] = parseValue(raw);
  }
  return withParseResult(root, errorLine);
}

function isInsideString(line, idx) {
  let inString = false;
  for (let i = 0; i < idx; i++) {
    if (line[i] === '"') inString = !inString;
  }
  return inString;
}

export function deepMerge(base, extra) {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    out[k] =
      v && typeof v === "object" && !Array.isArray(v) && typeof base[k] === "object"
        ? deepMerge(base[k], v)
        : v;
  }
  return out;
}

// Config layers, lowest precedence first. The hand-written dotfile is never
// written by Aether; aether.local.toml is the panel-owned override file (r5)
// and is simply absent until something writes it.
const SOURCE_FILES = ["aether.toml", "aether.local.toml"];

// The last config load() resolved. A rejected parse resolves to THIS object,
// identity-unchanged — a mid-write file must never revert a live keymap to
// DEFAULTS by way of deepMerge.
let lastConfig = null;

function withSources(config, sources) {
  Object.defineProperty(config, "sources", {
    value: sources,
    enumerable: false, // config objects get diffed (r1); metadata is not config
    writable: false,
    configurable: true,
  });
  return config;
}

export const AetherConfig = {
  // load() -> the merged config object, carrying a non-enumerable `sources`:
  //   [{path, exists, ok, errorLine, table}] in precedence order — what the
  //   watcher stats (r1) and what provenance is computed from (r5).
  // Any source that fails to parse rejects the WHOLE load: the previous config
  // is returned unchanged (DEFAULTS on a first load), never a partial merge.
  async load() {
    const sources = [];
    try {
      const home = Services.dirsvc.get("Home", Ci.nsIFile).path;
      for (const name of SOURCE_FILES) {
        const path = PathUtils.join(home, ".config", "aether", name);
        const source = { path, exists: false, ok: true, errorLine: null, table: null };
        sources.push(source);
        if (!(await IOUtils.exists(path))) continue;
        source.exists = true;
        // The parse result IS the table; `sections`/`errorLine` are read
        // defensively because a dotfile is allowed to own those names.
        const parsed = parseToml(await IOUtils.readUTF8(path));
        source.ok = parsed.ok !== false;
        source.errorLine = typeof parsed.errorLine === "number" ? parsed.errorLine : null;
        if (source.ok) source.table = parsed;
      }
      if (sources.some(s => !s.ok)) {
        // All-or-nothing: keep what is live, and let the caller name the line.
        return lastConfig ?? withSources({ ...DEFAULTS }, sources);
      }
      let merged = DEFAULTS;
      for (const source of sources) {
        if (source.table) merged = deepMerge(merged, source.table);
      }
      if (merged === DEFAULTS) merged = { ...DEFAULTS };
      lastConfig = withSources(merged, sources);
      return lastConfig;
    } catch (e) {
      console.error("[aether] could not load config, using the live one:", e);
      return lastConfig ?? withSources({ ...DEFAULTS }, sources);
    }
  },
  // The config load() resolved last, or null before the first load.
  get current() {
    return lastConfig;
  },
  SOURCE_FILES,
  DEFAULTS,
};
