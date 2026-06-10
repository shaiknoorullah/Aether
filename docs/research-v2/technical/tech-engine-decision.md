# Browser Delivery Vehicle Decision: Engine & Architecture

> **Team**: tech-engine-decision (department: technical)
> **Mandate**: Browser delivery vehicle 2026 — Gecko fork vs Chromium/CEF vs custom shell over WebView vs privileged extension. Evaluate on control, maintenance, compat, AI/IPC/CDP, zero-chrome + modal-keys, licensing. Recommend.
> **Date**: 2026-06-10
> **Primary source**: `outputs/browser-delivery-vehicle-comparison.md` (Feynman deep-research brief)
> **Supporting drafts**: `outputs/.drafts/agent-safe-browser-ipc-cited.md`, `outputs/.drafts/browser-feature-whitespace-cited.md`, and v1 `docs/research-data/competitive/firefox-ecosystem.md`

---

## 1. Executive Summary

**Recommendation: build Aether as a Firefox/Gecko fork, with a Chromium/CEF fork as the credible fallback.** The Gecko fork wins on the aggregate of the six mandate dimensions because Aether's three load-bearing differentiators — keyboard-first modal control, zero-chrome UI, and privacy-without-surveillance — are precisely where Gecko is strongest and where Chromium is weakest.

The decisive factor is that Firefox's entire browser chrome is built on a privileged web stack (`browser.xhtml` + `userChrome.css` + privileged JS), so Aether can fully replace the chrome, intercept keyboard events *before* Firefox's accelerator table, and implement vim-like modal input **without a single engine-level C++ change**. Zen Browser is a live existence proof (zero-chrome, split view, workspaces, 41k+ GitHub stars) maintained by essentially one developer plus community — demonstrating the maintenance burden is tractable for a small team. Chromium, by contrast, hardcodes its accelerator table and UI in C++; Vivaldi only achieves a custom UI by running its entire interface as a web app inside a WebUI frame, a workaround that adds a Chrome-within-Chrome layer.

The two remaining options are eliminated as primary vehicles. **The privileged-extension path is a dealbreaker**: extensions cannot override reserved shortcuts (Ctrl+W/T/N/Tab), cannot hide the address bar or tab strip, are capped at ~4 suggested keybindings, and cannot implement modal (normal/insert) input — they structurally cannot deliver keyboard-first or zero-chrome. **The custom-shell-over-WebView path is eliminated by cross-platform fragmentation**: there is no single WebView covering Windows + macOS + Linux (WebView2 is Windows-only with no Linux port as of 2026), and none of the WebView variants support WebExtensions at all, killing the extension ecosystem.

The one dimension where Gecko clearly loses is AI/agent automation tooling: Chromium's CDP is the industry standard that every agent framework (Puppeteer, Playwright, Stagehand, browser-use) targets, and Firefox does not implement `chrome.debugger`/CDP at all (bug 1316741). Aether mitigates this by (a) leaning on WebDriver BiDi, which Firefox supports and which is converging toward CDP capability, and (b) building Aether's own native agent IPC layer (WebExtension messaging + Native Messaging Host + MCP) rather than depending on CDP — which the agent-safe-IPC research independently recommends *avoiding* for production agent control anyway, since CDP has no authentication or capability scoping. This turns Gecko's apparent weakness into a deliberate security posture.

---

## 2. Key Findings (each with source)

### F1 — Firefox enables full chrome replacement and pre-accelerator keyboard interception with zero C++ changes
The browser chrome (tabs, address bar, toolbars, sidebar) is a privileged DOM (`browser.xhtml`) restylable via `userChrome.css` and mutable at runtime via privileged JS. Keyboard events can be intercepted at the top-level window before Firefox's built-in accelerator handling, allowing removal/remap of every shortcut and true modal (normal/insert/command) input. Zen Browser proves zero-chrome + split view + workspaces ship on this stack with no engine patches.
Source: https://firefox-source-docs.mozilla.org/ (browser.xhtml / toolkit) and https://zen-browser.app/

