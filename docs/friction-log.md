# Friction Log — Phase 2 Daily-Drive Gate

**Run 2 started 2026-10-04**, day 1 of 30 — see [Run 2](#run-2--2026-10-04--2026-11-02)
at the bottom. Run 1 lapsed; what it showed is recorded under
[Run 1 outcome](#run-1-outcome).

Run 1 started **2026-08-14**, day 1 of 30. The overlay went live on this machine today
(autoconfig was installing into the wrong directory until now, so nothing had
ever actually run).

**The gate question, asked daily:** did I open another browser out of *need*?
Not curiosity, not habit — need. Every yes is a line here.

**The rule:** one line per annoyance, written *when it annoys me*, not
reconstructed at the end of the week. An entry is not a bug report and does not
need a diagnosis — "the thing where hints miss links in the sidebar" is a valid
entry. Diagnosis happens at review, not at capture.

**At review** (per floor item, per the standing drill), each line becomes exactly
one of:

- **fix** — small, and I want it. Gets a spec.
- **cut** — the feature causing it goes, or shrinks.
- **live with it** — recorded, closed, not carried as debt.

No entry stays open. A line that can't be resolved into one of the three is a
sign the thesis needs rework, which is what this gate exists to detect.

Format: `- YYYY-MM-DD — what happened` and, at review, append `→ fix|cut|live: …`

---

## Day 1 — 2026-08-14

- 2026-08-14 — `install.sh` wrote autoconfig to `/usr/bin` instead of
  `/usr/lib/firefox`; the overlay silently never loaded and the installer
  reported success → fix: shipped (`fix/app-dir-detection`, PR pending)
- 2026-08-14 — a `[theme.colors]` edit needs a full restart; only the wal file
  is re-read by `:theme_reload`. Restarting a browser to change a color is the
  least riceable thing in the whole overlay.
- 2026-08-14 — vertical tabs are the wrong model. A spatial strip of tabs is
  not how I find a tab; I want to search for it. Tabs should be a panel that
  opens focused on a search field, fuzzy, MRU-sorted → cut: f4's vertical strip
  is replaced by the tab panel (v1.2.0)
- 2026-08-14 — prefix completion in the palette is not enough once candidate
  lists get long (repos, tabs, history). Fuzzy matching + frecency ranking were
  cut in v1.0.0 "revisitable only with daily-driving evidence" — this is that
  evidence, logged deliberately so the reversal is on the record.

---

## Open questions this log is meant to answer

- Does the palette hold up without fuzzy matching and command history? (Both cut
  in v1.0.0, revisitable only with evidence — this is the evidence.)
- Does insert-mode detection misfire often enough to matter?
- Do top-frame-only hints fail on sites I actually use?
- Does 2,009 lines of glue in `aether.uc.js` show up as *felt* instability, or
  only as rebase cost?

---

## Run 1 outcome

Scheduled 2026-08-14 → 2026-09-13. **No verdict was ever recorded.** The log
holds the four day-1 lines above and nothing after; the last commit to the repo
is the same day, and v1.2.0 — built that afternoon — sat on an unmerged branch
with no visual verification. If the browser was used after day 1, none of that
use reached this file.

Read honestly, the run shows one thing: **the gate question was not asked
daily.** Whether the browser was used and simply not logged, or not used, the
gate cannot distinguish — which is the same failure, because an unlogged month
is not evidence. Not "the floor failed"; the gate's own mechanism failed.

The day-1 lines were resolved at the time (all four became v1.2.0 specs or
fixes). The four open questions carry into run 2 unchanged — none were answered.

---

## Run 2 — 2026-10-04 → 2026-11-02

Same question, same rule, same format. Differences from run 1:

- **This machine**, stock Firefox 150 (`/usr/lib/firefox`), overlay at v1.2.0
  (`feat/v1.2.0-pure-layer`), installed from this checkout.
- **Day 1 starts when the profile first launches here**, not when this line was
  written — install needs sudo for the autoconfig files. Re-date this header if
  that slips.
- **A weekly review line is mandatory** — one per Sunday, even if it reads
  "no friction this week". Run 1 died silently; a missing Sunday line is now a
  visible failure instead of an absence.
- Firefox 150 is itself the first monthly drill: the overlay loads and the
  pre-existing f1 scenario passes on it with zero changes (2026-10-04).
- **Drill 2026-10-04, Firefox 150 → 157** (same day — `pacman -Syu`): one
  break. 157 enforces `dom.jsipc.check_safeForUntrustedWebProcess`, which
  refused the content actor in every web/file process — hints, scroll,
  insert detection, boosts, `:zap`, resurrection all dead while the chrome
  side looked fine. Fix: one audited declaration on the actor
  (`safeForUntrustedWebProcess: true`). Cost ≈ 1 h, most of it finding the
  gate in upstream source. Full suite green on 157 after. Lesson kept: the
  chrome side is not evidence the content side works — run hints first.

### Week 1

- 2026-10-04 — (install day; first line goes here)
