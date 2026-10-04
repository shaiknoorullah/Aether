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
      // that a COMPROMISED content process — with Fission, possibly just a
      // cross-site ad iframe — gains nothing powerful through this actor. It
      // holds because of two parent-side rules, not the child's courtesy:
      //   1. provenance: aether-content-parent drops any message from a frame
      //      its policy (aether-content-policy) does not allow — top-only for
      //      all but Focus (same-origin-with-top), from parent-side facts.
      //   2. content: onContentMessage (aether.uc.js) treats the data as
      //      hostile —
      //        BoostReady       re-applies the user's own dotfile; URI from parent
      //        Focus            flips the NORMAL/INSERT badge — nothing more
      //        HintsDone        writes only while :zap is armed on that tab, from
      //                         its top document; sanitized on every apply
      //        BoostSampleDone  needs the in-flight :boost token; loopback-only,
      //                         kill-switched; CSS previewed, Enter to accept
      //        ScrollSample     a validated number; restore needs an exact url
      // What remains: a compromised TOP document can choose its own zap
      // selector or boost sample — page-controlled data by design, gated by
      // your explicit :zap/:boost and the sanitizer. Re-audit on any new message.
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
