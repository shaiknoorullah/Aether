# a3 — The Focus Nudge (an offer, never a verdict)

## 1. Today → Instead → Thinnest

**Today**: I start a focus session on a task, and forty minutes later I'm reading something unrelated with no memory of the transition. f6 gives me the task name in the statusbar, which helps only if I look at it — and the moment attention has drifted is precisely the moment I'm not looking at the statusbar.

**Instead**: while a focus session is running, the browser can notice that I've drifted from the task I named and make **one** offer — go back, capture this for later, or stay. Not a timer, not an alert, not a count.

**Thinnest**: the signals already exist. f6 knows the task, f5 knows the workspace, d3's event stream knows dwell and navigation, d4's segmenter knows what a coherent block looks like. The nudge is a small classifier over that stream plus one panel. What is *not* thin, and what most of this spec is about, is the constraint set — because this is the one feature in Aether that can hurt me if it's built carelessly.

## 2. Exact behavior

### It only exists inside a focus session

No `:focus <task>` running means no classification, no model call, no nudge, nothing observed for this purpose. That is the toggle, it already exists, and it means the browser is never watching me by default — I armed it, for a task I named, and it disarms when I run `:done`.

`[focus] nudge = false` by default on top of that. Two switches, both mine.

### What triggers it

Drift, not duration. A candidate nudge requires **all** of:

1. dwell past `nudge_after` (default 4 minutes) on content unrelated to the task,
2. relatedness below threshold — deterministic signals first: same workspace, same host as the task's earlier activity, a domain in the task's own history. Only if those are inconclusive does a local-model call classify the current title/host against the task name (`[ai]` rules, loopback, off-switch honored),
3. no nudge already offered this session.

**Hyperfocus is not deviation.** Three hours in one place is never a trigger — long dwell *on task* is the thing I'm protecting, and any rule that interrupts it would make this feature a net negative. There is no upper bound on time-on-task, deliberately, and there is no "you've been here a while" nudge of any kind.

### What it looks like

One line in the statusbar's message slot, r2-faded in, no sound, no popup, no focus steal:

```
still on “rebase drill”?  ↵ back  ·  c capture  ·  esc stay
```

- `↵` returns to the last tab attributed to the task.
- `c` captures the current page — bookmark plus a `later` tag (p1), or a d3-style task record — and *then* returns me. This is the half that matters most: the interruption is usually a real thing I'll need, and the reason drift persists is that going back means losing it. Capture removes the cost of returning.
- `esc` dismisses. **One offer per session, and dismissal ends it** — no second nudge, no re-arming after N minutes, no escalation.

### What is structurally impossible

Not guidelines — properties enforced by tests, because good intentions decay under future edits:

- **No counting.** The nudge writes no counter, no history, and no field that could later be aggregated into "times distracted." There is nothing for a future report to shame me with, because the data does not exist.
- **No language of judgement.** Every string passes f6's lexicon sweep, including model output — a classifier reply is used as a boolean, never rendered, so a model cannot phrase anything at me.
- **No streaks, no scores, no "focus quality," no daily summary of drift.**
- **No blocking.** The nudge never prevents navigation, never closes a tab, never enforces a list. Commitment-device locks are a separate, later, explicitly-opt-in feature; conflating them here would turn an offer into a cage.

### It can be wrong, and that's fine

A false positive costs one dismissed line. That budget is what allows a simple classifier instead of an elaborate one — and it's why there's exactly one offer per session, since a system that's occasionally wrong and *repeatedly* interrupting is one I would disable within a week.

**TOML surface**:

```toml
[focus]
nudge       = false
nudge_after = "4m"
capture_tag = "later"
```

