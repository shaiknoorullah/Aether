# AI-Native Browsers 2026 — Competitive Department Report

**Team:** comp-ai-browsers (department: competitive)
**Mandate:** AI-native browsers 2026 (Dia, Comet, Brave Leo, Opera Aria/Neon, SigmaOS Airis, Arc successors): AI features, architecture, model strategy, pricing, privacy.
**Compiled:** 2026-06-10 · Feynman research pipeline (synthesis lead)
**Primary source brief:** `outputs/ai-browsers-2026-comparison.md` · supporting drafts: `outputs/.drafts/browser-feature-whitespace-cited.md`

---

## 1. Executive Summary

Six AI-native browsers now span four strategic archetypes, and the field has **not** converged on what an AI browser should be:

- **AI-first replacements (Dia, Perplexity Comet)** rebuild the browser *around* an LLM and route user intent through it. Dia is the open-sourced-Arc successor, now Atlassian-owned and pivoting toward enterprise; it is deliberately **non-agentic** (it built then pulled a cookie-based agent over UX/safety discomfort). Comet is the most aggressively agentic but the **worst on privacy** — its CEO publicly stated the browser exists partly to collect out-of-app data for hyper-personalized ads.
- **Privacy-first AI overlay (Brave Leo)** is the only product with **structurally verifiable privacy**: zero retention, self-hosted models (no data to Anthropic/OpenAI infra since mid-2025), TEE-verified inference (NEAR AI / Nvidia), no account required, and BYOM via Ollama/LM Studio. It has the broadest platform coverage (all 5) and cheapest premium ($14.99/mo). It has **no agentic mode** in stable.
- **Tiered AI ecosystem (Opera AI free + Neon $19.90/mo)** serves mass users free AI and monetizes power users with an agentic premium browser. Neon is the **only browser with shipped MCP support** (MCP Connector, Mar 2026) and the deepest shipped agentic stack (Browser Operator, Tasks workspace, ODRA deep-research agent).
- **Mac-native productivity niche (SigmaOS Airis)** is a WebKit/SwiftUI macOS-only workspace browser using AI as a monetization lever; strong single-page context UX, weakest privacy disclosure, no agentic depth, no cross-platform path.

**The single most consequential cleavage is privacy architecture, not features.** Every product claims "no training on user data," but only Brave provides cryptographic verification; everyone else relies on provider agreements or self-attestation. The largest unoccupied quadrant in the entire category is **"Safe Agents" — deep agentic autonomy combined with verifiable privacy** — which no shipping product occupies. Secondary shared gaps: no public developer API for browser AI, universal opacity on rate limits/SLAs, no MCP *client* (Opera is server-only), no enterprise tier, and zero cross-platform agentic browser with Linux support.

---

## 2. Key Findings (each with source)

### Architecture & engine

1. **Chromium is the de facto monoculture; only SigmaOS diverges.** Five of six products are Chromium/Blink+V8; SigmaOS is the sole WebKit/SwiftUI outlier, which forces macOS-only delivery. This standardization is driven by web compatibility and the extension ecosystem. — https://medium.com/codetodeploy/the-architecture-of-agency-a-technical-deep-dive-into-ai-native-browsers-fa59eb31586e

2. **Comet is an instrumented Chromium with a custom extension + internal IPC, and it has a documented prompt-injection attack surface.** Zenity Labs reverse-engineered the architecture; Trail of Bits' Feb 2026 threat-model audit found prompt-injection exposure in the agentic layer. — https://labs.zenity.io/p/perplexity-comet-a-reversing-story · https://blog.trailofbits.com/2026/02/20/using-threat-modeling-and-prompt-injection-to-audit-comet/

3. **No product has achieved meaningful fully-local inference for complex tasks.** All rely on cloud API calls for anything beyond summarization; local/on-device use is limited to quantized summarization models. — https://medium.com/codetodeploy/the-architecture-of-agency-a-technical-deep-dive-into-ai-native-browsers-fa59eb31586e

### AI features & agentic capability

4. **Sidebar page-aware chat is now table stakes, not differentiation.** Every product has converged on a sidebar chat that sees the current page; differentiation has moved up to multi-tab reasoning, agentic execution, and cross-tool context. — `outputs/ai-browsers-2026-comparison.md` §4 (Areas of Agreement)

