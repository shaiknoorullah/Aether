# Browser Market 2026 — Share, Switching, AI Adoption, Extension Ecosystem, Competitive Dynamics

**Team:** mkt-browser-trends (department: market)
**Synthesis date:** 2026-06-10
**Primary brief:** `outputs/browser-market-2026.md` (Feynman direct-search run, degraded mode)
**Provenance:** `outputs/browser-market-2026.provenance.md`
**Sibling drafts referenced:** `outputs/.drafts/browser-feature-whitespace-cited.md`

> Methodology note: The underlying Feynman run executed in **degraded mode** — researcher subagents failed and web-search APIs (Exa/Perplexity/Gemini) were unavailable. All quantitative claims trace to directly fetched primary sources (StatCounter, Chrome/Mozilla/Brave/Apple/EC pages). Three claim classes are explicitly flagged as unverified in the brief and are carried as risks below: DOJ remedy outcome, Mozilla ~80% Google-revenue dependence, and the Apple/Google search-deal dollar value. Switching-intent and aggregate AI-adoption figures were **not** recovered in this run; where this report cites switching/AI-growth numbers (81% switching willingness, 60% YoY AI-browser growth) they come from the **v1** market report (`docs/research-data/market/browser-trends.md`), not the v2 brief, and are labeled accordingly.

---

## 1. Executive Summary

Chrome retains commanding global dominance at **70.25%** of all-platform traffic (StatCounter, May 2026), with Safari second at 15.72% (iOS lock-in) and Edge structurally significant at 5.14% global / 9.94% desktop (Windows pre-install). Firefox has contracted to **2.19% worldwide** and faces an existential revenue threat from the DOJ Google antitrust case. The market is consolidated — the top three browsers control ~89%+ of usage — yet held substantially by inertia rather than satisfaction: v1 survey data records **81% of U.S. adults willing to switch** browsers for better personalization.

The defining structural event of the cycle is the **completion of Chrome's Manifest V2 deprecation** (MV2 fully disabled, non-re-enablable, as of Chrome 138 / July 24, 2025). Full-featured uBlock Origin no longer functions in Chrome. This hands two competitors a concrete, durable differentiator: **Firefox retains blocking webRequest in MV3** (full uBO still works) and **Brave's native Shields operate below the extension layer** (unaffected by MV3) plus Brave hosts a curated MV2 extension backend (uBO, AdGuard, uMatrix, NoScript). This is the single clearest privacy whitespace Aether can occupy by engine choice.

AI-native integration is now table stakes (Brave Leo, Edge Copilot, Opera Aria, Dia), but there is **no standardized aggregate metric for AI-feature adoption** and **no shipping browser exposes AI as a permission-gated programmable agent runtime** — only as chatbots/sidebars. The most verifiable challenger trajectory is **Brave at 100M+ MAU / 42M+ DAU (2025)**, up from 60M MAU in 2023. The Browser Company killed Arc and pivoted to the AI-native Dia, validating both the knowledge-worker browser gap and the risk of building on a fragile single-product foundation.

For Aether, the market signals converge on a narrow, defensible wedge: an **engine choice that preserves real ad/tracker blocking** (Firefox-class webRequest or Chromium-fork-with-native-shields), a **privacy-preserving AI layer that is agent-grade rather than chatbot-grade**, and **power-user/workflow primitives** that the consolidated incumbents have structurally declined to build.

---

## 2. Key Findings (each with source URL)

### Finding 1 — Chrome dominance is intact; the market is consolidated (~89%+ top-3)
Chrome 70.25% / Safari 15.72% / Edge 5.14% / Firefox 2.19% / Samsung 1.89% / Opera 1.78% all-platform worldwide (May 2026). Desktop skews harder to Chrome (74.93%) and Edge (9.94%).
- Source: https://gs.statcounter.com/browser-market-share
- Source: https://gs.statcounter.com/browser-market-share/desktop/worldwide
- Confidence: HIGH (StatCounter primary; note it may undercount Brave, which blocks tracking tags)

### Finding 2 — Brave is the only verifiable at-scale challenger
60M MAU (2023) → **100M+ MAU / 42M+ DAU (2025)**, a 67% two-year increase. DAU/MAU ~0.42 indicates high engagement. Brave Search Answer serves AI answers for ~25% of daily queries (~15M/day).
- Source: https://brave.com/about/
- Cross-ref (v1, growth curve + 34% YoY): https://brave.com/blog/100m-mau/
- Confidence: HIGH (first-party)

### Finding 3 — Manifest V2 is fully dead in Chrome; full uBO no longer works there
MV2 disabled by default March 31 2025; **fully disabled and non-re-enablable at Chrome 138 (July 24 2025)**; enterprise re-enable policy removed at Chrome 139+. DNR replaces blocking webRequest with static caps (330K static / 30K dynamic rules). "uBlock Origin Lite" exists but with degraded filtering.
- Source: https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline
- Source: https://blog.chromium.org/2024/05/manifest-v2-phase-out-begins.html
- Confidence: HIGH

