# Self-Hostable Workflow Engines & Local-First Sync Stacks (2026)

**Date:** 2026-06-10
**Research rounds:** 1 (direct evidence gathering)
**Status:** Cited

---

## Executive Summary

Three workflow engines and three transport stacks serve fundamentally different durability models. **Temporal** provides the strongest durability guarantees via event-sourced replay — a crashed worker never loses completed activity results. **Windmill** provides PostgreSQL-backed job queuing with fast operational simplicity but no mid-job replay; in-flight jobs are lost on worker crash. **n8n** in queue mode provides reasonable durability for stateless workflows but lacks replay semantics and imposes a 1-hour default maximum execution time.

For the CRDT sync layer: **Yjs** is the more mature and widely deployed option with a rich provider ecosystem. **Automerge** (via automerge-repo) is more principled and portable but at an earlier ecosystem maturity stage. For transport: **js-libp2p** is the only option with production-grade browser-native P2P support today. **Iroh** is Rust-native and approaching v1.0 but lacks a browser-native WASM client; its JS wrapper is explicitly "very much work-in-progress" and HTTP-RPC-backed, not native. **Syncthing** is wrong at the abstraction level for CRDT sync — it operates on file blocks, not document operations.

For a browser automation + sync layer, the highest-fit stack is: **Temporal** (workflow engine) + **Yjs** (CRDT) + **js-libp2p with WebRTC transport** (sync transport), with y-indexeddb for browser-local persistence. For lowest operational burden, substitute Windmill for Temporal with per-flow-step retry semantics.

---

## Section 1: Workflow Engines

### 1.1 Windmill

#### Architecture & Persistence

