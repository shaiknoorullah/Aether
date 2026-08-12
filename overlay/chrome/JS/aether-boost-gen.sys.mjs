// Aether AI boost generation (b2) — pure skeleton serialization, prompt
// building, reply extraction, and the acceptance gate. No Services, no DOM,
// no fetch, no IOUtils: glue in aether.uc.js owns the sample round-trip, the
// f7 stream, and the b1 file append. One sanitizer — the gate runs b1's
// sanitizeCssReport and only adds the CSS-execution vectors on top.

import { sanitizeCssReport } from "./aether-boosts.sys.mjs";

// Top-by-count cap on serialized selectors — enough structure for a reskin,
// small enough that the prompt stays bounded.
const SELECTOR_CAP = 40;

// Hard size cap on accepted CSS — a constant, deliberately not config.
const CSS_BYTE_CAP = 32 * 1024;

function str(v) {
  return typeof v === "string" ? v : "";
}

// The whitelist, enforced by construction: fields are copied BY NAME off the
// sample objects — tag/id/classes, the four computed props, histogram
// color/count — so smuggled extras (textContent, href, title, value,
// arbitrary keys) can never reach the output. Belt and suspenders with the
// content child, which only collects these fields in the first place.
function whitelistSelector(e) {
  if (!e || typeof e !== "object") return null;
  return {
    tag: str(e.tag),
    id: str(e.id),
    classes: Array.isArray(e.classes) ? e.classes.filter(c => typeof c === "string" && c) : [],
    count: Number.isFinite(e.count) ? e.count : 0,
    color: str(e.color),
    background: str(e.background),
    fontFamily: str(e.fontFamily),
    fontSize: str(e.fontSize),
  };
}

function selectorText(e) {
  let s = e.tag || "*";
  if (e.id) s += `#${e.id}`;
  for (const c of e.classes) s += `.${c}`;
  return s;
}

// Structural sample → deterministic skeleton string. At most SELECTOR_CAP
// selectors survive, top by element count. Empty/hostile input yields a
// valid (headers-only) skeleton, never a throw.
export function serializeSkeleton(sample) {
  const s = sample && typeof sample === "object" ? sample : {};
  const rows = (Array.isArray(s.selectors) ? s.selectors : [])
    .map(whitelistSelector)
    .filter(Boolean)
    .sort((a, b) => b.count - a.count)
    .slice(0, SELECTOR_CAP);
  const hist = (Array.isArray(s.histogram) ? s.histogram : [])
    .map(h => (h && typeof h === "object"
      ? { color: str(h.color), count: Number.isFinite(h.count) ? h.count : 0 }
      : null))
    .filter(h => h && h.color);
  const lines = ["selectors (top by element count):"];
  for (const e of rows) {
    lines.push(
      `${selectorText(e)}  x${e.count}  ` +
        `color: ${e.color}; background: ${e.background}; ` +
        `font-family: ${e.fontFamily}; font-size: ${e.fontSize}`
    );
  }
  lines.push("", "page color histogram:");
  for (const h of hist) lines.push(`${h.color}  x${h.count}`);
  return lines.join("\n");
}

// Skeleton + the active --aether-* palette → the model prompt. Page-derived
// content is the skeleton only (selector parts and computed CSS values); the
// output rules are stated to the model here and ENFORCED by the gate below.
export function buildBoostPrompt(skeleton, palette) {
  const pal = palette && typeof palette === "object" ? palette : {};
  const paletteLines = Object.entries(pal)
    .filter(([, v]) => typeof v === "string" && v)
    .map(([k, v]) => `  --aether-${k}: ${v};`);
  return [
    "Reskin this web page to match my color palette. Work from the",
    "structural skeleton below — selectors and their computed styles.",
    "",
    "my palette (use these color values):",
    ...paletteLines,
    "",
    "page skeleton:",
    skeleton,
    "",
    "output rules:",
    "- reply with exactly one fenced code block containing only CSS",
    "- no @import rules",
    "- no url() values except url(data:...)",
    "- no JavaScript, no HTML, no prose inside the block — CSS only",
    "- prefer !important so the reskin wins over the page's own styles",
  ].join("\n");
}

// The single fenced code block of a reply (```css and bare ``` fences both
// accepted), or null: zero fences, two or more blocks, unfenced text, an
// unterminated fence, and non-string input all reject — never a guess,
// never concatenation, never first-wins, never a throw.
export function extractCss(replyText) {
  if (typeof replyText !== "string") return null;
  const blocks = [];
  let open = null;
  for (const line of replyText.split("\n")) {
    if (line.trim().startsWith("```")) {
      if (open === null) {
        open = [];
      } else {
        blocks.push(open.join("\n"));
        open = null;
      }
    } else if (open !== null) {
      open.push(line);
    }
  }
  if (open !== null) return null; // unterminated fence — not a block
  return blocks.length === 1 ? blocks[0] : null;
}

// b2's extra vectors on top of b1's fetch stripping: CSS that EXECUTES.
// expression(...) values and -moz-binding declarations (XBL runs code — a
// data: url is no excuse) drop as whole declarations, each reported.
function stripExecutable(css, removed) {
  return css
    .replace(/[-a-zA-Z]+\s*:[^;{}]*expression\s*\([^;{}]*;?/gi, m => {
      removed.push(m.trim().replace(/;$/, ""));
      return "";
    })
    .replace(/-moz-binding\s*:[^;{}]*;?/gi, m => {
      removed.push(m.trim().replace(/;$/, ""));
      return "";
    });
}

// The acceptance gate: what Accept is allowed to write. Runs the b1-shared
// sanitizer (reporting form) plus stripExecutable to a fixpoint, so the
// surviving CSS is stable under sanitizeCss — one trust path, verified.
// Oversize input (> CSS_BYTE_CAP) rejects whole; truncated CSS would be a
// silent lie. Clean CSS passes byte-identical with nothing reported.
export function acceptanceGate(rawCss) {
  if (typeof rawCss !== "string") {
    return { ok: false, css: null, removedRules: [], reason: "not css text" };
  }
  const bytes = new TextEncoder().encode(rawCss).length;
  if (bytes > CSS_BYTE_CAP) {
    return {
      ok: false,
      css: null,
      removedRules: [],
      reason: `css is ${bytes} bytes — over the ${CSS_BYTE_CAP / 1024} KiB cap, rejected whole`,
    };
  }
  const removedRules = [];
  let css = rawCss;
  for (;;) {
    const report = sanitizeCssReport(css);
    removedRules.push(...report.removedRules);
    const next = stripExecutable(report.css, removedRules);
    if (next === css) break;
    css = next;
  }
  return { ok: true, css, removedRules };
}

// The dated comment block header appended above accepted CSS. Two accepts
// are two independent dated blocks — append semantics, never merged; undo is
// deleting the block in vim (the file is the interface, b1 rule).
export function generatedHeader(domain, dateStr) {
  return `/* boost generated ${dateStr} for ${domain} — review in vim, delete freely */`;
}
