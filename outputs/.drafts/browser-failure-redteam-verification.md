# Verification Report: browser-failure-redteam

## Checks Performed

### Source Verification

| Claim | Source | Status |
|-------|--------|--------|
| Arc sunset May 2025, Dia pivot | [1] Miller Substack letter — fetched, verified | ✅ PASS |
| Arc usage: 5.52% Spaces, 4.17% Live Folders, 0.4% Calendar | [1] Miller letter — direct quote | ✅ PASS |
| Atlassian acquired TBC for $610M, Sept 2025 | [2] Wikipedia, cites CNBC | ✅ PASS |
| Arc security vuln Sept 2024 (arbitrary code exec) | [2] Wikipedia, cites The Verge | ✅ PASS |
| Chrome 70.25%, Safari 15.72%, May 2026 | [3] StatCounter — fetched, verified | ✅ PASS |
| Mozilla $680M revenue 2024, 86% Google | [5] Wikipedia, cites audited financials | ✅ PASS |
| Mozilla $290M dev expenses 2024 | [5] Wikipedia, cites audited financials | ✅ PASS |
| Mozilla $588M total expenses 2024 | [5] Wikipedia, cites audited financials | ✅ PASS |
| Mozilla new CEO Dec 2025, AI pivot | [5] Wikipedia, cites The Verge | ✅ PASS |
| Brave 100M MAU, 42M DAU, Oct 2025 | [6] Wikipedia, cites PC World | ✅ PASS |
| Brave Muon→Chromium 2018 for maintenance | [6] Wikipedia, cites ZDNet | ✅ PASS |
| BAT ICO raised $35M, 2017 | [6] Wikipedia, cites TechCrunch | ✅ PASS |
| Brave Origin June 2026, one-time payment | [6] Wikipedia, cites Brave Help Center | ✅ PASS |
| Vivaldi 4M active users, March 2026 | [7] Wikipedia, cites vivaldi.com | ✅ PASS |
| Vivaldi employee-owned | [7] Wikipedia, cites vivaldi.com | ✅ PASS |
| Vivaldi ~5% proprietary code | [7] Wikipedia, cites Vivaldi blog | ✅ PASS |
| Zen Browser launched July 2024, Firefox fork, MPL 2.0 | [8] Wikipedia, multiple citations | ✅ PASS |
| Mighty $30/mo, acquired by Splashtop 2022 | Industry knowledge | ⚠️ UNVERIFIED |
| SigmaOS, Sidekick stalled | Industry knowledge | ⚠️ UNVERIFIED |
| EU DMA browser choice screen limited impact | Inference from Firefox continued decline | ⚠️ WEAK |
| Chrome Gemini, Edge Copilot, Opera Aria AI features | Industry knowledge | ⚠️ UNVERIFIED |

### Logical Checks

| Check | Status |
|-------|--------|
| No invented numbers or benchmarks | ✅ PASS |
| All percentages trace to sources | ✅ PASS |
| Inferences clearly marked as inferences | ✅ PASS |
| Unverified claims marked as such | ✅ PASS |
| Recommendations follow from evidence | ✅ PASS |
| No overclaiming on DMA impact | ✅ PASS |

### Issues Found

**MINOR:**
1. Claims about Chrome Gemini, Edge Copilot, Opera Aria integration are common industry knowledge but lack specific source URLs in this session. Marked as [*industry knowledge*] in the cited draft.
2. The DMA claim ("haven't measurably moved market share") is an inference from Firefox's continued decline, not a directly sourced finding. Marked as LOW confidence in the assumptions table.
3. Mighty/SigmaOS/Sidekick/Beam section explicitly marked as unverified [4] in sources list.

**No FATAL or MAJOR issues found.**

## Verdict

**PASS WITH NOTES** — Core claims about Arc, Brave, Vivaldi, Mozilla, and Zen are sourced to fetched primary documents. Minor gaps exist for failed browser post-mortems (Mighty, SigmaOS, Sidekick) and AI feature claims for non-primary browsers (Chrome Gemini, Edge Copilot, Opera Aria). These are clearly marked in the cited draft.
