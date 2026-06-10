# Self-Hostable Workflow Engines & Local-First Sync for Aether (2026)

**Department:** Market
**Team:** mkt-automation-sync
**Mandate:** Self-hostable workflow engines + local-first sync 2026 — Windmill/Temporal/n8n; CRDT sync Yjs/Automerge over Iroh/libp2p/Syncthing; durability, ops, fit.
**Date:** 2026-06-10
**Primary source brief:** `outputs/workflow-sync-self-hosted.md` (Feynman deep-research, 24 primary sources — all official docs or official GitHub READMEs; verification PASS WITH NOTES)
**Provenance:** `outputs/workflow-sync-self-hosted.provenance.md`

---

## 1. Executive Summary

Aether needs two distinct infrastructure primitives that this research scopes concretely: (a) a **durable workflow/automation engine** to run long-lived, crash-resilient agent and browser-automation tasks, and (b) a **local-first sync layer** so power users carry workflows, sessions, and state across devices without surrendering data to a vendor. The two are independent decisions with independent winners.

On workflow engines, durability is the differentiator and the three candidates are not equivalent. **Temporal** (MIT) is the only engine offering true durable execution — event-sourced replay means a crashed worker loses *zero* completed activity results and workflows can run for years; the cost is the highest operational complexity (multi-service server, Postgres/Cassandra, optional Elasticsearch, schema migrations) and an event-history ceiling (terminate at 50 MB / 51,200 events) that high-frequency browser automation will hit without Continue-As-New checkpointing. **Windmill** (AGPLv3) is the lowest-ops option — stateless workers over a single Postgres — and is the *only* engine with first-class browser automation (a `reports` worker group ships Chromium, official Playwright/Puppeteer examples), but in-flight jobs are explicitly lost on worker crash (at-most-once per step; manual retry resumes from the last persisted flow step). **n8n** is the weakest fit: no replay, a hard 1-hour default execution ceiling, no native browser automation, and a "fair-code" license that is a material risk for commercial embedding.

On sync, **Yjs** is the lowest-risk CRDT for near-term shipping (mature, rich provider mesh, proven `y-indexeddb` offline + `y-websocket` relay); **Automerge** is the more principled choice when full operation history / queryable conflict inspection is required, but its `automerge-repo` networking/storage layer is still alpha. For transport, **js-libp2p** is the only option with genuine browser-native P2P today (WebRTC/WebSockets/WebTransport + gossipsub, production-proven via OrbitDB/Peerbit/Helia/Lodestar). **Iroh** is excellent for native (Rust) peers but has no browser WASM client — its JS package is an explicitly WIP HTTP-RPC client against a managed cloud, unusable for browser-to-browser. **Syncthing** is the wrong abstraction entirely (file-block sync, no operation-level merge, no browser client) and should only be used for file artifacts (screenshot archives), never document state.

Strategic implication for Aether: this is the technical substrate for two differentiators the whitespace research already flagged — **durable agent workflows** (no browser ships crash-resilient long-running automation) and **vendorless zero-knowledge sync** (no browser offers self-hosted/user-storage sync). The recommended baseline stack is **Temporal (or Windmill for low-ops) + Yjs + y-indexeddb + js-libp2p (WebRTC) / y-websocket relay**, with a Rust-native Iroh path reserved for a future desktop-to-desktop tier once a WASM Endpoint lands.

---

## 2. Key Findings

### Finding 1: Temporal is the only engine with true durable execution (event-sourced replay)
Temporal records a complete ordered Event History per workflow; on crash it re-executes workflow code and replays recorded activity results rather than redoing work. "Temporal Workflows are resilient. They can run—and keep running—for years, even if the underlying infrastructure fails." A crashed worker loses no completed activity results — directly relevant to long browser-automation sessions where each Playwright action is an Activity. License is MIT (no usage restrictions).
- **Source:** https://docs.temporal.io/workflows
- **Confidence:** HIGH (official docs)
- **Aether implication:** Temporal is the substrate for crash-resilient, multi-hour/multi-day agent and automation workflows — a capability no shipping browser has.

