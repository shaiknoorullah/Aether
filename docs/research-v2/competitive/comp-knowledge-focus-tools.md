# Knowledge-Capture & Focus Tools — Department Report

**Team:** `comp-knowledge-focus-tools` · Department: Competitive
**Mandate:** Knowledge-capture + focus tools 2026 — Obsidian, Logseq, Heptabase, Anytype, are.na, ActivityWatch, Cold Turkey, Freedom, RescueTime. Capture/graph models, focus-enforcement mechanisms, integration surfaces.
**Source brief:** `outputs/knowledge-focus-tools-comparison.md` (Feynman pipeline, 2026-06-10; all claims traced to primary sources)
**Compiled:** 2026-06-10

---

## 1. Executive Summary

The knowledge-capture and focus-tooling landscape splits along a single hard axis: **the tools with the deepest, most borrowable integration surfaces are local-first or open-source (Obsidian, Logseq, Anytype, ActivityWatch), while the tools with the most frictionless UX are cloud-dependent (Heptabase, Freedom, RescueTime).** No single tool spans both, and power users routinely run several in parallel to compensate.

For Aether, three categories of pattern are directly borrowable into the browser layer:

1. **Capture / graph models.** Four converging primitives emerge — Obsidian/Logseq/Anytype's bidirectional-link graph, Heptabase's spatial canvas, are.na's many-to-many block-to-channel connections, and Anytype's typed-object graph. are.na's many-to-many model (one saved block lives in N channels with no duplication) and Anytype's typed-object model (every item has a type + typed relations) are the two most novel relative to today's flat browser bookmark/history stores.

2. **Focus enforcement.** Effectiveness scales with how low in the stack enforcement sits. Cold Turkey's OS-level, tamper-resistant blocking (anti-uninstall, time-change prevention, process kill) is unmatched; Freedom leads on cross-device session coherence (cloud-synced); RescueTime's blocking is auxiliary to telemetry. A browser is the natural enforcement layer for *web* content and can ship native (non-extension) blocking that an extension-based blocker cannot match for tamper resistance.

3. **Observation surface.** ActivityWatch's watcher-bucket-event architecture (local daemon emits timestamped JSON events into named buckets, exposed via local REST API) is the single most directly borrowable browser pattern — it is effectively the design a browser would converge on if it shipped native attention tracking, minus the extension dependency.

