# Research Plan: Browser Power User JTBD — Deep Extension

**Slug**: `browser-poweruser-deep`  
**Date**: 2026-04-08  
**Prior work**: `docs/research/power-user-jtbd-pain-points.md` (28 pain points, 7 categories)

---

## What the prior round covered

- HN threads on qutebrowser, Nyxt, Tridactyl, Vimium
- GitHub issue trackers for qutebrowser, nyxt, tridactyl, vimium
- r/firefox, r/qutebrowser on keyboard shortcuts
- Surface-level MakeUseOf article on context switching
- HN: Ask Browser Wishlist + Many Tabs threads

## What is explicitly NOT yet covered (the gap map)

| Gap | Evidence Type Needed |
|---|---|
| Developer-specific workflows (DevTools, localhost, multi-account) | GitHub issues, r/webdev, HN dev threads |
| Suckless/minimalist community (surf, luakit, w3m) | Mailing lists, GitHub, r/suckless |
| Academic HCI research on keyboard navigation, tab overload | arXiv, ACM, CHI proceedings |
| Security/privacy power user workflows | r/privacy, arkenfox, Container tabs issues |
| Session management, cross-device sync, self-hosted sync | r/selfhosted, r/datahoarder, Firefox Sync issues |
| Emacs/org-mode integration, userscript automation workflows | r/emacs, org-protocol, ViolentMonkey issues |
| Quantitative data: install counts, community sizes, survey data | Chrome Web Store, Firefox AMO, Stack Overflow surveys |
| r/neovim, r/vim, r/archlinux, r/commandline community threads | Reddit |
| Firefox Bugzilla, Chromium bug tracker power-user issues | Bugzilla, crbug |
| Specific site breakage patterns (bank auth, SPAs, WebRTC) | Issue trackers, user reports |

---

## Questions

### Must answer (not covered before)

1. **Q1 — Developer DevTools**: What are the specific keyboard and workflow frustrations developers have with browser DevTools (not just page navigation)? Network inspector, source maps, console, REPL, breakpoints, Element picker via keyboard.

2. **Q2 — Suckless/minimalist community**: What do w3m, surf, luakit, and eww users articulate as their browser needs? What drove them to minimalist options? What makes them return to GUI browsers?

3. **Q3 — Academic evidence**: Is there peer-reviewed research quantifying keyboard navigation efficiency vs. mouse, tab overload cognitive load, or browser UX frustrations? (HCI, CHI, arXiv)

4. **Q4 — Security/privacy workflows**: What are the container management, proxy, certificate, and fingerprinting frustrations of privacy-focused power users? What can't Firefox Multi-Account Containers do that users need?

5. **Q5 — Sync and session persistence**: What are the documented failures, frustrations, and workarounds around browser session restore, cross-device sync, and self-hosted bookmark/history storage?

6. **Q6 — Emacs/scripting integration**: What do power users who integrate browser with external tools (Emacs org-protocol, rofi/dmenu launchers, password managers, userscripts, shell pipelines) complain about?

7. **Q7 — Quantitative prevalence**: How many users are affected? Vimium install count? Tridactyl users? qutebrowser GitHub stars trajectory? Stack Overflow developer survey browser data?

8. **Q8 — Community-specific threads not yet mined**: r/neovim, r/archlinux, r/linux, r/suckless, r/commandline, HN "Tell HN" and "Ask HN" threads specifically about browser workflow pain.

---

## Strategy

- **Round 1**: 6 parallel researchers, each owning a disjoint gap dimension
- **Round 2** (conditional): Targeted follow-up if critical Q1/Q3/Q7 remain under-sourced
- **Writing**: Lead writes the synthesis after Round 1 evaluation

### Researcher allocations

| Researcher | Dimensions | Questions |
|---|---|---|
| R1 | Developer DevTools + localhost workflow | Q1 |
| R2 | Suckless/minimalist + community threads not yet mined | Q2, Q8 |
| R3 | Academic HCI + quantitative data | Q3, Q7 |
| R4 | Security/privacy + container workflows | Q4 |
| R5 | Session/sync + self-hosted storage | Q5 |
| R6 | Emacs/scripting/automation integration | Q6 |

---

## Acceptance Criteria

- [ ] Q1 answered with ≥3 sources (DevTools keyboard frustrations, REPL accessibility)
- [ ] Q2 answered with ≥2 sources from suckless or minimalist communities
- [ ] Q3 answered: at least 1 peer-reviewed paper on keyboard navigation OR tab overload
- [ ] Q4 answered with ≥2 sources (container management frustrations)
- [ ] Q5 answered with ≥2 sources (sync/session failures)
- [ ] Q6 answered with ≥2 sources (Emacs/org-protocol integration)
- [ ] Q7 answered with at least Vimium install count + one other metric
- [ ] Q8 answered with ≥3 community threads from previously uncovered subreddits
- [ ] All key questions answered with ≥2 independent sources
- [ ] Contradictions identified and addressed
- [ ] New pain points beyond the original 28 are identified

---

## Task Ledger

| ID | Owner | Task | Status | Output |
|---|---|---|---|---|
| T1 | lead | Developer DevTools keyboard/workflow frustrations | **done** | inline (P1, P2, P3) |
| T2 | lead | Suckless/minimalist community + uncovered subreddits | **done** | inline (P15, P16) |
| T3 | lead | Academic HCI research + quantitative install/usage data | **done** | inline (A1-A4, data table) |
| T4 | lead | Security/privacy/container workflow frustrations | **done** | inline (P6, P7) |
| T5 | lead | Session/sync/self-hosted storage frustrations | **done** | inline (P8, P9) |
| T6 | lead | Emacs/scripting/automation/external tool integration | **done** | inline (P10-P14) |
| T7 | lead | Evaluate all dimensions, identify gaps | **done** | Open Questions section |
| T8 | lead | Write synthesis draft | **done** | outputs/.drafts/browser-poweruser-deep-draft.md |
| T9 | superseded | Verifier (rate limit — lead verified inline) | **superseded** | citations embedded in draft |
| T10 | superseded | Reviewer (rate limit — lead reviewed inline) | **superseded** | claim sweep in Part VI |

---

## Verification Log

| Item | Method | Status | Evidence |
|---|---|---|---|
| Vimium install count | Direct fetch Chrome Web Store | pending | - |
| Tridactyl install count | Direct fetch Firefox AMO | pending | - |
| Academic papers on tab cognitive load | arXiv/ACM search | pending | - |
| qutebrowser GitHub star trajectory | GitHub API | pending | - |

---

## Decision Log

- 2026-04-08: Prior research covered surface community threads. This round targets academic, quantitative, privacy, sync, scripting, and minimalist dimensions not touched in round 1.
- 2026-04-08: Slug set to `browser-poweruser-deep`
