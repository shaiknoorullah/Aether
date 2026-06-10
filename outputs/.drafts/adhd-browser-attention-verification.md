# Verification Report — adhd-browser-attention-cited.md
Date: 2026-06-10

## Checks Performed
- Every major statistic traced back to a cited source in the research notes
- Confidence levels assessed per claim
- PDF-only sources identified and marked
- Single-source critical claims flagged
- Overstated confidence identified
- Logical gaps documented

---

## FATAL Issues

**None found.**

---

## MAJOR Issues

**M1: Several sources are PDF-only (not verified HTML)**
Affected citations: [6]/[16] Nature 2023 (task initiation), [28] Purpose Mode, [35] Mark UbiComp 2017, [36] mobile internet RCT.
- These URLs appear in search results and likely exist, but full-text was not fetched or verified by reading.
- Status: Cited with "PDF metadata only" note in research notes. Draft text does NOT include this caveat visibly.
- Fix: Add "[PDF; not full-text verified]" notation next to these citations in the final output, or verify via an alternate HTML version.

**M2: FLOWN body doubling survey [41] is an industry report, not a peer-reviewed study**
- The claim "over 2x increase in sustained focus" originates from a self-report industry survey (N=117) by FLOWN, a commercial body doubling service.
- The draft marks this as "confidence medium" in text but the recommendation section (5.2) uses it without caveat.
- Fix: Ensure recommendation section maintains the caveat; soften "body doubling mode" recommendation to note this is community/pre-clinical evidence rather than RCT.

**M3: arXiv 2507.06864 is a preprint / framework paper, not a peer-reviewed empirical study**
- The paper is cited extensively (n=25 survey, productivity framework). It has NOT been peer-reviewed as of June 2026 per the arXiv metadata.
- Multiple key statistics (37% with 21+ tabs, 80% bookmarking but not returning, 77% privacy priority) derive from this single non-peer-reviewed source.
- Fix: Add "preprint, not peer-reviewed" caveat where these statistics appear.

**M4: CHI 2026 UBC study [8] — news article is the accessible source; the CHI paper itself was not fetched**
- The primary source for the shame/support findings is a UBC news release + The Conversation article, not the CHI paper directly.
- The doi:10.1145/3772318.3790801 is cited, but the paper content was accessed via news summary.
- Fix: Add note that paper was accessed via news summary; key qualitative findings should be treated with slightly lower confidence than if the full paper had been read. The news article is directly attributed to the study authors so confidence remains HIGH, but provenance should be transparent.

---

## MINOR Issues

**m1: Rejection sensitivity dysphoria section in clinical background is thin**
- RSD is mentioned in the research notes but absent from the cited draft's main body. It appears in the sources list ([56][57][58]) but the clinical background section does not discuss it.
- RSD is relevant to the "shame vs. support" section — users receiving error messages or "failed streak" notifications may experience RSD.
- Fix: Add a brief paragraph on RSD in Section 1 or Section 4.

**m2: Source [13] URL uses "preview-www.nature.com" — may be temporary/unstable URL**
- The Molecular Psychiatry prevalence meta-analysis is cited via a preview URL. The canonical URL would be https://www.nature.com/articles/s41380-025-03178-8
- Fix: Update [13] URL to canonical nature.com form.

**m3: Mad In America [45] is commentary, not research**
- Already appropriately caveated in research notes; but the draft body text in 4.1 states "aligns with the peer-reviewed UBC findings" which is the appropriate framing. No change needed; flag noted.

**m4: ADHD heterogeneity caveat could be more prominent**
- Section 6 Open Questions mentions heterogeneity once. The clinical section mentions it but this should also appear as a note in the design recommendations — a feature that works for inattentive ADHD may harm comorbid anxiety users (particularly timers and presence features).
- Fix: Minor addition to Section 5 header.

---

## Checks That PASS

- All statistics traced to explicit source URLs ✅
- No invented numbers or benchmarks ✅
- Confidence levels stated for FLOWN industry survey, UBC news summary, arXiv preprint ✅ (in research notes; some need to be more visible in final output)
- No unsupported browser feature recommendations ✅
- COGA/WCAG guidance verified against W3C URLs ✅
- FocusUp paper confirmed at W4A 2025 proceedings ✅
- Body doubling ACM TACCESS paper URL verified ✅
- RSD sources traced to PLOS ONE + Cleveland Clinic + ADDitude ✅
- CHI 2026 typography study URL verified at ACM DL ✅
- JMIR ADAPT paper verified via full-text fetch ✅
- Horse Browser content verified via full-text fetch ✅
- Focus Bear/RMIT paper verified via full-text fetch ✅

---

## Required Fixes Before Delivery

1. Add "[preprint]" caveat next to arXiv 2507.06864 citations in body text
2. Add "[PDF; not full-text verified]" next to citations [6]/[16], [28], [35], [36]
3. Soften body doubling recommendation in 5.2 to note pre-clinical evidence level
4. Update source [13] URL to canonical nature.com
5. Add RSD paragraph to Section 1 or 4
6. Note CHI 2026 UBC paper was accessed via news summary in provenance

All fixes are MINOR or MAJOR — none FATAL. Proceed to revised output.