The clearest whitespace: **no tool combines local-first activity tracking with on-device semantic classification** (ActivityWatch tracks but can't classify; RescueTime classifies but is cloud-only), and **no structured-knowledge tool except Anytype ships production-grade local-first P2P sync** (AnySync, CRDT-based). Both are open lanes for an AI-native, privacy-first browser.

---

## 2. Key Findings (with sources)

### Capture & Graph Models

- **F1 — Obsidian: vault = plain Markdown files; graph view derives from `[[wikilinks]]`; no proprietary format, no lock-in.** Largest plugin ecosystem (~1,000+ community plugins) via a TypeScript plugin SDK; the vault filesystem *is* the API (no REST API). "Bases" core plugin (~2025) adds spreadsheet/DB views over file properties.
  Source: https://help.obsidian.md/Getting+started/Sync+your+notes+across+devices · https://docs.obsidian.md/

- **F2 — Logseq: outliner graph where every line is a block; block-level bidirectional linking is finer-grained than page-level systems.** Datalog queries, built-in whiteboard, Zotero/PDF integration. DB version (SQLite, typed first-class properties) was still in beta as of Dec 2025 (`0.10.15`); the file-vs-block atomic-unit choice is a fundamental fork — Logseq's block-granular links break outside Logseq, whereas Obsidian Markdown is portable.
  Source: https://blog.logseq.com · https://github.com/logseq/logseq/releases

- **F3 — Heptabase: whiteboard-first spatial canvas (cards on infinite nestable whiteboards) is the strongest visual-working-memory model surveyed; ships AI Tutor + real-time collaboration.** But local-first is only partial (offline cache over a proprietary cloud backend), there is **no public API** (API wiki returns 404 as of June 2026), and **no plugin SDK** — a decisive extensibility gap and lock-in risk (~$11.99/mo SaaS).
  Source: https://heptabase.com · https://wiki.heptabase.com

- **F4 — Anytype: typed object graph — every item is an Object with a Type (Note, Task, Person, Project, custom) and typed Relations as graph edges.** Most flexible structured-data model; strongest privacy posture (on-device encryption, user holds keys, self-hostable open protocol). Exposes a machine-readable REST + gRPC API (`anytype-heart`, OpenAPI spec) rather than a user plugin SDK.
  Source: https://doc.anytype.io · https://github.com/anyproto/anytype-heart

- **F5 — are.na: many-to-many block-to-channel graph — a single block (Image/Link/Attachment/Text/Media) lives in multiple channels simultaneously with no duplication.** Pure curation (no note editor), fully cloud, social discovery graph. Well-documented REST API v2 (full CRUD on channels + blocks, OAuth, public read) + a browser "save to are.na" extension. No offline, no export API beyond per-block download, no webhooks.
  Source: https://dev.are.na/documentation/channels

### Focus Enforcement & Tracking

- **F6 — ActivityWatch: only fully local-first time tracker — buckets→events architecture, all data in local SQLite, MPL-2.0, no account, full export.** Watchers observe window title (OS), browser tabs (extension), editor files, media; custom watchers are trivial. Exposes a local REST API (`localhost:5600`) + Chrome/Firefox extensions + Python client. Tracking only, **no blocking**; sync still in development (not production-ready 2026). Notably the only major tracker with full Linux support after RescueTime dropped Linux in 2024.
  Source: https://activitywatch.net · https://docs.activitywatch.net · https://activitywatch.net/blog/activitywatch-vs-rescuetime/ (vendor blog; medium confidence on the comparative claim)

- **F7 — Cold Turkey: hardest, most tamper-resistant blocker surveyed — OS hosts-file + application process kill, plus anti-tamper hardening (prevents system time changes, blocks Task Manager, blocks uninstall during a lock).** Lock modes: timer, random-text challenge (1–999 chars), time-range, restart-required, password (Pro). Fully local (settings + stats on device, no account, no cloud by design). Integration is **CLI only** (start/stop/toggle/lock); no REST API, no browser-extension SDK because enforcement is OS-level. Windows/macOS only, no Linux, no mobile.
  Source: https://getcoldturkey.com/features/

- **F8 — Freedom: cross-device session coherence leader — VPN-based blocking on mobile, DNS/hosts on desktop, multi-device sessions synced via cloud account; Locked Mode makes sessions irrevocable until the timer expires.** Premium gates extended/always-on sessions, recurring schedules, multi-device sync, Locked Mode. Cloud-dependent (setup is account-gated), no public API, no Linux. Desktop enforcement mechanism (DNS vs hosts) is not officially documented — medium confidence.
  Source: https://freedom.to/features

- **F9 — RescueTime: best passive-telemetry dashboard (auto window-title + app + URL tracking, productivity scoring, calendar integration); blocking exists only as an auxiliary Focus Sessions feature (Premium, app-level OS hooks, not kernel-level).** Cloud-first, no self-hosting, free tier limited to 2 weeks of history, **dropped Linux support in 2024**. Limited REST API; browser support across Chrome/Firefox/Edge/Safari/Arc/Brave; Zapier integration. Window titles only — no keystrokes/content recorded.
  Source: https://www.rescuetime.com/features

### Cross-Cutting

- **F10 — Local-first is table stakes, not a differentiator, among the privacy-conscious PKM set.** Obsidian, Logseq, Anytype, and ActivityWatch all store data on-device first; the cloud-first set (Heptabase, are.na, Freedom, RescueTime) requires an account + server relationship. Anytype's **AnySync** (CRDT, encrypted, peer-to-peer, optional hosted backup nodes; open source at `github.com/anyproto`) is the most sophisticated local-first sync architecture surveyed and the only one production-grade for structured data.
  Source: https://github.com/anyproto/anytype-heart · https://doc.anytype.io

- **F11 — The browser extension is the dominant data-capture surface across the focus/tracking set.** ActivityWatch (observe tab URL+title), are.na (save block), RescueTime (track), Freedom (block), and Heptabase (clip) all extend into the browser. ActivityWatch's extension→local-REST model is the most directly browser-native — it is the pattern a browser would ship internally to remove the extension dependency entirely.
  Source: https://activitywatch.net · https://dev.are.na/documentation/channels · https://www.rescuetime.com/features

---

## 3. Implied Aether Feature Candidates

| # | Candidate | Borrowed from | Category | Rationale |
|---|-----------|---------------|----------|-----------|
| C1 | **Native attention-watcher engine** — background service emits timestamped JSON events (active tab, domain, time-on-page, scroll depth, media state) into named buckets; exposed via a local REST/IPC endpoint other tools can subscribe to | ActivityWatch | Productivity | Removes extension dependency; gives every consumer (focus engine, dashboards, AI classifier) a decoupled attention stream. Most directly borrowable browser pattern. |
| C2 | **Block capture with many-to-many context tagging** — a "save block" shortcut captures any selection (text/image/URL/media) and connects it to N projects/topics at once, no duplication | are.na | Workspace & Organization | Replaces single-destination bookmarking with contextually-rich capture at the moment of save. |
| C3 | **Native focus engine with a hardness gradient** — three modes: soft advisory alert, locked session (survives restart), hard challenge-to-unblock (typing/timer); enforced in the browser, not an extension | Cold Turkey + Freedom + RescueTime | Productivity | A browser controlling its own blocklist is far more tamper-resistant than a disable-able extension; gradient covers the full strictness spectrum. |
| C4 | **Per-domain time allowances / attention budgets** — "30 min/day on X," auto-block on exhaustion with a challenge to extend | Cold Turkey (Allowances) | Productivity | More nuanced than binary block/allow; needs only accurate per-tab time tracking (provided by C1). |
| C5 | **Typed object model for history/bookmarks/tabs** — visited URLs become typed objects (Article, Repo, Product, Tool, Person) with editable relations, queryable by type + context | Anytype | Workspace & Organization | Turns the unstructured history append-log into a queryable knowledge layer; foundation for research workflows and agent automation. |
| C6 | **On-device AI classification of attention/history** — local model labels visited URLs by intent (Research/Comms/Entertainment/Shopping) with no data leaving the device; feeds focus reports + contextual suggestions | Whitespace (AW tracks, RescueTime classifies, neither does both locally) | AI & Agents | Closes the gap no surveyed tool fills; aligns with Aether's privacy-first, AI-native thesis. |
| C7 | **Session/navigation graph view** — bidirectional-link graph over browsing (page→page links, related-domain sessions, reading trails) rendered in a sidebar | Obsidian / Logseq | Workspace & Organization | Surfaces research paths, topic clusters, and rabbit holes from `<a>` link topology of visited pages. |
| C8 | **P2P, CRDT, local-first sync of browser state** — history, bookmarks, tabs, focus logs synced peer-to-peer with no cloud account, CRDT merge resolution | Anytype AnySync | Sync & Portability | Only production-grade local-first structured-data sync exists in Anytype; all mainstream browser sync is cloud-dependent. Strong privacy differentiator. |
| C9 | **Spatial canvas for tab/research grouping** — infinite whiteboard where open tabs/saved blocks are placed as cards; proximity encodes relationship | Heptabase (+ Arc spaces) | Workspace & Organization | Visual working memory for web research; medium priority (high UX complexity, no reference API to borrow). |
| C10 | **Daily-log / journaling integration** — auto-append today's visited pages, saved blocks, and annotations to a chronological outliner log; optionally write into an external Obsidian/Logseq vault | Logseq daily notes | Productivity | Removes friction between browsing and note-taking; can target native store or external PKM. |
| C11 | **Local REST/IPC API exposing watcher, object store, and focus state to extensions and external PKM tools** | ActivityWatch + Anytype | Extensibility | Lets Obsidian/Logseq plugins, Cold Turkey CLI, and agents consume browser attention/knowledge data — extensibility compounds (Obsidian's ~1,000 plugins vs Heptabase's zero is the most decisive gap in the space). |

---

## 4. Competitive / Whitespace Notes

- **Extensibility is the decisive long-run moat.** Obsidian's ~1,000+ plugins vs Heptabase's zero is the single sharpest competitive gap in the PKM space; plugin ecosystems compound. A browser that ships a stable local API (C11) and a real SDK out-paces closed, no-API tools (Heptabase, Freedom) on developer mindshare over time.
- **The local-first + frictionless-UX quadrant is empty.** Every tool is either local-first-but-rough (ActivityWatch onboarding, Anytype UX complexity) or polished-but-cloud (Heptabase, RescueTime, Freedom). An AI-native browser that delivers polished UX *on top of* local-first storage occupies open space.
- **No tool unifies tracking + semantic classification locally (C6).** ActivityWatch tracks without classifying; RescueTime classifies in the cloud. On-device AI classification is genuinely novel.
- **No structured-knowledge tool but Anytype ships local-first P2P sync (C8).** AnySync is the only production CRDT P2P sync for structured data; mainstream browser sync (Chrome/Firefox/Brave) is uniformly cloud-dependent.
- **are.na's many-to-many block-channel model has no parallel** in any browser bookmark/history store — capturing once into multiple contexts is a distinct, defensible primitive (C2).
- **Browser is the natural web-focus enforcement layer.** Cold Turkey/Freedom enforce below or beside the browser; a browser that natively owns its blocklist (C3) is more tamper-resistant for web content than any extension and can integrate focus state with the watcher engine (C1) and budgets (C4) — a combination no single competitor ships.
- **Linux is contested ground vacated by incumbents.** RescueTime dropped Linux (2024); Cold Turkey and Freedom never supported it. ActivityWatch's Linux support is a differentiator. A cross-platform Aether with focus + tracking parity on Linux serves an underserved power-user segment (aligned with Aether's Arch-Linux user profile).