5. **Opera Neon ships the deepest agentic stack and the only MCP support in the category.** Browser Operator does autonomous DOM interaction; Tasks workspace, Cards power-ups, and the ODRA deep-research agent (Oct 2025) extend it; the MCP Connector (Mar 2026) lets external AI clients drive the browser, with read tools on by default and write tools opt-in. — https://blogs.opera.com/news/2025/09/opera-neon-agentic-ai-browser-release/ · https://investor.opera.com/news-releases/news-release-details/opera-announces-deep-research-agent-opera-neon · https://press.opera.com/2026/03/31/opera-neon-adds-mcp-connector/

6. **Dia deliberately abandoned agentic DOM automation, treating it as a security/UX risk** — it built a cookie-based agent, then pulled the demo citing user discomfort. Its differentiation is instead cross-tool SaaS context (Slack/Notion/Gmail/Calendar) and inline editing. — https://www.theverge.com/web/685232/dia-browser-ai-arc

7. **Brave Leo has no autonomous web actions in stable; it is reactive (chat/summarize/generate/research) only.** Its differentiation is privacy + model breadth + BYOM, not agency. — https://brave.com/leo/

8. **Dia has the strongest proactive security posture observed:** its team discovered a prompt-injection data-exfiltration attack in `fetch_web_content`, unlaunched the feature before public beta, rebuilt it with URL-provenance controls, then relaunched. — https://diabrowser.com/security/bulletins

### Model strategy

9. **No consensus on whether owning a model matters.** Brave proxies open/third-party models (Mixtral, Qwen 3, Llama, GPT-OSS free; Claude Sonnet 4, DeepSeek R1 premium); Perplexity bets on proprietary Sonar + orchestration; Dia routes opaquely over third-party APIs and refuses to build models; Opera Neon runs a model-agnostic router (OpenAI/Google/Meta Llama 4 Maverick/Qwen3-Next as of Jan 2026). — https://brave.com/blog/automatic-mode-leo/ · https://blogs.opera.com/news/2026/01/llama-and-qwen-new-ai-models-in-opera-neon/

10. **Only Brave offers user model selection + BYOM/local inference; everyone else is opaque or cloud-only.** Brave supports Ollama, LM Studio, and remote API keys; Dia gives zero user visibility into which model handles a query. — https://brave.com/leo/ · https://tidbits.com/2025/08/08/dia-ai-browser-introduces-20-monthly-pro-plan-with-unlimited-chat/

### Pricing

11. **AI browsing pricing spans $0 to $200/mo with no market consensus.** Free: Brave Leo (no account), Opera AI (bundled). Mid: Brave Leo Premium $14.99/mo (5 devices, cheapest+most transparent), Opera Neon $19.90/mo, SigmaOS Pro $20 / Max $30, Perplexity Pro $20. Top: Perplexity Max $200/mo for the full background agentic assistant. Dia Pro ($20/mo) is being phased out post-Atlassian (May 2026). — https://techcrunch.com/2025/12/11/opera-wants-you-to-pay-20-a-month-to-use-its-ai-powered-browser-neon/ · https://www.perplexity.ai/hub/blog/comet-is-now-available-to-everyone-worldwide · https://piunikaweb.com/2026/05/15/dia-appears-to-be-quietly-phasing-out-its-pro-subscription/

### Privacy posture

12. **Perplexity Comet is the starkest claim-vs-evidence gap in the category:** it markets "privacy and security at the core" with a Privacy Snapshot tool, while its CEO publicly described collecting browsing data even outside the app to sell hyper-personalized ads. — https://techcrunch.com/2025/04/24/perplexity-ceo-says-its-browser-will-track-everything-users-do-online-to-sell-hyper-personalized-ads/ · https://proton.me/blog/ai-browsers-perplexity-chrome-privacy

13. **Brave is the only product with verifiable, structural privacy:** no chat-log retention, no cross-session persistence unless the user opts into locally-stored personalization, Brave-hosted (not third-party) model serving since mid-2025, unlinkable subscription tokens, and TEE-verified inference via NEAR AI / Nvidia. — https://brave.com/blog/browser-ai-tee/

