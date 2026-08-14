# a1 — Agent Control Plane (the registry is the API)

## 1. Today → Instead → Thinnest

**Today**: f7's sidebar is a chat box. It can talk about the browser and do nothing to it. Every "AI browser" that fixed that did it by giving a model a bespoke automation API — a second implementation of the UI that drifts from the real one, feature by feature, until half the browser is unreachable and the other half behaves differently when the agent does it.

**Instead**: **everything I can do is already a registry command.** Keys dispatch registry commands, the palette runs registry commands, mods define registry commands. So the agent's tool list is a *projection of the registry*, not a parallel surface — the agent calls `tab_close`, which is the same function my `x` key calls, with the same tests, the same permissions, and the same log entry.

**Thinnest**: a serializer from the registry to a tool schema, a consent policy that reads the `risk` classes x1 already put on every command, a taint flag, and an append-only action log. The agent runtime is small precisely because the API was built accidentally over three versions.

## 2. Exact behavior

### The projection

`GET` the registry → `[{name, description, args, risk}]`. Descriptions are the same strings r3's which-key and r5's settings panel render — written once, read by three surfaces, and therefore actually maintained. This is exposed over decision #2's MCP layer, so the tool list is generated at startup rather than hand-maintained; a command added by a mod is agent-callable the moment it loads, with no agent-side work.

### Transport

The MCP endpoint is a listening socket that dispatches registry commands, so it is the most powerful surface in the project and it inherits **d1's rules verbatim**: bearer token in a `0600` file compared in constant time, any request carrying an `Origin` header rejected, `Host` a loopback literal, bind `127.0.0.1` and not configurable, `Content-Type: application/json` required. Specifying a transport for the daemon — which only reads media state and task lists — and leaving it unspecified here would be exactly backwards. The unix-socket option d1 weighs applies here with more force.

And the rule that makes the rest of this spec true: **every MCP tool call materializes a plan and is subject to the same render-and-approve gate as a sidebar-originated one.** There is no direct dispatch path from MCP to the dispatcher. Without that sentence the natural implementation calls tools directly, the plan gate lives only in the sidebar, and any local process — or any page that can reach the port — runs whatever the policy leaves at `auto`.

### Opting out

`agent: false` is the only mechanism policy cannot reach, so it carries everything whose loss would be unrecoverable or self-amplifying:

- `crypto_decrypt`, `crypto_encrypt`, `mod_install`, **`mod_enable`**, `daemon_rotate`
- **`agent_on`, `perception_on`, `action_on`** — an agent that can widen its own capabilities has no meaningful permission model, and a1 §6 states that principle while a2 leaves those commands unannotated. The `_off` variants stay callable: dropping capability is always safe.
- **`plan_save`, `plan_run`** — see below.
- `ai_on`/`ai_off`, since a conversation reset would otherwise clear taint.
- a3's three `nudge_*` commands.

### Consent

Policy is data, in my config, and it reads the risk classes:

```toml
[agent.consent]
read          = "auto"
navigate      = "auto"
mutate-local  = "confirm"
mutate-remote = "confirm"
dangerous     = "never"
```

