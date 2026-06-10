# No-Cloud E2E CRDT Sync — Department Report

> **Team**: tech-selfhost-p2p-sync (Department: Technical)
> **Mandate**: No-cloud E2E CRDT sync 2026 — Yjs vs Automerge; Iroh vs libp2p vs Syncthing; key management, performance, offline. Identify the most pragmatic stack.
> **Report date**: 2026-06-10
> **Primary brief**: `outputs/crdt-sync-browser-stack.md` (20 primary sources, verification PASS WITH NOTES)
> **Cross-referenced**: `outputs/.drafts/workflow-sync-self-hosted-cited.md` (sibling sync research)
> **Method**: Synthesis of cited research brief + provenance; reconciliation with sibling sync draft. Every key finding carries a source URL.

---

## 1. Executive Summary

A no-cloud, end-to-end-encrypted, CRDT-based sync layer is viable today and is the single highest-leverage differentiator for a privacy-first browser: it lets users sync bookmarks, tabs, sessions, settings, and notes across devices with **zero server able to read the data**, no account required, and full offline operation. The research converges on a clear pragmatic stack: **Yjs (via the `yrs` Rust port) for the CRDT engine, value-level encryption with per-device key wrapping for confidentiality, and a peer-to-peer transport with relay fallback** for connectivity.

On the CRDT axis, **Yjs is the pragmatic winner** — a 20 KB bundle vs Automerge's 604 KB, 2–5× faster on real-world editing traces, the largest ecosystem of editor bindings and network providers, and a production-proven E2E-encryption pattern (Proton Docs, Serenity Notes). Automerge wins only when Git-like version history/branching is a core requirement; Loro is technically impressive but the youngest and highest-risk.

On the transport axis there is an **unresolved tension between two of our own research threads**. The primary brief recommends **Iroh** (Rust-native QUIC, hole-punching, E2E-encrypted relay, composable gossip/blobs/docs primitives) as the cleanest embeddable transport for a Rust/Firefox core. The sibling workflow-sync draft counters that, as of mid-2026, **Iroh still lacks a production browser-native WASM client**, so for any browser-context (sidebar/extension) sync today, **js-libp2p (WebRTC/WebTransport)** is the only production-grade browser-native P2P option. Both agree **Syncthing is the wrong abstraction** (file-block-level, last-writer-wins, Go binary — not operation-level CRDT merge). The reconciled recommendation: **Iroh in the native Rust core; js-libp2p or a relay/WebSocket provider for browser-context surfaces; Syncthing only for opaque file-archive sync, never document state.**

Key management is the highest-UX-risk area. For the realistic single-user, 2–5-device case, **per-document symmetric keys (XChaCha20-Poly1305) wrapped per device public key** is sufficient and far simpler than MLS; **MLS (RFC 9420)** is the documented upgrade path once multi-user collaboration is added. The whitespace is large: no shipping browser today offers no-cloud, account-free, E2E-encrypted, CRDT-merge sync — incumbents are either cloud-account-bound (Chrome/Firefox Sync, Arc) or file-level (Floccus/Syncthing) with no real merge.

---

## 2. Key Findings

### CRDT engine

**F1 — Yjs has a ~30× smaller bundle than Automerge (20 KB vs 604 KB gzipped).** Decisive for browser embedding where every KB on the sidebar/extension surface matters.
Source: https://github.com/dmonad/crdt-benchmarks

**F2 — Yjs is 2–5× faster than Automerge on real-world editing traces and 6–22× faster under concurrent conflict storms.** B4 real-world trace: Yjs 5,714 ms vs Automerge 14,326 ms; B2.4 concurrent insert+delete: 178 ms vs 1,066 ms.
Source: https://github.com/dmonad/crdt-benchmarks

**F3 — Yjs parse/cold-start is dramatically faster (39 ms vs 1,805 ms on a 260K-op doc).** Critical for fast device-startup sync.
Source: https://github.com/dmonad/crdt-benchmarks

