# Researcher Brief T4: Iroh + libp2p + Syncthing — Sync Transports & Browser Fit

## Goal
Produce `outputs/.drafts/workflow-sync-self-hosted-T4.md` with sourced findings on Iroh, libp2p, and Syncthing as sync transports for local-first browser automation state.

## Questions to Answer

### Iroh
1. What is Iroh's architecture? (QUIC-based, blob/document model, relay network)
2. What is Iroh's NAT traversal approach? Does it work for browser peers?
3. Does Iroh have a browser-native JS/WASM client? (2025-2026 status)
4. How does Iroh handle document sync vs blob sync? What are the consistency semantics?
5. What are Iroh's self-hosting requirements? (relay server, discovery)
6. Current maturity: production-ready or experimental? (GitHub releases, changelog 2025-2026)
7. How does Iroh integrate with Yjs or Automerge? (any known provider integrations)

### libp2p (js-libp2p)
1. What is the browser support status of js-libp2p? (WebTransport, WebRTC, circuit relay)
2. How does js-libp2p handle NAT traversal for browsers specifically?
3. What pubsub implementations work in browsers? (gossipsub, floodsub)
4. What is the operational burden of running a libp2p bootstrap/relay node?
5. Known issues with js-libp2p in 2025-2026?
6. Is there a production example of CRDT sync (Yjs/Automerge) over js-libp2p?
7. libp2p vs Iroh: which is better for browser-to-browser CRDT sync?

### Syncthing
1. What sync model does Syncthing use? (block-level delta sync, not document-level)
2. Is Syncthing appropriate for CRDT document sync? (fundamental fit question)
3. What are Syncthing's NAT traversal capabilities?
4. Does Syncthing have a browser client? (almost certainly no — confirm)
5. Where does Syncthing fit vs Iroh/libp2p? (file sync vs document sync distinction)

### Overall Transport Comparison for Browser + Desktop Sync
- Which transport is most browser-native?
- Which handles NAT traversal best for consumer networks?
- Which has the best operational story for self-hosting?
- Which integrates most naturally with Yjs or Automerge?

## Sources to Check
- https://iroh.computer/docs (architecture, blog posts)
- https://github.com/n0-computer/iroh (releases, issues, 2025-2026)
- https://docs.libp2p.io and https://github.com/libp2p/js-libp2p
- https://docs.syncthing.net
- GitHub issues, blog posts, HN discussions on each
- Any benchmark or comparison posts on CRDT transports

## Output Format
Write `outputs/.drafts/workflow-sync-self-hosted-T4.md` with:
- Iroh findings, each claim sourced
- libp2p browser findings, each claim sourced
- Syncthing fit assessment
- Comparison table: browser support, NAT traversal, CRDT integration, ops burden
- Recommendation for browser automation + local-first sync use case
- Uncertainties explicitly noted
- All source URLs at the bottom