Three resolutions: `auto` (run, log it), `confirm` (a single-line prompt naming the command and its arguments; `Enter` runs, anything else declines), `never` (refuse, name the class, no prompt — so a `never` command can't be socially engineered through repetition).

**Non-builtin commands are floored at `confirm`, not merely at `mutate-local`.** x1's `riskFloor` operates in risk-class space, and the consent that class receives is whatever my policy says — so a user who sets `mutate-local = "auto"` in week three (a plausible, friction-driven edit) removes the floor's entire protection for exactly the population it exists for: mod- and script-defined commands. The floor is therefore expressed in *consent* space and is un-lowerable, the same shape a2 uses for cross-origin actions. A self-declared risk class may restrict, never widen.

### Taint tracking — the mechanism that maps to the real threat

The question that matters is not *what can the agent do* but *who is asking*. A command derived from my typed prompt and one derived from text on a page are indistinguishable by the time they reach the dispatcher, and prompt injection is exactly the act of making the second look like the first.

So: a **taint flag**, set the moment untrusted content enters the model's context and never cleared. It lives on the window's agent state, not on f7's conversation object, and is cleared only by browser restart — otherwise opening a second window, or an `ai_off`/`ai_on` cycle, resets it.

**Taint follows the data, not the command that produced it.** Enumerating "a2's read path, a tool result containing page text, a fetched document" misses every store in this system that persists page-controlled strings and serves them back through a `read`-class command: d3 renders raw page `<title>` into taskwarrior descriptions and `tasks` is `read`; p1 stores page titles and `bm` is `read`; f4, f5, p2, r4 and b3 all carry page-supplied titles and URLs; d5 returns strings from a VPS whose job and branch names are frequently not authored by me; and this spec's own `actions` log replays every argument ever dispatched.

The laundering path is concrete: get a page dwelt on for three minutes with an injected `<title>`, let d3's rule write it to disk, and days later — in a conversation with **no page reads at all** — ask "what did I work on this week?" The attacker's text enters an untainted context and every gate sits at base policy.

So the rule is **fail closed**: every tool result is tainted by default, with a short allowlist of commands whose output is provably chrome-authored (`config`, `hooks`, `scripts_list`, `describe`). Same shape as x2's `tierPolicy`, same reason.

When tainted, every `auto` resolution for a mutating class escalates to `confirm`, and **navigation to a registrable domain not already in the conversation's read set** escalates too — a URL is a write channel (`?d=<base64>`), DNS alone is one, and `navigate` is otherwise the one class that never produces a second decision point. Navigation to hosts already in play stays auto, so ordinary work is unaffected.

The prompt shows provenance: `run tab_close? (tainted: page content in context)`. Knowing *why* I'm being asked is most of the value of being asked.

### Plan, not loop

The agent does not execute a free-running tool loop. It produces a **plan** — an ordered list of registry calls with arguments — which is rendered for review; `Enter` executes it deterministically, `Esc` discards, and individual steps can be struck out before running. Execution is a script over the same dispatcher, so a plan is replayable and diffable.

A poisoned page can corrupt a plan I am about to read. It cannot silently act. That property is worth more than any amount of prompt hardening, and it is the reason "workflows" and "safety" are the same feature here rather than two.

**The plan render is a security surface and is treated as one.** Command names and arguments are model-authored, and under injection they are attacker-authored — so a2's rule for text *entering* the model applies to text *leaving* it: `textContent` only, every argument truncated to a fixed width with the full value available on demand, control, zero-width and bidi characters stripped, and non-ASCII rejected in command names at `validatePlan` (x1 already rejects unicode tricks at definition time; the same check belongs at plan validation). Without this, a newline in an argument forges two extra plan lines, an RTL override renders an attacker URL as a bank URL, and homoglyphs disguise which command is about to run. Steps whose target host is new to the conversation are marked.

Because approval is a single `Enter` in a keyboard-driven browser — the most-pressed key, and the same key a3 binds to "go back" and the palette binds to "execute" — the prompt ignores keystrokes already in flight when it appears.

**Plans are saved (`~/.config/aether/plans/*.json`), and both plan commands are `agent: false`.** A plan is a human artifact: the agent composes them, it does not save or invoke them. Three properties compose into a complete bypass otherwise — the commands carry no risk class, taint is not recorded in the saved JSON, and `plan_run("morning")` renders as *one line*, so what I review is a pointer rather than forty steps, and a plan authored under taint re-runs in a clean conversation at the untainted policy.

If `plan_run` ever becomes agent-callable, three things must come with it: the file records the maximum taint under which it was authored, `plan_run` restores at least that taint, and the render expands every step.

**`planFileName(name)`** is a pure export with b1's guarantee — no separators, no `..`, no absolute paths, no null bytes, no unicode separators, refusing rather than sanitizing. `plans_dir` is a sibling of `commands/` (x1: privileged JS, loaded at init, no sandbox), `mods/`, `boosts/`, `aether.toml` and `daemon-token`; b1 and x2 both specify this guard with dedicated tests, and a spec that writes attacker-influenced JSON under an agent-chosen name cannot be the one that skips it.

### The log

Every dispatch — keystroke, palette, mod, agent — writes `{ts, command, args, origin, tainted, consent, result}` to an append-only log. One dispatcher means the log is complete by construction rather than by discipline. `:actions` opens it on r4's panel, filterable, and it answers the question that makes an agent trustable at all: *what did it do while I was away?*

**Consent and the log resolve against the post-hook, final arguments.** x1's `command` and `open-link` hooks run inside the dispatcher and may rewrite arguments — legitimately, since that is what x4's mod does — so a confirm prompt rendered from the plan's arguments could approve one call while a hook executes another, and the log would record one of the two without saying which. If a hook mutates arguments after a `confirm` was displayed, the dispatch is **refused and named**. Note this makes `navigate` mod-influenceable, which is another reason it no longer stays `auto` under taint.

Redaction is **value-shaped** (pattern and entropy), not argument-name-driven. Name-driven rules let a command author choose what the log omits by naming a parameter `token`, which makes completeness selectable by the least trusted party.

**TOML surface**:

```toml
[agent]
enabled = false           # off until I turn it on, like [ai] and [daemon]
log      = true
plans_dir = "~/.config/aether/plans"

[agent.consent]           # as above
```

New registry commands: `agent` (panel), `agent_on`, `agent_off`, `actions` (log), `plan_run`, `plan_save`. `agent_off` aborts any in-flight plan mid-execution — f7's hard-switch contract, extended: a switch that only stops *new* actions is not a switch.

## 3. Pure vs glue

- **`aether-agent.sys.mjs`** (pure): `projectRegistry(registry)` → tool schema, honoring `agent: false`; `resolveConsent(policy, risk, origin, tainted)` → `auto|confirm|never` — the entire policy in one total function; `taint(state, source)` (monotonic, never clears); `validatePlan(plan, registry)` → normalized steps or a reason (unknown command, arity mismatch, argument type); `planDiff(plan, struck)`.
- **`aether-log.sys.mjs`** (pure): `entry(...)`, `serialize`, `filter(entries, query)`, `redact(args, rules)` — argument redaction so a password typed into a command never lands in the log.
- **`aether.uc.js`** (glue): MCP endpoint, plan rendering, confirm prompts, dispatcher instrumentation, append-only log writes.

## 4. Unit tests (behavioral) — `overlay/test/unit/a1-agent.test.mjs`

1. `projectRegistry` includes every command with a description and risk; excludes `agent: false` entries; a command lacking a description fails the projection (guard: an undescribed command is an unusable tool)
2. **every capability-widening command is `agent: false`** — an inventory assertion over the registry (`agent_on`, `perception_on`, `action_on`, `mod_enable`, `mod_install`, `crypto_*`, `plan_save`, `plan_run`, `ai_on`, `ai_off`, `nudge_*`), so a later command that widens capability cannot be added without failing this test
3. `resolveConsent` — the full matrix of policy × risk × origin × tainted, asserted exhaustively rather than by example, because this function *is* the security boundary
4. tainted + `auto` + mutating class → `confirm`; tainted + `auto` + `read` → still `auto`; tainted + `navigate` to a **new** registrable domain → `confirm`, to a domain already in the read set → `auto`
5. `never` is never escalated *down* by any combination, including an untainted direct prompt
6. non-builtin origin resolves to at least `confirm` **even under a policy that sets every class to `auto`** (the consent floor, asserted against the policy that tries to lower it)
7. `taint` is monotonic and window-scoped: once set it cannot be cleared by any exported function — an inventory assertion, so a future refactor can't add a `clearTaint` — and it is not stored on the conversation object
8. tool results default to tainted; only the allowlisted chrome-authored commands do not taint (asserted both ways, with a d3-style task description carrying a sentinel proving the laundering path is closed)
9. `validatePlan` rejects unknown commands, wrong arity, wrong argument types, and **non-ASCII command names**; a plan mixing one valid and one invalid step is rejected **whole**, never partially executed
10. a plan step naming a `never`-class or `agent: false` command is rejected at validation, before any step runs
11. `planDiff` with struck steps yields exactly the remaining steps in order
12. `planFileName` with `../commands/00-init.js`, an absolute path, separators, null bytes and unicode separators each **refuses** — b1 test 4 and x2 test 6, copied verbatim
13. `redact` is value-shaped: a high-entropy or pattern-matching value is redacted regardless of its argument name, and renaming a parameter to `token` does not suppress logging
14. **the plan render and the confirm prompt bound hostile strings**: newlines cannot forge extra plan lines, bidi overrides cannot reverse a rendered URL, 10k-character arguments are truncated, and homoglyph command names never reach the render (a1 test 11's rule applied to the surfaces that actually gate execution, not just the log)
15. log entries serialize round-trip; a hostile argument cannot forge a second log line
16. consent resolves against **post-hook arguments**: a hook rewriting an argument after the prompt was rendered causes the dispatch to be refused and named
17. every consent-prompt and refusal string passes the f6 lexicon sweep (a refusal explains; it does not scold)

## 5. Visual states — `overlay/test/visual/scenarios.d/l1-agent.sh`

Mock gateway returning canned plans:

1. **agent off** — `:agent`: off-state, mock log gains zero entries (f7's proof pattern)
2. **plan rendered, nothing executed** — a plan with three steps shown; the scenario asserts no command ran
3. **execute** — `Enter`: all three effects visible, three log entries in `:actions`
4. **strike a step** — one step struck, `Enter`: two effects, two entries
5. **confirm gate** — a `mutate-local` step prompts; declining executes nothing
6. **`never` refused** — a plan containing a `dangerous` command is rejected at validation with the class named, and no step of it runs
7. **taint escalation** — after a2 reads a page, a previously-auto step now prompts, and the prompt states the taint
8. **`agent_off` mid-plan** — a long plan interrupted: remaining steps do not run, and the log records the interruption

## 6. Non-goals (budget protection)

- **No free-running tool loop**, no autonomous multi-turn execution, no background agent. Plan → review → deterministic run.
- **No second automation API.** If the agent should be able to do it, it is a registry command, which means I can bind it to a key too.
- **No cloud models for agent control** — f7's loopback rule holds; a remote model driving my browser is a different project.
- **No credential access.** The agent cannot read the token file, the keyring, or `[crypto]` stores; `dangerous` covers the commands that touch them and the default policy refuses them outright.
- **No self-modification** — the agent cannot edit config, install or enable mods, or write user scripts. Those are `dangerous` by annotation, and that is deliberate: an agent that can extend its own capabilities has no meaningful permission model.
- **No log deletion command** — append-only; rotation is a file I move.
- **No prompt-injection "detection" heuristic.** It doesn't work, and shipping one would imply a protection that isn't there. Taint tracking assumes injection succeeds and gates effects instead.
