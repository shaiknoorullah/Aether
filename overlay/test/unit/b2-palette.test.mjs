// b2 — Palette + strings surface: the :boost command and the b2 copy (SDD
// RED). Spec: overlay/specs/b2-ai-css-boosts.md §2, §3, §4 tests 14–15.
// Additive next to the b1/f-series palette tests — earlier files stay
// untouched except b1's "exactly three" completion assertion, which this
// feature intentionally supersedes (spec §4 test 14): exactness lives here
// now, as "exactly four".
//
// Contract pinned here:
//   REGISTRY gains 'boost' — zero-arg, completable.
//   aether-strings.sys.mjs gains (inside the f6 lexicon sweep by
//   construction):
//     boostPreviewHeader(domain)  -> "boost preview — <domain>"   (panel header)
//     boostWrittenMessage(domain) -> "boost written: <domain>"    (transient)
//     BOOST_DISMISSED_MESSAGE     -> "boost dismissed"            (neutral —
//                                     a normal outcome, not a failure state)
//     strippedRuleLine(rule)      -> "stripped: <rule>"           (strip summary)
//     NOTHING_STRIPPED_MESSAGE    -> "nothing stripped"           (strip summary)
//     noBoostHereMessage(scheme)  -> "no boost here: <scheme> pages"
//     BOOSTS_OFF_MESSAGE          -> names the [boosts] enabled path back on
//                                     (calm, informational — like f7's
//                                     AI_OFF_PANEL_MESSAGE names :ai_on)

import { test } from "node:test";
import assert from "node:assert/strict";

import { REGISTRY, parse, complete } from "../../chrome/JS/aether-palette.sys.mjs";

// The f6 lexicon, re-asserted locally for the new exports (the sweep in
// f6-strings.test.mjs covers them mechanically once they exist).
const BANNED = /fail|streak|wasted|behind|should have|procrastinat/i;

async function stringsModule() {
  return import("../../chrome/JS/aether-strings.sys.mjs");
}

// 14. registry membership, zero-arg parse, completion -------------------------

test("palette: 'boost' is a registry command", () => {
  assert.ok("boost" in REGISTRY, "registry must contain 'boost'");
});

test("palette: 'boost' parses with no args", () => {
  const r = parse("boost");
  assert.equal(r.name, "boost", "'boost' is runnable bare");
  assert.deepEqual(r.args, [], "'boost' takes no args");
});

test("palette: complete('boost') → exactly the four boost commands, sorted", () => {
  // b1's "exactly three" updates here, intentionally (spec b2 §4 test 14).
  assert.deepEqual(complete("boost", REGISTRY), [
    "boost",
    "boost_edit",
    "boost_off",
    "boost_on",
  ]);
});

// 15. the b2 copy — factual, calm, lexicon-clean ------------------------------

test("strings: boostPreviewHeader is the distinct 'boost preview — <domain>' header", async () => {
  const mod = await stringsModule();
  assert.equal(typeof mod.boostPreviewHeader, "function");
  const msg = mod.boostPreviewHeader("example.com");
  assert.equal(msg, "boost preview — example.com");
  assert.ok(!BANNED.test(msg), `banned stem in preview header: ${JSON.stringify(msg)}`);
});

test("strings: boostWrittenMessage names the domain, factually", async () => {
  const mod = await stringsModule();
  assert.equal(typeof mod.boostWrittenMessage, "function");
  const msg = mod.boostWrittenMessage("example.com");
  assert.equal(msg, "boost written: example.com");
  assert.ok(!BANNED.test(msg), `banned stem in written copy: ${JSON.stringify(msg)}`);
});

test("strings: dismissal copy is neutral — a normal outcome, not a failure state", async () => {
  const mod = await stringsModule();
  const msg = mod.BOOST_DISMISSED_MESSAGE;
  assert.equal(msg, "boost dismissed");
  assert.ok(!msg.includes("!"), "informational, not an alarm");
  assert.ok(!BANNED.test(msg), `banned stem in dismissal copy: ${JSON.stringify(msg)}`);
  assert.ok(
    !/error|wrong|lost|discard/i.test(msg),
    `dismissing is a normal outcome — no failure framing: ${JSON.stringify(msg)}`,
  );
});

test("strings: the strip summary names each removed rule and has a calm empty state", async () => {
  const mod = await stringsModule();
  assert.equal(typeof mod.strippedRuleLine, "function");
  const rule = '@import url("https://evil.example/steal.css");';
  assert.equal(mod.strippedRuleLine(rule), `stripped: ${rule}`);
  assert.equal(mod.NOTHING_STRIPPED_MESSAGE, "nothing stripped");
  assert.ok(!BANNED.test(mod.NOTHING_STRIPPED_MESSAGE));
});

test("strings: no-boost-here copy names the scheme, no blame, no alarm", async () => {
  const mod = await stringsModule();
  assert.equal(typeof mod.noBoostHereMessage, "function");
  const msg = mod.noBoostHereMessage("about");
  assert.equal(msg, "no boost here: about pages");
  assert.ok(!msg.includes("!"), "informational, not an alarm");
  assert.ok(!BANNED.test(msg), `banned stem in no-boost-here copy: ${JSON.stringify(msg)}`);
});

test("strings: the boosts-off copy names the way back on (the [boosts] enabled path)", async () => {
  const mod = await stringsModule();
  const msg = mod.BOOSTS_OFF_MESSAGE;
  assert.equal(typeof msg, "string");
  assert.ok(msg.length > 0, "the off-state has copy");
  assert.ok(/boosts/i.test(msg), "the copy says what is off");
  assert.ok(/enabled/.test(msg), "an off-state description names its enable path");
  assert.ok(!msg.includes("!"), "calm, informational — no alarm");
  assert.ok(!BANNED.test(msg), `banned stem in boosts-off copy: ${JSON.stringify(msg)}`);
});

test("strings: every b2 function export is non-empty and echoes its argument", async () => {
  const mod = await stringsModule();
  const arg = "deep work on the spec";
  for (const name of [
    "boostPreviewHeader",
    "boostWrittenMessage",
    "strippedRuleLine",
    "noBoostHereMessage",
  ]) {
    const fn = mod[name];
    assert.equal(typeof fn, "function", `'${name}' must be exported`);
    const rendered = fn(arg);
    assert.equal(typeof rendered, "string");
    assert.ok(rendered.length > 0, `'${name}' must not be empty copy`);
    assert.ok(rendered.includes(arg), `'${name}' echoes its argument`);
    assert.ok(!BANNED.test(rendered), `'${name}' carries a banned stem: ${JSON.stringify(rendered)}`);
  }
  for (const name of ["BOOST_DISMISSED_MESSAGE", "NOTHING_STRIPPED_MESSAGE", "BOOSTS_OFF_MESSAGE"]) {
    const value = mod[name];
    assert.equal(typeof value, "string", `'${name}' must be exported`);
    assert.ok(value.length > 0, `'${name}' must not be empty copy`);
    assert.ok(!BANNED.test(value), `'${name}' carries a banned stem: ${JSON.stringify(value)}`);
  }
});
