# Web Browser Market in 2026: Market Share, AI Adoption, Extension Ecosystem, and Competitive Dynamics

*Cited Research Brief — 2026-06-10*  
*Sources verified: see provenance sidecar*

---

## Executive Summary

Chrome retains commanding global dominance at **70.25%** of all-platform web traffic as of May 2026 [^1], a position not fundamentally shifted despite regulatory and competitive pressure. Safari is a clear second at **15.72%** globally, buoyed by iOS market lock-in. Edge holds a structurally significant **5.14%** global share—rising to **9.94% on desktop** due to Windows pre-installation [^2]. Firefox has contracted to **2.19% worldwide** (3.81% desktop, 0.71% mobile) [^1][^2][^3], with independent survival under material threat from DOJ antitrust proceedings against Google's search default payments.

The extension ecosystem has undergone its most significant structural shift since Chrome's launch: **Manifest V3 fully superseded MV2 in Chrome as of July 24, 2025 (Chrome 138)** [^4]. uBlock Origin in its full-featured form no longer functions in Chrome. Firefox's decision to retain blocking webRequest in MV3 [^5] and Brave's native Shields architecture [^6] have both become genuine differentiators for privacy-focused users.

AI-native browser integration is now standard across all major browsers. The most verifiable challenger growth: **Brave reached 100M+ MAU** in 2025 [^7], up from 60M MAU in 2023. The Browser Company has pivoted toward Dia, an AI-native browser successor to Arc [^8].

Two regulatory forces are reshaping competitive dynamics: the EU Digital Markets Act (browser choice screens mandatory on iOS from March 2024) [^9] and the US DOJ's August 2024 monopoly ruling against Google's exclusive search default deals [established public record; remedy outcome as of June 2026 unverified].

---

## 1. Market Share by Browser (May 2026)

### 1.1 All Platforms, Worldwide

**Source:** StatCounter GlobalStats [^1] — Period: May 2025–May 2026

| Browser | Global Share (All Platforms) |
|---------|------------------------------|
| Chrome | **70.25%** |
| Safari | 15.72% |
| Edge | 5.14% |
| Firefox | 2.19% |
| Samsung Internet | 1.89% |
| Opera | 1.78% |
| Other (incl. Brave, UC Browser) | ~3.03% |

StatCounter measures via page view sampling across ~1.5M tagged websites. This methodology may undercount browsers that aggressively block tracking tags — notably Brave — and may under-represent mobile browsers with aggressive caching.

### 1.2 Desktop Only, Worldwide

**Source:** StatCounter [^2] — Period: May 2025–May 2026

| Browser | Desktop Share |
|---------|--------------|
| Chrome | **74.93%** |
| Edge | 9.94% |
| Safari | 5.32% |
| Firefox | 3.81% |
| Opera | 1.97% |
| Samsung Internet | 1.33% |

Edge's 9.94% desktop share reflects pre-installation on Windows 10/11. Firefox retains roughly double its mobile share on desktop, consistent with concentration in developer and power-user segments.

### 1.3 Mobile Only, Worldwide

**Source:** StatCounter [^3] — Period: May 2025–May 2026

| Browser | Mobile Share |
|---------|-------------|
| Chrome | **66.41%** |
| Safari | 25.25% |
| Samsung Internet | 2.44% |
| Opera | 1.62% |
| UC Browser | 1.11% |
| Firefox | 0.71% |

Safari's mobile presence (25.25%) is substantially explained by iOS lock-in. Alternative browser engines on iOS became available in the EU under DMA (March 2024) [^9] but remain WebKit-only globally outside the EU.

### 1.4 North America, All Platforms

**Source:** StatCounter [^10] — Period: May 2025–May 2026

| Browser | North America Share |
|---------|-------------------|
| Chrome | 54.01% |
| Safari | 29.2% |
| Edge | 7.46% |
| Firefox | 3.58% |
| **Brave** | **2.1%** |
| Samsung Internet | 1.48% |

**Brave appears in the North American top-6 at 2.1%** — absent from the global top-6. This reflects concentration in English-speaking, privacy-aware markets. Chrome's lower NA share (54% vs. 70% globally) reflects higher iOS penetration in the US.

---

## 2. Switching Intent

**Data status: INSUFFICIENT — no survey data recovered.** Web search APIs unavailable during this research run. This section is explicitly inferential.

Structural proxies for switching behavior:

