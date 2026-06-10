# No-Cloud, E2E-Encrypted, CRDT-Based Sync for a Desktop Browser (2026)

## Executive Summary

This report evaluates the most pragmatic stack for building a no-cloud, end-to-end-encrypted, CRDT-based sync layer for a desktop browser in 2026. We compare **Yjs vs Automerge** (with Loro as an emerging alternative) for conflict resolution, **Iroh vs libp2p vs Syncthing** for peer-to-peer transport, and survey encryption/key management approaches.

**Recommended stack: Yjs (via yrs/Rust) + Iroh + per-document symmetric encryption with MLS-style group key management.**

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

Yjs uses the YATA algorithm, which resolves conflicts via a total ordering based on client IDs and logical clocks. It does not store full operation history by default — tombstones mark deletions and can optionally be garbage-collected.

Automerge stores every change ever made, enabling Git-like version control, branching, and time travel. Automerge 3.0 dramatically reduced the memory cost of this approach — a paste of Moby Dick went from 700 MB to 1.3 MB — by using compressed columnar encoding at runtime, not just at rest.

Loro is a newer entrant (1.0 released) that implements Fugue for text editing and an Event Graph Walker for efficient merge. It offers the richest data type set (moveable tree, moveable list) and "shallow snapshots" analogous to Git shallow clones.

### 1.2 Performance

From the crdt-benchmarks repository (N=6000, Node 20.5.0, Intel i5-8400), comparing the latest available versions:

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

