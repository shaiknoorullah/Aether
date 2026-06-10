# Competitive Analysis: Browser AI Extensions & Agent Infrastructure (2026)

**Team**: `comp-ai-ext-agentinfra` (Department: Competitive)
**Mandate**: Browser AI extensions (Monica, Sider, Merlin, HARPA, MaxAI) + agent infrastructure (browser-use, Playwright MCP, Stagehand, Browserbase, MultiOn) — capabilities, architecture, control, reliability.
**Primary source**: `outputs/browser-ai-agents-2026-comparison.md` (Feynman brief, 2026-06-10, every claim traced to a direct source URL).
**Sibling drafts referenced**: `browser-feature-whitespace-cited.md`, `browser-failure-redteam-cited.md`, `agent-safe-browser-ipc-cited.md`.

---

## 1. Executive Summary

The browser-AI space has split cleanly into two tiers that no longer compete on the same axis. **Tier A — consumer extensions** (Monica, Sider, Merlin, HARPA, MaxAI, Perplexity) live inside the extension sandbox and offer passive AI assist: sidebar chat, page summarization, multi-model access, and writing help. They have converged so tightly that multi-model aggregation (GPT, Claude, Gemini in one panel) is now commoditized table-stakes, and differentiation survives only at the margins — HARPA's true RPA automation engine, Sider's Wisebase persistent knowledge layer, and Merlin's compliance + 200-country reach. **Tier B — agent infrastructure** (browser-use, Playwright MCP, Stagehand, Browserbase) gives developers full CDP/Playwright control of the page; browser-use (79k+ GitHub stars) and Stagehand dominate OSS, Browserbase is the dominant cloud substrate, and Playwright MCP is the de-facto low-level MCP server. MultiOn — once a flagship agent API — has **pivoted entirely to on-device mobile AI** and is off the table.

The single most important structural finding for Aether is the **control-depth chasm**: Tier A extensions can never reach CDP/Playwright-level page access, while Tier B tools cannot run inside a real, signed-in, stealth-inherent browser. Aether — by being the browser — can collapse both tiers: it can expose HARPA-style native automation *and* a Stagehand-style agent SDK *and* a Playwright-MCP-style integration surface, all sharing one trusted browser context, with local-model execution that no cloud-dependent Tier A competitor can credibly match. The whitespace and red-team drafts confirm this is genuine open space (no shipping browser exposes a permission-gated agent runtime) but also flag that prompt-injection security is the unsolved blocker, not a feature gap.

---

## 2. Key Findings (each with a source URL)

### Finding 1 — Multi-model aggregation is fully commoditized
Every Tier A extension ships simultaneous GPT / Claude / Gemini (plus DeepSeek, Grok, Llama) access. This is no longer a differentiator; differentiation has moved to automation, knowledge persistence, and privacy architecture.
- **Source**: https://monica.im/pricing ; https://sider.ai/pricing ; https://www.getmerlin.in
- **Confidence**: HIGH

### Finding 2 — HARPA is the only extension bridging Tier A and Tier B
HARPA's hybrid RPA+AI engine is the only consumer extension with genuine browser automation: navigate, click, fill forms, scrape/extract, run multi-step command sequences, web monitoring, price tracking, and IFTTT chains into Zapier/Make/n8n. Its parameter model (`{{page}}`, `{{transcript}}`, `{{selection}}`, chunking) is a direct design reference for Aether's native automation surface.
- **Source**: https://harpa.ai ; https://harpa.ai/pricing
- **Confidence**: HIGH

### Finding 3 — Privacy via local execution is an uncontested differentiation vector
Among Tier A, only HARPA makes a technically credible local-execution privacy claim (runs locally, does not log conversations, supports local Llama). Monica, Sider, and Merlin are cloud-only. GDPR / ISO 27001 / SOC 2 certifications are now table-stakes for enterprise, not differentiators. MaxAI's "100% privacy-friendly" claim is an unaudited user testimonial.
- **Source**: https://harpa.ai ; https://www.maxai.me
- **Confidence**: HIGH

### Finding 4 — Sider's Wisebase is the only real persistent knowledge layer
Wisebase (save highlights, query across PDFs/chats/web clips, meeting summaries) is architecturally distinct from pure chat assistants. It is the closest existing approximation of cross-session browser memory, but it is manual save, not automatic capture.
- **Source**: https://sider.ai
- **Confidence**: HIGH

### Finding 5 — Playwright MCP is the standard low-level browser-control MCP server
`@playwright/mcp` exposes 35+ browser tools over MCP using the **accessibility tree** (structured data, no screenshots by default), making it token-efficient and hallucination-resistant — it can't click pixels that don't exist. It is deterministic but brittle on canvas/image-heavy or poorly-accessible pages, and has no self-healing, CAPTCHA handling, memory, or scheduling.
- **Source**: https://github.com/microsoft/playwright-mcp
- **Confidence**: HIGH

