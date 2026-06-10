# Researcher Brief T2: n8n Durability + Workflow Engine Comparison

## Goal
Produce `outputs/.drafts/workflow-sync-self-hosted-T2.md` with sourced findings on n8n and a comparative synthesis across all three engines (Windmill, Temporal, n8n).

## Questions to Answer

### n8n
1. What are n8n's execution modes? (regular vs queue mode — what changes?)
2. How does n8n persist workflow state? (SQLite vs PostgreSQL vs Redis)
3. What happens when a worker crashes mid-execution? Is there resume/retry?
4. What are the self-host requirements in 2025-2026? (minimum infra, scaling story)
5. What are known durability issues? (GitHub issues, community complaints)
6. Does n8n support long-running workflows (hours)? What are the limits?
7. What is n8n's licensing status in 2026? (fair-code vs open-source restrictions)

### Cross-Engine Comparison (Windmill vs Temporal vs n8n)
For each dimension, identify which engine wins and why, with sources:
- **Durability**: failure recovery, replay fidelity, data loss scenarios
- **Operational burden**: infra complexity, upgrade pain, resource floor
- **Long-running task support**: timeout defaults, heartbeat, max duration
- **Browser automation fit**: Playwright workers, CDP integration, community examples
- **Observability**: built-in dashboards, Prometheus metrics, structured logs
- **Extensibility**: custom worker runtimes, language support
- **Community health**: GitHub stars, issue velocity, active maintainers (2026 snapshot)

## Sources to Check
- https://docs.n8n.io (architecture, queue mode, scaling)
- https://github.com/n8n-io/n8n (issues, releases, license file)
- https://community.n8n.io (common durability complaints)
- Any head-to-head comparison blog posts (2024-2026)
- Reddit r/selfhosted, HN, dev.to articles comparing the three
- https://windmill.dev/blog and https://temporal.io/blog for self-positioning

## Output Format
Write `outputs/.drafts/workflow-sync-self-hosted-T2.md` with:
- n8n findings, each claim sourced
- Comparison table across all three engines
- Recommendation ranking for browser automation + sync use case
- Uncertainties and gaps explicitly noted
- All source URLs listed at the bottom
