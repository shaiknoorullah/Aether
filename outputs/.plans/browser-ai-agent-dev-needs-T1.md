# Researcher Brief T1: Tool-Level Critique — browser-use, Stagehand, Playwright MCP

## Your mission
Produce a detailed, source-backed technical critique of the three dominant browser AI agent frameworks in 2026: **browser-use**, **Stagehand** (by Browserbase), and **Playwright MCP** (Microsoft). Focus on what they get *wrong* from a developer perspective.

## Questions to answer

1. **browser-use** (Python, open-source)
   - Architecture: how does it drive the browser? (CDP? Playwright? Puppeteer?)
   - What are its known failure modes? (flaky actions, element resolution, multi-tab support)
   - What observability does it expose? What's missing?
   - What do GitHub issues reveal about real developer pain?
   - How does it handle auth, session persistence, anti-bot evasion?
   - What's the current release/version status?

2. **Stagehand** (TypeScript SDK by Browserbase)
   - What AI primitives does it expose (act/extract/observe)?
   - Where does LLM-over-DOM break down?
   - Token cost and latency: what do users report?
   - How does it handle sandboxing? Is it tightly coupled to Browserbase cloud?
   - Known design criticisms (GitHub issues, changelogs, community feedback)

3. **Playwright MCP** (Microsoft)
   - Architecture: how does it expose browser control over MCP protocol?
   - What's the tool surface? (snapshot, click, navigate, etc.)
   - What falls apart in agentic (multi-step, long-horizon) use?
   - Sandboxing model: does it run local only? What security properties does it lack?
   - Any known issues with the MCP transport layer in real deployments?

4. **Cross-tool comparison**
   - Which tool is best suited to which use case?
   - What do ALL three fail to provide? (the shared gap)

## Sources to search

- GitHub repos: `browser-use/browser-use`, `browserbase/stagehand`, `microsoft/playwright-mcp`
- GitHub Issues pages for each
- Changelogs / release notes
- Official docs
- HN discussions mentioning these tools
- Blog posts and comparisons (2025–2026)

Use web search and fetch official documentation pages. Do NOT fetch raw PDFs. If a URL is a PDF, cite the URL and mark parsing as blocked.

## Output

Write your findings to: `outputs/.drafts/browser-ai-agent-dev-needs-research-T1.md`

Structure:
- browser-use: architecture, failure modes, gaps
- Stagehand: architecture, failure modes, gaps
- Playwright MCP: architecture, failure modes, gaps
- Cross-tool comparison table (text, no images)
- Source URLs used

Every claim must have a source URL inline or in a footnote.