**F4 — Automerge 3.0 cut full-history memory cost massively (Moby Dick paste: 700 MB → 1.3 MB) via runtime columnar compression — but published benchmarks predate it (test 2.1.10).** Automerge's strength remains Git-like full-history/branching; its doc size is actually smaller than Yjs (129 KB vs 160 KB) due to columnar compression.
Source: https://automerge.org/blog/automerge-3/

**F5 — Yjs has a clean Rust port (`yrs`/y-crdt) used in production (AppFlowy, Multi.app), giving a native integration path into a Firefox/Rust core.**
Source: https://github.com/yjs/yjs

**F6 — Loro (1.0, Fugue + Event-Graph-Walker) is fastest on most benchmarks (B4: 3,089 ms) and offers the richest types (movable tree/list) but has a 399 KB bundle, larger docs, and the smallest/youngest ecosystem (highest risk).**
Source: https://github.com/loro-dev/loro

### Transport

**F7 — Iroh provides "dial-by-public-key" over its own QUIC stack with mutually-authenticated, encrypted connections and E2E-encrypted relay fallback (the relay cannot read content).** Composable: iroh-gossip (broadcast), iroh-blobs (BLAKE3 content-addressed), iroh-docs (range-based set reconciliation CRDT KV).
Source: https://github.com/n0-computer/iroh

**F8 — Iroh relays are self-hostable (`iroh-relay` binary) and stateless; n0 also runs a public relay pool. This is the no-cloud connectivity backbone.**
Source: https://iroh.computer/docs

**F9 — CONTESTED: Iroh lacks a production browser-native client today; its JS wrapper is HTTP-RPC-backed and explicitly "work-in-progress," WASM compilation still in progress.** This is the single biggest reason the sibling draft prefers js-libp2p for browser surfaces.
Source: https://iroh.computer/blog/iroh-and-the-web

**F10 — js-libp2p is the only production-grade browser-native P2P stack today (WebRTC direct + WebTransport), battle-tested at scale (Ethereum/Lighthouse, Filecoin, Polkadot, IPFS), but more complex and its relay nodes are stateful.**
Source: https://github.com/libp2p/rust-libp2p

**F11 — OrbitDB demonstrates the working pattern: CRDT documents propagated over libp2p gossipsub topics; the same approach pipes Yjs/Automerge update diffs through gossipsub, though no official Yjs↔libp2p provider exists in core (must be built against the gossipsub event API).**
Source: https://github.com/libp2p/rust-libp2p

**F12 — Syncthing is the wrong abstraction: BEP syncs 128 KiB–16 MiB file blocks with version-vector last-writer-wins, producing `.sync-conflict-*` copies (no operation merge), and runs as a Go daemon (not embeddable in a Rust/Firefox process).** Suitable only for opaque file/archive sync, never document state.
Source: https://docs.syncthing.net/specs/bep-v1.html

### Encryption & key management

**F13 — The correct encryption placement is value-level: encrypt content values, keep CRDT metadata in clear, so peers/relays can merge on metadata while content stays opaque.** Transport-only (QUIC/TLS) leaves data unencrypted at intermediate storage; whole-doc or per-op encryption breaks incremental sync/merge.
Source: https://github.com/yjs/yjs

**F14 — The value-level E2E pattern is production-proven with Yjs: Proton Docs and Serenity Notes (plus BlockSurvey, oorja.io) ship E2E-encrypted Yjs.** De-risks the architecture — it is not novel research.
Source: https://github.com/yjs/yjs

**F15 — For single-user multi-device (2–5 devices), per-document symmetric key (XChaCha20-Poly1305) wrapped to each device public key is sufficient; MLS (RFC 9420) is the documented upgrade for multi-user groups (O(log n) member-change cost, forward secrecy, post-compromise security).** Key hierarchy: Master Identity (Ed25519) → Per-Device key → Per-Document symmetric key → Key Epoch (rotated on member change).
Source: https://www.rfc-editor.org/rfc/rfc9420.html

