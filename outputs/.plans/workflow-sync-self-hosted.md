# Deep Research Plan: Self-Hostable Workflow/Automation Engines & Local-First Sync Stacks (2026)

**Slug:** `workflow-sync-self-hosted`
**Date:** 2026-06-10
**Status:** AWAITING APPROVAL

---

## Key Questions

1. **Durability guarantees**: How does each engine (Windmill, Temporal, n8n) persist execution state? What are their failure-recovery semantics? Are workflows truly replayable/resumable?
2. **Operational burden**: What infra is required to self-host each engine? What are the failure modes, upgrade paths, and observability stories?
3. **CRDT sync transport fit**: For Yjs and Automerge, which transport (Iroh, libp2p, Syncthing) is most appropriate for browser-native local-first sync? What are the network/hole-punching tradeoffs?
4. **Fit for browser automation + sync layer**: Which workflow engine best handles long-running browser automation tasks? Which CRDT transport best supports a browser + desktop sync scenario?
5. **Interoperability**: Can workflow engines (Temporal/Windmill/n8n) drive browser automation (Playwright, CDP) with CRDT-backed state?

---

## Evidence Needed

### Workflow Engines
- Windmill: execution model, step persistence, worker architecture, self-host reqs (docs + recent blog posts)
- Temporal: workflow history, event sourcing, worker model, replay guarantees (official docs + changelog 2025-2026)
- n8n: execution modes (regular vs queue), persistence backends, known durability gaps (docs + GitHub issues)
- Comparison data: community benchmarks, issue trackers, Reddit/HN discussions (2025-2026)

### CRDT + Sync Transports
- Yjs: awareness protocol, providers (WebSocket, WebRTC, IndexedDB), persistence model
- Automerge: storage model, sync protocol (automerge-repo), diff semantics
- Iroh: blob/doc sync model, QUIC-based transport, NAT traversal, browser support status (2025-2026)
- libp2p: browser-native support (js-libp2p WebTransport/WebRTC), gossip/pubsub for CRDT propagation
- Syncthing: block-sync protocol, suitability for CRDT document sync (not document-level, block-level)

### Browser Automation Fit
- Whether Temporal/Windmill support long-running browser workers
- Community examples of Playwright + Temporal or Windmill
- CRDT state as durable session storage for browser agents

---

## Scale Decision

**→ Subagent-based: 4 researcher subagents** (complex multi-domain topic spanning workflow engines, CRDT theory, sync transports, and browser automation integration)

Decomposition:
- **T1**: Workflow engine depth (Windmill + Temporal) — durability, replay, ops burden
- **T2**: Workflow engine depth (n8n) + comparison synthesis — durability gaps, feature parity
- **T3**: CRDT layer (Yjs + Automerge) — data model, sync protocol, storage
- **T4**: Sync transport layer (Iroh + libp2p + Syncthing) + browser fit

---

## Task Ledger

| ID  | Owner       | Task                                              | Status   | Output File                        |
|-----|-------------|---------------------------------------------------|----------|------------------------------------|
| T1  | researcher  | Windmill + Temporal durability & ops              | PENDING  | workflow-sync-self-hosted-T1.md    |
| T2  | researcher  | n8n durability + workflow engine comparison       | PENDING  | workflow-sync-self-hosted-T2.md    |
| T3  | researcher  | Yjs + Automerge CRDT model & sync protocol        | PENDING  | workflow-sync-self-hosted-T3.md    |
| T4  | researcher  | Iroh + libp2p + Syncthing transport + browser fit | PENDING  | workflow-sync-self-hosted-T4.md    |
| S5  | verifier    | Inline citations + URL verification               | PENDING  | workflow-sync-self-hosted-cited.md |
| S6  | reviewer    | Flag unsupported claims and logical gaps          | PENDING  | workflow-sync-self-hosted-verification.md |
| S7  | lead (self) | Draft synthesis                                   | PENDING  | workflow-sync-self-hosted-draft.md |
| S8  | lead (self) | Deliver final + provenance                        | PENDING  | outputs/workflow-sync-self-hosted.md |

---

## Verification Log

| Check | Expected | Result | Notes |
|-------|----------|--------|-------|
| Temporal replay semantics confirmed | Source URL | PENDING | |
| Windmill step persistence backend | Source URL | PENDING | |
| n8n queue mode durability gap | Source URL | PENDING | |
| Yjs sync protocol spec | Source URL | PENDING | |
| Automerge-repo sync API | Source URL | PENDING | |
| Iroh browser support status | Source URL | PENDING | |
| libp2p WebTransport browser status | Source URL | PENDING | |

---

## Decision Log

| Date       | Decision | Rationale |
|------------|----------|-----------|
| 2026-06-10 | 4 researcher subagents | Multi-domain: 2 workflow + 2 sync, complex enough to warrant parallel evidence |
| 2026-06-10 | Slug: workflow-sync-self-hosted | Matches topic concisely |
