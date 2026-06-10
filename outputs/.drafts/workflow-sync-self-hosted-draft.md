# Self-Hostable Workflow Engines & Local-First Sync Stacks (2026)

**Draft — pre-citation**
**Date:** 2026-06-10
**Topic:** Windmill, Temporal, n8n durability + CRDT sync via Yjs/Automerge over Iroh/libp2p/Syncthing

---

## Executive Summary

Three workflow engines and three transport stacks serve fundamentally different durability models. Temporal provides the strongest durability guarantees via event-sourced replay — a crashed worker never loses completed work. Windmill provides PostgreSQL-backed job queuing with fast operational simplicity but no mid-job replay; in-flight jobs are lost on worker crash. n8n in queue mode provides reasonable durability for stateless workflows but lacks replay semantics and imposes a 1-hour default maximum execution time.

For the CRDT sync layer: Yjs is the more mature and widely deployed option with a rich provider ecosystem. Automerge (via automerge-repo) is more principled and portable but at an earlier ecosystem maturity stage. For transport: libp2p (js-libp2p) is the only option with production-grade browser-native P2P support today. Iroh is Rust-native and approaching v1.0 but lacks a browser-native WASM client; its JS wrapper is explicitly "work-in-progress" and RPC-backed, not native. Syncthing is wrong at the abstraction level for CRDT sync — it operates on file blocks, not document operations.

For a browser automation + sync layer, the highest-fit stack is: **Temporal** (workflow engine) + **Yjs** (CRDT) + **js-libp2p with WebRTC transport** (sync transport), with y-indexeddb for browser-local persistence.

---

## Section 1: Workflow Engines

### 1.1 Windmill

#### Architecture & Persistence

Windmill stores all state in PostgreSQL: the job queue, scripts, flows, resources, schedules, and audit logs. Servers and workers are stateless. [Source: windmill.dev/docs/advanced/high_availability]

Workers pull jobs from the queue and atomically set the job's state to "running", execute it, stream logs (optionally to S3), then once finished, write the final result and logs to the database and create a "completed job" record. [Source: windmill.dev/docs/core_concepts/worker_groups]

Each worker can run up to ~26 million jobs per month at 100ms per job. One worker handles one job at a time by design. [Source: windmill.dev/docs/core_concepts/worker_groups]

#### Durability Guarantee

**Critical gap: in-flight jobs do not survive worker crashes.** The Windmill HA documentation explicitly states: "In-flight jobs (mid-execution when the primary went down) will not complete. They will appear as failed or timed-out. You can re-run them after failover." [Source: windmill.dev/docs/advanced/high_availability]

However, Windmill's flow-as-steps model partially mitigates this: each flow step is an independent job stored in PostgreSQL. If a flow fails at step 3, the prior steps' results are persisted and a retry can resume from that point, though this is not automatic replay — it requires manual or error-handler-triggered retry.

**Queued jobs (not yet started) always survive** because they are stored in PostgreSQL before a worker picks them up. [Source: windmill.dev/docs/advanced/high_availability]

There is no Temporal-style event history or deterministic replay. Windmill does not re-execute code to reconstruct state; it either completes or fails.

#### Replay semantics: None. Jobs are at-most-once on the individual job level.

#### Self-Host Requirements

Minimum: PostgreSQL + 1 server + 1 worker (Docker Compose).
Standard: PostgreSQL HA (CloudNativePG/Patroni/managed) + load-balanced servers + multiple workers.
No special PostgreSQL extensions required. Workers only need `DATABASE_URL`. [Source: windmill.dev/docs/advanced/high_availability]

Workers can be deployed in separate VPCs with a tunnel to the database ("agent mode" for untrusted environments). [Source: windmill.dev/docs/core_concepts/worker_groups]

Autoscaling requires Enterprise Edition.

#### Browser Automation Fit

