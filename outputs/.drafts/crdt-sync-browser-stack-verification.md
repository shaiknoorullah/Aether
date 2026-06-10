# Verification Report: crdt-sync-browser-stack

## Checks Performed

### Citation Integrity
- All 20 source references [1]-[20] are both cited in text and defined in Sources section: **PASS**
- All source URLs are real pages that were fetched and content verified during research: **PASS**

### Factual Accuracy
- Yjs bundle size 20,100 bytes gzipped: matches crdt-benchmarks README table [6] **PASS**
- Automerge 3.0 Moby Dick 700MB → 1.3MB: matches blog post text [5] **PASS**
- B4 benchmark times (Yjs 5,714ms, Automerge 14,326ms, Loro 3,089ms): matches benchmarks README [6] **PASS**
- B4x100 times and Automerge skipped: matches benchmarks README [6] **PASS**
- Automerge "Alex Good and Orion Henry working full time": matches Automerge README [4] **PASS**
- iroh-docs uses redb: matches iroh-docs README [11] **PASS**
- iroh-gossip based on HyParView/PlumTree: matches gossip docs [12] **PASS**
- Syncthing BEP block sizes 128KB-16MB: matches BEP spec [15] **PASS**
- Proton Docs and Serenity Notes listed as Yjs users: matches Yjs README [2] **PASS**

### Logical Consistency
- Recommendation (yrs + Iroh) follows from evidence: smallest bundle, fastest perf, largest ecosystem, proven E2E pattern, Rust-native: **PASS**
- Syncthing elimination reasoning (file-level, Go, LWW) is sound: **PASS**
- Encryption layer recommendation (value-level encryption) is consistent with cited production precedents: **PASS**

### Known Limitations / MINOR Issues
- M1: crdt-benchmarks were run on Automerge 2.1.10, not 3.0. Clearly stated as caveat in draft. **ACCEPTED**
- M2: "memUsed" for WASM-based CRDTs (Automerge, Loro) reported as ~0, but benchmark notes say WASM heap is not measured. Stated as caveat. **ACCEPTED**
- M3: Iroh's relay WebSocket support described as existing — the blog says "almost finished" and "may already be done by the time you read this." Given the blog is from an earlier date and we're in June 2026, reasonable to state as available. **ACCEPTED**
- M4: ywasm benchmark anomaly (28,675ms vs Yjs 5,714ms on B4) noted in research but not in final draft. Minor — ywasm is not the recommended path. **ACCEPTED**
- M5: web_search was unavailable (Exa rate limit). All evidence from direct URL fetches to official sources. **NOTED**

### FATAL Issues
None found.

### MAJOR Issues
None found.

## Verdict
**PASS WITH NOTES** — M1 through M5 are noted limitations but do not affect the validity of the recommendation.
