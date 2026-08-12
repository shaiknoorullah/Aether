// b1 — Palette + strings surface: the four boost commands and the b1 copy
// (SDD RED). Spec: overlay/specs/b1-site-boosts-deterministic.md §2, §3,
// §4 tests 17–18. Additive next to the f-series palette tests — earlier
// files stay untouched.
//
// Contract pinned here:
//   REGISTRY gains 'zap', 'boost_on', 'boost_off', 'boost_edit' — all
//   zero-arg, completable.
//   aether-strings.sys.mjs gains (inside the f6 lexicon sweep by
//   construction — every function echoes its argument so f6's export-wide
//   echo check holds mechanically):
//     zappedMessage(selector) -> "zapped: <selector>"     (transient)
//     boostOnMessage(domain)  -> "boost on: <domain>"     (transient)
//     boostOffMessage(domain) -> "boost off: <domain>"    (transient)
//     noBoostMessage(host)    -> "no boost for: <host>"   (neutral)

import { test } from "node:test";
import assert from "node:assert/strict";

import { REGISTRY, parse, complete } from "../../chrome/JS/aether-palette.sys.mjs";

// The f6 lexicon, re-asserted locally for the new exports (the sweep in
// f6-strings.test.mjs covers them mechanically once they exist).
const BANNED = /fail|streak|wasted|behind|should have|procrastinat/i;

async function stringsModule() {
  return import("../../chrome/JS/aether-strings.sys.mjs");
}

// 17. registry membership, zero-arg parse, completion -------------------------

test("palette: 'zap', 'boost_on', 'boost_off', 'boost_edit' are registry commands", () => {
  for (const name of ["zap", "boost_on", "boost_off", "boost_edit"]) {
    assert.ok(name in REGISTRY, `registry must contain '${name}'`);
  }
});

test("palette: each boost command parses with no args", () => {
  for (const name of ["zap", "boost_on", "boost_off", "boost_edit"]) {
    const r = parse(name);
    assert.equal(r.name, name, `'${name}' is runnable bare`);
    assert.deepEqual(r.args, [], `'${name}' takes no args`);
  }
});

// b2 note: ':boost' joined the registry (spec b2 §4 test 14), so the
// exactness assertion moved to b2-palette.test.mjs ("exactly four, sorted").
// The b1 guarantee kept here: the three b1 commands stay completable.
test("palette: complete('boost') still finds the three b1 boost commands", () => {
  const got = complete("boost", REGISTRY);
  for (const name of ["boost_edit", "boost_off", "boost_on"]) {
    assert.ok(got.includes(name), `complete('boost') must keep '${name}'`);
  }
});

test("palette: complete('zap') finds zap", () => {
  assert.ok(complete("zap", REGISTRY).includes("zap"));
});

// 18. the b1 copy — factual echoes, lexicon-clean -----------------------------

test("strings: zappedMessage is the factual 'zapped: <selector>' echo", async () => {
  const mod = await stringsModule();
  assert.equal(typeof mod.zappedMessage, "function");
  const msg = mod.zappedMessage("#promo");
  assert.equal(msg, "zapped: #promo");
  assert.ok(!BANNED.test(msg), `banned stem in zap copy: ${JSON.stringify(msg)}`);
});

test("strings: boost toggle messages name the domain, factually", async () => {
  const mod = await stringsModule();
  assert.equal(typeof mod.boostOnMessage, "function");
  assert.equal(typeof mod.boostOffMessage, "function");
  assert.equal(mod.boostOnMessage("example.com"), "boost on: example.com");
  assert.equal(mod.boostOffMessage("example.com"), "boost off: example.com");
});

test("strings: no-boost copy is neutral — names the host, no blame, no alarm", async () => {
  const mod = await stringsModule();
  assert.equal(typeof mod.noBoostMessage, "function");
  const msg = mod.noBoostMessage("example.org");
  assert.equal(msg, "no boost for: example.org");
  assert.ok(!msg.includes("!"), "informational, not an alarm");
  assert.ok(!BANNED.test(msg), `banned stem in no-boost copy: ${JSON.stringify(msg)}`);
});

test("strings: every b1 export is non-empty and echoes its argument", async () => {
  const mod = await stringsModule();
  const arg = "deep work on the spec";
  for (const name of ["zappedMessage", "boostOnMessage", "boostOffMessage", "noBoostMessage"]) {
    const fn = mod[name];
    assert.equal(typeof fn, "function", `'${name}' must be exported`);
    const rendered = fn(arg);
    assert.equal(typeof rendered, "string");
    assert.ok(rendered.length > 0, `'${name}' must not be empty copy`);
    assert.ok(rendered.includes(arg), `'${name}' echoes its argument`);
    assert.ok(!BANNED.test(rendered), `'${name}' carries a banned stem: ${JSON.stringify(rendered)}`);
  }
});