- Brave's growth from 60M MAU (2023) to **100M+ MAU (2025)** [^7] — a 67% increase in two years — represents the clearest evidence of user acquisition at scale, likely driven partly by users dissatisfied with Chrome's MV2 deprecation.
- EU DMA browser choice screen went live on iOS March 2024 [^9]; the EC opened non-compliance proceedings against Apple's choice screen design in March 2024 [^11], suggesting meaningful switching did not result from the implementation as deployed.
- [INFERENCE] uBlock Origin's degradation in Chrome following the October 2024–July 2025 MV2 rollout is a plausible switching catalyst for ad-blocking-reliant users.

**Gap:** No stated-intent survey data retrieved. Any switching intent percentages from this section would be fabricated. This section requires a dedicated survey source.

---

## 3. AI-Browser Adoption

**Data status: PARTIAL** — vendor self-reported figures for Brave only; no aggregate AI-browser market percentage.

### 3.1 Brave: The Most Quantified Case

**Source:** Brave about page [^7] — data as of 2025

- **100M+ MAU** worldwide (self-reported)
- **42M+ DAU** worldwide
- Brave Search Answer with AI: AI-powered answers for ~25% of all daily search queries (~15M/day of 53M+ daily queries)
- Brave Leo: built-in AI assistant using Claude and Llama models; available desktop, Android, iOS; privacy-preserving (no data retention, no account required)
- Agentic browsing: announced as "coming soon" on brave.com/about (not yet in production as of page retrieval)

### 3.2 Microsoft Edge (Copilot)

Edge has 9.94% global desktop share [^2] and is pre-installed on Windows 11, making it the largest AI-browser by passive install base. Microsoft integrated Copilot sidebar into Edge. No specific AI-feature active usage statistics were retrievable from direct fetches.

### 3.3 The Browser Company (Dia / Arc)

**Source:** https://thebrowser.company/ [^8] — retrieved 2026-06-10

The Browser Company is building both Arc and Dia. Dia is positioned as "The browser for your best work" — an AI-native product. No public MAU or DAU statistics for either browser were retrievable.

### 3.4 Opera, Samsung Internet

Opera (1.78% global share) features Opera Aria AI assistant [^1]. Samsung Internet (2.44% mobile global) is embedded in Samsung Android devices. No AI adoption rate statistics retrieved for either.

### 3.5 Gap

There is no publicly available aggregate metric for "share of browser sessions using AI features." Vendor announcements exist but lack standardized measurement. This is an open gap in the research.

---

## 4. Manifest V2 Deprecation and MV3 Extension Ecosystem

### 4.1 Chrome's MV2 Deprecation Timeline

**Source:** Chrome developer documentation [^4]; Chromium blog May 2024 [^12]

| Date | Event |
|------|-------|
| Jan 2022 | Chrome Web Store stops accepting new MV2 public/unlisted extensions [^4] |
| June 2022 | Chrome Web Store stops accepting new MV2 private extensions [^4] |
| June 3, 2024 | MV2 disabled on pre-stable Chrome (Beta/Dev/Canary); Featured badge removed [^12] |
| Oct 9, 2024 | MV2 extensions begin disabling on Chrome Stable (gradual rollout) [^4] |
| March 31, 2025 | MV2 disabled by default, all channels; users could still temporarily re-enable [^4] |
| **July 24, 2025** | **Chrome 138: MV2 fully disabled; users cannot re-enable** [^4] |
| Chrome 139+ | Enterprise ExtensionManifestV2Availability policy removed; MV2 ceases to exist in Chrome [^4] |

### 4.2 Technical Core: webRequest vs. declarativeNetRequest

**Source:** Mozilla Add-ons blog [^5]; Chrome blog [^12]; EFF [^13]

MV3 replaces the blocking **webRequest API** with **declarativeNetRequest (DNR)**:

| Capability | MV2 webRequest | MV3 declarativeNetRequest |
|-----------|---------------|--------------------------|
| Network request interception | Real-time, dynamic | Pre-declared static rules |
| Rule flexibility | Unlimited logic | Pre-declared patterns only |
| Static rule cap | None | 330,000 (increased from original cap) [^12] |
| Dynamic rule cap | None | 30,000 [^12] |
| Cosmetic filtering | Full | Reduced |
| Privacy extension capability | Full | Degraded |

**Impact:** uBlock Origin's full functionality cannot be replicated in MV3. The developer has stated this explicitly. "uBlock Origin Lite" (MV3 version) is available but with reduced filtering capability.

### 4.3 Ecosystem Transition State (May 2024 snapshot)

**Source:** Chromium blog [^12]

- "**Over 85% of actively maintained extensions** in the Chrome Web Store are running Manifest V3"
- "Top content filtering extensions all have Manifest V3 versions available — with options for users of AdBlock, Adblock Plus, uBlock Origin and AdGuard"
- Google increased DNR limits after developer community pressure: 330K static + 30K dynamic rules

