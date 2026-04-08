# Research Infrastructure Plan: AI-Native Browser Feature Matrix

## Context

We're building a feature matrix for an AI-native browser product that combines the best of Brave (privacy/AI), Zen (Firefox-native customization), Arc (spatial organization), Vivaldi (power user depth), and adds what none of them have: native AI agent integration, vim-like keyboard control without ugliness, sandboxed profiles, composable modules, and full observability. Before building any features, we need rigorous, data-driven research to identify what to build and why.

The user explicitly wants this to be the most thorough phase of the entire project — a swarm of research agents organized into councils and departments, with quality gates and audit trails.

---

## Phase 1: Research Infrastructure Setup

### 1.1 Create Research Database Schema (Postgres)

Store all research findings in structured tables for querying, auditing, and scoring.

```
Tables:
- features(id, name, category, subcategory, description, source, jtbd_job, kano_class, rice_score, moscow_priority, confidence, status)
- competitors(id, name, engine, ai_native, open_source, platforms, user_base_estimate)
- competitor_features(competitor_id, feature_id, implementation_quality, notes)
- user_segments(id, name, description, size_estimate, priority)
- segment_needs(segment_id, feature_id, importance, frequency)
- pain_points(id, description, source, severity, affected_segments, frequency)
- research_evidence(id, feature_id, source_url, source_type, claim, confidence, verified)
- agent_votes(id, feature_id, agent_role, vote, confidence, rationale, round)
- debate_transcripts(id, topic, round, agent_role, position, evidence_cited)
```

### 1.2 Create Redis Research State

Track live research session state, agent coordination, and caching.

```
Keys:
- research:session:{id}:status — current phase
- research:session:{id}:department:{name}:output — department findings
- research:council:votes:{topic} — vote tallies
- research:cache:web:{url_hash} — cached web research (15min TTL)
- research:queue:pending — tasks awaiting agent pickup
```

### 1.3 Feature Category Taxonomy

Define the dimensions the feature matrix will cover:

```
1. CORE BROWSING        — tabs, navigation, bookmarks, history, downloads, search
2. AI & AGENTS          — LLM sidebar, agent automation, local models, monitoring, audit trail
3. PRIVACY & SECURITY   — tracking protection, fingerprint defense, sandboxed profiles, permissions
4. KEYBOARD & INPUT     — vim modes, command palette, shortcuts, gestures, voice
5. WORKSPACE & ORG      — workspaces, tab groups, split view, session management
6. EXTENSIBILITY        — extension API, modules, MCP support, scripting, theming
7. PRODUCTIVITY         — email, calendar, notes, knowledge base, reading mode
8. DEVELOPER TOOLS      — devtools, console, network, performance, debugging
9. PERFORMANCE          — rendering, memory, startup, caching
10. SYNC & PORTABILITY  — cross-device, profile export, settings portability
11. ACCESSIBILITY       — screen reader, contrast, motion, keyboard-only navigation
12. SOCIAL & COLLAB     — shared sessions, annotations, comments
```

---

## Phase 2: Agent Department Structure

### Department 1: DISCOVERY (Jobs-to-Be-Done Research)

**Purpose**: Identify WHY users need features — the underlying jobs, pains, and gains.

**Agents** (5 parallel general-purpose agents):

| Agent | Focus Area | Data Sources |
|-------|-----------|-------------|
| **User Researcher — Power Users** | Vim users, developers, Arch/Linux users, keyboard-first workflows | Reddit r/vim, r/firefox, r/unixporn, HN, qutebrowser/nyxt/tridactyl issues |
| **User Researcher — Knowledge Workers** | Researchers, writers, analysts, tab hoarders | Reddit r/productivity, r/PKMS, Arc community posts, Notion/Obsidian forums |
| **User Researcher — Privacy Advocates** | Security-conscious users, journalists, activists | Reddit r/privacy, r/privacytoolsIO, Brave community, LibreWolf users |
| **User Researcher — Casual Users** | Non-technical users, mainstream adoption barriers | Reddit r/browsers, Google/Apple forums, mainstream tech reviews |
| **User Researcher — AI/Agent Builders** | Developers building browser agents, automation users | browser-use GitHub, Playwright MCP, Stagehand, Browserbase, HARPA users |

