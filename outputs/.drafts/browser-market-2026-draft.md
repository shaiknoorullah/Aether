# Web Browser Market in 2026: Market Share, AI Adoption, Extension Ecosystem, and Competitive Dynamics

*Research draft — 2026-06-10*

---

## Executive Summary

Chrome retains commanding global dominance at 70.25% of all-platform web traffic, a position that has not fundamentally shifted despite regulatory and competitive pressure. Safari is the clear second at 15.72% globally, buoyed by iOS market growth. Edge holds a meaningful 5.14% share—primarily on Windows desktop (9.94% of desktop). Firefox has contracted to 2.19% worldwide, with its independent survival under material threat from the DOJ antitrust proceedings against Google's search default payments. 

The extension ecosystem has undergone its most significant structural change since the Chrome App Store era: Manifest V3 fully superseded MV2 in Chrome as of July 2025. uBlock Origin in its full-featured form no longer works in Chrome; a reduced MV3 version ("uBlock Origin Lite") is available but with degraded capability. Firefox's decision to retain blocking webRequest in its MV3 implementation has become a genuine differentiator for privacy-focused users. Brave exploits the same gap from the browser side.

AI-native browser integration is accelerating primarily via incumbents: Microsoft Edge (Copilot), Brave (Leo/agentic browsing), and Opera (Aria). The Browser Company has pivoted Arc's successor toward "Dia," an AI-first product, but public user statistics are limited. Brave is the most statistically visible privacy/AI challenger, with 100M+ MAU as of 2025.

The competitive landscape is being reshaped by two regulatory forces: the EU Digital Markets Act (DMA) requiring browser choice screens and alternative engine access on iOS; and the US DOJ's 2024 monopoly ruling against Google, which threatens the exclusive default search deals that fund both Chrome's distribution advantage and Mozilla Firefox's operating budget.

---

## 1. Market Share by Browser (May 2026)

### 1.1 All Platforms, Worldwide

**Source:** StatCounter GlobalStats — https://gs.statcounter.com/browser-market-share  
**Period:** May 2025–May 2026 (most recent monthly snapshot: May 2026)

| Browser | Global Share (All Platforms) |
|---------|------------------------------|
| Chrome | **70.25%** |
| Safari | 15.72% |
| Edge | 5.14% |
| Firefox | 2.19% |
| Samsung Internet | 1.89% |
| Opera | 1.78% |
| Other (incl. Brave, UC Browser) | ~3.03% |

**Methodology note:** StatCounter measures via page view sampling across ~1.5M websites that use their tracking tag. This methodology over-represents active browsing sessions and may under-represent mobile browsers with aggressive caching. It does not track private/incognito sessions.

### 1.2 Desktop Only, Worldwide

**Source:** StatCounter — https://gs.statcounter.com/browser-market-share/desktop/worldwide  
**Period:** May 2025–May 2026

| Browser | Desktop Share |
|---------|--------------|
| Chrome | **74.93%** |
| Edge | 9.94% |
| Safari | 5.32% |
| Firefox | 3.81% |
| Opera | 1.97% |
| Samsung Internet | 1.33% |

Edge's desktop share (9.94%) reflects its pre-installation on all Windows 10/11 machines. Firefox retains roughly double its mobile share on desktop (3.81% vs. 0.71%), consistent with its historical concentration in developer and power-user segments.

### 1.3 Mobile Only, Worldwide

**Source:** StatCounter — https://gs.statcounter.com/browser-market-share/mobile/worldwide  
**Period:** May 2025–May 2026

| Browser | Mobile Share |
|---------|-------------|
| Chrome | **66.41%** |
| Safari | 25.25% |
| Samsung Internet | 2.44% |
| Opera | 1.62% |
| UC Browser | 1.11% |
| Firefox | 0.71% |

Safari's mobile presence (25.25%) is almost entirely explained by iOS lock-in: Apple has been the exclusive default browser engine on iOS globally, though the EU's DMA (see Section 5) now requires alternative engine support and browser choice screens in the EU (effective March 2024).