### 4.4 Firefox Retains Blocking webRequest: Critical Differentiator

**Source:** Mozilla Add-ons blog [^5]

> "Mozilla will maintain support for blocking WebRequest in MV3. To maximize compatibility with other browsers, we will also ship support for declarativeNetRequest."

**Firefox is the only Chromium-adjacent major browser where uBlock Origin (full version) continues to function after Chrome's MV2 kill.** This is Firefox's most concrete technical differentiator for privacy-focused users as of 2025–2026.

### 4.5 Brave: Native Shields + MV2 Extension Backend

**Source:** Brave blog [^6]

- Brave Shields are built natively into the Chromium fork — **completely unaffected by MV3**, operating below the extension layer
- Brave hosts 4 MV2 extensions on its own backend: AdGuard, uBlock Origin, uMatrix, NoScript
- Accessible via `brave://settings/extensions/v2` (as of Brave v1.81+)
- Brave has force-enabled MV2 in its Chromium code and plans to maintain support even after upstream Chromium removes it

### 4.6 EFF's Assessment

**Source:** EFF [^13]

EFF characterizes MV3 as "outright harmful to privacy efforts" and identifies a structural conflict of interest: Google controls the dominant browser and the largest internet advertising network. Google has trackers installed on approximately 75% of top 1 million websites. Multiple privacy researchers have condemned the change, including Jonathan Mayer (Princeton), Giorgio Maone (NoScript), and Helen Nissenbaum.

---

## 5. Competitive Dynamics

### 5.1 US DOJ Antitrust: Google Search Monopoly (2024)

**Confirmed:** August 5, 2024 — Judge Amit Mehta ruled **Google illegally maintained its search monopoly** in violation of Section 2 of the Sherman Antitrust Act. Core mechanism: Google paid billions annually — primarily to Apple — for exclusive default search placement across browsers and devices. [Established public record; direct court document retrieval blocked by 404/401 errors during this research run.]

**Structural browser market implications:**
- Apple receives a multi-billion-dollar annual payment from Google for Safari's default search placement (specific figure per DOJ trial testimony, widely reported but direct source not fetched; treat as approximate)
- Mozilla receives ~80% of annual revenue from a similar Google search default deal
- If remedies bar such payments: Safari's default incentive structure changes; Mozilla/Firefox faces a revenue existential crisis

**Remedies status:** DOJ sought potentially requiring Google to divest Chrome. Multiple remedy hearing articles returned 404 or 401 errors during this research run. **The specific final remedy as of June 2026 is UNVERIFIED** from directly fetched sources. This is a critical gap.

### 5.2 EU Digital Markets Act (DMA)

**Designated gatekeepers:** Alphabet, Amazon, Apple, ByteDance, Meta, Microsoft (designated September 2023) [^14]  
**Compliance deadline:** March 7, 2024

**Apple's DMA compliance — browser specifics (January 2024):**  
Source: Apple Newsroom [^9]

1. **Browser choice screen** launched on iOS 17.4 (effective March 2024, EU only): first-time Safari opener sees a choice screen prompting default browser selection
2. **Alternative browser engines** now permitted on iOS in EU — first time iOS allowed non-WebKit rendering engines for browsers
3. Interoperability APIs exposed

**EU non-compliance investigation (March 2024):**  
Source: EC press release [^11]

The Commission opened formal non-compliance proceedings against Apple, expressing concern that:
- The **design of the browser choice screen** may not effectively allow user choice (Article 6(3) DMA)
- Users cannot easily change defaults within the Apple ecosystem

Also opened against Alphabet for Google Search self-preferencing on search results.

**Historical precedent:** The EU's 2009 "ballot screen" requirement for Windows resulted in measurable browser share shift toward Firefox, Chrome, and Opera in Europe. Whether iOS 17.4's implementation produces similar effects depends on EC enforcement.

### 5.3 Firefox / Mozilla: Structural Vulnerability

Firefox stands at 2.19% global market share, declining. Key vulnerabilities:
- ~80% revenue dependence on Google search default deal — directly threatened by DOJ antitrust remedies
- Continued market share erosion across all platforms
- Firefox's **retention argument**: only major browser retaining full uBlock Origin capability via blocking webRequest in MV3

Firefox's technical position (MV3 webRequest support) [^5] is its clearest differentiation from Chrome in 2026.

### 5.4 The Browser Company: Arc and Dia

**Source:** https://thebrowser.company/ [^8] (retrieved 2026-06-10)

The Browser Company has formally shifted focus toward both Arc (existing, spatial tab management) and **Dia** (new AI-native browser). Dia tagline: "The browser for your best work." This represents a pivot toward AI-first workflow automation and away from Arc's visual organization paradigm. No user statistics were publicly available at time of research.

