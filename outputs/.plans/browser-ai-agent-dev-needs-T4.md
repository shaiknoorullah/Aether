# Researcher Brief T4: Developer Community Evidence & Unmet Needs

## Your mission
Mine developer community evidence to understand what real developers building browser AI agents actually struggle with in 2025–2026. Find the unmet needs, recurring complaints, and wish-list items that represent genuine market gaps.

## Questions to answer

1. **Community pain points** (forum/discussion mining)
   - What are the most upvoted GitHub issues across browser-use, Stagehand, Playwright MCP?
   - What do HN threads reveal about frustrations with current tools?
   - What do Reddit (r/MachineLearning, r/LocalLLaMA, r/webdev) threads say?
   - What complaints appear on Twitter/X or Discord about browser automation for AI?

2. **Benchmarks and evals**
   - WebArena, VisualWebArena, OSWorld, WorkArena: what do these benchmarks reveal about agent capability gaps?
   - What tasks do agents consistently fail at? (forms, logins, CAPTCHAs, multi-step navigation)
   - What tools perform best on these benchmarks and why?

3. **Developer use cases in 2026**
   - What are the primary use cases developers are building? (web scraping with AI, form automation, research agents, QA testing, RPA replacement)
   - Which use cases are underserved by current tools?
   - What's the distribution between local (open-source) vs cloud (SaaS) tooling preferences?

4. **Framework ecosystem**
   - How do browser agents integrate with LangChain, LlamaIndex, LangGraph, CrewAI, AutoGen?
   - What are the integration pain points?
   - What does the "ideal" browser agent SDK look like per developers?

5. **Unmet needs and market gaps**
   - What features are developers requesting that no tool provides?
   - What pain points are so severe developers are building custom solutions?
   - What would make developers switch from their current tool?

6. **Emerging patterns**
   - Any new architectural patterns for browser agents emerging in 2026? (vision-first agents, accessibility-tree-first, hybrid)
   - What's the state of multimodal (screenshot+DOM) vs DOM-only approaches?
   - Are developers moving toward browser extension-based agents or headless cloud browsers?

## Sources to search

- GitHub issues: browser-use, stagehand, playwright-mcp, AgentQL
- HN: search for "browser agent", "web automation LLM", "Playwright MCP", "browser-use", "Stagehand"
- Reddit: r/LocalLLaMA posts about browser automation
- Web search: "browser agent developer pain points 2025", "browser automation AI problems", "web agent benchmark 2026"
- WebArena / VisualWebArena papers and leaderboards
- Developer blog posts and tutorials that reveal friction

Do NOT fetch raw PDFs. Cite PDF URLs and mark parsing blocked.

## Output

Write findings to: `outputs/.drafts/browser-ai-agent-dev-needs-research-T4.md`

Structure:
- Community pain points (with source URLs for each major complaint)
- Benchmark evidence: what agents fail at
- Developer use case landscape
- Ecosystem integration gaps
- Unmet needs / market gaps
- Emerging architectural patterns
- Source URLs

Every claim needs a source URL.