### Finding 2: Temporal's event-history limits are a hard ceiling for high-frequency browser automation
Self-hosted defaults: warn at 10 MB / 10,240 events; **terminate workflow at 50 MB / 51,200 events**; per-payload blob errors at 2 MB; max 2,000 concurrent pending activities. CDP-level browser automation (DOM mutations, per-action events) can exhaust the event budget quickly. Continue-As-New is the required mitigation (checkpoint + fresh history), but the correct cadence is undocumented and must be tuned.
- **Source:** https://docs.temporal.io/self-hosted-guide/defaults
- **Confidence:** HIGH (official defaults page)
- **Aether implication:** Any Temporal-backed automation must wrap browser sessions with Continue-As-New checkpointing; treat event-budget as a design constraint, not an edge case.

### Finding 3: Windmill is the lowest-ops engine and the only one with first-class browser automation
All state lives in PostgreSQL; servers and workers are stateless. A pre-configured `reports` worker group installs Chromium via init scripts and the `chromium` tag routes browser jobs there; official Playwright (Bun) and Puppeteer examples ship in the docs. Minimum infra is Postgres + 1 server + 1 worker (Docker Compose), no special extensions. Caveat: Chromium runs with `--no-sandbox` in containers — explicitly flagged as a security risk.
- **Source:** https://www.windmill.dev/docs/advanced/browser_automation , https://www.windmill.dev/docs/advanced/high_availability
- **Confidence:** HIGH (official docs)
- **Aether implication:** Windmill is the fastest path to a self-hostable browser-automation backend with the least operational burden — but the `--no-sandbox` posture conflicts with Aether's secure-by-design principle and must be isolated.

### Finding 4: Windmill loses in-flight jobs on crash; durability is at-most-once per step
Windmill HA docs state explicitly: "In-flight jobs (mid-execution when the primary went down) will not complete. They will appear as failed or timed-out. You can re-run them after failover." Queued (not-yet-started) jobs always survive. The flow-as-steps model partially mitigates: each step is a separate Postgres-persisted job, so retry can resume from the last completed step — but this is manual/error-handler-triggered, not automatic replay. No engine-enforced timeout (unlike n8n).
- **Source:** https://www.windmill.dev/docs/advanced/high_availability , https://www.windmill.dev/docs/core_concepts/jobs
- **Confidence:** HIGH (direct quote from HA docs); MEDIUM on abrupt-SIGKILL flow-step behavior (open question, undocumented)
- **Aether implication:** If Aether needs guaranteed resumption of a half-finished agent task, Windmill alone is insufficient; pair with idempotent steps + explicit checkpoints, or choose Temporal.

### Finding 5: n8n has a 1-hour execution ceiling, no replay, and fair-code licensing risk
`EXECUTIONS_TIMEOUT_MAX` defaults to **3,600 seconds (1 hour)** — the maximum any single workflow can be set to. Queue mode requires Postgres 13+ and Redis, forbids filesystem binary storage (requires S3), and loses in-flight executions on abrupt crash (`N8N_GRACEFUL_SHUTDOWN_TIMEOUT` only covers graceful shutdown). No first-class Playwright/Puppeteer integration. License is "fair-code" (Sustainable Use License) — not OSI open source, restricting commercial embedding without an enterprise license.
- **Source:** https://docs.n8n.io/hosting/configuration/environment-variables/executions/ , https://docs.n8n.io/hosting/scaling/queue-mode/
- **Confidence:** HIGH (official docs); license interpretation MEDIUM (license text not read directly, widely documented)
- **Aether implication:** n8n is not recommended as Aether's automation substrate — the 1-hour ceiling and licensing alone disqualify it for embedded long-running agent work.

