// Content → chrome trust boundary: which frames each AetherContent message is
// accepted from. Applied in the PARENT actor to facts the parent computes
// itself — never to anything the child says about itself.
//
// Why the parent: since Firefox 157 the actor declares
// safeForUntrustedWebProcess, so the child is assumed attacker-controlled. A
// compromised content process — with Fission, possibly just a cross-site ad
// iframe in its own process — can send any message from any of its frames.
// The child's own frame checks (top-only hints, same-origin focus) are
// courtesy; this is the gate. Pure: no Services, no DOM.

export const MESSAGE_ORIGINS = Object.freeze({
  // b1: a new top document asks for its boost CSS.
  "Aether:BoostReady": "top",
  // f1: editable focus drives auto-INSERT — same-origin iframes host editors.
  "Aether:Focus": "same-origin-as-top",
  // hints are top-frame only; "picked" is the :zap dotfile write path.
  "Aether:HintsDone": "top",
  // b2: the structure sample for an in-flight :boost.
  "Aether:BoostSampleDone": "top",
  // b3: scroll context is recorded for the top document only.
  "Aether:ScrollSample": "top",
});

// frame = { isTop, sameOriginWithTop } — strict booleans or it is refused.
export function acceptContentMessage(name, frame) {
  if (typeof name !== "string" || !Object.hasOwn(MESSAGE_ORIGINS, name)) return false;
  if (!frame || typeof frame !== "object") return false;
  const rule = MESSAGE_ORIGINS[name];
  if (frame.isTop === true) return true;
  return rule === "same-origin-as-top" && frame.sameOriginWithTop === true;
}
