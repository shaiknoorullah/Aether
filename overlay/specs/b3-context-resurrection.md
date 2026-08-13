# b3 — Context Resurrection (scroll survives switches and restarts)

## 1. Today → Instead → Thinnest

**Today**: f5 restores workspaces and tabs by url, but every restored tab lands at the top of the page. After a restart (or a container re-mint) I'm re-scrolling a 40-minute-deep doc back to where I was — the browser holds *which* pages were open but not *where I was in them*. That last part is exactly the working memory it's supposed to externalize.

**Instead**: scroll position is part of context. Switching back to a workspace or reopening the browser lands every tab exactly where it was — silently, with no UI, no prompt, no "session recovered" banner. This is the execution-plan Phase 4 "context resurrection deepening", scoped to the one dimension that matters daily: vertical scroll of the top document.

**Thinnest**: one pure module `aether-resurrect.sys.mjs` (context records, merge/prune, serde) hanging off the f5 model; records ride inside the existing `aether-workspaces.json` (schema bump, additive, old files tolerated); the existing AetherContent actor grows one child→parent message (throttled scroll samples) and the existing `Aether:ScrollTo` grows a numeric variant. No new files on disk, no new commands, no new UI surface.

## 2. Exact behavior

**Record**: per-tab context `{url, scrollY, capturedAt}` keyed by the tab's f5 ref id (ids are unique model-wide, so workspace membership is derivable and a rename never orphans a record). Stored as `contexts: {<refId>: record}` next to `workspaces` in the JSON; `serialize` now emits `schema: 2`. Old schema-less files deserialize fine (empty contexts); new files are readable by old code (unknown fields ignored).

**Capture** (child → parent): the content child, **top frame only**, listens for `scroll` on the content window — trailing-edge throttled to **1 message/second max** — and flushes once on `pagehide`. Each sample is `Aether:ScrollSample {y, url}` where `url` is the *sending document's* url (not the ref's — this makes the pagehide flush race-proof against the location listener having already rewritten the ref). Parent stores the record for the tab's ref id. `y = 0` **deletes** the record — top-of-page is what a fresh load gives anyway; no record is the resting state, and the file doesn't accrete noise. Untracked tabs and non-finite/negative `y` are ignored. Captures persist through the f5 service's existing queued atomic write path, coalesced by a trailing 1 s debounce (`persistSoon()`) so scrolling doesn't chain a write per sample.

**Restore** (parent → child): a reopened-from-JSON tab (restart restore, and only that path) whose ref has a context record is **armed**. When that tab's top-level load completes and the loaded url **exactly matches** `record.url`, the parent sends `Aether:ScrollTo {y}` once (the existing message; a numeric `y` scrolls to that offset, the `where: top|bottom` form is unchanged) and disarms. The child applies it as a single instant `scrollTo` and abandons — no retry, no polling, no scroll-anchoring fight; if the page hasn't reached that height yet, the clamp is accepted (§6). **The user always wins**: any `Aether:ScrollSample` from an armed tab disarms it before the shot is fired — if I'm already scrolling, the browser never yanks the page. Url mismatch (redirect, changed content) disarms too: a stale record is dropped, never force-applied.

**Workspace switch**: hidden-not-closed (f5) means an alive tab keeps its scroll natively — switching back needs no message and none is sent. The switch hook covers the one gap: a still-armed tab (restored into a hidden workspace, load finished while hidden and the shot not yet taken) gets its one shot when shown. Either way the observable behavior is the promise in the title: switch back, same position.

**Prune** (pure, applied at load in the service with injected `nowMs`, and on `removeTab`): drop records older than **30 days**, records whose id resolves to no tracked ref, and records whose url no longer matches the ref's current url. Closing a tab drops its record immediately. The file can only shrink back to truth, never brick — malformed context entries are dropped individually, f5's tolerant deserialization is untouched.

**Copy**: none. Resurrection is silent — no confirmation, no "restored your session" banner, nothing to pass the f6 lexicon sweep because there are no new strings.

**Keybindings**: none. This is ambient behavior, not a command.

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; f0 sync guard extends):

```toml
[workspaces]
resurrect = true   # off = never capture, never restore; existing records are left alone
```

## 3. Pure vs glue

