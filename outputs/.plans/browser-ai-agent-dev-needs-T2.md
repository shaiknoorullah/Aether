# Researcher Brief T2: CDP/IPC Control Surfaces & Agent Browser Infrastructure

## Your mission
Investigate the low-level control plane that browser AI agents depend on: the Chrome DevTools Protocol (CDP), WebDriver BiDi, and the emerging agent-browser infrastructure layer (Browserbase, Steel, Anchor, AgentQL, etc.).

## Questions to answer

1. **CDP (Chrome DevTools Protocol)**
   - What does CDP expose that matters for agents? (DOM, network, input, storage, JS execution)
   - Where does CDP fall short for agentic use? (no semantic layer, brittle on SPAs, latency issues, concurrent session limits)
   - CDP vs WebDriver BiDi: what does BiDi fix and what does it still miss?
   - Are there known CDP bugs or limitations that browser agent developers hit in 2025–2026?

2. **WebDriver BiDi**
   - Current status: what's shipped vs what's spec'd?
   - What agent-relevant capabilities does it add? (subscriptions, low-latency events, network interception)
   - What's still missing compared to CDP?
   - Browser compatibility: Chrome/Firefox/Safari support status

3. **Agent Browser Infrastructure**
   - **Browserbase**: what does it provide beyond raw CDP? (session management, proxies, stealth, CAPTCHA solving, cloud isolation)
   - **Steel** (open-source): architecture, what it offers vs Browserbase
   - **Anchor** (if available): what control surface does it expose?
   - **AgentQL**: semantic query layer over DOM — what problem does it solve and where does it break?
   - **Notte / other entrants**: any other notable infra players?
   - What isolation/security model do cloud browser providers use?

4. **IPC and protocol design**
   - MCP (Model Context Protocol) as a browser control transport: what are its latency and reliability characteristics?
   - gRPC vs WebSocket vs stdio for browser agent IPC: trade-offs
   - What happens when the agent-browser connection drops mid-task?

5. **Gaps**
   - What would an ideal agent-native browser control protocol look like vs what exists?
   - What do infrastructure providers still leave unsolved?

## Sources to search

- Chrome DevTools Protocol spec: https://chromedevtools.github.io/devtools-protocol/
- WebDriver BiDi spec: https://w3c.github.io/webdriver-bidi/
- Browserbase docs and blog
- Steel GitHub and docs
- AgentQL docs
- Web search for "CDP limitations browser agents 2025", "WebDriver BiDi agent", "browser automation infrastructure 2026"
- HN and technical blog posts

Do NOT fetch raw PDFs. Cite PDF URLs and mark parsing blocked.

## Output

Write findings to: `outputs/.drafts/browser-ai-agent-dev-needs-research-T2.md`

Structure:
- CDP: capabilities, limitations, agent-specific gaps
- WebDriver BiDi: current status, what it fixes, remaining gaps
- Agent browser infra: Browserbase, Steel, AgentQL, others
- IPC/transport analysis
- Ideal control surface wishlist vs reality
- Source URLs

Every claim needs a source URL.
