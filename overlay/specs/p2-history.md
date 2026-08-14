# p2 — History (a search surface, not a timeline)

## 1. Today → Instead → Thinnest

**Today**: history is reachable only through the summoned urlbar's autocomplete, which mixes suggestions, search-engine noise, and history into one ranked soup I can't scope or filter. `Ctrl+H`'s sidebar is native chrome that doesn't exist here. So "that page I had open on Tuesday" is unfindable, and the workaround is keeping the tab open forever — which is the 80-tab problem, arriving through a different door.

**Instead**: history as a source on r4's primitive, with the same keys as tabs and bookmarks, x3-ranked, scopeable by time and by workspace. If closing a tab is safe (f4's graveyard) and finding it later is easy (this), then tabs stop being memory.

**Thinnest**: Firefox's Places database already stores every visit, indexed, with frecency of its own. Reading it is a query, not a store — no second history database, no ingestion pipeline, nothing to keep consistent. The overlay contributes only what Places can't know: which workspace a visit happened in.

**The API is `PlacesQuery.sys.mjs`**, not `PlacesUtils.history`. That distinction is load-bearing: `PlacesUtils.history` is a proxy over `nsINavHistoryService` falling back to `History.sys.mjs`, whose entire public surface is `fetch`/`fetchMany`/`fetchAnnotatedPages`/`insert`/`remove`/`hasVisits`/`clear`/`update` — there is **no "visits between t1 and t2" method**. The alternatives are the legacy `getNewQuery()`/`executeQuery()`, which is **synchronous and would jank the whole browser on every panel open**, or hand-written SQL. `PlacesQuery` gives `getHistory({daysOld, limit, sortBy})`, `searchHistory(query, limit)` and `observeHistory(cb)` — async, supported, and shaped for exactly the `today`/`week` scopes below.

The constraint is therefore stated precisely: **read-only, through `PlacesUtils.promiseDBConnection()` or a module built on it; never open `places.sqlite` ourselves, never write to it directly.** "Never raw SQLite" as written would forbid `PlacesQuery` itself, which is SQL over the sanctioned read-only connection.

## 2. Exact behavior

**`:hist`** opens the history source. Rows are `title — host · <relative time>`, newest-first when unfiltered, x3-ranked once a query exists. `:hist <query>` opens pre-filtered.

**Scopes** (`Tab`-cycled, shown in the panel title): `today` (default) · `week` · `all` · `workspace`. The default is deliberately narrow — history search is nearly always about the recent past, and an unscoped list makes the first keystroke slower for no benefit.

**Every scope bounds its fetch, not just its render.** x3 justifies "no index, no worker thread" with "hundreds of items, not millions" and guards at 5,000 candidates; `all` over a year of daily driving is 10⁵–10⁶ Places rows, and ranking them with a linear scorer on the chrome main thread *per keystroke* would stall the UI on exactly the profile where the feature matters. Capping the rendered rows is the wrong end of the pipeline. So `all` passes a hard `limit` to `getHistory`, and a non-empty query routes through `searchHistory(query, limit)` so the narrowing happens in SQL and x3 ranks only what comes back. The limit is stated in the panel title when it truncates.

**Workspace attribution is keyed by URL, not by visit.** `{url, workspace, lastSeenAt}`, last-write-wins, in `<profile>/aether-history-ws.json` (bounded ring, 20,000 entries, atomic writes with `backupFile`).

A `visitId` key is not obtainable on either side: the top-level-navigation hook has a URL and a browser but no visit id (that is exposed only via `PlacesObservers`' `page-visited` event or `History.insert`'s resolved `pageInfo`), and the read side collapses visits with `GROUP BY url` before any id could survive. Since rows are per-URL anyway (test 4), per-URL attribution is the model that matches. The consequence is stated rather than hidden: a URL visited in two workspaces carries **one** attribution, the most recent, so it appears in that workspace's scope and not the other's.

A visit with no record shows as unattributed rather than being hidden — the join is additive and never filters out real history.

