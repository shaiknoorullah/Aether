# T2: Automerge Deep-Dive

Research Automerge as a CRDT engine for browser sync. Cover:

1. **Architecture**: Core data types, Automerge 2.x Rust rewrite, document model, change format, sync protocol
2. **Performance**: Memory usage, document size scaling, merge latency. Find benchmarks comparing to Yjs. Check crdt-benchmarks or Ink & Switch publications.
3. **Ecosystem**: automerge-repo, storage adapters, network adapters, editor bindings, framework integrations
4. **WASM / Rust**: automerge-rs maturity, WASM bundle size, JS API ergonomics via automerge-js
5. **Limitations**: Document size ceiling, GC/compaction, schema migration, learning curve, API stability
6. **Production usage**: Ink & Switch projects, any commercial adopters
7. **2025-2026 developments**: automerge-repo stability, new sync protocol features, performance improvements

Use web search and official docs. Do NOT fetch PDF files. Write findings to `outputs/.drafts/crdt-sync-browser-stack-research-T2.md` with source URLs for every claim.