### Finding 6: Yjs is the lowest-risk CRDT — mature, meshable providers, proven offline-first
Yjs (YATA list CRDT; shared types Y.Map/Y.Array/Y.Text/Y.Xml*) has a rich, *meshable* provider ecosystem: `y-websocket` (client/server), `y-webrtc` (P2P), `y-indexeddb` (browser-local persistence) can all run simultaneously on one Y.Doc. On reconnect only missing updates sync. The `y-protocols` Awareness CRDT handles presence (states expire after 30s without updates). Commercial providers (Hocuspocus/TipTap, Y-Sweet, Liveblocks) prove production scale.
- **Source:** https://docs.yjs.dev/getting-started/a-collaborative-editor , https://docs.yjs.dev/getting-started/allowing-offline-editing
- **Confidence:** HIGH (official docs)
- **Aether implication:** Yjs + y-indexeddb + y-websocket is the lowest-risk sync foundation for cross-device workflows/sessions; provider mesh lets Aether add P2P incrementally without re-architecting.

### Finding 7: Automerge offers full op-history & queryable conflicts but its repo layer is alpha
Automerge uses a JSON CRDT (RGA lists; LWW maps with all concurrent values preserved and queryable), Rust core compiled to WASM, designed explicitly for local-first software and transport-agnostic. `automerge-repo` adds multi-doc management with IndexedDB/nodefs storage and WebSocket/MessageChannel/BroadcastChannel network adapters — but **no official libp2p, Iroh, or WebRTC adapter**, and some packages sit at `v2.6.0-alpha.2`, indicating ongoing API change.
- **Source:** https://automerge.org/docs/ , https://github.com/automerge/automerge-repo
- **Confidence:** HIGH for core design; MEDIUM for repo-layer version (sourced secondary, hedged in brief)
- **Aether implication:** Choose Automerge when versioned/auditable state with queryable conflicts matters (e.g., agent decision logs, undo history); accept earlier ecosystem maturity and a custom P2P adapter.

