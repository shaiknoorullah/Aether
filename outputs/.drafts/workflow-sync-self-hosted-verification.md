# Verification Pass: workflow-sync-self-hosted-cited.md

**Date:** 2026-06-10
**Reviewer:** Feynman (self)
**File checked:** outputs/.drafts/workflow-sync-self-hosted-cited.md

---

## URL Verification

All URLs verified by direct fetch during research. Results:

| URL | Status |
|---|---|
| https://www.windmill.dev/docs/advanced/high_availability | ✅ Fetched — confirmed in-flight job loss quote |
| https://www.windmill.dev/docs/core_concepts/worker_groups | ✅ Fetched — confirmed worker atomicity, job queue model, 26M jobs/month |
| https://www.windmill.dev/docs/core_concepts/jobs | ✅ Fetched — confirmed retention policy, job lifecycle |
| https://www.windmill.dev/docs/advanced/browser_automation | ✅ Fetched — confirmed reports worker group, Playwright/Puppeteer examples, --no-sandbox warning |
| https://www.windmill.dev/docs/core_concepts/error_handling | ✅ Fetched — confirmed cascading error handler chain |
| https://docs.temporal.io/workflows | ✅ Fetched — confirmed event history model, replay semantics |
| https://docs.temporal.io/self-hosted-guide/defaults | ✅ Fetched — confirmed 10MB/10,240 warn, 50MB/51,200 terminate limits |
| https://docs.temporal.io/self-hosted-guide/deployment | ✅ Fetched — confirmed Docker Compose, Helm chart compatibility note |
| https://docs.temporal.io/self-hosted-guide | ✅ Fetched — confirmed temporal server start-dev, component list |
| https://docs.n8n.io/hosting/scaling/queue-mode/ | ✅ Fetched — confirmed Redis queue architecture, PostgreSQL requirement, concurrency |
| https://docs.n8n.io/hosting/configuration/environment-variables/executions/ | ✅ Fetched — confirmed EXECUTIONS_TIMEOUT_MAX default 3600, autodeactivation |
| https://docs.yjs.dev/getting-started/a-collaborative-editor | ✅ Fetched — confirmed provider model, meshability |
| https://docs.yjs.dev/getting-started/allowing-offline-editing | ✅ Fetched — confirmed y-indexeddb description |
| https://docs.yjs.dev/api/about-awareness | ✅ Fetched — confirmed 30s timeout, clock-based awareness CRDT |
| https://automerge.org/docs/ | ✅ Fetched — confirmed network-agnostic, WASM portability, JSON CRDT |
| https://github.com/automerge/automerge-repo | ✅ Fetched — confirmed storage/network adapter list, React/Svelte adapters |
| https://iroh.computer/docs/concepts/endpoint | ✅ Fetched — confirmed Ed25519 keypair identity, QUIC connections |
| https://iroh.computer/docs/concepts/relays | ✅ Fetched — confirmed ~90% direct connection, E2E encryption, stateless |
| https://iroh.computer/docs/protocols/blobs | ✅ Fetched — confirmed BLAKE3 tree hashing, incremental verification |
| https://iroh.computer/docs/gossip | ✅ Fetched — confirmed HyParView/PlumTree, topic-based gossip |
| https://github.com/n0-computer/iroh/releases | ✅ Fetched — confirmed v1.0.0-rc.1 as latest, multiple [breaking] changes |
| https://github.com/n0-computer/iroh-js | ✅ Fetched — confirmed "very much work-in-progress" language, HTTP RPC backing |
| https://github.com/libp2p/js-libp2p | ✅ Fetched — confirmed WebRTC/WebSockets/WebTransport transports, production usage |
| https://docs.syncthing.net/specs/bep-v1.html | ✅ Fetched — confirmed block-level protocol, TLS 1.3, version vectors |

---

## Claims Verification

### FATAL Issues
None identified.

### MAJOR Issues

1. **Windmill mid-crash behavior nuance**: The HA docs clearly state in-flight jobs are lost, but the exact behavior for multi-step flows on worker SIGKILL (vs graceful shutdown) is not fully documented. The draft notes this as an open question — acceptable.

2. **Automerge-repo version string**: I observed "v2.6.0-alpha.2" in one fetch but could not independently verify this is the current automerge-repo npm package version (the fetch was from the iroh.computer docs page, not the automerge-repo npm registry). This claim is downgraded to "alpha in some layers" with hedge language — acceptable.

3. **Temporal "years" claim**: The claim "workflows can run for years" comes directly from the Temporal docs: "They can run—and keep running—for years, even if the underlying infrastructure fails." — confirmed.

4. **iroh-js "work-in-progress" claim**: Confirmed verbatim from iroh-js README. The quote is accurate.

### MINOR Issues

1. The n8n fair-code licensing discussion notes the Sustainable Use License but does not cite the license file directly. The claim is accurate (widely documented) but not directly verified via license file fetch. Mark as not directly verified via license text.

2. The Windmill "26 million jobs per month at 100ms/job" claim is sourced from worker_groups doc — confirmed.

3. Yjs provider ecosystem claim ("Hocuspocus, Y-Sweet, Liveblocks, SuperViz") — confirmed from the connection-provider page listing these providers.

4. The js-libp2p gossipsub/floodsub claim for browsers — confirmed from README package table listing `@libp2p/gossipsub` and `@libp2p/floodsub`.

---

## Inference Flags

The following items are inferences, not directly stated in fetched sources:

- **Temporal event count for CDP automation**: No benchmark data on how quickly CDP-level browser automation exhausts 10,240 event limit. This is an open question, correctly marked as such.
- **Windmill flow-step retry is not automatic**: The HA doc says in-flight jobs fail; the claim that flow steps provide "partial mitigation" via retry hooks is an inference from the jobs architecture + error handler docs. Marked as inference in draft.
- **js-libp2p WebTransport maturity relative to WebRTC**: Marked as unconfirmed, correctly flagged as open question.

---

## Checks Performed

- [x] All source URLs fetched and confirmed during research phase
- [x] Key quotes verified against source text
- [x] Critical claims (in-flight job loss, 1-hour n8n ceiling, iroh-js WIP status, YATA/RGA algorithms) traced to primary docs
- [x] Comparison tables cross-checked against individual section findings
- [x] Limitations and uncertainties explicitly stated

**Verdict: PASS WITH NOTES**

Notes:
- automerge-repo version string source is secondary; downgraded to hedge language in draft
- n8n license not verified from license file text
- Several claims are inferences correctly marked as such
