# d4 — Time-Data Enrichment (ground truth first, inference second, never mixed)

## 1. Today → Instead → Thinnest

**Today**: my ActivityWatch data is ugly and I don't trust it. Half the day is `Firefox` with a window title, AFK detection misfires, and there are gaps where something clearly happened. I've looked at it on another machine and drawn no conclusions from it, because you can't reason over a record that's mostly holes.

**Instead**: two things, in this order. **First, better data at the source** — the browser knows the url, the page title, the workspace, whether a focus session was running and *what I named the task*. That is semantic ground truth ActivityWatch structurally cannot get, and it fixes the largest blind spot with no model involved. **Second**, AI on what remains: gaps, unlabeled blocks, and reports.

**Thinnest**: an ActivityWatch bucket writer (their API is local HTTP and well-documented), a block segmenter, and an optional enrichment pass over f7's gateway. The genuinely important work is not the pipeline; it is the **measured/inferred separation** and making sure a report can't become a shame machine.

## 2. Exact behavior

### Ingest — the free win

The daemon consumes d3's event stream and writes an `aether.browser` bucket into ActivityWatch (`127.0.0.1:5600`, the loopback rule again), one event per engagement: `{url, host, title, workspace, focus_task, duration}`. If AW isn't running, the daemon keeps its own store and backfills when AW returns.

This alone converts "Firefox — 6h" into per-site, per-workspace, per-task time with zero inference. Everything below is about the remainder.

### Segmentation

`segment(events, gapThreshold)` groups engagements into **blocks** — contiguous work on a coherent thing. A block is `{start, end, engagements[], sites[], workspace, focus_task?, label?, label_source, origin, reviewed}`. Blocks are what a human reads; raw events are not.

**A block's duration is the sum of its engagements, never `end - start`.** Sub-threshold gaps are time nobody observed: thirty two-minute gaps in a normal day of tab-switching and phone-glancing is an hour that `end - start` would report as ground truth, and raising `gap_threshold` to reduce fragmentation makes it strictly worse. So the interstitial time is carried explicitly as `unobserved` and `summarize` reports it as a **third quantity** alongside measured and inferred.

### The tier rule — the part that matters

Every span carries an **immutable `origin`** and a separate `reviewed` flag:

- **`measured`** = observed by Aether's own instrumentation, or written by a d3 rule.
- **`external`** = recorded by another AW watcher. *Not* measured: §1's whole premise is that AW's own data misfires, so classifying it as ground truth would contradict the paragraph that motivates this spec — and "an AW watcher wrote it" is an assumption about who wrote to a local port, not a provenance claim the daemon can verify.
- **`inferred`** = produced by a model or by gap-filling, with `confidence` and `basis`.

Four rules make the separation hold, each of which closes a path that would otherwise launder inference into fact:

1. **`accept` never rewrites `origin`.** It sets `reviewed: true`. A "measured" span with `basis: "accepted"` would be indistinguishable to every consumer from something I watched happen; after a week of 1am accepts the report reads `inferred: 0%` over a timeline that was 40% generated. `summarize` therefore reports three numbers — measured, reviewed-inference, unreviewed-inference — and the report header states all three.
2. **Merging is lossless.** A merged block carries the measured/inferred **duration split** of its constituents rather than a single tier, so merge→accept cannot promote genuinely-inferred minutes and merge→split cannot permanently downgrade measured ones.
3. **Only `measured` spans are ever written to ActivityWatch.** Inferred spans live solely in the daemon's store. Otherwise the round-trip is the laundering path: accept a 90-minute gap fill, it lands in AW, next week it reads back as ground truth. If inferred spans ever need to be in AW, they go in a separate `aether.inferred` bucket that the reader never promotes.
4. **Nothing becomes measured by the passage of time** — and an unreviewed inference older than 14 days is **dropped**, so "rejection is the default outcome of ignoring it" is a mechanism rather than a hope.

`inferredFraction` is **duration-weighted**, stated here because count-weighted would report 5% for a day with twenty short measured blocks and one six-hour gap fill.

Without these rules, the feature is a machine that generates plausible fiction about my life and then invites me to make decisions from it. They are why this spec exists at all.

### Enrichment