### Finding 8: js-libp2p is the only browser-native P2P transport with production CRDT precedent
js-libp2p ships browser-native transports: `@libp2p/webrtc` (browser-to-browser), `@libp2p/websockets`, `@libp2p/webtransport`, plus `@libp2p/gossipsub` for CRDT update propagation. "Used in production for years in Ethereum, IPFS, and more" — confirmed in Lodestar, Helia, OrbitDB, Peerbit, HOPR. OrbitDB (CRDT over libp2p gossipsub) is a direct precedent for Yjs/Automerge-over-libp2p. Cost: self-hosted bootstrap/relay nodes are stateful (higher ops than Iroh's stateless relays); no official Yjs provider (interface is straightforward to implement).
- **Source:** https://github.com/libp2p/js-libp2p
- **Confidence:** HIGH (official README + named production deployments)
- **Aether implication:** js-libp2p is the realistic browser P2P path for vendorless sync; budget for self-hosted relay/bootstrap ops and a custom Yjs gossipsub provider.

### Finding 9: Iroh has no browser WASM client — native-only today
Iroh is a strong QUIC-based P2P stack (Ed25519 endpoints, ~90% direct-connect via E2E-encrypted stateless relays, iroh-blobs content-addressing, iroh-gossip for CRDT propagation) but it is Rust/native-only for browsers. The `iroh-js` README: "This is a very much work-in-progress version of a javascript client for iroh... the only supported RPC backing is iroh.network" — an HTTP-RPC client against a managed cloud, not a browser WASM P2P library. Latest is v1.0.0-rc.1 with `[breaking]` changes still landing every release.
- **Source:** https://github.com/n0-computer/iroh-js , https://github.com/n0-computer/iroh/releases
- **Confidence:** HIGH (official READMEs/releases)
- **Aether implication:** Reserve Iroh for a future *desktop/native* peer tier (Rust shell), not browser peers; monitor for a native WASM Endpoint post-v1.0 before committing.

### Finding 10: Syncthing is the wrong abstraction level for CRDT document sync
Syncthing's Block Exchange Protocol (BEP over TLS 1.3) syncs files by comparing block hashes (128 KiB–16 MiB blocks); concurrent writes produce a `.sync-conflict-*` copy with no operation-level merge. It would treat a CRDT doc as an opaque blob and resync the whole file on any change. No browser client, no JS API.
- **Source:** https://docs.syncthing.net/specs/bep-v1.html
- **Confidence:** HIGH (official BEP spec)
- **Aether implication:** Use Syncthing only for file-level artifacts (Playwright screenshot archives, build outputs) between trusted desktop nodes — never for collaborative/document state.

---

## 3. Implied Aether Feature Candidates

| # | Feature | Category | Why it follows from the research |
|---|---------|----------|----------------------------------|
| F1 | **Durable agent/automation workflow runtime (event-sourced, crash-resilient)** | AI & Agents | Temporal proves long-running workflows can survive worker/infra failure with zero lost work (F1); embed this so Aether's agent and automation tasks resume after crashes/reboots — a capability no browser ships. |
| F2 | **Self-hostable browser-automation backend (Playwright/Puppeteer as workflow steps)** | Developer Tools | Windmill ships first-class browser automation with the lowest ops (F3); expose a self-hostable engine where automation steps are durable, retryable jobs power users own. |
| F3 | **Local-first sync engine for workflows/sessions/state (offline-first, mesh providers)** | Sync & Portability | Yjs + y-indexeddb + meshable providers give proven offline-first sync (F6); make tabs, workspaces, and automation state portable across devices, working offline and reconciling on reconnect. |
| F4 | **Vendorless / zero-knowledge P2P sync (user-owned transport, no vendor)** | Privacy & Security | js-libp2p delivers browser-native P2P with production CRDT precedent (F8); pair with client-side encryption so users sync device-to-device with no vendor involvement — the whitespace "vendorless zero-knowledge sync" gap. |
| F5 | **Versioned / auditable agent state with queryable conflict history** | AI & Agents | Automerge preserves full op-history and queryable concurrent values (F7); store agent decision logs / undo history as a CRDT so every action is inspectable and reversible. |
| F6 | **Self-hosted sync relay (one-click, stateless) for NAT-tricky networks** | Sync & Portability | y-websocket relays are stateless and js-libp2p needs bootstrap/relay nodes (F6, F8); ship a one-click self-hostable relay so power users get reliable sync behind NAT without a vendor. |
| F7 | **Per-task durability policy (replay vs. at-most-once) for automation steps** | Productivity | Temporal (replay) vs. Windmill (at-most-once) trade durability for ops cost (F1, F4); let users pick per-workflow whether a task must resume exactly or may safely re-run, matching cost to criticality. |
| F8 | **Native desktop P2P sync tier over QUIC (Iroh) for desktop-to-desktop** | Sync & Portability | Iroh is excellent for Rust/native peers though not browsers (F9); if Aether ships a native shell, add a high-throughput desktop-to-desktop sync/file tier over Iroh, distinct from the browser P2P path. |
| F9 | **File-artifact sync for automation outputs (screenshots, exports)** | Sync & Portability | Syncthing fits file-block sync between trusted devices (F10); sync Playwright screenshot archives / exported reports at the file level, separate from document-state CRDT sync. |

---

## 4. Competitive / Whitespace Notes

**Cross-reference:** sibling whitespace research `outputs/.drafts/browser-feature-whitespace-cited.md` independently flags two directly relevant gaps.

- **§3.6 Zero-Knowledge Vendorless Sync (gap):** "Brave Sync uses E2E encryption with a sync chain. Firefox Sync requires a Mozilla account. No browser offers vendorless zero-knowledge sync — e.g., sync via user-provided storage (S3 bucket, WebDAV) with client-side encryption and no vendor involvement." This research supplies the *transport* answer (js-libp2p P2P or self-hosted y-websocket relay) and the *merge* answer (Yjs/Automerge CRDTs) that make vendorless sync actually work — including conflict resolution, which the whitespace note correctly calls out as the hard part. Maps to **F3/F4/F6**.
  - Source: whitespace §3.6; transport https://github.com/libp2p/js-libp2p ; CRDT https://docs.yjs.dev/getting-started/allowing-offline-editing
- **Durable automation has no incumbent in-browser.** No shipping browser (Brave, Arc/Dia, Chrome, Opera, Vivaldi) embeds a crash-resilient long-running workflow engine. Existing browser "automation" is either ephemeral extension scripts or external tools (Playwright/Selenium/n8n run *outside* the browser). Temporal-grade durability *inside* a power-user browser is open whitespace. Maps to **F1/F2/F7**.
  - Source: brief §4.1 (https://www.windmill.dev/docs/advanced/browser_automation , https://docs.temporal.io/workflows)

**Competitive posture of the building blocks themselves:**
- **Temporal (MIT)** — clean license for embedding; complexity is the moat *and* the tax.
- **Windmill (AGPLv3 + EE)** — AGPL is acceptable for a self-hosted/internal engine but viral if linked into a distributed client; autoscaling/multi-main/queue-metrics are Enterprise-gated.
- **n8n (fair-code)** — licensing alone makes it unsuitable for commercial embedding; useful only as an optional user-supplied external integration.
- **Yjs vs Automerge** — Yjs wins on maturity/ecosystem now; Automerge wins on history/auditability later. They are not mutually exclusive (different doc types can use different CRDTs).
- **js-libp2p vs Iroh** — libp2p owns the browser today; Iroh owns native desktop and may own the browser later. A two-tier transport strategy (libp2p in-browser, Iroh native) hedges both.

**Whitespace Aether can own:**
1. **Crash-resilient agent/automation workflows in-browser** — durable execution is unheard of inside a browser product (F1/F2/F7).
2. **Vendorless, zero-knowledge, conflict-resolving sync** — combining CRDT merge + user-owned P2P/relay transport answers the exact gap whitespace §3.6 names (F3/F4/F6).
3. **User-selectable durability semantics** — exposing replay-vs-at-most-once as a per-workflow choice is a power-user-first framing no competitor offers (F7).

---

## 5. Risks

| Risk | Severity | Detail & mitigation |
|------|----------|---------------------|
| **Temporal operational complexity** | HIGH | Multi-service server + Postgres/Cassandra + optional Elasticsearch + schema migrations; Helm chart ≥0.73.1 required for Server 1.30+ (silent failure otherwise). Source: brief §1.2 (https://docs.temporal.io/self-hosted-guide/deployment). Mitigation: ship `temporal server start-dev` (single SQLite binary) for local/embedded mode; reserve full cluster for power users / self-host, or offer Windmill as the low-ops default (F7). |
| **Windmill `--no-sandbox` Chromium** | HIGH | Browser automation in containers runs Chromium with `--no-sandbox`, explicitly flagged as a security risk — conflicts with Aether's secure-by-design mandate. Source: https://www.windmill.dev/docs/advanced/browser_automation . Mitigation: run automation workers in a hardened/isolated VM or microVM, never on the user's main profile; treat as an isolated capability. |
| **Windmill in-flight job loss** | HIGH | Mid-execution jobs are lost on crash; resumption is manual, not automatic replay. Source: https://www.windmill.dev/docs/advanced/high_availability . Mitigation: design idempotent steps + explicit checkpoints, or use Temporal for tasks requiring guaranteed resumption (F7). |
| **Temporal event-history exhaustion** | MEDIUM-HIGH | 50 MB / 51,200-event terminate ceiling; high-frequency CDP automation hits it fast; correct Continue-As-New cadence undocumented. Source: https://docs.temporal.io/self-hosted-guide/defaults . Mitigation: wrap browser sessions in Continue-As-New checkpoints; benchmark event-growth rate in v2 testing (open question). |
| **Browser P2P needs self-hosted relay infra** | MEDIUM | js-libp2p relays/bootstrap nodes are stateful; NAT traversal isn't free; no official Yjs provider (custom gossipsub provider needed). Source: https://github.com/libp2p/js-libp2p . Mitigation: ship a one-click self-hostable relay (F6); fall back to a stateless y-websocket relay for users who won't run P2P infra. |
| **Iroh browser path does not exist** | MEDIUM | No native WASM Endpoint; iroh-js is WIP HTTP-RPC against a managed cloud; pre-1.0 with breaking changes every release. Source: https://github.com/n0-computer/iroh-js , https://github.com/n0-computer/iroh/releases . Mitigation: do not plan browser sync on Iroh; confine it to a future native desktop tier (F8); monitor releases for a WASM Endpoint. |
| **Automerge-repo API instability** | MEDIUM | `v2.6.0-alpha.2` networking/storage layer still changing; no official P2P adapter. Source: https://github.com/automerge/automerge-repo . Mitigation: default to Yjs for shipping; adopt Automerge only where op-history is required and accept a custom adapter (F5). |
| **n8n fair-code licensing** | MEDIUM | Sustainable Use License restricts commercial embedding without enterprise license. Source: brief §1.3 (https://docs.n8n.io/hosting/scaling/queue-mode/). Mitigation: exclude n8n from the embedded substrate; support it only as an optional user-supplied external integration. |
| **AGPLv3 (Windmill) viral-linking risk** | MEDIUM | AGPL obligations if Windmill code is linked into a distributed Aether client. Source: brief §1.1. Mitigation: keep Windmill as a separate self-hosted service reached over a network API (no static/linked embedding), or choose MIT-licensed Temporal for in-product code paths. |
| **CRDT state growth / GC** | LOW-MED | Long-lived Yjs/Automerge docs accumulate operation history; unbounded growth degrades load/sync. Source: inferred from CRDT op-log model (brief §2). Mitigation: periodic snapshotting/compaction; cap per-doc history; evaluate in v2 perf testing. |
| **Source coverage is single-round / docs-only** | LOW | Brief is 1 round, 24 sources, all vendor official docs/READMEs — no independent benchmarks; several architectural points are explicit inferences; subagent execution failed (lead-only). Source: provenance §9, §15, §21. Mitigation: validate durability/perf claims with a hands-on spike before committing the stack. |

---

## Sources

All findings trace to the primary research brief `outputs/workflow-sync-self-hosted.md` and its 24 primary sources. Key URLs:

- Windmill High Availability: https://www.windmill.dev/docs/advanced/high_availability
- Windmill Worker Groups: https://www.windmill.dev/docs/core_concepts/worker_groups
- Windmill Jobs: https://www.windmill.dev/docs/core_concepts/jobs
- Windmill Browser Automation: https://www.windmill.dev/docs/advanced/browser_automation
- Windmill Error Handling: https://www.windmill.dev/docs/core_concepts/error_handling
- Temporal Workflows: https://docs.temporal.io/workflows
- Temporal Self-Hosted Defaults: https://docs.temporal.io/self-hosted-guide/defaults
- Temporal Self-Hosted Deployment: https://docs.temporal.io/self-hosted-guide/deployment
- Temporal Self-Hosted Guide: https://docs.temporal.io/self-hosted-guide
- n8n Queue Mode: https://docs.n8n.io/hosting/scaling/queue-mode/
- n8n Execution Env Vars: https://docs.n8n.io/hosting/configuration/environment-variables/executions/
- Yjs Collaborative Editor: https://docs.yjs.dev/getting-started/a-collaborative-editor
- Yjs Offline Support: https://docs.yjs.dev/getting-started/allowing-offline-editing
- Yjs Awareness API: https://docs.yjs.dev/api/about-awareness
- Automerge Docs: https://automerge.org/docs/
- automerge-repo README: https://github.com/automerge/automerge-repo
- Iroh Endpoints: https://iroh.computer/docs/concepts/endpoint
- Iroh Relays: https://iroh.computer/docs/concepts/relays
- Iroh Releases: https://github.com/n0-computer/iroh/releases
- iroh-js README: https://github.com/n0-computer/iroh-js
- js-libp2p README: https://github.com/libp2p/js-libp2p
- Syncthing BEP v1: https://docs.syncthing.net/specs/bep-v1.html
- Sibling whitespace research: `outputs/.drafts/browser-feature-whitespace-cited.md`
