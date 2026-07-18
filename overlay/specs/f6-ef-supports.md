# f6 — EF Supports (task-conditioned focus, ambient time, non-shaming guarantee)

## 1. Today → Instead → Thinnest

**Today**: the browser knows nothing about what I'm doing. Focus lives in my head and dies on the first notification; time is invisible (the clock widget exists, the date doesn't render by default); "focus tools" everywhere else are timers that kill hyperfocus and manufacture shame. Nothing guarantees the copy in my own chrome won't drift into fail/streak language.

**Instead**: a focus *session* — started by naming a task, ended only by me saying `:done` or by switching workspaces (a workspace switch *is* a context end). Never a countdown, never auto-expiry, never a streak, never a stat that can be "failed". While a session is active the statusbar shows the task plus calm elapsed time (ambient anchoring, not a deadline) and web notifications are suppressed. The date joins the clock in the default bar. All EF copy lives in one strings module, and a unit test makes the non-shaming guarantee mechanical: a banned lexicon can never appear in any string in the overlay.

**Thinnest**: one pure module `aether-focus.sys.mjs` (session model + elapsed formatting + suppression predicate), one pure `aether-strings.sys.mjs` (EF copy, the lexicon test target), a `focus` builtin in `aether-widgets.sys.mjs`, two registry entries, and ~20 lines of glue in `aether.uc.js` (commands, ctx, one pref flip with a crash-safe restore marker). No new services, no new files on disk, no persistence.

## 2. Exact behavior