### 1.4 North America, All Platforms

**Source:** StatCounter — https://gs.statcounter.com/browser-market-share/all/north-america  
**Period:** May 2025–May 2026

| Browser | North America Share |
|---------|-------------------|
| Chrome | 54.01% |
| Safari | 29.2% |
| Edge | 7.46% |
| Firefox | 3.58% |
| **Brave** | **2.1%** |
| Samsung Internet | 1.48% |

Notably, **Brave appears in the North American top-6** (2.1%) but not in the global top-6, confirming its concentration in English-speaking, privacy-aware markets. Chrome's lower North American share (54% vs. 70% globally) reflects higher iOS penetration in the US, which maps to Safari use.

### 1.5 Key Observations on Share Dynamics

- **Chrome's dominance is structurally stable** but concentrated on Android. iOS growth favors Safari.
- **Firefox is in secular decline** — dropping below 2.5% globally and sub-1% on mobile. The desktop figure (3.81%) is primarily held by existing technical/developer users.
- **Brave registers in regional breakdowns** but is below StatCounter's global "other" threshold (~3%). Its 100M+ MAU claim (from Brave's own data) implies a share that StatCounter's methodology may undercount, as Brave blocks many tracking tags.
- **Edge's 9.94% desktop** share is substantial and largely structural (Windows OEM default), not earned by user preference. Whether it converts to active use remains unclear.

---

## 2. Switching Intent

**Data status: LIMITED — no survey data retrieved from direct fetches.**

No publicly accessible switching intent survey data (e.g., "X% of users plan to switch in 2026") was recoverable via direct URL fetches during this research run. Web search APIs were unavailable. The following observations are drawn from structural data and market context, labeled as [INFERENCE]:

- [INFERENCE] The MV3 enforcement (Chrome disabling uBlock Origin full version in 2024–2025) likely drove switching intent among ad-blocking-dependent users. Brave explicitly positions its MV2 extension support and native Shields as the migration path.
- [INFERENCE] EU browser choice screen (iOS 17.4, March 2024) likely drove some Safari→alternative switching in EU markets; EC opened non-compliance proceedings against Apple for the design, suggesting impact was limited.
- [INFERENCE] Mozilla's "we need more browsers" rhetoric (seen in blog post titles) suggests Firefox is appealing to users alienated by Chrome's MV3 changes.
- Brave's growth from 60M MAU (2023) to 100M+ MAU (2025) — a 67% increase in two years — represents concrete evidence of user switching at scale, though absolute share numbers remain below 2-3% globally.

**Gap:** No cross-browser NPS data, stated intention surveys, or exit-reason data was retrieved. This is a known gap.

---

## 3. AI-Browser Adoption

**Data status: PARTIAL — vendor-reported figures for Brave; no aggregate AI-browser market share.**

### 3.1 Brave

**Source:** https://brave.com/about/ (retrieved 2026-06-10)

- **100M+ MAU** worldwide as of 2025 (self-reported, no third-party audit cited)
- **42M+ DAU** worldwide as of 2025
- **Brave Leo** (AI assistant): integrated natively, uses Claude and Llama models, available desktop and mobile. No separate adoption rate statistic published.
- **Brave Search Answer with AI**: AI-powered answers for approximately 25% of daily queries (~15M/day out of 53M+ daily queries). This is the largest cited AI browser/search adoption figure with explicit quantification from Brave.
- Agentic browsing: announced as "coming soon" — not yet in production as of the retrieved page date.

### 3.2 Microsoft Edge (Copilot)
No direct statistics retrieved. Edge has 9.94% global desktop share and is pre-installed on Windows 11. Microsoft has integrated Copilot into Edge's sidebar, making it the most widely distributed AI-browser by install base [INFERENCE based on market share + product announcements]. Specific active AI feature usage rates were not retrievable.

