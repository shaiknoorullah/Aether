# Researcher Brief T1: Windmill + Temporal — Durability, Replay, Ops Burden

## Goal
Produce `outputs/.drafts/workflow-sync-self-hosted-T1.md` with sourced findings on Windmill and Temporal as self-hostable durable workflow engines.

## Questions to Answer

### Windmill
1. How does Windmill persist execution state? (PostgreSQL-backed? What schema?)
2. What are the replay/resume semantics when a worker crashes mid-step?
3. What are self-host requirements? (Docker Compose, Kubernetes, resource minimums)
4. What is the observability story? (logs, metrics, tracing)
5. Any known durability gaps or open issues? (GitHub issues, community reports 2024-2026)
6. How does Windmill handle long-running tasks (hours/days)? Heartbeat/keepalive mechanism?

### Temporal
1. How does Temporal's event history / event sourcing model guarantee replay?
2. What are the self-host requirements for Temporal Server? (Cassandra vs PostgreSQL backend, resource cost)
3. What is the operational complexity: upgrades, schema migrations, worker management?
4. What are known failure modes? (history shard issues, worker disconnects)
5. How does Temporal handle browser automation tasks that run for extended periods?
6. Temporal Cloud vs self-hosted: what durability/reliability delta exists?

## Sources to Check
- https://www.windmill.dev/docs (architecture, execution model)
- https://github.com/windmill-labs/windmill (issues, releases)
- https://docs.temporal.io (workflows, workers, event history)
- https://github.com/temporalio/temporal (issues, changelog)
- Recent blog posts, HN discussions, Reddit r/selfhosted (2024-2026)
- Any benchmark or comparison posts

## Output Format
Write `outputs/.drafts/workflow-sync-self-hosted-T1.md` with:
- Findings per tool, each claim tagged with a source URL
- A summary table: Windmill vs Temporal on durability, ops burden, replay fidelity, long-running task support
- Uncertainties and gaps explicitly noted
- All source URLs listed at the bottom
