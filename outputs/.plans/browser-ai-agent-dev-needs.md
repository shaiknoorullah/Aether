# Deep Research Plan: Browser AI Agent Developer Needs (2026)

**Slug:** `browser-ai-agent-dev-needs`
**Date:** 2026-06-10

---

## Key Questions

1. What are the core primitives developers need for agent-safe web access in 2026 (isolation, auth, session persistence, anti-bot evasion)?
2. What CDP/IPC control surfaces exist and where do they fall short for agentic use (latency, reliability, expressiveness, multi-tab)?
3. How do current sandboxing approaches differ across tools—what escapes, what's over-isolated?
4. What observability/tracing primitives exist, what's missing (token cost attribution, step replay, failure diagnosis)?
5. What reliability failure modes plague real agent deployments (flaky selectors, dynamic SPAs, CAPTCHAs, rate limits)?
6. How do tools handle graceful degradation (fallback strategies, partial success, retry policies)?
7. What specifically do browser-use, Playwright MCP, and Stagehand get wrong—design, API ergonomics, missing features?
8. What gaps exist that no current tool addresses (Aether opportunity space)?

---

## Evidence Needed

- Technical docs/changelogs for browser-use, Playwright MCP, Stagehand, Browserbase, Steel, Anchor (agent browser infra)
- GitHub issues and discussions reflecting real developer pain points
- Developer community posts (HN, Reddit, Discord snippets, Twitter/X threads)
- CDP/WebDriver BiDi spec docs and known limitations
- Academic or technical papers on browser agent reliability, web automation safety
- Benchmark/comparison posts (LLM browser agent evals)
- Recent news (2025–2026) on browser automation tooling landscape

---

## Scale Decision

**Multi-agent subagent approach — 4 researcher subagents** covering:
- T1: browser-use, Stagehand, Playwright MCP — design critiques, known issues, GitHub issues, changelog pain
- T2: CDP/IPC control surfaces — WebDriver BiDi, CDP limitations, agent-safe browsing infra (Browserbase, Steel, Anchor)
- T3: Sandboxing, observability, reliability failure modes in browser agents
- T4: Developer community evidence — HN, Reddit, blog posts, framework comparisons, what's missing

Rationale: Broad multi-domain topic spanning 3+ tools, infra layer, developer experience, and reliability engineering. 4 researchers parallelize the evidence surface.

---

## Task Ledger

| ID  | Owner        | Task                                                | Status  | Output File                              |
|-----|--------------|-----------------------------------------------------|---------|------------------------------------------|
| T1  | researcher   | browser-use + Stagehand + Playwright MCP critique   | PENDING | browser-ai-agent-dev-needs-research-T1.md |
| T2  | researcher   | CDP/IPC surfaces, agent browser infra               | PENDING | browser-ai-agent-dev-needs-research-T2.md |
| T3  | researcher   | Sandboxing, observability, reliability failure modes| PENDING | browser-ai-agent-dev-needs-research-T3.md |
| T4  | researcher   | Developer community evidence, gaps, framework comps | PENDING | browser-ai-agent-dev-needs-research-T4.md |
| SYN | lead (self)  | Synthesis + draft                                   | PENDING | browser-ai-agent-dev-needs-draft.md       |
| VER | verifier     | Citation + URL verification                         | PENDING | browser-ai-agent-dev-needs-cited.md       |
| REV | reviewer     | Claim + logic audit                                 | PENDING | browser-ai-agent-dev-needs-verification.md|
| DEL | lead (self)  | Final delivery + provenance                         | PENDING | outputs/browser-ai-agent-dev-needs.md     |

---

## Verification Log

| Check | Status | Notes |
|-------|--------|-------|
| T1 file exists on disk | PENDING | |
| T2 file exists on disk | PENDING | |
| T3 file exists on disk | PENDING | |
| T4 file exists on disk | PENDING | |
| Draft written | PENDING | |
| Cited file written | PENDING | |
| Reviewer passed | PENDING | |
| Final artifact on disk | PENDING | |
| Provenance on disk | PENDING | |

---

## Blocked Capabilities

| Capability | Status | Error |
|------------|--------|-------|
| `researcher` subagent (parallel) | BLOCKED | `Cannot find module '/home/devsupreme/work/aether-browser/--mode'` in pi-cli-wrapper.js — all PARALLEL and SINGLE researcher calls fail with same error |
| `verifier` subagent | BLOCKED (same runtime) | Will verify manually |
| `reviewer` subagent | BLOCKED (same runtime) | Will review manually |

Degraded mode: Lead performs all 4 research tracks directly using web_search and fetch_content.

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| 4 subagent researchers | Broad topic: 3 tools + infra layer + devex + reliability = distinct research domains |
| Avoid PDF parsing | No explicit user request; prefer HTML docs, GitHub, web sources |
| papers/ not outputs/ | Topic is substantial enough for paper-style delivery |
| Scope: 2025–2026 primary | Tooling landscape changes fast; older sources secondary only |

---

## Per-Researcher Briefs (written before spawning)

- `outputs/.plans/browser-ai-agent-dev-needs-T1.md`
- `outputs/.plans/browser-ai-agent-dev-needs-T2.md`
- `outputs/.plans/browser-ai-agent-dev-needs-T3.md`
- `outputs/.plans/browser-ai-agent-dev-needs-T4.md`
