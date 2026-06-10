# Comparison Plan: browser-ai-agents-2026

**Slug**: `browser-ai-agents-2026`
**Date**: 2026-06-10

## Subjects

### Category A — AI Browser Extensions (consumer-facing)
1. Monica
2. Sider
3. Merlin
4. HARPA AI
5. MaxAI.me
6. Perplexity Browser Extension

### Category B — Browser Automation / Agent Infrastructure
7. browser-use (Python OSS library)
8. Playwright MCP (Microsoft MCP server)
9. Stagehand (Browserbase SDK)
10. Browserbase (cloud browser infra)
11. MultiOn (AI agent API)

## Dimensions to Evaluate

| # | Dimension | Notes |
|---|-----------|-------|
| 1 | Architecture / control surface | Extension vs headless vs API vs SDK |
| 2 | AI model integration | GPT-4o, Claude, Gemini, own model |
| 3 | Automation depth | Passive assist → full agent loop |
| 4 | Privacy model | Local, cloud, data retention policy |
| 5 | Platform / OS support | Chrome, Firefox, Safari, etc. |
| 6 | Pricing / access model | Free tier, API costs |
| 7 | Reliability / trust signals | Known failure modes, user reports |
| 8 | Developer / integration story | API, SDK, MCP, headless hooks |
| 9 | Key differentiator | What it uniquely does |
| 10 | Caveats / limitations | Blockers, anti-bot detection, latency |

## Evaluation Criteria per Cell
- **Source**: official docs, GitHub, verified third-party reviews, announcements
- **Key claim**: what the product/project asserts
- **Evidence type**: official docs / benchmark / user report / code audit
- **Confidence**: High / Medium / Low
- **Caveats**: known gaps, version caveats

## Output Structure
1. Executive summary (3–5 sentences)
2. Architecture diagram (Mermaid — two tiers: extension vs infra)
3. Full comparison matrix (markdown table)
4. Per-subject mini-profiles (strength, weakness, unique angle)
5. Agreement / disagreement / uncertainty callouts
6. Implications for Aether browser (derived insights)
7. Sources (direct URLs)

## Agent Workflow
- `researcher` subagent: parallel web search for all 11 subjects
- `verifier` subagent: cross-check claims, add inline citations, flag unverified rows
- Feynman (lead): synthesize, write matrix, apply charts

## Files
- Plan: `outputs/.plans/browser-ai-agents-2026.md` (this file)
- Output: `outputs/browser-ai-agents-2026-comparison.md`