---

## 5. Risks

- **R1 — Browser-level blocking is bypassable vs OS-level.** Aether's native focus engine (C3) cannot reach Cold Turkey's tamper resistance (anti-uninstall, time-change prevention) because those operate below the app layer. Set expectations: Aether hard-blocks *web content* well, but a determined user can switch browsers. Mitigation: optional Native Messaging Host / companion daemon for OS-level hardening; position as "web focus," not system focus.
- **R2 — Extensibility-vs-stability tension.** Obsidian's plugin API is unversioned and ships breaking changes; Logseq's DB-version plugin API is unsettled (beta as of Dec 2025). A local API (C11) must commit to versioning/stability from day one or inherit the same churn that frustrates PKM plugin developers.
- **R3 — P2P/CRDT sync is high-effort and partially unproven.** Even ActivityWatch's sync is "in development / not production-ready" in 2026; Anytype's AnySync is the lone proven exemplar. C8 is a large, complex build (conflict resolution, encryption, peer discovery) with real schedule risk.
- **R4 — On-device classification accuracy and cost.** C6 depends on a local model good enough to classify intent reliably without cloud fallback; misclassification erodes trust in focus reports, and on-device inference has battery/latency cost (cross-reference the local-on-device-AI draft).
- **R5 — Privacy/observability paradox.** A native watcher engine (C1) that logs every tab + scroll + media event is itself a sensitive surveillance surface. It must be local-only, user-inspectable, and easy to pause/redact, or it contradicts Aether's privacy-first positioning.
- **R6 — Source-confidence caveats carried from the brief.** Heptabase API existence (404, low confidence), Freedom desktop enforcement mechanism (DNS vs hosts, medium), Logseq DB-version stability/timeline (medium), and ActivityWatch sync delivery (low) are unresolved. The ActivityWatch-vs-RescueTime Linux comparison is from ActivityWatch's own (biased) blog — medium confidence. Re-verify before committing roadmap decisions that depend on them.

