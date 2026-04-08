# Agent Orchestration Research

## Research Methodology Pipeline (Recommended Order)

1. **JTBD** (Jobs to Be Done) — understand WHY users need features
2. **Opportunity Solution Tree** — map discoveries to solutions systematically
3. **Kano Model** — categorize features (must-have / performance / delighter)
4. **Value Proposition Canvas** — validate product-market fit
5. **RICE Scoring** — quantitative prioritization (Reach x Impact x Confidence / Effort)
6. **MoSCoW** — final scope locking (Must / Should / Could / Won't)

## Agent Council Patterns

### Debate-Based Consensus
- Agents exchange arguments iteratively (round-robin)
- 2.8% improvement in knowledge tasks
- Best for: complex trade-off discussions

### Voting-Based Council
- Agents evaluate independently, coordinator tallies weighted votes
- 13.2% improvement in reasoning tasks
- Best for: quick decisions, avoiding groupthink

### Hybrid (Recommended)
- Debate for N rounds on contentious points
- Vote if disagreement persists after 3 rounds
- Combines debate's nuance with voting's decisiveness

### Multi-Agent Jury
- Expert proposes -> Critic finds flaws -> Defender challenges -> Jury decides
- Best for: research validation and quality gates

### Mixture of Agents
- Heterogeneous agents (different LLM backends) outperform homogeneous
- Combining Claude + GPT + Gemini yields highest accuracy
- Best for: critical conclusions needing diversity

## Quality Control Mechanisms

### Chain of Verification (CoVe)
1. Generate initial response
2. Plan verification questions
3. Answer verification questions WITHOUT seeing draft
4. Generate verified final answer
- Doubles precision, halves hallucinations

### Multi-Agent Fact-Checking Pipeline
1. Input Ingestion Agent (normalize claims)
2. Query Generation Agent (formulate verification queries)
3. Evidence Seeking Agent (retrieve supporting/refuting evidence)
4. Verdict Prediction Agent (judge accuracy)

### Self-Consistency Validation
- Multiple agents independently reach same conclusion = higher confidence
- Disagreements trigger deeper investigation

## Claude Code Orchestration Pattern

### Main Agent (Opus) — orchestrator
- Manages research workflow
- Delegates to specialized subagents
- Synthesizes results

### Subagents (Sonnet) — workers
- Discovery Specialist (JTBD)
- Analysis Specialist (Kano + competitive)
- Validation Specialist (fact-checking)
- Prioritization Specialist (RICE + MoSCoW)

### Parallel Dispatch
```
Research Query (Main)
    |
    +-> [Discovery Subagent] - JTBD research
    +-> [Analysis Subagent] - Competitive analysis
    +-> [Market Subagent] - Trend research
    |
[Gather Results]
    |
[Main Agent] - Synthesize + debate
    |
[Validation Subagent] - Final fact-check
    |
[Prioritization Subagent] - Score & rank
    |
Result
```

### Cost Optimization
- Main agent: Opus (complex reasoning)
- Subagents: Sonnet (focused tasks)
- ~60-70% cost savings vs all-Opus

## Data Persistence

### Redis (ephemeral)
- Session state, debate transcripts
- Agent confidence scores, vote tallies
- Vector embeddings for semantic search
- Web research cache (15min TTL)

### Postgres (persistent)
- Audit trail of all decisions + justifications
- Feature candidates with metadata
- Department outputs + timestamps

### Memory-Keeper MCP
- Context snapshots at each wave boundary
- Decision checkpoints
- Links between findings