### Finding 6 — Stagehand's act/extract/observe/agent is the cleanest agent API surface
Stagehand's four primitives let a developer choose code-precision vs NL-flexibility per step, with Zod-typed structured extraction and **auto-caching + self-healing** (AI re-engages when a cached path breaks). It is the most production-viable web-agent SDK, but is TS-first (Python port lags) and tightly coupled to Browserbase for production stealth.
- **Source**: https://github.com/browserbase/stagehand ; https://docs.stagehand.dev/v3/first-steps/introduction
- **Confidence**: HIGH

### Finding 7 — browser-use is the default OSS agent and has the broadest LLM roster
browser-use (79k+ stars) wraps Playwright/CDP, supports the widest LLM set (OpenAI, Anthropic, Google, Mistral, Ollama, Groq, DeepSeek, Cerebras, Bedrock, Azure, OpenRouter, LiteLLM), ships watchdogs (CAPTCHA, crash, DOM, downloads), persistent filesystem/memory, and an **open benchmark (BU Bench V1, 100 tasks)**. A Rust core (`browser_use.beta`) targets production reliability.
- **Source**: https://github.com/browser-use/browser-use ; https://docs.browser-use.com/open-source/introduction
- **Confidence**: HIGH

### Finding 8 — Browserbase solves the wrong problem for a real browser
Browserbase exists to give *stealth cloud browsers* to agents running outside a real browser — solving CAPTCHA, proxy rotation, concurrency, session isolation (SOC2; HIPAA enterprise; 100K devs, 800K weekly SDK downloads). Aether *is* the browser, so stealth is inherent and this layer is unnecessary overhead — but its **Model Gateway** (unified multi-LLM billing) and session-recording/observability patterns are worth studying.
- **Source**: https://www.browserbase.com ; https://www.browserbase.com/pricing
- **Confidence**: HIGH

### Finding 9 — Self-healing automation is the universally unsolved problem
Traditional frameworks (Playwright, Puppeteer) break when selectors/DOM change; this is the explicit reason Stagehand and browser-use exist. Self-healing (re-finding targets when a page changes) is the reliability frontier across all of Tier B.
- **Source**: https://docs.stagehand.dev/v3/first-steps/introduction
- **Confidence**: HIGH

### Finding 10 — MultiOn has pivoted; do not plan integrations
multion.ai now presents "AGI-0", an on-device smartphone AI product; the original browser-agent API is no longer referenced. Treat it as discontinued.
- **Source**: https://www.multion.ai
- **Confidence**: HIGH (pivot confirmed from official site)

### Finding 11 — No consumer extension ships a supported public developer API
The entire Tier A field is closed-surface; HARPA's paid CloudAI API (S plan, "Server API" still planned) is the sole exception. Developers must drop to Tier B infra to get programmatic control — a fragmentation Aether can collapse.
- **Source**: https://harpa.ai/pricing
- **Confidence**: HIGH

### Finding 12 — Opaque credit systems are a consistent cross-vendor pain point
Sider, Monica, Merlin, and MaxAI all use credit/token systems with "unlimited" plans that users find confusing and unpredictable; top tiers are expensive ($82.9/mo Monica Ultra, $133.3/mo Sider Ultra).
- **Source**: https://monica.im/pricing ; https://sider.ai/pricing
- **Confidence**: HIGH

---

## 3. Implied Aether Feature Candidates

| # | Feature | Category | JTBD | Source / Rationale |
|---|---------|----------|------|--------------------|
| 1 | Native browser automation engine (HARPA-style RPA+AI command sequences with `{{page}}`/`{{selection}}` params, chunking, IFTTT/webhook triggers) | AI & Agents | Automate repetitive multi-step web tasks without external infra | HARPA is only extension with this; no browser ships it natively |
| 2 | Built-in agent SDK with act/extract/observe/agent primitives + Zod-typed extraction | Developer Tools | Let developers script the browser at code-or-NL granularity per step | Stagehand's API surface, native to the browser context |
| 3 | First-class MCP server exposing accessibility-tree browser control to any LLM host | AI & Agents | Plug Aether into Claude Desktop / Cursor / Codex as a tool surface | Playwright MCP is the standard; native = token-efficient, no external proc |
| 4 | Self-healing action layer (auto-cache repeatable actions, re-engage AI on DOM change) | AI & Agents | Keep automations working when sites change | Universally unsolved; Stagehand + browser-use core value prop |
| 5 | Permission-gated agent runtime (per-agent grant/revoke: read tab, fill form, click, network) with second-model alignment check | Privacy & Security | Run autonomous agents safely against prompt injection | No browser ships this; whitespace draft + Brave's risk acknowledgment |
| 6 | Local-model execution + multi-model routing (Ollama/llama.cpp; route task→model) | AI & Agents | Use AI on sensitive pages without data leaving the device | Only HARPA local-claims in Tier A; no browser auto-routes models |
| 7 | Automatic persistent cross-session knowledge layer (Wisebase done right — auto-capture, semantic query) | Workspace & Organization | Recall research trajectory across sessions/weeks | Sider Wisebase is closest but manual; no auto cross-session memory exists |
| 8 | Broad LLM provider roster via unified gateway (BYOK, unified usage view) | AI & Agents | Use any model without managing N API keys/credit systems | browser-use roster + Browserbase Model Gateway pattern |
| 9 | Transparent BYOK / flat pricing (no opaque credits) | Productivity | Predictable AI cost | Cross-vendor credit-system pain point |
| 10 | Agent observability: session recording, GIF/replay traces, run logs, built-in task benchmark | Developer Tools | Debug and trust what an agent did | browser-use BU Bench + Browserbase session recording patterns |
| 11 | Source-cited answer mode (show source, not just answer) for in-browser Q&A | AI & Agents | Trust AI answers via inline citations | MaxAI / Perplexity positioning; reduces hallucination distrust |
| 12 | Cross-tab / multi-page synthesis (reason across N open tabs) | Workspace & Organization | Synthesize a research session spanning many tabs | No extension reasons across tabs; sandbox prevents it |

