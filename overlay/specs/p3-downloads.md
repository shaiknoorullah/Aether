# p3 — Downloads (a list and a widget, not a panel that pops)

## 1. Today → Instead → Thinnest

**Today**: `user.js` sets `browser.download.useDownloadDir = false`, so every download asks where to save — good — and then the file vanishes into a downloads panel attached to chrome that doesn't exist. In-progress downloads are invisible; finished ones are unfindable without a file manager. There is also no way to know a large download is still running while I work, which is the actual daily annoyance.

**Instead**: two surfaces, both existing. A **statusbar widget** that appears only while transfers are active (`↓ 2 · 14MB/s`) and disappears when they finish, and a **panel source** listing recent downloads with actions. Nothing ever pops open on its own.

**Thinnest**: Firefox's Downloads API already tracks every transfer with progress, target path, and completion state. This is a widget reading that list plus another r4 source over it. No store, no file, no state of our own.

## 2. Exact behavior

**Widget** (`downloads`, event-driven, `refresh_s: 0` — re-rendered on download events, not polled): renders only when at least one transfer is in progress — `↓ <n> · <aggregate rate>`. Idle renders **empty**, not `↓ 0`. A widget that's always there is furniture; a widget that appears when something is happening is information. A failed transfer leaves a single `↓ 1 failed` state until the panel is opened or the entry cleared, so a failure can't pass unnoticed — that is the one persistent state, and it is factual, not scolding.

**Panel** — `:dl` opens the downloads source: `filename — host · <state>`, newest-first. State is `42% · 3.1MB/s`, `done`, `failed`, or `cancelled`. In-progress rows update live while the panel is open (the one panel source with live rows; everything else is a snapshot).

**Actions** (`Tab`): open file, open containing folder, copy source url, retry (failed/cancelled only), cancel (in-progress only), remove from list, **delete file**. Delete-file confirms — it is the only action in any panel that destroys something outside the browser, and it is deliberately not the default action.

**Opening files**: "open file" hands off to the OS handler. This is an execution surface, so it is narrow by construction: it opens the file the browser itself downloaded, at the path it recorded, with no argument the page influenced. Nothing else in the overlay opens a local file.

**Notification** on completion is a **transient statusbar message** (`downloaded: <filename>`), never a system notification and never a popup — f6 suppresses web notifications during focus sessions, and it would be absurd for the browser itself to break that rule.

**TOML surface**:

```toml
[downloads]
enabled = true
keep    = 50     # rows retained in the panel list

[statusbar]
widgets = ["mode", "workspace", "focus", "url", "msg", "downloads", "ai", "clock", "date"]
```

New registry commands: `dl` (`read`), `dl_cancel`, `dl_retry`, `dl_clear` (`mutate-local`), `dl_delete_file` (`dangerous` — it removes a file from disk, and v2.1's agent policy must refuse it by default).

## 3. Pure vs glue

- **`aether-downloads.sys.mjs`** (pure): `rows(downloads)` → panel rows with state strings; `aggregate(downloads)` → `{active, bytesPerSec, anyFailed}` for the widget; `formatBytes(n)` / `formatRate(n)`; `formatState(download)`; `actionsFor(download)` → the legal action set for that state (the state machine in one place, so a cancel can never be offered on a finished transfer).
- **`aether-widgets.sys.mjs`**: `downloads` builtin rendering from `ctx.downloads`, empty when idle.
- **`aether-panel.sys.mjs`** (r4) / **`aether-match.sys.mjs`** (x3): reused.
- **`aether.uc.js`** (glue): `Downloads.getList()` subscription, widget re-render on events, live panel row updates while open, the action implementations, OS handoff for open-file.

## 4. Unit tests (behavioral) — `overlay/test/unit/p3-downloads.test.mjs`

1. `aggregate` with no downloads → `{active: 0}` and the widget renders **empty string** (asserted explicitly — the idle-invisibility rule)
2. `aggregate` sums rates across multiple in-progress transfers and ignores finished ones
3. `anyFailed` latches until cleared: a failed transfer keeps the widget non-empty even with no active transfers
4. `formatBytes`/`formatRate` across B/KB/MB/GB boundaries, zero, and absurd values; never `NaN`, never `undefined`
5. `formatState` for in-progress (percent + rate), indeterminate size (no percent, rate only), done, failed, cancelled
6. `actionsFor`: cancel offered only in-progress; retry only on failed/cancelled; open-file only on done — asserted for every state, so an illegal action is unreachable rather than merely hidden
7. `rows` newest-first, capped at `keep`, validating against x3's row shape
8. a download record with missing/malformed fields (no target, no size, hostile filename with newlines or ANSI) renders a row without throwing, and the filename is flattened to a single line
9. `formatState` and all copy pass the f6 lexicon sweep — a failed download is stated, never scolded

`overlay/test/unit/p3-config.test.mjs`:
10. config sync guard for `DEFAULTS.downloads` and the widget order incl. `downloads`
11. all five commands in REGISTRY with descriptions; `dl_delete_file` is `dangerous`

## 5. Visual states — `overlay/test/visual/scenarios.d/j3-downloads.sh`

Against a local fixture server serving a slow file (no external network, per the f7 mock precedent):

1. **idle: no widget** — statusbar shot with the widget configured but nothing downloading; the slot is empty
2. **active** — download in flight: `↓ 1 · <rate>` visible
3. **panel with live progress** — `:dl` mid-transfer, two shots showing the percentage advancing
4. **completion** — transient `downloaded: <file>` in the statusbar; widget empty again; **no system notification** asserted via the same pref-evidence method f6 uses
5. **failed latches** — server killed mid-transfer: widget shows the failed state and holds it until cleared
6. **delete confirms** — delete-file requires the confirm step; the file still exists until it is given

## 6. Non-goals (budget protection)

- **No download manager UI** — no queue reordering, no bandwidth limits, no scheduling, no segmented downloading.
- **No auto-open of finished files**, no "always open this type" memory. An execution surface with a memory is an execution surface you forget you armed.
- **No system notifications, ever** — statusbar only.
- **No download history beyond `keep` rows**, and no persistence of our own; Firefox's list is the store.
- **No integration with external downloaders** (aria2, yt-dlp). Tempting, and it belongs in a mod (x2) or the daemon (d1), not the overlay.
- **No per-site download rules or auto-save directories** — the ask-every-time pref stays, deliberately.
