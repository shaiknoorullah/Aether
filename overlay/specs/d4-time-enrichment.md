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

`segment(events, gapThreshold)` groups engagements into **blocks** — contiguous work on a coherent thing. A block is `{start, end, sites[], workspace, focus_task?, label?, source}`. Blocks are what a human reads; raw events are not.

### The two-tier rule — the part that matters

Every span carries `source: "measured" | "inferred"` and, when inferred, `confidence` and `basis` (what the inference was drawn from).

- **Measured** = observed by the browser, or recorded by an AW watcher, or written by a d3 rule.
- **Inferred** = produced by a model or by gap-filling heuristics.

They are stored in separate fields, rendered in visually distinct styles, and **never silently merged**. Every report states what fraction of its total is inferred. An inferred span can be accepted (becoming measured, with `basis: "accepted"`), edited, or rejected — and rejection is the default outcome of ignoring it. Nothing becomes measured by the passage of time.

Without this rule, the feature is a machine that generates plausible fiction about my life and then invites me to make decisions from it. The rule is why this spec exists at all.

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
2. a block spanning a focus session inherits `focus_task`; one that doesn't, doesn't
3. `gapsIn` finds gaps against the day range including leading/trailing gaps, and returns none for a fully covered day
4. **`summarize` never sums measured and inferred into one number** — separate totals plus `inferredFraction`; a summary of only-inferred blocks reports 1.0
5. `acceptInference` flips source to measured with `basis: "accepted"`; there is **no** code path that flips it any other way (inventory assertion over the module's exports)
6. an inferred block that is neither accepted nor rejected stays inferred across serialize/deserialize — time does not launder it
7. `serializeForModel` whitelist: given blocks carrying page text, query strings, fragments, form values, cookies and private-window flags, **none of those values appear** in the output (b2 test 2's fixture pattern, asserted by sentinel)
8. urls are reduced to host+path in model input, asserted with a query-bearing url
9. `buildReportPrompt` contains the instruction that output must be factual and non-evaluative
10. report templates pass the f6 lexicon sweep; a *simulated model reply* containing "wasted" is rejected by the same sweep applied to output (the guard is on both sides, asserted)
11. `mergeBlocks` of a measured and an inferred block yields an **inferred** block (the pessimistic rule — mixing can only downgrade)
12. `splitBlock` preserves total duration exactly and carries source to both halves

`daemon/tests/aw.rs`:
13. bucket events are written with the right type and no private-window data
14. AW unreachable → events queue locally and backfill in order, with no duplicates after reconnect (asserted by replaying a reconnect)

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
