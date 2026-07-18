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
  },
  theme: {
    source: "auto", // auto | wal | toml | builtin
    wal_json: "~/.cache/wal/colors.json",
    colors: GRUVBOX, // builtin, default, and example TOML are one source of truth
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

export function parseToml(text) {
  const root = {};
  let section = root;
  for (let line of text.split("\n")) {
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
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    let key = line.slice(0, eq).trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (UNSAFE_KEYS.has(key)) continue;
    section[key] = parseValue(line.slice(eq + 1));
  }
  return root;
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

export const AetherConfig = {
  async load() {
    try {
      const home = Services.dirsvc.get("Home", Ci.nsIFile).path;
      const path = PathUtils.join(home, ".config", "aether", "aether.toml");
      if (!(await IOUtils.exists(path))) return DEFAULTS;
      const text = await IOUtils.readUTF8(path);
      return deepMerge(DEFAULTS, parseToml(text));
    } catch (e) {
      console.error("[aether] could not load config, using defaults:", e);
      return DEFAULTS;
    }
  },
  DEFAULTS,
};