### F2 — Chromium requires C++ patches for keyboard control and only achieves custom UI via a WebUI-frame workaround
Chromium's accelerator table is processed in C++ (`chrome/browser/ui/views/accelerator_table.cc`) before JS handlers fire; intercepting Ctrl+W/T requires patching and recompiling. Vivaldi runs its entire UI as a web app inside a WebUI frame rather than modifying native chrome. `--app` mode strips chrome only partially.
Source: https://chromium.googlesource.com/chromium/src/+/HEAD/docs/ (Views/accelerator) and Vivaldi `vivaldi://` UI architecture.

### F3 — A Gecko fork is maintainable by a small team; a Chromium fork effectively requires 50+ engineers
LibreWolf operates with ~5-8 contributors using a configuration-overlay model (<100 lines of diff); Zen runs on one primary dev plus community. Brave runs ~700 employees and Vivaldi ~50+. Firefox codebase ~25M LOC / ~30-40GB build vs Chromium ~35M LOC / 100GB+ disk, 16GB+ RAM, multi-hour builds. Hard forks generate "merge diffs with ~1 million changes"; overlay forks reduce this to "<100 lines of diff."
Source: https://sammacbeth.eu/building-a-firefox-fork and https://0x65.dev/blog/2019-12-17/why-we-forked-firefox-and-not-chromium.html

### F4 — Privileged extensions structurally cannot deliver keyboard-first or zero-chrome (dealbreaker)
Extensions cannot override reserved shortcuts (Ctrl+W/T/N/Tab/Shift+Tab/F11), are capped at ~4 suggested keyboard shortcuts in Chrome, cannot hide the address bar or tab strip, and cannot implement modal input. "If a key combination is already used by the browser… you can't override it."
Source: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands

### F5 — Custom-shell-over-WebView fails on cross-platform coverage and has zero WebExtension support
No single WebView spans Windows + macOS + Linux: WebView2 is Windows-only (no Linux port as of 2026-06-10), WKWebView is Apple-only, WebKitGTK is Linux-only. None support the WebExtension standard, eliminating the extension ecosystem. Three separate platform integrations would be required.
Source: https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution

### F6 — CDP is the agent-automation standard, but Firefox does not implement it; BiDi is the convergence path
CDP (Puppeteer/Playwright/Selenium 4 + every major AI agent framework) is the de facto automation protocol. Firefox does not implement `chrome.debugger`/CDP (bug 1316741, "not implemented") and instead offers the actor-based Firefox RDP plus W3C WebDriver BiDi, which all major vendors are implementing and which is converging toward CDP capability.
Source: https://bugzil.la/1316741 and https://chromedevtools.github.io/devtools-protocol/