### 3.3 The Browser Company (Arc / Dia)
**Source:** https://thebrowser.company/ (retrieved 2026-06-10 — minimal content)
- The Browser Company is actively building both **Arc** (existing browser) and **Dia** (new AI-native product)
- Dia's positioning: "The browser for your best work" — emphasizes AI-native workflow
- **No public MAU/DAU** for Arc or Dia found via direct fetches
- The company appears to have pivoted its primary product focus toward AI-first browsing (Dia) rather than Arc's spatial tab management

### 3.4 Opera (Aria)
Opera held 1.78% global share (May 2026, StatCounter). Opera Aria is a built-in AI assistant. No adoption rate statistics retrieved.

### 3.5 Observations
- AI-browser features are now standard on all major browsers (Chrome/Gemini, Edge/Copilot, Safari/Apple Intelligence, Brave/Leo, Opera/Aria, Firefox/partnerships)
- Brave is the only challenger browser with verifiable user growth trajectory that aligns with AI feature timing
- There is no publicly available aggregate "AI-browser adoption rate" metric that measures what share of browser users actively use AI features

---

## 4. Manifest V2 Deprecation vs. V3 Limits

### 4.1 The MV3 Enforcement Timeline (Chrome)

**Source:** https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline (retrieved 2026-06-10)

| Date | Event |
|------|-------|
| Jan 2022 | CWS stops accepting new MV2 public/unlisted extensions |
| June 2022 | CWS stops accepting new MV2 private extensions |
| June 3, 2024 | MV2 disabled on Chrome pre-stable (Beta/Dev/Canary); Featured badge removed |
| Oct 9, 2024 | MV2 extensions begin disabling on Chrome Stable (gradual rollout) |
| March 31, 2025 | MV2 disabled by default for all users on all channels (re-enable option still available) |
| **July 24, 2025** | **MV2 fully disabled everywhere; users cannot re-enable (Chrome 138)** |
| Chrome 139+ | Enterprise ExtensionManifestV2Availability policy removed; MV2 fully dead |

Enterprise users had one additional year (until June 2025) before the enterprise policy was removed.

### 4.2 The Core Technical Restriction

**Source:** Mozilla Add-ons Blog (May 2022) — https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/

MV3 replaces the **blocking webRequest API** with **declarativeNetRequest (DNR)**:

| Feature | MV2 (webRequest blocking) | MV3 (declarativeNetRequest) |
|---------|--------------------------|----------------------------|
| Rule execution | Real-time, dynamic, inspect+modify | Pre-declared static rules, no inspection |
| Flexibility | High — can apply any logic | Low — rules must be pre-declared |
| Filter list capacity | Unlimited | Limited to 330,000 static + 30,000 dynamic rules (increased from original cap after community pressure) |
| Cosmetic filtering | Full | Reduced |
| Privacy extensions | Full capability | Degraded capability |

**Key impact:** uBlock Origin in MV3 ("uBlock Origin Lite") lacks several advanced filtering modes that full uBlock Origin had. The developer (gorhill) has stated publicly that MV3 cannot replicate MV2's capabilities. [EFF, 2021]

### 4.3 Ecosystem State

**Source:** Google Chromium blog, May 2024 — https://blog.chromium.org/2024/05/manifest-v2-phase-out-begins.html

- "Over 85% of actively maintained extensions in the Chrome Web Store are running Manifest V3" (as of May 2024 phase-out announcement)
- All top content filtering extensions had MV3 versions: AdBlock, Adblock Plus, uBlock Origin Lite, AdGuard
- Google increased DNR rule limits significantly after developer community pressure (330k static, 30k dynamic)
- AdGuard CTO Andrey Meshkov endorsed the final MV3 platform in a statement to Google (cited in Chrome blog)

### 4.4 Firefox's Key Divergence

**Source:** Mozilla Add-ons Blog — https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/

**Firefox will retain blocking webRequest in MV3.** This is the most significant practical difference between Chrome and Firefox for privacy extension users:

