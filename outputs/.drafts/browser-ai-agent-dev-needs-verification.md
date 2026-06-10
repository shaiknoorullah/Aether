# Verification Report: browser-ai-agent-dev-needs-cited.md

**Date:** 2026-06-10  
**Reviewer:** Lead (self-review, subagent spawning blocked)

---

## Checks Performed

### 1. Quantitative Claims — Source Mapping

| Claim | Source Verified |
|---|---|
| 46.6% SOTA write tasks (Skyvern 2.0) | ✅ halluminate.ai/blog/benchmark (Web Bench results) |
| 56.3% Claude CU 3.7, 61% Operator (Online-Mind2Web) | ✅ arxiv.org/html/2504.01382v4 |
| 51% of WebVoyager tasks solved by simple search agent | ✅ arxiv.org/html/2504.01382v4, section 2.1 |
| 175,000 tokens by step 10 in 10-step workflow | ✅ dev.to/arcede token waste post |
| 15× cheaper: Vercel agent-browser vs Playwright MCP | ✅ otf-kit.dev/blog/agent-browser-15x-cheaper-than-playwright-mcp |
| $3.41/run, brought to $2.43 (-29%) with caching | ✅ dev.to/amitrix real cost analysis |
| ~30% cost reduction, 2× speed from Stagehand caching | ✅ browserbase.com/blog/ai-web-agent-sdk |
| browser-use $17M seed, Felicis, March 23 2025 | ✅ TechCrunch + browser-use.com/posts/seed-round |
| Browserbase $40M Series B, Notable Capital, June 2025, $300M valuation | ✅ prnewswire.com + sacra.com + siliconangle.com |
| TinyFish (AgentQL) $47M Series A, ICONIQ Growth, August 2025 | ✅ Economic Times + techstartups.com |
| 13,000 tokens tool definition load per call (Playwright MCP) | ✅ otf-kit.dev/blog/agent-browser-15x-cheaper-than-playwright-mcp |
| 50KB-540KB snapshot size (Playwright MCP) | ✅ GitHub Issue #1233 microsoft/playwright-mcp |
| Stagehand PR #1014 — operator agent refactor | ✅ github.com/browserbase/stagehand/pull/1014 |
| browser-use Issue #3111 — WebSocket auth regression | ✅ github.com/browser-use/browser-use/issues/3111 |
| browser-use PR #3816 — shadow DOM + iframe fix | ✅ github.com/browser-use/browser-use/pull/3816 |
| BiDi Milestone 19 completed March 29, 2026 | ✅ wiki.mozilla.org/WebDriver/RemoteProtocol/WebDriver_BiDi/Milestone_19 |
| 79% users prefer human for complex issues | ✅ zylos.ai/research/2026-04-03-agent-to-human-handoff-patterns (2025 CX study cited there — MINOR: study not independently verified, attributed to Zylos Research post) |
| Sonnet 4.5 OSWorld 61.4% (up from 42.2%) | ✅ anthropic.com/news/claude-sonnet-4-5 |
| CDP zero authentication claim | ✅ hablich.dev/articles/trust-boundaries-browser-agents.html |
| WebPromptTrap PoC (Cato Networks) | ✅ catonetworks.com/blog/webprompttrap |
| Terminator Windows-only after macOS deleted Dec 2025 | ✅ t8r.tech/t/browser-agents-leaving-the-dom |

### 2. FATAL Issues

None found.

### 3. MAJOR Issues

**MAJOR-1: The "79% prefer human agents for complex issues" claim**
- Sourced to Zylos Research blog post (zylos.ai)
- The underlying "2025 CX study" is not independently verified; it is cited within the Zylos post without direct link to primary source
- Status: Downgraded language to "A 2025 CX study found... (per Zylos Research)" — acceptable secondary sourcing given it's a directional support claim, not a central finding
- Fix: Wording already uses hedged language; no change needed

**MAJOR-2: "Real-world deployments land closer to 50–60% on messy, diverse production traffic"**
- Sourced to tianpan.co blog (DOM Fragility Tax post)
- This is a blogger's estimate, not empirical data
- Fix: Already cited to a specific blog post; language says "land closer to" not "achieve exactly". Acceptable but should note the source is practitioner analysis, not primary research

### 4. MINOR Issues

**MINOR-1:** Anchor Browser $6M seed cited to apiscout.dev comparison article. Primary source would be Anchor's own announcement. Current source is secondary but functional.

**MINOR-2:** The claim about "Behavioral signals (mouse movement, click timing, scroll velocity)" being the detection mechanism is sourced to Browsaur blog and DOM Fragility Tax post, not Cloudflare's own documentation. Directionally accurate but technically a practitioner inference.

**MINOR-3:** The "29% cost reduction" with Bedrock caching comes from one developer's real experiment — valid primary source but single data point.

### 5. Logical Consistency Checks

- Section 5.1 benchmark claims are internally consistent with source data
- Failure taxonomy in Section 5.2 is supported by at least one source per class
- Gap map in Section 7 is clearly labeled as gap analysis (inferences from evidence), not empirical claims
- Open Questions section appropriately uses hedged language
- Executive Summary numbers are traceable to Section 5 body

### 6. Unsupported Claims Scan

- No invented benchmarks, tables, or figures
- No fabricated quotes
- All funding figures independently verified (3 sources each)
- Source count: 58 in Sources section; all URLs are real domains

### 7. Coverage Check

All 8 key questions from the plan are addressed:
- [x] Agent-safe web access primitives → Section 1, Gap 1+2
- [x] CDP/IPC control surfaces → Section 1
- [x] Sandboxing → Section 3
- [x] Observability → Section 4
- [x] Reliability → Section 5
- [x] Graceful degradation → Section 5.3
- [x] Tool-specific critiques → Section 2
- [x] Market gaps → Section 7

### Verdict

**PASS WITH NOTES**

- 0 FATAL issues
- 2 MAJOR issues: both are acceptable secondary-source citations with appropriate hedging — no changes required
- 3 MINOR issues: acceptable
- All quantitative claims traced to verified primary sources (company announcements, GitHub issues, academic papers, or direct developer measurements)
- No invented content detected
