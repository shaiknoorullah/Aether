// f7 — AI state surface: the hard kill switch + the in-memory conversation
// (SDD RED). Spec: overlay/specs/f7-local-ai-sidebar.md §2 "Kill switch", §3,
// §4 tests 11–16. Written before the implementation; the module follows these.
//
// Contract pinned here for overlay/chrome/JS/aether-ai-state.sys.mjs (pure —
// no Services/prefs/DOM; the persisted pref value arrives as a parameter):
//   resolveEnabled(configAi, persistedPref) -> boolean. Resolution order:
//     persisted user toggle (true/false; undefined = no pref) wins over TOML
//     [ai] enabled, which wins over the builtin false. Default is OFF.
//   setEnabled(state, want) -> {enabled: want, persist: want, abortInFlight}.
//     persist is the value glue writes to the aether.ai.enabled pref;
//     abortInFlight is true ONLY on the on→off flip (the hard-switch
//     contract: :ai_off aborts any in-flight request).
//   assertOn(state) -> throws when the switch is off (there is no code path
//     from prompt to socket while off); returns normally when on.
//   Conversation (one in-memory thread; each mutator returns the updated
//     conversation, so `conv = addUser(conv, ...)` always works):
//     newConversation(), addUser(conv, text), beginAssistant(conv),
//     addDelta(conv, text), finishAssistant(conv),
//     messagesFor(conv) -> [{role, content}] history for the next request.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveEnabled,
  setEnabled,
  assertOn,
  newConversation,
  addUser,
  beginAssistant,
  addDelta,
  finishAssistant,
  messagesFor,
} from "../../chrome/JS/aether-ai-state.sys.mjs";
import { AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

// 11. default OFF -------------------------------------------------------------

test("state: no pref + builtin defaults → disabled, and assertOn throws", () => {
  const enabled = resolveEnabled(AetherConfig.DEFAULTS.ai, undefined);
  assert.equal(enabled, false, "the kill switch defaults OFF until the user enables it");
  assert.throws(() => assertOn({ enabled }), "off means the network path throws");
  assert.throws(() => assertOn({}), "an absent enabled flag can only ever mean off");
});

// 12. resolution order: pref > TOML > builtin false ---------------------------

test("state: persisted pref beats TOML, TOML beats builtin, nothing → false", () => {
  const tomlOn = { enabled: true, base_url: "http://127.0.0.1:11434/v1", model: "llama3.2" };
  const tomlOff = { enabled: false, base_url: "http://127.0.0.1:11434/v1", model: "llama3.2" };

  assert.equal(resolveEnabled(tomlOff, true), true, "pref true beats TOML false");
  assert.equal(resolveEnabled(tomlOn, false), false, "pref false beats TOML true");
  assert.equal(resolveEnabled(tomlOn, undefined), true, "no pref → the TOML value");
  assert.equal(resolveEnabled(tomlOff, undefined), false, "no pref → the TOML value");
  assert.equal(resolveEnabled(undefined, undefined), false, "nothing at all → builtin false");
  assert.equal(resolveEnabled({}, undefined), false, "[ai] without enabled → builtin false");
});

// 13. setEnabled: persist value + the hard-switch abort contract --------------

test("state: setEnabled returns the persist value; on→off aborts in-flight, off→on does not", () => {
  const on = setEnabled({ enabled: false }, true);
  assert.equal(on.enabled, true);
  assert.equal(on.persist, true, "glue writes true to aether.ai.enabled");
  assert.ok(!on.abortInFlight, "turning ON never aborts anything");

  const off = setEnabled({ enabled: true }, false);
  assert.equal(off.enabled, false);
  assert.equal(off.persist, false, "glue writes false to aether.ai.enabled");
  assert.equal(off.abortInFlight, true, ":ai_off is hard — any in-flight request is aborted");
});

// 14. assertOn, verified both ways --------------------------------------------

test("state: assertOn passes when enabled and throws when not — state is the only gate", () => {
  assert.doesNotThrow(() => assertOn({ enabled: true }));
  assert.throws(() => assertOn({ enabled: false }));
});

// 15. conversation accumulates into alternating history -----------------------

test("state: user turn + streamed assistant deltas → messagesFor carries the full conversation", () => {
  let conv = newConversation();
  conv = addUser(conv, "first question");
  conv = beginAssistant(conv);
  conv = addDelta(conv, "first ");
  conv = addDelta(conv, "answer");
  conv = finishAssistant(conv);
  conv = addUser(conv, "second question");

  assert.deepEqual(
    messagesFor(conv),
    [
      { role: "user", content: "first question" },
      { role: "assistant", content: "first answer" },
      { role: "user", content: "second question" },
    ],
    "deltas accumulate into ONE assistant message; the next request carries everything",
  );
});

// 16. an unfinished (streaming/aborted) assistant turn never corrupts history --

test("state: messagesFor mid-stream still yields well-formed messages", () => {
  let conv = newConversation();
  conv = addUser(conv, "the question");
  conv = beginAssistant(conv);
  conv = addDelta(conv, "partial ans"); // stream drops / :ai_off aborts here

  let msgs;
  assert.doesNotThrow(() => {
    msgs = messagesFor(conv);
  });
  assert.ok(Array.isArray(msgs), "always an array");
  assert.ok(msgs.length >= 1, "the user turn is never lost");
  assert.deepEqual(msgs[0], { role: "user", content: "the question" });
  for (const m of msgs) {
    assert.ok(
      m.role === "user" || m.role === "assistant",
      `well-formed role, got ${JSON.stringify(m.role)}`,
    );
    assert.equal(typeof m.content, "string", "content is always a string, never undefined");
    assert.ok(!m.content.includes("undefined"), "no 'undefined' in any request payload");
  }
  assert.doesNotThrow(() => JSON.stringify(msgs), "the next request body serializes cleanly");
});