Native first-class support. A pre-configured `reports` worker group installs Chromium via init scripts. The `chromium` tag routes browser automation jobs to these workers. Official Playwright (Bun) and Puppeteer (Bun) examples in docs. [Source: windmill.dev/docs/advanced/browser_automation]

**Security note**: Chromium must run with `--no-sandbox` inside containers, which is explicitly flagged as a security risk in the docs.

#### Observability

- Built-in job history UI with logs, results, metadata
- Prometheus metrics endpoint on workers (`/metrics`)
- Service logs accessible via UI search modal
- Worker-count alert notifications (Slack, Teams, Email) — Enterprise
- Queue metrics (per-tag queue depth, latency) — Enterprise
- Full-text search on job logs — Enterprise

#### Long-Running Tasks

No explicit heartbeat mechanism documented. Jobs run until completion with no engine-enforced timeout (unlike n8n). Retention: 30 days community, unlimited enterprise. Large logs offloaded to S3. [Source: windmill.dev/docs/core_concepts/jobs]

#### Error Handling

Cascading error handlers: try/catch within script → flow-step error handler → schedule error handler → workspace error handler → instance error handler. Each layer receives job ID, path, start time, workspace, email. [Source: windmill.dev/docs/core_concepts/error_handling]

#### Licensing
AGPLv3 for community edition. Proprietary EE for advanced features (autoscaling, multi-main, queue metrics, audit logs).

---

### 1.2 Temporal

#### Architecture & Event Sourcing Model

Temporal implements durable execution via event-sourced replay. Every workflow produces an **Event History** — a complete ordered log of everything that happened. The Event History is the single source of truth. [Source: docs.temporal.io/workflows]

When a workflow must resume after a crash or yield point, Temporal does not restore memory from a snapshot. It re-executes the workflow code from the beginning, using the recorded Event History to fast-forward through previously completed steps without redoing actual work. Activities' results are stored in the history and replayed, not re-executed. [Source: docs.temporal.io/workflows, section "How Workflow replay works"]

This deterministic replay model means:
- A crashed worker loses no completed work
- Workflows can run for years across infrastructure changes
- Activities (external calls, DB queries, API calls, browser automation) are retried independently with configurable retry policies

#### Durability Limits

Event history has hard limits. Default in self-hosted:
- Warn at 10 MB / 10,240 events; **terminate** workflow at 50 MB / 51,200 events [Source: docs.temporal.io/self-hosted-guide/defaults]
- Per-payload blob limit: warn at 256 KB, error at 2 MB
- Max concurrent pending activities/signals: 2,000 default

For long-running browser automation workflows that produce many events (page clicks, network requests, state updates), these limits are meaningful. Using Temporal's Continue-As-New API to checkpoint and start a new history is the recommended mitigation.

#### Self-Host Requirements

More operationally complex than Windmill or n8n.

**Components:**
- `temporal-server` binary (Go, multiple internal services: frontend, matching, history, worker)
- PostgreSQL or Cassandra backend
- Elasticsearch optional but recommended for visibility/search
- `temporal-ui-server` for the Web UI
- Schema migrations required on upgrades

Docker Compose quickstart available via `temporalio/samples-server` repository. Helm charts for Kubernetes available (`temporalio/helm-charts`). [Source: docs.temporal.io/self-hosted-guide/deployment]

Temporal explicitly warns: "Temporal services should run on hosts that are not accessible from the public internet."

Local dev: `temporal server start-dev` (single SQLite binary, no external dependencies). [Source: docs.temporal.io/self-hosted-guide]

**Schema migration path**: Helm chart ≥ 0.73.1 required for Temporal Server 1.30+; Helm charts below 0.73.1 are incompatible with 1.30+ images. This represents a real upgrade footgun. [Source: docs.temporal.io/self-hosted-guide/deployment]

#### Browser Automation Fit

Activities map directly to browser automation steps (each Playwright action is an activity). Long-running browser sessions live inside long-lived Workflows. Retries, timeouts, and heartbeats are configurable per-activity. No built-in Chromium worker setup — this must be handled at the infrastructure layer.