**F16 — Device lifecycle has well-trodden UX precedents to copy (Signal/Matrix QR enrollment, Keybase M-of-N social recovery, seed-phrase master backup); device removal requires document-key rotation + re-wrap for forward secrecy.**
Source: https://www.inkandswitch.com/local-first/

### Performance & offline

**F17 — Both Yjs and Automerge are offline-first by construction: offline edits accumulate locally and converge automatically on reconnect with no central server (local-first principles).** Yjs offline persistence via y-indexeddb syncs only missing updates on reconnect.
Source: https://www.inkandswitch.com/local-first/

**F18 — Yjs scales to ~10M characters / 26M ops in ~10 min, 327 MB, 16 MB doc; practical browser ceiling ~1M chars before partitioning is advisable. Automerge skipped this benchmark entirely.**
Source: https://github.com/dmonad/crdt-benchmarks

---

## 3. Implied Aether Feature Candidates

1. **No-Cloud E2E-Encrypted Sync (Yjs + value-level encryption)** — Sync bookmarks/tabs/sessions/settings/notes across devices with no server able to read data and no account required. The headline differentiator. (Sync & Portability)
2. **Account-Free Device Pairing (QR / verification-code enrollment)** — Add a device by scanning a QR on an existing one; keys wrapped to the new device's public key over a direct peer channel. (Privacy & Security)
3. **Self-Hostable P2P Relay (Iroh `iroh-relay` / fallback)** — Optional user-run relay binary for NAT-blocked connectivity, with E2E-encrypted traffic the relay can't read; default to public relay pool. (Sync & Portability)
4. **Offline-First Local State with Auto-Merge** — All browser state usable fully offline; CRDT convergence on reconnect with no conflict dialogs for structured data. (Performance / Sync & Portability)
5. **Seed-Phrase + Social Recovery for Sync Identity** — Recover the master sync identity via paper key, optional M-of-N trusted-contact recovery (Keybase pattern). (Privacy & Security)
6. **Device Management & Forward-Secret Revocation** — List enrolled devices; removing one rotates document keys so a lost/stolen device loses future access. (Privacy & Security)
7. **Selective / Per-Device Sync Scoping** — Choose which document namespaces sync to which device (e.g., work tabs not on phone) via document partitioning. (Sync & Portability)
8. **Versioned History for Notes (optional Automerge-style snapshots)** — Periodic Yjs snapshots (or Automerge sub-engine) to give time-travel/undo for notes without paying full-history cost everywhere. (Productivity)
9. **Real-Time Cross-Device Tab/Session Handoff** — Push the current tab/session to another device instantly over the gossip channel (live, not just periodic sync). (Workspace & Organization)
10. **Multi-User Collaborative Workspaces (MLS upgrade path)** — Shared, E2E-encrypted workspaces/notes for small teams, key-managed via MLS when added. (Social & Collaboration)

---

## 4. Competitive / Whitespace Notes

- **Open whitespace — no incumbent does all four.** No shipping browser offers (a) no-cloud, (b) account-free, (c) E2E-encrypted, (d) true CRDT-merge sync simultaneously. Chrome Sync and Firefox Sync are cloud-account-bound (Firefox Sync is E2E but server-mediated and account-required); Arc/Dia sync is cloud-account-bound; Vivaldi Sync is E2E but account + Vivaldi-server. None are no-cloud or account-free.
- **The privacy/power-user segments already self-host** (Floccus + WebDAV, xBrowserSync, Syncthing for bookmarks) but suffer file-level last-writer-wins conflicts and no real merge — exactly the gap operation-level CRDT sync closes (F12). This is a concrete, addressable pain in an underserved segment.
- **Production de-risking exists.** Proton Docs and Serenity Notes prove E2E-encrypted Yjs at scale (F14); we are assembling proven components, not inventing a primitive — a strong story for a privacy-positioned launch.
- **Transport is the one genuinely unsettled bet.** Native Rust core → Iroh is cleanest and most composable (F7–F8); browser-context surfaces today → js-libp2p is the only production-native option (F9–F10). Recommend a transport-abstraction boundary so the engine can mesh providers (Iroh native + relay/WebSocket + libp2p browser) and swap as Iroh's WASM client matures.
- **Rust-native alignment.** `yrs` + Iroh both being Rust libraries matches the Firefox-fork direction in the project's architecture decisions, minimizing FFI/process-boundary friction vs a Go daemon (Syncthing) or JS-only stack.

