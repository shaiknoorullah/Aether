# T1: AI-Native Browser Features + Whitespace (2026)

## Objective
Map what AI features ship in browsers today (mid-2026) and identify integration patterns NO browser offers.

## Scope
Research these browsers' AI features: Arc, Brave (Leo), Chrome (Gemini), Edge (Copilot), Opera (Aria), Vivaldi, Firefox, Safari, Orion, SigmaOS, Sidekick, Zen, Floorp.

## Key Questions
1. What AI features does each browser ship natively (not via extensions)?
2. What AI integration patterns exist only as extensions but not natively?
3. What AI-native patterns does NO browser or extension offer? Specifically look for:
   - Local model orchestration (run models on-device, route between them)
   - Agent tool-use with permission systems (browser as agent runtime)
   - Cross-tab context awareness (AI that understands your full session)
   - Automated workflow recording and replay with AI judgment
   - AI-driven tab/workspace organization that actually learns
   - Semantic search across browsing history
   - AI-mediated form filling beyond autofill
   - Real-time page summarization in background
   - AI content filtering (not just ad blocking — semantic filtering)
   - Model Context Protocol (MCP) native support in browser
4. For each gap found, note WHY it might not exist (technical barrier, privacy risk, compute cost, etc.)

## Output
Write findings to `outputs/.drafts/browser-feature-whitespace-research-t1.md` with:
- A table of browser × AI feature (what ships today)
- A list of identified whitespace features with evidence
- Source URLs for every claim
- Contrarian notes on why each gap might exist for good reason

## Rules
- Use web search for current product pages, changelogs, blog posts
- Do NOT fetch PDF files
- Every claim needs a source URL
- Mark anything uncertain as "unverified"
- Focus on mid-2026 state, not announcements or roadmaps
