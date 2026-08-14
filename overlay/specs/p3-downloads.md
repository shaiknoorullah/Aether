# p3 — Downloads (a list and a widget, not a panel that pops)

## 1. Today → Instead → Thinnest

**Today**: `user.js` sets `browser.download.useDownloadDir = false`, so every download asks where to save — good — and then the file vanishes into a downloads panel attached to chrome that doesn't exist. In-progress downloads are invisible; finished ones are unfindable without a file manager. There is also no way to know a large download is still running while I work, which is the actual daily annoyance.

**Instead**: two surfaces, both existing. A **statusbar widget** that appears only while transfers are active (`↓ 2 · 14MB/s`) and disappears when they finish, and a **panel source** listing recent downloads with actions. Nothing ever pops open on its own.

**Thinnest**: Firefox already tracks transfers with progress, target path, and completion state. This is a widget reading that list plus another r4 source over it. No store and no file of our own — though see the acknowledgement latch below, which is state and is passed in explicitly rather than pretended away.

**Two lists, and the distinction is not optional.** Verified against the Firefox 137 `omni.ja` on this machine:

- `Downloads.getList(type)` takes a **required** type argument. Called with none it does not throw — `getList` ends in `return this._lists[type]`, so it resolves to `undefined` and the first `.addView()` is a `TypeError`. It is `Downloads.getList(Downloads.PUBLIC)`, and `PUBLIC` rather than `ALL` because `ALL` includes private-window downloads, which this feature never records (f4's rule, applied here).
- **Completed downloads are not persisted.** `DownloadIntegration.shouldPersistDownload()` returns `!stopped || hasPartialData || hasBlockedData` on desktop; its own comment says stopped downloads "are only retained in the browser history." So the live list is empty of finished transfers after every restart, and `keep = 50` would bound nothing. The panel source is **`DownloadHistory.getList({type: Downloads.PUBLIC, maxHistoryResults: keep})`**, which is Places-backed — the same list `DownloadsCommon` uses.

The widget subscribes to the live list; the panel reads the history list.

## 2. Exact behavior

**Widget** (`downloads`, event-driven, `refresh_s: 0` — re-rendered on download events, not polled, with a **trailing 500 ms coalesce** so N concurrent transfers can't drive N renders per progress tick): renders only when at least one transfer is in progress — `↓ <n> · <aggregate rate>`. Idle renders **empty**, not `↓ 0`. A widget that's always there is furniture; a widget that appears when something is happening is information.

A failed transfer leaves a single `↓ 1 failed` state until acknowledged. **That latch is state**, and since `aggregate()` is pure it cannot hold it — so it is passed in: `aggregate(downloads, {acknowledgedIds})` → `{active, bytesPerSec, failedCount}`, with the acknowledged set owned by glue and cleared when the panel opens. The alternative (deriving "failed" from the current list) makes "opening the panel clears it" impossible and leaves the widget stuck until Firefox drops the entry.

**Panel** — `:dl` opens the downloads source: `filename — host · <state>`, newest-first. State is `42% · 3.1MB/s`, `done`, `failed`, or `cancelled`.

**The row set is frozen for the panel's lifetime; only the state cell is live.** A transfer completing mid-keystroke must not remove or reorder a row, because r4's marks and selection are key-addressed and a destructive action (`cancel`, `delete file`) landing on a shifted row is exactly the failure the primitive exists to prevent — and x3 ranking would let a progress change reorder rows under the cursor. Live *text* in a stable row costs nothing and keeps r4's contract true.

**Actions** (`Tab`): open file, open containing folder, copy source url, retry (failed/cancelled only), cancel (in-progress only), remove from list, **delete file**. Delete-file confirms — it is the only action in any panel that destroys something outside the browser, and it is deliberately not the default action.

**Opening files**: "open file" hands off to the OS handler, and it is **not** the default action — reveal-in-folder is.

The claim that this is safe "because no argument the page influenced" would be false: the filename, hence the extension, hence the handler that executes, comes from the server's `Content-Disposition` or URL. `useDownloadDir = false` lets me pick the directory, not the extension. Firefox itself gates this behind `always_ask_before_handling_new_types` and its blocked/unblock path; inheriting none of that and asserting the risk away in prose is the kind of unbacked safety claim this project doesn't make. So `open file` takes the same confirm step as `delete file`.

Both are also registry commands — `dl_open(id)` and `dl_reveal(id)` — because the most dangerous action in the overlay must not be the one that escapes the `risk` annotation by living only as a panel closure. `dl_open` is `dangerous`.

**Notification** on completion is a **transient statusbar message** (`downloaded: <filename>`), never a system notification and never a popup — f6 suppresses web notifications during focus sessions, and it would be absurd for the browser itself to break that rule.

**TOML surface**:

```toml
[downloads]
enabled = true
keep    = 50     # rows retained in the panel list

[statusbar]
widgets = ["mode", "workspace", "focus", "url", "msg", "downloads", "ai", "clock", "date"]
```

New registry commands: `dl` (`read`), `dl_cancel`, `dl_retry`, `dl_clear`, `dl_reveal` (`mutate-local`), `dl_open`, `dl_delete_file` (`dangerous` — one executes a file the network chose the extension of, the other removes a file from disk; v2.1's agent policy must refuse both by default).

**Coupling worth knowing**: Firefox's `DownloadHistoryObserver` drops entries from the download list on `page-removed`, so p2's `forget` also removes the matching download row. Firefox's behavior, not ours, but named in both specs rather than discovered later.

## 3. Pure vs glue

- **`aether-downloads.sys.mjs`** (pure): `rows(downloads)` → panel rows with state strings; `aggregate(downloads, {acknowledgedIds})` → `{active, bytesPerSec, failedCount}`; `formatBytes(n)` / `formatRate(n)`; `formatState(download)`; `actionsFor(download)` → the legal action set for that state (the state machine in one place, so a cancel can never be offered on a finished transfer).
- **`aether-widgets.sys.mjs`**: `downloads` builtin rendering from `ctx.downloads`, empty when idle.
- **`aether-panel.sys.mjs`** (r4) / **`aether-match.sys.mjs`** (x3): reused; the panel calls `replaceRows` only on explicit actions, never on progress events.
- **`aether.uc.js`** (glue): `Downloads.getList(Downloads.PUBLIC)` subscription for the widget, `DownloadHistory.getList(...)` for the panel, the coalescing timer, the acknowledged set, the command implementations, OS handoff behind the confirm.

*(`Downloads.getSummary(type)` already returns `allHaveStopped`/`progressTotalBytes`/`progressCurrentBytes` and binds itself to a list. `aggregate` exists anyway because the acknowledgement latch and the empty-when-idle rule are ours and are unit-testable; the summary is used as the input where it fits.)*

## 4. Unit tests (behavioral) — `overlay/test/unit/p3-downloads.test.mjs`

1. `aggregate` with no downloads → `{active: 0}` and the widget renders **empty string** (asserted explicitly — the idle-invisibility rule)
2. `aggregate` sums rates across multiple in-progress transfers and ignores finished ones
3. the failed latch is real and testable: with a failed download and an empty `acknowledgedIds`, `failedCount` is 1 and the widget is non-empty; with that id acknowledged, it is 0 and the widget is empty — asserted through injected state, not through a pure function that cannot latch
4. `formatBytes`/`formatRate` across B/KB/MB/GB boundaries, zero, and absurd values; never `NaN`, never `undefined`
5. `formatState` for in-progress (percent + rate), indeterminate size (no percent, rate only), done, failed, cancelled
6. `actionsFor`: cancel offered only in-progress; retry only on failed/cancelled; open-file only on done — asserted for every state, so an illegal action is unreachable rather than merely hidden
7. `rows` newest-first, capped at `keep`, validating against x3's row shape
8. a download record with missing/malformed fields (no target, no size, hostile filename with newlines or ANSI) renders a row without throwing, and the filename is flattened to a single line
9. `formatState` and all copy pass the f6 lexicon sweep — a failed download is stated, never scolded

`overlay/test/unit/p3-config.test.mjs`:
10. config sync guard for `DEFAULTS.downloads` and the widget order incl. `downloads`
11. all seven commands in REGISTRY with descriptions; `dl_open` and `dl_delete_file` are both `dangerous`; every panel action maps to a command (r4's inventory rule)

## 5. Visual states — `overlay/test/visual/scenarios.d/j3-downloads.sh`

Against a local fixture server serving a slow file (no external network, per the f7 mock precedent):

1. **idle: no widget** — statusbar shot with the widget configured but nothing downloading; the slot is empty
2. **active** — download in flight: `↓ 1 · <rate>` visible
3. **panel with live progress** — `:dl` mid-transfer, two shots showing the percentage advancing
4. **completion** — transient `downloaded: <file>` in the statusbar; widget empty again; **no system notification** asserted via the same pref-evidence method f6 uses
5. **failed latches** — server killed mid-transfer: widget shows the failed state and holds it until the panel is opened
6. **delete and open both confirm** — each requires the confirm step; the file still exists, and nothing is executed, until it is given
7. **panel survives a restart** — download a fixture file, `relaunch_browser`, `:dl`: the finished transfer is still listed (the `DownloadHistory` path, proven — the live-list version of this feature shows an empty panel here)
8. **row set is stable under completion** — with three transfers in flight and the panel open, let one finish: the row stays in place with its state cell updated, and a mark set before the completion is still on the same file

## 6. Non-goals (budget protection)

- **No download manager UI** — no queue reordering, no bandwidth limits, no scheduling, no segmented downloading.
- **No auto-open of finished files**, no "always open this type" memory. An execution surface with a memory is an execution surface you forget you armed.
- **No system notifications, ever** — statusbar only.
- **No download history beyond `keep` rows**, and no persistence of our own; Firefox's list is the store.
- **No integration with external downloaders** (aria2, yt-dlp). Tempting, and it belongs in a mod (x2) or the daemon (d1), not the overlay.
- **No per-site download rules or auto-save directories** — the ask-every-time pref stays, deliberately.
