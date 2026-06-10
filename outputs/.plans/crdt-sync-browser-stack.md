# Deep Research Plan: CRDT-Based Sync Layer for Desktop Browser (2026)

**Slug:** crdt-sync-browser-stack
**Date:** 2026-06-10
**Status:** PLANNING

## Key Questions

1. **CRDT engines**: Yjs vs Automerge (v2) — API maturity, data model expressiveness, memory/CPU overhead, ecosystem size, WASM support, document size limits, garbage collection.
2. **Transport layer**: Iroh vs libp2p vs Syncthing — NAT traversal, relay fallback, connection establishment latency, bandwidth overhead, no-cloud requirement feasibility, mobile support, maturity.
3. **E2E encryption + key management**: How to layer E2E encryption over CRDT sync without a central server? Key exchange (X3DH, MLS, Noise), key rotation, device addition/removal, recovery, group sync.
4. **Performance + offline**: Merge latency, document size scaling, cold-start sync time, conflict storm behavior, offline-first guarantees.
5. **Pragmatic stack recommendation**: Which combination minimizes integration friction, maintenance burden, and security risk for a Firefox-fork desktop browser in 2026?

## Evidence Needed

- Official docs / changelogs for Yjs, Automerge, Iroh, libp2p, Syncthing
- Benchmark comparisons (especially Yjs vs Automerge perf papers/posts)
- Real-world production usage reports (e.g., Ink & Switch, Anytype, Hocuspocus)
- E2E encryption patterns for P2P CRDT sync (MLS, Double Ratchet, Noise)
- Key management UX patterns from Signal, Matrix/MLS, Keybase
- Recent (2025-2026) developments: Iroh stability, Automerge 2.x, Yjs CRDT improvements

## Scale Decision

**Multi-faceted comparison across 3 domains (CRDT, transport, crypto) → DEGRADED to lead-direct (subagent spawn failed)**

- T1: Yjs deep-dive (API, perf, ecosystem, limitations)
- T2: Automerge deep-dive (API, perf, ecosystem, limitations)
- T3: Transport layer comparison (Iroh vs libp2p vs Syncthing)
- T4: E2E encryption + key management for P2P CRDT sync

Lead (me) handles: synthesis, stack recommendation, performance/offline cross-cutting analysis, draft, review.

## Task Ledger

| ID | Owner | Task | Status |
|----|-------|------|--------|
| T1 | lead (direct) | Yjs deep-dive | DONE |
| T2 | lead (direct) | Automerge deep-dive | DONE |
| T3 | lead (direct) | Transport: Iroh vs libp2p vs Syncthing | DONE |
| T4 | lead (direct) | E2E encryption + key management | DONE |
| S1 | lead | Synthesize + draft | DONE |
| V1 | lead (direct) | Citation pass | DONE |
| R1 | lead (direct) | Verification review | DONE |

## Verification Log

| Check | Result | Date |
|-------|--------|------|
| All 4 research files on disk | PASS (consolidated to 1 file) | 2026-06-10 |
| Draft written | PASS (24KB) | 2026-06-10 |
| Cited draft written | PASS (20KB, 20 sources) | 2026-06-10 |
| Review pass complete | PASS WITH NOTES (0 FATAL, 0 MAJOR, 5 MINOR) | 2026-06-10 |
| Final artifacts on disk | PASS (5/5 required files) | 2026-06-10 |

## Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| 4 subagents | 3 distinct domains + crypto warrants parallel investigation | 2026-06-10 |
| Slug: crdt-sync-browser-stack | Captures core topic | 2026-06-10 |
