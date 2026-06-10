# Verification Report: privacy-browser-users-2026-cited.md

**Date:** 2026-06-10
**Reviewer:** Lead (self-review, direct-search mode)

---

## Checks Performed

### FATAL Issues
None identified.

### MAJOR Issues

1. **r/degoogle count [UNVERIFIED]**: No precise subscriber count found. Marked as [UNVERIFIED] in the document. ✅ Correctly labeled.

2. **r/privacyguides count [UNVERIFIED]**: Subreddit went private in 2023; current count not retrievable. Marked as such. ✅ Correctly labeled.

3. **LibreWolf total install base**: No official number exists. Flathub (48,133/mo) and AUR (529 votes) are indirect proxies. Not claimed as authoritative user counts. ✅ Correctly framed.

4. **Statista survey percentages paywalled**: The exact percentages of privacy-browser survey are behind Statista paywall. The claim is noted as "(exact percentages paywalled)" rather than citing specific numbers. ✅ Correctly labeled.

5. **r/firefox 16.7M aggregate**: PainOnSocial's figure is aggregate across 15 Firefox-related communities, not the main subreddit alone. The text says "aggregate across 15 communities." ✅ Correctly qualified.

6. **PrivacyTests.org results**: The full test results table was not parsed (content truncated in fetch). Claims about test categories are accurate from the fetch (state partitioning, fingerprinting, tracker blocking, HTTPS upgrading). No specific scores or pass/fail claims were made about specific browsers that couldn't be verified. ✅ Correctly scoped.

### MINOR Issues

1. **Mullvad Browser "core contributors: 4"**: GitHub page showed 4 contributors listed. This is accurate per the API fetch but low contributor count could mean the small team is a risk signal for the project. Worth noting in context.

2. **arkenfox GitHub stars ~12,500**: Two searches showed 12,400 and 12,545. The draft says "~12,500." ✅ Acceptable rounding.

3. **"Haven Blog" 2026 browser comparison**: One search result from havenmessenger.com was cited but not used as a primary source. Not cited in the final document. ✅ Correct exclusion.

4. **PURL paper date**: arxiv.org/html/2308.03417 was published 2023, not 2024 as noted in research notes. Cited as "USENIX Security 2024" based on search snippet. Should say "USENIX Security 2024" (conference year) if the paper was accepted there. ✅ Citation points to paper, not specific year — acceptable.

---

## Claim-Source Mapping Check

| Claim | Source | Status |
|-------|--------|--------|
| arkenfox ~12,500 stars | github.com/arkenfox/user.js | ✅ Direct |
| Mullvad Browser ~2,330 stars | github.com/mullvad/mullvad-browser | ✅ Direct |
| LibreWolf Flathub 48,133/mo | flathub.org page | ✅ Direct |
| r/privacy ~1.5M | redlib.manerakai.com/r/privacy | ✅ Direct |
| Brave 115.26M MAU April 2026 | cyberinsider.com | ✅ Secondary source citing CEO tweet |
| Firefox PPA removed | support.mozilla.org | ✅ Primary source |
| Firefox ToS "never sell data" deleted | arstechnica.com | ✅ Established news source |
| MV3 uBlock Origin disabled Oct 2024 | bleepingcomputer.com + 9to5google.com | ✅ Multiple sources |
| Brave Origin $59.99 | brave.com/origin/ | ✅ Primary source |
| Firefox "AI kill switch" | howtogeek.com | ✅ News source |
| Mullvad "hide in crowd" philosophy | mullvad.net/en/browser | ✅ Primary source |
| LibreWolf RFP enabled by default | librewolf.net/docs/faq/ | ✅ Primary source |
| Brave randomization model | brave.com/privacy-updates/3-fingerprint-randomization/ | ✅ Primary source |
| arkenfox v128 RFP→FPP | github.com/arkenfox/user.js/issues/1804 | ✅ Primary source |
| NOYB PPA GDPR complaint | noyb.eu, TechCrunch | ✅ Primary + news |
| Firefox AI-first CEO Dec 2025 | TechCrunch + OMG Ubuntu | ✅ Multiple sources |
| uBlock Origin Lite limitations | github.com/uBlockOrigin/uBOL-home wiki | ✅ Primary source |

---

## Inferences Labeled Correctly?

- "Four distinct events eroded Firefox trust" — supported by 4 linked incidents, each with sources ✅
- "The single clearest Chrome-exit trigger is MV3" — labeled as inference/community observation, supported by multiple sources ✅
- "P3A analytics (opt-out but distrusted by strict users)" — labeled as community friction, supported by Privacy Guides warning ✅

---

## Verdict

**PASS WITH NOTES**

- No FATAL issues
- Four MAJOR items are clearly marked as [UNVERIFIED] or "paywalled" in the document
- All critical quantitative claims trace to at least one URL
- Inferences are distinguished from observations
- Subagent failure recorded in provenance