### F7 — CDP is the wrong agent-control channel for a privacy-first browser regardless of engine
CDP has no authentication and no capability scoping — any local process connecting to the debug WebSocket gets full access including arbitrary JS execution (`Runtime.evaluate`) and network interception. The recommended agent-safe architecture is layered: WebExtension messaging (sender-validated, permission-scoped) + Firefox Xray wrappers (`exportFunction`/`cloneInto`) + optional Native Messaging Host + MCP as the agent-facing protocol. This makes Gecko's lack of CDP a feature, not a bug.
Source: `outputs/.drafts/agent-safe-browser-ipc-cited.md` (citing https://chromedevtools.github.io/devtools-protocol/)

### F8 — MPL-2.0 gives the best licensing posture; Chromium's BSD is permissive but carries Google-service-removal cost
MPL-2.0 is file-level copyleft (new files any license, modified Mozilla files stay MPL), includes a patent grant, and is clean if the Firefox name/logo are not used. Chromium BSD-3-Clause is maximally permissive but requires removing Google service dependencies (Safe Browsing, sync, component updater) and offers no patent grant beyond BSD; ungoogled-chromium documents this removal work.
Source: https://www.mozilla.org/en-US/MPL/2.0/ and https://chromium.googlesource.com/chromium/src/+/HEAD/LICENSE

### F9 — Firefox preserves blocking webRequest and ships privacy/identity APIs Chrome lacks — a structural privacy advantage
Firefox retains blocking `webRequest` under MV3 (Chrome moved to the weaker `declarativeNetRequest`) and exposes `contextualIdentities` (container tabs), dynamic `proxy.onRequest`, `dns`, and `pkcs11` — directly serving Aether's per-tab identity / sandboxed-profile goals. These have no Chrome equivalent.
Source: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities

### F10 — No shipping browser has solved keyboard-first at the engine level; every solution is an extension bolted onto a mouse-first browser
Tridactyl (Firefox), Vimium, and Surfingkeys are all extension-layer and cannot touch browser chrome, internal pages, or the navigation model. Nyxt is native keyboard-first but a niche Common Lisp browser with limited web compatibility. Owning the UI layer (fork or shell) is the only way to make every surface keyboard-navigable.
Source: `docs/research-data/competitive/firefox-ecosystem.md` (Gaps 1 & 5) and `outputs/.drafts/browser-feature-whitespace-cited.md` (§2.1)

---

## 3. Implied Aether Feature Candidates

These are the architecture-determining capabilities the delivery-vehicle decision unlocks (or forecloses). RICE inputs are in the structured return object.

1. **Gecko-fork chrome-replacement engine** (Core Browsing) — the foundational decision: ship Aether as a thin, overlay-style Firefox/Gecko fork (LibreWolf model) so chrome, navigation, and input are fully owned without C++ patches. JTBD: "give me a browser I fully control without a 50-person engine team."
2. **Native modal/vim keyboard layer with pre-accelerator event interception** (Keyboard & Input) — intercept keydown at the `browser.xhtml` window level before the accelerator table to deliver true normal/insert/command modes across *every* surface including chrome and internal pages. JTBD: "drive the entire browser from the keyboard."
3. **Zero-chrome customizable UI shell** (Workspace & Organization) — replaceable chrome via privileged DOM + CSS, the Zen-proven capability, as Aether's default. JTBD: "remove visual clutter and reclaim screen for content."
4. **Layered agent-IPC stack (WebExtension messaging + Native Messaging Host + MCP), not CDP** (AI & Agents) — Aether's own sender-validated, capability-scoped agent control channel instead of unauthenticated CDP. JTBD: "let agents drive my browser without a security hole."
5. **WebDriver-BiDi-based automation surface** (Developer Tools) — expose BiDi (+ a Firefox RDP adapter) so existing agent frameworks can target Aether despite no CDP. JTBD: "use my existing Playwright/agent tooling against this browser."
6. **Per-tab network identity via contextualIdentities + dynamic proxy** (Privacy & Security) — build sandboxed profiles / per-tab identity on Firefox's container + `proxy.onRequest` + blocking webRequest APIs, which Chromium cannot match. JTBD: "isolate my browsing contexts and audit data flows."
7. **Overlay-style fork-maintenance pipeline** (Performance / engineering ops) — adopt the LibreWolf configuration-overlay + patch-series model and CI build caching to keep the fork mergeable within days of upstream and survivable by a small team. JTBD: "stay current on security patches without a merge-hell team."

---

## 4. Competitive / Whitespace Notes

- **Keyboard-first at the engine level is genuine whitespace.** Every competitor (Tridactyl, Vimium, Surfingkeys) is extension-layer and blocked from browser chrome and internal pages; Nyxt is native but web-incompatible. A Gecko fork is the only vehicle that delivers native keyboard-first *and* full web compat. (Source: firefox-ecosystem.md Gaps 1/5; whitespace §2.1)
- **Zen owns the zero-chrome / workspace aesthetic but rides a critical bus factor of 1** (single maintainer, donation-only). Aether can adopt the same technical approach with a more sustainable maintenance model (overlay forking + team). (Source: firefox-ecosystem.md, Zen sustainability)
- **Browser-as-agent-runtime is unfilled.** Brave AI Browsing (Nightly, isolated profile + alignment model) is the closest, but no browser offers a permission-gated agent runtime. Aether's layered-IPC choice is the architectural prerequisite for this gap. (Source: whitespace §1.1)
- **CDP-native agent integration is Chromium's moat — and a liability.** Choosing Gecko trades the convenience of "Playwright works out of the box" for a defensible privacy-by-design agent channel. Aether's differentiator is *safe* agent access, not *maximal* agent access. (Source: agent-safe-IPC brief)
- **Firefox's privacy API surface (blocking webRequest, containers, dynamic proxy) is structurally unavailable to Chromium forks** — this aligns the engine choice with Market Gap #1 (AI-native without surveillance). (Source: Chrome_incompatibilities)

---

## 5. Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| R1 | Mozilla reduces Firefox investment / financial instability undermines the upstream Aether depends on | High | Keep fork patches modular (overlay model); preserve ability to pivot to Chromium/CEF fallback; track Servo/Gecko component health |
| R2 | WebDriver BiDi never reaches CDP parity, leaving agent-framework compat behind Chromium | Medium | Ship a Firefox RDP→agent adapter; invest in Aether-native MCP/agent tooling so we don't depend on third-party CDP frameworks |
| R3 | Gecko's smaller extension ecosystem deters mainstream adoption | Medium | Power-user-first positioning lowers the cost; curate a Firefox add-on compatibility list; Firefox supports both `browser` and `chrome` namespaces (~85-90% Chrome API compat) |
| R4 | Mozilla changes internal chrome/privileged APIs (XUL→browser.xhtml-style breakage) | Medium | Base on ESR; upstream patches where possible; keep chrome-mod surface area minimal |
| R5 | Single-maintainer / small-team burnout (the Zen failure mode) on a high-velocity security-critical codebase | High | Overlay forking to minimize divergence; CI/build caching; fund maintenance from day one rather than donations |
| R6 | Native modal keyboard layer regresses or breaks on upstream chrome refactors | Medium | Encapsulate the input layer behind a stable internal interface; comprehensive keybinding regression tests |
| R7 | If Chrome Web Store extension compat becomes non-negotiable for adoption, the whole vehicle thesis flips | Medium | Pre-document the Chromium/CEF fallback architecture and the Google-service-removal scripts (ungoogled-chromium approach) so a pivot is executable, not theoretical |
| R8 | Agent IPC layer itself becomes an attack surface (prompt injection driving privileged actions) | High | Enforce sender validation in the background gateway; never use `window.postMessage`; capability-scope every agent operation; route content-script messages as untrusted (per agent-safe-IPC brief) |

---

## Sources

1. `outputs/browser-delivery-vehicle-comparison.md` — primary Feynman deep-research brief
2. https://zen-browser.app/ — zero-chrome existence proof
3. https://librewolf.net/ — overlay-fork maintenance model
4. https://firefox-source-docs.mozilla.org/devtools/backend/protocol.html — Firefox RDP
5. https://bugzil.la/1316741 — `chrome.debugger`/CDP not implemented in Firefox
6. https://chromedevtools.github.io/devtools-protocol/ — CDP
7. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands — reserved-shortcut limits
8. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities — Firefox vs Chrome API gaps/advantages
9. https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution — WebView2 Windows-only
10. https://www.mozilla.org/en-US/MPL/2.0/ — MPL-2.0
11. https://sammacbeth.eu/building-a-firefox-fork and https://0x65.dev/blog/2019-12-17/why-we-forked-firefox-and-not-chromium.html — fork maintenance economics
12. `outputs/.drafts/agent-safe-browser-ipc-cited.md` — layered agent-IPC security architecture
13. `outputs/.drafts/browser-feature-whitespace-cited.md` — whitespace clusters
14. `docs/research-data/competitive/firefox-ecosystem.md` — fork ecosystem & keyboard-extension limits (v1, unmodified)
