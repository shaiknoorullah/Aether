# Researcher Brief T3: Sandboxing, Observability, Reliability & Graceful Degradation

## Your mission
Investigate the operational characteristics of browser AI agents in production: how they're sandboxed, what they expose for observability, where they fail, and how (or whether) they degrade gracefully.

## Questions to answer

1. **Sandboxing**
   - What sandboxing approaches exist for browser agents? (OS-level: Docker/VM/Firecracker; browser-level: profiles, contexts, extensions; cloud: Browserbase/Steel)
   - What are the known escape vectors or over-isolation tradeoffs?
   - How do tools handle credential isolation? (session tokens, cookies crossing agent boundaries)
   - What does "agent-safe" web access actually mean in practice — and does any tool achieve it?
   - Comparison: local sandbox vs cloud browser vs browser extension sandbox

2. **Observability**
   - What tracing/logging do current tools expose? (Playwright trace viewer, browser-use logs, LangSmith traces)
   - What's missing? (token cost per action, semantic step attribution, screenshot diff replay, agent decision tree)
   - How do developers currently debug agent failures in production?
   - What would a production-grade observability stack for browser agents look like?

3. **Reliability failure modes**
   - What are the most common agent failure patterns? (selector rot, dynamic SPAs, iframes, shadow DOM, React re-renders)
   - Anti-bot / CAPTCHA: how do agents fail and how do tools address it?
   - Rate limiting: how do agents handle it?
   - State management: what happens when an agent loses track of page state mid-task?
   - Concurrency: what breaks when running 10+ agent sessions in parallel?

4. **Graceful degradation**
   - Which tools have explicit retry/fallback policies?
   - How do tools handle partial task completion? (is progress preserved?)
   - What happens on network interruption or browser crash during agent task?
   - LLM fallback: if the primary model fails, do any tools support fallback chains?
   - What's the state of "human in the loop" handoff for stuck agents?

5. **Security concerns specific to browser agents**
   - Prompt injection via web pages: how prevalent and how mitigated?
   - Data exfiltration risks when agents have broad browser access
   - Least-privilege access models: does any tool implement them?

## Sources to search

- Playwright trace viewer docs
- LangSmith browser agent tracing
- GitHub issues for reliability bugs in browser-use, Stagehand
- Blog posts on "browser agent reliability", "web automation failure modes"
- Security research on prompt injection in web agents
- Papers/posts on web agent benchmarks (WebArena, VisualWebArena, etc.)
- Docker/Firecracker browser sandboxing approaches

Do NOT fetch raw PDFs. Cite PDF URLs and mark parsing blocked.

## Output

Write findings to: `outputs/.drafts/browser-ai-agent-dev-needs-research-T3.md`

Structure:
- Sandboxing: approaches, gaps, escape vectors
- Observability: what exists, what's missing, ideal stack
- Reliability: failure taxonomy with examples
- Graceful degradation: tool-by-tool assessment
- Security: prompt injection, data exfiltration, least-privilege
- Source URLs

Every claim needs a source URL.
