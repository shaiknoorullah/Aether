# Direct Research Notes: CRDT Sync Browser Stack

## Search Terms Used
1. Direct fetches: Yjs docs, Automerge docs, Iroh docs, GitHub READMEs
2. Direct fetches: crdt-benchmarks repo, Automerge 3.0 blog, libp2p rust README
3. Direct fetches: Syncthing BEP spec, Syncthing security docs, libp2p hole-punching docs
4. Direct fetches: iroh-docs README, iroh-gossip docs, Iroh & the Web blog
5. Direct fetches: Loro README, MLS RFC 9420, crates.io/iroh
6. Note: web_search was unavailable (Exa rate limit, no Perplexity/Gemini keys). All evidence from direct source fetches.

## T1: Yjs Findings

### Core Architecture
- CRDT type: YATA algorithm (Yet Another Transformation Approach)
- Shared types: Y.Doc, Y.Map, Y.Array, Y.Text, Y.XmlFragment, Y.XmlElement
- Network agnostic — any transport works as long as updates eventually arrive
- Order of update application doesn't matter
- Source: https://docs.yjs.dev/

### Performance (from crdt-benchmarks, N=6000)
- Bundle size: 69,124 bytes (gzipped: 20,100 bytes) — smallest of all tested
- B4 real-world editing: 5,714ms (vs Automerge 14,326ms, Loro 3,089ms)
- B4 docSize: 159,929 bytes (vs Automerge 129,116 bytes)
- B4 parseTime: 39ms (vs Automerge 1,805ms)
- B4 memUsed: 3.2MB (vs Automerge: 0B reported but note WASM caveat)
- B4x100 (10M chars): 608,908ms — Automerge skipped this benchmark
- Yjs generally fastest or near-fastest except Loro beats it in some benchmarks
- Source: https://github.com/dmonad/crdt-benchmarks

### Ecosystem
- Editor bindings: ProseMirror, TipTap, Monaco, Quill, CodeMirror, Remirror
- Providers: y-websocket, y-webrtc, y-indexeddb, y-redis
- Hosted: Liveblocks, Y-Sweet (Jamsocket), Tiptap Cloud
- Major users: AFFiNE, Evernote, GitBook, Linear, Typst, Proton Docs, JupyterLab, Cargo, AWS SageMaker, NextCloud, Huly, AppFlowy (via Yrs)
- Source: https://github.com/yjs/yjs README

### Yrs (Rust port)
- y-crdt/yrs — Rust implementation of Yjs
- Used by AppFlowy, Multi.app
- WASM compilation supported (ywasm in benchmarks)
- ywasm performance: often faster than JS Yjs (e.g., B4: 28,675ms for ywasm vs 5,714ms for yjs — wait, ywasm is SLOWER here?)
- Actually checking: ywasm B4 time was 28,675ms which is much slower than yjs 5,714ms. This is surprising.
- Source: https://github.com/dmonad/crdt-benchmarks

### Limitations
- No built-in encryption or auth
- GC behavior: tombstones kept by default; GC available but loses ability to merge with old updates
- Memory usage can grow with document history (3.2MB for 260K ops)
- No built-in schema evolution/migration

## T2: Automerge Findings

### Core Architecture
- Automerge 3.0 released (latest version of @automerge/automerge)
- Rust core compiled to WASM, exposed via JS/C/Swift bindings
- Full history stored (every change tracked, like Git)
- Immutable state snapshots (functional reactive compatible)
- Source: https://automerge.org/docs/hello/

### Automerge 3.0 Improvements
- 10x reduction in memory usage (main selling point)
- Moby Dick paste: 700MB → 1.3MB memory
- Documents that took 17 hours to load now load in 9 seconds
- Compressed columnar format now used at runtime (not just at rest)
- Text API simplified: collaborative strings are default, ImmutableString for non-collaborative
- Same file format as Automerge 2 (backward compatible)
- Source: https://automerge.org/blog/automerge-3/

