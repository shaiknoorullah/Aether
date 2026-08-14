# Friction Log — Phase 2 Daily-Drive Gate

Started **2026-08-14**, day 1 of 30. The overlay went live on this machine today
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
