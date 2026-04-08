# AI-Native Browser Project (Codename: Aether)

## Project Overview

Building an AI-native browser product that doesn't exist yet — one that combines the best of Brave (privacy/AI), Zen (Firefox customization), Arc (spatial organization), Vivaldi (power user depth), plus features no browser has: native AI agent integration, vim-like keyboard control without ugliness, sandboxed profiles, composable modules, full observability, and agent workflow support.

## Current Phase: Feature Matrix Research

We are in the **research phase** — conducting rigorous, data-driven feature discovery before any implementation. This is intentionally the longest and most thorough phase of the project.

### What Has Been Decided
- IPC architecture: WebExtension messaging + `exportFunction`/`cloneInto` (Firefox-native Xray-protected) + optional Native Messaging Host
- Browser delivery vehicle: NOT YET DECIDED (options: Firefox fork, Chromium fork, custom shell, deeply privileged extension)
- Research methodology: Multi-agent swarm with departments + executive council (see `docs/research-plan.md`)
- The research plan was written but NOT YET EXECUTED — the next session should review, refine, then execute it

### What Has Been Researched (Prior Session)

#### IPC Approaches Evaluated
All Firefox extension IPC mechanisms were researched in depth:
- WebExtension Messaging (`runtime.sendMessage`, `runtime.connect` ports) — recommended for internal channels
- Native Messaging Host — recommended for OS-level capabilities, ~1.5-2ms latency
- `exportFunction` + `cloneInto` — recommended for content-script-to-page (Firefox-specific, Xray-protected)
- MessageChannel/MessagePort — good for private point-to-point channels
- `userScripts` API — good for safer page interaction with isolated worlds
- `window.postMessage` — NOT recommended (any script can intercept/spoof)
- WebSocket localhost — NOT recommended (auth complexity, any process can connect)
- Marionette/WebDriver BiDi — extreme risk, only for external automation
- Firefox RDP / Experiment APIs — Nightly/DevEdition only

#### Competitive Landscape Researched
Comprehensive data collected on:
- **AI browsers**: Brave Leo, Opera AI, Dia (Browser Company), SigmaOS Airis
- **Power user browsers**: Vivaldi, qutebrowser, nyxt, Luakit
- **Firefox ecosystem**: Zen, Floorp, Waterfox, LibreWolf, Tridactyl, Surfingkeys
- **AI extensions**: Bouno, Monica, Merlin, Sider, HARPA, MaxAI, Perplexity
- **Agent infrastructure**: browser-use, Playwright MCP, Stagehand, MultiOn, Browserbase, firefox-devtools-mcp
- **User pain points**: context switching, privacy concerns, power user fragmentation, AI reliability

#### 10 Market Gaps Identified
1. AI-native architecture without surveillance
2. Power user first, mainstream second
3. Keyboard + mouse harmony (vim without ugliness)
4. Agent-safe web access (sandboxed, verified)
5. Context preservation without cognitive overload
6. Developer-first AI integration
7. Modular extensibility (composable primitives)
8. Reliability & graceful degradation
9. Cross-browser sync for portable workflows
10. Transparent AI reasoning (show agent decision-making)

### Tools Installed
- **Feynman** (v0.2.16): Autonomous research agent at `~/.local/bin/feynman`, skills at `~/.codex/skills/feynman/`
  - Needs setup: run `feynman setup` then `feynman doctor`
  - Workflows: `deepresearch`, `lit`, `compare`, `review`, `autoresearch`, `watch`

### MCP Servers Available
- Postgres MCP — for structured research data storage
- Redis MCP — for session state and caching
- Memory-Keeper MCP — for context management
- Tmux MCP — for managing parallel agent sessions
- Linear MCP — for issue tracking
- Slack MCP — for communication
- Playwright MCP — for browser automation research
- Context7 MCP — for documentation lookup

## Next Steps (For New Session)

1. **Review the research plan** at `docs/research-plan.md` — it may need refinement
2. **Run Feynman setup**: `feynman setup && feynman doctor`
3. **Verify infrastructure**: Check Postgres and Redis are accessible
4. **Execute the research plan** in 5 waves:
   - Wave 1: Discovery (5 agents) + Competitive Intelligence (6 agents) — parallel
   - Wave 2: Market Data Analysis (4 agents) — uses Wave 1 context
   - Wave 3: Validation (3 agents) — Chain of Verification on all findings
   - Wave 4: Executive Council (5 agents) — 3 rounds of scoring/debate/voting
   - Wave 5: Assembly — compile final feature matrix document

## User Profile
- Platform architect / engineering lead
- Arch Linux, tmux, vim-oriented workflow
- Learning Rust
- Prefers terse responses, no trailing summaries
- Values secure-by-design, data-driven decisions
- Wants the research phase to be exhaustive and rigorous

## Conventions
- Use agents extensively — parallel swarms when possible
- Store research findings in Postgres with evidence URLs
- Every claim needs a source
- Use Feynman CLI for deep research workflows alongside Claude agents
- Feature scoring: RICE + MoSCoW + Kano model
