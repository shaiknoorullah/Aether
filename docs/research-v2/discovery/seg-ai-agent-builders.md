# Discovery Department Report: Developers Building Browser AI Agents (2026)

**Team:** `seg-ai-agent-builders`
**Department:** Discovery
**Mandate:** Developers building browser AI agents in 2026 — agent-safe web access, CDP/IPC control, sandboxing, observability, reliability; what current tools get wrong.
**Primary source brief:** `outputs/browser-ai-agent-dev-needs.md` (58 sources, cited, pre-review)
**Date:** 2026-06-10

---

## 1. Executive Summary

The browser-automation ecosystem for AI agents is in transition, but the deepest unresolved problems are **architectural, not capability gaps**. Three open frameworks — browser-use (Python/raw-CDP), Stagehand (TypeScript/Browserbase), and Playwright MCP (TypeScript/Microsoft) — dominate developer mindshare, yet each carries structural deficiencies that become production liabilities: no agent-native auth primitive, no authenticated/least-privilege control surface, no standardized observability schema, no graceful partial-completion model, and no prompt-injection mitigation layer. These gaps are shared across all three.

Published vendor benchmarks are systematically optimistic. Agents claiming 85–93% on WebVoyager score 30–56% on harder live-site benchmarks; the SOTA for fully-automated **write** tasks (login, form-fill, authenticated workflows) is only **46.6%**. Roughly half of real-world automated browser write tasks fail in production. The root causes are well-characterized: CDP was built as a debugging tool (zero auth, pixel-thinking, multi-target complexity, ten documented tab-crash modes), the DOM is fragile (stale element refs, SPA async state, anti-bot/CAPTCHA), and token economics are punishing (a 10-step screenshot workflow ≈175K tokens ≈ $4/run; Playwright MCP costs up to 15× more tokens than a CLI-first approach for the same task).

For Aether the implication is a focused opportunity: be the **first browser that treats the agent as a first-class, sandboxed, authenticated, observable client** — an authenticated least-privilege control surface, just-in-time credential injection, a standard telemetry schema, a content-sanitization layer, a resumable task state machine, and token-budget-aware action routing. No shipping browser or framework provides this combination today.

---

## 2. Key Findings

### Finding 1: CDP — the universal control surface — was never designed for agents
- Every major framework (Playwright, browser-use, Puppeteer, Stagehand) translates to CDP at runtime, but CDP "thinks in pixels, rendering, and inspector panels, not semantic actions." Five structural limits: zero authentication, multi-target routing complexity, relay-hop latency, ten documented tab crash modes, and no semantic layer.
- Evidence: browser-use migrated entirely off Playwright to raw CDP in 2025 to fix relay-latency and state-drift; their post catalogs ten tab-crash modes — https://browser-use.com/posts/playwright-to-cdp
- Evidence: CDP as the "communication engine behind browser automation" — https://www.besthub.dev/articles/understanding-the-cdp-protocol-the-communication-engine-behind-browser-automation-2fca8f8d6a73
- Confidence: HIGH

### Finding 2: CDP has zero authentication — the foundational trust-boundary problem
- The debug port (`:9222`) has no auth. Any local process can query `GET localhost:9222/json/version`, obtain the WebSocket URL, and read all cookies, extract page content, and execute JS in any tab.
- Evidence: Trust boundaries for browser agents — http://hablich.dev/articles/trust-boundaries-browser-agents.html
- Confidence: HIGH

### Finding 3: WebDriver BiDi is catching up but not production-ready for 2026
- W3C effort combining cross-browser reach with CDP-like low-latency events. Milestone 19 completed 2026-03-29 (CSP bypass, user-context config); Milestone 20 in development (screen recording). browser-use explicitly dismisses BiDi: "not feature complete yet; check back in 2027." Safari ceiling remains classic `safaridriver`.
- Evidence: W3C WebDriver BiDi Working Draft — https://www.w3.org/TR/webdriver-bidi/ ; Mozilla Milestone 19 — https://wiki.mozilla.org/WebDriver/RemoteProtocol/WebDriver_BiDi/Milestone_19
- Confidence: HIGH

