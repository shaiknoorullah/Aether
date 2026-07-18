// Aether local-AI state (f7) — the hard kill switch and the one in-memory
// conversation. Pure: no Services, no prefs, no DOM — the persisted pref
// value arrives as a parameter, and glue in aether.uc.js does the pref
// read/write, the abort, and the rendering.

// Resolution order for the switch: persisted user toggle (aether.ai.enabled;
// undefined = no pref) wins over TOML [ai] enabled, which wins over the
// builtin false. Default is OFF until the user enables it.
export function resolveEnabled(configAi, persistedPref) {
  if (typeof persistedPref === "boolean") return persistedPref;
  return configAi?.enabled === true;
}

// One flip: `persist` is what glue writes to the pref; `abortInFlight` is
// true ONLY on the on→off flip — :ai_off is hard, any in-flight request is
// aborted, not merely ignored.
export function setEnabled(state, want) {
  return {
    enabled: want,
    persist: want,
    abortInFlight: state?.enabled === true && want === false,
  };
}

// The gate on the network path. Glue calls this before building any request;
// while the switch is off there is no code path from prompt to socket. An
// absent enabled flag can only ever mean off.
export function assertOn(state) {
  if (state?.enabled !== true) {
    throw new Error("aether ai is off");
  }
}

// --- conversation: one in-memory thread per window ---------------------------
// Each mutator returns the updated conversation, so `conv = addUser(conv, …)`
// always works. Nothing is persisted — restarting clears it.

export function newConversation() {
  return { messages: [] };
}

export function addUser(conv, text) {
  return {
    messages: [...conv.messages, { role: "user", content: String(text ?? "") }],
  };
}

// Opens the assistant turn the stream deltas accumulate into.
export function beginAssistant(conv) {
  return {
    messages: [...conv.messages, { role: "assistant", content: "" }],
  };
}

export function addDelta(conv, text) {
  const messages = conv.messages.slice();
  const last = messages[messages.length - 1];
  if (last?.role === "assistant") {
    messages[messages.length - 1] = {
      role: "assistant",
      content: last.content + String(text ?? ""),
    };
  }
  return { messages };
}

export function finishAssistant(conv) {
  return { messages: conv.messages.slice() };
}

// History for the next request: always well-formed {role, content} pairs,
// even mid-stream — an abort never corrupts the conversation that follows.
export function messagesFor(conv) {
  return conv.messages.map(m => ({ role: m.role, content: String(m.content ?? "") }));
}
