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
      // Firefox 157+ refuses actors in web/file content processes unless they
      // declare this (dom.jsipc.check_safeForUntrustedWebProcess) — without
      // it every content feature (hints, scroll, insert detection, boosts,
      // :zap, resurrection) is dead on every page. The declaration is a claim
      // that a COMPROMISED content process gains nothing powerful through this
      // actor, and it holds because the parent already treats every child
      // message as hostile (onContentMessage, aether.uc.js):
      //   BoostReady       re-applies the user's own dotfile; URI read in parent
      //   Focus            flips the NORMAL/INSERT badge — nothing more
      //   HintsDone        writes only while :zap is armed on that exact tab;
      //                    domain from the parent; sanitized on every apply
      //   BoostSampleDone  only with the in-flight :boost token; loopback-only,
      //                    kill-switched; CSS output previewed, Enter to accept
      //   ScrollSample     a validated number for its own tab; restore needs
      //                    an exact url match
      // No exec, no file read, no network reach. Re-audit when a message is added.
      safeForUntrustedWebProcess: true,
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
