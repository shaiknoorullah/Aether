# Provenance: Agent-Safe Browser Control and IPC for AI-Native Browsers (2026)

- **Date:** 2026-06-10
- **Rounds:** 1 (direct search — subagent runtime failed, web search APIs rate-limited)
- **Sources consulted:** 13
- **Sources accepted:** 13
- **Sources rejected:** 0 (all primary documentation sources)
- **Verification:** PASS WITH NOTES
- **Plan:** outputs/.plans/agent-safe-browser-ipc.md
- **Research files:** outputs/.drafts/agent-safe-browser-ipc-research-direct.md

## Sources Accepted

| # | Source | Type |
|---|--------|------|
| 1 | Chrome DevTools Protocol docs | Official docs |
| 2 | WebDriver BiDi W3C Specification | W3C spec |
| 3 | WebDriver BiDi Chrome Blog | Official blog |
| 4 | MDN: runtime.sendMessage() | Official docs |
| 5 | MDN: Content Scripts | Official docs |
| 6 | MDN: Sharing Objects with Page Scripts | Official docs |
| 7 | Chrome: Message Passing | Official docs |
| 8 | Chrome: Native Messaging | Official docs |
| 9 | Chrome: Stay Secure | Official docs |
| 10 | Firefox Source Docs: Xray Vision | Source-level docs |
| 11 | MCP Specification (2025-03-26) | Protocol spec |
| 12 | MCP Transports Specification | Protocol spec |
| 13 | MCP Architecture Overview | Official docs |

## Blocked Capabilities

- **web_search**: All providers failed (Exa: rate-limited; Perplexity: no API key; Gemini: no API key)
- **subagent spawning**: Runtime module error prevented researcher subagent launch
- **MCP security detail page**: Returned minimal content (487 chars) — may contain additional security guidance

## Verification Notes

- 12 key claims verified against source documents (see outputs/.drafts/agent-safe-browser-ipc-verification.md)
- No FATAL issues found
- MAJOR note: Missing web search means potential gaps in 2026-specific CVEs, BiDi spec progress, and new MCP security features
- All numbers, quotes, and architectural claims trace to primary documentation

## Artifacts

| File | Purpose |
|------|---------|
| outputs/.plans/agent-safe-browser-ipc.md | Research plan |
| outputs/.drafts/agent-safe-browser-ipc-research-direct.md | Raw research notes |
| outputs/.drafts/agent-safe-browser-ipc-draft.md | Uncited draft |
| outputs/.drafts/agent-safe-browser-ipc-cited.md | Cited brief |
| outputs/.drafts/agent-safe-browser-ipc-verification.md | Verification log |
| outputs/agent-safe-browser-ipc.md | **Final deliverable** |
| outputs/agent-safe-browser-ipc.provenance.md | This file |
