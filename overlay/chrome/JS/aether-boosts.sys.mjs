// Aether site boosts (b1) — pure domain matching, registry, zap-selector
// generation, and the CSS sanitizer. No Services, no DOM, no IOUtils: glue in
// aether.uc.js injects paths and file contents. b2 imports sanitizeCss from
// here — one sanitizer, one trust decision.

// Ordered match list for a host: exact normalized host (lowercased, port
// stripped) first, then parent-domain fallback by stripping leading labels
// down to two. No PSL — the naive suffix walk can over-reach on co.uk-class
// domains; documented limitation, fixed by using the exact-host file. IP
// hosts and single-label hosts match exactly, never a suffix. Empty or
// hostile input yields [] rather than a throw.
export function candidateDomains(host) {
  if (typeof host !== "string") return [];
  let h = host.trim().toLowerCase();
  if (!h) return [];
  if (h.startsWith("[")) {
    // bracketed IPv6 (strip any :port after the bracket) — exact only
    const end = h.indexOf("]");
    return end === -1 ? [] : [h.slice(0, end + 1)];
  }
  // bare IPv6 — Gecko's nsIURI.host carries NO brackets ('::1', not '[::1]';
  // brackets appear only on .hostPort). Two or more colons can only be IPv6
  // (host:port has exactly one); canonicalize to the bracketed form so both
  // spellings resolve the same '[<addr>].css' dotfile — exact only.
  if (h.indexOf(":") !== h.lastIndexOf(":")) {
    return /^[0-9a-f:.]+$/.test(h) ? [`[${h}]`] : [];
  }
  const colon = h.indexOf(":");
  if (colon !== -1) h = h.slice(0, colon);
  // anything that could not be a hostname (slashes, spaces, …) matches nothing
  if (!/^[a-z0-9._-]+$/.test(h)) return [];
  const labels = h.split(".");
  if (labels.some(l => !l)) return [];
  // an IPv4 literal is not a domain hierarchy — no octet-suffix candidates
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return [h];
  if (labels.length <= 2) return [h];
  const out = [];
  for (let i = 0; i <= labels.length - 2; i++) out.push(labels.slice(i).join("."));
  return out;
}