---

## 6. Sources

| # | Source | URL |
|---|--------|-----|
| 1 | Obsidian — Sync methods (official help) | https://help.obsidian.md/Getting+started/Sync+your+notes+across+devices |
| 2 | Obsidian — Developer docs / plugin SDK | https://docs.obsidian.md/ |
| 3 | Obsidian — Core plugins (Bases) | https://help.obsidian.md/plugins |
| 4 | Logseq — Blog | https://blog.logseq.com |
| 5 | Logseq — GitHub releases (v0.10.15 DB beta) | https://github.com/logseq/logseq/releases |
| 6 | Heptabase — Official site | https://heptabase.com |
| 7 | Heptabase — Public wiki (API 404) | https://wiki.heptabase.com |
| 8 | Anytype — Documentation | https://doc.anytype.io |
| 9 | Anytype — anytype-heart (REST/gRPC + AnySync) | https://github.com/anyproto/anytype-heart |
| 10 | are.na — API v2 (channels/blocks) | https://dev.are.na/documentation/channels |
| 11 | ActivityWatch — Official site | https://activitywatch.net |
| 12 | ActivityWatch — Docs (architecture, REST API) | https://docs.activitywatch.net |
| 13 | ActivityWatch vs RescueTime blog (biased source) | https://activitywatch.net/blog/activitywatch-vs-rescuetime/ |
| 14 | Cold Turkey — Features | https://getcoldturkey.com/features/ |
| 15 | Freedom — Features | https://freedom.to/features |
| 16 | RescueTime — Features | https://www.rescuetime.com/features |

---

*Department report derived from `outputs/knowledge-focus-tools-comparison.md`. Confidence: ✅ High unless noted. v1 reports in `docs/research-data/` used as format reference only; not modified.*
