# f5 — Workspaces and Persistence

## 1. Today → Instead → Thinnest

**Today**: one flat tab pool. Every project's tabs interleave; `J/K` cycles through everything; a restart loses the arrangement (the profile starts blank). The browser holds none of my working memory — context lives in my head or dies.

**Instead**: named workspaces. Each tab belongs to exactly one; switching shows only the active workspace's tabs (the rest are hidden, not closed); each workspace is container-isolated (contextualIdentities) so work/personal cookies never mix; everything — workspaces, membership, active selection — restores across restarts. Execution-plan floor item 5; this is also most of context resurrection.

**Thinnest**: one pure module `aether-workspaces.sys.mjs` (model + serde + invariants), one glue service (`aether-workspaces-service.sys.mjs`, graveyard-service pattern) owning `<profile>/aether-workspaces.json` with **atomic writes** (`IOUtils.writeUTF8` + `tmpPath`), and `aether.uc.js` wiring: native `gBrowser.hideTab/showTab` (the Simple Tab Groups mechanism — zero tab UI of ours), native containers for isolation, the palette for switching, the f2-reserved `workspace` statusbar slot for display. We own restore outright (startup stays blank; tabs reopen from our JSON) — no reconciliation with Firefox sessionstore.

## 2. Exact behavior

**Model**: workspace = `{name, containerId, tabRefs: [{id, url, title}], lastActive}`. Invariants (enforced in the pure module): every tracked tab is in exactly one workspace; at least one workspace always exists; `active` always names an existing workspace; names are unique and non-empty.

- Fresh profile: a single workspace `[workspaces] default` (default `"main"`), `containerId 0` (no container — default browsing stays vanilla). The startup tab is adopted into it.
- **`:ws <name>`** — switch-or-create. Existing name → switch. New name → create: glue mints a container via `ContextualIdentityService.create(name)` and stores its `userContextId` as `containerId`; the workspace opens with one fresh `about:blank` tab in that container.
- With input `ws …` the palette candidate row switches to workspace names (active first, then most-recent `lastActive`), same seam as `:graveyard` — the f4 one-off becomes a two-entry provider map, still not general argument completion. `Tab` cycles without rewriting the query; `Enter` on a candidate switches.
- **`gw` (normal mode, joins `gg`) = `ws_next`** — cycle workspaces in creation order, wrapping. Also `:ws_next`.
- **`:ws_rename <name>`** — rename the active workspace. Name collision or empty → neutral statusbar copy (`workspace name in use: <name>`), nothing changes, no error styling.
- **Switch mechanics** (glue): show target's tabs → select its `lastActive` tab (empty workspace → open `about:blank` in its container) → hide every other workspace's tabs. Hidden tabs keep loading/playing; they're invisible, not suspended.
- **Membership**: every `TabOpen` adopts the tab into the active workspace (covers `t`, `O`, hints, page-opened tabs). `tab_new`/resurrection open with the active workspace's `userContextId`. `TabClose` removes the ref — and f4's reserved `workspace` field on graveyard records lights up: buries now carry the workspace name. Location/title changes update the ref (`url`, `title`). Zero-workspace state can't happen; zero-tab workspaces survive.
- **Visible-only chrome**: tab count widget and `J/K`/`:tab n` operate on visible tabs only (native `advanceSelectedTab` already skips hidden); the f4 vertical-tab strip shows only visible tabs natively.
- **Statusbar**: implement the reserved `workspace` builtin — renders the active name (`class: aether-workspace`, event-driven, no schedule). Joins the default widget order after `mode`.
- **Persistence**: JSON read once at process start (service singleton, first caller wins), written queued/last-write-wins after every membership/switch/rename change, atomically. On restore: recreate each workspace, reopen its tabs by url in its container (missing container → recreate by name, rewrite id), hide inactive workspaces, land on `active`'s `lastActive` tab. Missing/corrupt file → fresh default model; malformed entries dropped; never bricks, never scolds.

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; f0/f2 sync guards update):

```toml
[workspaces]
default = "main"       # the workspace a fresh profile starts in (containerId 0)

[statusbar]
widgets = ["mode", "workspace", "url", "msg", "clock"]  # reserved slot goes live

[keymap.normal]
"gw" = "ws_next"       # joins existing bindings
```

New registry commands: `ws` (usage `ws <name>`, min 1), `ws_rename` (min 1), `ws_next`.

## 3. Pure vs glue