// "<domain>.css" — safe by construction: no path separators, no "..", so
// hostile input can never escape the boosts dir.
export function boostFileName(domain) {
  const safe = String(domain ?? "")
    .replace(/[/\\]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${safe}.css`;
}

// In-memory registry over the domains that have boost files. Everything
// starts ENABLED — :boost_off is session-scoped by design, never persisted.
export function createRegistry(domainsWithFiles = []) {
  return { domains: new Set(domainsWithFiles), disabled: new Set() };
}

// The matched, enabled domain for a host (exact beats parent), or null. A
// disabled match resolves to nothing — it does not fall through to a parent.
export function resolveBoost(registry, host) {
  for (const c of candidateDomains(host)) {
    if (registry.domains.has(c)) return registry.disabled.has(c) ? null : c;
  }
  return null;
}

export function setDomainEnabled(registry, domain, on) {
  if (on) registry.disabled.delete(domain);
  else registry.disabled.add(domain);
}

// mtime-cache decision: read on no entry or any mtime change (older too — a
// restored backup is still a different file).
export function needsRead(cacheEntry, mtime) {
  return !cacheEntry || cacheEntry.mtime !== mtime;
}

// CSS.escape equivalent (Node has no CSS global) — CSSOM serialize-identifier.
function cssEscape(value) {
  const s = String(value);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const code = s.charCodeAt(i);
    if (code === 0) {
      out += "�";
    } else if (
      code >= 0x30 && code <= 0x39 &&
      (i === 0 || (i === 1 && s[0] === "-"))
    ) {
      out += `\\${code.toString(16)} `; // leading digit → code point escape
    } else if (i === 0 && ch === "-" && s.length === 1) {
      out += `\\${ch}`;
    } else if (
      code >= 0x80 || ch === "-" || ch === "_" ||
      (code >= 0x30 && code <= 0x39) ||
      (code >= 0x41 && code <= 0x5a) ||
      (code >= 0x61 && code <= 0x7a)
    ) {
      out += ch;
    } else {
      out += `\\${ch}`;
    }
  }
  return out;
}

function safeTag(tag) {
  const t = typeof tag === "string" ? tag.toLowerCase() : "";
  return /^[a-z][a-z0-9-]*$/.test(t) ? t : "*";
}

// Selector from an element descriptor {id, classes, tag, nthChain} preferring
// #id > tag.class-chain > :nth-of-type ancestor path (nthChain runs from the
// outermost ancestor to the element). Identifiers are escaped; an unusable
// piece falls through cleanly — never a throw, never an unescaped selector.
export function zapSelector(descriptor) {
  const d = descriptor ?? {};
  if (typeof d.id === "string" && d.id.length) return `#${cssEscape(d.id)}`;
  const tag = safeTag(d.tag);
  const classes = Array.isArray(d.classes)
    ? d.classes.filter(c => typeof c === "string" && c.length)
    : [];
  if (classes.length) return tag + classes.map(c => `.${cssEscape(c)}`).join("");
  const chain = Array.isArray(d.nthChain) ? d.nthChain : [];
  const parts = chain
    .filter(l => l && typeof l.tag === "string" && l.tag)
    .map(l => {
      const nth = Number.isInteger(l.nth) && l.nth > 0 ? l.nth : 1;
      return `${safeTag(l.tag)}:nth-of-type(${nth})`;
    });
  return parts.length ? parts.join(" > ") : tag;
}

// The rule text appended to the dotfile — a dated comment plus the hide.
// Undo is deleting the line: the file is the interface.
export function zapRule(selector, dateStr) {
  return `/* zapped ${dateStr} */\n${selector} { display: none !important; }\n`;
}

// SECURITY — the b2-shared sanitizer. Boost CSS is user-authored trust class,
// but dotfiles get synced between machines, so every apply strips the known
// CSS fetch vectors:
//   - @import at-rules (whole rule; a missing ';' consumes the invalid block
//     too, matching css-syntax at-rule error recovery — no dangling '{...}')
//   - url(...) except data:
//   - image-set()/-webkit-image-set() with any non-data: source — string
//     sources fetch WITHOUT url() in modern Firefox, and var() inside could
//     smuggle one, so both count as unsafe and drop the whole function
// The CSS tokenizer decodes escapes before it recognizes these tokens
// (css-syntax-3 §4.3), so '\75 rl(' or '@\69mport' would slip past a literal
// match: the checks re-run on the fully escape-decoded text, and when escapes
// were hiding a fetch vector the decoded, stripped form is returned instead.
// This is a lexical sanitizer, not a CSS parser — the guarantee is scoped to
// these known vectors (honesty over overclaiming). Clean CSS — benign escapes
// like zapSelector identifiers included — passes through byte-identical, and
// the function is idempotent.

// One tokenizer-equivalent escape-decode pass (css-syntax-3 §4.3.7):
// \HHHHHH plus optional whitespace -> code point, \<newline> -> string
// continuation (nothing), \X -> X. Every replacement shrinks the string, so
// repeating to a fixpoint always terminates.
const CSS_ESCAPE_RE =
  /\\(?:([0-9a-fA-F]{1,6})(?:\r\n|[ \t\n\r\f])?|(\r\n|[\n\r\f])|([\s\S]))/g;

function decodeCssEscapesOnce(css) {
  return css.replace(CSS_ESCAPE_RE, (_, hex, nl, ch) => {
    if (hex !== undefined) {
      const cp = parseInt(hex, 16);
      return !cp || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)
        ? "�"
        : String.fromCodePoint(cp);
    }
    return nl !== undefined ? "" : ch;
  });
}

