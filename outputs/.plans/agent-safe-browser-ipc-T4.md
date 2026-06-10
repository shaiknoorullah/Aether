# T4: MCP Browser Control + AI Agent Integration Security

## Objective
Research the Model Context Protocol's role in browser automation and AI agent integration, including its security model.

## Questions to Answer
1. What is MCP's current specification status (2025-2026)? What transport mechanisms does it support?
2. What MCP browser server implementations exist (Playwright MCP, browser-use, etc.)?
3. How does MCP layer over CDP/BiDi/extensions? What abstraction does it provide?
4. What security model does MCP define? (authentication, authorization, capability scoping)
5. What are the risks of MCP as a browser control layer? (prompt injection, tool misuse, over-permissioning)
6. How do MCP implementations handle consent and human-in-the-loop for destructive browser actions?
7. What is the state of MCP sandboxing and isolation?
8. How does MCP compare to direct CDP/BiDi for agent safety?

## Search Strategy
- Search for "Model Context Protocol specification 2025 2026", "MCP security model"
- Search for "MCP browser automation", "Playwright MCP server", "MCP browser control"
- Search for "MCP prompt injection risks", "MCP tool authorization"
- Check Anthropic's MCP documentation and GitHub repos
- Search for "AI agent browser control security 2025 2026"
- Look for blog posts and analyses of MCP security concerns

## Output
Write findings to `outputs/.drafts/agent-safe-browser-ipc-research-T4.md` with:
- Section per question
- Source URLs for every claim
- MCP architecture diagram (text-based)
- Security gap analysis
- Comparison with direct protocol access