**Actions** (`Tab`): open, open-in-new-tab, bookmark it (p1's `add`, so found-then-kept is two keys), copy-url, and **forget**.

Forget is more complicated than it looks, and all three parts are specified:

1. `History.remove()` **preserves the page** when something else references it — a bookmarked URL keeps its `moz_places` row and only its visits are deleted, and the call returns `false`. So the return value is checked and the statusbar says so (`forgot visits — still bookmarked`), rather than reporting a removal that didn't happen.
2. Firefox's `DownloadHistoryObserver` listens for `page-removed` and drops matching entries from the downloads list, so forgetting a URL also removes its p3 row. That coupling is Firefox's, not ours; it is named here and in p3 rather than discovered later.
3. x3's `history` frecency namespace is keyed by URL, so forget purges that key too — otherwise a forgotten URL keeps ranking in every other panel.

**No infinite scroll.** The panel renders `palette_max_items` rows plus `+N more`; narrowing the query is the way to see more, not scrolling. A history list you scroll is a timeline, and a timeline is a place to get lost.

**Private windows are never recorded** by the workspace side, matching f4's graveyard rule, and Places already excludes them.

**TOML surface**:

```toml
[history]
enabled     = true
scope       = "today"    # today | week | all | workspace
ws_records  = 20000      # workspace-attribution ring size

[keymap.normal]
"H" = "back"             # unchanged
```

New registry commands: `hist` (`read`), `hist_forget` (`mutate-local`). No default binding for `hist` — it lives in the palette next to `bm` and `tabs`.

## 3. Pure vs glue

- **`aether-history.sys.mjs`** (pure): `scopeRange(scope, now)` → `{since, until, limit}`; `joinWorkspace(placesRows, wsRecords)` → rows with attribution, unattributed preserved; `rows(joined)` → x3-shaped candidates; `relativeTime(then, now)` → the calm string (`4m ago`, `Tuesday`, `3 weeks ago` — never a bare timestamp, never a duration that reads as a score); ring `push`/`prune`/`serialize`/`deserialize` for the workspace store with b3-class guards.
- **`aether-panel.sys.mjs`** (r4) / **`aether-match.sys.mjs`** (x3): reused, incl. `replaceRows` after a forget.
- **`aether.uc.js`** (glue): `PlacesQuery.getHistory` / `searchHistory` for reads; the navigation listener writing workspace records (the same top-level-navigation hook b1 already uses for boosts — one listener, two consumers); `History.remove` for forget, with its boolean checked; x3 frecency purge.

## 4. Unit tests (behavioral) — `overlay/test/unit/p2-history.test.mjs`

1. `scopeRange` boundaries with injected `now`: `today` starts at local midnight (not 24h ago), `week` at 7 days, `all` is unbounded — asserted across a DST transition so the local-midnight rule is real
2. `joinWorkspace` attaches workspace to matching visits; visits with no record appear **unattributed rather than dropped** (the additive-join guarantee)
3. `workspace` scope filters to the current workspace and includes only attributed rows — and says so in the panel title, so an empty result is explainable
4. duplicate visits to one url collapse to one row carrying the most recent visit time and the total visit count
5. a URL visited in two workspaces carries the **most recent** attribution only, appears in that workspace's scope, and does not appear in the other's — the documented consequence of per-URL keying, pinned so it cannot drift
6. `scopeRange` returns a bounded `limit` for every scope including `all` (the x3-envelope guard)
7. `relativeTime` across seconds/minutes/hours/days/weeks with injected `now`; passes the f6 lexicon sweep (no "wasted", no durations framed as scores)
8. ring `push` respects the cap and drops oldest-first; `prune` removes records **older than a fixed absolute age** (30 days, b3's constant), asserted at the boundary with injected `now`. Pruning "older than the largest scope" would be a no-op, since `all` is unbounded — a test that passes against a function that does nothing
9. when the ring has evicted records for a period, the `workspace` scope says so in the panel title — a partially-truncated result is otherwise indistinguishable from "I never visited that here"
10. hostile ring file (wrong types, prototype keys, huge strings) deserializes per-entry without throwing or polluting
11. `rows` validates against x3's row shape and carries visit count for frecency
12. an empty Places result yields an empty row list and a neutral panel state, never an error

`overlay/test/unit/p2-config.test.mjs`:
13. config sync guard for `DEFAULTS.history`
14. `hist`/`hist_forget` in REGISTRY with descriptions; `hist_forget` is `mutate-local`; every panel action maps to a command (r4's rule)

## 5. Visual states — `overlay/test/visual/scenarios.d/j2-history.sh`

1. **panel, today scope** — after visiting several fixture pages: newest-first rows with relative times
2. **fuzzy filtered** — three interior characters narrow to the right row with highlights
3. **scope cycling** — `Tab` to `week`, panel title updates, row count grows
4. **workspace scope** — visit pages in two workspaces; scoped panel shows only the current one's
5. **forget** — mark two rows, forget; scenario asserts the urls are gone from Places *and* from a re-opened panel
6. **forget on a bookmarked page** — a fixture URL that is *also* bookmarked in Places: visits go, the page row survives, and the statusbar says so. (The naive version of this scenario uses an unbookmarked fixture, passes, and never sees the bug.)
7. **forget prunes frecency** — after forgetting, the same URL no longer ranks in `:bm`/`:hist` from the frecency store
6. **attribution survives relaunch** — `relaunch_browser`, workspace scope still attributes correctly (file-backed, proven)

## 6. Non-goals (budget protection)

- **No second history database.** Places is the store; this is a query surface. A duplicate history store is a consistency problem with no upside.
- **No history tree / visit graph.** Nyxt's tree is genuinely better than a stack and genuinely not small; it stays cut until the friction log asks for it by name.
- **No timeline view, no calendar, no infinite scroll** — narrowing beats scrolling.
- **No full-text search of visited page content.** That's an indexer, a disk budget, and a privacy surface — a different feature entirely.
- **No history import from other browsers** (p1 imports bookmarks; history import is noise you can't evaluate).
- **No per-site history disabling or auto-expiry rules** — `about:config` and Firefox's own retention already own that.
- **No sync of the workspace-attribution ring** — machine-local, like x3's frecency store.