// Fixpoint decode — stricter than the tokenizer's single pass ('\5c 75'
// yields a literal backslash the browser would NOT re-decode), which only
// ever errs toward stripping more. Over-strict is the safe direction.
// Exported for b2's acceptance gate: its executable-vector strip must run in
// the same decoded space this sanitizer uses, or escaped spellings
// ('-moz-\62 inding', '\65xpression') slip past a literal match.
export function fullyDecodeCssEscapes(css) {
  for (;;) {
    const next = decodeCssEscapesOnce(css);
    if (next === css) return css;
    css = next;
  }
}

// image-set sources are safe when nothing fetchable remains once the data:
// strings/urls are removed — no url(), no string source, no var() smuggle.
function imageSetSourcesSafe(inner) {
  const rest = inner
    .replace(/url\(\s*(?:"data:[^"]*"|'data:[^']*'|data:[^)'"]*)\s*\)/gi, "")
    .replace(/"data:[^"]*"|'data:[^']*'/gi, "");
  return !/url\(|["']|var\(/i.test(rest);
}

// Drop every image-set()/-webkit-image-set() whose sources aren't all data:.
// Manual balanced-paren scan — a regex cannot track nesting depth, and an
// unterminated function is dropped to end-of-text.
function stripImageSets(css, removed) {
  const re = /(?:-webkit-)?image-set\(/gi;
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < css.length && depth > 0) {
      if (css[i] === "(") depth++;
      else if (css[i] === ")") depth--;
      i++;
    }
    const inner = css.slice(re.lastIndex, depth === 0 ? i - 1 : i);
    out += css.slice(last, m.index);
    if (depth === 0 && imageSetSourcesSafe(inner)) out += css.slice(m.index, i);
    else removed?.push(css.slice(m.index, i).trim());
    last = i;
    re.lastIndex = i;
  }
  return out + css.slice(last);
}

// One pass over literal (already-decoded-or-clean) text: strip every known
// fetch vector. Only ever deletes — never grows the text. The optional
// `removed` array collects each stripped fragment for the reporting form.
function stripFetchable(css, removed) {
  return stripImageSets(
    css.replace(/@import\b[^;{}]*(?:;|\{[^{}]*\})?/gi, m => {
      removed?.push(m.trim());
      return "";
    }),
    removed
  )
    .replace(
      /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]*))\s*\)/gi,
      (match, dq, sq, bare) => {
        const arg = (dq ?? sq ?? bare ?? "").trim();
        if (/^data:/i.test(arg)) return match;
        removed?.push(match.trim());
        return "";
      }
    )
    // an unterminated url( at end of text still tokenizes as a url-token
    .replace(/url\([^)]*$/i, m => {
      removed?.push(m.trim());
      return "";
    });
}

function sanitize(css, removed) {
  const out = stripFetchable(css, removed);
  // Escaped spellings decode before the tokenizer recognizes tokens — re-check
  // the fully decoded text. Clean input (benign escapes included) never
  // reaches the fallback, so it stays byte-identical. (The probe pass never
  // collects — only real strips report.)
  const decoded = fullyDecodeCssEscapes(out);
  if (stripFetchable(decoded) === decoded) return out;
  // Escapes were hiding a fetch vector: sanitize in decoded space to a
  // fixpoint. Both steps only ever shrink the text, so this terminates, and
  // the fixpoint is stable under sanitizeCss — idempotency holds here too.
  let cur = decoded;
  for (;;) {
    const next = fullyDecodeCssEscapes(stripFetchable(cur, removed));
    if (next === cur) return cur;
    cur = next;
  }
}

export function sanitizeCss(css) {
  if (typeof css !== "string") return "";
  return sanitize(css);
}

// b2's reporting form — same sanitizer, same surviving CSS, plus the list of
// stripped fragments so the boost preview can SHOW what the gate removed.
// The plain string-in/string-out contract above stays untouched for b1
// callers; both forms share sanitize(), so they can never disagree.
export function sanitizeCssReport(css) {
  if (typeof css !== "string") return { css: "", removedRules: [] };
  const removedRules = [];
  return { css: sanitize(css, removedRules), removedRules };
}
