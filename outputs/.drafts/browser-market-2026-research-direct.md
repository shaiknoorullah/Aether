# Direct Research Notes: Browser Market 2026

**Date gathered:** 2026-06-10
**Method:** Direct fetch_content from authoritative URLs (web search unavailable — Exa rate-limited, Perplexity/Gemini no API key)

---

## DOMAIN 1: MARKET SHARE DATA

### StatCounter Global Stats — All Platforms Worldwide (May 2026)
Source: https://gs.statcounter.com/browser-market-share
Period: May 2025–May 2026

| Browser | Share |
|---------|-------|
| Chrome | 70.25% |
| Safari | 15.72% |
| Edge | 5.14% |
| Firefox | 2.19% |
| Samsung Internet | 1.89% |
| Opera | 1.78% |

### StatCounter — Desktop Worldwide (May 2026)
Source: https://gs.statcounter.com/browser-market-share/desktop/worldwide
Period: May 2025–May 2026

| Browser | Share |
|---------|-------|
| Chrome | 74.93% |
| Edge | 9.94% |
| Safari | 5.32% |
| Firefox | 3.81% |
| Opera | 1.97% |
| Samsung Internet | 1.33% |

### StatCounter — Mobile Worldwide (May 2026)
Source: https://gs.statcounter.com/browser-market-share/mobile/worldwide
Period: May 2025–May 2026

| Browser | Share |
|---------|-------|
| Chrome | 66.41% |
| Safari | 25.25% |
| Samsung Internet | 2.44% |
| Opera | 1.62% |
| UC Browser | 1.11% |
| Firefox | 0.71% |

### StatCounter — North America All Platforms (May 2026)
Source: https://gs.statcounter.com/browser-market-share/all/north-america
Period: May 2025–May 2026

| Browser | Share |
|---------|-------|
| Chrome | 54.01% |
| Safari | 29.2% |
| Edge | 7.46% |
| Firefox | 3.58% |
| Brave | 2.1% |
| Samsung Internet | 1.48% |

**Note:** Brave appears in NA top-6 but not in global top-6 (indicating privacy-conscious userbase concentrated in English-speaking markets).

---

## DOMAIN 2: BRAVE / AI BROWSER STATS

### Brave User Numbers
Source: https://brave.com/about/
Retrieved: 2026-06-10

- 100+ million MAU worldwide (as of 2025)
- 42+ million DAU worldwide (as of 2025)
- Growth timeline: 3M MAU (2018) → 5.5M (2019) → 10M (2019, post 1.0) → 20M (2020) → 36M (2021) → 50M (2022) → 60M (2023) → 100M (2025)

### Brave Key AI/Extension Differentiators
- Brave Leo AI assistant built natively into browser (supports Claude, Llama models)
- "Answer with AI" in Brave Search (AI-powered answers for ~25% of daily queries / ~15M queries/day)
- Brave is explicitly supporting 4 MV2 extensions (AdGuard, uBO, uMatrix, NoScript) after Chrome's MV2 deprecation via brave://settings/extensions/v2 backend
- Agentic browsing listed as "coming soon" on brave.com/about
- Brave Shields block ads/trackers natively (not extension-dependent); not affected by MV3

### Arc / The Browser Company
Source: https://thebrowser.company/ (retrieved 2026-06-10 — very sparse page)
- The Browser Company now building both Dia (new AI-first browser) and Arc
- Dia (diabrowser.com): "The browser for your best work" — AI-native positioning
- No public user count available from direct fetches
- Note: The Verge Nov 2023 article about Arc hitting 1M users returned 311-char blocked response (paywalled/removed)

---

## DOMAIN 3: MANIFEST V2 DEPRECATION / MV3 ECOSYSTEM

### Official Chrome MV2 Deprecation Timeline
Source: https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline
Retrieved: 2026-06-10