---

## 5. Risks

| Risk | Severity | Notes / Mitigation |
|------|----------|--------------------|
| **Iroh browser-WASM immaturity** | High | Primary blocker for browser-surface sync (F9). Mitigate: use Iroh only in native Rust core; js-libp2p or relay/WebSocket provider for browser contexts; transport abstraction to swap later. Source: https://iroh.computer/blog/iroh-and-the-web |
| **Key-management UX** | High | Wrong UX = data loss or lockout. Mitigate: copy Signal/Matrix enrollment + Keybase recovery; mandatory seed-phrase backup flow. Source: https://www.inkandswitch.com/local-first/ |
| **Stale benchmark data (Automerge 3.0 untested)** | Medium | Public benchmarks test Automerge 2.1.10; 3.0's runtime compression may shift the picture (F4). Mitigate: re-run benchmarks before final lock-in. Source: https://github.com/dmonad/crdt-benchmarks |
| **NAT traversal / connectivity failures** | Medium | P2P hole-punching fails on some networks. Mitigate: relay fallback (Iroh E2E-encrypted relay; self-hostable). Source: https://iroh.computer/docs |
| **Iroh project immaturity vs libp2p** | Medium | Iroh younger than battle-tested libp2p (Ethereum/Filecoin scale). Mitigate: n0 well-funded + actively developed; libp2p is the documented architectural fallback (both public-key + QUIC). Source: https://github.com/n0-computer/iroh |
| **Large-document scaling in browser** | Medium | Yjs ceiling ~1M chars before partitioning needed (F18). Mitigate: document partitioning + selective sync. Source: https://github.com/dmonad/crdt-benchmarks |
| **No built-in version history in Yjs** | Low | Loses Automerge's time-travel. Mitigate: periodic snapshots; optional Automerge sub-engine for notes. Source: https://automerge.org/blog/automerge-3/ |
| **`yrs` divergence from Yjs JS** | Low | Interop drift between Rust core and JS editor bindings. Mitigate: y-crdt community maintains interop tests. Source: https://github.com/yjs/yjs |
| **Loro adoption regret** | Low | If we pick Yjs and Loro wins long-term. Mitigate: monitor Loro; CRDT engine is behind the transport/encryption abstraction. Source: https://github.com/loro-dev/loro |

---

## Sources

- crdt-benchmarks — https://github.com/dmonad/crdt-benchmarks
- Yjs GitHub — https://github.com/yjs/yjs
- Automerge 3.0 blog — https://automerge.org/blog/automerge-3/
- Loro GitHub — https://github.com/loro-dev/loro
- Iroh GitHub — https://github.com/n0-computer/iroh
- Iroh docs — https://iroh.computer/docs
- Iroh & the Web — https://iroh.computer/blog/iroh-and-the-web
- rust-libp2p — https://github.com/libp2p/rust-libp2p
- Syncthing BEP v1 — https://docs.syncthing.net/specs/bep-v1.html
- MLS (RFC 9420) — https://www.rfc-editor.org/rfc/rfc9420.html
- Ink & Switch Local-First — https://www.inkandswitch.com/local-first/
