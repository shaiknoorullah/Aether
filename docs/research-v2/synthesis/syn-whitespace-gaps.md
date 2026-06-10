# Synthesis Department Report: Feature Whitespace No Browser Fills (2026)

> **Team**: syn-whitespace-gaps (department: synthesis)
> **Date**: 2026-06-10
> **Mandate**: Synthesize AI-native + power-user + privacy + neurodivergent needs into unserved opportunities, plus contrarian risks.
> **Primary input**: `outputs/browser-feature-whitespace.md` (Feynman deep-research brief, 18 gaps, 21 sources)
> **Provenance**: `outputs/browser-feature-whitespace.provenance.md` (1 round, 21/21 sources accepted, PASS WITH NOTES; subagent fan-out and web-search providers degraded — coverage may be narrower than ideal)
> **Cross-reference**: `outputs/.drafts/browser-failure-redteam-cited.md` (Arc novelty-tax pre-mortem), v1 council scores in `docs/research-data/council/`

---

## 1. Executive Summary

The whitespace brief identifies **18 structural feature absences** that no shipping browser fills as of mid-2026 — not incremental gaps, but capabilities that even the most innovative browsers (Brave, Vivaldi, Nyxt, Mullvad, Chrome's built-in AI) have not implemented. The absences cluster into four domains and one compound domain:

1. **Browser-as-agent-runtime** — browsers expose AI as a chatbot, never as a permission-gated, programmable agent runtime with revocable tool-use capabilities and persistent cross-session context.
2. **Compositional privacy** — per-tab (not per-container) network identity, real-time auditable data-flow visualization, and adaptive/threat-model-driven protection do not exist.
3. **Neurodivergent-first design** — cognitive-load signaling, complete sensory profiles, executive-function scaffolding, and ADHD-aware tab lifecycles are entirely absent from browser chrome (only partial CSS-level extension hacks like Helperbird exist).
4. **Programmable session architecture** — sessions cannot be branched, merged, diffed, scoped, or piped; history loses the navigation graph.

The synthesis insight is that the **highest-value whitespace is compound**: AI × neurodivergent (AI that detects page complexity and simplifies per a user's sensory profile), privacy × power-user (scriptable privacy contexts), and AI × privacy (fully-local AI with rich browser context and a provable no-exfiltration guarantee). These compounds are unserved precisely because no single vendor owns both halves, and they map directly onto Aether's stated thesis of composable, AI-native, privacy-respecting, power-user primitives.

The dominant **contrarian caveat**, reinforced by the red-team pre-mortem, is the **novelty tax** (Arc's lesson: features used by <5% of DAUs are dead weight). Many whitespace gaps persist not from vendor inertia but from genuine barriers — unsolved security models (prompt injection), the privacy paradox (helpful features require sensitive data), anonymity-set math that argues *against* adaptive fingerprinting, and unsolved UX research. Aether should treat each gap as "barrier or inertia?" and only build the inertia-driven ones eagerly; barrier-driven ones need a credible solution to the barrier first, or they become differentiated liabilities.

---

## 2. Key Findings (each with source URL)

### F1 — No browser is an agent runtime with a granular, revocable tool-use permission model
Brave AI Browsing (Nightly, June 2026) is the closest: isolated profile + a second alignment-checking model, but it runs as a single autonomous session, not a per-agent capability grant (read tab / fill form / click / network). Brave itself flags prompt injection and model confusion as the two primary risks. The gap may persist because the security model is genuinely unsolved.
Source: https://support.brave.app/hc/en-us/articles/41240379376909 · https://brave.com/series/security-privacy-in-agentic-browsing/

### F2 — No browser does multi-model orchestration (capability-based routing across local models)
Brave BYOM connects one local Ollama endpoint at a time with manual model switching; Chrome ships only Gemini Nano locked to specific APIs (Translator/Summarizer/Prompt). No browser auto-routes tasks to the right model or runs several concurrently. Contrarian: orchestration needs 16+ GB RAM and a wrong-model router is worse than one good model.
Source: https://support.brave.app/hc/en-us/articles/34070140231821 · https://developer.chrome.com/docs/ai/built-in-apis

### F3 — No persistent cross-session AI context / semantic history
Brave Leo "memories" persist preferences across chats and Multi-Tab Context references open tabs, but closing the browser loses all conversational state. No browser does semantic/vector search over visited-page content ("find that battery-chemistry article from last week"). Contrarian: this is the single most privacy-sensitive dataset a browser could hold.
Source: https://brave.com/leo/ · https://support.brave.app/hc/en-us/articles/38614934646029

### F4 — MCP is page-facing, never browser-facing
Chrome's WebMCP (early preview) exposes site tools to agents but no browser implements MCP as a native browser-level protocol to connect to arbitrary AI tool servers. Contrarian: MCP is <2 years old; first-class integration risks breaking changes.
Source: https://developer.chrome.com/docs/ai

### F5 — Modal vim control cannot reach browser chrome
Tridactyl/Vimium operate only on page content; address bar, settings, DevTools, PDF viewer, extension popups are off-limits due to WebExtension API restrictions. Nyxt is the only truly keyboard-first browser but is a niche Common Lisp project with poor web compatibility. (Corroborated by v1 power-user discovery: "Vimium does not work in certain places due to limitations imposed by web extensions.")
Source: https://tridactyl.xyz/ · https://nyxt-browser.com/

### F6 — No scriptable browser pipelines with conditional logic; no git-like session architecture
Vivaldi Command Chains (2021) run linear command sequences with delays but no branching, conditionals, or data passing. Vivaldi sessions save/restore but cannot branch/merge/diff; Nyxt has within-tab history trees only. No UNIX pipe / stdin-stdout CLI control, and no workspace-scoped bookmarks (every browser keeps one global bookmark tree).
Source: https://vivaldi.com/blog/command-chains/ · https://vivaldi.com/features/

### F7 — Privacy isolation is per-container, never per-tab; no adaptive/threat-model protection
Firefox Multi-Account Containers + Mozilla VPN gives per-container (not per-tab) network identity; Brave Tor is private-windows-only (all-or-nothing). Brave randomizes fingerprints, Mullvad/Tor make everyone identical — both one-size-fits-all. No one-click threat-model presets (Casual→Journalist→Activist). Contrarian: adaptive fingerprinting *shrinks* the anonymity set, a genuine security argument against it; preset "journalist mode" gives dangerous false confidence.
Source: https://support.mozilla.org/en-US/kb/containers · https://brave.com/privacy-features/ · https://mullvad.net/en/browser

### F8 — No real-time, user-facing auditable data-flow visualization
DevTools Network panel is developer-oriented and per-tab; Brave Shields shows per-page block counts. No cross-tab dashboard of what data is leaving to which servers. Contrarian: real-time flow viz risks alarm fatigue and is an unsolved UX problem.
Source: https://brave.com/privacy-features/

### F9 — No supply-chain verification for extensions; no vendorless zero-knowledge sync
No browser cryptographically verifies that running extension code matches what was reviewed (reproducible-build verification). Brave Sync is E2E but vendor-bound; no browser offers sync via user-provided storage (S3/WebDAV) with client-side encryption and zero vendor involvement. Contrarian: reproducible builds for minified JS bundles are very hard; vendorless sync has no recovery/conflict UX.
Source: https://brave.com/privacy-features/

### F10 — Neurodivergent-first design is entirely absent from browser chrome
No browser signals page cognitive load (animation count, DOM density, autoplay, popup frequency). Helperbird offers accessibility profiles but only as extension-level CSS overrides — it cannot control browser chrome, system audio, or deep animation behavior. No executive-function scaffolding (Pomodoro, break reminders, session goals), no ADHD-aware tab management (auto-archive on inactivity, gentle nudges, soft tab-count limits), no focus scaffolding (progressive disclosure of reader content), no layout-shift freeze. W3C COGA documents these needs but targets content authors, not browsers.
Source: https://www.helperbird.com/features/ · https://www.w3.org/WAI/cognitive/

### F11 — The compound gaps are the real whitespace
No browser combines AI with cognitive accessibility (detect complexity → simplify per sensory profile); no scriptable privacy contexts (`contextualIdentities` allows partial container management, not the create→load→extract→destroy pipeline); no fully-local AI with rich browser context plus a provable zero-exfiltration guarantee; no keyboard-first interaction designed for combined motor + cognitive needs (vim tools optimize for speed, not forgiveness).
Source: https://support.mozilla.org/en-US/kb/containers · https://support.brave.app/hc/en-us/articles/34070140231821 · https://developer.chrome.com/docs/ai/built-in-apis

### F12 — Most gaps persist from genuine barriers, not inertia (meta-finding)
The brief's meta-analysis classifies persistence causes: security risk (agent permissions, scriptable pipelines, per-tab routing — real), privacy paradox (helpful features need sensitive data — real), engineering complexity (session branching, per-tab networking, adaptive fingerprinting — real), protocol immaturity (MCP — real), and vendor inertia (neurodivergent needs are documented but unaddressed — primarily inertia). Only the inertia-driven gaps are "free" wins.
Source: https://www.w3.org/WAI/cognitive/ (COGA needs documented yet unimplemented by browsers)

---

## 3. Implied Aether Feature Candidates

Mapped to Aether's 12 categories. RICE inputs use the v1 council convention (reach 0-10, impact 0-3, confidence 0-1, effort in person-months). Effort reflects browser-chrome-level work where the engine gives the hard parts for free; full-engine work is costed higher. The full structured object is returned separately.

| # | Candidate | Category | Whitespace finding | RICE (R/I/C/E) |
|---|-----------|----------|--------------------|----------------|
| 1 | Permission-gated agent runtime (revocable per-capability grants) | AI & Agents | F1 | 6 / 3 / 0.55 / 12 |
| 2 | Local multi-model orchestration (capability routing) | AI & Agents | F2 | 4 / 2 / 0.5 / 9 |
| 3 | Persistent cross-session AI memory + semantic history search | AI & Agents | F3 | 6 / 2.5 / 0.6 / 8 |
| 4 | Browser-level MCP client/host (not page-facing only) | Extensibility | F4 | 5 / 2 / 0.55 / 6 |
| 5 | Native modal vim control across all browser chrome | Keyboard & Input | F5 | 5 / 2.5 / 0.7 / 4 |
| 6 | Scriptable browser pipelines with conditionals + data passing | Productivity | F6 | 4 / 2 / 0.55 / 7 |
| 7 | Git-like session architecture (branch/merge/diff/tree history) | Workspace & Organization | F6 | 5 / 2.5 / 0.5 / 8 |
| 8 | Per-tab network identity (mix Tor/clearnet/VPN per tab) | Privacy & Security | F7 | 4 / 2.5 / 0.45 / 9 |
| 9 | Real-time auditable data-flow dashboard | Privacy & Security | F8 | 5 / 2 / 0.55 / 5 |
| 10 | Vendorless zero-knowledge sync (user-supplied storage) | Sync & Portability | F9 | 4 / 2 / 0.5 / 5 |
| 11 | Cognitive-load indicator + AI-driven page simplification | Accessibility | F10, F11 | 5 / 2.5 / 0.45 / 6 |
| 12 | Sensory profiles (save/switch complete preference sets) | Accessibility | F10 | 5 / 2 / 0.55 / 4 |
| 13 | Executive-function + ADHD-aware tab/session scaffolding | Accessibility | F10 | 5 / 2 / 0.5 / 4 |
| 14 | Scriptable privacy contexts (programmable containers pipeline) | Privacy & Security | F11 | 4 / 2 / 0.5 / 6 |

Notes on the compound candidates (#11 highest synthesis value): #11 is the AI × neurodivergent compound — it requires *both* local inference (for privacy) and deep accessibility integration, neither of which exists alone in any browser, which is exactly why it is whitespace and exactly why it is differentiated. #14 is the privacy × power-user compound.

---

## 4. Competitive / Whitespace Notes

- **Brave** is the consistent frontier reference: BYOM (one local model, manual switch), Leo memories, AI Browsing in Nightly with isolated profile + alignment model, fingerprint randomization, E2E Sync. It defines the ceiling Aether must clear — and explicitly publishes that agentic browsing is "inherently risky," which is both validation and warning.
- **Chrome** ships the only mainstream on-device AI (Gemini Nano) and the only MCP-adjacent surface (WebMCP, page-facing). Both are narrow and locked; the browser-facing protocol layer is open whitespace.
- **Vivaldi** owns the power-user linear-automation frontier (Command Chains) and session save/restore but has no branching, conditionals, or scoped bookmarks.
- **Nyxt** is the only genuinely keyboard-first/programmable browser (tree history, REPL) but is disqualified for daily driving by web-compat and stability (corroborated by v1 power-user discovery memory/crash findings).
- **Firefox containers + Mozilla VPN** is the privacy-isolation frontier but stops at per-container, not per-tab; `contextualIdentities` enables only partial scripting.
- **Mullvad/Tor** define the uniform-anonymity approach — and their existence is the strongest *counter-argument* to Aether's adaptive-fingerprinting instinct (anonymity-set math).
- **Helperbird** is the entire neurodivergent "market" today, and it is an extension doing CSS overlays — meaning the neurodivergent-first *browser* category is genuinely empty. This is the clearest inertia-driven whitespace and the most defensible differentiation for Aether given the project's stated neurodivergent mandate.
- **Arc** (sunset 2024-2025) is the cautionary anchor: the most ambitious workspace/session browser ever built, and it died of the novelty tax. Every session-architecture and workspace candidate here inherits that warning.

**Synthesis position**: Aether's defensible whitespace is not any single gap (each has a competitor inching toward it) but the *composition* — being the one browser that is simultaneously AI-native, privacy-architectural, keyboard-first, and neurodivergent-aware, with those primitives composable. The compound gaps (F11) are unserved because no incumbent owns both halves; that is the moat.

---

## 5. Risks

1. **Novelty tax (top risk).** Arc's post-mortem: <5.52% of DAUs used >1 Space, 0.4% used Calendar-on-hover. Most whitespace candidates (session branching, modal vim, scriptable pipelines, sensory profiles) are power-user/niche features that risk being dead weight. Mitigation: gate every candidate on a "will >20% of daily users touch this?" test; ship discoverable-when-needed, never forced-at-first-run. Source: `outputs/.drafts/browser-failure-redteam-cited.md` (Josh Miller May-2025 post-mortem).
2. **Security barriers are real, not inertia.** Agent runtime (F1), scriptable pipelines (F6), per-tab routing (F7), and extension supply-chain verification (F9) all *expand* attack surface; prompt injection is described by the field (and Brave) as frontier/unsolved. Building these without solving the barrier ships a differentiated liability. Mitigation: pair each with an explicit threat model and default-deny posture.
3. **Privacy paradox.** Persistent AI memory, semantic history, and executive-function time-tracking (F3, F10) require collecting exactly the data that makes a breach catastrophic. Mitigation: local-only by construction, with a provable no-exfiltration guarantee (TEE/attestation), or do not build.
4. **Anonymity-set inversion.** Adaptive per-site fingerprinting and threat-model presets (F7) can *reduce* anonymity (differing protection becomes a distinguishing signal) and create false confidence. This is a genuine argument *against* a flagship-looking feature. Mitigation: prefer uniform protection by default; offer adaptivity only as an explicit, well-explained opt-in.
5. **Engineering complexity vs. team scale.** Session branching (snapshotting tabs, scroll, form state, cookies, storage, service workers), per-tab networking (multiple network stacks), and AI × accessibility compounds are each large. Arc had a full team on session architecture for years and still failed. Mitigation: sequence behind cheaper, higher-reach wins; reuse engine primitives (Containers, profiles) rather than rebuilding.
6. **Validation thinness.** Provenance notes degraded mode: single round, no subagent fan-out, web-search providers rate-limited; niche/recent browsers (Ladybird, Beam, Sidekick) may be unchecked, and several gaps (e.g., semantic history) are asserted from *absence* across product pages, not exhaustive verification. The ~15-20% neurodivergent-population figure is an unsourced estimate. Mitigation: treat F-claims as strong leads, re-verify before committing build effort; do not over-anchor on uncited population sizing.
7. **Subjectivity / nannying risk in neurodivergent features.** "Cognitive load" has no validated universal metric, and executive-function scaffolding edges into wellness-app/nanny territory with its own surveillance data. Mitigation: co-design with neurodivergent communities; make all scaffolding opt-in and local.

---

## Sources Index

| # | Source | URL |
|---|--------|-----|
| 1 | Brave AI Browsing | https://support.brave.app/hc/en-us/articles/41240379376909 |
| 2 | Brave Security & Privacy in Agentic Browsing | https://brave.com/series/security-privacy-in-agentic-browsing/ |
| 3 | Brave BYOM | https://support.brave.app/hc/en-us/articles/34070140231821 |
| 4 | Chrome Built-in AI APIs | https://developer.chrome.com/docs/ai/built-in-apis |
| 5 | Chrome Built-in AI (WebMCP) | https://developer.chrome.com/docs/ai |
| 6 | Brave Leo | https://brave.com/leo/ |
| 7 | Brave Multi-Tab Context | https://support.brave.app/hc/en-us/articles/38614934646029 |
| 8 | Tridactyl | https://tridactyl.xyz/ |
| 9 | Nyxt Browser | https://nyxt-browser.com/ |
| 10 | Vivaldi Command Chains | https://vivaldi.com/blog/command-chains/ |
| 11 | Vivaldi Features | https://vivaldi.com/features/ |
| 12 | Firefox Multi-Account Containers | https://support.mozilla.org/en-US/kb/containers |
| 13 | Brave Privacy Features | https://brave.com/privacy-features/ |
| 14 | Mullvad Browser | https://mullvad.net/en/browser |
| 15 | Helperbird Features | https://www.helperbird.com/features/ |
| 16 | W3C Cognitive Accessibility (COGA) | https://www.w3.org/WAI/cognitive/ |
| 17 | Aether red-team pre-mortem (Arc novelty tax) | outputs/.drafts/browser-failure-redteam-cited.md |
| 18 | Source brief | outputs/browser-feature-whitespace.md |