> "Mozilla will maintain support for blocking WebRequest in MV3. To maximize compatibility with other browsers, we will also ship support for declarativeNetRequest."

This means **uBlock Origin (full version) continues to function in Firefox** post-Chrome's MV2 deprecation. This is Firefox's clearest technical differentiator for power users.

### 4.5 Brave's Position

**Source:** https://brave.com/blog/brave-shields-manifest-v3/ (retrieved 2026-06-10)

- Brave Shields (built natively into Chromium fork) are **completely unaffected** by MV3 — they operate below the extension layer
- Brave hosts 4 MV2 extensions on its own backend: **AdGuard, uBlock Origin, uMatrix, NoScript** — downloadable from `brave://settings/extensions/v2`
- Brave has force-enabled MV2 in its Chromium fork and plans to maintain limited MV2 support even after Chromium upstream removes it

**Bottom line for users:** Chrome users who relied on uBlock Origin lost significant functionality. Firefox and Brave users retained it.

### 4.6 EFF Assessment

**Source:** EFF — https://www.eff.org/deeplinks/2021/12/chrome-users-beware-manifest-v3-deceitful-and-threatening

EFF characterizes MV3 as "outright harmful to privacy efforts" and identifies the core conflict of interest: Google controls the dominant browser and the largest internet advertising network. Multiple privacy researchers (Jonathan Mayer/Princeton, Helen Nissenbaum, Giorgio Maone/NoScript) and extension developers have condemned the change.

---

## 5. Competitive Dynamics

### 5.1 US DOJ Antitrust: Google Search Monopoly Ruling

**Confirmed fact:** On August 5, 2024, US District Judge Amit Mehta ruled that **Google LLC violated Section 2 of the Sherman Antitrust Act** by illegally maintaining its monopoly in general search services and search text advertising. The core mechanism: Google paid billions of dollars annually — primarily to Apple — for exclusive default search engine placement across browsers and devices.

**Implications for browser market:**
- Apple received an estimated $18–20B/year from Google for Safari's default search placement (figure per trial testimony, well-documented in coverage; direct source not retrieved)
- Mozilla received approximately 80% of its annual revenue from a similar Google search deal
- If the remedy bars Google from such payments, both Apple's Safari default and Mozilla/Firefox face major revenue disruption

**Remedies phase:** DOJ proposed remedies that included potentially requiring Google to divest Chrome. The remedies trial was ongoing through 2025. The **final remedy ruling as of June 2026 could not be directly confirmed from fetchable sources** — multiple target pages returned 404 or 401. This remains PARTIALLY UNVERIFIED.

### 5.2 EU Digital Markets Act (DMA)

**Designated gatekeepers (Sept 2023):** Alphabet (Google), Amazon, Apple, ByteDance, Meta, Microsoft  
**Source:** https://digital-markets-act.ec.europa.eu/gatekeepers_en

**Apple's DMA Compliance (January 2024):**  
Source: https://www.apple.com/newsroom/2024/01/apple-announces-changes-to-ios-safari-and-the-app-store-in-the-european-union/

Apple implemented in iOS 17.4 (effective March 2024 in EU):
1. **Browser choice screen**: EU users see a choice screen when first opening Safari, prompting selection of a default browser
2. **Alternative browser engines**: Developers can now use engines other than WebKit for browser apps in the EU — first time since iOS's inception
3. Interoperability APIs, alternative app distribution options

**EU Non-Compliance Investigation (March 2024):**  
Source: https://ec.europa.eu/commission/presscorner/detail/en/ip_24_1689

