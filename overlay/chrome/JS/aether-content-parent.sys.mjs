// Parent side of the AetherContent actor: relays content events (focus changes,
// hint lifecycle) to the Aether instance living on the owning chrome window —
// but only from the frames each message is allowed to come from
// (aether-content-policy), decided here from parent-side facts.

import { acceptContentMessage } from "chrome://userscripts/content/aether-content-policy.sys.mjs";

// Frame provenance a content process cannot forge: BrowsingContext identity
// lives in the parent, and the WindowGlobalParent's document principal is
// bound to the process's site lock — a cross-site iframe's process cannot
// present the top document's principal.
function frameFacts(bc, windowGlobal) {
  const isTop = bc === bc.top;
  if (isTop) return { isTop, sameOriginWithTop: true };
  const own = windowGlobal?.documentPrincipal;
  const top = bc.top?.currentWindowGlobal?.documentPrincipal;
  return { isTop, sameOriginWithTop: !!(own && top && own.equals(top)) };
}

export class AetherContentParent extends JSWindowActorParent {
  receiveMessage(msg) {
    try {
      const bc = this.browsingContext;
      if (!acceptContentMessage(msg.name, frameFacts(bc, this.manager))) return;
      bc.topChromeWindow?.Aether?.onContentMessage(msg.name, msg.data, bc);
    } catch (e) {
      console.error("[aether] parent actor could not relay:", e);
    }
  }
}