Runs on demand (`:timeline`, then an explicit action) or on a schedule the daemon owns — never automatically at write time. Three jobs, all against f7's local gateway with f7's rules (loopback-only, kill switch, and when the switch is off this feature is simply unavailable):

1. **Label a block** — given sites, titles, workspace, and any focus task, propose a one-line label.
2. **Fill a gap** — given the blocks either side, propose what a gap likely was, with confidence. A gap adjacent to nothing informative gets no proposal; "unknown" is a valid, common, correct answer.
3. **Draft a report** — a daily or weekly summary from the block list.

What goes to the model: hosts, titles, durations, workspace and focus-task names. What never goes: page content, form data, urls with query strings or fragments (stripped to host+path), and anything from a private window. The whitelist is enforced in the serializer, not the prompt — b2's rule, same reasoning, same test shape.

### Reports, and the shame problem

A time-tracking report is the single easiest place in this browser to build the thing f6 exists to prevent. So:

- Report copy — templates *and model output* — passes the f6 lexicon sweep. Model output failing the sweep is **regenerated once, then dropped**; a report that scolds is not shown.
- Reports state facts and totals. No targets, no goals, no comparisons against previous periods, no "productive vs unproductive" classification, no scores.
- There is no streak, no daily total to beat, and no notification about a report.
- **The model never emits a number.** Every total is template-injected from `summarize()`, and a post-check rejects any model output containing a digit that is not in the injected set. A model writing "roughly three hours on the aether repo" over blocks totalling 1h50m invents data, passes a lexicon sweep and a prompt-instruction test, and misstates the one thing the report exists to convey — while the header truthfully says 0% inferred, because the *blocks* were measured and only the prose lied.
- **An AI-generated label is marked as one.** `label_source` is rendered distinctly, and the report header counts measured blocks carrying generated labels — the tier system covers spans, and a block with measured time and an invented label is otherwise indistinguishable from a hand-written one.
- **Scheduled enrichment produces proposals, not spans.** A nightly pass writes into a review queue that expires; it never attaches inferences to the timeline unseen. Otherwise "inference is always an explicit act with a review step" and "on a schedule the daemon owns" are two sentences in the same spec that contradict each other.

`:timeline` opens r4's panel over blocks for a chosen day: time, duration, label, source tier. Actions: label, accept/reject an inference, merge adjacent blocks, split, or open the block's sites as a tab group.

**TOML surface**:

```toml
[timeline]
enabled       = false     # off until I turn it on, like [ai]
aw_url        = "http://127.0.0.1:5600"
gap_threshold = "5m"
enrich        = false     # AI pass; requires [ai] enabled too
```

New registry commands: `timeline` (`read`), `timeline_label`, `timeline_accept`, `timeline_reject` (`mutate-local`), `timeline_report` (`read`).

## 3. Pure vs glue

- **`aether-timeline.sys.mjs`** (pure): `segment(events, gap)` → blocks; `mergeBlocks`/`splitBlock`; `gapsIn(blocks, dayRange)`; `summarize(blocks)` → totals by host/workspace/task **plus** `inferredFraction`; `serializeForModel(blocks)` — the whitelist-enforcing serializer; `buildLabelPrompt` / `buildGapPrompt` / `buildReportPrompt`; `acceptInference(block)`.
- **`aether-ai-client.sys.mjs`** (f7): reused verbatim for transport.
- **`aether-strings.sys.mjs`**: report templates — sweep target.
- **daemon (Rust)**: `aw.rs` (bucket writer, backfill), `store.rs` (local fallback store).

## 4. Unit tests (behavioral) — `overlay/test/unit/d4-timeline.test.mjs`