Community pattern: `temporal-worker` Docker image + Playwright installed in container, Temporal SDK in Go/TypeScript/Python/Java/Rust.

#### Observability

- Web UI with workflow execution timeline, event history viewer
- Prometheus metrics
- Structured logging (JSON)
- Archival: closed workflow histories to blob storage (S3/GCS)
- Multi-cluster replication for disaster recovery [Source: docs.temporal.io/self-hosted-guide]

#### Temporal Cloud vs Self-Hosted

Temporal Cloud manages all infra and removes schema migration burden. Durability semantics are identical — same event history model. Self-hosted carries full ops responsibility (database HA, schema migrations, Elasticsearch).

#### Licensing
MIT license for the open-source server. No usage restrictions.

---

### 1.3 n8n

#### Architecture & Execution Modes

n8n runs in two modes:

**Regular mode**: Single Node.js process handles triggers, webhook reception, and execution. SQLite or PostgreSQL. If the process dies, in-flight executions are lost.

**Queue mode**: Main instance handles triggers/webhooks (but not execution). Redis acts as message broker. Worker processes (each a full Node.js n8n instance) pull execution IDs from Redis, fetch workflow definition from PostgreSQL, execute, write results to PostgreSQL, post completion to Redis. [Source: docs.n8n.io/hosting/scaling/queue-mode/]

Queue mode explicitly **does not support** binary data storage in filesystem — requires S3 external storage for binary data.

Queue mode **requires PostgreSQL 13+**. SQLite with queue mode is explicitly not recommended. [Source: docs.n8n.io/hosting/scaling/queue-mode/]

#### Durability

**Key gap**: No replay or re-execution on crash. If a worker dies mid-execution, the execution is lost. `N8N_GRACEFUL_SHUTDOWN_TIMEOUT` (default 30s) allows running jobs to finish before worker termination, but an abrupt crash will lose in-flight state.

`EXECUTIONS_DATA_SAVE_ON_ERROR`: saves execution data on error by default. `EXECUTIONS_DATA_PRUNE_MAX_COUNT`: default 10,000 execution records retained. [Source: docs.n8n.io/hosting/configuration/environment-variables/executions/]

`N8N_WORKFLOW_AUTODEACTIVATION_MAX_LAST_EXECUTIONS`: workflows auto-unpublished after 3 consecutive crashed executions by default (when `N8N_WORKFLOW_AUTODEACTIVATION_ENABLED=true`). [Source: docs.n8n.io/hosting/configuration/environment-variables/executions/]

#### Long-Running Workflows

`EXECUTIONS_TIMEOUT`: default -1 (no global timeout). `EXECUTIONS_TIMEOUT_MAX`: default 3600 seconds (1 hour max that users can set). This 1-hour ceiling is a hard constraint for browser automation tasks that take longer. [Source: docs.n8n.io/hosting/configuration/environment-variables/executions/]

`N8N_AI_TIMEOUT_MAX`: 3,600,000 ms (1 hour) for AI/LLM nodes.

#### Self-Host Requirements

Queue mode: PostgreSQL + Redis + main n8n instance + ≥1 worker. Docker Compose.
Multi-main (HA) requires Enterprise Edition. [Source: docs.n8n.io/hosting/scaling/queue-mode/]

Worker concurrency default: 10 simultaneous executions per worker. n8n recommends concurrency ≥ 5 to avoid database connection pool exhaustion with many workers. [Source: docs.n8n.io/hosting/scaling/queue-mode/]

#### Browser Automation

n8n has no built-in browser automation support. Browser actions can be invoked via the Execute Command node or custom code nodes, but there is no first-class Playwright/Puppeteer integration equivalent to Windmill's.

#### Observability

Worker processes expose `/healthz`, `/healthz/readiness`, and `/metrics` endpoints. Worker management UI (view running workers + performance metrics) is Enterprise-only. [Source: docs.n8n.io/hosting/scaling/queue-mode/]

