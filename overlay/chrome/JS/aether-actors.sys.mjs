// Registers the AetherContent JSWindowActor pair exactly once per session.
// Imported by aether.uc.js from every browser window; the guard makes that safe.

let registered = false;

export function ensureActors() {
  if (registered) return;
  try {
    ChromeUtils.registerWindowActor("AetherContent", {
      parent: {
        esModuleURI: "chrome://userscripts/content/aether-content-parent.sys.mjs",
      },
      child: {
        esModuleURI: "chrome://userscripts/content/aether-content-child.sys.mjs",
        events: {
          focusin: {},
          focusout: {},
          // b1: each new top document announces itself so its boost CSS is
          // applied without racing the progress listener.
          DOMContentLoaded: {},
        },
      },
      allFrames: true,
      messageManagerGroups: ["browsers"],
    });
    registered = true;
  } catch (e) {
    // NotSupportedError = already registered (e.g. script cache replay) — fine.
    if (e.name === "NotSupportedError") {
      registered = true;
    } else {
      console.error("[aether] could not register actors:", e);
    }
  }
}

ensureActors();
