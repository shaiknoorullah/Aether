# Plan: Red-Team Analysis — Why AI-Native Power-User Privacy-First Browsers Fail

**Slug:** browser-failure-redteam
**Date:** 2026-06-10
**Status:** COMPLETE

## Key Questions

1. **Arc post-mortem:** What exactly happened with Arc Browser's wind-down? Timeline, stated reasons, user reaction, what The Browser Company pivoted to. What can be generalized vs. Arc-specific?
2. **Historical failures:** What other ambitious browsers (Vivaldi growth stalls, Brave adoption ceiling, Mighty, SigmaOS, Sidekick, Beam, etc.) have failed or stalled, and what patterns emerge?
3. **Adoption & distribution barriers:** What are the concrete barriers to switching browsers in 2025-2026? OS defaults, enterprise policy, credential migration, extension compatibility, web compat. How large is the addressable market for power-user browsers?
4. **Trust & switching costs:** How do users evaluate trust for a new browser (especially one touching AI + privacy)? What's the empirical switching cost? What triggers churn back to defaults?
5. **Maintenance sustainability:** What does it cost to maintain a browser engine fork (Chromium vs. Firefox) in engineering hours, security patches, and upstream churn? How do small teams cope?
6. **Monetization without surveillance:** What monetization models exist that don't rely on ad-tech/telemetry? Brave BAT, subscriptions, enterprise licensing, search deals. Which actually generate sustainable revenue?
7. **Blind spots & survivability:** What assumptions does a project like Aether implicitly make that could be fatal? Feature bloat, niche-within-niche, AI hype cycle timing, open-source sustainability, regulatory risk.

## Evidence Needed

- Arc wind-down timeline, official statements, press coverage, community reactions (2024-2026)
- Post-mortems or retrospectives from other failed/stalled browsers (Mighty, SigmaOS, Sidekick, Beam, Station)
- Browser market share data (StatCounter, Can I Use, etc.) — current
- Studies or data on browser switching costs and user inertia
- Brave's financial disclosures, user counts, BAT economics
- Chromium/Firefox fork maintenance cost estimates (from Brave, Vivaldi, Waterfox maintainers)
- Monetization case studies: Brave, Vivaldi, Mullvad Browser, Firefox/Mozilla finances
- AI browser features landscape (2025-2026): what shipped, what users actually use
- Regulatory landscape: EU DMA, browser choice screens, antitrust actions
- Expert commentary on browser market dynamics

## Scale Decision

**Broad multi-faceted survey → 4 researcher subagents in parallel**

Rationale: 7 key questions spanning market data, product post-mortems, technical sustainability, and business models. Too many angles for sequential direct search. Grouping into 4 thematic tracks:

| Track | Owner | Focus |
|-------|-------|-------|
| T1 | researcher | Arc post-mortem + other browser failures/stalls (Q1, Q2) |
| T2 | researcher | Adoption barriers, switching costs, market share data (Q3, Q4) |
| T3 | researcher | Fork maintenance costs + monetization models (Q5, Q6) |
| T4 | researcher | AI browser landscape + regulatory + blind spots (Q7 + context) |

## Task Ledger

| Task | Status | Owner | Output File |
|------|--------|-------|-------------|
| T1-T4: Direct research (all tracks) | DONE | lead | browser-failure-redteam-research-direct.md |
| Draft synthesis | DONE | lead | outputs/.drafts/browser-failure-redteam-draft.md |
| Citation & verification | DONE | lead | outputs/.drafts/browser-failure-redteam-cited.md |
| Review | DONE | lead | browser-failure-redteam-verification.md |
| Delivery | DONE | lead | outputs/browser-failure-redteam.md |

## Verification Log

- Subagents failed (module error) — switched to direct search
- Web search all providers rate-limited/unconfigured — used direct URL fetches
- 7 of 12 URLs fetched successfully
- All core quantitative claims verified against fetched sources
- Mighty/SigmaOS/Sidekick claims marked unverified
- Self-review: PASS WITH NOTES (no FATAL/MAJOR issues)

## Decision Log

- 2026-06-10: Chose 4-subagent parallel research — FAILED (module error)
- 2026-06-10: Fell back to direct search mode
- 2026-06-10: Web search blocked (all providers) — used direct URL fetches
- 2026-06-10: Scoped to 2024-2026 era, with historical context where relevant
- 2026-06-10: Treated Arc wind-down as anchor case study
- 2026-06-10: Delivered as PASS WITH NOTES
