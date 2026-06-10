# T3: Transport Layer — Iroh vs libp2p vs Syncthing

Research P2P transport options for no-cloud CRDT sync. Cover:

1. **Iroh** (by n0/Number Zero):
   - Architecture (QUIC-based, relay servers, hole punching)
   - Iroh blobs, Iroh docs (built-in CRDT), Iroh net
   - NAT traversal success rates
   - Maturity, API stability, Rust-native
   - 2025-2026 status: any breaking changes, production readiness

2. **libp2p**:
   - Architecture (modular transports, DHT, gossipsub, circuit relay)
   - Rust implementation (rust-libp2p) maturity
   - JS implementation for browser (js-libp2p, WebRTC, WebTransport)
   - NAT traversal (AutoNAT, circuit relay v2, hole punching)
   - Overhead and complexity

3. **Syncthing**:
   - Architecture (BEP protocol, relay servers, global discovery)
   - Embedding feasibility (syncthing lib vs running daemon)
   - Conflict handling (last-writer-wins per-file — how does this interact with CRDTs?)
   - Privacy model (relay trust, metadata exposure)

4. **Comparison dimensions**: Connection setup latency, bandwidth overhead, relay infrastructure requirements, embeddability in a browser process, maintenance burden, community size

Use web search and official docs. Do NOT fetch PDF files. Write findings to `outputs/.drafts/crdt-sync-browser-stack-research-T3.md` with source URLs for every claim.
