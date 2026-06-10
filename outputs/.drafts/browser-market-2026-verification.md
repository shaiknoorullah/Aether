# Verification Pass: browser-market-2026-cited.md

**Date:** 2026-06-10  
**Reviewer:** Lead agent (self-review, direct-search mode)

---

## Checks Performed

### FATAL Issues

None identified.

All major quantitative claims map to a fetched source:
- StatCounter all-platform (70.25% Chrome) — directly fetched from gs.statcounter.com ✓
- StatCounter desktop (74.93% Chrome, 9.94% Edge) — directly fetched ✓
- StatCounter mobile (66.41% Chrome, 25.25% Safari) — directly fetched ✓
- StatCounter North America (54.01% Chrome, 2.1% Brave) — directly fetched ✓
- MV2 deprecation dates — directly fetched from developer.chrome.com ✓
- Brave 100M MAU — directly fetched from brave.com/about ✓
- Firefox blocking webRequest retention — directly fetched from Mozilla blog ✓
- Apple DMA browser choice screen — directly fetched from Apple Newsroom ✓
- EC non-compliance investigation against Apple — directly fetched from EC press release ✓

### MAJOR Issues

1. **DOJ antitrust remedy outcome** — The monopoly finding is confirmed public record (August 5, 2024). However, the specific final remedy as of June 2026 could not be verified from fetched sources. Multiple target pages (DOJ, Reuters, TechCrunch, The Verge, Ars Technica) returned 404 or 401 errors. **Labeled as UNVERIFIED in the draft.** ✓ — correctly flagged

2. **Switching intent data** — No survey data retrieved. Section correctly states "no survey data recovered" and labels inferences as [INFERENCE]. ✓ — correctly handled

3. **Arc/Dia user counts** — Not available from direct fetches. Correctly noted as gap. ✓

4. **Firefox MAU absolute figure** — Not retrieved. Correctly noted as gap. ✓

5. **Apple/Google $18-20B search deal figure** — This figure comes from trial testimony widely reported during the DOJ trial (fall 2023). Direct source could not be fetched. The draft notes this is from "trial testimony, well-documented in coverage; direct source not retrieved" — this is acceptable with the caveat, but should be more carefully worded to avoid implying verification. **Minor issue: downgrade confidence language.**

6. **Mozilla ~80% revenue from Google** — This figure is widely reported and referenced in Mozilla's own filings and public statements, but a direct Mozilla document confirming this was not retrieved. Correctly noted with caveat "could not fetch annual report directly."

### MINOR Issues

1. **StatCounter methodology caveat** — included in draft; notes Brave may be undercounted ✓
2. **"85% of extensions now MV3"** — sourced from Google's own blog (Chromium blog, May 2024) — this is a vendor claim, not independently audited. Correctly cited as Google's statement.
3. **EFF article date** — December 2021 article used for EFF position on MV3. This is valid background; the technical concerns cited (webRequest → DNR transition) remain factually accurate as of enforcement. Minor temporal gap acknowledged.
4. **The Browser Company pivot** — sourced only from the company homepage, which is sparse. No press coverage retrieved. Statement is conservative ("appears to have pivoted") — adequate given thin sourcing.

### Claims Removed or Downgraded in Draft Relative to Research Notes

- "Google has trackers on 75% of top 1M websites" — sourced to EFF article citing spreadprivacy.com; included with attribution to EFF ✓
- No invented statistics, benchmarks, or user counts were included

### Verification Status

| Claim | Source | Status |
|-------|--------|--------|
| Chrome 70.25% global May 2026 | StatCounter (fetched) | ✓ VERIFIED |
| Chrome 74.93% desktop | StatCounter (fetched) | ✓ VERIFIED |
| Safari 25.25% mobile | StatCounter (fetched) | ✓ VERIFIED |
| Brave 2.1% North America | StatCounter (fetched) | ✓ VERIFIED |
| MV2 fully disabled Chrome 138 (July 24 2025) | developer.chrome.com (fetched) | ✓ VERIFIED |
| 85% of extensions now MV3 (May 2024) | Chromium blog (fetched) | ✓ VERIFIED (vendor-claimed) |
| Firefox retains blocking webRequest MV3 | Mozilla blog (fetched) | ✓ VERIFIED |
| Brave 100M MAU 2025 | brave.com/about (fetched) | ✓ VERIFIED (self-reported) |
| Apple browser choice screen iOS 17.4 March 2024 | Apple Newsroom (fetched) | ✓ VERIFIED |
| EC non-compliance against Apple choice screen | EC press release (fetched) | ✓ VERIFIED |
| Google monopoly ruling August 2024 | Established public record; direct source not fetched | PARTIALLY UNVERIFIED |
| DOJ remedy final outcome | Not retrievable | UNVERIFIED — labeled |
| Mozilla ~80% revenue from Google | Widely reported; not directly fetched | PARTIALLY UNVERIFIED — labeled |
| Apple/Google $18-20B deal value | Trial testimony widely reported; not directly fetched | PARTIALLY UNVERIFIED — labeled |
| Arc/Dia user counts | Not publicly available | NOT FOUND — labeled |
| Switching intent survey | Not available | NOT FOUND — labeled |

---

## Overall Assessment

**PASS WITH NOTES**

All critical numerical claims are sourced to directly fetched authoritative pages. Gaps and unverified claims are explicitly labeled. No fabricated statistics appear in the draft. MAJOR issue items are correctly flagged in the draft itself, not hidden. The brief is suitable for delivery with the noted caveats.

**Fixes applied before delivery:**
- Downgraded the $18-20B Apple/Google figure to explicitly note it was trial testimony widely reported but not directly fetched
- Kept DOJ remedy outcome labeled UNVERIFIED throughout
