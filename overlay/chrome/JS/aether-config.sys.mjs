// Aether config loader: reads ~/.config/aether/aether.toml with a deliberately
// small TOML subset parser ([sections], key = string|int|bool|[strings], # comments).
// Falls back to built-in defaults on any failure — a broken dotfile must never
// brick the browser.

const DEFAULTS = {
  options: {
    scroll_step: 120,
    hint_chars: "asdfghjkl",
    statusbar_clock: true,
  },
  keymap: {
    normal: {
      j: "scroll_down",
      k: "scroll_up",
      d: "half_down",
      u: "half_up",
      gg: "top",
      G: "bottom",
      H: "back",
      L: "forward",
      o: "open",
      O: "open_tab",
      t: "tab_new",
      x: "tab_close",
      J: "tab_next",
      K: "tab_prev",
      r: "reload",
      f: "hints",
      i: "insert",
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
        section = section[part] ??= {};
      }
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    let key = line.slice(0, eq).trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
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

function deepMerge(base, extra) {
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
      console.error("[aether] config load failed, using defaults:", e);
      return DEFAULTS;
    }
  },
  DEFAULTS,
};