### Finding 4: No tool ships an authenticated, agent-native protocol with versioned refs and semantic intents
- gsd-browser articulates the missing primitives: versioned element references (`@v2:e4`), semantic intent actions (`act login`), a persistent daemon (zero startup cost), structured JSON on every command. ABP forks Chromium to freeze JS/rendering during the observation window because "the model is reasoning from stale state."
- Evidence: Playwright Is Not Good Enough for Agents — https://www.agentnative.dev/blog/playwright-is-not-good-enough-for-agents ; Show HN: ABP — https://news.ycombinator.com/item?id=47336171
- Confidence: HIGH

### Finding 5: Benchmarks are systematically optimistic; write-task SOTA is only 46.6%
- A trivial search agent solves 51% of WebVoyager, proving the benchmark is too easy. On Online-Mind2Web (300 tasks, 136 live sites, human-evaluated): Operator 61%, Claude Computer Use 3.7 56.3%, all others ~30%. Web Bench (5,750 tasks, 452 live sites): read tasks >75%, write tasks SOTA 46.6% (Skyvern 2.0).
- Evidence: An Illusion of Progress? (arXiv:2504.01382) — https://arxiv.org/html/2504.01382v4 ; Web Bench — https://halluminate.ai/blog/benchmark
- Confidence: HIGH

### Finding 6: DOM fragility is a taxonomy, not a single bug — and tools naive-retry
- Ten documented failure classes: stale element ref (most common), SPA async state, coordinate drift (vision), DOM restructuring, cross-origin iframe/shadow DOM, anti-bot/CAPTCHA, auth/login, context-window blowout, model rate-limits mid-task, post-DOM boundary crossing. Correct fixes (immediate re-snapshot into the failed tool result, MutationObserver stability polling, retryable-vs-fatal error classification) are documented but unshipped by the big three.
- Evidence: Assrt — five recovery primitives — https://assrt.ai/t/ai-agent-browser-automation-reliability ; DOM Fragility Tax — https://tianpan.co/blog/2026-04-19-browser-agents-dom-fragility-production
- Confidence: HIGH

### Finding 7: No least-privilege credential or session isolation; Firecracker is the right boundary but unshipped
- Agents receive full browser state (all cookies/tokens/passwords) for the task duration. No mechanism scopes a session to specific domains, HTTP methods, or read-only access. Docker shares the host kernel (inadequate for AI-generated code); Firecracker gives each agent its own kernel/FS/network. Declaw.ai and mattbucci/agent-sandbox demonstrate Firecracker-per-agent, but no major framework ships it.
- Evidence: Why We Chose Firecracker Over Docker — https://declaw.ai/blog/firecracker-over-docker ; Field Guide to Browser Harnesses 2026 — https://theairuntime.com/p/the-complete-field-guide-to-browser
- Confidence: HIGH

### Finding 8: First production credential-handoff answer exists but is ecosystem-locked
- 1Password Secure Agentic Autofill (Oct 2025) provides just-in-time credential injection — but only for Browserbase-hosted sessions. There is no open, framework-agnostic auth handoff protocol with RBAC and audit log.
- Evidence: Field Guide to Browser Harnesses 2026 — https://theairuntime.com/p/the-complete-field-guide-to-browser
- Confidence: MEDIUM (single secondary source)

### Finding 9: Indirect prompt injection is an unmitigated, demonstrated attack surface
- Page content (comments, reviews, ads) can embed instructions that redirect the agent's task. Cato Networks' WebPromptTrap shows a complete end-to-end exploit on an open-source AI browser. No major framework ships content sanitization between page ingestion and LLM input.
- Evidence: Mind the Web (arXiv:2506.07153) — https://arxiv.org/html/2506.07153 ; Cato WebPromptTrap — https://www.catonetworks.com/blog/webprompttrap-new-indirect-prompt-injection-vulnerability/
- Confidence: HIGH

