# d3 — Rules Engine + Auto-Registration (the work I never log)

## 1. Today → Instead → Thinnest

**Today**: a colleague asks for a PR review, I do it, and eighteen minutes vanish with no record. The interstitial work — reviews, a quick doc read, an incident glance, someone's Slack link — is the work that breaks flow *and* the work that never reaches taskwarrior, because creating a task for a two-minute interruption costs more than the interruption. So my time data is missing exactly the category that explains where my days go.

**Instead**: rules. A pattern over what the browser observes — url, dwell time, active workspace, running focus task — fires a template that writes a taskwarrior task and a timewarrior interval. **No AI in the common case**; the PR-review example is fully deterministic and needs none. The browser is the only thing in my stack positioned to see it.

**Thinnest**: the browser already emits everything needed. d1's event socket carries it to the daemon, a pure matcher evaluates rules over it, and two thin sinks shell out to `task` and `timew`. The overlay's contribution is an event stream it mostly already computes, plus a review surface for what got written.

## 2. Exact behavior

### The event stream

The overlay emits one event per meaningful transition, never per keystroke: `navigate` (top-level, with url/title/workspace), `tab_focus`, `idle_start`/`idle_end` (from Firefox's idle service), `focus_start`/`focus_end` with the task name (f6), and `workspace_switch`. Private windows emit **nothing** — f4's rule, extended to the whole pipeline.

The daemon derives *dwell* itself: time between a focus event and the next transition, minus idle. But moving the subtraction daemon-side does **not** by itself prevent invented time — a dead browser sends neither the next transition nor the `idle_start` that would bound it. Crash at 14:00 on a PR, relaunch at 18:00, and the open engagement closes on the first new event as a four-hour review. A closed lid does sixteen hours. So, explicitly:

- Dwell is measured on **`CLOCK_MONOTONIC`**, and a divergence against `CLOCK_BOOTTIME` detects suspend and closes the engagement at the suspend point.
- A **wall-clock jump** beyond a threshold (NTP step, DST) is an engagement boundary, not a duration; `end < start` can therefore never be emitted.
- **WebSocket disconnect closes all open engagements** at the last event timestamp — the browser dying is a boundary, not a pause.
- A hard **`max_dwell`** (default 2h) beyond which the engagement is closed and marked, never written as one span.
- All timestamps are persisted as UTC instants; local time is a rendering concern.

Combined with retroactive `timew track` (below), nothing is ever left open, so SIGKILL/OOM/power-loss cannot leave an interval accruing.

### Rules

```toml
# ~/.config/aether/rules.toml
[[rules]]
name      = "pr-review"
match     = "github.com/*/pull/*"
min_dwell = "3m"
task      = "review {repo}#{pr}: {title}"
tags      = ["review", "interrupt"]
project   = "{repo}"
timew     = true
```

- `match` uses **named segments over host+path**, anchored at both ends, and a segment never crosses `/`: `github.com/{owner}/{repo}/pull/{pr}`. Not a regex — globs are readable at 2am and a regex in a config file is a debugging session waiting to happen — and not positional `*` either, since the template refers to captures *by name* and `github.com/*/pull/*` does not even match a real PR URL (`owner` and `repo` are two segments, not one). Anchoring matters in both directions: unanchored, `evil.com/github.com/x/pull/1` would match and let a hostile page drive rule fires at will.
- `min_dwell` prevents a passing glance from becoming a task.
- Captures are the named segments plus `{title}`, `{workspace}`, `{focus_task}`, `{date}`. An unresolved capture leaves the template literal rather than emitting `undefined`, and a captured value is never re-expanded (no recursive templating).
- `when` (optional) scopes a rule: `focus` (only during a focus session), `no_focus`, or a workspace name. The PR-review rule matters most *during* focus — that is exactly the interruption worth recording.
- First matching rule wins, in file order. No rule chaining, no priority field.

### What gets written

**timewarrior: retroactive closed intervals only — never `start`/`stop`.** `timew start` is not additive; it **closes whatever interval is currently open**. So a rule firing while I am hand-tracking `deep-work` would silently stop my own tracking and never resume it, and my later `start` would close the daemon's, and its eventual `stop` would close mine. Instead the sink emits `timew track <start> - <end> <tags>` once the engagement has ended. This also deletes the whole crash-with-an-open-interval class. `:adjust` is **never** passed, because it modifies or deletes overlapping intervals; an overlap refusal surfaces rather than being swallowed.

**taskwarrior: one `task import` of a JSON document**, not `task add` followed by `task done`. Two reasons, both load-bearing:

1. **argv does not stop injection here.** The threat is not the shell — it is taskwarrior's own command-line DSL, which parses attribute tokens *anywhere* in the argument list, including `rc.<name>:<value>` config overrides. A page titled `Fix the parser rc.data.location:/tmp/x` writes the task into a throwaway data directory; `status:deleted` creates a pre-deleted task; `depends:1,2,3` mutates unrelated real tasks; `rc.hooks:off` skips my sync hooks. GitHub, Jira and Grafana titles contain colons routinely — no malice required. `task import` takes a JSON document with `description`, `entry`, `end` and `status`, with no parser between page text and the record.
2. **ids are positional and renumber.** `task add` then `task done` is two invocations; run `task 7 done` in a terminal between them, or let a second rule fire, and the daemon completes *your* task. `import` sets the UUID itself, so there is no id round-trip at all.

If the CLI grammar is ever used instead, the floor is `task add --` plus rejection of any rendered token matching `^rc\.` or `^[a-z_]+:`.

Both sinks are `exec` capability adapters (d1's grant model) and invoke argv arrays, never shell strings — necessary, and by itself not sufficient.

**Timewarrior intervals have no stable identity.** There is no per-interval UUID, and `@N` shifts as intervals are added — so the review panel's delete must re-resolve the interval by exact start-time plus tag match immediately before deleting, and abort if zero or more than one match. Stated plainly here because a stale `@3` deletes an interval I recorded by hand.

**A journal, because the panel needs one.** `journal.rs` appends `{fire id, rule, task uuid, interval start, tags, source url}`, fsynced on write. `:tasks` and its delete are scoped strictly to journal rows — otherwise a daemon restart makes the day's writes unreviewable (exactly when I most need them), or the panel re-queries by tag and its delete destroys tasks I created myself. The journal also gives crash recovery its checkpoint.

### Dedupe and review

A rule fires **once per continuous engagement**, not per navigation: leaving a PR and coming back within `regroup` (default 10m) extends the existing interval instead of creating a second task. Without that, one review with three tab switches becomes three tasks and the data is worse than nothing.

**Engagement identity is `(rule name, capture tuple)` — never the rendered description, and never `{title}`.** GitHub prefixes `document.title` with a notification count that changes several times during an 18-minute review; keying on the rendered string would turn one review into four tasks, while keying on the rule alone would collapse two PRs open in two tabs into one interval attributed to the wrong one. `{title}` is description text, not identity — it is page-controlled and volatile.

**Per-rule fire budget** (default 20/hour): a SPA pushing distinct paths, or any page driving repeat matches, self-pauses the rule at the cap and the panel says which rule and why. Without a cap the only defence is noticing and running `pause rule` by hand.

`:tasks` opens a panel listing what the rules wrote today, newest-first, each row showing rule, task, duration, and source url. Actions: open the url, edit the task description, **delete** (removes both the task and the interval), and `pause rule` (disables that rule for the session). A rule that fires wrongly must be killable in one keystroke *at the moment I notice it*, or I will disable the whole feature instead.

**Nothing is written silently and invisibly**: each write shows one transient statusbar line (`logged: review aether#12 · 18m`). Informational, factual, no praise and no judgement — f6's lexicon covers it.

**TOML surface** (overlay): none new beyond `[daemon]`. Rules live in `rules.toml` next to the daemon config, hand-edited, git-committable like everything else.

New registry commands: `tasks` (`read`), `rule_pause`, `task_delete` (`mutate-local`).

## 3. Pure vs glue

- **`aether-rules.sys.mjs`** — shared *logic definition*, implemented pure on both sides; the overlay copy powers the panel's preview and the test suite: `matchRule(rules, event)` → first match or null; `renderTemplate(tpl, captures)`; `extractCaptures(pattern, url)`; `shouldRegroup(lastFire, now, window)`.
- **daemon (Rust)**: `rules.rs` (the authoritative matcher, mirroring the same test fixtures), `sinks/task.rs`, `sinks/timew.rs` (argv-only exec), `dwell.rs` (idle-aware accumulation).
- **`aether.uc.js`** (glue): the event emitters — reusing b1's existing top-level navigation hook and f6's focus-session state rather than adding listeners.

## 4. Unit tests (behavioral)

`overlay/test/unit/d3-rules.test.mjs` (fixtures shared verbatim with the Rust suite):
1. `github.com/{owner}/{repo}/pull/{pr}` matches a real PR url and **not** the repo root, the issues list, an extra-segment url, a suffix lookalike (`github.com.evil.tld`), or a **prefix** lookalike (`evil.com/github.com/x/pull/1` — the anchoring guard, which the suffix test alone does not cover)
2. `extractCaptures` pulls `{owner}`, `{repo}` and `{pr}` from every PR url shape (files/checks/anchors), and yields nothing for a non-match; a segment never crosses `/`
3. `renderTemplate` fills captures; an unresolved capture stays literal — never `undefined`, never empty
4. a title containing `{workspace}` in its *text* is not re-expanded (no recursive templating)
5. `min_dwell` below threshold → no fire; at threshold → fire (boundary asserted both sides)
6. `when = "focus"` fires only during a focus session; `no_focus` inverts; a workspace scope matches only that workspace
7. first-match-wins in file order, with two overlapping rules
8. `shouldRegroup` keyed on `(rule, captures)`: a return within the window extends; beyond it, a new fire; **a changed `{title}` on the same url does not create a second engagement** (the GitHub notification-count case, pinned)
9. hostile rules file (missing fields, wrong types, prototype keys) loads the valid rules and names the invalid ones rather than failing whole
10. the fire budget self-pauses a rule at the cap and reports which rule

`daemon/tests/sinks.rs`:
11. **DSL injection**: a title of `rc.data.location:/tmp/pwn project:secret status:deleted +hacked depends:1,2` produces a task whose `description` is that literal string and whose `project`, `status` and `depends` are **unchanged** — asserted on the resulting task's *fields*, not on argv. (An argv-only test passes on day one while this is wide open, which is why the old fixture is replaced.)
12. timewarrior tags containing `:adjust`, `:fill`, `@1` and `:week` are inert; `:adjust` is never passed
13. a failing `task` binary (absent, non-zero exit) is reported once via the daemon's own swept message, does not retry, does not lose the timew interval, and never renders taskwarrior's stderr in chrome
14. dwell excludes idle time: a 30m window with 20m idle yields 10m
15. a private-window event never reaches the matcher (asserted at the ingress boundary, not the sink)
16. **crash safety, the real cases**: a WS disconnect closes open engagements at the last event timestamp; a `CLOCK_BOOTTIME` divergence closes at the suspend point; a backward wall-clock step never yields `end < start`; an engagement exceeding `max_dwell` is capped and marked. Graceful shutdown alone is not the failure being defended against
17. two writes never share an id: `task import` sets the UUID and the journal records it, so a concurrent user-run `task` command cannot be targeted by the daemon's completion

## 5. Visual states — `overlay/test/visual/scenarios.d/k3-rules.sh`

Mock daemon with stub `task`/`timew` binaries logging their argv:

1. **rule fires** — navigate to a fixture PR url, dwell past the threshold: transient `logged:` line; stub log shows one task and one interval with the right tags
2. **below threshold** — brief visit: stub log gains nothing
3. **regroup** — leave and return within the window: still one interval, extended (asserted from argv)
4. **review panel** — `:tasks` shows the row with rule, description, duration, source
5. **delete removes both** — delete action; stub log shows the task deletion and interval removal
6. **pause rule** — pause, revisit, no fire; the panel says the rule is paused for the session
7. **injection attempt** — a fixture page titled `rc.data.location:/tmp/pwn project:secret status:deleted +hacked`; the scenario asserts the created task's *fields* are untouched and its description is the literal title, and that `/tmp/pwn` was never created

## 6. Non-goals (budget protection)

- **No AI in this spec.** Rules are deterministic. Labeling what rules can't reach is d4's job, and it is marked inferred there.
- **No regex matching**, no rule chaining, no priorities, no conditions beyond `match`/`min_dwell`/`when`. A rules DSL that grows conditions becomes a language nobody can debug.
- **No open tasks.** Everything written is already-completed work; forward-looking task creation is taskwarrior's own job.
- **No editing rules from the browser** — `rules.toml` in vim, like boosts and keymaps.
- **No calendar, Jira, Linear, or Slack sinks** in this pass; `task`/`timew` only. Another sink is one file, later.
- **No retroactive backfill** of history through rules. Rules see events from when they were written; inventing the past is d4's explicitly-marked-inferred territory.
- **No cross-device rule state** — the daemon that saw the event owns the write.
