# Aether Browser — Feature Matrix v2

> **Date**: 2026-06-10
> **Status**: Wave-2 synthesis — compiled from verified candidate set (139 de-duplicated features) and a 5-persona executive council (Product Strategist, Tech Architect, User Advocate, Security Auditor, Devil's Advocate), weighted PS×1.2 / TA×1.2 / others×1.0.
> **Method**: Per-persona RICE normalized to a common log-scaled composite (0–100) before weighting (because personas scored on wildly different native RICE scales — UA up to 900, TA up to ~7). MoSCoW by majority rule (Must requires **3+ Must votes**, else collapses to the plurality, capped at Should). Kano by mode.
> **Predecessor**: `/home/devsupreme/work/aether-browser/docs/feature-matrix.md` (v1, 30 cards). This file does **not** replace v1; it extends and reconciles it.

---

## 1. Executive Summary

Wave-2 confirms v1's spine and sharpens it in three ways. **(1) The table-stakes floor is unchanged and re-validated**: MV3-immune native ad/tracker blocking, WebExtensions compatibility, modern-site compatibility, zero-config hardened privacy defaults, and zero-telemetry trust posture are the top cluster across every persona — these are *exit-reason* features (their absence loses everyone; their presence wins no one alone). **(2) The engine decision crystallized**: the dedicated tech-engine-decision team (surfaced in v2's candidate set) makes a **Gecko/Firefox thin-fork** the load-bearing architectural choice — it ranks #6 overall and is the precondition for nearly every privileged "Must" (chrome-level vim, native blocking, per-tab network identity, WebExtension/AMO inheritance, Xray-isolated agent bridge). **(3) Two entirely new evidence bodies appear that v1 lacked.**

**NEW since v1 — ADHD / executive-function:** v1 had *zero* neurodivergent-specific features. v2 introduces a peer-reviewed-grounded accessibility cluster — non-shaming/task-conditioned focus mode (not timer-based, which causes shame per UBC CHI 2026), first-class typography & cognitive-load controls (CHI 2026 pupillometry shows large ADHD reading-speed effects), ambient time-anchoring (ADHD time-blindness, IJERPH 2023), EF-scaffold side panel (Antshel 2026 RCT), in-context psychoeducation (Selaskowski 2022 — the single highest-confidence digital ADHD finding), and an SDT-audited non-shaming UI-language layer. The user-advocate persona repeatedly elevates these to Must; the devil's-advocate correctly flags much of the evidence as small-n or press-release-accessed. Net: a **distinct, underserved, loyal segment** worth a coherent (opt-in, non-nannying) accessibility identity, but to be shipped honestly without over-claiming therapeutic value.

**NEW since v1 — agent-safety architecture & engine-IPC:** v1 treated AI agents as a hazard to defer. v2 supplies the concrete *safe-agent* substitute for unauthenticated CDP: a layered **WebExtension-messaging + sandboxed Native-Messaging-Host + MCP** control plane, a **permission-gated per-capability agent runtime** (the single most-duplicated candidate — it recurs ~10× across teams, a signal the council converged on it as the agent linchpin), per-tool human-in-the-loop consent (MCP elicitation), Xray-isolated content bridge, sender-validated gateway, and native agent audit logging. Prompt injection remains flagged as possibly-structurally-unsolved.

**Reconciliation with v1:** v1's top features survive (native blocking #1, WebExtensions #2, vertical tabs, workspaces, command palette, BYOM/local-AI, zero-telemetry). v2 *re-weights* by adding the security-auditor and devil's-advocate as full voters, which (a) pushes trust/architecture features (verifiable trust stack, thin-fork, hardened defaults) up, and (b) deflates speculative AI-agent and PKM/canvas features that v1 had not yet stress-tested. Of 139 de-duplicated features: **26 Must, 58 Should, 49 Could, 6 Won't.**

---

## 2. Top-25 Ranked Features

Composite = weighted, scale-normalized cross-persona score (0–100). RICE = weighted representative RICE rescaled to a common ~0–18 band. MoSCoW per 3+-Must majority rule.

