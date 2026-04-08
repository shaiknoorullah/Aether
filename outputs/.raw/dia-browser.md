# Research: Dia Browser — AI Features Comprehensive Analysis

**Research date:** 2026-04-08  
**Subject:** Dia browser by The Browser Company (acquired by Atlassian, Oct 2025)  
**Current stable version:** 1.25.0 (Mar 26, 2026)  
**Status:** Generally available on macOS since Oct 2025; Windows waitlist opened Mar 2026

---

## Summary

Dia is a Chromium-based, macOS-only (Apple Silicon) AI browser from The Browser Company — acquired by Atlassian for $610M in October 2025. It positions as a reading/writing/research copilot with AI integrated into the URL bar and a right-panel sidebar, not a full web-automation agent. The browser secretly routes queries across ChatGPT, Claude, and Gemini with no user model selection. Pricing is $0 free (rate-limited) / $20/month Pro. No MCP support, no developer API, no Linux/mobile.

---

## Dimension 1: AI Model Access and Selection

### Findings

**No user-facing model selection.** Dia uses a proprietary internal routing system that automatically selects the most appropriate model per query from ChatGPT, Claude, and Gemini. Users have zero control over which model handles their request.

> "Dia leverages ChatGPT, Claude, and Gemini, among others, analyzing user prompts and routing each one to whichever AI model is most likely to give the best response." — [TidBITS, Aug 2025](https://tidbits.com/2025/08/08/dia-ai-browser-introduces-20-monthly-pro-plan-with-unlimited-chat/)

**Cloud-only processing.** There is no on-device inference. All AI queries are transmitted to Dia's servers and proxied to third-party LLM providers. The browser's privacy page explicitly states: "the data required for your request...is briefly sent to our servers and passed to a trusted partner." — [diabrowser.com/privacy](https://www.diabrowser.com/privacy)

**No on-device model option announced.** As of April 2026, no Ollama, local Llama, or on-device model integration exists or has been announced.

**Model routing rationale:** The routing decision is opaque — Dia does not disclose which queries go to which provider, what criteria govern selection, or whether it uses the same model for all query types.

| Attribute | Status |
|---|---|
| User model selection | ❌ Not available |
| On-device inference | ❌ Not available |
| Model transparency | ❌ Opaque routing |
| Models in pool | ChatGPT, Claude, Gemini (confirmed) |
| Cloud-only | ✅ All queries go to servers |

### Caveats
- Model pool may change; Dia has not committed to any specific provider or published a model changelog
- The high cost pressure from LLM API bills was the stated reason for introducing Dia Pro pricing ([TechCrunch, Aug 2025](https://techcrunch.com/2025/08/06/the-browser-company-launches-a-20-monthly-subscription-for-its-ai-powered-browser/))

---

## Dimension 2: Agent Automation Capabilities

### Findings

**Dia is intentionally low-autonomy.** Multiple independent analyses and the MarkTechPost comparative review characterize Dia as a "high-context copilot" rather than an autonomous agent. The browser explicitly does not expose a general DOM-manipulation agent capable of clicking, form-filling, or navigating arbitrary sites on the user's behalf.

> "Current public builds do not expose a general DOM automation agent capable of open-ended clicking and form submission across arbitrary sites." — [MarkTechPost, Nov 2025](https://www.marktechpost.com/2025/11/15/comparing-the-top-4-agentic-ai-browsers-in-2025-atlas-vs-copilot-mode-vs-dia-vs-comet/)

**What Dia CAN do (shipped):**
- **Read and summarize** any open tab or multiple tabs simultaneously
- **Tab comparisons**: "Compare these Airbnb listings in a table"
- **In-page text transformation**: select text → AI edits → Insert with one click (no copy-paste)
- **Skills**: User-defined reusable prompt scripts (slash-commands like `/proof`, `/outline`, `/transcript`). Both built-in and user-created. Community gallery at [diabrowser.com/skills](https://www.diabrowser.com/skills)
- **`fetch_web_content`**: Fetches URLs on user's behalf for richer context (with URL provenance security controls — see Dimension 9)
- **YouTube transcripts**: Built-in skill extracts video transcripts
- **Dia Reports (Mar 2026)**: Type "morning" in new tab to generate cross-tool daily briefing aggregating from Slack, Notion, Google Calendar, Gmail, Amplitude

**What Dia CANNOT do:**
- Autonomously click links or navigate to new pages
- Fill out forms on the user's behalf
- Book reservations, compare prices across sites with checkout
- Execute multi-step workflows without user involvement at each step
- Update CRMs, spreadsheets, or external apps

**Skills system detail (shipped):** Skills are slash-command prompt templates with variables (e.g., audience, tone). They can be shared in the community gallery. Built-in skills include `/outline`, `/transcript`, `/fact-check`, `/reflect`, `/weekly`. The Skills Gallery at [diabrowser.com/skills](https://www.diabrowser.com/skills) hosts community-contributed skills. This is the primary "automation" surface — but it is still prompt-driven, not click-driven.

**Third-party integrations (Mar 2026, shipped):** Slack, Notion, Google Calendar, Gmail, Amplitude are now connected as context sources, not action targets. Dia pulls data from these services for reports and summaries but does not write back to them autonomously.

> "Integrations...allowing the browser's AI assistant to retrieve context from these services and generate reports, summaries, and presentations" — [Wikipedia citing BCNY.com/coffee, Mar 2026](https://en.wikipedia.org/wiki/Dia_(web_browser))

| Capability | Status |
|---|---|
| Read/summarize open tabs | ✅ Shipped |
| Multi-tab comparison | ✅ Shipped |
| In-page text editing | ✅ Shipped |
| Skills (prompt shortcuts) | ✅ Shipped |
| Daily briefing reports | ✅ Shipped (Mar 2026) |
| Autonomous form-filling | ❌ Not available |
| Autonomous navigation | ❌ Not available |
| Multi-step agentic flows | ❌ Not available |
| Writing back to connected apps | ❌ Not available |

### Caveats
- Atlassian's stated post-acquisition focus is "individual knowledge worker workflows" not transactional automation, suggesting the low-autonomy posture is deliberate long-term strategy
- Dia's security architecture (see Dimension 9) actively precludes broad DOM agent access by design

---

## Dimension 3: Privacy Model

### Findings

**Local-first storage:** Browsing history, chats, bookmarks, and saved content are stored locally on-device and encrypted. Data only leaves the device when a specific AI query is made. — [diabrowser.com/privacy](https://www.diabrowser.com/privacy)

**AI query transmission:** When a query is submitted, "the data required for your request (like your question, or your open tab) is briefly sent to our servers and passed to a trusted partner." Partners are contractually restricted from training on user data.

**Data retention:**
- Standard AI queries: Partners "may not store it after your request is complete" (no committed duration — "brief")
- If user opts into "share content data to improve Dia": data stored on Dia's servers for **30 days**, then deleted. Data is de-linked from the user account immediately upon leaving the device — Dia cannot honor early deletion requests because the data is no longer user-identifiable
- Chat/file/history deletion: permanent and immediate when user-initiated
- Incognito mode: nothing is stored

**Sensitive site protection:** Dia "will work to avoid storing and processing data from sensitive sites (like banking or healthcare-related sites)." — [diabrowser.com/privacy](https://www.diabrowser.com/privacy)

**Data sale:** "We will never sell your personal data. Period." — [diabrowser.com/privacy](https://www.diabrowser.com/privacy)

**Login requirement:** Account required to save preferences and enable AI features. Explicitly stated to NOT be for tracking.

**Opt-in improvement program:** Opting into content data sharing is optional and configurable in Settings → Privacy Panel.

**Atlassian acquisition impact:** As of October 2025, The Browser Company is now an Atlassian subsidiary. No updated privacy policy addressing Atlassian data practices has been publicly highlighted. This is a material gap.

| Attribute | Status |
|---|---|
| Local storage by default | ✅ Yes |
| On-device AI processing | ❌ No (cloud only) |
| Partners can train on data | ❌ Contractually prohibited |
| Data sale | ❌ Never |
| Retention (standard queries) | Unspecified "brief" period |
| Retention (improvement program) | 30 days, then deleted |
| Anonymization | ✅ De-linked from account on upload |
| Incognito stores nothing | ✅ |
| Sensitive site avoidance | ✅ (best-effort) |
| GDPR/CCPA compliance | Not stated explicitly |

### Caveats
- "Partners restricted from training" is a contractual claim, not a technical enforcement — users must trust Dia's vendor agreements
- The 30-day retention on improvement data cannot be revoked once uploaded even if user changes their mind
- No transparency report or third-party audit of privacy practices exists as of this research date

---

## Dimension 4: Pricing and Tiers

### Findings

**Free tier ($0):**
- Full browser functionality
- AI Chat on any tab
- Create Custom Skills
- Mention tabs in any query
- Add file attachments to queries
- Personalize Dia with Memory
- **Usage limits on AI chat** (unspecified threshold; CEO Josh Miller said "a few times a week" is sufficient on the free tier)
- Includes a 14-day Pro trial

**Dia Pro ($20/month):**
- Everything in Free
- "Unlimited Chat usage" — caveat: "provided usage is within our Terms of Use"
- Launched August 6, 2025 ([TechCrunch](https://techcrunch.com/2025/08/06/the-browser-company-launches-a-20-monthly-subscription-for-its-ai-powered-browser/), [The Verge](https://www.theverge.com/news/756427/browser-company-dia-pro-ai-pricing))

**Multiple tiers hinted (not yet launched):** CEO Josh Miller told the New York Times (July 2025) plans include tiers "ranging from $5 per month to hundreds of dollars monthly" depending on usage. No additional tiers have been publicly released as of April 2026.

**Enterprise pricing:** No enterprise plan, team plan, or volume licensing announced as of April 2026. The Atlassian acquisition creates an obvious path to Jira/Confluence integration pricing, but nothing has shipped.

**Student pricing:** [diabrowser.com/students](https://www.diabrowser.com/students) page exists (referenced in Pro page nav), details not captured.

| Tier | Price | AI Limits | Notes |
|---|---|---|---|
| Free | $0 | Rate-limited (threshold undisclosed) | 14-day Pro trial included |
| Dia Pro | $20/month | "Unlimited" (within ToS) | Only tier available as of Apr 2026 |
| Enterprise | — | — | Not announced |
| $5 tier | — | — | Hinted, not launched |

### Caveats
- "Unlimited" is qualified by ToS, meaning heavy batch/API-style usage could still be throttled
- No annual pricing discount has been announced
- Exact free-tier limit is never disclosed — users hit it and then see an upsell

---

## Dimension 5: Platform Support

### Findings

**macOS: GA (Oct 2025)**
- Requires macOS 14 (Sonoma) or later
- **Apple Silicon (M1 chip or later) required** — Intel Macs explicitly not supported
- Engine: Chromium/Blink + V8, written in Swift
- Download: [diabrowser.com/download](https://www.diabrowser.com/download)
- Generally available since October 9, 2025, no invite required ([The Verge, Oct 2025](https://www.theverge.com/news/797436/dia-browser-available-mac))

**Windows: Waitlist only**
- "Dia on Windows" page published March 2026: [diabrowser.com/windows](https://www.diabrowser.com/windows)
- Sign-up for "early testing" — no availability date disclosed
- No release date announced

**Linux:** Not mentioned anywhere; no plans disclosed.

**iOS / iPadOS:** Not available, not announced.

**Android:** Not available, not announced.

**Web (browser-in-browser):** Not available.

**Sync:** Login required for preferences and AI Memory sync. Core browsing data (history, chats) stored locally — cross-device sync behavior is not explicitly documented.

| Platform | Status |
|---|---|
| macOS (Apple Silicon, 14+) | ✅ GA since Oct 2025 |
| macOS (Intel) | ❌ Not supported |
| Windows | ⏳ Waitlist (Mar 2026) |
| Linux | ❌ No plans disclosed |
| iOS | ❌ No plans disclosed |
| Android | ❌ No plans disclosed |
| Cross-device sync | ⚠️ Partial (preferences via login) |

### Caveats
- Apple Silicon requirement (not just macOS 14) eliminates a substantial portion of Mac users still on Intel hardware
- The Atlassian acquisition could accelerate cross-platform expansion, but no roadmap commitment exists

---

## Dimension 6: User Experience Quality

### Findings

**Initial reception (June 2025):** Widely panned as "Chrome with an AI sidebar slapped on top." Critically missing Arc features: vertical tabs, Spaces/workspaces, Command Bar, tab pinning. Described by MakeUseOf reviewer as making it "impossible to get anything done." ([MakeUseOf, Dec 2025](https://makeuseof.com/i-thought-this-browser-was-awful-until-one-update-flipped-everything/))

**Post-v1.x reception (Nov–Dec 2025):** Significantly improved after re-introduction of vertical tabs, pinned tab grid (3×3), and Control+Tab preview switcher (same as Arc's tab switcher). MakeUseOf reviewer switched to Dia as default browser for browsing (excluding AI features due to security concerns).

**Current UI layout:**
- **URL bar:** Unified bar that accepts both URLs and AI chat queries — Dia decides context-appropriately which to handle as search vs AI
- **Right sidebar:** AI chat panel, persistent but collapsible
- **In-page overlay:** Select text → AI transform options appear inline
- **Skills invocation:** Type `/skillname` anywhere in the AI input or URL bar
- **New tab:** "Morning" command triggers daily briefing report
- **Tab bar:** Vertical tabs (re-introduced) with pinned tab grid at top; Control+Tab for preview-based switching

**Frictions reported by users:**
- AI triggers automatically when user intends a Google search — no clean mode to disable AI in URL bar without disabling globally
- Arc features still missing: Spaces/profiles (Chrome-style only), sidebar folders, Little Arc window
- Laggy animations on older Apple Silicon during AI interactions
- Limited extension library compared to Chrome
- No session restore on crash

**Discoverability:** Skills gallery ([diabrowser.com/skills](https://www.diabrowser.com/skills)) provides community discovery. Skills are created by saving any prompt with a slash-command alias. AI capabilities are front-and-center; the sidebar is hard to miss. The interface is intentionally minimal ("boring browser" design brief) to lower switching friction.

**Inline text editing (shipped):** Select text → AI panel offers edit/rewrite/improve → "Insert" button replaces text in-place. No track-changes view. Requires precise prompting to avoid wholesale rewrites.

| UX Attribute | Assessment |
|---|---|
| AI integration style | Sidebar + URL bar + inline |
| Friction to use AI | Low (always visible) |
| Friction of unwanted AI | Medium (triggers automatically) |
| Tab management | Improved (vertical tabs, pin grid) |
| Arc feature parity | ~50% (Spaces, folders still missing) |
| Overall stability | High (no crashes reported in extended use) |

### Caveats
- UX is rapidly evolving; weekly release cadence ("Details that delight" newsletter) means the above may be outdated within weeks
- The "boring browser" design philosophy intentionally trades power-user depth for mass-market accessibility

---

## Dimension 7: MCP / Extension Integration

### Findings

**No MCP (Model Context Protocol) support.** No evidence of MCP client or server support in Dia's official documentation, changelog, or any third-party reporting as of April 2026. The `aaronjmars/opendia` GitHub project (1,790 stars) is a third-party project to bring "Dia-like" AI to Chrome/Firefox — it is not Dia's own MCP integration.

**Standard Chromium extension ecosystem:** Dia is Chromium-based and supports Chrome Web Store extensions. However, extension support is described as "limited" in comparative reviews — the specifics of any restrictions versus standard Chrome are not documented.

**Raycast integration (shipped):** A Dia Raycast extension exists (merged PR #18667 in the Raycast extensions repository), enabling browser control from Raycast launcher.

**Skills as a plugin substitute:** The Skills system (slash-command prompt templates) serves as Dia's primary extensibility surface for AI behavior. Skills are shareable and remixable via the community gallery. Skills can be thought of as "prompt macros" — not code-level plugins.

**Third-party service integrations (Mar 2026, shipped):**
- Slack, Notion, Google Calendar, Gmail, Amplitude connected as context sources
- These enable Dia's AI to pull cross-tool context for reports
- Integration mechanism is not documented (likely OAuth-based connectors, not MCP)

**No extension SDK for AI access:** No documented API for Chrome extensions to invoke Dia's AI features programmatically.

| Integration | Status |
|---|---|
| MCP client | ❌ Not supported |
| MCP server | ❌ Not supported |
| Chrome Web Store extensions | ✅ Supported (with some limits) |
| Raycast extension | ✅ Shipped |
| Skills (prompt macros) | ✅ Community gallery live |
| Slack/Notion/Gmail/Calendar | ✅ Context sources (Mar 2026) |
| Extension AI SDK | ❌ Not available |

### Caveats
- The Atlassian acquisition makes Jira and Confluence integration highly probable in a future roadmap, but nothing announced
- MCP adoption is growing rapidly in the ecosystem; Dia's absence from this space is a notable gap for developers
- Skills are prompt-level only — they cannot execute code, call external APIs, or interact with the DOM

---

## Dimension 8: Context Handling

### Findings

**Tab context (shipped):** Dia can read and reason over any or all open tabs simultaneously. Users can "mention" specific tabs using `@tabname` syntax in queries.

**Browsing history (shipped):** Optionally used as context for responses. Opt-in at the query level. Dia v0.45.0 changelog explicitly highlights "easier than ever to use your browsing history."

**Memory system (shipped):** Persistent user memory stores preferences, recurring topics, learned context. Users can:
- Enable/disable Memory globally
- Control what specific contexts are stored
- View and delete memory entries

**File attachments (shipped):** Free tier includes the ability to add file attachments to any query. Specific file types supported (PDF confirmed; full list not documented).

**`fetch_web_content` (shipped, Aug 2025):** Dia can fetch external URLs to enrich responses. Subject to URL provenance security controls (see Dimension 9). Enables: article summarization, documentation lookup, link context.

**YouTube transcript extraction (shipped):** Built-in `/transcript` skill extracts full video transcripts. Referenced in Skills gallery.

**Third-party app context (shipped, Mar 2026):**
- Slack messages, Notion pages, Google Calendar events, Gmail threads, Amplitude data can all be pulled into Dia context
- Enables cross-tool morning reports, interview prep, to-do aggregation
- Invoked via "morning" command or Skills

**PDF support:** Attachments are confirmed; PDF specifically mentioned in the security bulletins document (PDFs as user-provided context sources with provenance).

**Conversation memory:** Chat history is stored locally. The Memory feature goes beyond chat history to store inferred preferences and topic interests.

| Context Type | Status |
|---|---|
| Current tab content | ✅ Shipped |
| Multiple tabs simultaneously | ✅ Shipped |
| Browsing history | ✅ Opt-in |
| Persistent user memory | ✅ Shipped |
| File/PDF attachments | ✅ Shipped |
| URL fetching | ✅ Shipped (with provenance controls) |
| YouTube transcripts | ✅ Shipped |
| Slack context | ✅ Shipped (Mar 2026) |
| Notion context | ✅ Shipped (Mar 2026) |
| Gmail context | ✅ Shipped (Mar 2026) |
| Google Calendar context | ✅ Shipped (Mar 2026) |
| Amplitude context | ✅ Shipped (Mar 2026) |

### Caveats
- Context window limits are not disclosed — unclear how many tabs or how much history can realistically be fed to the model
- Third-party context is read-only: Dia cannot write back to Slack, Notion, etc.
- Memory can be disabled; some users prefer stateless sessions for privacy

---

## Dimension 9: Reliability and Error Handling

### Findings

**General stability:** User reviews consistently describe Dia as "fast and stable" with "months of use without crashes." This is notable praise in an AI browser category where most products feel unfinished. ([Composite.ghost.io review, Mar 2026](https://composite.ghost.io/dia-browser-reviews-pricing-alternatives/))

**Rate limiting (free tier):** Free tier has usage limits on AI chat. Exact thresholds are never disclosed. Users report hitting limits and seeing an upsell to Pro. The limit is calibrated such that "a few times a week" usage remains free ([NYT via TechCrunch, Aug 2025](https://techcrunch.com/2025/08/06/the-browser-company-launches-a-20-monthly-subscription-for-its-ai-powered-browser/)).

**Pro tier limits:** "Unlimited" AI usage with the asterisk that it must comply with ToS. Heavy/programmatic use could still be restricted.

**Prompt injection security incident and remediation (the `fetch_web_content` story):**
- January 2025: `fetch_web_content` built in earliest internal builds
- Pre-June 2025: Security team discovered data exfiltration attack via URL encoding + prompt injection
- June 2025: Feature **intentionally unlaunched** before public beta to avoid shipping an exploited vulnerability
- August 2025: Feature rebuilt with URL provenance architecture and re-launched
- The fix: `fetch_web_content` now only fetches URLs that have traceable provenance to user-provided content — model-constructed URLs (the attack vector) are rejected before the request leaves the device
- Security bulletin published at [diabrowser.com/security/bulletins](https://diabrowser.com/security/bulletins) in February 2026

**Prompt injection residual risk:** The security bulletin explicitly states that provenance closes this specific attack vector but does not claim prompt injection is "solved." The MakeUseOf reviewer (Nov 2025) was still able to create a working prompt injection attack via a hidden-instruction webpage, causing the model to "speak in pirate language" — suggesting Dia's mitigations are not universal.

**Fallback behavior:** Not documented. When AI requests fail (timeout, rate limit, provider error), the browser's behavior is unspecified in public docs.

**Lag:** Some users on older Apple Silicon hardware report "laggy animations and occasional crashes during AI interactions."

**Weekly release cadence:** The "Details that delight" weekly release notes show consistent shipping velocity, suggesting active maintenance.

| Reliability Attribute | Assessment |
|---|---|
| Browser stability | High (no crash reports in extended use) |
| AI uptime | Not disclosed |
| Free tier rate limiting | Exists; threshold undisclosed |
| Pro rate limiting | ToS-based ("unlimited" with caveats) |
| Security posture | Proactive (unlaunch + rebuild precedent) |
| Prompt injection protection | Partial (URL provenance + defense-in-depth; not solved for all vectors) |
| Error message quality | Not documented |

### Caveats
- No public SLA or uptime metrics exist for Dia's AI infrastructure
- The provenance-based `fetch_web_content` security fix is a strong architectural signal, but other attack surfaces remain
- The reliance on third-party LLM providers (OpenAI, Anthropic, Google) means Dia's reliability is partially dependent on upstream API availability

---

## Dimension 10: Developer API Access

### Findings

**No public developer API.** As of April 2026, Dia has not released:
- A public API for third-party applications to call Dia's AI
- An SDK or documented programmatic interface for extensions
- A JavaScript API for webpage-to-Dia communication
- MCP server endpoints

**Chromium extension support (limited):** Dia is Chromium-based and runs Chrome Web Store extensions, but extension support is described as "limited" vs standard Chrome in comparative reviews. The specific restrictions are not documented.

**Skills system (not a developer API):** Skills are user-created prompt macros with slash-command triggers. They support variable substitution (e.g., `[audience]`, `[tone]`) but cannot execute code, make external API calls, or interact with the DOM. Skills are a user-productivity feature, not a developer extensibility API.

**Raycast extension:** Third-party Raycast extension enables Dia browser control from the Raycast launcher (open tabs, focus windows). This is a Raycast-side automation, not Dia exposing an API. — [GitHub PR #18667](https://github.com/raycast/extensions/pull/18667)

**`opendia` project:** A community project (1,790 stars) to "connect your browser to AI models using Dia on Chrome, Arc, or Firefox" — this is bringing Dia-like functionality to other browsers via extension, not an official Dia developer API. — [aaronjmars/opendia](https://github.com/aaronjmars/opendia)

**No developer documentation:** [diabrowser.com](https://diabrowser.com) has no Developer section, no API docs, no changelog entries referencing extension APIs.

**Atlassian angle:** Post-acquisition, the most probable developer story is Jira/Confluence/Atlassian ecosystem integration. No formal announcement as of this date.

| Developer Feature | Status |
|---|---|
| Public REST/GraphQL API | ❌ Not available |
| Extension AI SDK | ❌ Not available |
| MCP server | ❌ Not available |
| Chrome extension support | ✅ (with undocumented limits) |
| Skills as extension point | ⚠️ User-facing only, no code execution |
| Developer documentation | ❌ None |
| Official Raycast support | ✅ (third-party, merged) |

### Caveats
- The absence of a developer API at this stage is consistent with Dia's consumer-first positioning
- Atlassian's developer platform (Forge, Connect) could provide a future integration layer, but nothing is announced
- For builders wanting browser AI access, the `opendia` community project and Browser MCP (browsermcp.io) are third-party workarounds, not official solutions

---

## Sources

### Kept (directly used)

| Source | URL | Why Relevant |
|---|---|---|
| diabrowser.com/privacy | https://www.diabrowser.com/privacy | Official privacy policy — authoritative for Dimension 3 |
| diabrowser.com/pro | https://www.diabrowser.com/pro | Official pricing page — authoritative for Dimension 4 |
| diabrowser.com/skills | https://www.diabrowser.com/skills | Official Skills gallery — Dimensions 2, 7 |
| diabrowser.com/start | https://www.diabrowser.com/start | Official Morning Reports feature — Dimensions 2, 8 |
| diabrowser.com/security/bulletins | https://diabrowser.com/security/bulletins | First-party security engineering writeup — Dimension 9 |
| diabrowser.com/windows | https://www.diabrowser.com/windows | Official Windows waitlist page — Dimension 5 |
| Wikipedia: Dia (web browser) | https://en.wikipedia.org/wiki/Dia_(web_browser) | Timeline, acquisition facts, integrations |
| TechCrunch: $20 subscription launch | https://techcrunch.com/2025/08/06/the-browser-company-launches-a-20-monthly-subscription-for-its-ai-powered-browser/ | Pricing launch, CEO quotes on model tiers |
| TidBITS: Pro plan analysis | https://tidbits.com/2025/08/08/dia-ai-browser-introduces-20-monthly-pro-plan-with-unlimited-chat/ | **Key**: confirms ChatGPT+Claude+Gemini routing, business context |
| TidBITS: Dia debut review | https://tidbits.com/2025/06/20/dia-browser-debuts-with-contextual-ai-chat-but-arc-users-feel-left-behind/ | Deep UX review, Skills workflow, tab context features |
| MarkTechPost: 4-browser comparison | https://www.marktechpost.com/2025/11/15/comparing-the-top-4-agentic-ai-browsers-in-2025-atlas-vs-copilot-mode-vs-dia-vs-comet/ | Structured comparison vs Atlas/Edge/Comet; agentic capability matrix |
| MakeUseOf: update flip review | https://makeuseof.com/i-thought-this-browser-was-awful-until-one-update-flipped-everything/ | UX evolution, vertical tabs, prompt injection test |
| Composite.ghost.io: alternatives review | https://composite.ghost.io/dia-browser-reviews-pricing-alternatives/ | User feedback aggregation, professional workflow gaps |
| Crepal.ai: agent guide | https://crepal.ai/blog/agent/dia-browser-guide-2025-build-custom-agents-for-daily-tasks/ | Skills workflow in depth, integration behavior |
| Dia changelog 0.45.0 | https://www.diabrowser.com/changelog/0-45-0 | Memory + history integration feature |
| aaronjmars/opendia | https://github.com/aaronjmars/opendia | Community project context for Dimension 10 |

### Dropped

| Source | Why Excluded |
|---|---|
| beam.ai article | Pre-GA Dia description; accurate context but light on specifics vs other sources |
| Thurrott.com (paywalled) | Paywalled; could not access content |
| opentools.ai | Thin summary, redundant with TechCrunch |
| LinkedIn posts | Gated; could not extract specifics |
| Skywork.ai | Opinion piece; relevant quotes captured from other sources |

---

## Gaps

### Unanswered Questions

1. **Exact model routing logic:** Which queries go to Claude vs GPT vs Gemini? Is there any user-facing signal? This is completely opaque.

2. **Atlassian data implications:** The acquisition completed October 2025. Atlassian's own privacy practices now apply to Dia's parent entity. No updated privacy disclosure covers this.

3. **Free-tier rate limits:** Exact thresholds are deliberately undisclosed — Dia only informs users when they've been cut off, with no proactive limit display.

4. **Windows release date:** March 2026 waitlist opened, but no ETA disclosed. Windows represents ~60% of the PC market; this is a critical gap for mass-market positioning.

5. **Extension API restrictions:** Dia is Chromium-based but "extension support is limited" — which specific Chrome extension APIs are blocked or sandboxed is not publicly documented.

6. **Intel Mac support timeline:** Hard requirement for Apple Silicon excludes all pre-2020 Mac hardware. No announced plan to support Intel.

7. **Enterprise/team features:** Given Atlassian's enterprise footprint, workspace/team features seem inevitable but have not been announced. No multi-user, admin controls, or SSO support is documented.

8. **Context window size:** Dia does not disclose how much tab/history content can be loaded into a single query. Large-page behavior and token limits are undocumented.

9. **Atlassian product integrations (Jira, Confluence):** Strategically obvious; not yet announced as of April 2026.

10. **Offline capability:** Entirely undocumented. Given cloud-only AI, likely none — but standard browser behavior when offline is unclear.

### Suggested Next Steps
- Monitor [diabrowser.com/release-notes](https://www.diabrowser.com/release-notes/latest) weekly for Windows launch and developer API announcements
- Watch for Atlassian BUILD or Team conference announcements for Jira/Confluence integration
- Test free-tier rate limiting empirically with heavy use to establish approximate threshold
- Review Atlassian's privacy policy to understand Dia's new parent entity's data practices
