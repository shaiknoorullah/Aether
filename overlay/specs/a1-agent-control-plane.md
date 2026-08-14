# a1 — Agent Control Plane (the registry is the API)

## 1. Today → Instead → Thinnest

**Today**: f7's sidebar is a chat box. It can talk about the browser and do nothing to it. Every "AI browser" that fixed that did it by giving a model a bespoke automation API — a second implementation of the UI that drifts from the real one, feature by feature, until half the browser is unreachable and the other half behaves differently when the agent does it.

**Instead**: **everything I can do is already a registry command.** Keys dispatch registry commands, the palette runs registry commands, mods define registry commands. So the agent's tool list is a *projection of the registry*, not a parallel surface — the agent calls `tab_close`, which is the same function my `x` key calls, with the same tests, the same permissions, and the same log entry.

**Thinnest**: a serializer from the registry to a tool schema, a consent policy that reads the `risk` classes x1 already put on every command, a taint flag, and an append-only action log. The agent runtime is small precisely because the API was built accidentally over three versions.

## 2. Exact behavior

### The projection

`GET` the registry → `[{name, description, args, risk}]`. Descriptions are the same strings r3's which-key and r5's settings panel render — written once, read by three surfaces, and therefore actually maintained. This is exposed over decision #2's MCP layer, so the tool list is generated at startup rather than hand-maintained; a command added by a mod is agent-callable the moment it loads, with no agent-side work.

Commands can opt out (`agent: false` on the registry entry) — `crypto_decrypt` and `mod_install` do.

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

**Non-builtin commands are floored at `mutate-local`** (x1's `riskFloor`), regardless of what a mod declares. A self-declared risk class may restrict, never widen — otherwise a careless or hostile mod labels a destructive command `read` and the policy runs it unprompted, turning a description into a privilege escalation.

### Taint tracking — the mechanism that maps to the real threat

The question that matters is not *what can the agent do* but *who is asking*. A command derived from my typed prompt and one derived from text on a page are indistinguishable by the time they reach the dispatcher, and prompt injection is exactly the act of making the second look like the first.

So: a per-conversation **taint flag**, set the moment any page-derived content enters the model's context (a2's read path, a tool result containing page text, a fetched document) and never cleared for the life of that conversation. When tainted, every `auto` resolution for mutating classes is escalated to `confirm`. Read and navigate stay auto — the point is to gate *effects*, not to make a tainted conversation useless.

The prompt shows provenance: `run tab_close? (tainted: page content in context)`. Knowing *why* I'm being asked is most of the value of being asked.

### Plan, not loop

The agent does not execute a free-running tool loop. It produces a **plan** — an ordered list of registry calls with arguments — which is rendered for review; `Enter` executes it deterministically, `Esc` discards, and individual steps can be struck out before running. Execution is a script over the same dispatcher, so a plan is replayable and diffable.

A poisoned page can corrupt a plan I am about to read. It cannot silently act. That property is worth more than any amount of prompt hardening, and it is the reason "workflows" and "safety" are the same feature here rather than two.

Plans are saved (`~/.config/aether/plans/*.json`), so a good one becomes a workflow by keeping it — which is how automation arrives without a separate automation system.

### The log

Every dispatch — keystroke, palette, mod, agent — writes `{ts, command, args, origin, tainted, consent, result}` to an append-only log. One dispatcher means the log is complete by construction rather than by discipline. `:actions` opens it on r4's panel, filterable, and it answers the question that makes an agent trustable at all: *what did it do while I was away?*

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
2. `resolveConsent` — the full matrix of policy × risk × origin × tainted, asserted exhaustively rather than by example, because this function *is* the security boundary
3. tainted + `auto` + mutating class → `confirm`; tainted + `auto` + `read` → still `auto`
4. `never` is never escalated *down* by any combination, including an untainted direct prompt
5. non-builtin origin floors at `mutate-local` even when the entry declares `read` (x1's `riskFloor` asserted from the consumer side)
6. `taint` is monotonic: once set it cannot be cleared by any exported function — an inventory assertion over the module, so a future refactor can't add a `clearTaint`
7. `validatePlan` rejects unknown commands, wrong arity, and wrong argument types; a plan mixing one valid and one invalid step is rejected **whole**, never partially executed
8. a plan step naming a `never`-class command is rejected at validation, before any step runs
9. `planDiff` with struck steps yields exactly the remaining steps in order
10. `redact` removes values for argument names matching the redaction rules and leaves the command shape intact
11. log entries serialize round-trip; a hostile argument (newlines, 10k chars, control characters) is bounded and cannot forge a second log line
12. every consent-prompt and refusal string passes the f6 lexicon sweep (a refusal explains; it does not scold)

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