#### Licensing

"Fair-code" (Sustainable Use License + n8n Enterprise License). Not OSI-approved open source. Core workflow execution is available, but certain scaling and enterprise features require a commercial license.

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
| **Minimum infra** | Temporal server + PostgreSQL + Elasticsearch (optional) | PostgreSQL + server + worker | PostgreSQL + Redis + main + worker |
| **Observability** | Web UI, Prometheus, archival, multi-cluster DR | Built-in UI, Prometheus, S3 logs, alerts (EE) | /metrics, /healthz; worker UI (EE) |
| **Language support** | Go, Java, TypeScript, Python, Rust, .NET, PHP | Python, TypeScript/JS (Bun/Deno), Go, Bash, Rust, PHP, SQL, and 10+ more | JavaScript/TypeScript (Node.js) |
| **License** | MIT | AGPLv3 / EE | Fair-code / EE |
| **Ops burden** | Highest | Lowest | Medium |
| **Community** | Large (used at Uber, Netflix, etc.) | Growing (SOC 2 Type II, VC-backed) | Large (low-code workflow platform) |

**Verdict for browser automation + durable sync layer:**
- Long-running, resumable browser sessions → **Temporal** (event history survives crashes; each browser action as Activity with retry)
- Simpler batch automation with acceptable at-most-once semantics → **Windmill** (best browser infra, lowest ops)
- Visual workflow building with moderate durability needs → **n8n** (but 1h ceiling and fair-code licensing are constraints)

---

## Section 2: CRDT Layer

### 2.1 Yjs

#### CRDT Algorithm: YATA

Yjs uses YATA (Yet Another Transformation Approach), a list CRDT optimized for collaborative text editing. Operations are represented as items with left/right origin IDs. Concurrent inserts at the same position are deterministically ordered by client ID. The core types are Y.Map, Y.Array, Y.Text, Y.XmlElement, Y.XmlText.

#### Sync & Providers

Yjs uses a provider model. A provider connects a Y.Doc to a network or storage backend. Providers are **meshable** — multiple can be active simultaneously (e.g., y-websocket for real-time sync + y-indexeddb for local persistence + y-webrtc for direct peer sync). [Source: docs.yjs.dev/getting-started/a-collaborative-editor]

Standard providers:
- **y-websocket**: Client/server WebSocket sync (y-websocket server + y-websocket client)
- **y-webrtc**: WebRTC peer-to-peer sync (signaling server required for initial connection)
- **y-indexeddb**: Browser-local IndexedDB persistence [Source: docs.yjs.dev/getting-started/allowing-offline-editing]

Commercial providers built on Yjs: Hocuspocus (TipTap), Y-Sweet (Jamsocket), Liveblocks, SuperViz.

#### Awareness & Presence

The y-protocols package implements an Awareness CRDT: a schemaless JSON object with an incrementing clock per client. Remote awareness states expire after 30 seconds without updates (clients marked offline). Clients must broadcast their awareness state periodically to stay "online". [Source: docs.yjs.dev/api/about-awareness]

#### Offline Support

`y-indexeddb` persists document state to IndexedDB. On reconnect, only missing updates are synced to the server. This enables offline-first browser applications. [Source: docs.yjs.dev/getting-started/allowing-offline-editing]

#### Maturity

Yjs is production-stable with widespread adoption across collaborative editors (TipTap, Quill, CodeMirror, ProseMirror, Monaco integrations). The core API is stable (some docs pages state "last updated 4 years ago" — this reflects stability, not abandonment).

---

### 2.2 Automerge (automerge-repo)

#### CRDT Algorithm

Automerge uses a JSON CRDT. Lists use RGA (Replicated Growable Array). Maps use last-write-wins with conflict tracking (all concurrent values preserved and accessible). The Rust core (`automerge-rs`) compiles to WebAssembly for browser use, with TypeScript bindings. [Source: automerge.org/docs/]

