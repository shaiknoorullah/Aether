// f7 — AI client surface: request builder + SSE stream-chunk parser (SDD RED).
// Spec: overlay/specs/f7-local-ai-sidebar.md §2 "Send"/"Network rule", §3,
// §4 tests 1–10. Written before the implementation; the module follows these.
//
// Contract pinned here for overlay/chrome/JS/aether-ai-client.sys.mjs (pure —
// no Services/DOM/fetch; glue does the actual network call):
//   validateBaseUrl(url) -> boolean. true ONLY for http(s) on loopback hosts
//     (127.0.0.1, localhost, [::1]) on any port. false is unavailability —
//     never a fallback to some other host.
//   chatUrl(baseUrl) -> "<base>/chat/completions" with trailing-slash
//     normalization (never "//chat/completions").
//   buildRequest(aiConfig, messages) -> {url, init} plain data; init.method
//     "POST", init.body a JSON string of {model, messages, stream: true} with
//     the messages array passed through in order, untouched.
//   sseFeed(buffer, chunkText) -> {buffer, deltas: [string], done: boolean}.
//     Stateless-in/out: caller threads buffer ("" to start). Parses `data:`
//     lines (with or without the space, LF or CRLF), reassembles partial
//     chunks, emits content deltas in order, flips done on `data: [DONE]`
//     (anything after it in the feed contributes nothing), skips malformed
//     JSON lines without throwing, and never emits undefined/empty text for
//     role-only or empty-delta events.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  validateBaseUrl,
  chatUrl,
  buildRequest,
  sseFeed,
} from "../../chrome/JS/aether-ai-client.sys.mjs";

const CFG = {
  enabled: true,
  base_url: "http://127.0.0.1:11434/v1",
  model: "llama3.2",
};

// Thread a sequence of chunk strings through sseFeed the way glue's stream
// loop does, collecting every delta and the final done flag.
function feedAll(chunks) {
  let buffer = "";
  let done = false;
  const deltas = [];
  for (const chunk of chunks) {
    const r = sseFeed(buffer, chunk);
    buffer = r.buffer;
    deltas.push(...r.deltas);
    if (r.done) done = true;
  }
  return { deltas, done, text: deltas.join("") };
}

function event(content) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}

// 1. buildRequest with defaults --------------------------------------------

test("client: buildRequest → POST <base>/chat/completions, body {model, messages, stream: true}", () => {
  const messages = [
    { role: "user", content: "first question" },
    { role: "assistant", content: "first answer" },
    { role: "user", content: "second question" },
  ];
  const { url, init } = buildRequest(CFG, messages);
  assert.equal(url, "http://127.0.0.1:11434/v1/chat/completions");
  assert.equal(init.method, "POST");
  const body = JSON.parse(init.body);
  assert.deepEqual(
    body,
    { model: "llama3.2", messages, stream: true },
    "body carries the model verbatim and the messages in order, untouched",
  );
  assert.deepEqual(
    body.messages,
    messages,
    "the conversation is passed through — no reordering, trimming, or rewriting",
  );
});

// 2. trailing-slash normalization -------------------------------------------

test("client: trailing-slash base_url never yields '//chat/completions'", () => {
  assert.equal(
    chatUrl("http://127.0.0.1:11434/v1/"),
    "http://127.0.0.1:11434/v1/chat/completions",
  );
  assert.equal(
    chatUrl("http://127.0.0.1:11434/v1"),
    "http://127.0.0.1:11434/v1/chat/completions",
  );
  const { url } = buildRequest({ ...CFG, base_url: "http://127.0.0.1:11434/v1/" }, []);
  assert.ok(!url.includes("//chat"), `no double slash in the path, got ${url}`);
  assert.equal(url, "http://127.0.0.1:11434/v1/chat/completions");
});

// 3. validateBaseUrl — loopback http(s) only --------------------------------

test("client: validateBaseUrl accepts http(s) on loopback hosts, any port", () => {
  const accepted = [
    "http://127.0.0.1:11434/v1",
    "http://127.0.0.1:8080/v1",
    "https://127.0.0.1/v1",
    "http://localhost:1234/v1",
    "https://localhost:11434/v1",
    "http://[::1]:11434/v1",
    "https://[::1]:9/v1",
  ];
  for (const url of accepted) {
    assert.equal(validateBaseUrl(url), true, `${url} is a loopback gateway — accept`);
  }
});