- **Yjs** has the smallest bundle (20KB gzipped) and consistently fast performance. For the B4 real-world trace, it is ~2.5x faster than Automerge.
- **Automerge 2.1.10** (tested) is the slowest, especially on parse time (1,805ms vs Yjs's 39ms). Automerge 3.0 claims 10x memory improvement, but these benchmarks predate that release. B4x100 was skipped entirely.
- **Loro** is fastest on most benchmarks but has larger document sizes and a 399KB bundle. It is the youngest project.
- **Automerge's docSize is actually the smallest** (129KB vs 160KB) due to columnar compression of the full history.

**Caveat:** The benchmarks test Automerge 2.1.10, not Automerge 3.0. Automerge 3's runtime compression should substantially improve parse time and memory, though B4x100 scale may remain challenging. No updated benchmark data is available as of June 2026.

### 1.3 Ecosystem

| Dimension | Yjs | Automerge | Loro |
|-----------|-----|-----------|------|
| Editor bindings | ProseMirror, TipTap, Monaco, Quill, CodeMirror, Remirror | Fewer, mainly via automerge-repo | Growing, JS/WASM |
| Network providers | y-websocket, y-webrtc, y-indexeddb, y-redis | automerge-repo adapters | Bring your own |
| Hosted services | Liveblocks, Y-Sweet, Tiptap Cloud | None major | None |
| Notable users | AFFiNE, Evernote, GitBook, Linear, Typst, Proton Docs, JupyterLab, AWS SageMaker | Ink & Switch projects | Early adopters |
| Rust port maturity | yrs — used in production (AppFlowy, Multi.app) | Native Rust core | Native Rust core |
| Maintainer situation | Kevin Jahns (primary), sponsor-funded | Ink & Switch (2 FT devs) | Loro-dev team, VC-funded |

Yjs has a dramatically larger ecosystem. Proton Docs (E2E encrypted collaborative documents) and Serenity Notes both use Yjs with E2E encryption, proving the encryption pattern works in production.

### 1.4 Assessment

**For a browser sync layer, Yjs (via yrs) is the pragmatic choice:**

- Smallest bundle footprint for browser embedding
- Fastest or near-fastest performance at scale
- Largest ecosystem of providers, editor bindings, and battle-tested production deployments
- yrs gives a clean Rust integration path for a Firefox fork
- Proven E2E encryption pattern (Proton Docs, Serenity Notes)
- Trade-off: no built-in version history (Automerge's strength). Can be mitigated with periodic snapshots.

Automerge is the better choice if Git-like version control and branching are core requirements. Loro is the most promising technically but carries the most risk (youngest project, smallest ecosystem).

---

## 2. Transport Layer: Iroh vs libp2p vs Syncthing

### 2.1 Architecture Comparison

| Dimension | Iroh | libp2p | Syncthing |
|-----------|------|--------|-----------|
| Language | Rust | Rust (+ JS, Go, etc.) | Go |
| Protocol base | QUIC (via noq) | Modular (TCP, QUIC, WebRTC, WebTransport) | TCP + TLS 1.3 |
| Addressing | Public key (EndpointId) | PeerId (multihash of public key) | Device ID (SHA-256 of TLS cert) |
| NAT traversal | QUIC hole-punching + relay | AutoNAT + Circuit Relay v2 + DCUtR | Global discovery + relay servers |
| Relay model | Open ecosystem, E2E encrypted | Circuit Relay v2 (resource-limited) | Public relay pool (anyone can run) |
| Discovery | DNS (pkarr), relay-based | Kademlia DHT, mDNS | Global discovery servers, local broadcast |
| Built-in data sync | iroh-docs (CRDT KV), iroh-blobs, iroh-gossip | None (application layer) | BEP (file-level, LWW) |
| Browser support | WebSocket relay (now), WASM planned | js-libp2p with WebRTC | None (Go daemon) |
| Embeddability | Excellent (Rust library) | Good (Rust library, but complex) | Poor (Go binary/daemon) |
| Complexity | Low-moderate | High | Low (but wrong abstraction) |

### 2.2 Iroh Deep-Dive

Iroh provides an "API for dialing by public key." Key properties:

- **QUIC-native**: Built on their own QUIC implementation (noq). All connections are mutually authenticated and encrypted.
- **Relay fallback**: If hole-punching fails, traffic routes through relay servers. Relay traffic is E2E encrypted — the relay cannot read content. Anyone can run a relay.
- **Composable protocols**: iroh-blobs (content-addressed blob transfer using BLAKE3), iroh-gossip (epidemic broadcast trees based on HyParView/PlumTree), iroh-docs (CRDT key-value documents using range-based set reconciliation).
- **iroh-docs**: Multi-dimensional key-value store with CRDT semantics. Entries identified by (namespace, author, key). Uses range-based set reconciliation for efficient sync. This could serve as a CRDT sync transport directly, though it implements its own CRDT model rather than supporting arbitrary CRDTs like Yjs.
- **Post-quantum**: Repo includes examples for PQ-only and PQ-preferred key exchange.
- **Performance**: Continuously measured at perf.iroh.computer.
- **Browser**: WebSocket relay support exists. Full WASM compilation is planned but not complete.

### 2.3 libp2p Deep-Dive

libp2p is a modular networking stack extracted from IPFS:

- **Maturity**: Used by Polkadot/Substrate, Filecoin (Forest), Lighthouse (Ethereum), IPFS. Battle-tested at scale.
- **Hole-punching**: AutoNAT for NAT detection, Circuit Relay v2 for relay, DCUtR for coordinated hole-punching. Inspired by ICE but decentralized.
- **Complexity**: Many moving parts — transports, stream muxers, security protocols, discovery, pub/sub. Configuration requires understanding of numerous subsystems.
- **Browser**: js-libp2p supports WebRTC direct connections and WebTransport.
- **Maintenance**: Two listed maintainers (Elena Frank, João Oliveira). Active development.

### 2.4 Syncthing Elimination

Syncthing is **not suitable** for this use case:

1. **File-level sync**: BEP operates at file/block granularity. CRDT operation-level sync requires a different abstraction.
2. **LWW conflict resolution**: Uses version vectors per file with last-writer-wins semantics — antithetical to CRDT merge semantics.
3. **Go implementation**: Cannot be easily embedded in a Rust/Firefox process. Would require running a separate daemon.
4. **Centralized discovery**: Global discovery servers are a semi-centralized component.

Syncthing excels at what it does (file sync between devices) but is the wrong tool for CRDT document sync.

### 2.5 Transport Assessment

**Iroh is the recommended transport:**

| Factor | Iroh | libp2p |
|--------|------|--------|
| Integration effort | Low (clean Rust API, composable) | High (many subsystems to configure) |
| CRDT alignment | iroh-gossip for broadcast, iroh-docs for KV sync | Bring your own sync layer |
| NAT traversal | QUIC hole-punching + relay | Multi-step (AutoNAT + Relay + DCUtR) |
| Relay trust | E2E encrypted through relay | E2E encrypted via TLS |
| Browser future | WebSocket relay now, WASM planned | WebRTC now (js-libp2p) |
| Dependency weight | Moderate | Heavy |
| Maturity | Younger, but focused and well-funded (n0/Number Zero) | Very mature, battle-tested |

**The trade-off:** libp2p is more mature and battle-tested at scale (Ethereum, Filecoin). Iroh is younger but simpler, more focused, and provides built-in primitives (gossip, blobs, docs) that map directly to CRDT sync needs. For a new browser project that values integration simplicity and Rust-native design, Iroh is the stronger fit.

**Risk mitigation:** If Iroh proves insufficient at scale, libp2p is a fallback. Both use public-key addressing and QUIC, so the architectural patterns would transfer.

---

## 3. E2E Encryption and Key Management

### 3.1 Encryption Layer Design

For CRDT-based sync, encryption must be layered carefully. There are four placement options:

| Strategy | Pros | Cons |
|----------|------|------|
| Transport only (QUIC/TLS) | Iroh provides this for free | Relay servers see plaintext application data — wait, Iroh E2E encrypts through relay. But: data at rest on any intermediate storage is unencrypted. |
| Encrypt full documents | Simple | Cannot do incremental/delta sync |
| Encrypt each CRDT operation | Maximum security | Cannot merge operations without decryption; CRDT metadata must be readable for ordering |
| **Encrypt content values, keep CRDT metadata in clear** | **Allows CRDT merge on metadata; content is opaque bytes** | Metadata (operation IDs, vector clocks, structure) is visible |

**Recommended: Encrypt content values, keep CRDT metadata in clear.** This is the pattern used by Proton Docs and Serenity Notes with Yjs. The CRDT layer handles conflict resolution on structural metadata, while the actual content (text, JSON values, etc.) is encrypted as opaque byte arrays.

### 3.2 Key Hierarchy

```
Master Identity Key (Ed25519)
  └── Per-Device Key (Ed25519, derived or enrolled)
        └── Per-Document Key (symmetric: XChaCha20-Poly1305)
              └── Key Epoch (rotated on member change)
```

- **Master Identity**: User's root identity. Can be backed up via seed phrase or paper key.
- **Per-Device Keys**: Each device has its own key pair. Enrolled via QR code scan or verification code (Signal/Matrix pattern). The master identity key wraps/signs device keys.
- **Per-Document Keys**: Symmetric keys for encrypting document content. Distributed to authorized devices via key wrapping (encrypted with each device's public key).
- **Key Epochs**: On member/device removal, generate a new document key. Forward secrecy via epoch rotation.

### 3.3 Key Exchange Protocol Selection

| Protocol | Suitability | Notes |
|----------|-------------|-------|
| Noise Framework | Good for 1:1 peer connections | Iroh already uses Noise-like patterns in QUIC/TLS. Good for transport. |
| MLS (RFC 9420) | Best for group key management | Tree-based ratcheting, efficient add/remove, designed for groups. Complex but thorough. |
| X3DH + Double Ratchet | Over-engineered for this use case | Designed for async 1:1 messaging, not multi-device CRDT sync |

**Recommended: MLS (RFC 9420) for group/document key management, Noise/QUIC-TLS for transport.**

MLS provides:
- Efficient group key agreement (tree structure, O(log n) cost for member changes)
- Forward secrecy and post-compromise security
- Support for add/remove operations (critical for device enrollment/revocation)
- An IETF standard with multiple implementations

For a browser with typically 2-5 devices per user, MLS may be over-engineered. A simpler alternative: per-document symmetric key wrapped with each device's public key, stored in a key management document synced via the CRDT layer itself. This "bootstrap" approach is simpler and sufficient for single-user multi-device sync. MLS becomes worthwhile when multi-user collaboration is added.

### 3.4 Device Lifecycle

1. **First device**: Generate master identity key, generate device key, derive initial document keys.
2. **Add device**: Display QR code / verification code on existing device. New device scans, receives master identity + document keys encrypted to new device's public key.
3. **Remove device**: Rotate all document keys. Re-encrypt with remaining devices' public keys. Old device can no longer decrypt new content (forward secrecy). Old content remains accessible to anyone who had the old key.
4. **Recovery**: Paper key / seed phrase for master identity. Social recovery optional (Keybase model: require M-of-N trusted contacts).

### 3.5 Existing E2E + CRDT Implementations

| Product | CRDT | Encryption | Notes |
|---------|------|------------|-------|
| Proton Docs | Yjs | Proton's E2E encryption | Production, millions of users |
| Serenity Notes | Yjs | E2E encrypted | Production, privacy-focused notes |
| BlockSurvey | Yjs | E2E encryption | Production, surveys/forms |
| oorja.io | Yjs | E2E encrypted | Meeting spaces |

The Yjs + E2E encryption pattern is proven in production at scale (Proton Docs).

---

## 4. Performance and Offline Behavior

### 4.1 Offline-First Guarantees

Both Yjs and Automerge are designed for offline-first operation:

- Changes made offline are stored locally (IndexedDB in browser, filesystem for native)
- When connectivity returns, changes are synced and merged automatically
- No central server required for conflict resolution — CRDTs guarantee convergence
- The CRDT model ensures that all peers eventually reach the same state regardless of operation order

With Iroh transport:
- Local changes accumulate as CRDT updates
- On reconnection, Iroh re-establishes peer connections (hole-punching or relay)
- CRDT sync protocol exchanges missing operations
- iroh-gossip can broadcast updates to all connected peers simultaneously

### 4.2 Cold-Start Sync

- **Yjs**: Full state encoded in a single binary update. For the real-world editing benchmark (260K ops, 105K chars), document size is ~160KB. Parse time: 39ms.
- **Automerge**: Full history stored. Document size slightly smaller (~129KB due to columnar compression) but parse time dramatically higher (1,805ms in 2.x; Automerge 3 should improve this significantly).
- **Loro**: Shallow snapshots allow loading only recent state, similar to Git shallow clone. Promising for large documents.

### 4.3 Scaling Limits

- **Yjs**: B4x100 benchmark (10M characters, 26M operations) completes in ~10 minutes. Memory: 327MB. This is roughly equivalent to a very large collaborative document.
- **Automerge**: Skipped B4x100 in benchmarks. The full history model inherently scales worse for very large documents, though Automerge 3's compression helps significantly.
- **Practical limit for browser**: Documents up to ~1M characters (a full novel) should work well with Yjs. Beyond that, consider document splitting.

### 4.4 Conflict Storms

When many peers concurrently edit the same region:
- **B2.4 benchmark** (concurrent insert + delete, N=6000): Yjs 178ms, Automerge 1,066ms, Loro 208ms
- **B3.1** (20√N concurrent map sets): Yjs 75ms, Automerge 1,632ms, Loro 56ms
- Yjs handles conflict storms well. Automerge is 6-22x slower on conflict-heavy workloads.

---

## 5. Stack Recommendation

### 5.1 Recommended Stack

```
┌──────────────────────────────────────────┐
│           Application Layer              │
│  Browser data: bookmarks, tabs, settings,│
│  notes, sessions, browsing history       │
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

| Decision | Why |
|----------|-----|
| **yrs over Automerge** | 20KB vs 604KB bundle, 2-5x faster on real-world traces, vastly larger ecosystem, proven E2E encryption pattern (Proton Docs). Trade-off: no built-in history. |
| **yrs over Loro** | More mature, larger ecosystem, lower risk. Loro is faster in some benchmarks but youngest project. |
| **Iroh over libp2p** | Simpler API, Rust-native, built-in gossip/blobs/docs, E2E encrypted relay, less configuration surface. Trade-off: less battle-tested. |
| **Iroh over Syncthing** | Syncthing operates at file granularity with LWW — wrong abstraction for CRDT ops. Go binary can't embed in Rust process. |
| **Value-level encryption** | Allows CRDT merge on metadata while keeping content encrypted. Proven pattern (Proton Docs, Serenity Notes). |
| **Per-device key wrapping over MLS** | Simpler for single-user multi-device (2-5 devices). Upgrade to MLS when multi-user collaboration is added. |

### 5.3 Integration Architecture

```
Firefox Process
  ├── Browser Core (C++/Rust)
  │     └── yrs (Rust) — CRDT state management
  │           ├── Encryption middleware (XChaCha20-Poly1305)
  │           └── Persistence (redb / SQLite)
  │
  ├── Iroh Endpoint (Rust, runs in background thread)
  │     ├── iroh-gossip — real-time CRDT update broadcast
  │     ├── iroh-blobs — large asset sync (favicons, cached pages)
  │     └── Relay connection (WebSocket for restricted networks)
  │
  └── WebExtension Bridge
        └── Content Script / Sidebar UI
              └── Yjs (JS) — real-time editor bindings if needed
                    └── Syncs with yrs core via IPC
```

Key integration points:
1. **yrs ↔ Iroh**: yrs produces binary updates (via `encode_state_as_update`); Iroh-gossip broadcasts them. On receive, apply via `apply_update`.
2. **Encryption**: Before broadcasting, encrypt the update payload with the document's symmetric key. On receive, decrypt before applying.
3. **Persistence**: Store encrypted CRDT state locally using redb (Iroh-docs already uses redb).
4. **Device enrollment**: First-run generates keypair. Pairing with existing device exchanges keys via QR code or typed verification code over Iroh connection.

### 5.4 Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Iroh immaturity | Medium | Iroh is well-funded (n0), actively developed, and already used in production. Fallback: libp2p (similar QUIC/public-key model). |
| yrs divergence from Yjs | Low | yrs is maintained by the y-crdt community, interop tested. Both encode the same YATA CRDT. |
| Benchmark data stale | Medium | crdt-benchmarks tests Automerge 2.1.10, not 3.0. Automerge 3 may narrow the gap. Run own benchmarks before final decision. |
| NAT traversal failures | Medium | Iroh relay fallback ensures connectivity. Self-hosted relay option for privacy-conscious users. |
| Key management UX | High | Device pairing flows are complex. Study Signal, Matrix, and Keybase for proven UX patterns. |
| WASM browser support for Iroh | Medium | Currently only WebSocket relay from browser. Full WASM compilation is work-in-progress. Not a blocker for desktop browser (native Rust). |

### 5.5 Open Questions

1. **Automerge 3 benchmarks**: How much does Automerge 3.0's compressed runtime change the performance picture? Needs benchmarking.
2. **Iroh-docs vs custom sync**: Should the sync layer use iroh-docs (built-in CRDT KV) as the document sync substrate, or pipe raw Yjs updates through iroh-gossip? The latter is simpler and more flexible.
3. **Loro trajectory**: Loro's performance is impressive and it offers unique features (moveable tree, shallow snapshots). Worth monitoring for a potential future migration.
4. **Multi-user collaboration**: If Aether adds shared-document collaboration, MLS or a similar group key agreement will be needed. Design the key management layer to be upgradeable.
5. **Selective sync**: How to sync only relevant data (e.g., only bookmarks, not full history) per device? Requires document partitioning strategy.
6. **Iroh relay infrastructure**: For a production browser, should Aether run its own relay servers, or rely on the n0 public relay ecosystem?

---

## Sources

1. Yjs Documentation — https://docs.yjs.dev/
2. Yjs GitHub — https://github.com/yjs/yjs
3. Automerge Documentation — https://automerge.org/docs/hello/
4. Automerge GitHub — https://github.com/automerge/automerge
5. Automerge 3.0 Blog Post — https://automerge.org/blog/automerge-3/
6. crdt-benchmarks — https://github.com/dmonad/crdt-benchmarks
7. Iroh GitHub — https://github.com/n0-computer/iroh
8. Iroh Documentation — https://iroh.computer/docs
9. Iroh crates.io — https://crates.io/crates/iroh
10. Iroh & the Web Blog — https://iroh.computer/blog/iroh-and-the-web
11. iroh-docs GitHub — https://github.com/n0-computer/iroh-docs
12. iroh-gossip Documentation — https://iroh.computer/docs/protocols/gossip
13. libp2p/rust-libp2p GitHub — https://github.com/libp2p/rust-libp2p
14. libp2p Hole Punching — https://docs.libp2p.io/concepts/nat/hole-punching/
15. Syncthing BEP v1 Spec — https://docs.syncthing.net/specs/bep-v1.html
16. Syncthing Security Principles — https://docs.syncthing.net/users/security.html
17. Loro GitHub — https://github.com/loro-dev/loro
18. MLS Protocol (RFC 9420) — https://www.rfc-editor.org/rfc/rfc9420.html
19. Ink & Switch Local-First Software — https://www.inkandswitch.com/local-first/
20. Range-based Set Reconciliation (Aljoscha Meyer) — https://arxiv.org/abs/2212.13567