Automerge is explicitly designed for local-first software. It is network-agnostic — the sync protocol is transport-independent. [Source: automerge.org/docs/]

#### automerge-repo

`automerge-repo` is a wrapper providing multi-document management, pluggable networking, and storage. It is a monorepo with:

**Storage adapters:**
- `automerge-repo-storage-indexeddb`: browser IndexedDB persistence
- `automerge-repo-storage-nodefs`: filesystem (Node.js)

**Network adapters:**
- `automerge-repo-network-websocket`: client/server WebSocket sync
- `automerge-repo-network-messagechannel`: cross-tab sync via MessageChannel API
- `automerge-repo-network-broadcastchannel`: simple tab-to-tab (described as "likely only useful for experimentation")

[Source: github.com/automerge/automerge-repo README]

No native libp2p, Iroh, or WebRTC network adapter exists in the official automerge-repo packages.

#### Key Properties vs Yjs

- Automerge tracks full operation history (like Git); can diff, branch, merge
- Automerge's immutable state is compatible with React/Redux patterns
- Yjs has a richer provider ecosystem and wider editor adoption
- Automerge's Rust/WASM core may have higher bundle size overhead than Yjs (Yjs is pure JavaScript)
- Automerge preserves all concurrent values as conflicts (explicit conflict representation); Yjs resolves conflicts automatically at the type level

#### Maturity

automerge-repo is actively developed but at an earlier maturity stage than Yjs's ecosystem. The package version listed is `v2.6.0-alpha.2` in one fetch (automerge-repo), suggesting pre-stable status for the higher-level repo layer.

---

### 2.3 Yjs vs Automerge Comparison

| Dimension | Yjs | Automerge |
|---|---|---|
| **CRDT algorithm** | YATA (list/text focused) | JSON CRDT (RGA for lists, LWW+conflict tracking for maps) |
| **Core language** | Pure JavaScript | Rust compiled to WASM |
| **Browser bundle** | Small (pure JS) | Larger (WASM runtime overhead) |
| **Provider ecosystem** | Rich: WebSocket, WebRTC, IndexedDB, commercial (Hocuspocus, Y-Sweet, Liveblocks) | Narrower: WebSocket, MessageChannel, BroadcastChannel |
| **Offline-first** | y-indexeddb (stable) | automerge-repo-storage-indexeddb |
| **Operation history** | Updates are binary diffs; no branching | Full operation log; supports branching/diffing |
| **Conflict representation** | Automatically resolved at type level | Conflicts preserved and queryable |
| **Maturity** | Production-stable, widespread adoption | Active development, alpha in some layers |
| **Use case fit** | Real-time collaborative editing, cursor sync, large teams | Versioned collaborative data, offline sync, audit trail needs |

**Recommendation for browser automation state storage:**

Yjs is the stronger near-term choice due to ecosystem maturity, simpler bundle, and the y-indexeddb + y-websocket combination being production-proven for browser-native sync. Automerge is better suited if operation history/branching is a requirement, or if a strongly-typed JSON document model is preferred over Yjs's shared-type model.

---

## Section 3: Sync Transport Layer

### 3.1 Iroh

#### Architecture

Iroh is a QUIC-based P2P transport library. Core primitives:

- **Endpoint**: An Ed25519 keypair identity. Establishes QUIC connections to other endpoints. Endpoints are identified by `EndpointID` (public key). [Source: iroh.computer/docs/concepts/endpoint]
- **Relay**: Stateless servers that facilitate NAT traversal and serve as encrypted traffic fallback. ~90% of networking conditions allow a direct P2P connection after initial relay coordination. Relay traffic is E2E encrypted — relays cannot read it. [Source: iroh.computer/docs/concepts/relays]
- **iroh-blobs**: Content-addressed blob protocol using BLAKE3 tree hashing. Supports incremental verification and range requests. [Source: iroh.computer/docs/protocols/blobs]
- **iroh-gossip**: HyParView/PlumTree epidemic broadcast trees for topic-based gossip. For CRDT update propagation this is the relevant protocol. [Source: iroh.computer/docs/gossip]