New registry commands: `nudge_back`, `nudge_capture`, `nudge_dismiss` — all `read`/`navigate`/`mutate-local`, and **none `agent`-callable** (a1's `agent: false`). An agent that can synthesize a nudge is an agent that can manufacture my attention, which is the one thing this feature must never become.

## 3. Pure vs glue

- **`aether-nudge.sys.mjs`** (pure): `relatedness(task, {host, title, workspace, taskHistory})` → `{score, basis, needsModel}` — deterministic signals, with the model call as an explicit fallback rather than the default path; `shouldNudge(state, event, cfg, now)` → boolean, total and testable with an injected clock; `nudgeState(state, action)` — the one-offer-per-session machine.
- **`aether-strings.sys.mjs`**: nudge copy — sweep target, and the sweep is extended with a nudge-specific word list (`distracted`, `off-task`, `focus score`, `procrastinat*`).
- **`aether.uc.js`** (glue): subscribes to the existing f6 session state and d3 events; renders into the existing message slot; the capture action calls p1's `add`.

## 4. Unit tests (behavioral) — `overlay/test/unit/a3-nudge.test.mjs`

1. no focus session → `shouldNudge` is false for every event, including ones that would otherwise trigger (the arming rule, asserted first because everything else depends on it)
2. `nudge = false` → false even inside a session
3. dwell below `nudge_after` → false; at the boundary → true (injected clock, never wall-clock)
4. **long dwell on related content never triggers, at any duration** — asserted at 30m, 3h and 8h, so the hyperfocus rule can't regress into a time-based nudge
5. once offered, no second nudge fires for the remainder of the session regardless of subsequent drift; `:done` then a new `:focus` re-arms
6. dismissal is terminal for the session — asserted separately from (5), since "offered" and "dismissed" are different states that must both latch
7. `relatedness`: same workspace and same host as task history score related without a model call; `needsModel` is true only when deterministic signals are inconclusive (asserted, so the common path stays local and free)
8. `nudgeState` is append-only in the sense that matters: the module exports **no** counter, tally, or history accessor — an inventory assertion, so a future "just track how often" edit fails CI
9. a model reply is consumed as a boolean; a reply containing prose is never propagated into any rendered string (asserted with a sentinel reply)
10. every nudge string passes the extended lexicon sweep, including the capture and dismiss labels
11. `nudge_capture` produces a bookmark with the configured tag and returns the prior tab (both effects asserted, since capture-without-return leaves me where I drifted)
12. all three nudge commands are marked `agent: false` in the registry

## 5. Visual states — `overlay/test/visual/scenarios.d/l3-nudge.sh`

1. **no session, no nudge** — drift on fixture pages past the threshold with no focus session: nothing appears, and the mock gateway log gains zero entries
2. **the offer** — `:focus rebase drill`, then drift: the single line appears in the message slot, faded in, page focus unchanged (asserted: typing still goes to the page)
3. **back** — `↵` returns to the task's prior tab
4. **capture then back** — `c`: bookmark written with the `later` tag (file asserted) *and* the prior tab restored
5. **one offer only** — dismiss, drift again for twice the threshold: nothing appears
6. **hyperfocus** — 3h of simulated on-task dwell (clock injected via the harness): no nudge, ever
7. **AI off** — with `[ai] enabled = false`, deterministic relatedness still works and inconclusive cases simply don't nudge — mock log gains zero entries

## 6. Non-goals (budget protection)

- **No timers.** Not pomodoro, not countdowns, not time-boxing. f6's identity, restated because this is where it would leak back in.
- **No counting, tallying, scoring, or reporting of drift.** The data is never created.
- **No blocking, no site lists, no enforcement.** An offer, always.
- **No escalation, no repeat nudges, no snooze-and-return.** One per session.
- **No notifications** — statusbar message slot only, and f6 is busy suppressing web notifications during sessions anyway.
- **No cross-session learning** of what distracts me. A model of my weaknesses is exactly the artifact that becomes a shame machine two versions later.
- **No agent-initiated nudges** — not callable, by annotation.
- **No "you're doing great" either.** Praise is judgement with a friendly face, and it invites its opposite.