**Session**: `{task, workspace, startedAt}` — at most one, in-memory, per window (same scope as f5's model).

- **`:focus <task>`** — starts a session bound to the *active workspace*. Multi-word tasks are the joined args (same rule as `:ws`). Transient statusbar message: `focus: <task>`. Starting while a session is active **replaces** it (new task, new `startedAt`) — changing my mind is a switch, not a failure.
- **`:done`** — ends the session. Transient message: `done: <task>` — factual echo, **no duration, no summary, no judgment**; the widget just empties. `:done` with no session → neutral message `no focus session`, nothing else happens.
- **Workspace switch ends the session** (`:ws` to a different workspace, `gw`/`:ws_next` when it lands elsewhere). Switching to the workspace the session is already bound to is a no-op. Quiet end: same `done: <task>` message path. Esc, tab churn, navigation, restarts: none of these end or judge a session; a browser restart simply starts with no session (nothing persisted, nothing "lost").
- **Elapsed formatting** (decided here, calm and factual): `<1m` for the first minute, then floored minutes `34m`, then `2h 7m` from one hour (no zero-pad, no seconds — a seconds tick is a timer). No cap, no color change, no warning styling at any duration. Long is just long.
- **Statusbar**: new `focus` builtin — `class: aether-focus`, `refresh_s: 30` (rides the existing scheduler with the clock), renders `STRINGS` copy `"<task> · <elapsed>"` from `ctx.focus = {task, startedAt}` + `ctx.nowMs`; no session → empty text (an empty slot, never a placeholder). `date` (already a builtin from f2) joins the default widget order — ambient time anchoring is clock **and** date, on by default.
- **Notification suppression**: while a session is active and `[focus] quiet_notifications = true`, glue flips `dom.webnotifications.enabled` to `false`; on end it restores the pre-session value. Crash-safe: before flipping, glue writes the original value to marker pref `aether.focus.notif_restore`; end-of-session, window unload, and startup all restore-and-clear the marker if present, so a crash mid-session can't leave notifications off forever. Every restore path stands down while *another* window holds a live session — opening or closing a second window must never silently undo a live session's suppression (this stand-down is the one multi-window rule f6 carries; see §6). The pure module owns only the predicate (`notificationsSuppressed(session, config)`); the pref itself is glue.
- **Language guarantee**: `aether-strings.sys.mjs` exports all f6 user-visible copy (`focusStartedMessage`, `doneMessage`, `NO_SESSION_MESSAGE`, `focusWidgetText`, `formatElapsed` consumers). A lexicon test asserts the banned stems — `fail`, `streak`, `wasted`, `behind`, `should have`, `procrastinat` — appear in **no string or template literal in any `overlay/chrome/JS/*.{sys.mjs,js}` file and no CSS `content:` value**. No allowlist: the ~11 existing console strings containing "failed" (`aether-config`, `aether-actors`, `aether-content-parent`, both services, and six in `aether.uc.js`) get reworded (`"could not …"` phrasing) so the sweep holds with zero exceptions. Comments are exempt — the sweep reads literals, not prose.

**Keybindings**: none added or changed. `:focus` / `:done` are palette-only; the palette *is* the keyboard surface.

**TOML surface** (defaults in `aether-config.sys.mjs` stay in sync with `overlay/config/aether.toml`; f0/f2/f5 sync guards extend):

```toml
[focus]
quiet_notifications = true   # suppress web notifications during a session; restored on end

[statusbar]
widgets = ["mode", "workspace", "focus", "url", "msg", "clock", "date"]  # focus + date join
```

New registry commands: `focus` (min 1, usage `focus <task>`), `done`.

## 3. Pure vs glue

- **`aether-focus.sys.mjs`** (pure, Node-testable — no Services/prefs/DOM/`Date.now`; time injected): `startSession(task, workspace, nowMs)` → session (trimmed task); `endSession(session)` → `{ended}` or null-shape for glue's message choice; `onWorkspaceSwitch(session, newWorkspace)` → surviving session or ended one; `formatElapsed(startedAt, nowMs)`; `notificationsSuppressed(session, config)`.
- **`aether-strings.sys.mjs`** (pure): all f6 copy constants/functions above. Nothing else imports copy from anywhere else for f6 surfaces.
- **`aether-widgets.sys.mjs`** (pure): `focus` builtin (imports `formatElapsed` + `focusWidgetText`); `date` gains no code — only the default order changes in config.
- **`aether-palette.sys.mjs`** (pure): `focus`/`done` REGISTRY entries.
- **`aether-config.sys.mjs`**: `DEFAULTS.focus`, new default widget order; reworded console copy.
- **`aether.uc.js`** (glue, not unit-tested): `focus`/`done` command impls; session field on the Aether instance; `ctx.focus` into the widget ctx; workspace-switch hook calls `onWorkspaceSwitch`; pref flip + `aether.focus.notif_restore` marker write/restore (start, end, unload, startup); transient messages via `showMessage`.

## 4. Unit tests (behavioral)

`overlay/test/unit/f6-focus.test.mjs`:
1. `startSession` binds task (trimmed, multi-word preserved), active workspace, and injected `nowMs`
2. starting a session while one is active replaces it — new task and new `startedAt`, old session gone, no error shape
3. `endSession` on an active session ends it; ending with no session yields the no-session shape (glue's neutral-copy path), never a throw
4. `onWorkspaceSwitch` to a different workspace ends the session; to the session's own workspace the session survives untouched
5. `formatElapsed`: 0s and 59s → `<1m`; 60s → `1m`; 34m boundary values floor correctly; 59m → `59m`; 60m → `1h 0m`; 127m → `2h 7m`; a 9-hour value renders plainly (`9h 0m`) with no cap or special casing
6. `notificationsSuppressed`: true only for (active session ∧ `quiet_notifications` true); false for no session, and false for config off even mid-session
7. `focus` widget render: session in ctx → task + elapsed via `ctx.nowMs`, class `aether-focus`; no `ctx.focus` → empty text, never "undefined" or placeholder copy
8. `focus` widget joins the scheduler: with clock (30) and date (300) present, `periodMs` stays 30s and `focus` comes due on its own 30s deadline
9. palette: `focus` and `done` in REGISTRY; `parse("focus deep work on spec")` → args joined by glue rule (all tokens preserved); `parse("focus")` → unknown-with-usage; `parse("done")` → runnable with no args
10. config sync guard: `DEFAULTS.focus.quiet_notifications` = true and default widget order includes `focus` and `date`; example `overlay/config/aether.toml` parses to exactly the defaults (f0 pattern)

`overlay/test/unit/f6-strings.test.mjs`:
11. every export of `aether-strings.sys.mjs` (constants, and functions invoked with representative args) is non-empty, echoes the task where applicable, and contains no banned stem
12. lexicon sweep: every string/template literal in every `overlay/chrome/JS/*.sys.mjs` + `aether.uc.js`, and every CSS `content:` value in `overlay/chrome/*.css`, is free of `fail|streak|wasted|behind|should have|procrastinat` (case-insensitive, stem match, zero allowlist)
13. `doneMessage(task)` contains the task and no duration digits — ending is an echo, not a report card

## 5. Visual states — `overlay/test/visual/scenarios.d/f6-ef-supports.sh`

1. focus session active: statusbar shows task + elapsed, calm styling (`:focus write f6 spec`, shot of `aether-focus` next to workspace/clock/date)
2. session ended via `:done` — no summary judgment, just back to normal (widget empty, transient `done: …` message, then bar at rest)
3. notification pref suppressed during session (log or about:config evidence: `dom.webnotifications.enabled` false mid-session, restored after `:done` — browser.log or an about:config shot)

00-spike and f1–f5 scenarios keep passing (f2/f5 scenarios pin their own widget TOML, so the default-order change is validated only where defaults are actually under test).

## 6. Non-goals (budget protection)

- **No timers, countdowns, pomodoro, break reminders, or auto-expiry — ever.** This is the feature's identity, not a deferral.
- No session history, stats, totals, logs, or review surfaces — a session that ended is gone; there is nothing to fail, so nothing is stored.
- No session persistence across restart — restart starts clean; only the pref restore marker survives (safety, not state).
- No tab filtering/blocking/graying during focus — f5 workspaces already scope the tab set; the session binds to a workspace and adds nothing on top.
- No site blocklists, no "distraction" classification, no idle detection, no on-device sensing of any kind this pass.
- No OS-level DND integration; suppression is one Firefox pref. Suppressed means dropped, not queued for later (a deferred pile is a shame pile).
- No new keybindings, no configurable elapsed format or per-task config. No multi-window semantics beyond the §2 restore stand-down (sessions stay per-window; the pref guard only keeps window churn from undoing a live session's suppression).
- The strings module holds f6 copy only — migrating f1–f5 copy constants into it is not this feature; the lexicon sweep already covers them where they live.