#### Maturity

As of 2026, Iroh is at **v1.0.0-rc.1** — near 1.0, but still with breaking API changes in each release (multiple `[breaking]` changes in v0.96, v0.97, v0.98, v1.0.0-rc releases). [Source: github.com/n0-computer/iroh/releases]

Breaking changes include: renamed modules (`discovery` → `address_lookup`), removed types, changed connection API. API stability not guaranteed until v1.0 stable.

#### Browser / JS Support

**Iroh does not have a native browser WASM client.**

`iroh-js` exists as a GitHub repository but its README explicitly states: "This is a very much work-in-progress version of a javascript client for iroh... Currently the only supported RPC backing is iroh.network (documentation here)." [Source: github.com/n0-computer/iroh-js README]

The iroh-js package is an HTTP RPC client against the managed iroh.network service — it is not a P2P WASM library that can run in a browser. For browser-to-browser Iroh connections, no supported path exists today.

#### Self-Hosting

Relay server can be self-hosted via `iroh-relay` binary (open source). Public relays are provided by n0.computer (free for dev/test, no uptime guarantees). Dedicated relays available via Iroh Services (managed). [Source: iroh.computer/docs/concepts/relays]

#### Fit for Browser + Desktop Sync

**Not suitable for browser-native CRDT sync today.** Iroh is excellent for native (Rust) applications but requires the RPC proxy approach for browser peers, which reintroduces centralization. Monitor for WASM Endpoint support post-v1.0.

---

### 3.2 libp2p (js-libp2p)

#### Browser Support

js-libp2p has genuine browser-native P2P support via multiple transports:

- `@libp2p/webrtc`: WebRTC browser-to-browser transport [Source: github.com/libp2p/js-libp2p README]
- `@libp2p/websockets`: WebSocket transport (browser-compatible)
- `@libp2p/webtransport`: WebTransport transport (browser-compatible, newer)
- `@libp2p/gossipsub` and `@libp2p/floodsub`: pub/sub protocols that work in browsers

#### Production Usage

js-libp2p is used in production in:
- Ethereum Lodestar client
- Helia (IPFS in JavaScript)
- OrbitDB (CRDT database over libp2p)
- Peerbit (CRDT-based P2P data storage)
- HOPR Network

The README states: "This project has been used in production for years in Ethereum, IPFS, and more." [Source: github.com/libp2p/js-libp2p README]

#### NAT Traversal

- Circuit relay protocol for NAT traversal (relay node forwards traffic)
- WebRTC transport enables direct browser-to-browser connections with STUN/TURN-like hole punching
- mDNS for local network discovery
- Kademlia DHT for peer discovery

#### CRDT Integration

OrbitDB demonstrates the pattern: CRDT-backed documents (CRDTs encoded in Merkle DAGs) synced over libp2p gossipsub. The same pattern applies to Yjs or Automerge updates propagated via gossipsub topics.

No official Yjs provider for js-libp2p exists in the main Yjs ecosystem, but the connection adapter interface is straightforward to implement.

#### Operational Burden

Self-hosted bootstrap/relay nodes required. The circuit relay server must be reachable for NAT traversal. Operational complexity is higher than iroh-relay (which is stateless), because libp2p relay nodes have state about connected peers.

---

### 3.3 Syncthing

#### Protocol

Syncthing implements the Block Exchange Protocol (BEP) over TLS 1.3. It synchronizes files by comparing block hashes and transferring missing blocks. Files are segmented into 128 KiB–16 MiB blocks. Version vectors track per-device sequence numbers for delta sync efficiency. [Source: docs.syncthing.net/specs/bep-v1.html]

#### Why Syncthing Does Not Fit CRDT Sync