| Rank | Feature | Category | RICE | MoSCoW | Kano | One-line |
|------|---------|----------|------|--------|------|----------|
| 1 | Native uBO-class ad/tracker blocking (MV3-immune, cosmetic + scriptlets) | Privacy & Security | 18.2 | Must | Basic | The #1 exit reason from every rival; full-strength blocking below the extension layer. |
| 2 | WebExtensions ecosystem bridge (AMO/CWS compatibility) | Extensibility | 14.2 | Must | Basic | Lacking extensions is the deal-breaker that killed every from-scratch shell; inherited free on Gecko. |
| 3 | Modern-site compatibility guarantee (standard engine + UA mgmt) | Core Browsing | 13.6 | Must | Basic | A daily driver that gets bot-blocked is not a browser; satisfied by forking a real engine. |
| 4 | First-class privacy UI (telemetry-off default, WebRTC/canvas/FPI toggles, no account) | Privacy & Security | 11.3 | Must | Basic | arkenfox-in-the-UI: replaces about:config archaeology with auditable controls. |
| 5 | Zero-config hardened privacy default profile (declarative) | Privacy & Security | 11.1 | Must | Basic | LibreWolf-style hardened-on-first-launch; most users never change defaults. |
| 6 | Gecko-fork chrome-replacement engine (delivery vehicle) | Core Browsing | 12.1 | Must | Indifferent | The architectural keystone: deepest chrome control without C++ patches; small-team maintainable. |
| 7 | Zero-telemetry by default + reproducible builds + non-data business model | Privacy & Security | 10.6 | Must | Basic | Trust is the currency; Firefox PPA/ToS collapse proves the cost of breaking it. |
| 8 | Thin-fork / privileged-extension architecture (minimize upstream patches) | Extensibility | 10.2 | Must | Indifferent | What lets a small team ship and stay patched (Vivaldi ~5% proprietary; Brave abandoned Muon). |
| 9 | Workspace/task org with multi-account profiles | Workspace & Organization | 9.8 | Must | Performance | Arc's $610M exit vacated this segment; 34–39% demand (Shift 2026). |
| 10 | Universal command palette (fuzzy history/bookmarks/tabs/commands) | Productivity | 9.6 | Must | Performance | The keystroke-to-anything primitive; the everyday loop that makes the browser feel fast. |
| 11 | Verifiable trust stack (reproducible builds, public audits, no-account browsing) | Privacy & Security | 9.5 | Must | Basic | Believe the privacy claim without faith; Arc's RCE-via-user-ID did lasting damage. |
| 12 | Process-level native ad/tracker blocker (adblock-rust-class) | Performance | 8.7 | Should | Performance | Faster/more robust than extensions, MV3-immune; the performance upgrade over the uBO theme. |
| 13 | Project-scoped workspaces (tabs/history/state scoped, survive restart) | Workspace & Organization | 9.2 | Must | Performance | Research context across sessions; the knowledge-worker beachhead beyond the Linux niche. |
| 14 | Curated MV2-class extension compatibility for privacy extensions | Extensibility | 8.2 | Must | Basic | Keep uBO/uMatrix/NoScript that Chrome dropped under MV3; a timely switcher magnet. |
| 15 | Cross-platform agentic browser with first-class Linux support | Core Browsing | 8.1 | Must | Performance | Dia/SigmaOS are macOS-only; zero competition for Linux-first agentic browsing — our beachhead. |
| 16 | Privacy-preserving local AI assistant (no retention, no account) | AI & Agents | 7.4 | Must | Basic | Brave Leo made this table-stakes; match it to not look behind. |
| 17 | Local-first AI with hard kill switch (on-device LLM, zero cloud, injection isolation) | AI & Agents | 7.6 | Must | Performance | The architectural spine of AI differentiation; without it we're another surveillance-AI browser. |
| 18 | Sidebar-first vertical tabs + split view + Glance preview | Workspace & Organization | 7.4 | Should | Performance | The convergent winning pattern (Vivaldi/Arc/Zen) that makes us legible to non-vim switchers. |
| 19 | Container-isolated named workspaces (true session + tab isolation) | Workspace & Organization | 6.8 | Must | Performance | Real isolation (Zen-proven), not Arc's cosmetic spaces — a workspace AND privacy win. |
| 20 | Focus/Purpose mode (suppress attention-capture + notification blocking) | Productivity | 7.0 | Should | Performance | Notification blocking is the #3 requested feature (31%); serves mainstream + neurodivergent. |
| 21 | Anti-attention-capture / aggressive reader mode | Core Browsing | 6.9 | Should | Performance | Peer-reviewed reading-speed gains; an opinionated reader that reinforces the calm-web identity. |
| 22 | Focused developer-wedge workspace (deep AI-coding-tool integration) | Developer Tools | 6.9 | Should | Excitement | The anti-Arc GTM thesis: own ONE wedge (browser for AI-coding devs) that overlaps our Linux base. |
| 23 | Tree/hierarchical tabs + named workspaces + fuzzy tab search (200+ tabs) | Workspace & Organization | 6.6 | Should | Performance | Tab management at scale — the #1 broad pain across power users and knowledge workers. |
| 24 | Frictionless Chrome/Firefox migration (one-click import) | Sync & Portability | 6.0 | Must | Basic | Necessary safety net (you can't ask anyone to switch and lose their setup) — floor, not growth lever. |
| 25 | Pre-fetch tracker-loading blocking engine (Tracker-Radar-class, no ad exception) | Privacy & Security | 6.2 | Should | Performance | Block trackers before they load, user-extensible, with no commercial carve-out (vs DDG's bat.bing). |

**Notable just-outside Top-25:** Graduated tab lifecycle (#26), OpenAI-compatible local-AI gateway (#27, Must — cheapest highest-leverage local-AI primitive), Rapid security cadence + upstream-lag indicator (#28, Must), Permission-gated agent runtime (#29, Must — the consolidated agent keystone), Per-tool human-in-the-loop consent (#30, Should).

---

## 3. The Engine Decision: Gecko vs Chromium vs Custom Shell

The v1 matrix assumed Gecko; v2's `tech-engine-decision` team makes the case explicit and load-bearing. **Recommendation: Gecko/Firefox thin-fork (LibreWolf/Zen-class overlay).**

### Why Gecko wins (per tech-architect scoring)
- **Privileged chrome customization without C++ changes.** A Gecko thin-fork edits `browser.xhtml` and privileged JS — enough to deliver chrome-level modal vim (intercepting keydown *before* the accelerator table, which Chromium would require accelerator-table patches for), zero-chrome UI shells, vertical tabs, and split view. Zen proves the substrate at ~5–8 contributors.
- **WebExtension/AMO inherited nearly free** (Top-25 #2) — the single biggest "I can't switch" objection (qutebrowser #30) evaporates. Chromium gives CWS instead, but loses the Firefox-only privacy APIs below.
- **Firefox-only APIs with no Chrome equivalent**: blocking `webRequest` preserved under MV3 (→ MV3-immune blocking, #1), `contextualIdentities` (→ real container workspaces, #19), `proxy.onRequest` dynamic routing (→ per-tab network identity), `dns`, `pkcs11`. These directly enable five separate Must/Should features.
- **Agent-safety primitives are Gecko-native**: Xray vision (C++ DOM access defeating prototype-poisoning) gives a hijack-resistant content/page bridge that Chromium cannot match cleanly.
- **Maintainability / survival**: the thin-fork posture (#8, unanimous Must) is what keeps a small team patched. Mozilla spends $290M/yr for 2.19% share; Vivaldi survives at ~5% proprietary code; Brave abandoned its Muon fork over maintenance burden. A thin Gecko overlay (LibreWolf ships within days of upstream) is the only viable small-team architecture.

### Why not Chromium
- MV3 cripples the exact blocking/privacy extensions our audience demands (the migration trigger we're capitalizing on). Re-enabling MV2-grade power on Chromium means maintaining a backend Brave-style — possible but against the grain.
- No `contextualIdentities`/blocking-webRequest equivalents; deeper C++ patches needed for chrome-level keyboard control.
- Inherits Google's structural control over the engine roadmap — anathema to the privacy thesis.

### Why not a custom shell
- Forfeits "modern-site compatibility" (#3) — a from-scratch engine gets systematically bot-blocked (the qutebrowser failure mode) and loses WebExtensions entirely. The devil's-advocate is blunt: a custom shell is the trap that put every from-scratch contender in the graveyard.

### Honest caveats (devil's-advocate + risk register)
- A Gecko fork still means **perpetual upstream-merge labor** and rides Gecko's declining market reality (Firefox 2.19% share, Mozilla funding dependent on the Google search deal).
- **Internal tension**: chrome-level vim and process-level native blocking demand *deeper* patches than a strict "thin fork" ideal allows. The patch-diff budget must be actively managed per release; this is the dominant ongoing cost either way.
- WebDriver-BiDi (+RDP adapter) is offered only as a niche dev-compat surface and should be **off by default** (it's "designed for testing, not agent sandboxing").

---

## 4. Gap / Whitespace Analysis

Where Aether can be genuinely first (corroborated across v1 Gaps 1–6 and the v2 synthesis/whitespace team). Distribution of Must/Should features skews **Privacy & Security (22)** and **AI & Agents (14)** — the two axes of the product thesis.

1. **Chrome-level modal vim with website key-capture immunity** (Top-25 #44; v1 Gap 1/4). No GUI competitor implements true modal input at the engine level; Tridactyl/Vimium are structurally barred from chrome (about:, PDF, settings) and lose key-arbitration wars on SPAs. Zen only added urlbar Ctrl+J/K. Wide moat (2–3 yr). *Caveat:* the council's heaviest single duplication and the devil's-advocate's loudest "niche-of-a-niche" warning — own it, but as opt-in identity, not default.
2. **Permission-gated, per-capability agent runtime** (Top-25 #29; the most-duplicated candidate, ~10 appearances). No browser treats agents as first-class permissioned principals; Brave Nightly is a single autonomous session. This is the safety model that makes native agents acceptable. *Unsolved dependency:* prompt injection may be structurally unmitigable — ship best-effort defense-in-depth (provenance tagging, second-model alignment check, isolated execution) and market it honestly.
3. **Local-first AI with verifiable zero-exfiltration** (v1 Gap 3). The whitespace team names "fully local AI with rich browser context + zero exfiltration" as THE unfilled gap. Combine the OpenAI-compatible local gateway (#27) + per-site permissioned context + kill switch. Only Brave does single-endpoint BYOM; no one orchestrates locally or persists local cross-session memory.
4. **Theming-aware fingerprint isolation** (security-auditor elevated). No fork reconciles deep ricing with crowd-uniformity (Mullvad actively discourages theming because it breaks crowd-hiding). Sandboxing the UI layer from the fingerprintable surface serves our ricer AND privacy segments simultaneously — genuinely novel. *Caveat:* may be hard to do safely (CSS/timing leaks).
5. **No-cloud, account-free, E2E-encrypted CRDT sync** (#41; v1 Gap absent). Every browser sync is vendor-bound (Brave) or account-bound (Firefox). Yjs+value-level encryption (Proton Docs-proven) with QR pairing, seed-phrase + social recovery, forward-secret device revocation, and a self-hostable relay is the privacy-user grail. Consolidate the ~9 duplicate sync candidates into ONE engine.
6. **ADHD / executive-function browser layer** (entirely NEW vs v1). No browser ships non-shaming task-conditioned focus, ambient time-anchoring for time-blindness, EF-scaffold side panels, or sensory profiles at the browser (not extension-CSS) level. Underserved, loyal segment. Best-evidenced anchor: in-context psychoeducation (Selaskowski 2022 RCT). *Caveat:* "nannying/wellness-app" risk and ADHD heterogeneity — opt-in, gentle, no over-claiming.
7. **Verifiable transparency** (#11, #28, transparent outgoing-connection ledger). Reproducible builds + public audits + an auditable connection ledger + telemetry-free signed auto-update directly answer the Zen "no-telemetry"-contradicted-by-a-telemetry-connection failure and LibreWolf's no-auto-update gap.
8. **Public AI/extension SDK + browser-level MCP** (v1 Gap 6 extended). "No browser has a public developer API for its AI features — the largest shared category gap." Browser-level MCP (not page-facing WebMCP) wires Aether into the agent tool-mesh both ways.

---

## 5. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | **Agent-theme over-weighting** — the permission-gated-agent runtime appears ~10× across teams; naive aggregation over-prioritizes an unproven agentic future. | High | Medium | Treat as ONE epic (done here via de-dup). Gate roadmap weight on observed agent adoption; ship the safe substrate, not autonomous-agent marketing. |
| 2 | **Prompt injection may be structurally unsolvable** — Mind the Web / Cato WebPromptTrap demonstrate live exploits; Dia rebuilt fetch, Comet had holes. | High | Critical | Never claim "solved." Layered defense (provenance tagging, second-model alignment, isolated execution, per-tool consent). Human-in-the-loop for submit/payment/auth. Market honestly. |
| 3 | **Gecko-fork sustainability** — Firefox 2.19% share; Mozilla funding depends on the Google deal; perpetual merge labor. | Medium | Critical | Thin-fork discipline (#8); track patch-diff budget per release; build in-team Gecko expertise; contingency migration horizon (2+ yr). |
| 4 | **Privacy-AI quality tension** — local LLMs need 16GB+ RAM and trail cloud quality; users may pick Chrome+ChatGPT over Aether+local. | Medium | High | Hardware-aware recommender + graceful degradation (#40-band); OpenAI-compatible gateway makes the tradeoff user-owned; cloud opt-in with disclosure. Don't force local-only. |
| 5 | **Switchable/adaptive anti-fingerprinting can backfire** — modifying RFP metrics "could make it useless"; relaxing per-origin makes users MORE unique. | Medium | High | Ship safe crowd-uniformity default; treat randomization/per-site as advanced, well-warned options. Don't market adaptive RFP as strictly stronger. |
| 6 | **ADHD/EF features lean on thin evidence** — several cite small-n studies or press-release-accessed papers; "wellness-app/nannying" backfire and ADHD heterogeneity. | Medium | Medium | Lead with the best-evidenced item (Selaskowski RCT). Opt-in, non-shaming, deferrable, zero-penalty. No therapeutic claims (no LLM ADHD-coaching RCT exists). |
| 7 | **Zero-telemetry handicaps product decisions** — can't measure usage to prune dead features (vs Arc's 0.4% Calendar-on-Hover bloat); conflicts with the kill-switch framework. | Medium | Medium | Local-only / strictly opt-in, GitHub-published analytics question set (Brave-P3A but opt-in). Usage telemetry, if any, must be local and user-visible. |
| 8 | **Niche-within-a-niche (Arc's death)** — keyboard-first + Linux + privacy + ADHD is several small segments; sprawl risks repeating Arc. | Medium | High | Concentrate on the developer-wedge (#22) as launch positioning; opt-in vim; command palette as the universal entry. Cut ruthlessly via the kill-switch framework. |
| 9 | **Sync/agent-IPC = invisible plumbing presented as features** — many Could/Indifferent items are sub-features of two engines (sync, agent control plane); double-counting inflates effort. | Medium | Medium | Build ONE canonical E2EE/CRDT sync engine and ONE layered agent control plane; treat pairing/recovery/relay/handoff as properties of them, not separate builds. |
| 10 | **Custom-shell / non-standard-engine temptation** — would forfeit modern-site compat and WebExtensions (the graveyard pattern). | Low | Critical | Decision locked: Gecko thin-fork. Reject custom shell and (for our thesis) Chromium. |
| 11 | **Distribution wall** — 86% of market locked by OS defaults, Chrome ~70%; one-click import is a floor, not a growth lever. | High | High | Don't treat migration as growth. Win via a concentrated wedge community (devs/Linux/privacy) and evangelism, not feature breadth. |
| 12 | **Vendor/funding model** — no privacy browser reached profitability without ads/corporate/crypto backing; a "non-data business model" needs a real revenue source. | High | Critical | Define revenue before Phase 2 (premium cloud-AI access, enterprise licensing, optional paid sync); never conflict with the zero-telemetry/no-surveillance promise. |

---

*Aggregation method note: per-persona RICE values were log-scaled and min-max normalized within each persona before weighted averaging, preventing the User-Advocate's large native-scale scores from dominating. MoSCoW Must requires ≥3 Must votes among scoring personas; otherwise the plurality is taken and any Must plurality below threshold is capped at Should. Kano is the modal vote. Full computed table: 139 features (26 Must / 58 Should / 49 Could / 6 Won't).*