### Finding 4 — Firefox retains blocking webRequest in MV3 (concrete privacy differentiator)
Mozilla committed to maintaining blocking WebRequest in MV3 alongside DNR. Firefox is the only Chromium-adjacent major browser where full uBlock Origin keeps working after Chrome's MV2 kill. This is Firefox's clearest 2026 technical differentiation.
- Source: https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/
- Confidence: HIGH

### Finding 5 — Brave Shields sit below the extension layer and survive MV3
Shields are native to the Chromium fork (unaffected by MV3). Brave additionally hosts 4 MV2 extensions (AdGuard, uBO, uMatrix, NoScript) on its own backend (`brave://settings/extensions/v2`, v1.81+) and force-enables MV2 in its Chromium code with a stated longevity commitment.
- Source: https://brave.com/blog/brave-shields-manifest-v3/
- Confidence: HIGH

### Finding 6 — EFF: MV3 is a structural privacy harm with a built-in conflict of interest
EFF characterizes MV3 as "outright harmful to privacy efforts"; Google controls both the dominant browser and the largest ad network, with trackers on ~75% of the top 1M sites. Condemned by Mayer (Princeton), Maone (NoScript), Nissenbaum.
- Source: https://www.eff.org/deeplinks/2021/12/chrome-users-beware-manifest-v3-deceitful-and-threatening
- Confidence: HIGH (position statement)

### Finding 7 — AI-browser integration is universal but unmeasured and chatbot-shaped
Brave Leo (Claude/Llama, no retention), Edge Copilot (largest passive AI install base via Windows), Opera Aria, Dia. No public aggregate "share of sessions using AI features" metric exists; agentic browsing is "coming soon" at Brave, not in production at brief time.
- Source: https://brave.com/about/
- Source: https://thebrowser.company/
- Confidence: MEDIUM (vendor self-report; no standardized measurement)

### Finding 8 — No browser ships AI as a permission-gated agent runtime
Across 14+ browsers, AI is exposed as chatbot/sidebar, not a programmable agent with per-capability (read tab / fill form / click / network) permissions. Brave's Nightly AI Browsing (isolated profile + alignment-checking second model) is the closest, but is a single autonomous session, not a permissioned runtime.
- Source: `outputs/.drafts/browser-feature-whitespace-cited.md` §1.1 (citing Brave agentic-browsing series)
- Confidence: MEDIUM-HIGH (gap analysis across competitor set)

### Finding 9 — Regulatory overhang reshapes defaults economics (DMA + DOJ)
EU DMA mandates iOS browser choice screen (March 2024) and permits non-WebKit engines in the EU; EC opened non-compliance proceedings over the choice-screen *design* (March 2024), implying weak switching effect as deployed. DOJ ruled (Aug 5 2024) Google illegally maintained its search monopoly via exclusive default-search payments; final remedy as of June 2026 is **UNVERIFIED** in this run.
- Source: https://www.apple.com/newsroom/2024/01/apple-announces-changes-to-ios-safari-and-the-app-store-in-the-european-union/
- Source: https://ec.europa.eu/commission/presscorner/detail/en/ip_24_1689
- Confidence: HIGH on DMA facts; remedy outcome UNVERIFIED

### Finding 10 — The Browser Company killed Arc and pivoted to AI-native Dia
The Browser Company now positions Dia ("The browser for your best work") as an AI-native successor to Arc. Per v1 data, Arc had ~500K users and the company/assets went to Atlassian (~$610M, Sep 2025) — a $1,220/user implied valuation validating the knowledge-worker segment's strategic value.
- Source: https://thebrowser.company/
- Cross-ref (v1, acquisition + user count): https://medium.com/activated-thinker/arc-browser-dies-at-age-3-a-melancholic-funeral-paid-by-atlassian-a4a6d465f223
- Confidence: HIGH on pivot; MEDIUM on user/acquisition figures (v1 press-sourced)

### Finding 11 — Demand exists for switching, but inertia holds the market (v1 survey)
v1 Shift "2026 State of Browsing" survey (n=1000 U.S. adults, Sep 2025): **81% willing to switch** for personalization, 92% want more personalization, 62% report digital burnout, 39% want multi-account support, 34% want task organization, app-switching is the #1 productivity killer (20%). Carried from v1 because the v2 brief recovered no switching-intent data.
- Source: https://www.prnewswire.com/news-releases/consumers-declare-the-browser-broken-62-report-digital-burnout-81-ready-to-switch-302616138.html
- Confidence: MEDIUM (vendor-run survey, reasonable n)

---

## 3. Implied Aether Feature Candidates

Each candidate maps to one of the 12 Aether categories. RICE inputs are in the structured object; rationale below.

1. **MV3-immune native content blocking (engine-level Shields).** The MV2 kill is the cleanest market-validated wedge: Chrome users who relied on full uBO have no in-Chrome path. Aether's delivery vehicle must preserve real blocking — either Firefox-class blocking webRequest or a Chromium-fork-with-native-shields. *Category: Privacy & Security.* (Findings 3, 4, 5, 6)