---

## 4. Competitive / Whitespace Notes

- **The control-depth chasm is the whole game.** Tier A is sandboxed to content scripts and sidebars; Tier B needs an external/cloud browser. Aether, by being the browser, is the only architecture that can offer native CDP-depth automation *and* a trusted, signed-in, stealth-inherent context simultaneously. This is the single largest structural advantage and should anchor the product thesis.
- **HARPA is the only Tier A competitor worth deep study** — it is effectively "Tier B capabilities trapped in a Tier A sandbox." Replicating its automation model with native browser privilege (and without the sandbox tax) is a clean win.
- **MCP is the integration lingua franca.** Exposing Aether's browser state over MCP (accessibility snapshot + click/navigate/extract) maximizes LLM-host compatibility at the lowest cost. The whitespace draft notes Chrome's WebMCP is page-facing, not browser-facing — Aether shipping a *browser-facing* native MCP is genuine whitespace.
- **Browserbase's value evaporates inside a real browser** — stealth, proxies, and CAPTCHA solving are external-agent problems. Aether should treat Browserbase as a non-competitor and instead absorb its observability + model-gateway patterns.
- **Whitespace clusters (from sibling draft):** (a) browser-native agent runtime with a permission system; (b) local multi-model orchestration; (c) automatic persistent cross-session AI context; (d) semantic search over browsing history; (e) MCP as a first-class browser protocol. None of these ship in any browser as of mid-2026.
- **Commoditized — do NOT differentiate on:** multi-model chat, page/YouTube summarization, translation, writing assist. These are table-stakes; ship them but don't lead with them.

---

## 5. Risks

1. **Prompt injection is the unsolved blocker, not a feature gap.** The whitespace and Brave's own "agentic browsing is inherently risky" framing make clear that a permission-gated agent runtime fails if web-content prompt injection isn't contained. Any native automation/agent surface (candidates 1, 2, 5) must ship with a robust isolation + alignment-check model or it becomes a critical attack surface. (Source: `browser-feature-whitespace-cited.md` §1.1; agent-safe IPC draft.)
2. **Novelty tax (Arc's lesson).** Per the red-team pre-mortem, features used by <5% of DAUs are dead weight that inflate complexity, attack surface, and maintenance. Deep automation/agent SDKs risk being "saxophone, not piano." Gate each candidate against ">20% of daily users will actually use this." (Source: `browser-failure-redteam-cited.md` §1.)
3. **Self-healing and reliability are genuinely hard.** browser-use's Rust core and Stagehand's caching exist precisely because pure-agent automation is flaky. Aether's automation must be benchmark-validated (BU-Bench-style) or it will inherit the same flakiness that erodes trust.
4. **Privacy claim must be architecturally real.** "100% privacy-friendly" without an audit (MaxAI) is the failure mode. If Aether claims local/private AI, the local-execution path must be verifiable, or it joins the 52%-collect-data reputational cohort.
5. **Frontier-model naming volatility.** Vendor pricing pages list "GPT-5.5 / Claude 4.6 / Gemini 3.1" — approximations, not canonical API identifiers. Any model-routing logic must be config-driven, not hard-coded to these strings.
6. **Tier-B ecosystem moves fast.** browser-use Rust core, Stagehand v3, and Browserbase MCP are all in active flux. Adopting their primitives (act/extract/observe/agent, accessibility-tree MCP) is safer than depending on their specific implementations.
7. **MultiOn-style pivot risk.** A prominent agent product discontinued its core API between sessions; do not build hard dependencies on any single third-party agent vendor's API.

---

*Format reference: `docs/research-data/competitive/ai-extensions.md` (v1, unmodified). All source URLs traced from the Feynman brief dated 2026-06-10.*