Windmill stores all state in PostgreSQL: the job queue, scripts, flows, resources, schedules, and audit logs. Servers and workers are stateless. [[1]](https://www.windmill.dev/docs/advanced/high_availability)

Workers pull jobs from the queue, atomically set the job's state to "running", execute it, stream logs (optionally to S3), then write the final result and logs to the database and create a "completed job" record. Each worker can run up to ~26 million jobs per month at 100 ms/job. One worker handles one job at a time by design. [[2]](https://www.windmill.dev/docs/core_concepts/worker_groups)

#### Durability Guarantee

**Critical gap: in-flight jobs do not survive worker crashes.** The Windmill HA docs state explicitly: _"In-flight jobs (mid-execution when the primary went down) will not complete. They will appear as failed or timed-out. You can re-run them after failover."_ [[1]](https://www.windmill.dev/docs/advanced/high_availability)

However, Windmill's flow-as-steps model partially mitigates this: each flow step is an independent job stored in PostgreSQL. If a flow fails at step 3, prior steps' results are persisted and a retry can resume from that point — but this is not automatic replay, it requires error-handler-triggered or manual retry. [[3]](https://www.windmill.dev/docs/core_concepts/jobs)

**Queued jobs (not yet started) always survive** because they are stored in PostgreSQL before a worker picks them up. [[1]](https://www.windmill.dev/docs/advanced/high_availability)

Replay semantics: **None**. Individual jobs are at-most-once execution.

#### Self-Host Requirements

- Minimum: PostgreSQL + 1 server + 1 worker (Docker Compose). [[1]](https://www.windmill.dev/docs/advanced/high_availability)
- Standard HA: PostgreSQL HA (CloudNativePG/Patroni/managed) + load-balanced servers + multiple workers.
- No special PostgreSQL extensions required. Workers only need `DATABASE_URL`.
- Workers can be deployed in separate VPCs with a tunnel to the database ("agent mode" for untrusted environments). [[2]](https://www.windmill.dev/docs/core_concepts/worker_groups)
- Autoscaling requires Enterprise Edition.

#### Browser Automation Fit

Native first-class support. A pre-configured `reports` worker group installs Chromium via init scripts. The `chromium` tag routes browser automation jobs to these workers. Official Playwright (Bun) and Puppeteer (Bun) examples are in the docs. [[4]](https://www.windmill.dev/docs/advanced/browser_automation)

**Security note**: Chromium must run with `--no-sandbox` inside containers, which is explicitly flagged as a security risk in the Windmill docs. [[4]](https://www.windmill.dev/docs/advanced/browser_automation)

#### Observability

- Built-in job history UI with logs, results, metadata
- Prometheus metrics endpoint on workers (`/metrics`) [[3]](https://www.windmill.dev/docs/core_concepts/jobs)
- Service logs accessible via UI search modal
- Worker-count alert notifications (Slack, Teams, Email) — Enterprise [[2]](https://www.windmill.dev/docs/core_concepts/worker_groups)
- Queue metrics (per-tag queue depth, latency) — Enterprise

#### Long-Running Tasks

No explicit heartbeat mechanism documented. No engine-enforced timeout (unlike n8n). Retention: 30 days community, unlimited enterprise. Large logs offloaded to S3. [[3]](https://www.windmill.dev/docs/core_concepts/jobs)

#### Error Handling

Cascading error handlers: try/catch within script → flow-step error handler → schedule error handler → workspace error handler → instance error handler. Each layer receives job ID, path, start time, workspace, email. [[5]](https://www.windmill.dev/docs/core_concepts/error_handling)

#### Licensing

AGPLv3 community edition. Proprietary EE for advanced features (autoscaling, multi-main, queue metrics).

---

### 1.2 Temporal

#### Architecture & Event Sourcing Model

Temporal implements durable execution via event-sourced replay. Every workflow produces an **Event History** — a complete ordered log. The Event History is the single source of truth. [[6]](https://docs.temporal.io/workflows)

When a workflow resumes after a crash, Temporal does not restore memory from a snapshot. It re-executes the workflow code from the beginning using the recorded Event History to fast-forward through previously completed steps without redoing actual work. Activities' results are stored in the history and replayed, not re-executed. [[6]](https://docs.temporal.io/workflows)

_"Temporal Workflows are resilient. They can run—and keep running—for years, even if the underlying infrastructure fails."_ [[6]](https://docs.temporal.io/workflows)

This means:
- A crashed worker loses no completed activity results
- Browser automation (Playwright) actions as Activities survive worker restarts
- Workflows can span infrastructure lifecycle changes

#### Durability Limits

Event history hard limits (self-hosted defaults) [[7]](https://docs.temporal.io/self-hosted-guide/defaults):
- Warn at 10 MB / 10,240 events
- **Terminate workflow** at 50 MB / 51,200 events
- Per-payload blob: warn at 256 KB, error at 2 MB
- Max concurrent pending activities/signals: 2,000 default

For long-running browser automation workflows generating many events (CDP-level actions), these limits are material. Temporal's Continue-As-New API checkpoints and starts fresh history; this is the required mitigation.

#### Self-Host Requirements

More operationally complex than Windmill or n8n. [[8]](https://docs.temporal.io/self-hosted-guide/deployment)

**Components:**
- `temporal-server` binary (Go, multiple internal services: frontend, matching, history, worker)
- PostgreSQL or Cassandra backend
- Elasticsearch optional but recommended for visibility/search
- `temporal-ui-server` for the Web UI
- Schema migrations required on upgrades

Docker Compose quickstart via `temporalio/samples-server` repository. Helm charts for Kubernetes (`temporalio/helm-charts`). [[8]](https://docs.temporal.io/self-hosted-guide/deployment)

**Helm compatibility footgun**: Helm chart ≥ 0.73.1 required for Temporal Server 1.30+. Charts below 0.73.1 are incompatible with 1.30+ images and will fail silently. [[8]](https://docs.temporal.io/self-hosted-guide/deployment)

Local development: `temporal server start-dev` (single SQLite binary, no external dependencies). [[9]](https://docs.temporal.io/self-hosted-guide)

#### Browser Automation Fit

Activities map directly to browser automation steps. Each Playwright action is an Activity — retried independently with configurable retry policies. Long-running browser sessions live inside long-lived Workflows with Continue-As-New for history management. No built-in Chromium worker setup; infrastructure layer responsibility.

Community pattern: `temporal-worker` Docker image + Playwright installed in container, Temporal SDK in TypeScript/Go/Python/Rust.

#### Observability

- Web UI with workflow execution timeline, event history viewer
- Prometheus metrics
- Structured JSON logging
- Archival: closed workflow histories to blob storage (S3/GCS) [[9]](https://docs.temporal.io/self-hosted-guide)
- Multi-cluster replication for DR

#### Licensing

MIT license. No usage restrictions.

---

### 1.3 n8n

#### Architecture & Execution Modes

n8n runs in two modes: [[10]](https://docs.n8n.io/hosting/scaling/queue-mode/)

**Regular mode**: Single Node.js process handles triggers, webhooks, and execution. SQLite or PostgreSQL. If the process dies, in-flight executions are lost.

**Queue mode**: Main instance handles triggers/webhooks (not execution). Redis acts as message broker. Worker processes pull execution IDs from Redis, fetch workflow definition from PostgreSQL, execute, write results to PostgreSQL, post completion back to Redis.

Queue mode **does not support** binary data storage in filesystem — requires S3. Queue mode **requires PostgreSQL 13+**; SQLite with queue mode is explicitly not recommended. [[10]](https://docs.n8n.io/hosting/scaling/queue-mode/)

#### Durability

**No replay on crash.** `N8N_GRACEFUL_SHUTDOWN_TIMEOUT` (default 30s) allows running jobs to finish before worker termination, but an abrupt crash loses in-flight state. [[10]](https://docs.n8n.io/hosting/scaling/queue-mode/)

`EXECUTIONS_DATA_SAVE_ON_ERROR`: saves execution data on error by default.  
`EXECUTIONS_DATA_PRUNE_MAX_COUNT`: 10,000 execution records default max.  
`N8N_WORKFLOW_AUTODEACTIVATION_MAX_LAST_EXECUTIONS`: workflows auto-unpublished after 3 consecutive crashes (when autodeactivation enabled). [[11]](https://docs.n8n.io/hosting/configuration/environment-variables/executions/)

#### Long-Running Workflows

`EXECUTIONS_TIMEOUT`: default -1 (no global timeout).  
`EXECUTIONS_TIMEOUT_MAX`: **default 3,600 seconds (1 hour)** — the maximum users can set for any single workflow. [[11]](https://docs.n8n.io/hosting/configuration/environment-variables/executions/)

This 1-hour ceiling is a hard constraint for browser automation tasks that take longer than 60 minutes.

#### Self-Host Requirements

Queue mode: PostgreSQL + Redis + main n8n instance + ≥1 worker. Docker Compose.  
Multi-main (HA) is Enterprise-only. [[10]](https://docs.n8n.io/hosting/scaling/queue-mode/)

Worker concurrency default: 10 simultaneous executions per worker. n8n recommends ≥5 concurrency to avoid database connection pool exhaustion. [[10]](https://docs.n8n.io/hosting/scaling/queue-mode/)

#### Browser Automation

No built-in browser automation support. Browser actions can be invoked via Execute Command node or custom code nodes, but there is no first-class Playwright/Puppeteer integration equivalent to Windmill's.

#### Observability

Worker processes expose `/healthz`, `/healthz/readiness`, and `/metrics`. Worker management UI (view running workers + performance metrics) is **Enterprise-only**. [[10]](https://docs.n8n.io/hosting/scaling/queue-mode/)

#### Licensing

"Fair-code" (Sustainable Use License + n8n Enterprise License). Not OSI-approved open source. Material risk for commercial embedding in a browser product.

---

### 1.4 Cross-Engine Comparison

| Dimension | Temporal | Windmill | n8n |
|---|---|---|---|
| **Durability model** | Event-sourced replay; never loses completed activity results | PostgreSQL queue; in-flight jobs lost on crash | Redis queue; in-flight executions lost on crash |
| **Replay semantics** | Full deterministic replay from Event History | None (manual retry from last completed step in flows) | None |
| **Max execution duration** | Years (Continue-As-New for history limits) | Unlimited (no engine timeout) | 1 hour default max |
| **Worker crash recovery** | Automatic; workflow resumes from last event | Job fails; manual re-run needed | Execution lost; manual re-run needed |
| **Browser automation** | Via Activities (Playwright container); no built-in infra | First-class (`reports` worker group, Chromium init scripts) | No native support |
| **Self-host complexity** | High (multi-component, schema migrations) | Low-medium (Postgres + stateless containers) | Medium (Postgres + Redis + queue config) |
| **Min infra** | temporal-server + PostgreSQL (+ Elasticsearch optional) | PostgreSQL + server + worker | PostgreSQL + Redis + main + worker |
| **Observability** | Web UI, Prometheus, archival, multi-cluster DR | Built-in UI, Prometheus, S3 logs, alerts (EE) | /metrics, /healthz; worker UI (EE) |
| **Language support** | Go, Java, TypeScript, Python, Rust, .NET, PHP | Python, TypeScript (Bun/Deno), Go, Bash, Rust, PHP, SQL, +10 more | JavaScript/TypeScript (Node.js only) |
| **License** | MIT | AGPLv3 + EE | Fair-code + EE |
| **Ops burden** | Highest | Lowest | Medium |

---

## Section 2: CRDT Layer

### 2.1 Yjs

#### CRDT Model: YATA

Yjs uses YATA (Yet Another Transformation Approach), a list CRDT optimized for collaborative text editing. Operations are represented as items with left/right origin IDs; concurrent inserts at the same position are deterministically ordered by client ID. Core shared types: Y.Map, Y.Array, Y.Text, Y.XmlElement, Y.XmlText.

#### Provider Architecture

Providers connect a Y.Doc to a network or storage backend. **Providers are meshable** — multiple can be active simultaneously (e.g., y-websocket for real-time + y-indexeddb for local persistence + y-webrtc for direct peer sync). [[12]](https://docs.yjs.dev/getting-started/a-collaborative-editor)

Standard providers:
- **y-websocket**: Client/server WebSocket sync
- **y-webrtc**: WebRTC P2P sync (requires signaling server)
- **y-indexeddb**: Browser IndexedDB local persistence [[13]](https://docs.yjs.dev/getting-started/allowing-offline-editing)

Commercial providers built on Yjs: Hocuspocus (TipTap), Y-Sweet (Jamsocket), Liveblocks, SuperViz. [[12]](https://docs.yjs.dev/ecosystem/connection-provider)

#### Awareness & Presence

The y-protocols package implements Awareness CRDT: schemaless JSON object with an incrementing clock per client. Remote states expire after 30 seconds without updates (marked offline). Clients must broadcast their awareness state periodically. [[14]](https://docs.yjs.dev/api/about-awareness)

#### Offline Support

y-indexeddb persists document state to browser IndexedDB. On reconnect, only missing updates are synced to the server. Enables fully offline-first browser applications. [[13]](https://docs.yjs.dev/getting-started/allowing-offline-editing)

#### Maturity

Production-stable, widespread adoption across collaborative editors. The core API is stable (some docs pages note "last updated 4 years ago" — this reflects stability, not abandonment).

---

### 2.2 Automerge (automerge-repo)

#### CRDT Model

Automerge uses a JSON CRDT. Lists use RGA (Replicated Growable Array). Maps use last-write-wins with conflict tracking — all concurrent values are preserved and queryable. The Rust core (`automerge-rs`) compiles to WebAssembly for browser use, with TypeScript bindings. [[15]](https://automerge.org/docs/)

Automerge is explicitly designed for local-first software. Network-agnostic — the sync protocol is transport-independent. [[15]](https://automerge.org/docs/)

#### automerge-repo

`automerge-repo` wraps the core library with multi-document management, pluggable networking, and storage: [[16]](https://github.com/automerge/automerge-repo)

**Storage adapters:**
- `automerge-repo-storage-indexeddb`: browser IndexedDB
- `automerge-repo-storage-nodefs`: filesystem (Node.js)

**Network adapters:**
- `automerge-repo-network-websocket`: client/server WebSocket sync
- `automerge-repo-network-messagechannel`: cross-tab sync via MessageChannel API
- `automerge-repo-network-broadcastchannel`: tab-to-tab (described as "likely only useful for experimentation")

No official libp2p, Iroh, or WebRTC network adapter exists in official automerge-repo packages. [[16]](https://github.com/automerge/automerge-repo)

#### Maturity

automerge-repo is at `v2.6.0-alpha.2` for some packages — indicates ongoing API development. Automerge core is mature; automerge-repo (the networking/storage layer) is still stabilizing. Front-end adapters available for React, Svelte, SolidJS. [[16]](https://github.com/automerge/automerge-repo)

---

### 2.3 Yjs vs Automerge Comparison

| Dimension | Yjs | Automerge |
|---|---|---|
| **CRDT algorithm** | YATA (list/text focused) | JSON CRDT (RGA for lists, LWW+conflict tracking for maps) |
| **Core language** | Pure JavaScript | Rust compiled to WASM |
| **Browser bundle** | Small (pure JS) | Larger (WASM runtime overhead) |
| **Provider ecosystem** | Rich: WebSocket, WebRTC, IndexedDB, commercial providers | Narrower: WebSocket, MessageChannel, BroadcastChannel |
| **Offline-first** | y-indexeddb (stable, production) | automerge-repo-storage-indexeddb |
| **Operation history** | Binary diffs; no branching | Full op log; supports branching/diffing |
| **Conflict representation** | Auto-resolved at type level | Conflicts preserved and queryable |
| **Maturity** | Production-stable, 4+ years | Core mature; repo layer alpha |
| **Best fit** | Real-time collab, cursor sync, large teams | Versioned data, audit trail, offline-first with history |

**Recommendation for browser automation state storage**: Yjs is the stronger near-term choice due to ecosystem maturity and proven y-indexeddb + y-websocket combination. Automerge is better if full operation history or explicit conflict inspection is required.

---

## Section 3: Sync Transport Layer

### 3.1 Iroh

#### Architecture

Iroh is a QUIC-based P2P transport library built in Rust (uses noq, a QUIC implementation fork of Quinn):

- **Endpoint**: Ed25519 keypair identity. Establishes QUIC connections. EndpointID = public key. [[17]](https://iroh.computer/docs/concepts/endpoint)
- **Relay**: Stateless NAT traversal + encrypted traffic fallback. ~90% of networking conditions allow a direct P2P connection after relay coordination. Relay traffic is E2E encrypted — relays cannot read it. [[18]](https://iroh.computer/docs/concepts/relays)
- **iroh-blobs**: Content-addressed blob protocol using BLAKE3 tree hashing with incremental verification and range requests. [[19]](https://iroh.computer/docs/protocols/blobs)
- **iroh-gossip**: HyParView/PlumTree epidemic broadcast trees for topic-based gossip — the relevant protocol for CRDT update propagation. [[20]](https://iroh.computer/docs/gossip)

#### Maturity: v1.0.0-rc.1 with breaking API changes still landing

As of 2026 the latest release is v1.0.0-rc.1. Multiple `[breaking]` API changes appear in every release (v0.96, v0.97, v0.98, v1.0.0-rc.0, v1.0.0-rc.1). The `discovery` module was renamed to `address_lookup` in v0.96. [[21]](https://github.com/n0-computer/iroh/releases)

#### Browser / JS Support: Not available natively

**Iroh does not have a native browser WASM client.** The `iroh-js` package README states: _"This is a very much work-in-progress version of a javascript client for iroh... Currently the only supported RPC backing is iroh.network."_ [[22]](https://github.com/n0-computer/iroh-js)

iroh-js is an HTTP RPC client against the managed `iroh.network` cloud service — not a P2P WASM library that can run in a browser. For browser-to-browser Iroh connections, no supported path exists today.

#### Self-Hosting

Relay server can be self-hosted via the open-source `iroh-relay` binary. Public relays provided by n0.computer (free for dev/test, no uptime guarantees). Dedicated relays via Iroh Services (managed, with auth and SLA). [[18]](https://iroh.computer/docs/concepts/relays)

#### Fit: Not suitable for browser-native CRDT sync today.

Iroh is excellent for native (Rust) applications. Monitor for a WASM Endpoint after v1.0 stable.

---

### 3.2 js-libp2p

#### Browser Support

js-libp2p has genuine browser-native P2P support: [[23]](https://github.com/libp2p/js-libp2p)

- `@libp2p/webrtc`: WebRTC browser-to-browser transport
- `@libp2p/websockets`: WebSocket transport (browser-compatible)
- `@libp2p/webtransport`: WebTransport transport (browser-compatible, newer)
- `@libp2p/gossipsub`: pub/sub for Yjs/Automerge update propagation in browsers
- `@libp2p/floodsub`: simple flood pubsub (less efficient)

#### Production Usage

_"This project has been used in production for years in Ethereum, IPFS, and more."_ [[23]](https://github.com/libp2p/js-libp2p)

Confirmed production deployments:
- Ethereum Lodestar (beacon client)
- Helia (IPFS in JavaScript)
- OrbitDB (CRDT database over libp2p — direct precedent for CRDT-over-libp2p)
- Peerbit (CRDT-based P2P data storage)
- HOPR Network

#### NAT Traversal

- Circuit relay for NAT traversal (relay node forwards traffic)
- WebRTC transport enables direct browser-to-browser connections with STUN/TURN-like hole punching
- mDNS for local network discovery
- Kademlia DHT for peer discovery

#### CRDT Integration

OrbitDB demonstrates the pattern: CRDT-encoded documents synced over libp2p gossipsub. The same approach applies to Yjs or Automerge update propagation via gossipsub topics. No official Yjs provider for js-libp2p exists in the core Yjs ecosystem, but the provider interface is straightforward to implement against the gossipsub event API.

#### Operational Burden

Requires self-hosted bootstrap/relay nodes for NAT traversal. libp2p relay nodes are stateful (track connected peers) — higher operational complexity than Iroh's stateless relays.

---

### 3.3 Syncthing

#### Protocol

Syncthing implements the Block Exchange Protocol (BEP) over TLS 1.3. It synchronizes files by comparing BLAKE2b block hashes and transferring missing blocks (128 KiB – 16 MiB blocks). Version vectors track per-device sequence numbers. [[24]](https://docs.syncthing.net/specs/bep-v1.html)

#### Why Syncthing Does Not Fit CRDT Sync

Syncthing operates at the **file-block level**, not the **document-operation level**. Yjs and Automerge exchange encoded operation diffs or state vectors — Syncthing would treat a CRDT document as an opaque binary blob and sync the entire file on any change, with no merge semantics.

Concurrent writes to the same file from two Syncthing nodes produce a conflict: one version is kept as primary; the other becomes a `filename.sync-conflict-...` copy. There is no operation-level merge. [[24]](https://docs.syncthing.net/specs/bep-v1.html)

Additionally, Syncthing has no browser client and no JavaScript API.

**Syncthing is not appropriate for CRDT document sync.** Use it for file-level sync between desktop/server nodes (e.g., syncing Playwright screenshot archives or build artifacts), not for collaborative document state.

---

### 3.4 Transport Comparison

| Dimension | Iroh | js-libp2p | Syncthing |
|---|---|---|---|
| **Browser-native (no proxy)** | ❌ (iroh-js is WIP RPC client) | ✅ (WebRTC, WebSockets, WebTransport) | ❌ (no JS/browser client) |
| **NAT traversal** | ~90% via relays + hole punching | Circuit relay + WebRTC hole punching | Yes (global discovery + relay) |
| **CRDT integration** | None officially (gossip substrate available) | gossipsub + OrbitDB/Peerbit precedent | ❌ (incompatible abstraction level) |
| **Self-host relay ops** | Stateless binary (simple) | Stateful relay/bootstrap nodes (moderate) | Discovery + relay servers |
| **API stability** | Pre-1.0 (breaking changes per release) | Semver, stable, multi-year production use | Stable protocol spec (BEP v1) |
| **Desktop / native fit** | Excellent (Rust, all platforms) | Good (Node.js/Bun) | Excellent (Go, all platforms) |
| **Use case** | Native app P2P, content-addressed storage | Browser P2P networking stack | File sync between trusted devices |

---

## Section 4: Fit for Browser Automation + Sync Layer

### 4.1 Workflow Engine Recommendation

For long-running, crash-resilient browser automation sessions:

**Temporal is the only engine with durable replay guarantees.** Each browser action maps to an Activity. Worker crash → workflow resumes from last recorded event. No work is repeated.

For lower operational burden with acceptable at-most-once semantics per step: **Windmill** with flow-step error handlers. Each flow step result is stored in PostgreSQL; retry can resume from the last completed step.

n8n is not recommended for long-running browser automation: 1-hour execution ceiling, no replay semantics, fair-code licensing risk for commercial products.

### 4.2 CRDT + Transport Recommendation

**Lowest-risk production path**: **Yjs** + **y-indexeddb** (browser-local) + **y-websocket** (server relay sync).
- Offline-first: y-indexeddb persists to browser IndexedDB
- Sync: y-websocket connects to a self-hosted y-websocket relay server (stateless)
- Providers are meshable — add y-webrtc for direct peer sync as enhancement

**Fully P2P path**: **Yjs** or **Automerge** + **js-libp2p** (WebRTC transport + gossipsub).
- Browser-native, production-proven (OrbitDB, Peerbit precedent)
- Requires self-hosted bootstrap/relay infrastructure

**Do not use Syncthing** for document-level state sync.

**Do not rely on Iroh** for browser peers until native WASM Endpoint lands post-v1.0.

---

## Open Questions

1. **Windmill mid-flow crash behavior**: Does the flow step persistence survive an abrupt worker SIGKILL (not just graceful shutdown), or does only an explicit error handler capture the last completed step? Not explicitly documented.
2. **Temporal history growth rate for CDP automation**: High-frequency browser automation (CDP events, DOM mutations) may exhaust 10,240 event limits quickly. What is the appropriate Continue-As-New cadence?
3. **iroh-js WASM timeline**: No official roadmap page accessible for browser WASM Endpoint support.
4. **js-libp2p WebTransport maturity**: WebTransport is newer than WebRTC in the browser transport stack; production parity not confirmed in docs.
5. **automerge-repo stable release**: `v2.6.0-alpha.2` version string suggests ongoing API changes.
6. **n8n licensing for commercial products**: Fair-code Sustainable Use License restricts embedding in commercial offerings without enterprise license.

---

## Sources

| # | Source | URL |
|---|---|---|
| 1 | Windmill High Availability | https://www.windmill.dev/docs/advanced/high_availability |
| 2 | Windmill Worker Groups | https://www.windmill.dev/docs/core_concepts/worker_groups |
| 3 | Windmill Jobs | https://www.windmill.dev/docs/core_concepts/jobs |
| 4 | Windmill Browser Automation | https://www.windmill.dev/docs/advanced/browser_automation |
| 5 | Windmill Error Handling | https://www.windmill.dev/docs/core_concepts/error_handling |
| 6 | Temporal Workflows | https://docs.temporal.io/workflows |
| 7 | Temporal Self-Hosted Defaults | https://docs.temporal.io/self-hosted-guide/defaults |
| 8 | Temporal Self-Hosted Deployment | https://docs.temporal.io/self-hosted-guide/deployment |
| 9 | Temporal Self-Hosted Guide | https://docs.temporal.io/self-hosted-guide |
| 10 | n8n Queue Mode | https://docs.n8n.io/hosting/scaling/queue-mode/ |
| 11 | n8n Execution Environment Variables | https://docs.n8n.io/hosting/configuration/environment-variables/executions/ |
| 12 | Yjs Collaborative Editor Getting Started | https://docs.yjs.dev/getting-started/a-collaborative-editor |
| 13 | Yjs Offline Support | https://docs.yjs.dev/getting-started/allowing-offline-editing |
| 14 | Yjs Awareness API | https://docs.yjs.dev/api/about-awareness |
| 15 | Automerge Design Principles | https://automerge.org/docs/ |
| 16 | automerge-repo README | https://github.com/automerge/automerge-repo |
| 17 | Iroh Endpoints | https://iroh.computer/docs/concepts/endpoint |
| 18 | Iroh Relays | https://iroh.computer/docs/concepts/relays |
| 19 | Iroh Blobs | https://iroh.computer/docs/protocols/blobs |
| 20 | Iroh Gossip | https://iroh.computer/docs/gossip |
| 21 | Iroh Releases | https://github.com/n0-computer/iroh/releases |
| 22 | iroh-js README | https://github.com/n0-computer/iroh-js |
| 23 | js-libp2p README | https://github.com/libp2p/js-libp2p |
| 24 | Syncthing BEP v1 | https://docs.syncthing.net/specs/bep-v1.html |