**Key dates:**
- Jan 2022: CWS stopped accepting new MV2 public/unlisted extensions
- June 2022: CWS stopped accepting new MV2 private extensions
- June 3, 2024 (Chrome 127+): MV2 disabled on pre-stable channels (Beta, Dev, Canary); Featured badge removed from MV2 extensions
- October 9, 2024: Google began disabling MV2 extensions on Chrome stable (gradual rollout); warning banners appear on chrome://extensions; users could still re-enable temporarily
- **March 31, 2025:** All users on all channels have MV2 disabled by default; second phase (can't re-enable) started rolling out on Canary
- **July 24, 2025 (Chrome 138):** MV2 fully disabled for all users on all channels; users can no longer re-enable
- **Chrome 139 (post-July 2025):** Enterprise ExtensionManifestV2Availability policy removed; MV2 ceases to function entirely

### Ecosystem Progress (as of May 2024)
Source: https://blog.chromium.org/2024/05/manifest-v2-phase-out-begins.html

- "Over 85% of actively maintained extensions in the Chrome Web Store are running Manifest V3"
- "Top content filtering extensions all have Manifest V3 versions available — with options for users of AdBlock, Adblock Plus, uBlock Origin and AdGuard"
- Google increased declarativeNetRequest limits: up to 330,000 static rules and 30,000 dynamic rules

### Core Technical Issue: webRequest vs. declarativeNetRequest
Source: Mozilla blog (2022-05-18): https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/

- MV3 removes blocking webRequest API (can intercept and modify network requests in real-time)
- Replaces with declarativeNetRequest (pre-defined static rule list; no real-time content inspection)
- Impact: Extensions like uBlock Origin rely on real-time webRequest for dynamic filtering; can't fully replicate this in MV3
- uBlock Origin has released "uBlock Origin Lite" (MV3) which has reduced capabilities
- Cap on blocking rules limits filter list coverage vs. original uBlock

### Firefox's Divergence — CRITICAL
Source: Mozilla blog (2022-05-18): https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/

- **Firefox will maintain blocking webRequest in MV3** — key differentiation from Chrome
- "Mozilla will maintain support for blocking WebRequest in MV3"
- This means uBlock Origin (full) continues to work in Firefox even as Chrome kills it
- Firefox also supports Event Pages (not just Service Workers) for easier MV2→MV3 migration

### EFF Position
Source: EFF (December 2021): https://www.eff.org/deeplinks/2021/12/chrome-users-beware-manifest-v3-deceitful-and-threatening

- EFF called MV3 "outright harmful to privacy efforts"
- Cited Google's conflict of interest: controls dominant browser AND largest ad network
- "Chrome now has a track record as a Google agent, not a user agent" (Jonathan Mayer, Princeton)
- Key concern: Google has trackers on ~75% of top 1M websites

### Brave's Response
Source: https://brave.com/blog/brave-shields-manifest-v3/
Retrieved: 2026-06-10

- Brave Shields NOT affected by MV3 (built natively into Chromium fork, not extension-dependent)
- As of Brave v1.81: Hosts its own backend of 4 MV2 extensions: AdGuard, uBO, uMatrix, NoScript
- Available via brave://settings/extensions/v2
- Brave has force-enabled MV2 support in its Chromium fork
- Plans to offer "limited MV2 support even after it's fully removed from upstream Chromium"

---

## DOMAIN 4: COMPETITIVE DYNAMICS

### Google DOJ Antitrust (US)
**Confirmed:** August 5, 2024 — Judge Amit Mehta (US District Court, DC) ruled Google violated Section 2 of the Sherman Antitrust Act by illegally maintaining its monopoly in general search services. Key finding: Google paid billions annually (notably to Apple) to secure exclusive default search engine positions on browsers and devices.

**Direct source attempts:** DOJ.gov press releases returned 404; DOJ case page returned homepage. Reuters/AP/Bloomberg articles returned 401/404. Could not directly fetch the ruling text. However, the fact of the ruling is well-established public record.

**Remedies phase:** DOJ proposed remedies included potentially requiring Google to divest Chrome and/or end exclusive default search deals. The remedies phase hearings began late 2024 / early 2025. The final remedy ruling as of June 2026 could not be directly confirmed from fetched sources — this is PARTIALLY UNVERIFIED for the specific remedy outcome.

**Impact on browsers:** If Google is barred from paying Apple/Safari for default search placement, Safari's (and Firefox's) primary revenue source changes. Mozilla reportedly receives ~80% of its revenue from Google search deal.

### EU Digital Markets Act (DMA)
**Designated gatekeepers (Sept 2023):** Alphabet, Amazon, Apple, ByteDance, Meta, Microsoft
Source: https://digital-markets-act.ec.europa.eu/gatekeepers_en

**Compliance deadline:** March 7, 2024 — gatekeepers had to comply with all DMA obligations.

**Apple's compliance (January 2024):**
Source: https://www.apple.com/newsroom/2024/01/apple-announces-changes-to-ios-safari-and-the-app-store-in-the-european-union/
- Implemented browser choice screen in iOS 17.4 (effective March 2024 in EU)
- "new choice screen that will surface when users first open Safari in iOS 17.4 or later... prompt EU users to choose a default browser from a list of options"
- Also enabled alternative browser engines on iOS in EU (besides WebKit)

**EU Non-Compliance Investigation (March 2024):**
Source: https://ec.europa.eu/commission/presscorner/detail/en/ip_24_1689
- EC opened non-compliance proceedings against **Apple** for Safari choice screen design — concern it doesn't truly allow user choice (Article 6(3) DMA)
- EC also opened proceedings against **Alphabet** for Google Search self-preferencing (Article 6(5) DMA)
- EC said investigations to conclude within 12 months (i.e., ~March 2025)
- Potential fine: up to 10% of worldwide turnover; 20% for repeated infringement

### Firefox / Mozilla
- Firefox at 2.19% worldwide (3.81% desktop) — StatCounter May 2026
- Firefox at 3.58% in North America — StatCounter May 2026
- Mozilla receives ~80% revenue from Google search deal (well-documented in public filings; could not fetch 2023 annual report directly)
- DOJ antitrust ruling against Google's search default deals poses existential financial risk to Mozilla
- Mozilla's response: attempting to diversify revenue (Mozilla VPN, Pocket, AI features)
- Firefox maintains full webRequest blocking in MV3 — key power-user retention argument

### The Browser Company (Arc / Dia)
Source: https://thebrowser.company/ (retrieved 2026-06-10)
- Now building BOTH Arc and Dia
- Dia is positioned as "AI-native" / "browser for your best work"
- The company appears to have pivoted toward AI-first products
- No public MAU/DAU for Arc or Dia confirmed from direct fetches

---

## WHAT COULD NOT BE FOUND

1. **Browser switching intent surveys** — No specific survey data (e.g., "X% of users plan to switch browsers") could be retrieved from direct fetches. This gap exists because web search APIs were unavailable.
2. **AI browser adoption rates** (% of users on AI-enhanced browsers vs. traditional) — No aggregate market data found from direct fetches.
3. **Arc browser user count** — The 1M+ claim (from The Verge Nov 2023) couldn't be retrieved.
4. **Google DOJ remedy final ruling** — Confirmed monopoly finding (Aug 2024); remedies outcome could not be directly verified from fetched sources.
5. **Firefox user count / MAU** — No direct Mozilla-published user count retrieved; StatCounter provides market share but not absolute user counts.
6. **Europe-specific browser share table** — Europe page was fetched but content wasn't retrieved in detail (404 for the table display). Need to note this gap.