Syncthing operates at the **file-block level**, not the **document-operation level**. A CRDT library (Yjs, Automerge) works by exchanging encoded operation diffs or state vectors. Syncthing cannot propagate these — it would treat a CRDT document as an opaque binary blob and sync the entire file on any change, with no merge semantics.

Concurrent writes to the same file from two Syncthing nodes produce a conflict (one version is kept as the primary; the other becomes a `filename.sync-conflict-...` copy). There is no operation-level merge. [Source: docs.syncthing.net/specs/bep-v1.html, conflict mode discussion]

Additionally, Syncthing has no browser client and no JavaScript API.

**Syncthing is not appropriate for CRDT document sync.** It is excellent for file-level synchronization between desktop/server nodes (e.g., syncing Playwright screenshot archives or static assets), but cannot serve as a CRDT transport.

---

### 3.4 Transport Comparison for Browser + Desktop CRDT Sync

| Dimension | Iroh | js-libp2p | Syncthing |
|---|---|---|---|
| **Browser-native (no proxy)** | No (iroh-js is WIP RPC client) | Yes (WebRTC, WebSockets, WebTransport) | No |
| **NAT traversal** | ~90% success via relays + hole punching | Circuit relay + WebRTC hole punching | Yes (via global discovery + relay) |
| **CRDT integration** | None (blobs + gossip; requires custom protocol) | Gossipsub for update propagation; OrbitDB precedent | Incompatible (block-level, not operation-level) |
| **Self-host ops** | Stateless relay binary (simple) | Stateful relay/bootstrap nodes (moderate) | Discovery + relay servers |
| **API stability** | Pre-1.0 (breaking changes in each release) | Semver, stable, multi-year production use | Stable protocol spec |
| **Desktop fit** | Excellent (Rust, all platforms) | Good (Node.js / Bun) | Excellent (Go, all platforms) |
| **Primary use case** | Native app P2P, content-addressed storage | Browser P2P networking stack | File sync between trusted devices |

**Recommendation:** For a browser + desktop sync layer using Yjs or Automerge:

1. **js-libp2p (WebRTC transport + gossipsub)** — best production-grade browser P2P option today. Implements the full P2P stack including hole punching. Proven with CRDT workloads (OrbitDB, Peerbit).
2. **Iroh** — strong candidate for future native (non-browser) peers, post-v1.0 stable release, if/when WASM Endpoint support lands.
3. **Syncthing** — wrong abstraction for CRDT; exclude from consideration.

For the simplest production deployment: **Yjs + y-websocket** (server relay for sync, y-indexeddb for local persistence) is the lowest-risk path. The WebSocket server acts as a thin relay — all merge logic stays in the client. This avoids the NAT traversal complexity of pure P2P while maintaining local-first properties (clients own their data, server is just a sync relay and does not enforce a schema).

---

## Section 4: Fit for Browser Automation + Sync Layer (Aether Context)

### 4.1 Workflow Engine Recommendation

For Aether's browser automation agent use case (long-running, potentially hours-long browser sessions that must survive crashes):

**Temporal is the only engine with durable replay guarantees.**

Each browser action (page navigation, click, DOM extraction, screenshot) maps to an Activity. If the worker process running Playwright crashes mid-session:
- Completed activity results are in the Event History
- The workflow resumes from the last recorded event
- No work is repeated

Windmill's flow-step persistence is a practical second option if the Temporal operational burden is unacceptable. Each flow step result is stored; a retry hook can resume from the last completed step. This is not automatic replay but provides better resilience than a single-step job.

n8n's 1-hour maximum execution limit and lack of replay semantics make it poorly suited for long-running browser automation.

### 4.2 CRDT + Transport Recommendation for Browser State Sync

For syncing browser automation state (tab state, session contexts, agent scratchpads) across devices:

**Yjs + y-indexeddb (local) + y-websocket (relay sync)** is the lowest-risk production path:
- y-indexeddb provides offline-first local persistence in the browser extension
- y-websocket provides real-time sync via a self-hosted relay (stateless, simple ops)
- Yjs providers are meshable — add y-webrtc for direct peer sync as a future enhancement

For a fully P2P path (no relay server dependency), **js-libp2p with WebRTC transport + gossipsub** provides the browser-native foundation for propagating Yjs or Automerge updates, with production precedent from OrbitDB and Peerbit.

**Do not use Syncthing** for document-level state sync.

**Do not rely on Iroh** for browser peers until a native WASM Endpoint is released post-v1.0.

---

## Open Questions

1. **Windmill flow resume granularity**: Does step-level persistence survive worker crash (not just explicit error handler triggers), or does a worker crash still mark the entire flow as failed requiring manual re-run?
2. **Temporal history bloat in long browser sessions**: A single Playwright automation task could generate thousands of Activity completions. What is the practical event history growth rate for CDP-level automation? When does Continue-As-New need to be triggered?
3. **iroh-js browser WASM timeline**: Is n0-computer working toward a native WASM Endpoint for iroh? No official roadmap page was accessible.
4. **js-libp2p WebTransport maturity**: WebTransport is newer than WebRTC in the browser transport stack. Production readiness parity with WebRTC is unconfirmed.
5. **Automerge-repo stability**: The `v2.6.0-alpha.2` version string suggests ongoing API changes. What is the target for a stable automerge-repo release?
6. **n8n licensing trajectory**: The fair-code Sustainable Use License restricts commercial embedding. For an AI-native browser product that could be offered commercially, this is a material risk.

---

## Sources

- Windmill Worker Groups: https://www.windmill.dev/docs/core_concepts/worker_groups
- Windmill Architecture: https://www.windmill.dev/docs/misc/architecture
- Windmill High Availability: https://www.windmill.dev/docs/advanced/high_availability
- Windmill Jobs: https://www.windmill.dev/docs/core_concepts/jobs
- Windmill Browser Automation: https://www.windmill.dev/docs/advanced/browser_automation
- Windmill Error Handling: https://www.windmill.dev/docs/core_concepts/error_handling
- Temporal Workflows: https://docs.temporal.io/workflows
- Temporal Self-Hosted Deployment: https://docs.temporal.io/self-hosted-guide/deployment
- Temporal Self-Hosted Defaults: https://docs.temporal.io/self-hosted-guide/defaults
- Temporal Self-Hosted Guide: https://docs.temporal.io/self-hosted-guide
- n8n Queue Mode: https://docs.n8n.io/hosting/scaling/queue-mode/
- n8n Execution Environment Variables: https://docs.n8n.io/hosting/configuration/environment-variables/executions/
- Yjs Connection Provider: https://docs.yjs.dev/ecosystem/connection-provider
- Yjs Collaborative Editor Getting Started: https://docs.yjs.dev/getting-started/a-collaborative-editor
- Yjs Awareness API: https://docs.yjs.dev/api/about-awareness
- Yjs Offline Support: https://docs.yjs.dev/getting-started/allowing-offline-editing
- Automerge Design Principles: https://automerge.org/docs/
- Automerge Hello: https://automerge.org/docs/hello/
- automerge-repo README: https://github.com/automerge/automerge-repo (README.md)
- Iroh Endpoints: https://iroh.computer/docs/concepts/endpoint
- Iroh Relays: https://iroh.computer/docs/concepts/relays
- Iroh Blobs: https://iroh.computer/docs/protocols/blobs
- Iroh Gossip: https://iroh.computer/docs/gossip
- Iroh Releases: https://github.com/n0-computer/iroh/releases
- iroh-js README: https://github.com/n0-computer/iroh-js (README.md)
- js-libp2p README: https://github.com/libp2p/js-libp2p (README.md)
- Syncthing BEP v1: https://docs.syncthing.net/specs/bep-v1.html
- Syncthing Specs Index: https://docs.syncthing.net/specs/
