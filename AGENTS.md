# Repository Guidelines

## Project Overview

Aether is an AI-native browser product in the **research phase** — no implementation code exists yet. The goal is to combine privacy-first AI (Brave), Firefox-native customization (Zen), spatial organization (Arc), and power user depth (Vivaldi), plus native AI agent integration, vim-like keyboard control, sandboxed profiles, composable modules, and full observability.

The current objective is producing a rigorous, data-driven **feature matrix** through multi-agent research before any code is written.

## Current Phase: Feature Matrix Research

No browser engine, UI, or extension code exists. The entire repo is research infrastructure documentation. The browser delivery vehicle (Firefox fork, Chromium fork, custom shell, or privileged extension) has **not been decided**.

### Decisions Already Made

- **IPC architecture**: WebExtension messaging + `exportFunction`/`cloneInto` (Firefox Xray-protected) + optional Native Messaging Host (`docs/ipc-research.md`)
- **Research methodology**: Multi-agent swarm organized into departments + executive council (`docs/research-plan.md`)
- **Feature scoring**: RICE + MoSCoW + Kano model
- **Data persistence**: Postgres (structured findings, audit trail) + Redis (session state, caching) + Memory-Keeper MCP (context snapshots)

### What Has NOT Been Decided

- Browser engine / delivery vehicle
- Any implementation architecture
- Feature scope (the research determines this)

## Architecture & Data Flow

There is no application architecture. The "architecture" is the research pipeline:

```
Wave 1: Discovery (5 agents) + Competitive Intel (6 agents) -- parallel
    |
Wave 2: Market Data Analysis (4 agents) -- uses Wave 1 context
    |
Wave 3: Validation (3 agents) -- Chain of Verification on all findings
    |
Wave 4: Executive Council (5 agents) -- 3 rounds: score -> debate -> vote
    |
Wave 5: Assembly -- compile final feature matrix document
```

Total: ~28 agent launches across 5 waves. Details in `docs/research-plan.md`.

### Agent Council Pattern

The recommended orchestration is a hybrid debate + voting model:

- **Debate** for contentious points (2-3 rounds)
- **Vote** if disagreement persists, using weighted scores
- **Main agent** (Opus) orchestrates; **subagents** (Sonnet) execute focused tasks (~60-70% cost savings)
- Full details in `docs/agent-orchestration-research.md`

## Key Directories

```
/                           Project root
  CLAUDE.md                 AI assistant context (project state, user profile, conventions)
  AGENTS.md                 This file
  docs/                     All research artifacts
    research-plan.md        Master plan: database schema, agent departments, execution waves
    competitive-landscape.md  Browser competitive analysis + 10 market gaps
    ipc-research.md         IPC mechanism evaluation and recommended layered architecture
    agent-orchestration-research.md  Agent patterns, quality control, data persistence
```

## Infrastructure & Tooling

### MCP Servers

| Server | Purpose |
|--------|---------|
| **Postgres MCP** | Structured storage: features, competitors, evidence, votes, debate transcripts |
| **Redis MCP** | Session state, agent coordination, web research cache (15min TTL), vector embeddings |
| **Memory-Keeper MCP** | Context snapshots at wave boundaries, decision checkpoints |
| **Tmux MCP** | Managing parallel agent sessions |
| **Playwright MCP** | Browser automation research |
| **Linear MCP** | Issue tracking (optional) |
| **Slack MCP** | Communication |
| **Context7 MCP** | Documentation lookup |

### External Tools

- **Feynman** (v0.2.16): Autonomous research agent at `~/.local/bin/feynman`, skills at `~/.codex/skills/feynman/`
  - Requires setup: `feynman setup && feynman doctor`
  - Key workflows: `deepresearch` (user needs), `compare` (browser matrices), `review` (peer review), `autoresearch` (disputed features), `lit` (academic research), `watch` (ongoing monitoring)

### Postgres Schema (Not Yet Created)

Tables defined in `docs/research-plan.md` section 1.1:

- `features` -- candidates with RICE/MoSCoW/Kano scores
- `competitors` / `competitor_features` -- competitive matrix
- `user_segments` / `segment_needs` -- user segment modeling
- `pain_points` -- user frustrations with sources
- `research_evidence` -- source URLs, confidence, verification status
- `agent_votes` / `debate_transcripts` -- council decision audit trail

### Redis Key Schema (Not Yet Created)

```
research:session:{id}:status
research:session:{id}:department:{name}:output
research:council:votes:{topic}
research:cache:web:{url_hash}     (15min TTL)
research:queue:pending
```

## Feature Taxonomy

12 categories defined for the feature matrix:

1. Core Browsing
2. AI & Agents
3. Privacy & Security
4. Keyboard & Input
5. Workspace & Organization
6. Extensibility
7. Productivity
8. Developer Tools
9. Performance
10. Sync & Portability
11. Accessibility
12. Social & Collaboration

## IPC Architecture (Pre-Decided)

Four-layer model for future implementation (`docs/ipc-research.md`):

| Layer | Path | Method | Security |
|-------|------|--------|----------|
| 1 | Sidebar <-> Background | `runtime.connect` (ports) | Internal to extension |
| 2 | Background <-> Content Script | `runtime.sendMessage` / ports | Validate sender tab/frame |
| 3 | Content Script <-> Page | `exportFunction` + `cloneInto` | Xray-protected, validate all args |
| 4 | OS-Level (optional) | `runtime.connectNative` | Full user privileges, no binary verification |

**Rejected approaches**: `window.postMessage` (spoofable), WebSocket localhost (auth complexity), Marionette/WebDriver BiDi (extreme risk for internal use).

## Conventions

- **Evidence-based**: Every claim needs a source URL stored in `research_evidence`
- **Parallel-first**: Use agent swarms; serialize only when wave dependencies require it
- **Structured storage**: All findings go into Postgres, not loose files
- **Quality gates**: Cross-agent consistency checks, Chain of Verification, minimum confidence thresholds (70%)
- **Scoring framework**: RICE (quantitative), MoSCoW (scope), Kano (feature type)

## User Profile

- Platform architect / engineering lead
- Arch Linux, tmux, vim-oriented workflow
- Learning Rust
- Prefers terse responses, no trailing summaries
- Values secure-by-design, data-driven decisions
- Wants exhaustive, rigorous research before any implementation

## Pre-Execution Checklist

Before launching Wave 1 of the research plan:

1. Postgres accessible and schema created
2. Redis accessible
3. WebSearch functional
4. Agent tool can launch 5+ parallel agents
5. Memory-Keeper MCP operational
6. Feynman CLI configured (`feynman doctor` passes)
7. Plan file committed

## Research Output Target

Final feature matrix (`docs/superpowers/specs/`) will contain:

- Executive Summary (top 20 features)
- Feature Cards (JTBD, segments, Kano, RICE, MoSCoW, competitive landscape, complexity, dependencies, evidence)
- Gap Analysis (features no competitor has -- minimum 5)
- Risk Register (assumptions, blind spots -- minimum 10)
- User Segment Profiles (prioritized features per segment)
- Competitive Matrix (visual comparison grid)

### Verification Criteria

- 100+ feature candidates in Postgres
- Every feature has 1+ JTBD mapping and 1+ evidence URL
- Council votes recorded with rationale
- All features scored: MoSCoW + RICE + Kano