### Performance (from crdt-benchmarks, versions tested: 2.1.10 — pre-Automerge 3)
- Bundle size: 1,737,571 bytes (gzipped: 604,118 bytes) — 25x larger than Yjs
- B4 real-world editing: 14,326ms (2.5x slower than Yjs)
- B4 parseTime: 1,805ms (46x slower than Yjs's 39ms)
- B4 docSize: 129,116 bytes (actually smaller than Yjs's 159,929 bytes)
- B4x100: skipped (too slow/memory intensive even in 2.x)
- Note: Automerge 3 may significantly improve these numbers but benchmarks not yet updated
- Source: https://github.com/dmonad/crdt-benchmarks

### Ecosystem
- automerge-repo: standard networking/storage layer
- Ink & Switch backing (research lab)
- Alex Good and Orion Henry working full time
- autosurgeon: Rust derive macros for automerge
- C API available for iOS/other platforms
- Source: https://github.com/automerge/automerge

### Limitations
- Bundle size 25x Yjs (1.7MB vs 69KB)
- Historically much slower, though Automerge 3 claims big improvements
- Ecosystem smaller than Yjs (fewer editor bindings, fewer hosted providers)
- automerge-repo networking adapters less mature than Yjs providers

## T3: Transport Layer

### Iroh (n0-computer)
- Rust-native, built on QUIC (via noq, their own QUIC impl)
- Dial by public key — no need for IP/DNS
- NAT traversal: hole-punching + relay server fallback
- Relay servers: open ecosystem, anyone can run one, E2E encrypted through relay
- Connections mutually authenticated and encrypted (TLS-based)
- Composable protocol stack: iroh-blobs, iroh-gossip, iroh-docs, iroh-willow
- iroh-docs: built-in CRDT key-value documents using range-based set reconciliation
- iroh-gossip: epidemic broadcast trees (HyParView + PlumTree papers)
- Browser support: WebSocket relay (Phase 0), WASM compilation planned (Phase 1-2)
- FFI: Rust, Python, Swift
- Continuous perf measurement: https://perf.iroh.computer
- Post-quantum key exchange examples present in repo
- Source: https://github.com/n0-computer/iroh, https://iroh.computer/docs, https://crates.io/crates/iroh

### libp2p (rust-libp2p)
- Modular protocol stack: transports, muxers, protocols
- NAT traversal: AutoNAT, Circuit Relay v2, DCUtR hole-punching
- Mature: used by Polkadot/Substrate, Filecoin, Lighthouse, IPFS
- Browser: js-libp2p with WebRTC, WebTransport
- Rust implementation mature, actively maintained (Elena Frank, João Oliveira)
- Kademlia DHT for peer discovery
- GossipSub for pub/sub
- Significantly more complex than Iroh — many more moving parts
- Source: https://github.com/libp2p/rust-libp2p, https://docs.libp2p.io/concepts/nat/hole-punching/

### Syncthing
- BEP (Block Exchange Protocol) over TLS 1.3
- File-level sync with block hashing (128KB-16MB blocks)
- Conflict resolution: version vectors per file, last-writer-wins at file level
- NOT suitable for CRDT operation-level sync (file granularity, not operation granularity)
- Global discovery servers (centralized component for device finding)
- Relay servers for NAT traversal
- Written in Go — embedding in Rust/Firefox process is problematic
- Good for file sync, wrong abstraction for CRDT document sync
- Source: https://docs.syncthing.net/specs/bep-v1.html, https://docs.syncthing.net/users/security.html

### iroh-docs (separate repo)
- Multi-dimensional key-value documents
- Range-based set reconciliation (based on Aljoscha Meyer's paper, arXiv:2212.13567)
- Entries identified by key + author + namespace
- Values are BLAKE3 hashes + size + timestamp
- Content data transferred via iroh-blobs
- Uses iroh-gossip for real-time notifications
- Namespace key = write capability (public key is NamespaceId)
- Author key = proof of authorship
- Persistent storage via redb (embedded KV store)
- Source: https://github.com/n0-computer/iroh-docs

## T4: E2E Encryption + Key Management

### Encryption Layer Placement Options
1. **Encrypt transport only**: Iroh already does this (QUIC/TLS). Not sufficient for relay trust model.
2. **Encrypt CRDT operations**: Each op encrypted before send. Problem: merging encrypted ops requires decryption.
3. **Encrypt serialized documents**: Encrypt full document snapshots. Simple but can't do incremental sync.
4. **Encrypt at application layer above CRDT**: Most practical — encrypt the content values, sync CRDT metadata in clear. Used by Serenity Notes with Yjs.

### Key Exchange Protocols
- **Noise Protocol Framework**: Used by WireGuard, Lightning. Handshake patterns (IK, XX, etc.) for mutual auth. Lightweight, no PKI needed. Good for peer-to-peer.
- **MLS (RFC 9420)**: Group key agreement via tree-based ratcheting. Designed for group messaging. Supports add/remove members, key rotation. Complex but thorough.
- **X3DH + Double Ratchet (Signal)**: Designed for 1:1 async messaging. Can extend to groups via Sender Keys but not ideal for multi-device CRDT sync.
- **Iroh's built-in**: QUIC TLS with mutual authentication via public keys. Relay traffic is E2E encrypted (relay can't read). Not application-level encryption though.

### Key Management UX Patterns (from Signal, Matrix, Keybase)
- Device addition: QR code scanning, safety number verification
- Key rotation: Automatic on member change (MLS) or periodic (Double Ratchet)
- Recovery: Social recovery, backup keys, paper keys (Keybase pattern)
- Cross-device: Per-device keys linked to account identity

### CRDT-Specific Encryption Challenges
- Can't merge encrypted CRDT operations without decryption
- Options: (a) encrypt values only, keep CRDT metadata in clear; (b) use a shared group key to encrypt ops
- Access control: per-document keys, shared via group key agreement
- Revocation: requires re-keying (new key, re-encrypt or exclude old member)

### Existing Implementations
- Serenity Notes: E2E encrypted + Yjs (mentioned in Yjs users list)
- Proton Docs: E2E encrypted + Yjs (Proton Drive)
- BlockSurvey: E2E encrypted + Yjs
- Matrix (Element): Vodozemac (Rust impl of Olm/Megolm), MLS migration in progress

### Practical Recommendation
- Use Iroh's transport encryption as baseline (QUIC TLS, relay-safe)
- Add application-level encryption for document content:
  - Per-document symmetric key (AES-256-GCM or XChaCha20-Poly1305)
  - Key distributed via MLS or simpler per-device key wrapping
  - CRDT metadata (vector clocks, operation IDs) can be in clear
  - Document content values encrypted before insertion into CRDT
- Device management: per-device Ed25519 keypair, master identity key wraps device keys

### Syncthing Security Model (for comparison)
- TLS 1.3 for all connections
- Device ID = SHA-256 of TLS certificate
- Trust-on-first-use or pre-shared device IDs
- Relay traffic encrypted end-to-end
- "Untrusted Device Encryption" mode for encrypted folder sharing
- Source: https://docs.syncthing.net/users/security.html
