# T1: Yjs Deep-Dive

Research Yjs as a CRDT engine for browser sync. Cover:

1. **Architecture**: Core data types (Y.Map, Y.Array, Y.Text, Y.XmlFragment), YATA algorithm, encoding format
2. **Performance**: Memory usage, document size scaling, merge latency benchmarks. Find any published benchmarks (especially Kevin Jahns' crdt-benchmarks repo or successor).
3. **Ecosystem**: Providers (y-websocket, y-webrtc, y-indexeddb, y-dat, Hocuspocus), editor bindings (ProseMirror, TipTap, CodeMirror, Monaco), persistence adapters
4. **WASM / Rust**: yrs (Yjs Rust port) — maturity, API parity, whether it can run in browser via WASM
5. **Limitations**: Max document size, garbage collection behavior, awareness protocol overhead, schema evolution, lack of built-in auth/encryption
6. **Production usage**: Notable deployments (Notion, Hocuspocus users, etc.)
7. **2025-2026 developments**: Any major releases, breaking changes, new features

Use web search and official docs. Do NOT fetch PDF files. Write findings to `outputs/.drafts/crdt-sync-browser-stack-research-T1.md` with source URLs for every claim.
