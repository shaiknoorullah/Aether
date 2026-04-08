# Ultraplan: Aether Browser Feature Matrix Research

## Status

- **Phase**: Pre-implementation research
- **Objective**: Produce a rigorous, data-driven feature matrix through multi-agent research
- **Infrastructure**: Memory-Keeper MCP (working), Feynman CLI (working), Postgres (not provisioned), Redis (not provisioned)
- **Storage Strategy**: Structured markdown + JSON in `docs/research-data/`, Memory-Keeper for context snapshots. Postgres/Redis deferred until services are provisioned.

---

## Feynman Integration Strategy

### Capabilities Assessment

Feynman v0.2.16 is installed with claude-opus-4-6 as the default model. Available workflows:

| Workflow | Agents Used | Integration Point | Status |
|----------|------------|-------------------|--------|
| `deepresearch` | researcher, verifier, reviewer | Discovery Department deep dives | Ready |
| `compare` | researcher, verifier | Competitive Intel browser comparisons | Ready |
| `review` | researcher, reviewer | Validation Department peer review | Ready |
| `watch` | researcher | Ongoing trend monitoring | Ready |
| `autoresearch` | (direct tools) | Iterative hypothesis testing | Ready |
| `lit` | researcher, verifier, reviewer | Academic literature surveys | BLOCKED (alphaXiv auth) |
| `audit` | researcher, verifier | Validating competitor claims | Ready |

### Feynman vs Claude Agents: Division of Labor

**Feynman handles** (long-form, source-heavy, needs provenance tracking):
- Deep user segment research (JTBD deep dives) — `deepresearch`
- Browser-vs-browser comparisons — `compare`
- Peer review of our own research outputs — `review`
- Ongoing monitoring of browser AI landscape — `watch`
- Auditing competitor feature claims — `audit`

**Claude Code task agents handle** (structured analysis, parallel orchestration, synthesis):
- Extension ecosystem analysis (needs structured data extraction)
- Agent infrastructure analysis (needs code/API evaluation)
- Community sentiment analysis (needs forum scraping + pattern extraction)
- Cross-department synthesis and scoring
- Executive Council debate/voting mechanics
- Final feature matrix assembly

### Feynman Execution Model

Feynman runs as a separate CLI in tmux panes. Integration pattern:

```
Claude Agent (orchestrator)
    |
    +-- tmux pane 1: feynman deepresearch "Browser power users JTBD"
    +-- tmux pane 2: feynman compare "Brave vs Zen vs Vivaldi vs Arc"
    +-- tmux pane 3: feynman deepresearch "AI agent browser integration"
    |
    [Feynman outputs to outputs/ with .provenance.md sidecars]
    |
    Claude Agent collects outputs, stores in Memory-Keeper, synthesizes
```

Each Feynman session runs 15-30 minutes. Results are collected from:
- `outputs/` directory (research briefs with inline citations)
- `.provenance.md` sidecar files (source tracking)
- Session transcripts in `~/.feynman/sessions/` (JSONL)

### Feynman Evaluation Protocol

Before deploying Feynman at scale, run 2 test queries:
1. `feynman deepresearch "Browser keyboard-first navigation approaches and user adoption"` — tests source quality for our domain
2. `feynman compare "Brave AI vs Opera AI vs Dia AI browser features"` — tests comparison matrix quality

Evaluate on: citation quality, factual accuracy, depth of analysis, provenance completeness.

---

## Wave Execution Plan

### Wave 1: Discovery + Competitive Intelligence (PARALLEL)

**Runs simultaneously. 11 parallel research streams.**

#### Department 1: Discovery (JTBD Research) — 5 streams

