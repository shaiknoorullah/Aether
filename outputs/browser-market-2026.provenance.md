# Provenance: Web Browser Market in 2026

- **Date:** 2026-06-10
- **Research rounds:** 1 (direct-search mode; researcher subagents failed with module error)
- **Degraded mode:** Yes — researcher subagents failed (cannot find module '--mode'); all evidence gathered by lead agent directly via `fetch_content`; web search APIs unavailable (Exa rate-limited, Perplexity/Gemini no API key configured)

## Sources Consulted

| # | Source | URL | Status |
|---|--------|-----|--------|
| 1 | StatCounter GlobalStats — All platforms worldwide | https://gs.statcounter.com/browser-market-share | Fetched ✓ |
| 2 | StatCounter GlobalStats — Desktop worldwide | https://gs.statcounter.com/browser-market-share/desktop/worldwide | Fetched ✓ |
| 3 | StatCounter GlobalStats — Mobile worldwide | https://gs.statcounter.com/browser-market-share/mobile/worldwide | Fetched ✓ |
| 4 | StatCounter GlobalStats — North America | https://gs.statcounter.com/browser-market-share/all/north-america | Fetched ✓ |
| 5 | Chrome Developers — MV2 Support Timeline | https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline | Fetched ✓ |
| 6 | Chromium Blog — MV2 Phase-out Begins (May 2024) | https://blog.chromium.org/2024/05/manifest-v2-phase-out-begins.html | Fetched ✓ |
| 7 | Chrome Blog — Resuming transition to MV3 (Nov 2023) | https://developer.chrome.com/blog/resuming-the-transition-to-mv3 | Fetched ✓ |
| 8 | Mozilla Add-ons Blog — MV3 in Firefox (May 2022) | https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/ | Fetched ✓ |
| 9 | EFF — Chrome Users Beware: MV3 (Dec 2021) | https://www.eff.org/deeplinks/2021/12/chrome-users-beware-manifest-v3-deceitful-and-threatening | Fetched ✓ |
| 10 | Brave — About Brave (user stats) | https://brave.com/about/ | Fetched ✓ |
| 11 | Brave — Shields + MV3 blog | https://brave.com/blog/brave-shields-manifest-v3/ | Fetched ✓ |
| 12 | Apple Newsroom — DMA Changes (Jan 2024) | https://www.apple.com/newsroom/2024/01/apple-announces-changes-to-ios-safari-and-the-app-store-in-the-european-union/ | Fetched ✓ |
| 13 | European Commission — DMA Non-Compliance Investigations (Mar 2024) | https://ec.europa.eu/commission/presscorner/detail/en/ip_24_1689 | Fetched ✓ |
| 14 | EU Digital Markets Act — Designated Gatekeepers | https://digital-markets-act.ec.europa.eu/gatekeepers_en | Fetched ✓ |
| 15 | The Browser Company — Homepage | https://thebrowser.company/ | Fetched ✓ (sparse content) |
| 16 | StatCounter GlobalStats — 2025 worldwide (historical) | https://gs.statcounter.com/browser-market-share/all/worldwide/2025 | Fetched ✓ |

## Sources Rejected / Blocked

| Source | URL | Reason |
|--------|-----|--------|
| DOJ Google Antitrust case page | https://www.justice.gov/atr/case/us-v-google-llc-1 | Returned homepage (404) |
| Reuters Google antitrust ruling | https://www.reuters.com/technology/google-loses-landmark-us-antitrust-case-search-2024-08-05/ | 401 Forbidden |
| TechCrunch DOJ Google | https://techcrunch.com/2024/08/05/... | 404 Not Found |
| Ars Technica antitrust pieces | https://arstechnica.com/tech-policy/... | 311-char truncated (paywalled) |
| The Verge antitrust pieces | https://www.theverge.com/... | 404 Not Found |
| The Verge Arc 1M users | https://www.theverge.com/24148971/... | 404 Not Found |
| Brave blog MV2 (blog.brave.com) | Various | 404 Not Found |
| Mozilla blog annual report | https://blog.mozilla.org/en/mozilla/mozilla-annual-report-2023/ | 404 Not Found |
| Mozilla Foundation 2024 report | https://foundation.mozilla.org/en/blog/2025-mozilla-foundation-state-of-mozilla-report/ | 404 Not Found |
| Firefox user activity data | https://data.firefox.com/dashboard/user-activity | 1346 chars (no data) |

## Verification

**PASS WITH NOTES**

All critical quantitative claims (market share percentages, MV2 deprecation dates, Brave MAU) trace to directly fetched primary sources. Three categories of unverified/partial claims are explicitly flagged in the final document:

1. **DOJ remedy final outcome** — labeled UNVERIFIED
2. **Mozilla ~80% revenue from Google** — labeled PARTIALLY UNVERIFIED
3. **Apple/Google search deal dollar value** — downgraded to "multi-billion, per trial testimony widely reported, direct source not fetched"

No fabricated statistics were used. Switching intent section explicitly states no survey data was retrieved and labels all inferences as [INFERENCE].

## Files

- **Plan:** outputs/.plans/browser-market-2026.md
- **Research notes:** outputs/.drafts/browser-market-2026-research-direct.md
- **Draft:** outputs/.drafts/browser-market-2026-draft.md
- **Cited draft:** outputs/.drafts/browser-market-2026-cited.md
- **Verification log:** outputs/.drafts/browser-market-2026-verification.md
- **Final output:** outputs/browser-market-2026.md
- **Provenance:** outputs/browser-market-2026.provenance.md