14. **Opera Neon carries jurisdiction concerns:** context persistence across tabs is a known risk Opera itself documents, there is no external audit, and Opera's Chinese-consortium ownership raises data-governance questions. — https://blogs.opera.com/security/2025/10/opera-neon-understanding-agentic-browser-security/ · https://tostracker.app/document/opera-privacy

15. **SigmaOS Airis has no published AI-specific privacy documentation** — only a general ToS that predates the AI features; data handling for Airis is undisclosed. — https://sigmaos.com/airis

### Platform & ecosystem

16. **Brave Leo has uniquely broad platform coverage (macOS/Windows/Linux/iOS/Android) under one $14.99/mo / 5-device subscription;** Dia and SigmaOS are macOS-only, and Opera Neon's Linux support is unconfirmed. A capable agentic browser with full Linux support has zero current competition. — https://brave.com/blog/leo-android/ · `outputs/ai-browsers-2026-comparison.md` §3.6

17. **No browser exposes a public developer API for its AI features, and no browser is an MCP *client*.** Opera Neon's MCP Connector is the closest proxy but it is a browser-control server, Neon-only, not an AI-invocation API or an MCP client consuming external servers. — `docs/research-data/competitive/ai-browsers.md` §10 · https://press.opera.com/2026/03/31/opera-neon-adds-mcp-connector/

18. **The field is universally opaque on operational reliability** — no product publishes rate limits, SLAs, or uptime metrics; only Opera Neon documents agent self-correction on errors. — `outputs/ai-browsers-2026-comparison.md` §3 / `docs/research-data/competitive/ai-browsers.md` §9

---

## 3. Implied Aether Feature Candidates

Derived from the gaps above. RICE inputs are carried in the structured object accompanying this report.

| # | Candidate | Category | Job-to-be-done | Basis |
|---|---|---|---|---|
| C1 | **TEE-verified private inference for the agent layer** (cryptographic proof of no-log, no-train, on every agentic action — not just chat) | Privacy & Security | "Let me run autonomous agents without trusting the vendor's privacy claims" | Only Brave has TEE, and only for reactive chat; the top-right "Safe Agents" quadrant (deep autonomy + verifiable privacy) is empty. |
| C2 | **Permission-gated agent runtime** (per-agent, per-capability grants: read tab / fill form / click / network, with audit log) | AI & Agents | "Give an agent exactly the powers I choose and revoke them instantly" | No browser treats agents as first-class with granular tool-use permissions; Comet's prompt-injection surface shows the cost of not having this. |
| C3 | **Cross-platform agentic browser with first-class Linux support** | Core Browsing | "Run the same capable agentic browser on my Linux dev machine" | Dia/SigmaOS macOS-only; Neon Linux unconfirmed; zero competition for Linux-first agentic browsing. |
| C4 | **Public developer API + extension AI SDK for browser AI** (invoke browser AI, register skills/tools from extensions) | Developer Tools | "Build on the browser's AI instead of bolting on my own LLM" | Zero browsers expose this; first mover wins the developer ecosystem. |
| C5 | **MCP client + server** (consume external MCP servers AND expose the browser as one) | Extensibility | "Wire the browser into my existing MCP tool mesh in both directions" | Opera is server-only; no browser is an MCP client. |
| C6 | **Transparent, auditable model routing** (publish which model handled each query + routing criteria) | AI & Agents | "Know and control which model sees my data and answers me" | Every product's routing is opaque (Dia explicitly so); transparency is a trust differentiator. |
| C7 | **BYOM + local-model orchestration at the free tier** (multi-model routing across local Ollama/LM Studio endpoints by task) | AI & Agents | "Use my own/local models and have the browser pick the right one per task" | Only Brave offers BYOM (single endpoint, manual switch, desktop only); no one orchestrates across local models. |
| C8 | **Cross-tool context with no surveillance** (Slack/Notion/Gmail/Calendar context, processed locally / via TEE, no ad monetization) | Productivity | "Brief me across my work tools without my data becoming an ad product" | Dia owns cross-tool context but raises post-Atlassian governance concerns; Comet monetizes data. Structural no-ads commitment is the anti-Comet. |
| C9 | **Proactive prompt-injection defense for agentic browsing** (URL provenance, second-model alignment check, isolated execution) | Privacy & Security | "Don't let a malicious page hijack my agent" | Trail of Bits found injection holes in Comet; Dia's unlaunch-and-rebuild shows the bar; this must be built-in, not bolted on. |
| C10 | **Persistent, local, semantic cross-session AI memory** (vector index of research trajectory, local-only, user-controlled retention) | Workspace & Organization | "Have an AI that remembers my multi-week research, without a cloud profile" | No browser maintains cross-session AI context; doing it locally turns the privacy liability into a differentiator. |
| C11 | **Transparent rate limits + SLA disclosure for AI features** | Performance | "Know what I'm actually paying for before I depend on it" | Universal opacity on limits/SLAs is a category-wide trust deficit. |
| C12 | **Enterprise tier with SSO / team management for browser AI** | Sync & Portability | "Deploy and govern an AI browser across my team" | No enterprise tier exists in any product; Atlassian/Dia signals the demand but hasn't shipped. |