- **`aether-resurrect.sys.mjs`** (pure, Node-testable — no Services/DOM/IOUtils/`Date.now`; time injected): `captureScroll(model, id, url, y, nowMs)` (tracked-id guard, `y <= 0` deletes, non-finite rejected); `restoreY(model, id, loadedUrl)` → `y | null` (exact url match, `y > 0`); `dropContext(model, id)`; `pruneContexts(model, nowMs)` (age > 30 d, orphan id, url drift); `sanitizeContexts(raw)` — tolerant per-entry validation for deserialization (hostile keys inert, wrong shapes dropped).
- **`aether-workspaces.sys.mjs`** (pure, extended): model gains `contexts: {}`; `serialize` emits `schema: 2` + contexts; `deserialize` runs `sanitizeContexts` (age pruning stays in the service where `Date.now` lives); `removeTab` calls `dropContext`.
- **`aether-config.sys.mjs`**: `DEFAULTS.workspaces.resurrect`.
- **`aether-content-child.sys.mjs`** (glue, not unit-tested): top-frame throttled scroll listener + pagehide flush → `Aether:ScrollSample {y, url}`; `Aether:ScrollTo` numeric-`y` variant (single instant apply).
- **`aether-workspaces-service.sys.mjs`** (glue): `pruneContexts(model, Date.now())` after load; `persistSoon()` debounce over the existing queued atomic write.
- **`aether.uc.js`** (glue): arm reopened tabs during `restoreWorkspaces`; per-tab load-complete hook → `restoreY` → send-once + disarm; scroll samples → `captureScroll` + disarm; switch hook fires any armed-shown-loaded tab; `[workspaces] resurrect` gate around all of it.

Estimated runtime-path cost: ~60 lines pure, ~45 lines glue — inside the thin-fork budget.

## 4. Unit tests (behavioral)

`overlay/test/unit/b3-resurrect.test.mjs`:
1. capturing a scroll for a tracked tab creates `{url, scrollY, capturedAt}`; a second capture overwrites — one record per tab, latest wins
2. capturing `y = 0` deletes the tab's record — scrolled-to-top serializes as no record, not a zero record
3. capture with an unknown tab id, or a non-finite/negative `y`, leaves contexts unchanged — no throw, no orphan record
4. `restoreY` returns the recorded y only when the loaded url exactly matches the record's url; mismatch, missing record, or `y = 0` → null
5. `pruneContexts` drops records older than 30 days and keeps records at exactly 30 days — `nowMs` injected, boundary explicit
6. `pruneContexts` drops records whose id resolves to no tracked ref and records whose url no longer matches the ref's current url; matching records survive untouched
7. `removeTab` drops the closed tab's context record — the memory dies with the tab
8. serialize emits `schema: 2` with contexts; serialize → deserialize round trip preserves records tied to surviving refs
9. deserializing a schema-less v1 f5 file yields a valid model with empty contexts — old files tolerated, no throw
10. malformed context entries (wrong types, string ids, hostile keys like `__proto__`) are dropped individually while valid sibling records survive; no throw, no prototype pollution
11. f5 invariants hold with contexts present: adopt/rename/cycleNext leave contexts untouched, and after deserialization no record points at a nonexistent ref (orphan-id reassignment can't misattach a record)

`overlay/test/unit/b3-config.test.mjs`:
12. sync guard: `DEFAULTS.workspaces.resurrect` is `true` and the example `overlay/config/aether.toml` parses to exactly the defaults (f0 pattern)

All existing f5 tests keep passing unchanged — the serde extension is additive.

## 5. Visual states — `overlay/test/visual/scenarios.d/g3-context-resurrection.sh`

Against a tall harness playground page, in workspace `main`:
1. **scrolled deep in workspace A** — nav, scroll well past the fold (`d`×n / `G`); shot: statusbar + visible content prove the position
2. **after switch away and back** — `:ws b`, then `:ws main`; shot: same content region visible, same scroll position
3. **after relaunch** — `relaunch_browser`, wait for restore + load; shot: the tab lands at the same scroll position, not the top

Existing scenarios (spike, f1–f7, b1–b2) keep passing.

## 6. Non-goals (budget protection)

- **No form state, no SPA in-page state** — fragile, privacy-sensitive, and a rebase-budget sink. Scroll only.
- **No per-history-entry scroll** — current entry only; back/forward scroll stays Gecko's business (bfcache already handles it).
- No iframe or nested-scroller positions — top document, window scroll, vertical only (no `scrollX`).
- No pixel-perfect layout-shift compensation, no retry/polling until the page "settles" — one shot, clamp accepted. Lazy-loading infinite feeds restoring short is a known edge, not a bug to engineer around.
- No restore on same-session reloads or fresh navigations — arming happens on restart restore only.
- No per-site opt-out, no configurable retention window — one boolean, 30 days is a constant.
- No separate context file — records live and die inside `aether-workspaces.json`.
