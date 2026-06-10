# Research Plan: Browser Power Users JTBD (2026)

**Slug:** `power-user-browser-jtbd`
**Date:** 2026-06-10
**Status:** AWAITING APPROVAL

---

## Research Objective

Characterize the unmet jobs-to-be-done, real workflows, concrete pain points, and
switch-inducing features for browser power users in 2026: vim/keyboard-driven users,
tiling-WM operators (i3, Hyprland, Sway, dwm), suckless philosophy adherents, and
professional developers. Include quantitative community-size and install-count evidence.

---

## Key Questions

1. **JTBD / Workflow**: What are the top 5–10 jobs-to-be-done for this segment (what are they
   actually trying to accomplish, not what features they want)?
2. **Pain Points**: What are the most-cited concrete pain points with today's browsers
   (Firefox, Chromium, qutebrowser, Nyxt, Vimium, etc.)?
3. **Switch Triggers**: Which specific features, if present in a new browser, would cause
   this segment to switch from their current browser?
4. **Community Size / Install Evidence**: How large is each sub-community
   (r/unixporn, qutebrowser installs, Vimium users, Arch Linux AUR stats, etc.)?
5. **Tool Overlap**: What other tools do these users reach for that browsers fail to provide
   (e.g., ripgrep, tmux, fzf, rofi)? What integrations are most valued?
6. **Feature Taboo**: What browser patterns are actively rejected by this segment
   (telemetry, electron, bloat, mouse-dependency)?
7. **Existing Attempts**: Which browser projects already target this niche, and where do they fall short?

---

## Evidence Needed

| Type | Sources |
|------|---------|
| Community sentiment & pain points | Reddit (r/unixporn, r/vim, r/firefox, r/qutebrowser), HN threads, lobste.rs |
| Install counts | AUR stats, GitHub stars/forks, extension store numbers (Chrome Web Store, AMO) |
| Workflow documentation | Personal blog posts, dotfile repos, workflow writeups |
| Feature gap analysis | Issue trackers (qutebrowser, Nyxt, Vimb, Firefox), forum threads |
| Survey/user-research data | Any published browser UX studies, StackOverflow surveys |
| Competitor analysis | qutebrowser, Nyxt, Vimb, Tridactyl, Vimium-C feature lists vs. pain-point threads |

---

## Scale Decision

**Multi-agent (4 researcher subagents)** — topic is broad, multi-faceted, and community-spread.
Decomposition into 4 parallel tracks reduces context pressure:

- T1: Community size / install counts / quantitative evidence
- T2: Pain points & JTBD (Reddit, HN, lobste.rs, forums)
- T3: Existing browser attempts & feature gaps (qutebrowser, Nyxt, Vimium, Tridactyl, etc.)
- T4: Workflow documentation & switch triggers (dotfiles, blog posts, tooling overlap)

---

## Task Ledger

| ID  | Owner       | Task                                                        | Status  | Output file                             |
|-----|-------------|-------------------------------------------------------------|---------|-----------------------------------------|
| T1  | researcher  | Community size & install-count evidence                     | PENDING | outputs/.drafts/power-user-T1.md        |
| T2  | researcher  | Pain points, JTBD, sentiment (Reddit/HN/forums)             | PENDING | outputs/.drafts/power-user-T2.md        |
| T3  | researcher  | Existing browser projects, feature gaps, issue trackers     | PENDING | outputs/.drafts/power-user-T3.md        |
| T4  | researcher  | Workflows, switch triggers, dotfile/blog evidence           | PENDING | outputs/.drafts/power-user-T4.md        |
| D1  | lead (me)   | Draft synthesis                                             | PENDING | outputs/.drafts/power-user-browser-jtbd-draft.md |
| V1  | verifier    | Citation + URL verification                                 | PENDING | outputs/.drafts/power-user-browser-jtbd-cited.md |
| R1  | reviewer    | Verification pass on cited draft                            | PENDING | outputs/.drafts/power-user-browser-jtbd-verification.md |
| F1  | lead (me)   | Fix FATAL issues, deliver final                             | PENDING | outputs/power-user-browser-jtbd.md      |
| P1  | lead (me)   | Write provenance sidecar                                    | PENDING | outputs/power-user-browser-jtbd.provenance.md |

---

## Per-Researcher Briefs (to be written before subagent launch)

- `outputs/.plans/power-user-browser-jtbd-T1.md`
- `outputs/.plans/power-user-browser-jtbd-T2.md`
- `outputs/.plans/power-user-browser-jtbd-T3.md`
- `outputs/.plans/power-user-browser-jtbd-T4.md`

---

## Verification Log

| Check | Status | Notes |
|-------|--------|-------|
| T1 artifacts on disk | PENDING | |
| T2 artifacts on disk | PENDING | |
| T3 artifacts on disk | PENDING | |
| T4 artifacts on disk | PENDING | |
| Draft written | PENDING | |
| All claims traceable to source URL | PENDING | |
| Cited draft exists | PENDING | |
| Reviewer verification pass | PENDING | |
| FATAL issues resolved | PENDING | |
| Final output on disk | PENDING | |
| Provenance sidecar on disk | PENDING | |

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| 4 researcher subagents | Broad multi-community topic; parallel tracks cover Reddit/HN, installs, tools, and workflows without context bleed |
| Exclude PDF parsing | Avoid crash-prone PDF parsing per workflow rules; prefer HTML/web sources |
| Slug: power-user-browser-jtbd | Descriptive, ≤5 words |
| Output location: outputs/ (not papers/) | Structured research brief, not paper-style draft |
