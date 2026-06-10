# Researcher Brief T3: Yjs + Automerge — CRDT Model & Sync Protocol

## Goal
Produce `outputs/.drafts/workflow-sync-self-hosted-T3.md` with sourced findings on Yjs and Automerge as CRDT backends for local-first browser sync.

## Questions to Answer

### Yjs
1. What is Yjs's internal CRDT model? (YATA algorithm, List/Map/Text types)
2. How does Yjs handle provider-based sync? (y-websocket, y-webrtc, y-indexeddb)
3. What are Yjs's persistence semantics? (updates as binary, snapshots, garbage collection)
4. What are awareness/presence capabilities?
5. What are known correctness issues or edge cases? (large document performance, GC correctness)
6. What is Yjs's maturity/adoption status in 2025-2026?
7. How does Yjs handle offline/reconnect scenarios?

### Automerge (automerge-repo)
1. What is Automerge's CRDT model? (JSON CRDT, RGA for sequences)
2. How does automerge-repo handle sync? (sync protocol, storage adapters)
3. What are Automerge's persistence backends? (IndexedDB adapter, file system adapter)
4. What are Automerge's performance characteristics vs Yjs? (document size limits, memory overhead)
5. What are known issues or limitations? (2024-2026 GitHub issues, blog posts)
6. What is the browser-native story? (WASM build, bundle size)
7. Automerge 2.x vs older: what changed in the merge semantics?

### Yjs vs Automerge Comparison
- Merge correctness guarantees: are both provably conflict-free?
- Performance at scale (large docs, many peers)
- Bundle size and browser fit
- TypeScript support and ecosystem maturity
- Which is better suited as a durable session store for browser automation state?

## Sources to Check
- https://docs.yjs.dev
- https://github.com/yjs/yjs (issues, releases)
- https://automerge.org/docs
- https://github.com/automerge/automerge-repo (issues, examples)
- Academic papers on YATA and Automerge CRDT algorithms (search alphaXiv)
- Blog posts comparing Yjs vs Automerge (2023-2026)
- https://localfirstweb.dev community resources

## Output Format
Write `outputs/.drafts/workflow-sync-self-hosted-T3.md` with:
- Yjs findings, each claim sourced
- Automerge findings, each claim sourced
- Comparison table: merge correctness, performance, browser fit, persistence
- Recommendation for browser automation state storage
- Uncertainties explicitly noted
- All source URLs at the bottom