2. **Permission-gated AI agent runtime.** No competitor exposes AI as a per-capability permissioned agent; everyone ships a chatbot. This is the highest-differentiation AI candidate and aligns with Aether's agent-native thesis. *Category: AI & Agents.* (Findings 7, 8)

3. **Privacy-preserving on-device/local AI assistant (no retention).** Brave Leo's "no data retention, no account" stance is the proven privacy-AI baseline; matching/exceeding it (local model option) is required to compete without surveillance. *Category: AI & Agents.* (Finding 7)

4. **Workspace/task organization with multi-account profiles.** v1 demand: 39% multi-account, 34% task org; Arc's death left the knowledge-worker segment unserved. *Category: Workspace & Organization.* (Findings 10, 11)

5. **Curated MV2-class extension compatibility / power-extension support.** Brave's MV2 backend is a stated differentiator; supporting the high-value privacy extensions Chrome dropped is a concrete acquisition lever for the displaced power-user/privacy segment. *Category: Extensibility.* (Findings 3, 5)

6. **EU-engine-choice readiness (non-WebKit, default-browser claim flows).** DMA opened the iOS engine market and made default-browser placement contestable; being natively positioned for choice-screen/default flows is low-cost optionality. *Category: Core Browsing.* (Finding 9)

---

## 4. Competitive / Whitespace Notes

- **Incumbent inertia is the moat and the opening.** 81% switch-willingness vs ~70% Chrome retention means demand is latent, not absent; the blocker is migration friction, not loyalty. Aether's wedge is reducing switching cost (import, parity on blocking, parity on AI) for the privacy + power-user + knowledge-worker overlap.
- **The MV2 cliff is the most concrete competitive event of the decade** and it is permanent in Chrome. Firefox and Brave have each converted it into a differentiator; a new entrant that does *not* preserve real blocking starts with a structural disadvantage in exactly the segment most willing to switch.
- **AI is universal but undifferentiated and unmeasured.** Every browser has a chatbot; none has a permissioned agent runtime, persistent cross-session AI context, or semantic history search (per whitespace draft §1.3–1.5). This is open whitespace, gated by the unsolved prompt-injection security problem — which is itself an Aether opportunity if solved credibly.
- **Power-user whitespace is wide and uncontested:** true modal vim across all chrome, scriptable/branching session pipelines, git-like session branch/merge, workspace-scoped bookmarks (whitespace draft §2). Incumbents have declined these as small-TAM; for a power-user-first product they are the identity.
- **Knowledge-worker segment is proven-valuable and currently vacant** post-Arc; Dia is the only direct competitor and has no published traction.
- **Brave is the benchmark to beat, not Chrome.** It demonstrates the privacy-first thesis at 100M MAU and already holds the MV3-immunity + privacy-AI position. Aether must out-execute Brave on agent-grade AI and power-user depth, not merely match its blocking.

---

## 5. Risks

| Risk | Severity | Notes |
|------|----------|-------|
| **Brief is degraded-mode; switching-intent + aggregate AI-adoption data absent in v2** | HIGH | Core demand-side numbers (81% switching, 60% YoY AI growth) are carried from v1 vendor surveys, not re-verified in v2. Treat as directional; commission a dedicated stated-intent survey before betting roadmap on them. |
| **DOJ Google remedy outcome UNVERIFIED** | HIGH | If remedies force Chrome divestiture or ban default-search payments, both the competitive field and Mozilla's ~80% Google-revenue dependence (itself unverified) shift dramatically. A Firefox-fork delivery vehicle inherits Mozilla's revenue-existential risk. |
| **Firefox decline is accelerating (2.19%, ~17% relative YoY drop per v1)** | HIGH | A Firefox-fork delivery vehicle inherits engine-maintenance and ecosystem-shrinkage risk; Gecko's long-term funding is tied to the DOJ outcome. |
| **MV2/full-blocking advantage may erode** | MEDIUM | If Mozilla later weakens blocking webRequest, or Brave changes its MV2 commitment, Aether's blocking differentiator narrows. Engine choice should not depend on a third party's policy permanence. |
| **Agentic-AI security is unsolved (prompt injection, model confusion)** | MEDIUM-HIGH | The permission-gated agent runtime (Candidate 2) is high-value precisely because it's hard; shipping it insecurely is worse than not shipping. Gate on a credible isolation + alignment-check architecture. |
| **StatCounter undercounts privacy browsers** | MEDIUM | Brave's true share is likely understated (it blocks tracking tags); do not size the privacy TAM off StatCounter alone. |
| **AI adoption is vendor-self-reported, no standard metric** | MEDIUM | Cannot reliably size AI-feature demand; risk of over-investing in AI surface relative to actual usage. |
| **Regulatory tailwind (DMA choice screens) underperformed** | LOW-MEDIUM | EC's own non-compliance action suggests choice screens did not drive meaningful switching as deployed; do not assume regulation alone will move share. |

---

*Format reference: `docs/research-data/market/browser-trends.md` (v1) — not modified.*
