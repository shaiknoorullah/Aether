# No-Cloud, E2E-Encrypted, CRDT-Based Sync for a Desktop Browser (2026)

## Executive Summary

This report evaluates the most pragmatic stack for building a no-cloud, end-to-end-encrypted, CRDT-based sync layer for a desktop browser in 2026. We compare **Yjs vs Automerge** (with Loro as an emerging alternative) for conflict resolution, **Iroh vs libp2p vs Syncthing** for peer-to-peer transport, and survey encryption/key management approaches.

**Recommended stack: Yjs (via yrs/Rust) + Iroh + per-document symmetric encryption with device-key wrapping (upgradeable to MLS).**

This combination minimizes integration friction (both Rust-native, both composable), provides the best performance profile for browser-embedded use, and offers the strongest path to no-cloud operation with relay fallback.

---

## 1. CRDT Engines: Yjs vs Automerge

### 1.1 Architecture Comparison

| Dimension | Yjs | Automerge (3.x) | Loro (1.0) |
|-----------|-----|------------------|------------|
| Algorithm | YATA | Custom op-based CRDT | Fugue + Eg-walker |
| Core language | JavaScript | Rust (WASM) | Rust (WASM) |
| Rust port | yrs (y-crdt) | Native | Native |
| Data types | Map, Array, Text, XmlFragment | Map, List, Text, Counter | Map, List, Text, Tree, MovableList |
| History model | Tombstones + optional GC | Full history (Git-like) | Full history + shallow snapshots |
| Bundle size (gzipped) | **20 KB** | 604 KB | 399 KB |

Yjs uses the YATA algorithm, which resolves conflicts via a total ordering based on client IDs and logical clocks. It does not store full operation history by default — tombstones mark deletions and can optionally be garbage-collected [1][2].

Automerge stores every change ever made, enabling Git-like version control, branching, and time travel. Automerge 3.0 dramatically reduced the memory cost of this approach — a paste of Moby Dick went from 700 MB to 1.3 MB — by using compressed columnar encoding at runtime, not just at rest [5].

Loro is a newer entrant (1.0 released) that implements the Fugue algorithm for text editing and an Event Graph Walker for efficient merge. It offers the richest data type set (moveable tree, moveable list) and "shallow snapshots" analogous to Git shallow clones [17].

### 1.2 Performance

From the crdt-benchmarks repository (N=6000, Node 20.5.0, Intel i5-8400), comparing the latest available versions [6]:

| Benchmark | Yjs 13.6.11 | Automerge 2.1.10 | Loro 0.10.1 |
|-----------|-------------|-------------------|-------------|
| **B4: Real-world editing (time)** | 5,714 ms | 14,326 ms | **3,089 ms** |
| **B4: Document size** | 159,929 B | **129,116 B** | 258,228 B |
| **B4: Parse time** | 39 ms | 1,805 ms | **13 ms** |
| **B4: Memory used** | 3.2 MB | ~0 (WASM caveat) | ~0 (WASM caveat) |
| **B4x100: 10M chars (time)** | 608,908 ms | skipped | **309,689 ms** |
| **B1.1: Append 6K chars** | 188 ms | 365 ms | **120 ms** |
| **B2.4: Concurrent insert+delete** | 178 ms | 1,066 ms | **208 ms** |
| **Bundle size (gzipped)** | **20,100 B** | 604,118 B | 399,276 B |

**Key observations:**