**Methodology**: Each agent conducts simulated JTBD interviews by:
1. Searching forums/communities for real user statements about browser frustrations
2. Extracting the "job" (what they're trying to accomplish)
3. Identifying the "pain" (what prevents them)
4. Proposing the "gain" (what ideal looks like)

**Output**: Pain points + opportunities mapped to user segments, stored in Postgres.

**Quality Gate**: Cross-agent consistency check — if 3+ agents identify the same pain, it's HIGH confidence.

---

### Department 2: COMPETITIVE INTELLIGENCE

**Purpose**: Map what exists, what works, what fails, and where the gaps are.

**Agents** (6 parallel general-purpose agents):

| Agent | Focus Area | Competitors |
|-------|-----------|-------------|
| **Analyst — AI Browsers** | AI integration depth, agent capabilities | Brave Leo, Opera AI, Dia, SigmaOS Airis |
| **Analyst — Power User Browsers** | Customization, keyboard, developer features | Vivaldi, qutebrowser, nyxt, Luakit |
| **Analyst — Privacy Browsers** | Tracking protection, fingerprinting, sandboxing | Brave, LibreWolf, Tor Browser, Mullvad |
| **Analyst — Firefox Ecosystem** | Firefox forks, extensions, community | Zen, Floorp, Waterfox, LibreWolf, Tridactyl, Surfingkeys |
| **Analyst — AI Extensions** | Extension-based AI tools | Bouno, Monica, Merlin, Sider, HARPA, MaxAI, Perplexity |
| **Analyst — Agent Infrastructure** | How agents interact with browsers | browser-use, Playwright MCP, Stagehand, MultiOn, Browserbase, firefox-devtools-mcp |

**Methodology**: Each agent:
1. Fetches official documentation + feature pages
2. Searches user reviews and sentiment
3. Checks GitHub stars, issues, commit activity
4. Maps features to our taxonomy categories
5. Rates implementation quality (1-5)

**Output**: Populated competitor_features table with quality ratings.

**Quality Gate**: Two agents must independently verify any feature claim. Disputed claims go to Validation Department.

---

### Department 3: MARKET & DATA ANALYSIS

**Purpose**: Quantitative data to back up qualitative findings.

**Agents** (4 parallel general-purpose agents):

| Agent | Focus Area | Data Sources |
|-------|-----------|-------------|
| **Data Analyst — Extension Ecosystem** | Most popular extensions reveal unmet browser needs | AMO top extensions, Chrome Web Store categories, download counts |
| **Data Analyst — Browser Trends** | Market share, adoption patterns, switching behavior | StatCounter, CanIUse, Web Almanac, browser survey data |
| **Data Analyst — GitHub Signal** | Open source browser activity, feature requests | Firefox Bugzilla top voted, Chromium starred issues, Zen/Brave/Vivaldi repos |
| **Data Analyst — Community Sentiment** | What users actually talk about | Reddit post frequency analysis, HN frontpage browser posts, Twitter/X trends |

**Methodology**: Each agent:
1. Searches for quantitative data
2. Extracts numbers (download counts, star counts, vote counts)
3. Ranks features by demand signal strength
4. Cross-references with Discovery Department's pain points

**Output**: Quantitative demand signals per feature category, stored in Postgres.

**Quality Gate**: All numbers must have source URLs stored in research_evidence table.

---

### Department 4: VALIDATION & FACT-CHECKING

**Purpose**: Verify all claims from other departments using Chain of Verification.

**Agents** (3 agents, run AFTER departments 1-3):

| Agent | Role |
|-------|------|
| **Fact Checker** | Takes top 50 claims from other departments, independently verifies each via web search |
| **Evidence Collector** | For each verified claim, finds 2+ independent sources |
| **Consistency Auditor** | Checks cross-department agreement — flags contradictions |

**Methodology**: Chain of Verification (CoVe):
1. Take claim from research output
2. Generate verification questions (without seeing original evidence)
3. Search for answers independently
4. Compare with original claim
5. Score confidence: VERIFIED / PARTIALLY_VERIFIED / UNVERIFIED / CONTRADICTED

**Output**: Updated confidence scores on all features and pain points.

**Quality Gate**: Any feature with <70% confidence gets flagged for manual review.

---

## Phase 3: Executive Council

### Council Structure

After all departments complete, the Executive Council convenes.

**Council Members** (5 agents):

| Agent | Role | Perspective |
|-------|------|-------------|
| **Product Strategist** | Synthesizes all department outputs into coherent product vision | Market fit, differentiation |
| **Technical Architect** | Evaluates feasibility, complexity, dependencies | Engineering cost, architecture |
| **User Advocate** | Champions user needs over technical elegance | UX, accessibility, learning curve |
| **Security Auditor** | Evaluates privacy/security implications of every feature | Attack surface, trust model |
| **Devil's Advocate** | Actively argues against popular features, finds blind spots | Risks, assumptions, biases |

### Council Process

**Round 1 — Independent Scoring**:
Each council member independently scores top features using RICE:
- Reach: How many users benefit? (1-10)
- Impact: How much does it improve their experience? (1-5)  
- Confidence: How sure are we about reach/impact? (0.5-1.0)
- Effort: Engineering months estimate (1-10)

**Round 2 — Debate**:
Council members share scores. Where scores diverge by >30%, a structured debate occurs:
- Highest scorer presents case FOR
- Lowest scorer presents case AGAINST
- Other members ask questions
- All revise scores

**Round 3 — Final Vote + MoSCoW**:
- Vote on final RICE scores (weighted average)
- Classify each feature: Must / Should / Could / Won't
- Document rationale for every classification

**Output**: Final ranked feature matrix with:
- RICE scores
- MoSCoW classification
- Kano category (Must-have / Performance / Delighter)
- Confidence level
- Dependencies
- Rationale

---

## Phase 4: Feature Matrix Assembly

### Output Format

The final feature matrix document will include:

1. **Executive Summary** — Top 20 features with 1-line descriptions
2. **Feature Cards** — For each feature:
   - Name, category, description
   - JTBD job it serves
   - User segments affected
   - Kano classification
   - RICE score breakdown
   - MoSCoW priority
   - Competitive landscape (who has it, how good)
   - Technical complexity estimate
   - Dependencies on other features
   - Evidence sources
3. **Gap Analysis** — Features no competitor has
4. **Risk Register** — Assumptions, blind spots, low-confidence areas
5. **User Segment Profiles** — With prioritized feature lists per segment
6. **Competitive Matrix** — Visual comparison grid

---

## Execution Plan

### Wave 1: Discovery + Competitive Intelligence (parallel)
- Launch Department 1 (5 agents) + Department 2 (6 agents) simultaneously
- Store all outputs in Postgres via structured JSON
- Estimated: 11 parallel agents, ~30min each

### Wave 2: Market Data Analysis
- Launch Department 3 (4 agents) with context from Wave 1
- Cross-reference quantitative data with qualitative findings
- Estimated: 4 parallel agents, ~20min each

### Wave 3: Validation
- Launch Department 4 (3 agents) on all Wave 1+2 outputs
- Apply Chain of Verification to top 50 claims
- Estimated: 3 sequential agents (must verify in order), ~15min each

### Wave 4: Executive Council
- Launch 5 council agents with all validated findings
- Run 3 rounds of scoring → debate → final vote
- Estimated: 5 agents, 3 rounds, ~45min total

### Wave 5: Assembly
- Single agent assembles final feature matrix document
- Product-manager agent creates the formatted deliverable
- Write to `docs/superpowers/specs/` as the feature matrix spec

### Total Estimated Agent Launches: ~28 agents across 5 waves
### Tools Used:
- **WebSearch/WebFetch**: Primary research tool for all departments
- **Postgres MCP**: Structured storage for features, evidence, votes
- **Redis MCP**: Session state, caching, agent coordination
- **Memory-Keeper MCP**: Context snapshots at each wave boundary
- **Linear MCP**: (optional) Create issues for top features
- **Agent tool**: Orchestrate all department/council launches

---

## Verification

After execution, verify:
1. Postgres tables populated with ≥100 feature candidates
2. Each feature has ≥1 JTBD job mapping
3. Each feature has ≥1 evidence source URL
4. Council votes are recorded with rationale
5. Final matrix has MoSCoW + RICE + Kano for all features
6. Gap analysis identifies ≥5 features no competitor has
7. Risk register has ≥10 documented assumptions

---

## Feynman Integration

Feynman (v0.2.16) is installed at `~/.local/bin/feynman` with skills at `~/.codex/skills/feynman/`.

### Feynman Workflows to Use in This Research

| Workflow | Command | Use In |
|----------|---------|--------|
| **Deep Research** | `feynman deepresearch "<topic>"` | Department 1 (Discovery) — deep dive into user needs per segment |
| **Literature Review** | `feynman lit "<topic>"` | Department 3 (Market Data) — academic/industry research on browser UX, agent safety, privacy |
| **Source Comparison** | `feynman compare "<topic>"` | Department 2 (Competitive Intel) — structured comparison matrices of competing browsers |
| **Watch** | `feynman watch "<topic>"` | Ongoing — set up watches on browser AI, WebExtension APIs, W3C specs |
| **Peer Review** | `feynman review "<artifact>"` | Department 4 (Validation) — peer review our own research outputs |
| **Auto Research** | `feynman autoresearch "<idea>"` | Executive Council — autonomous investigation of contentious feature ideas |

### Integration with Agent Pipeline

Each department can dispatch Feynman via tmux panes for parallel deep research:

1. **Discovery agents** use `feynman deepresearch` for each user segment
2. **Competitive agents** use `feynman compare` for browser-vs-browser matrices
3. **Validation agents** use `feynman review` to peer-review other departments' outputs
4. **Executive Council** uses `feynman autoresearch` for disputed features

Feynman outputs (with provenance tracking and citations) are collected from `outputs/` and fed into the Postgres evidence table.

### Feynman Setup Required

Before Wave 1:
```bash
feynman setup          # Run guided setup wizard
feynman model set <provider/model>  # Configure LLM backend
feynman doctor         # Verify all dependencies
```

---

## Pre-Execution Checklist

Before launching Wave 1, verify:
- [ ] Postgres is accessible and schema is created
- [ ] Redis is accessible
- [ ] WebSearch is functional
- [ ] Agent tool can launch ≥5 parallel agents
- [ ] Memory-keeper MCP is operational
- [ ] Feynman CLI installed and configured (`feynman doctor` passes)
- [ ] Feynman skills synced to `~/.codex/skills/feynman/`
- [ ] Plan file committed for reference