---

## 4. Competitive / Whitespace Notes

- **The empty quadrant is the whole strategy.** Plotting agentic depth vs. privacy score, Neon and Comet sit bottom-right (capable but exposed), Brave sits top-left (private but limited), and the top-right "Safe Agents" cell — capable *and* verifiably private — is vacant. Aether's defensible position is precisely there: pair Opera/Comet-class autonomy with Brave-class verifiable privacy (C1 + C2 + C9).
- **Privacy is architecture, not marketing.** Comet's privacy story collapses under its own CEO's ad-data statement; Brave's holds because it is structural (self-hosting + TEE + unlinkable tokens). Aether should compete on *verifiable* privacy claims, not slogans — publish audits, TEE attestations, and routing logic.
- **Developer ecosystem is wide-open.** No public AI API, no MCP client, no extension AI SDK anywhere in the category. This is the strongest *durable* moat because it compounds via third-party adoption (C4 + C5). Opera's server-only MCP is a partial precedent that validates demand.
- **Engine choice is a contrarian lever.** All six are Chromium (SigmaOS WebKit). The project's evaluated WebExtension/Firefox-native IPC approach (`docs/ipc-research.md`, `outputs/.drafts/agent-safe-browser-ipc-cited.md`) would be architecturally unique and reduce Chromium-monoculture risk — but it is a heavier lift and must be weighed against ecosystem/compatibility cost.
- **Power-user / keyboard-first + deep AI is unserved.** Dia abandoned Arc's power-user depth to chase mainstream; SigmaOS has workspaces but shallow AI. The vim/keyboard-first segment with deep AI integration has no incumbent — ties to the project's broader keyboard-first thesis.
- **Cross-tool context is up for grabs.** Dia's biggest moat (5 SaaS integrations) is simultaneously its biggest liability under Atlassian. A no-surveillance, locally/TEE-processed equivalent (C8) flips Dia's strength into Aether's.
- **Pricing has no anchor.** $0 to $200/mo with no consensus signals Aether has latitude — but Brave's $14.99/5-device transparent tier is the value benchmark to beat or match.

---

## 5. Risks

| # | Risk | Severity | Notes / Mitigation |
|---|---|---|---|
| R1 | **Agentic prompt injection** — the defining security failure of the category (Comet audit, Dia unlaunch). | High | Treat as a first-class threat model from day one (C9): URL provenance, second-model alignment check, isolated execution profile, capability gating. Ship a published threat model. |
| R2 | **TEE + agent autonomy is hard and unproven at scale.** Brave does TEE only for reactive chat; combining it with deep autonomy (the C1 thesis) is novel and may carry latency/cost penalties. | High | Validate TEE inference latency/cost early; phase autonomy behind verifiable-privacy guarantees rather than shipping autonomy first. |
| R3 | **Cloud dependency for complex reasoning.** No competitor has solved fully-local complex inference; a privacy-first posture still leaks at the model-serving boundary unless self-hosted/TEE. | Medium-High | Self-host or TEE-proxy (Brave model); BYOM/local orchestration (C7) for users who want zero cloud. |
| R4 | **Cross-tool integrations create governance + breach liability** (the Dia/Atlassian cautionary tale) and a large attack surface. | Medium-High | Local/TEE processing, explicit no-ad/no-monetization commitment, per-integration scoped permissions. |
| R5 | **Engine strategy risk.** A non-Chromium (Firefox/WebExtension) path is differentiating but risks web-compat gaps, smaller extension ecosystem, and higher maintenance; a Chromium path cedes the contrarian advantage. | Medium | Decision still open per project CLAUDE.md; gate on IPC/compat research before committing. |
| R6 | **Moving-target dependencies.** MCP is young (breaking changes likely); third-party model APIs and pricing shift quarterly (Neon swapped to Llama 4 / Qwen3 in Jan 2026). | Medium | Model-agnostic routing (C6) and a thin MCP abstraction layer to absorb churn. |
| R7 | **Incumbent feature velocity & distribution.** Brave (privacy), Opera (agentic+MCP), and Perplexity (search+capital) move fast and have user bases; Aether enters late. | Medium | Win on the empty quadrant + developer ecosystem (durable moats), not on feature parity races. |
| R8 | **Evidence gaps in the brief.** Dia's post-Atlassian privacy policy and model providers, Comet's full platform matrix, SigmaOS AI privacy, and Neon Linux support are all unverified — competitive assessments may shift. | Low-Medium | Re-verify before any go/no-go; treat single-sourced cells as provisional. |