EC opened formal non-compliance proceedings against Apple regarding:
- The **design of the browser choice screen** (concern it doesn't truly allow user choice)
- Whether users can easily change default services

EC also opened proceedings against Alphabet for Google Search self-preferencing.

**Significance:** The DMA's browser choice screen requirement is structurally analogous to the EU's prior Microsoft ballot screen (2009), which measurably shifted browser share in Europe. Whether Apple's implementation produces similar effects depends on the EC's enforcement of the non-compliance investigation.

### 5.3 Firefox / Mozilla Financial Vulnerability

Firefox is at 2.19% global share and declining. Its survival is materially dependent on the Google search default deal. If DOJ remedies eliminate or restrict Google's ability to pay for default search placement, Mozilla faces a structural revenue crisis. Mozilla has been attempting to diversify via:
- Mozilla VPN
- Pocket (content recommendations)
- AI feature integrations
- MDN (developer documentation platform)

However, no confirmed revenue breakdowns from 2024–2025 annual reports were retrieved directly.

### 5.4 The Browser Company: Pivot to AI (Dia)

**Source:** https://thebrowser.company/ (retrieved 2026-06-10)

The Browser Company is now explicitly building both Arc (existing browser with spatial tab management) and **Dia** (new AI-native browser). Dia's tagline: "The browser for your best work." This pivot reflects the broader market thesis that the next browser category shift is AI-first workflow, not spatial organization.

### 5.5 Brave's Growth and Differentiation

**Source:** https://brave.com/about/ (retrieved 2026-06-10)

Brave's 100M MAU milestone (2025) represents the clearest documented challenger browser growth. Key competitive advantages in 2026:
1. Native ad/tracker blocking not dependent on extensions or MV3
2. Explicit MV2 extension support for key privacy tools (uBO, AdGuard) after Chrome's deprecation
3. Brave Leo AI assistant with privacy guarantees (no data retention, no account required)
4. Brave Search as independent (non-Google, non-Bing) default
5. Privacy features (fingerprint randomization, Tor integration, partition-by-origin) that can't be replicated via Chrome extensions

### 5.6 Edge: AI-Driven Enterprise Strategy

Microsoft has deeply integrated Copilot into Edge and is leveraging Windows 11 / Microsoft 365 integration for enterprise retention. Edge at 9.94% desktop globally is the structural #2 on Windows machines. Its real competitive threat is less about winning new users and more about preventing the enterprise from migrating back to Chrome.

### 5.7 Opera: Regional Stronghold + AI

Opera maintained 1.78% global all-platform share (May 2026). Historically strong in emerging markets (Sub-Saharan Africa, Southeast Asia) where bandwidth optimization matters. Opera Aria is its AI assistant product. Samsung Internet (2.44% mobile globally) is embedded in Samsung Android devices.

---

## 6. Open Questions and Gaps

1. **Switching intent data**: No survey data on user-stated switching intent was retrieved. This is the weakest evidence area.
2. **AI browser feature adoption rates**: No industry-wide metric for "what share of browser sessions use AI features" exists in the sources retrieved.
3. **DOJ remedy final outcome**: The monopoly finding (August 2024) is confirmed; the specific final remedy as of June 2026 could not be verified from directly fetched sources.
4. **Arc/Dia user counts**: The Browser Company publishes no public user statistics.
5. **Firefox MAU**: StatCounter gives relative share but not absolute user count. Mozilla's last public user count statements are from ~2019-era claims of 250M users; this is likely significantly lower now and no current figure was retrieved.
6. **Europe-specific StatCounter table**: Fetch was successful but the table data was not displayed in the retrieved content. European data may differ from global averages due to DMA choice screen effects.
7. **Safari's DMA choice screen impact**: Whether the EU browser choice screen in iOS 17.4 (March 2024) produced measurable Safari share decline in EU markets is not confirmed from retrieved sources.

---

## Recommended Next Steps

1. Run dedicated web search (once API access restored) for: switching intent surveys 2025–2026; Arc/Dia user counts; Firefox MAU; DOJ remedy final outcome; EU StatCounter post-DMA breakdown.
2. Fetch StatCounter Europe-specific table directly with CSV download.
3. Monitor Brave's next annual stat update (likely late 2025/early 2026 publication).
4. Track EC's non-compliance ruling against Apple's choice screen (within 12 months of March 2024 opening = ~March 2025 deadline, which may now have a resolution).
