// Aether local-AI client (f7) — pure request builder + SSE stream-chunk
// parser for the OpenAI-compatible loopback gateway. No Services, no DOM, no
// fetch — glue in aether.uc.js owns the network call; this module only
// decides what the request is and what a stream chunk means.
//
// Network rule (decision-2 discipline): validateBaseUrl accepts http(s) on
// loopback hosts ONLY. Rejection is unavailability — never a fallback to
// some other host, never a silent remote fetch.

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

// true ONLY for http(s) on a loopback host (any port). Anything else —
// LAN/cloud hosts, loopback-prefixed hostname tricks, non-http(s) schemes,
// garbage — is false.
export function validateBaseUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  return LOOPBACK_HOSTS.has(u.hostname);
}

// "<base>/chat/completions" with trailing-slash normalization — never a
// "//chat/completions" path.
export function chatUrl(baseUrl) {
  return `${String(baseUrl).replace(/\/+$/, "")}/chat/completions`;
}

// {url, init} plain data for POST {base_url}/chat/completions. The messages
// array is passed through in order, untouched; the model name goes verbatim.
// Local gateways need no auth headers — none are ever added.
export function buildRequest(aiConfig, messages) {
  return {
    url: chatUrl(aiConfig.base_url),
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: aiConfig.model, messages, stream: true }),
    },
  };
}

// Stateless-in/out SSE parser: the caller threads `buffer` ("" to start)
// through every network chunk. Parses `data:` lines (with or without the
// space, LF or CRLF), reassembles partial chunks, emits content deltas in
// order, flips done on `data: [DONE]` (anything after it in the feed
// contributes nothing), skips malformed JSON lines without throwing, and
// never emits text for role-only or empty-delta events.
export function sseFeed(buffer, chunkText) {
  let rest = buffer + chunkText;
  const deltas = [];
  let done = false;
  let nl;
  while ((nl = rest.indexOf("\n")) !== -1) {
    const line = rest.slice(0, nl).replace(/\r$/, "");
    rest = rest.slice(nl + 1);
    if (done || !line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") {
      done = true;
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch {
      continue; // one bad line never takes the stream down
    }
    const content = parsed?.choices?.[0]?.delta?.content;
    if (typeof content === "string" && content !== "") deltas.push(content);
  }
  return { buffer: done ? "" : rest, deltas, done };
}