---

## 6. Sources

Consolidated from the primary brief (`outputs/ai-browsers-2026-comparison.md` §8) and v1 report (`docs/research-data/competitive/ai-browsers.md`). Key sources:

- The Verge — Dia beta launch + CEO/CTO interview: https://www.theverge.com/web/685232/dia-browser-ai-arc
- Dia security bulletins (prompt-injection unlaunch/rebuild): https://diabrowser.com/security/bulletins
- CNBC — Atlassian $610M acquisition of The Browser Company: https://www.cnbc.com/2025/09/04/atlassian-the-browser-company-deal.html
- PiunikaWeb — Dia Pro phaseout (May 2026): https://piunikaweb.com/2026/05/15/dia-appears-to-be-quietly-phasing-out-its-pro-subscription/
- TechCrunch — Perplexity CEO ad-tracking statement: https://techcrunch.com/2025/04/24/perplexity-ceo-says-its-browser-will-track-everything-users-do-online-to-sell-hyper-personalized-ads/
- Trail of Bits — Comet prompt-injection audit (Feb 2026): https://blog.trailofbits.com/2026/02/20/using-threat-modeling-and-prompt-injection-to-audit-comet/
- Zenity Labs — Comet architecture reverse-engineering: https://labs.zenity.io/p/perplexity-comet-a-reversing-story
- Proton — AI browsers and privacy analysis: https://proton.me/blog/ai-browsers-perplexity-chrome-privacy
- Brave — TEE-verified private inference (NEAR AI / Nvidia): https://brave.com/blog/browser-ai-tee/
- Brave — Leo product + Automatic mode: https://brave.com/leo/ · https://brave.com/blog/automatic-mode-leo/
- Opera — Neon agentic release / ODRA / MCP Connector: https://blogs.opera.com/news/2025/09/opera-neon-agentic-ai-browser-release/ · https://investor.opera.com/news-releases/news-release-details/opera-announces-deep-research-agent-opera-neon · https://press.opera.com/2026/03/31/opera-neon-adds-mcp-connector/
- Opera — Neon pricing $19.90/mo: https://techcrunch.com/2025/12/11/opera-wants-you-to-pay-20-a-month-to-use-its-ai-powered-browser-neon/
- Opera — security blog (agentic browser risks) + TOSTracker: https://blogs.opera.com/security/2025/10/opera-neon-understanding-agentic-browser-security/ · https://tostracker.app/document/opera-privacy
- SigmaOS Airis: https://sigmaos.com/airis
- CodeToDeploy — AI-native browser architecture deep dive: https://medium.com/codetodeploy/the-architecture-of-agency-a-technical-deep-dive-into-ai-native-browsers-fa59eb31586e
- Human Security — Atlas vs Comet agentic architecture: http://humansecurity.com/learn/blog/chatgpt-atlas-vs-perplexity-comet-agentic-browsers/

*Verification note: Cells marked "Unverified" in the source brief (Dia post-Atlassian privacy/model providers, Comet platform matrix, SigmaOS AI privacy, Neon Linux) remain provisional and should be re-checked before any go/no-go decision.*
