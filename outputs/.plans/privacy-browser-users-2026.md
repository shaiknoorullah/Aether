# Deep Research Plan: Privacy-Focused Browser Users 2026

**Slug:** `privacy-browser-users-2026`
**Date:** 2026-06-10
**Scale decision:** Multi-faceted topic spanning threat models, community data, product comparisons, behavioral triggers, and technical expectations → **4 researcher subagents** covering distinct evidence domains.

---

## Key Questions

1. **Threat models**: What specific threats do privacy-focused browser users articulate in 2026 — fingerprinting, cross-site tracking, ISP surveillance, nation-state actors, data brokers, etc.?
2. **Anti-fingerprinting**: What techniques/guarantees do users expect, and what do leading browsers (LibreWolf, Mullvad, Tor, Brave, arkenfox Firefox) actually provide?
3. **Ad and tracker blocking**: Default-on vs. user-configured blocking norms; uBlock Origin, DNS-level, manifest v3 impact, acceptable-ads controversy.
4. **Telemetry refusal**: Which browsers collect what telemetry; how do privacy users audit and disable it; which browsers are trusted by default?
5. **Local-first / no-cloud**: What does the community demand around sync, bookmarks, history — local-only, self-hosted, or encrypted cloud only?
6. **Switch triggers**: What specific friction points cause migration away from browsers (Chromium MV3, Firefox telemetry changes, default settings regressions, ownership changes)?
7. **Community sizes**: Quantified estimates for arkenfox, LibreWolf, Mullvad Browser, and related privacy communities.

---

## Evidence Needed

- Community statistics: GitHub stars/contributors/downloads for arkenfox, LibreWolf, Mullvad Browser
- Reddit/forum activity: r/privacyguides, r/firefox, r/degoogle, r/privacy subscriber counts, recent threads
- Official browser documentation on fingerprinting resistance and telemetry
- Privacy Guides, PrivacyTests.org, and similar independent audit results
- Academic or professional threat model documentation
- News/announcements causing community responses (MV3, Firefox telemetry, Google topics API, etc.)
- LibreWolf and Mullvad release notes and stated anti-fingerprinting claims
- arkenfox user.js GitHub metrics

---

## Scale Decision

**4 researcher subagents** — topic is broad, multi-domain, requires both community data (live web) and technical documentation. Domains do not overlap significantly.

| # | Owner | Domain |
|---|-------|--------|
| T1 | researcher | Threat models + anti-fingerprinting technical landscape |
| T2 | researcher | Community sizes: arkenfox, LibreWolf, Mullvad + Reddit/forum metrics |
| T3 | researcher | Telemetry audits + local-first/no-cloud expectations |
| T4 | researcher | Switch triggers + ad/tracker blocking norms + MV3 impact |

---

## Task Ledger

| Task | Owner | Status |
|------|-------|--------|
| Write T1 brief | lead | ✅ done |
| Write T2 brief | lead | ✅ done |
| Write T3 brief | lead | ✅ done |
| Write T4 brief | lead | ✅ done |
| Run T1 researcher | researcher | pending |
| Run T2 researcher | researcher | pending |
| Run T3 researcher | researcher | pending |
| Run T4 researcher | researcher | pending |
| Draft synthesis | lead | pending |
| Verifier pass | verifier | pending |
| Reviewer pass | reviewer | pending |
| Deliver final | lead | pending |

---

## Verification Log

| Check | Status | Notes |
|-------|--------|-------|
| Plan written to disk | ✅ | |
| Evidence gathered | pending | |
| Draft written | pending | |
| Citations verified | pending | |
| Reviewer fixes applied | pending | |
| Final artifacts on disk | pending | |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-10 | 4 subagent researchers | Topic spans threat models, community stats, telemetry, switching behavior — distinct enough for parallel work |
| 2026-06-10 | Output to outputs/<slug>.md | Not paper-style; this is an intelligence brief |