test("client: validateBaseUrl rejects non-loopback hosts and non-http(s) schemes", () => {
  const rejected = [
    "http://192.168.1.10:11434/v1", // LAN is not loopback
    "http://10.0.0.5:11434/v1",
    "https://api.openai.com/v1", // cloud is never a config value away
    "http://example.com/v1",
    "http://127.0.0.1.evil.example/v1", // loopback-prefixed hostname trick
    "http://localhost.evil.example/v1",
    "file:///etc/passwd",
    "chrome://userchrome/content/ai-sidebar.html",
    "ws://127.0.0.1:11434/v1",
    "ftp://127.0.0.1/v1",
    "not a url at all",
    "",
  ];
  for (const url of rejected) {
    assert.equal(validateBaseUrl(url), false, `${url || "(empty)"} must be rejected`);
  }
});

// 4. one complete data chunk -------------------------------------------------

test("client: one complete data event → its delta text, done: false", () => {
  const r = sseFeed("", event("Hello"));
  assert.deepEqual(r.deltas, ["Hello"]);
  assert.equal(r.done, false);
});

// 5. arbitrary byte-boundary splits reassemble identically -------------------

test("client: a reply split at arbitrary byte boundaries equals the whole-buffer feed", () => {
  const fixture =
    'data: {"choices":[{"delta":{"role":"assistant"}}]}\n\n' +
    event("Hel") +
    event("lo from ") +
    event("the local ") +
    event("gateway.") +
    "data: [DONE]\n\n";

  const whole = feedAll([fixture]);
  assert.equal(whole.text, "Hello from the local gateway.");
  assert.equal(whole.done, true);

  // Chunk sizes 1..13 cover splits mid-line, mid-JSON, and mid-`data:` keyword.
  for (const size of [1, 2, 3, 5, 7, 11, 13]) {
    const chunks = [];
    for (let i = 0; i < fixture.length; i += size) chunks.push(fixture.slice(i, i + size));
    const split = feedAll(chunks);
    assert.equal(split.text, whole.text, `chunk size ${size} reassembles the same text`);
    assert.equal(split.done, true, `chunk size ${size} still sees [DONE]`);
  }

  // And one hand-picked nasty split: mid-`data:` keyword and mid-JSON value.
  const at = fixture.indexOf('"delta":{"content":"lo');
  const nasty = feedAll(["da", "ta", fixture.slice(4, at + 25), fixture.slice(at + 25)]);
  assert.equal(nasty.text, whole.text, "mid-keyword/mid-JSON split reassembles");
  assert.equal(nasty.done, true);
});

// 6. multiple events in one chunk --------------------------------------------

test("client: multiple data events in one chunk → all deltas, in order", () => {
  const r = sseFeed("", event("one ") + event("two ") + event("three"));
  assert.deepEqual(r.deltas, ["one ", "two ", "three"]);
  assert.equal(r.done, false);
});

// 7. [DONE] -------------------------------------------------------------------

test("client: data: [DONE] → done: true; text after it contributes nothing", () => {
  const r = sseFeed("", event("kept") + "data: [DONE]\n\n" + event("never seen"));
  assert.equal(r.done, true);
  assert.deepEqual(r.deltas, ["kept"], "nothing after [DONE] reaches the transcript");
});

// 8. malformed lines are skipped, later deltas still arrive -------------------

test("client: a malformed-JSON data line is skipped without throwing", () => {
  let r;
  assert.doesNotThrow(() => {
    r = sseFeed("", event("before ") + "data: {not json at all\n\n" + event("after"));
  });
  assert.deepEqual(r.deltas, ["before ", "after"], "the stream survives one bad line");
  assert.equal(r.done, false);
});

// 9. role-only / empty deltas contribute no text ------------------------------

test("client: role-only and empty-delta events contribute no text — never 'undefined'", () => {
  const chunk =
    'data: {"choices":[{"delta":{"role":"assistant"}}]}\n\n' +
    'data: {"choices":[{"delta":{}}]}\n\n' +
    'data: {"choices":[{"delta":{"content":""}}]}\n\n' +
    event("real text");
  const r = sseFeed("", chunk);
  assert.equal(r.deltas.join(""), "real text");
  for (const d of r.deltas) {
    assert.equal(typeof d, "string", "every delta is a string");
    assert.ok(!d.includes("undefined"), "no 'undefined' ever reaches the transcript");
  }
});

// 10. CRLF and data:-without-space -------------------------------------------

test("client: CRLF line endings and 'data:' without a space both parse", () => {
  const crlf = sseFeed(
    "",
    'data: {"choices":[{"delta":{"content":"crlf ok"}}]}\r\n\r\ndata: [DONE]\r\n\r\n',
  );
  assert.deepEqual(crlf.deltas, ["crlf ok"]);
  assert.equal(crlf.done, true);

  const nospace = sseFeed("", 'data:{"choices":[{"delta":{"content":"no space ok"}}]}\n\n');
  assert.deepEqual(nospace.deltas, ["no space ok"]);
  assert.equal(nospace.done, false);
});