### Finding 10: Observability is fragmented; no standardized failure schema or per-step cost
- Tooling exists (Playwright trace viewer, BrowserTrace, Beacon DAG tracing, Krometrail, TraceRoot, browser-use Cloud) but no common `failure_reason` taxonomy, no DOM diff between actions, no semantic step attribution, no agent-decision-tree export. Token cost attribution is rare and mostly cloud-gated.
- Evidence: vexorlabs/beacon — https://github.com/vexorlabs/beacon ; Web Bench failure categories — https://halluminate.ai/blog/benchmark
- Confidence: HIGH

### Finding 11: No graceful-degradation / partial-completion model
- The standard design is binary succeed/fail. A task 70% complete that hits an unhandled failure loses all state. Missing across all three tools: resumable task state machine with checkpoints, structured human-in-the-loop escalation, LLM fallback chains, partial-success reporting.
- Evidence: Designing for Partial Completion — https://tianpan.co/blog/2026-04-19-designing-for-partial-completion-ai-agents ; Agent-to-Human Handoff Patterns — https://zylos.ai/research/2026-04-03-agent-to-human-handoff-patterns
- Confidence: MEDIUM (practitioner sources)

### Finding 12: Token economics are punishing; no budget-aware routing exists
- A 10-step screenshot workflow ≈ 175K tokens ≈ $4/run. The same task: Playwright MCP ≈100K tokens vs Vercel agent-browser ≈7K — a 15× difference. Stagehand v3 action caching gives ~30% cost reduction + 2× speed on repeats. No framework ships automatic token-budget routing (cheapest sufficient strategy first: cached selector → a11y tree → vision).
- Evidence: agent-browser 15× cheaper than Playwright MCP — https://otf-kit.dev/blog/agent-browser-15x-cheaper-than-playwright-mcp ; Stagehand v3 — https://www.browserbase.com/blog/ai-web-agent-sdk
- Confidence: HIGH