| Stream | Method | Topic | Output |
|--------|--------|-------|--------|
| D1: Power Users | Feynman `deepresearch` (tmux) | "Browser power user needs: vim users, developers, keyboard-first workflows, Linux users. Forums: Reddit r/vim, r/firefox, r/unixporn, HN, qutebrowser/nyxt/tridactyl issue trackers. Extract jobs-to-be-done, pains, gains." | `docs/research-data/discovery/power-users.md` |
| D2: Knowledge Workers | Claude task agent | Research needs of researchers, writers, analysts, tab hoarders. Sources: Reddit r/productivity, r/PKMS, Arc community, Notion/Obsidian forums. Extract JTBD pain/gain. | `docs/research-data/discovery/knowledge-workers.md` |
| D3: Privacy Advocates | Claude task agent | Security-conscious users, journalists, activists. Sources: Reddit r/privacy, r/privacytoolsIO, Brave community, LibreWolf users. Extract JTBD. | `docs/research-data/discovery/privacy-advocates.md` |
| D4: Casual Users | Claude task agent | Non-technical users, mainstream adoption barriers. Sources: Reddit r/browsers, mainstream tech reviews. Extract JTBD. | `docs/research-data/discovery/casual-users.md` |
| D5: AI/Agent Builders | Feynman `deepresearch` (tmux) | "AI agent browser automation needs: developers building browser agents, automation users. Sources: browser-use GitHub, Playwright MCP, Stagehand, Browserbase, HARPA users. Extract jobs-to-be-done." | `docs/research-data/discovery/ai-agent-builders.md` |

#### Department 2: Competitive Intelligence — 6 streams

| Stream | Method | Topic | Output |
|--------|--------|-------|--------|
| C1: AI Browsers | Feynman `compare` (tmux) | "Compare AI browser features: Brave Leo vs Opera AI vs Dia vs SigmaOS Airis. Dimensions: AI model access, agent capabilities, privacy, pricing, platform support, UX." | `docs/research-data/competitive/ai-browsers.md` |
| C2: Power User Browsers | Feynman `compare` (tmux) | "Compare power user browsers: Vivaldi vs qutebrowser vs nyxt vs Luakit. Dimensions: customization, keyboard control, tab management, developer tools, extensibility." | `docs/research-data/competitive/power-user-browsers.md` |
| C3: Privacy Browsers | Claude task agent | Analyze Brave, LibreWolf, Tor Browser, Mullvad. Tracking protection, fingerprinting, sandboxing depth. | `docs/research-data/competitive/privacy-browsers.md` |
| C4: Firefox Ecosystem | Claude task agent | Analyze Zen, Floorp, Waterfox, LibreWolf, Tridactyl, Surfingkeys. Community health, feature quality, fork sustainability. | `docs/research-data/competitive/firefox-ecosystem.md` |
| C5: AI Extensions | Claude task agent | Analyze Bouno, Monica, Merlin, Sider, HARPA, MaxAI, Perplexity. Capabilities, pricing, user satisfaction, MCP support. | `docs/research-data/competitive/ai-extensions.md` |
| C6: Agent Infrastructure | Claude task agent | Analyze browser-use, Playwright MCP, Stagehand, MultiOn, Browserbase, firefox-devtools-mcp. Architecture, reliability, security model. | `docs/research-data/competitive/agent-infrastructure.md` |

**Wave 1 Quality Gate**: Cross-reference Discovery pain points with CompIntel gaps. If 3+ Discovery streams identify the same pain and CompIntel confirms no existing solution, flag as HIGH CONFIDENCE gap.

---

### Wave 2: Market Data Analysis (4 parallel streams)

**Depends on Wave 1 context. Quantitative validation of qualitative findings.**

| Stream | Method | Topic | Output |
|--------|--------|-------|--------|
| M1: Extension Ecosystem | Claude task agent | Top browser extensions by category and download count. What do extensions solve that browsers should? AMO + Chrome Web Store data. | `docs/research-data/market/extension-ecosystem.md` |
| M2: Browser Trends | Claude task agent | Market share data, adoption patterns, switching behavior. StatCounter, CanIUse, Web Almanac. | `docs/research-data/market/browser-trends.md` |
| M3: GitHub Signal | Claude task agent | Firefox Bugzilla top-voted, Chromium starred issues, Zen/Brave/Vivaldi repo activity. Feature request frequency. | `docs/research-data/market/github-signals.md` |
| M4: Community Sentiment | Claude task agent | Reddit post frequency analysis, HN frontpage browser posts. What browser topics get the most engagement? | `docs/research-data/market/community-sentiment.md` |