- **`aether-workspaces.sys.mjs`** (pure, Node-testable — no Services/IOUtils/DOM/`Date.now`; time and container ids injected): `createModel(defaultName)`; `switchOrCreate(model, name, nowMs)` → `{created}` so glue knows to mint a container; `setContainer(model, name, containerId)`; `rename(model, newName)` → ok | neutral-message constant; `cycleNext(model)`; `adopt(model, wsName, {url, title})` (assigns `id`, moves if tracked elsewhere — the exactly-one invariant); `updateTab(model, id, {url, title})`; `removeTab(model, id)`; `tabsOf(model, name)`; `serialize(model)` / `deserialize(text, defaultName)` (tolerant: bad JSON → fresh model; malformed workspaces/refs dropped; duplicate names → first wins; `active` re-pointed to a survivor; `nextId` recomputed); the neutral copy constants.
- **`aether-widgets.sys.mjs`**: the `workspace` builtin (renders `ctx.workspace`).
- **`aether-palette.sys.mjs`**: `ws`/`ws_rename`/`ws_next` REGISTRY entries.
- **`aether-config.sys.mjs`**: `DEFAULTS.workspaces`, widget-order default, `gw` binding.
- **`aether-workspaces-service.sys.mjs`** (glue, not unit-tested): singleton around the model; JSON read-once/queued-atomic-write; `ContextualIdentityService` mint/re-resolve.
- **`aether.uc.js`** (glue, not unit-tested): TabOpen/TabClose/location listeners → model calls; hide/show + select on switch; startup restore (reopen urls per container, hide inactive); palette provider wiring; `ctx.workspace` into the statusbar; workspace name into graveyard buries; `userContextId` on new tabs.

## 4. Unit tests (behavioral)

Model — `overlay/test/unit/f5-workspaces.test.mjs`:
1. fresh model: default workspace exists, is active, has no tabs
2. `switchOrCreate` with a new name creates and activates it (`created: true`); with an existing name switches without duplicating (`created: false`)
3. adopt places a tab in exactly one workspace; adopting a tracked tab into another workspace moves it — it appears in the new one and nowhere else (the invariant)
4. switching updates `lastActive` recency; candidate ordering is active-first then most-recent
5. `cycleNext` walks creation order and wraps; a single workspace cycles to itself
6. rename changes the active workspace's name; rename to an existing name or empty string is rejected with the neutral message constant and the model is unchanged
7. removing a workspace's last tab leaves the workspace alive and the model valid
8. `updateTab` rewrites url/title for a tracked id; unknown id is a no-op, no throw
9. serialize → deserialize round trip preserves workspaces, creation order, containerIds, active, and tab membership
10. deserialize of malformed JSON / wrong shape → fresh default model, no throw
11. deserialize drops individual malformed workspaces and tabRefs, keeps valid ones, and re-points `active` at a surviving workspace; a file with zero valid workspaces yields the default
12. duplicate workspace names in a file → first kept, membership of the dropped one discarded, invariant holds
13. id continuity: adopt after a round trip never collides with a deserialized tab id
14. copy guard: rename-collision and no-workspace message constants contain no punitive wording

Widgets — extend `overlay/test/unit/f2-widgets.test.mjs` or `f5-widgets.test.mjs`:
15. `workspace` builtin renders the active name from ctx; missing `ctx.workspace` → empty text, never "undefined"; the id now resolves instead of being skipped

Palette — `overlay/test/unit/f5-palette.test.mjs`:
16. `ws`, `ws_rename`, `ws_next` in REGISTRY; `complete("ws")` lists all three; `parse("ws dev")` → args `["dev"]`; `parse("ws")` / `parse("ws_rename")` without args → unknown-with-usage, not a crash

Config — `overlay/test/unit/f5-config.test.mjs` (f0 sync-guard pattern):
17. `DEFAULTS.workspaces.default` = "main", the `gw` binding exists, default widget order includes `workspace`; example `overlay/config/aether.toml` parses to exactly the defaults

## 5. Visual states — `overlay/test/visual/scenarios.d/f5-workspaces.sh`

1. workspace A with its tabs and statusbar name (open pages in `main`, statusbar shows the name and tab count)
2. workspace B after switch (`:ws b` — A's tabs hidden, fresh container tab, statusbar name flips, count drops)
3. after browser relaunch (existing `relaunch_browser` step, same profile): workspace B intact — its tabs restored, A still present but hidden, statusbar name proves persistence

00-spike and f1–f4 scenarios keep passing unchanged.

## 6. Non-goals (budget protection)

- **No workspace UI of our own** — no switcher panel, no drag-and-drop, no overview grid; the palette and one statusbar word are the whole surface.
- No workspace delete/merge/reorder — rename and cycle only; a stale workspace is ignored, not managed. Revisit after daily-driving.
- No moving tabs between workspaces (`:ws_move` etc.) — membership is set at open time; the model's `adopt` seam waits for f6 (focus mode) to need it.
- No multi-window semantics — the model is per-primary-window; extra windows are out of scope this pass.
- No session state in tabRefs (scroll, form data, history stack) — url+title; restore is a fresh load, same rule as the graveyard.
- No sessionstore reconciliation — we own restore; startup stays blank and Firefox's restore machinery is never our input.
- No per-workspace theming, icons, container colors, keymaps, or auto-assignment rules (domain X → workspace Y).
- No lazy/deferred tab loading on restore, no tab suspension — hidden means hidden, nothing cleverer.
- No configurable persistence path or export — one JSON file in the profile.
- No general palette argument completion — the provider seam grows to exactly two entries (`graveyard`, `ws`) and stops.
