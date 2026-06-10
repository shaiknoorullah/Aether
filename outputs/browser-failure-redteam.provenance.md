# Provenance: Red-Team Analysis — Why AI-Native Power-User Privacy-First Browsers Fail

- **Date:** 2026-06-10
- **Rounds:** 1 (direct search — subagents failed, web search rate-limited)
- **Sources consulted:** 12 URLs attempted, 7 successfully fetched
- **Sources accepted:**
  1. https://browsercompany.substack.com/p/letter-to-arc-members-2025 (Josh Miller post-mortem)
  2. https://en.wikipedia.org/wiki/Arc_(web_browser) (Atlassian acquisition, timeline, security vuln)
  3. https://gs.statcounter.com/browser-market-share (May 2026 market share)
  4. https://en.wikipedia.org/wiki/Brave_(web_browser) (100M MAU, BAT, Brave Origin)
  5. https://en.wikipedia.org/wiki/Vivaldi_(web_browser) (4M users, business model)
  6. https://en.wikipedia.org/wiki/Mozilla_Corporation ($680M revenue, Google dependency, layoffs)
  7. https://en.wikipedia.org/wiki/Zen_Browser (Firefox fork, July 2024 launch)
- **Sources rejected/failed:**
  - theverge.com Arc articles: HTTP 404
  - techcrunch.com Arc article: HTTP 404
  - Wikipedia pages for Mighty, SigmaOS, Sidekick: HTTP 404 (pages don't exist)
  - theverge.com Mighty acquisition article: HTTP 404
  - blog.nicolo.io Station post-mortem: fetch failed
  - Web search (all providers): Exa rate-limited, Perplexity/Gemini unconfigured
  - Subagent execution: module error in Feynman runtime
- **Verification:** PASS WITH NOTES
  - All quantitative claims (market share, revenue, user counts, usage metrics) traced to fetched primary documents
  - Mighty, SigmaOS, Sidekick, Beam claims marked as unverified industry knowledge [source 4]
  - Chrome Gemini, Edge Copilot, Opera Aria AI claims marked as [*industry knowledge*]
  - DMA impact claim is inferential, marked LOW confidence
- **Plan:** outputs/.plans/browser-failure-redteam.md
- **Research files:**
  - outputs/.drafts/browser-failure-redteam-research-direct.md
  - outputs/.drafts/browser-failure-redteam-draft.md
  - outputs/.drafts/browser-failure-redteam-cited.md
  - outputs/.drafts/browser-failure-redteam-verification.md