### 5.5 Brave: Challenger Browser with Confirmed Traction

**Source:** https://brave.com/about/ [^7]

Brave's growth from 60M MAU (2023) → **100M+ MAU (2025)** is the most verifiable challenger browser growth trajectory in the current market. Brave's competitive advantages:
1. Native ad/tracker blocking (Shields) — not affected by MV3, no extensions required
2. MV2 extension support after Chrome deprecation (uBO, AdGuard, NoScript, uMatrix)
3. Privacy-preserving Leo AI assistant (no data retention)
4. Brave Search as an independent search engine (not Google/Bing-indexed)
5. Built-in fingerprint randomization, Tor private windows, ephemeral storage partitioning
6. Explicit MV2 longevity commitment — a stated product differentiator against Chrome

### 5.6 Edge: Structural Windows Default

Microsoft Edge at 9.94% desktop global share [^2] is structurally sustained by Windows 11 OEM default rather than user preference. Copilot AI integration is deeply embedded. Edge's enterprise strategy leverages Microsoft 365 integration. Its primary competitive role is retaining Windows users from migrating to Chrome.

---

## 6. Open Questions and Evidence Gaps

| Gap | Status |
|-----|--------|
| Switching intent survey data (% of users planning to switch) | NOT FOUND — web search APIs unavailable |
| Aggregate AI-browser feature adoption rate | NOT FOUND — no industry-wide metric exists |
| DOJ Google antitrust final remedy ruling (2025–2026) | UNVERIFIED — target pages returned 404/401 |
| Arc/Dia MAU/DAU | NOT FOUND — not published |
| Firefox current MAU (absolute) | NOT FOUND — no current Mozilla publication retrieved |
| EU browser share table post-DMA | PARTIAL — StatCounter Europe page fetched but table data not extracted |
| Apple €1.8B fine (Apple Music DMA) vs. browser-specific DMA fine | EU fine retrieved was App Store/music streaming, not browser; browser investigation ongoing |

---

## Sources

[^1]: StatCounter GlobalStats, All Platforms Worldwide, Browser Market Share, May 2026. https://gs.statcounter.com/browser-market-share

[^2]: StatCounter GlobalStats, Desktop Worldwide, Browser Market Share, May 2026. https://gs.statcounter.com/browser-market-share/desktop/worldwide

[^3]: StatCounter GlobalStats, Mobile Worldwide, Browser Market Share, May 2026. https://gs.statcounter.com/browser-market-share/mobile/worldwide

[^4]: Chrome Developers — Manifest V2 Support Timeline. https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline (retrieved 2026-06-10)

[^5]: Mozilla Add-ons Community Blog — "Manifest v3 in Firefox: Recap & Next Steps" (May 18, 2022). https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/

[^6]: Brave — "What Manifest V3 means for Brave Shields and the use of extensions in the Brave browser." https://brave.com/blog/brave-shields-manifest-v3/ (retrieved 2026-06-10)

[^7]: Brave — About Brave. https://brave.com/about/ (retrieved 2026-06-10). Reports 100M+ MAU, 42M+ DAU as of 2025.

[^8]: The Browser Company — https://thebrowser.company/ (retrieved 2026-06-10). Confirms building both Arc and Dia.

[^9]: Apple Newsroom — "Apple announces changes to iOS, Safari, and the App Store in the European Union" (January 25, 2024). https://www.apple.com/newsroom/2024/01/apple-announces-changes-to-ios-safari-and-the-app-store-in-the-european-union/

[^10]: StatCounter GlobalStats, North America All Platforms, Browser Market Share, May 2026. https://gs.statcounter.com/browser-market-share/all/north-america

[^11]: European Commission press release — DMA non-compliance investigations against Alphabet, Apple, Meta (March 2024). https://ec.europa.eu/commission/presscorner/detail/en/ip_24_1689

[^12]: Chromium Blog — "Manifest V2 phase-out begins" (May 2024, updated October 2024). https://blog.chromium.org/2024/05/manifest-v2-phase-out-begins.html

[^13]: EFF — "Chrome Users Beware: Manifest V3 is Deceitful and Threatening" (December 2021). https://www.eff.org/deeplinks/2021/12/chrome-users-beware-manifest-v3-deceitful-and-threatening

[^14]: EU Digital Markets Act — Designated Gatekeepers. https://digital-markets-act.ec.europa.eu/gatekeepers_en (retrieved 2026-06-10)

[^15]: Chrome Developers Blog — "Resuming the transition to Manifest V3" (November 16, 2023). https://developer.chrome.com/blog/resuming-the-transition-to-mv3