- **Yjs** has the smallest bundle (20KB gzipped) and consistently fast performance. For the B4 real-world trace, it is ~2.5x faster than Automerge [6].
- **Automerge 2.1.10** is the slowest, especially on parse time (1,805ms vs Yjs's 39ms). Automerge 3.0 claims a >10x memory improvement [5], but these benchmarks predate that release. B4x100 was skipped entirely [6].
- **Loro** is fastest on most benchmarks but has larger document sizes and a 399KB bundle [6].
- **Automerge's docSize is actually the smallest** (129KB vs 160KB) due to columnar compression of the full history [6].

**Caveat:** The benchmarks test Automerge 2.1.10, not Automerge 3.0. Automerge 3's runtime compression should substantially improve parse time and memory. No updated benchmark data was found as of June 2026.

### 1.3 Ecosystem

| Dimension | Yjs | Automerge | Loro |
|-----------|-----|-----------|------|
| Editor bindings | ProseMirror, TipTap, Monaco, Quill, CodeMirror, Remirror [2] | Fewer, mainly via automerge-repo [4] | Growing, JS/WASM [17] |
| Network providers | y-websocket, y-webrtc, y-indexeddb, y-redis [1] | automerge-repo adapters [4] | Bring your own [17] |
| Hosted services | Liveblocks, Y-Sweet, Tiptap Cloud [1] | None major | None |
| Notable users | AFFiNE, Evernote, GitBook, Linear, Typst, Proton Docs, JupyterLab, AWS SageMaker [2] | Ink & Switch projects [4] | Early adopters [17] |
| Rust port maturity | yrs — used in production (AppFlowy, Multi.app) [2] | Native Rust core [4] | Native Rust core [17] |
| Maintainer situation | Kevin Jahns (primary), sponsor-funded [2] | Ink & Switch (2 FT devs: Alex Good, Orion Henry) [4] | Loro-dev team [17] |

Yjs has a dramatically larger ecosystem. Proton Docs (E2E encrypted collaborative documents) and Serenity Notes both use Yjs with E2E encryption [2], proving the encryption pattern works in production.

### 1.4 Assessment

**For a browser sync layer, Yjs (via yrs) is the pragmatic choice:**

- Smallest bundle footprint for browser embedding (20KB vs 604KB) [6]
- Fastest or near-fastest performance at scale [6]
- Largest ecosystem of providers, editor bindings, and battle-tested production deployments [2]
- yrs gives a clean Rust integration path for a Firefox fork [2]
- Proven E2E encryption pattern (Proton Docs, Serenity Notes) [2]
- **Trade-off**: no built-in version history (Automerge's strength). Can be mitigated with periodic snapshots.

Automerge is the better choice if Git-like version control and branching are core requirements [5]. Loro is the most promising technically but carries the most risk (youngest project, smallest ecosystem) [17].

---

## 2. Transport Layer: Iroh vs libp2p vs Syncthing

### 2.1 Architecture Comparison

| Dimension | Iroh | libp2p | Syncthing |
|-----------|------|--------|-----------|
| Language | Rust | Rust (+ JS, Go) | Go |
| Protocol base | QUIC (via noq) [7] | Modular (TCP, QUIC, WebRTC, WebTransport) [13] | TCP + TLS 1.3 [15] |
| Addressing | Public key (EndpointId) [7] | PeerId (multihash of public key) [13] | Device ID (SHA-256 of TLS cert) [16] |
| NAT traversal | QUIC hole-punching + relay [7] | AutoNAT + Circuit Relay v2 + DCUtR [14] | Global discovery + relay [16] |
| Relay model | Open ecosystem, E2E encrypted [7] | Circuit Relay v2 (resource-limited) [14] | Public relay pool [16] |
| Built-in data sync | iroh-docs (CRDT KV), iroh-blobs, iroh-gossip [7][11][12] | None (application layer) | BEP (file-level, LWW) [15] |
| Browser support | WebSocket relay now, WASM planned [10] | js-libp2p with WebRTC [13] | None (Go daemon) |
| Embeddability | Excellent (Rust library) [7] | Good but complex [13] | Poor (Go binary) |

### 2.2 Iroh Deep-Dive

Iroh provides an "API for dialing by public key" [7]. Key properties:

- **QUIC-native**: Built on their own QUIC implementation (noq). All connections are mutually authenticated and encrypted [9].
- **Relay fallback**: If hole-punching fails, traffic routes through relay servers. Relay traffic is E2E encrypted — the relay cannot read content [10].
- **Composable protocols**: iroh-blobs (content-addressed blob transfer using BLAKE3), iroh-gossip (epidemic broadcast trees based on HyParView/PlumTree papers), iroh-docs (CRDT key-value documents using range-based set reconciliation) [7][11][12].
- **iroh-docs**: Multi-dimensional key-value store with CRDT semantics. Entries identified by (namespace, author, key). Sync uses range-based set reconciliation based on Aljoscha Meyer's paper [20]. This could serve as a CRDT sync transport, though it implements its own CRDT model rather than supporting arbitrary CRDTs like Yjs [11].
- **Post-quantum**: Repository includes examples for PQ-only and PQ-preferred key exchange [7].
- **Browser**: WebSocket relay support exists. Full WASM compilation is in progress (Phase 1-2) [10].

### 2.3 libp2p Deep-Dive

libp2p is a modular networking stack extracted from IPFS [13]:

- **Maturity**: Used by Polkadot/Substrate, Filecoin (Forest), Lighthouse (Ethereum consensus), IPFS [13]. Battle-tested at massive scale.
- **Hole-punching**: AutoNAT for NAT detection, Circuit Relay v2 for relay, DCUtR for coordinated hole-punching. Inspired by ICE but decentralized [14].
- **Complexity**: Many moving parts — transports, stream muxers, security protocols, discovery, pub/sub [13].
- **Browser**: js-libp2p supports WebRTC direct connections and WebTransport [13].

### 2.4 Syncthing Elimination

Syncthing is **not suitable** for this use case:

1. **File-level sync**: BEP operates at file/block granularity (128KB-16MB blocks). CRDT operation-level sync requires a different abstraction [15].
2. **LWW conflict resolution**: Uses version vectors per file with last-writer-wins semantics [15].
3. **Go implementation**: Cannot be easily embedded in a Rust/Firefox process [15].
4. **Centralized discovery**: Global discovery servers are a semi-centralized component [16].

### 2.5 Transport Assessment

**Iroh is the recommended transport.** Key advantages over libp2p:

- **Simpler integration**: Clean Rust API with composable protocol handlers via `Router` [7].
- **Built-in CRDT-relevant primitives**: iroh-gossip for broadcast, iroh-blobs for large transfers [7].
- **Relay trust model**: E2E encrypted through relay, anyone can run a relay [10].

**Trade-off:** libp2p is more mature and battle-tested at scale (Ethereum, Filecoin) [13]. If Iroh proves insufficient, libp2p is a viable fallback — both use public-key addressing and QUIC, so architectural patterns transfer.

---

## 3. E2E Encryption and Key Management

### 3.1 Encryption Layer Design

For CRDT-based sync, there are four encryption placement strategies:

| Strategy | Assessment |
|----------|-----------|
| Transport only (QUIC/TLS) | Iroh provides this. Relay traffic is E2E encrypted [10]. But data at rest on intermediate storage is unencrypted. Insufficient alone. |
| Encrypt full documents | Cannot do incremental/delta sync. |
| Encrypt each CRDT operation | Cannot merge without decryption; breaks CRDT metadata ordering. |
| **Encrypt content values, keep CRDT metadata in clear** | **Recommended.** Allows CRDT merge on metadata while content remains opaque. Used by Proton Docs and Serenity Notes [2]. |

### 3.2 Key Hierarchy

```
Master Identity Key (Ed25519)
  └── Per-Device Key (Ed25519, derived or enrolled)
        └── Per-Document Key (symmetric: XChaCha20-Poly1305)
              └── Key Epoch (rotated on member change)
```

- **Master Identity**: User's root identity. Backed up via seed phrase or paper key.
- **Per-Device Keys**: Each device has its own key pair. Enrolled via QR code or verification code (Signal/Matrix pattern).
- **Per-Document Keys**: Symmetric keys for encrypting document content. Distributed by wrapping with each device's public key.
- **Key Epochs**: On device removal, generate a new document key for forward secrecy.

### 3.3 Key Exchange Protocol Selection

| Protocol | Suitability | Notes |
|----------|-------------|-------|
| Noise Framework | Good for 1:1 peer connections | Iroh/QUIC already provides this at transport layer. |
| MLS (RFC 9420) [18] | Best for group key management | Tree-based ratcheting, efficient add/remove. Complex but thorough. |
| X3DH + Double Ratchet | Over-engineered for this use case | Designed for async 1:1 messaging, not multi-device CRDT sync. |

**Recommended:** For single-user multi-device sync (2-5 devices), use **per-document symmetric key wrapping** — simpler than MLS and sufficient. Upgrade to **MLS (RFC 9420)** [18] when multi-user collaboration is added. MLS provides efficient group key agreement via tree structure (O(log n) cost for member changes), forward secrecy, and post-compromise security.

### 3.4 Device Lifecycle

1. **First device**: Generate master identity key, device key, initial document keys.
2. **Add device**: QR code / verification code on existing device. New device receives document keys encrypted to its public key.
3. **Remove device**: Rotate all document keys. Re-encrypt with remaining devices' public keys.
4. **Recovery**: Seed phrase for master identity. Optional social recovery (Keybase model: M-of-N trusted contacts).

### 3.5 Production Precedents

| Product | CRDT | Encryption | Source |
|---------|------|------------|--------|
| Proton Docs | Yjs | Proton's E2E encryption | Listed in Yjs users [2] |
| Serenity Notes | Yjs | E2E encrypted | Listed in Yjs users [2] |
| BlockSurvey | Yjs | E2E encryption | Listed in Yjs users [2] |
| oorja.io | Yjs | E2E encrypted | Listed in Yjs users [2] |

---

## 4. Performance and Offline Behavior

### 4.1 Offline-First Guarantees

Both Yjs and Automerge are designed for offline-first operation [1][3]. Changes made offline are stored locally. When connectivity returns, changes sync and merge automatically via CRDT convergence. No central server is required.

With Iroh transport: local changes accumulate as CRDT updates → on reconnection, Iroh re-establishes peer connections → iroh-gossip broadcasts missing updates [12].

### 4.2 Cold-Start Sync Performance

| Metric | Yjs | Automerge 2.x |
|--------|-----|---------------|
| Document size (260K ops) | 159,929 B | 129,116 B |
| Parse time | 39 ms | 1,805 ms |
| Memory | 3.2 MB | ~0 (WASM) |

Source: crdt-benchmarks B4 [6]. Automerge 3.0 should significantly improve parse time [5].

### 4.3 Scaling Limits

- **Yjs B4x100** (10M characters, 26M operations): completes in ~10 minutes, 327MB memory, 16MB document size [6].
- **Automerge**: Skipped B4x100 [6]. Full history model scales worse for very large documents, though Automerge 3's compression helps [5].
- **Practical limit for browser**: Documents up to ~1M characters should work well with Yjs. Beyond that, consider document partitioning.

### 4.4 Conflict Storm Resilience

| Benchmark | Yjs | Automerge | Loro |
|-----------|-----|-----------|------|
| B2.4: Concurrent insert+delete | 178 ms | 1,066 ms | 208 ms |
| B3.1: 20√N concurrent map sets | 75 ms | 1,632 ms | 56 ms |

Yjs handles conflict storms ~6-22x faster than Automerge [6].

---

## 5. Stack Recommendation

### 5.1 Recommended Stack

```
┌──────────────────────────────────────────┐
│           Application Layer              │
│  Bookmarks, tabs, settings, notes,       │
│  sessions, browsing history              │
├──────────────────────────────────────────┤
│        Encryption Layer                  │
│  Per-document XChaCha20-Poly1305         │
│  Key mgmt: per-device key wrapping       │
│  (upgrade to MLS for multi-user collab)  │
├──────────────────────────────────────────┤
│          CRDT Layer                      │
│  yrs (Yjs Rust port)                     │
│  Y.Map for structured data               │
│  Y.Text for notes/text content           │
│  Y.Array for ordered collections         │
├──────────────────────────────────────────┤
│        Transport Layer                   │
│  Iroh (QUIC, hole-punching, relay)       │
│  iroh-gossip for real-time broadcast     │
│  iroh-blobs for large binary transfers   │
├──────────────────────────────────────────┤
│        Storage Layer                     │
│  Local: redb or SQLite for persistence   │
│  IndexedDB for web sidebar contexts      │
└──────────────────────────────────────────┘
```

### 5.2 Rationale

| Decision | Why | Source |
|----------|-----|--------|
| **yrs over Automerge** | 20KB vs 604KB bundle, 2-5x faster on real-world traces, vastly larger ecosystem, proven E2E encryption pattern (Proton Docs) | [2][5][6] |
| **yrs over Loro** | More mature, larger ecosystem, lower risk. Loro faster in some benchmarks but youngest project. | [6][17] |
| **Iroh over libp2p** | Simpler API, Rust-native, built-in gossip/blobs/docs, E2E encrypted relay, less configuration surface | [7][13] |
| **Iroh over Syncthing** | Syncthing: file-level LWW, Go binary, wrong abstraction for CRDT ops | [15] |
| **Value-level encryption** | Allows CRDT merge on metadata while keeping content encrypted. Proven pattern. | [2] |
| **Device-key wrapping over MLS** | Simpler for single-user multi-device (2-5 devices). Upgrade to MLS for multi-user. | [18] |

### 5.3 Integration Architecture

```
Firefox Process
  ├── Browser Core (C++/Rust)
  │     └── yrs (Rust) — CRDT state management
  │           ├── Encryption middleware (XChaCha20-Poly1305)
  │           └── Persistence (redb / SQLite)
  │
  ├── Iroh Endpoint (Rust, background thread)
  │     ├── iroh-gossip — real-time CRDT update broadcast
  │     ├── iroh-blobs — large asset sync
  │     └── Relay connection (WebSocket fallback)
  │
  └── WebExtension Bridge
        └── Content Script / Sidebar UI
              └── Yjs (JS) — editor bindings if needed
                    └── Syncs with yrs core via IPC
```

Integration flow:
1. **yrs → Iroh**: yrs produces binary updates via `encode_state_as_update`; encrypt with document key; broadcast via iroh-gossip [1][12].
2. **Iroh → yrs**: Receive update, decrypt, apply via `apply_update` [1].
3. **Persistence**: Store encrypted CRDT state in redb (Iroh-docs already uses redb [11]).
4. **Device enrollment**: First-run generates keypair. Pairing exchanges keys via QR code over Iroh connection.

### 5.4 Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Iroh immaturity | Medium | Well-funded (n0), actively developed. Fallback: libp2p. |
| yrs divergence from Yjs | Low | Maintained by y-crdt community, interop tested [2]. |
| Benchmark data stale | Medium | crdt-benchmarks tests Automerge 2.1.10, not 3.0 [6]. Run own benchmarks before final decision. |
| NAT traversal failures | Medium | Iroh relay fallback ensures connectivity [7][10]. Self-hosted relay option. |
| Key management UX | High | Study Signal, Matrix, Keybase for proven UX patterns. |
| Browser WASM for Iroh | Medium | WebSocket relay works now [10]. Full WASM in progress. Not a blocker for desktop (native Rust). |

### 5.5 Open Questions

1. **Automerge 3 benchmarks**: How much does Automerge 3.0's compressed runtime change the performance picture? Updated benchmarks needed [5][6].
2. **Iroh-docs vs custom sync**: Use iroh-docs as document sync substrate, or pipe raw Yjs updates through iroh-gossip? The latter is simpler and more flexible [11][12].
3. **Loro trajectory**: Performance is impressive; worth monitoring for potential future migration [17].
4. **Multi-user collaboration**: When added, upgrade key management to MLS [18].
5. **Selective sync**: Document partitioning strategy needed for per-device data scoping.
6. **Relay infrastructure**: Run own relays or use n0's public relay ecosystem [7]?

---

## Sources

[1] Yjs Documentation — https://docs.yjs.dev/  
[2] Yjs GitHub — https://github.com/yjs/yjs  
[3] Automerge Documentation — https://automerge.org/docs/hello/  
[4] Automerge GitHub — https://github.com/automerge/automerge  
[5] Automerge 3.0 Blog Post — https://automerge.org/blog/automerge-3/  
[6] crdt-benchmarks — https://github.com/dmonad/crdt-benchmarks  
[7] Iroh GitHub — https://github.com/n0-computer/iroh  
[8] Iroh Documentation — https://iroh.computer/docs  
[9] Iroh crates.io — https://crates.io/crates/iroh  
[10] Iroh & the Web Blog — https://iroh.computer/blog/iroh-and-the-web  
[11] iroh-docs GitHub — https://github.com/n0-computer/iroh-docs  
[12] iroh-gossip Documentation — https://iroh.computer/docs/protocols/gossip  
[13] libp2p/rust-libp2p GitHub — https://github.com/libp2p/rust-libp2p  
[14] libp2p Hole Punching — https://docs.libp2p.io/concepts/nat/hole-punching/  
[15] Syncthing BEP v1 Spec — https://docs.syncthing.net/specs/bep-v1.html  
[16] Syncthing Security Principles — https://docs.syncthing.net/users/security.html  
[17] Loro GitHub — https://github.com/loro-dev/loro  
[18] MLS Protocol (RFC 9420) — https://www.rfc-editor.org/rfc/rfc9420.html  
[19] Ink & Switch Local-First Software — https://www.inkandswitch.com/local-first/  
[20] Range-based Set Reconciliation — https://arxiv.org/abs/2212.13567  
