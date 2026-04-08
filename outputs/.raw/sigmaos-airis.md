# Research: SigmaOS Airis — Comprehensive Feature Analysis

*Researched: 2026-04-08*

---

## Summary

SigmaOS is a macOS-only productivity browser backed by Y Combinator ($4M raised) built around workspace organization and a native AI assistant called Airis. Airis is a cloud-based assistant (OpenAI backbone, GPT-4o at Pro tier, Llama/Claude at Max tier) with strong contextual page awareness but no on-device processing, no public developer API, and no MCP support. Agentic automation (form filling, login, clicks) exists as a marketed capability but remains labeled Alpha with no public shipped confirmation as of early 2026.

---

## Dimension 1: AI Model Access and Selection

### Claims

1. **Initial model: GPT-3.5-Turbo** — At launch (June 2023), Airis used OpenAI's GPT-3.5-Turbo. TechCrunch noted the team was "open to integrating other models like Claude and Alpaca." — **Shipped** as of launch. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

2. **Free tier: Limited Airis** — Free ("Basic") plan gets "Airis Assistant (limited)" — rate-limited, model unspecified (likely GPT-3.5-class). — **Shipped**. [Source](https://sigmaos.com/upgrade)

3. **Personal Pro ($20/mo): Unlimited Advanced Airis with GPT-4o** — Pro tier explicitly unlocks GPT-4o with higher rate limits. — **Shipped**. [Source](https://sigmaos.com/upgrade)

4. **Personal Max ($30/mo): Multiple model selection** — Max tier adds "More LLM Models (Llama, Claude…)" and unlimited usage. Specific versions: a Yahoo/TechCrunch article from early 2024 named GPT-4, Perplexity, and Claude 3 Haiku as the model options at this tier. — **Shipped at Max tier**. [Source](https://sigmaos.com/upgrade) / [Source](https://news.yahoo.com/yc-backed-sigmaos-browser-turns-153036611.html)

5. **No on-device/local model processing** — All AI processing routes through cloud (OpenAI API + others). No Ollama or BYOM (Bring Your Own Model) support documented anywhere. Contrast with Brave Leo which explicitly supports local models. — **Confirmed gap**.

6. **No user-facing model switching on Free/Pro tiers** — Model selection (between LLMs) only unlocked at Max ($30/mo). Free and Pro users get no model choice. — **Confirmed**.

### Caveats
- Model names in marketing (e.g., "Llama, Claude…") are illustrative, not version-pinned.
- Privacy policy does not disclose which third-party AI vendors receive query data (only names Airtable, AWS, Segment, Mixpanel, June for product analytics).
- Pricing page at `sigmaos.com/upgrade` conflicts with older FAQ (`docs.sigmaos.com/common-questions`) which listed Pro at $10/mo — the $20/$30 pricing appears to be the current structure post-Airis launch.

---

## Dimension 2: Agent Automation Capabilities

### Claims

1. **Agentic browsing demo announced (~early 2024)** — Co-founder Mahyad Ghassemibouyaghchi demoed voice-controlled agentic browsing: clearing emails, booking Airbnb. Described as "hands-free mode." Compared to Rabbit r1's LAM concept. — **Announced, not confirmed shipped**. [Source](https://news.yahoo.com/yc-backed-sigmaos-browser-turns-153036611.html)

2. **"Repeatable flows" (IFTTT-like triggers) announced as concept** — Automatic actions on time-based triggers. Explicitly described as "still in the concept stage" at time of reporting (early 2024). — **Not shipped as of source date**. [Source](https://news.yahoo.com/yc-backed-sigmaos-browser-turns-153036611.html)

3. **Third-party review (2026) claims agentic browsing shipped** — Pickaxe's 2026 AI browser review states: "The AI can log into websites, click buttons, type text, and complete tasks inside web apps on your behalf. Need to update settings across multiple apps? Fill out a bunch of forms? Extract data from dashboards? SigmaOS handles it while you do other things." — **Claimed shipped per 2026 review**, though no official SigmaOS changelog confirms this. [Source](https://pickaxe.co/post/top-ai-browsers-extensions-2026)

4. **Multi-task parallel AI execution** — Since launch, Airis can run rewriting/translation tasks on multiple pages simultaneously without waiting for one to finish. Cited as a token-algorithm advantage over ChatGPT. — **Shipped**. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

5. **No confirmed web scraping/data extraction API** — No documentation of structured data extraction or scraping capability for developers or end users.

### Caveats
- The gap between the demo (voice-controlled Airbnb booking) and what's actually in the product is unclear. SigmaOS's public changelog only goes up to v1.13 (Nov 2023), creating a documentation black hole for 2024–2026 features.
- Airis remains labeled "Alpha" across marketing materials as of April 2026. [Source](https://sigmaos.com/airis)

---

## Dimension 3: Privacy Model

### Claims

1. **Web activity stored locally by default** — "We do not track any identifying information linked to your web-activity (history, cookies, url of websites visited, workspace names, etc…) without your explicit consent. All of this information is stored locally on your computer." — **Shipped**. [Source](https://docs.sigmaos.com/privacy-policy)

2. **Cloud sync is opt-in and encrypted** — If enabled, web activity is "stored safely and encrypted in SigmaOS' servers" on AWS. "This data is only used for the purposes of cloud syncing: restoring your session." — **Shipped**. [Source](https://docs.sigmaos.com/privacy-policy)

3. **WebKit Intelligent Tracking Prevention** — SigmaOS uses ITP (same as Safari/WebKit), blocking cross-site behavioral tracking. — **Shipped**. [Source](https://docs.sigmaos.com/common-questions)

4. **Passwords stored in Apple Keychain** — System-level password storage, not a SigmaOS-proprietary vault. — **Shipped**. [Source](https://docs.sigmaos.com/common-questions)

5. **Product analytics collected via Segment, Mixpanel, June** — Engagement events (creating workspaces, opening pages, viewing modals) are tracked via these third-party analytics services. No personal browsing data, no URL tracking. — **Shipped**. [Source](https://docs.sigmaos.com/privacy-policy)

6. **Data retention is indefinite until user requests deletion** — "We'll keep your data for the purpose of sending you updates until either we decide to stop sending updates, or you ask us to delete your data." Deletion by email request only (founders@sigmaos.com). — **Confirmed**. [Source](https://docs.sigmaos.com/privacy-policy)

7. **AI query data routing not disclosed** — The privacy policy does not specify whether Airis query content (prompts + page context) is sent to OpenAI/Anthropic/Meta and under what retention terms. This is a significant gap. No AI-specific data processing addendum published.

8. **Registered in England and Wales** — Company number 13201691, registered office in London. Subject to UK ICO oversight. — **Confirmed**. [Source](https://docs.sigmaos.com/privacy-policy)

### Caveats
- Privacy policy predates Airis launch and lacks AI-specific provisions.
- No SOC2, ISO 27001, or similar compliance certifications mentioned.
- No enterprise DPA available.

---

## Dimension 4: Pricing and Tiers

### Claims

1. **Basic (Free)** — All core browser features, unlimited workspaces (per upgrade page), fast ad-blocker, Airis Assistant (limited/rate-limited). — **Shipped**. [Source](https://sigmaos.com/upgrade) / [Source](https://sigmaos.com/)

2. **Personal Pro: $20/month** — Unlimited Advanced Airis (GPT-4o), "Look it up" at high usage, Interactive Summaries at high usage. — **Shipped**. [Source](https://sigmaos.com/upgrade)

3. **Personal Max: $30/month** — Everything in Pro + multiple LLM model access (Llama, Claude), Unlimited "Look it up" queries, Unlimited Interactive Summaries. — **Shipped**. [Source](https://sigmaos.com/upgrade)

4. **Student/academic discount: 50% off** — Available on personal paid plan. — **Shipped**. [Source](https://docs.sigmaos.com/common-questions)

5. **Alpha tester plan: Free until Airis exits Alpha** — Asterisk note on upgrade page: "The alpha tester plan is free until Airis gets out of Alpha." — **Shipped**. [Source](https://sigmaos.com/upgrade)

6. **14-day free trial** — Mentioned in FAQ. — **Shipped**. [Source](https://docs.sigmaos.com/common-questions)

7. **No enterprise plan documented** — No team pricing, enterprise tier, SSO, or centralized billing mentioned anywhere in official sources. Contradicts typical SaaS progression.

8. **Pricing discrepancy** — Old FAQ lists Personal Pro at "$10/month, or $8/month (billed yearly)." Current upgrade page shows $20/$30 tiers with no yearly billing option listed. Pricing has been restructured post-Airis launch; old docs not updated. [Source](https://docs.sigmaos.com/common-questions) vs [Source](https://sigmaos.com/upgrade)

### Caveats
- Referral credit: $5 per referred signup. [Source](https://docs.sigmaos.com/common-questions)
- No public announcement of pricing changes; only discoverable by comparing pages.

---

## Dimension 5: Platform Support

### Claims

1. **macOS only** — Confirmed by every source reviewed. YC launch thread titled "A MacOS web browser." Pickaxe 2026 comparison table explicitly lists SigmaOS as macOS only. — **Confirmed**. [Source](https://news.ycombinator.com/item?id=28197537) / [Source](https://pickaxe.co/post/top-ai-browsers-extensions-2026)

2. **No Windows, Linux, iOS, or Android support** — No roadmap mentions these platforms. Company has not announced cross-platform expansion.

3. **Cloud sync across Apple devices** — Opt-in sync allows session restoration across multiple Macs. — **Shipped**. [Source](https://docs.sigmaos.com/privacy-policy)

4. **Chrome Web Store extensions supported** — SigmaOS is "the first WebKit browser to support Chrome extensions." Extensions can be scoped per-workspace. — **Shipped**. [Source](https://docs.sigmaos.com/tutorial/extensions)

5. **Browser migration from Chrome, Safari, Brave, Opera, Firefox, Vivaldi, Edge, Sidekick** — Imports cookies, tabs, history, extensions, bookmarks, passwords. — **Shipped**. [Source](https://docs.sigmaos.com/common-questions)

### Caveats
- WebKit engine (not Blink/Chromium) means some Chrome extensions may not work despite Chrome Web Store availability.
- macOS-only is a hard ceiling on market reach. All competitors (Brave, Chrome, Opera, Edge) ship cross-platform.

---

## Dimension 6: User Experience Quality

### Claims

1. **Right-click → Airis** — Text selection → right-click opens Airis contextually. Low-friction entry point. — **Shipped**. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

2. **Press `A` → split-screen assistant** — Keyboard shortcut opens Airis in a side panel for multi-turn conversation. — **Shipped**. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

3. **In-page animated rewriting** — Airis rewrites content in place on the page; users see words change in real time. Supports multiple rewrite prompts (simpler, shorter, pirate voice, etc.). — **Shipped**. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

4. **Parallel tasks on multiple pages** — Multiple rewrite/translate tasks can run simultaneously across open pages. Noted as a UX differentiator vs. ChatGPT's single-thread model. — **Shipped**. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

5. **Hover link previews with AI summaries** — Airis Link Previews added in v1.12 (Nov 2023). — **Shipped**. [Source](https://sigmaos.com/updates/1-12)

6. **Pinch-to-summarize (desktop)** — Summarizes page sections on pinch gesture. Noted in TechCrunch review as producing "a small paragraph of info for an article, which is not sufficient" — mixed quality. — **Shipped, quality caveats**. [Source](https://news.yahoo.com/yc-backed-sigmaos-browser-turns-153036611.html)

7. **"Look it up" web search summary** — Browses the web for a query, returns a synthesized summary page with follow-up question support. — **Shipped**. [Source](https://news.yahoo.com/yc-backed-sigmaos-browser-turns-153036611.html)

8. **Single-key modal shortcuts throughout browser** — `A` for Airis, `F` for Focus Mode, `D` for Done, `SPACE` for Lazy Search. Consistent modal keyboard UX. — **Shipped**. [Source](https://docs.sigmaos.com/common-questions)

9. **Overall UX reception** — Generally positive from users on Product Hunt (390 upvotes) and Twitter testimonials ("beautiful experience," "in love"). Pickaxe 2026 review rates UX as a strength. — **Positive signal**. [Source](https://hunted.space/dashboard/sigmaos-airis-alpha) / [Source](https://sigmaos.com/)

### Caveats
- Airis labeled "Alpha" indicates rough edges.
- Summarization quality inconsistency reported by at least one journalist.
- No accessibility features for Airis documented.

---

## Dimension 7: MCP / Extension Integration

### Claims

1. **Chrome Web Store extensions supported** — Per-workspace scoping, pinnable to left panel, managed via Extensions Panel (`option+E`). — **Shipped**. [Source](https://docs.sigmaos.com/tutorial/extensions)

2. **No MCP (Model Context Protocol) support documented** — Exhaustive search of SigmaOS docs, blog, and third-party sources returned zero mentions of MCP integration. SigmaOS predates MCP's mainstream adoption.

3. **No plugin/extension API for AI** — No documentation of hooks that allow Chrome extensions to call Airis or expose AI capabilities to extension developers.

4. **No announced MCP roadmap** — No blog posts, changelog entries, or interviews mentioning plans to adopt MCP.

5. **WebKit-first stance limits extension ecosystem** — While Chrome Web Store extensions are supported, WebKit vs. Chromium differences mean not all extensions work reliably. No SigmaOS-specific extension store or SDK.

### Caveats
- As of the most recent public changelog (v1.13, Nov 2023), no extension API beyond standard Chrome extension support.
- MCP ecosystem is growing rapidly in 2025–2026; SigmaOS's silence here is a notable gap vs. Claude, Perplexity, and others building MCP server integrations.

---

## Dimension 8: Context Handling

### Claims

1. **Active page context awareness** — Airis's headline feature at launch: understands the full content of the current page. Example: reading about Manchester United, asking about "United" resolves to the football club, not the word. — **Shipped**. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

2. **Co-founder roadmap: whole-website understanding** — At launch, Mahyad mentioned that "in the coming months, the startup aims to train Airis to understand whole websites." — **Announced 2023; shipped status unknown**.

3. **Workspace creation via Airis** — Users can ask Airis to "create a SigmaOS workspace for an upcoming holiday" — cross-browser task using AI. — **Announced; shipped status unclear**. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

4. **Multi-turn conversation in split-screen** — Split-screen mode (`A`) supports back-and-forth contextual conversation. Context retained within a session. — **Shipped**. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

5. **No cross-tab context confirmed** — No documentation or review evidence of Airis having simultaneous awareness of multiple open tabs (contrast: Perplexity Comet explicitly synthesizes across tabs). — **Gap**.

6. **No PDF/file upload confirmed** — No mention in docs or reviews of uploading PDFs or local files to Airis. Contrast: Brave Leo supports PDF analysis. — **Gap**.

7. **No persistent conversation memory across sessions** — No evidence of Airis remembering previous conversations (contrast: ChatGPT Atlas Browser Memories). Conversation context appears session-scoped.

8. **History used for navigation** — Browser history is importable and searchable via Lazy Search, but this is browser history navigation, not Airis context. — **Shipped**. [Source](https://docs.sigmaos.com/common-questions)

### Caveats
- Context is injected at the page level. Token limits of underlying models (GPT-4o, etc.) constrain how much of a long page can be sent.
- No information on how context is truncated for very long pages.

---

## Dimension 9: Reliability and Error Handling

### Claims

1. **Rate limiting by tier** — Free: limited queries; Pro: "high usage"; Max: "unlimited." Specific query counts not published. — **Confirmed structure, details opaque**. [Source](https://sigmaos.com/upgrade)

2. **Alpha stability caveats** — Airis is labeled "Alpha" on the product page and alpha testers get free access "until Airis gets out of Alpha," signaling ongoing instability. — **Confirmed**. [Source](https://sigmaos.com/airis) / [Source](https://sigmaos.com/upgrade)

3. **Parallel task design for reliability** — Token-usage algorithm designed to let multiple AI tasks run simultaneously without blocking — implies a queuing/parallelism architecture that should handle concurrent requests. — **Shipped**. [Source](https://techcrunch.com/2023/06/02/sigmaos-launches-a-contextual-ai-assistant-for-its-browser/)

4. **Reviewer-noted quality inconsistency** — TechCrunch/Yahoo review: pinch-to-summarize "just gives a small paragraph of info for an article, which is not sufficient." Same review noted it "worked consistently across formats" for structured pages (Airbnb). — **Mixed reliability**. [Source](https://news.yahoo.com/yc-backed-sigmaos-browser-turns-153036611.html)

5. **No published SLA or uptime guarantee** — No status page, no SLA documentation found.

6. **Error handling UI not documented** — No public documentation on what users see when Airis fails (rate limit hit, API error, context too long, etc.).

7. **~100,000 users reported** — Co-founder cited this figure (early 2024), providing a sense of scale. [Source](https://news.yahoo.com/yc-backed-sigmaos-browser-turns-153036611.html)

### Caveats
- Dependent on upstream OpenAI/Anthropic/Meta API reliability — any outage in those services directly impacts Airis.
- No fallback to on-device model when cloud is unavailable.

---

## Dimension 10: Developer API Access

### Claims

1. **No public developer API for Airis** — Exhaustive search found zero documentation of a REST API, SDK, or programmatic interface for accessing Airis from extensions, scripts, or third-party apps.

2. **Chrome extensions supported but without AI hooks** — Extensions from Chrome Web Store work within SigmaOS, but there is no documented API surface allowing extensions to call Airis, inject prompts, or receive AI responses. — **Gap confirmed**.

3. **No developer documentation for AI features** — The `docs.sigmaos.com` site covers user-facing tutorial topics (Workspaces, Lazy Search, Extensions, Shortcuts) but has no developer section, API reference, or SDK docs.

4. **No webhook or automation API** — "Repeatable flows" (IFTTT-like) was described as conceptual in early 2024. No shipping confirmed.

5. **No third-party integration documentation** — No Zapier, Make, or n8n integrations listed anywhere.

### Caveats
- This is an area where SigmaOS is significantly behind Brave (Leo API with BYOM/Ollama), Opera (Aria API), and any browser adopting MCP.
- Small team ($4M raised, YC-backed) likely means developer platform is deprioritized vs. core UX.

---

## Sources

### Kept
- **SigmaOS Upgrade Page** (sigmaos.com/upgrade) — authoritative on current pricing tiers and AI feature gating
- **SigmaOS Privacy Policy** (docs.sigmaos.com/privacy-policy) — primary source on data handling; notably predates Airis
- **SigmaOS Common Questions** (docs.sigmaos.com/common-questions) — primary source on pricing (older), extensions, privacy claims
- **SigmaOS Extensions Tutorial** (docs.sigmaos.com/tutorial/extensions) — authoritative on Chrome extension support
- **TechCrunch — June 2023 launch** (techcrunch.com/2023/06/02) — primary source on Airis launch features, model, UX design
- **Yahoo/TechCrunch — 2024 AI monetization** (news.yahoo.com/yc-backed-sigmaos-browser-turns-153036611.html) — key source on feature roadmap, agentic demo, model tiers, pricing structure
- **Pickaxe 2026 AI Browser Review** (pickaxe.co/post/top-ai-browsers-extensions-2026) — third-party comparative review with current (2026) status claims
- **SigmaOS v1.12 Update** (sigmaos.com/updates/1-12) — changelog evidence for Airis Link Previews

### Dropped
- **opentools.ai/tools/airis-by-sigmaos** — aggregator, no original information beyond what primary sources contain
- **completeaitraining.com** — course listing, no factual content
- **qrvey.com/blog/sigma-pricing** — about Sigma Computing (analytics product), not SigmaOS browser
- **sigmabrowser.com** — different product (Sigma Private AI Browser), not SigmaOS
- **aitoolsexplorer.com** — thin aggregator, no verified details

---

## Gaps

### Unanswered Questions
1. **Airis AI query data handling** — Privacy policy silent on whether prompt + page content is sent to OpenAI/Anthropic and under what retention terms. Critical for enterprise adoption.
2. **Agentic browsing shipped status** — Demoed in early 2024, claimed shipped by Pickaxe 2026, but no official changelog or release note confirms it. Needs hands-on verification.
3. **Context handling limits** — No documentation on token limits, page truncation behavior, or multi-tab context support.
4. **Current model versions** — "Claude…" and "Llama…" in marketing are vague. Actual model versions (Claude 3 Haiku? Claude 3.5 Sonnet?) and update cadence unknown.
5. **Windows/mobile roadmap** — No public statement on cross-platform expansion.
6. **PDF/file upload support** — Not documented; unknown whether supported.
7. **Team/enterprise pricing** — No tier exists; unknown if planned.
8. **Rate limit specifics** — "Limited" vs. "high usage" vs. "unlimited" with no query counts disclosed.

### Suggested Next Steps
- Install SigmaOS and test agentic browsing, PDF handling, cross-tab context, and rate limit behavior directly.
- Contact founders@sigmaos.com to request AI data processing addendum details.
- Check SigmaOS Slack community for user-reported feature availability and bug patterns.
- Monitor sigmaos.com/updates for changelog entries post-v1.13 (none found publicly indexed).
