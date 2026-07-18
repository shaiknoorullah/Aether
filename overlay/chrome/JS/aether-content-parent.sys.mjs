// Parent side of the AetherContent actor: relays content events (focus changes,
// hint lifecycle) to the Aether instance living on the owning chrome window.

export class AetherContentParent extends JSWindowActorParent {
  receiveMessage(msg) {
    try {
      const win = this.browsingContext.topChromeWindow;
      win?.Aether?.onContentMessage(msg.name, msg.data, this.browsingContext);
    } catch (e) {
      console.error("[aether] parent actor could not relay:", e);
    }
  }
}
