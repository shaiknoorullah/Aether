# Provenance: Browser AI Agent Developer Needs in 2026

- **Date:** 2026-06-10
- **Slug:** `browser-ai-agent-dev-needs`
- **Rounds:** 1 research round (direct search, 21 queries), 1 citation/verification round

## Sources Consulted: 58

### Primary Source Types
- GitHub Issues: browser-use/browser-use (#3111, #3070, #3134, #3816), microsoft/playwright-mcp (#397, #981, #1233, #1193), microsoft/playwright (#39955), browserbase/stagehand (#1014)
- Official documentation: Playwright MCP (playwright.dev), WebDriver BiDi W3C spec, Stagehand V3 docs, browser-use docs
- Company blog posts: browser-use.com, browserbase.com, steel.dev, theairuntime.com
- Academic papers: arXiv:2504.01382 (Online-Mind2Web/"Illusion of Progress"), arXiv:2506.07153 (Mind the Web security), arXiv:2512.12594 (cellmate sandboxing), arXiv:2511.20597 (BrowseSafe)
- Funding verification: TechCrunch, PR Newswire, SiliconANGLE, Sacra, Economic Times
- Developer community: Hacker News (#45764043, #44393325, #47336171), DEV Community posts
- Technical blogs: hablich.dev, igorivanter.com, tianpan.co, assrt.ai, agentnative.dev, t8r.tech, declaw.ai, browsaur.dev
- Benchmark data: halluminate.ai/blog/benchmark (Web Bench), webarena.dev ecosystem

## Sources Accepted: 58

All 58 sources accepted. No dead URLs detected during research (HN #43173378 returned HTTP 429, not 404 — content accessible on retry).

## Sources Rejected / Downgraded

- HN #43173378 (browser-use launch thread): HTTP 429 on fetch; content referenced from search snippet only; cited evidence used from other sources instead
- Anchor Browser funding: Primary Anchor press release not fetched directly; cited via apiscout.dev secondary comparison article (MINOR sourcing note in verification report)

## Capabilities Blocked

- `researcher` subagent (parallel mode): BLOCKED — `Cannot find module '/home/devsupreme/work/aether-browser/--mode'` in pi-cli-wrapper.js (feynman-0.2.58, all 3 call shapes failed)
- `verifier` subagent: BLOCKED (same runtime error)
- `reviewer` subagent: BLOCKED (same runtime error)

Degraded mode: lead agent executed all 4 research tracks directly using 21 web search queries and 12 URL fetches.

## Verification: PASS WITH NOTES

Notes:
1. "79% prefer human for complex issues" claim: sourced to Zylos Research secondary blog post; underlying primary CX study not independently retrieved. Hedged language in text.
2. "50–60% real-world production accuracy" claim: practitioner estimate from tianpan.co, not primary empirical data. Already hedged in text.
3. Anchor Browser funding amount: cited via secondary comparison article, not primary press release.

## Plan
- `outputs/.plans/browser-ai-agent-dev-needs.md`

## Research Files
- `outputs/.drafts/browser-ai-agent-dev-needs-research-direct.md` — 50-source annotated research notes
- `outputs/.drafts/browser-ai-agent-dev-needs-draft.md` — uncited draft
- `outputs/.drafts/browser-ai-agent-dev-needs-cited.md` — cited version (= final)
- `outputs/.drafts/browser-ai-agent-dev-needs-verification.md` — self-review report
- `outputs/.plans/browser-ai-agent-dev-needs-T1.md` through `T4.md` — per-track research briefs (written; execution blocked)

## Final Artifact
- `outputs/browser-ai-agent-dev-needs.md`