### Finding 13: Tool-level critiques converge on the same structural absences
- browser-use: Python-only; auth regression on CDP migration (#3111); fragile session persistence (#3070); multi-tab CDP session loss (#3134); no sandboxing; cloud-gated observability. Stagehand: TS-only; cloud-first; breaks on poorly-structured pages without ARIA; no least-privilege; no post-DOM coverage. Playwright MCP: context overflow / HTTP 413 (#1233); off-screen elements (#39955); missing refs (#397); unstable locators (#981); ~13K-token tool schema; Microsoft's own README recommends CLI+SKILLS over MCP for coding agents.
- Evidence: browser-use #3111 — https://github.com/browser-use/browser-use/issues/3111 ; Playwright MCP #1233 — https://github.com/microsoft/playwright-mcp/issues/1233 ; Playwright MCP README — https://github.com/microsoft/playwright-mcp/blob/main/README.md
- Confidence: HIGH

### Finding 14: The architecture is converging on hybrid topology + thin-CDP
- Production systems abandon pure topologies for: build-time LLM exploration → cached deterministic skeleton → vision-CUA fallback for the long tail (Stagehand caching, Anchor record-and-replay, browser-use Tools.action cache, Google Mariner Teach & Repeat). "Thin-CDP" thesis (browser-use Browser Harness ~600 lines, ABP, gsd-browser) argues abstraction layers above raw CDP constrain capable models — "the bitter lesson applied to harness engineering." MCP is now commodity transport; differentiation is MCP/CLI efficiency.
- Evidence: The Bitter Lesson of Agent Harnesses — https://browser-use.com/posts/bitter-lesson-agent-harnesses ; Field Guide — https://theairuntime.com/p/the-complete-field-guide-to-browser
- Confidence: HIGH

---

## 3. Implied Aether Feature Candidates

These are the discovery-stage feature hypotheses derived from the findings above. RICE inputs are summarized; the structured object accompanying this report carries the canonical scores.

1. **Authenticated, least-privilege agent control surface** (AI & Agents / Developer Tools). A native control protocol requiring a session token, scoping capabilities to declared domains/HTTP methods/read-only, and logging every command with session identity. Directly answers CDP's zero-auth gap (Findings 1, 2, 4). This is Aether's flagship differentiator — no tool provides an authenticated agent-native protocol.

2. **Agent-native protocol surface: versioned refs + semantic intents + structured JSON** (AI & Agents). Versioned element references make stale-ref errors a detectable contract violation; semantic intents (`act login`) absorb action ambiguity; structured JSON on every command. Addresses Findings 4 and 6 (stale state is the #1 failure).

3. **Just-in-time credential injection with scope/expiry/audit (vault)** (Privacy & Security). Open, framework-agnostic credential handoff with RBAC and audit log — the un-locked version of 1Password Secure Agentic Autofill (Findings 7, 8).

4. **Per-agent sandboxed execution (Firecracker-class isolation)** (Privacy & Security). Each agent gets its own kernel/FS/scoped network; safe for AI-generated code. Ships the isolation boundary no framework ships (Finding 7).

5. **Prompt-injection mitigation / content-sanitization layer** (Privacy & Security / AI & Agents). A sanitization pipeline between page ingestion and LLM context, plus provenance tagging of untrusted page content. Addresses the demonstrated, unmitigated attack surface (Finding 9).

6. **Standardized agent observability schema + session replay** (Developer Tools). Open telemetry standard: step, action, token cost, DOM hash, failure_reason taxonomy, timing; DOM diff between actions; agent-decision-tree export; replay. Addresses Findings 10 and 13.

7. **Resumable task state machine with human-in-the-loop escalation** (AI & Agents / Productivity). Explicit `planning → executing[N/M] → partial_success → escalated → resumed` with checkpoints, partial-success reporting, and LLM fallback chains. Addresses Finding 11.

8. **DOM-reliability recovery primitives built into the browser** (AI & Agents / Core Browsing). Native re-snapshot-on-stale-ref, MutationObserver stability polling, retryable-vs-fatal error classification, deep-finder for shadow DOM/iframes. Turns the documented recovery primitives into browser-native behavior (Finding 6).

9. **Token-budget-aware action routing** (Performance / AI & Agents). Per-action escalation: deterministic cached selector → accessibility tree → vision, with token cost tracked per step and a budget ceiling. Addresses Finding 12.

10. **Hybrid record-and-replay (build-time explore → cached skeleton → CUA fallback)** (AI & Agents / Productivity). The convergent winning topology, browser-native (Finding 14).

11. **Token-efficient CLI + MCP dual surface for the agent layer** (Developer Tools). CLI-first for token efficiency, MCP for exploratory integration — answering the 15× token gap and Microsoft's own CLI-over-MCP guidance (Findings 12, 13, 14).

---

## 4. Competitive & Whitespace Notes

- **Whitespace is architectural, not feature-incremental.** Cross-referencing `browser-feature-whitespace-cited.md`: "No browser treats AI agents as first-class citizens with a granular tool-use permission model." Brave AI Browsing (Nightly, June 2026) is the closest — isolated profile + second alignment-checking model — but it is a single autonomous session, not a permission-gated agent runtime with revocable per-capability grants. Aether's authenticated least-privilege control surface (Candidate 1) is the direct fill.
- **Frameworks vs. browser.** browser-use, Stagehand, and Playwright MCP are libraries retrofitting human-oriented browsers. None can fix CDP's zero-auth, none ship sandboxing, none ship a standard telemetry schema — because those are *browser*-level concerns. Aether's leverage is owning the browser, so it can provide the trust boundary, the audit log, and the sanitization layer that no library can.
- **Cloud-platform lock-in is the monetization pattern, and the weakness.** Every SDK pairs with a paid cloud (Stagehand→Browserbase, browser-harness→browser-use Cloud, Skyvern OSS→Skyvern Cloud). Caching, replay, stealth, and credential handoff (1Password autofill) are mostly cloud-gated. An open, local-first browser that ships these primitives un-gated is differentiated against the entire field.
- **Language fragmentation.** browser-use is Python-only; Stagehand is TypeScript-only. Developers choose by ecosystem, not fit. A browser-level protocol (CLI + MCP + structured JSON) is language-agnostic by construction.
- **Aligns with the agent-safe IPC brief.** `agent-safe-browser-ipc-cited.md` concludes the safe architecture is layered: WebExtension messaging as primary agent IPC, Firefox Xray wrappers for content↔page, Native Messaging Host as optional OS bridge, MCP as agent-facing consent layer — with CDP/BiDi avoided for production agent control. This is the implementation substrate for Candidate 1.
- **Real multi-browser is open.** Playwright "cross-browser" is cross-engine, not cross-product (no real Firefox profiles/extensions/ITP, no real Safari). A browser driving real instances with agent-friendly structured output is unfilled — though lower priority for Aether's single-product focus.

---

## 5. Risks

- **R1 — Prompt injection may be unsolvable in general.** Any sanitization that classifies page-content intent is itself an LLM task subject to adversarial manipulation. Mitigation (provenance tagging, capability scoping, human escalation on high-risk actions) reduces but does not eliminate risk. Over-promising "injection-proof" is a reputational and security liability.
- **R2 — Model improvement may erode the harness moat.** Sonnet 4.5's OSWorld score jumped 19 points in four months; if models keep absorbing DOM-fragility problems, some reliability primitives lose value. Auth, observability, sandboxing, and state remain harness/browser concerns regardless — bias the roadmap toward those durable layers.
- **R3 — Anti-bot arms race is a treadmill, measured in months.** Cloudflare 2026 layers TLS/canvas/WebGL fingerprinting + behavioral signals + IP reputation; evasion plugins are specifically targeted. Aether should not stake its value on stealth/evasion (high maintenance, ethically fraught); position around legitimate authenticated automation and consent instead.
- **R4 — WebDriver BiDi timing uncertainty.** If BiDi reaches CDP parity by 2027 it could commoditize part of the control-surface differentiation; if it stalls, the CDP-only Chromium moat persists. Either way, Aether's *authenticated, least-privilege, audited* layer sits above the wire protocol and is not made redundant by BiDi.
- **R5 — Benchmark dishonesty in the category.** Vendor numbers (85–93%) are systematically inflated vs. live-site reality (30–56%). Aether must benchmark on hard live-site suites (Online-Mind2Web, Web Bench write tasks) to avoid the same credibility trap, and report write-task numbers separately from read-task numbers.
- **R6 — Effort/complexity concentration.** Several flagship candidates (authenticated control surface, Firecracker sandboxing, observability standard) are individually multi-engineer, multi-quarter efforts with security-critical surfaces. Sequencing and a thin-CDP minimal harness first reduces delivery risk.
- **R7 — Single-secondary-source claims.** Credential-handoff (1Password autofill) and partial-completion / human-handoff statistics rest on secondary or practitioner sources flagged in the provenance file; treat as directional, validate before committing roadmap weight.

---

## Provenance
- Brief: `outputs/browser-ai-agent-dev-needs.md` (58 sources)
- Provenance: `outputs/browser-ai-agent-dev-needs.provenance.md` (verification: PASS WITH NOTES)
- Cross-referenced drafts: `outputs/.drafts/browser-feature-whitespace-cited.md`, `outputs/.drafts/agent-safe-browser-ipc-cited.md`
- Format reference (not modified): `docs/research-data/discovery/ai-agent-builders.md`