1. `segment` groups events within the gap threshold and splits beyond it; boundary asserted exactly
2. a block built from two 60s engagements four minutes apart reports **120s measured and 240s unobserved**, never 360s measured (the by-construction invention, pinned)
3. a block spanning a focus session inherits `focus_task`; one that doesn't, doesn't
4. `gapsIn` finds gaps against the day range including leading/trailing gaps, and returns none for a fully covered day
5. **`summarize` reports three quantities** — measured, reviewed-inference, unreviewed-inference — plus `unobserved`, and never sums them; `inferredFraction` is **duration-weighted**, asserted with an asymmetric fixture (twenty short measured blocks, one six-hour inference) whose count-weighted and duration-weighted answers differ by far more than rounding
6. `accept` sets `reviewed: true` and leaves `origin` unchanged; **no exported function mutates `origin`**, and a property test over random merge/split/accept/reject/serialize sequences asserts measured duration never increases except via an explicit accept — an export inventory alone is blind to `mergeBlocks` setting a field internally
7. merge carries the duration split: merging a measured and an inferred block, then accepting, promotes only the inferred portion; merging then splitting returns the original split
8. an unreviewed inference stays unreviewed across serialize/deserialize, and one older than 14 days is dropped by the reaper — time neither launders nor preserves it
9. `serializeForModel` whitelist: given blocks carrying page text, query strings, fragments, form values, cookies and private-window flags, **none of those values appear** in the output (b2 test 2's fixture pattern, asserted by sentinel)
10. urls are reduced to host+path in model input, asserted with a query-bearing url
11. `buildReportPrompt` contains the instruction that output must be factual and non-evaluative, and every total in the prompt is template-injected
12. report templates pass the f6 lexicon sweep; a *simulated model reply* containing "wasted" is rejected by the same sweep applied to output (the guard is on both sides, asserted)
13. **a simulated reply containing a fabricated total is rejected** — a digit not present in the injected set fails the post-check, so a model cannot restate 1h50m as "roughly three hours"
14. `splitBlock` preserves total duration exactly and carries the duration split to both halves
15. `label_source` survives serialization and a generated label is counted in the report header

`daemon/tests/aw.rs`:
16. bucket events are written with the right type and no private-window data, and **only `measured` spans are written** — an inferred or reviewed-inference span never reaches AW (the laundering path, closed and asserted)
17. AW unreachable → events queue locally and backfill in order. Idempotency is asserted against a **crash mid-backfill**, not a clean reconnect: 400 queued, 380 POSTed, process killed, restart → AW ends with 400 events and no duplicates. Requires an fsynced per-event watermark or a deterministic event id; a clean-reconnect replay exercises the path that was never at risk
18. the local queue has a retention bound, so a long outage cannot grow it without limit

## 5. Visual states — `overlay/test/visual/scenarios.d/k4-timeline.sh`

Mock AW + mock gateway (f7 pattern), seeded event fixtures:

1. **timeline panel** — a day of blocks with times, labels, durations
2. **tiers are visually distinct** — a measured and an inferred block in one shot, obviously different
3. **report states its inference fraction** — visible in the report header
4. **accept promotes** — accept an inferred block; it re-renders as measured and the fraction drops
5. **enrichment off** — `enrich = false`: mock gateway log gains **zero** entries while the panel is used
6. **AI off wins** — `enrich = true` but `[ai] enabled = false`: the exact f7 off-state, zero requests (the same precondition assertion b2 made)
7. **no page text leaves** — the fixture pages carry a sentinel string; the gateway request log is grepped for its absence

## 6. Non-goals (budget protection)

- **No productivity scoring, no goals, no targets, no streaks, no "focus score."** Identity, not deferral. A scoring surface is a judgement surface.
- **No comparison against previous periods**, no trend arrows, no "better/worse than last week."
- **No automatic enrichment at write time** — inference is always an explicit act with a review step.
- **No page content, ever** — not to the model, not into AW events, not into a report.
- **No replacement for ActivityWatch.** Aether writes one bucket and reads AW's; it does not become a time tracker.
- **No calendar integration, no meeting detection, no cross-device merge.**
- **No export formats or BI dashboards** — the AW store and a JSON dump are the export.
- **No notifications about time.** The clock and date widgets are the ambient anchor (f6); this feature never interrupts.

**One acknowledged reversal.** f6's non-goals say "no session history, stats, totals, logs, or review surfaces — a session that ended is gone", marked as identity rather than deferral. This spec stores `focus_task` per block and builds totals and a review surface over it, so f6's rule is **superseded for time data**, deliberately: the point of the whole pipeline is that the browser is the only thing positioned to record what actually happened, and a focus task is the most valuable label available. What f6's rule was protecting against — a surface that judges you for how a session went — is preserved by the no-scores, no-comparisons, no-streaks rules above. f6 §6 is amended to say so rather than leaving two specs in silent contradiction. If the no-history rule is meant to hold instead, `{focus_task}` must be excluded from both d3's sinks and this bucket, and that is the alternative on the table.
