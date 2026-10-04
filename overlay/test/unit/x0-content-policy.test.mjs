// Content → chrome trust boundary. Since Firefox 157 the AetherContent actor
// declares safeForUntrustedWebProcess, which means the CHILD is assumed
// attacker-controlled: a compromised content process (with Fission, possibly
// just a cross-site ad iframe) can send any message from any frame. The child's
// own frame checks are courtesy; this policy, applied in the PARENT to facts
// the parent computes itself, is the gate. Found by a security review of the
// 157 fix (2026-10-04): every provenance check had lived in the child.
//
//   acceptContentMessage(name, frame) -> boolean
//     frame = { isTop, sameOriginWithTop } — parent-side facts, strict booleans
//   MESSAGE_ORIGINS — the per-message rule, frozen

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  acceptContentMessage,
  MESSAGE_ORIGINS,
} from "../../chrome/JS/aether-content-policy.sys.mjs";

const TOP = { isTop: true, sameOriginWithTop: true };
const SAME_ORIGIN_SUB = { isTop: false, sameOriginWithTop: true };
const CROSS_ORIGIN_SUB = { isTop: false, sameOriginWithTop: false };

const TOP_ONLY = ["Aether:BoostReady", "Aether:HintsDone", "Aether:BoostSampleDone", "Aether:ScrollSample"];

test("policy: every message the parent handles has a rule, and nothing else does", () => {
  assert.deepEqual(Object.keys(MESSAGE_ORIGINS).sort(), [...TOP_ONLY, "Aether:Focus"].sort());
  assert.ok(Object.isFrozen(MESSAGE_ORIGINS));
});

test("policy: top-only messages are accepted from the top frame", () => {
  for (const name of TOP_ONLY) assert.equal(acceptContentMessage(name, TOP), true, name);
});

test("policy: top-only messages are refused from ANY subframe — a zap write cannot come from an iframe", () => {
  for (const name of TOP_ONLY) {
    assert.equal(acceptContentMessage(name, SAME_ORIGIN_SUB), false, `${name} same-origin sub`);
    assert.equal(acceptContentMessage(name, CROSS_ORIGIN_SUB), false, `${name} cross-origin sub`);
  }
});

test("policy: Focus is accepted from the top and same-origin subframes, never cross-origin ones", () => {
  assert.equal(acceptContentMessage("Aether:Focus", TOP), true);
  assert.equal(acceptContentMessage("Aether:Focus", SAME_ORIGIN_SUB), true, "editors in same-origin iframes");
  assert.equal(acceptContentMessage("Aether:Focus", CROSS_ORIGIN_SUB), false);
});

test("policy: unknown and hostile names are refused", () => {
  for (const name of ["Aether:Nope", "", "__proto__", "constructor", "toString", "hasOwnProperty", undefined, null, 42]) {
    assert.equal(acceptContentMessage(name, TOP), false, String(name));
  }
});

test("policy: frame facts must be strict booleans — truthy junk is not trust", () => {
  for (const frame of [undefined, null, {}, { isTop: "true" }, { isTop: 1 }, { isTop: [true] }]) {
    assert.equal(acceptContentMessage("Aether:HintsDone", frame), false, JSON.stringify(frame));
  }
  assert.equal(acceptContentMessage("Aether:Focus", { isTop: false, sameOriginWithTop: "yes" }), false);
});