**Wave 2 Quality Gate**: All numbers must have source URLs. Cross-reference with Wave 1 pain points — quantitative data that contradicts qualitative findings triggers deeper investigation.

---

### Wave 3: Validation (3 agents, SEQUENTIAL)

**Chain of Verification on top 50 claims from Waves 1-2.**

| Agent | Role | Method |
|-------|------|--------|
| V1: Fact Checker | Take top 50 claims, independently verify via web search | Claude task agent |
| V2: Evidence Collector | For each verified claim, find 2+ independent sources | Feynman `review` |
| V3: Consistency Auditor | Check cross-department agreement, flag contradictions | Claude task agent |

**Wave 3 Quality Gate**: Claims scored VERIFIED / PARTIALLY_VERIFIED / UNVERIFIED / CONTRADICTED. Features with <70% confidence flagged for manual review.

---

### Wave 4: Executive Council (5 agents, 3 rounds)

**Hybrid debate + voting on validated findings.**

| Agent | Role | Perspective |
|-------|------|-------------|
| Product Strategist | Synthesize into product vision | Market fit, differentiation |
| Technical Architect | Evaluate feasibility and complexity | Engineering cost, architecture |
| User Advocate | Champion user needs | UX, accessibility, learning curve |
| Security Auditor | Evaluate security implications | Attack surface, trust model |
| Devil's Advocate | Argue against popular features | Risks, assumptions, biases |

**Round 1**: Independent RICE scoring (Reach 1-10, Impact 1-5, Confidence 0.5-1.0, Effort 1-10)
**Round 2**: Debate where scores diverge >30%. Highest scorer argues FOR, lowest AGAINST.
**Round 3**: Final vote + MoSCoW classification (Must/Should/Could/Won't)

---

### Wave 5: Assembly (1 agent)

Compile final feature matrix document:
1. Executive Summary — top 20 features
2. Feature Cards — full metadata per feature
3. Gap Analysis — features no competitor has (minimum 5)
4. Risk Register — assumptions and blind spots (minimum 10)
5. User Segment Profiles — prioritized features per segment
6. Competitive Matrix — visual comparison grid

Output: `docs/feature-matrix.md`

---

## Data Flow

```
Wave 1 (Discovery + CompIntel)
    |
    +-> docs/research-data/discovery/*.md    (5 JTBD reports)
    +-> docs/research-data/competitive/*.md  (6 competitive analyses)
    +-> Memory-Keeper: context snapshots
    |
Wave 2 (Market Data)
    |
    +-> docs/research-data/market/*.md       (4 quantitative reports)
    +-> Cross-reference matrix with Wave 1
    |
Wave 3 (Validation)
    |
    +-> docs/research-data/validation/       (verified claims, confidence scores)
    +-> Feynman review outputs + provenance
    |
Wave 4 (Executive Council)
    |
    +-> docs/research-data/council/          (RICE scores, debate transcripts, votes)
    |
Wave 5 (Assembly)
    |
    +-> docs/feature-matrix.md               (FINAL DELIVERABLE)
```

---

## Infrastructure Contingencies

| Resource | Status | Workaround |
|----------|--------|------------|
| Postgres | Not provisioned | Structured markdown + JSON files in `docs/research-data/` |
| Redis | Not provisioned | Memory-Keeper MCP for state management |
| alphaXiv | Not configured | Skip `lit` workflow; use `deepresearch` with web sources instead |
| Pandoc | Not installed | Not needed for research phase |

When Postgres/Redis become available, research data can be migrated from files into the schema defined in `docs/research-plan.md`.

---

## Feynman Monitoring

During Feynman tmux sessions:
- Check `feynman jobs` for active processes
- Session transcripts at `~/.feynman/sessions/` (JSONL)
- Research outputs at `outputs/` in the working directory
- Provenance files at `outputs/*.provenance.md`
- Use `feynman search <query>` to search past session content
