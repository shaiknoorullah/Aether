# d3 — Rules Engine + Auto-Registration (the work I never log)

## 1. Today → Instead → Thinnest

**Today**: a colleague asks for a PR review, I do it, and eighteen minutes vanish with no record. The interstitial work — reviews, a quick doc read, an incident glance, someone's Slack link — is the work that breaks flow *and* the work that never reaches taskwarrior, because creating a task for a two-minute interruption costs more than the interruption. So my time data is missing exactly the category that explains where my days go.

**Instead**: rules. A pattern over what the browser observes — url, dwell time, active workspace, running focus task — fires a template that writes a taskwarrior task and a timewarrior interval. **No AI in the common case**; the PR-review example is fully deterministic and needs none. The browser is the only thing in my stack positioned to see it.

**Thinnest**: the browser already emits everything needed. d1's event socket carries it to the daemon, a pure matcher evaluates rules over it, and two thin sinks shell out to `task` and `timew`. The overlay's contribution is an event stream it mostly already computes, plus a review surface for what got written.

## 2. Exact behavior

### The event stream

The overlay emits one event per meaningful transition, never per keystroke: `navigate` (top-level, with url/title/workspace), `tab_focus`, `idle_start`/`idle_end` (from Firefox's idle service), `focus_start`/`focus_end` with the task name (f6), and `workspace_switch`. Private windows emit **nothing** — f4's rule, extended to the whole pipeline.

The daemon derives *dwell* itself: time between a focus event and the next transition, minus idle. Dwell is never trusted from the browser, because a browser that crashes mid-interval would otherwise silently invent time.

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

- `match` is a **glob over host+path**, never a regex. Globs are readable at 2am; a regex in a config file is a debugging session waiting to happen.
- `min_dwell` prevents a passing glance from becoming a task.
- Captures come from named url segments (`{repo}`, `{pr}`) plus `{title}`, `{workspace}`, `{focus_task}`, `{date}`. An unresolved capture leaves the template literal rather than emitting `undefined`.
- `when` (optional) scopes a rule: `focus` (only during a focus session), `no_focus`, or a workspace name. The PR-review rule matters most *during* focus — that is exactly the interruption worth recording.
- First matching rule wins, in file order. No rule chaining, no priority field.

### What gets written

**timewarrior**: one interval `start`/`stop` with the rendered tags. **taskwarrior**: one task, created and immediately completed with `entry`/`end` set to the interval — because this is work that already happened, and creating an open task for a finished review is a to-do list that lies.

Both sinks are `exec` capability adapters (d1's grant model), shelling out to `task`/`timew` with argument arrays — never a shell string, so a title containing `;` or backticks cannot become a command. That is asserted in tests, not assumed.

### Dedupe and review

A rule fires **once per continuous engagement**, not per navigation: leaving a PR and coming back within `regroup` (default 10m) extends the existing interval instead of creating a second task. Without that, one review with three tab switches becomes three tasks and the data is worse than nothing.

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
1. glob matching: `github.com/*/pull/*` matches a PR url and not the repo root, the issues list, or a lookalike host (`github.com.evil.tld`)
2. `extractCaptures` pulls `{repo}` and `{pr}` from every PR url shape (files/checks/anchors), and yields nothing for a non-match
3. `renderTemplate` fills captures; an unresolved capture stays literal — never `undefined`, never empty
4. a title containing `{workspace}` in its *text* is not re-expanded (no recursive templating)
5. `min_dwell` below threshold → no fire; at threshold → fire (boundary asserted both sides)
6. `when = "focus"` fires only during a focus session; `no_focus` inverts; a workspace scope matches only that workspace
7. first-match-wins in file order, with two overlapping rules
8. `shouldRegroup`: a return within the window extends; beyond it, a new fire
9. hostile rules file (missing fields, wrong types, prototype keys) loads the valid rules and names the invalid ones rather than failing whole

`daemon/tests/sinks.rs`:
10. task/timew invocations are argv arrays; a description containing `;`, backticks, `$(…)`, newlines, and a leading `-` is passed as one argument and cannot alter the command
11. a failing `task` binary (absent, non-zero exit) is reported once, does not retry, and does not lose the timew interval
12. dwell excludes idle time: a 30m window with 20m idle yields 10m
13. a private-window event never reaches the matcher (asserted at the ingress boundary, not the sink)
14. crash safety: an interval open at daemon shutdown is closed at its last known event time, never left running or invented forward

## 5. Visual states — `overlay/test/visual/scenarios.d/k3-rules.sh`

Mock daemon with stub `task`/`timew` binaries logging their argv:

1. **rule fires** — navigate to a fixture PR url, dwell past the threshold: transient `logged:` line; stub log shows one task and one interval with the right tags
2. **below threshold** — brief visit: stub log gains nothing
3. **regroup** — leave and return within the window: still one interval, extended (asserted from argv)
4. **review panel** — `:tasks` shows the row with rule, description, duration, source
5. **delete removes both** — delete action; stub log shows the task deletion and interval removal
6. **pause rule** — pause, revisit, no fire; the panel says the rule is paused for the session
7. **injection attempt** — a fixture page titled `x"; rm -rf ~; echo "` fires a rule; argv log proves it arrived as a single argument

## 6. Non-goals (budget protection)

- **No AI in this spec.** Rules are deterministic. Labeling what rules can't reach is d4's job, and it is marked inferred there.
- **No regex matching**, no rule chaining, no priorities, no conditions beyond `match`/`min_dwell`/`when`. A rules DSL that grows conditions becomes a language nobody can debug.
- **No open tasks.** Everything written is already-completed work; forward-looking task creation is taskwarrior's own job.
- **No editing rules from the browser** — `rules.toml` in vim, like boosts and keymaps.
- **No calendar, Jira, Linear, or Slack sinks** in this pass; `task`/`timew` only. Another sink is one file, later.
- **No retroactive backfill** of history through rules. Rules see events from when they were written; inventing the past is d4's explicitly-marked-inferred territory.
- **No cross-device rule state** — the daemon that saw the event owns the write.
