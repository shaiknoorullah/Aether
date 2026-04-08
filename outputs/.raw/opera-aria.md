# Research: Opera AI (Aria) — Comprehensive Feature Analysis

**Date**: 2026-04-08  
**Scope**: Opera's browser AI ecosystem covering Aria (free, Opera One/GX/Air/Mobile) and Opera Neon (premium, $19.90/mo agentic browser)

---

## Dimension 1: AI Model Access and Selection

### Models Available

**Cloud (Aria — free tier):**
- OpenAI GPT models (family unspecified publicly; GPT-4-class as of 2024)
- Google Gemini models — integrated May 2024 via Google Cloud partnership
- Opera's "Composer AI Engine" routes between backends; users cannot manually select which cloud model is used — routing is automatic/transparent
- **Sources**: [Gemini integration announcement](https://blogs.opera.com/news/2024/05/aria-now-boosted-by-googles-gemini-models) | [Opera AI FAQ](https://help.opera.com/en/browser-ai-faq)

**Cloud (Opera Neon — premium, $19.90/mo):**
- GPT-5.1 (OpenAI)
- Gemini 3 Pro (Google)
- Nano Banana Pro (Google image model)
- Frontier model access is the primary premium differentiator
- **Source**: [ZDNET Neon review, Dec 2025](https://www.zdnet.com/article/opera-neon-ai-browser-frontier-models-security-risks-cost/)

**On-device / Local LLMs (Opera One Developer / Opera Neon):**
- 150 LLM variants from ~50 model families including LLaMA, Gemma, Mixtral, Qwen
- Opera Neon added Llama and Qwen models January 2026
- Models require 2–67 GB storage; initial download requires internet, then fully offline
- Described as "considerably slower" than cloud models due to local GPU constraints
- **Status**: Shipped in Developer channel April 2024; available in Neon; not yet in stable Opera One/GX
- **Sources**: [The Register, Apr 2024](https://www.theregister.com/2024/04/03/opera_local_llm/) | [Opera Neon Llama/Qwen blog, Jan 2026](https://blogs.opera.com/news/2026/01/llama-and-qwen-new-ai-models-in-opera-neon/)

### Model Switching

- **Aria (free)**: No user-facing model selection — Opera Composer engine selects automatically
- **Opera Neon**: Model selection UI available in Neon Chat; users can choose from available frontier + open source models
- **Caveat**: No published API to programmatically select models from extensions

---

## Dimension 2: Agent Automation Capabilities

### Browser Operator (Neon "Do" mode)

- **Shipped**: Preview announced March 2025; GA as part of Opera Neon launch (Sept/Oct 2025)
- **What it can do**:
  - Fill forms (user types sensitive data directly into page — not sent to Opera servers)
  - Navigate multi-step workflows (buy tickets, book hotels, shop online)
  - Collect and extract structured information from pages into documents/spreadsheets
  - Click elements, open tabs, perform searches
  - Cancel/resume at any moment ("human-in-the-loop")
- **How it works**: Uses DOM tree + browser layout data (not screenshots or pixel analysis); runs natively on-device (not a cloud VM); interprets full page at once without scrolling
- **Privacy during agentic tasks**: No keystrokes, no screenshots sent to Opera servers during sensitive form entry; "Resume" button required to let operator continue
- **Limitation**: Must pause for user confirmation on sensitive actions (payment, login credentials); cannot access profile details if already logged in
- **Source**: [Browser Operator announcement](https://blogs.opera.com/news/2025/03/opera-browser-operator-ai-agentics/)

### Neon "Make" mode (Cloud Agentic)

- Orchestrates AI agents on Opera's **European-hosted cloud computers**
- Can build web apps, games, research reports, interactive content — continues working even when browser is offline
- Installs Python libraries/JS frameworks autonomously; attempts self-correction on errors
- Upload files (data sheets, PDFs) to combine with research and synthesize output
- **Status**: Shipped in Opera Neon (paid tier)
- **Source**: [Opera Neon announcement](https://blogs.opera.com/news/2025/05/opera-neon-first-ai-agentic-browser/)

### Opera Deep Research Agent (ODRA)

- Specialized Neon agent for aggregating information on complex topics into sourced reports
- **Status**: Shipped in Opera Neon
- **Source**: [ZDNET Neon review](https://www.zdnet.com/article/opera-neon-ai-browser-frontier-models-security-risks-cost/)

### Free Tier (Aria)

- No autonomous agentic browsing — chat-only assistant
- Can summarize, translate, answer questions about current page, generate content
- **No form-filling, no multi-step navigation automation** in free tier

---

## Dimension 3: Privacy Model

### Data Retention

| Data Type | Retention | Location |
|-----------|-----------|----------|
| Chat history | 30 days (or until manually deleted) | Opera servers (encrypted) |
| Uploaded files | 30 days auto-delete | Opera servers |
| OpenAI-processed chat portions | 30 days (anonymized) | OpenAI servers |
| Google-processed chat portions | ≤24 hours (anonymized) | Google servers |
| Aria Memory | Until user deletes | Opera servers (Fernet symmetric encryption) |

- **Training use**: Explicitly stated — no user chat data, no page content, no uploaded files are used to train AI models
- **Source**: [Opera AI FAQ](https://help.opera.com/en/browser-ai-faq)

### On-Device Processing

- Local LLMs (Developer/Neon): fully on-device after initial download; no internet required for inference
- Browser Operator: DOM processing runs locally; only page text + user prompt sent to AI
- Sensitive form input during agentic tasks: never transmitted to Opera servers
- **Source**: [Browser Operator blog](https://blogs.opera.com/news/2025/03/opera-browser-operator-ai-agentics/)

### Memory Feature Privacy

- Aria Memory disabled by default; opt-in only
- Memories stored using Fernet symmetric encryption; decryption key stored only in user's browser
- Opera servers cannot read memory in cleartext; only decrypted transiently when user initiates a request
- **Status**: Experimental (Developer + Neon); not in stable Aria as of research date
- **Source**: [Aria Memory blog, Feb 2025](https://blogs.opera.com/news/2025/02/aria-gets-memory-feature-new-ai-feature-drop/)

### Other Privacy Constraints

- **Not available in private/incognito windows** — by design
- Page context access blocked on sensitive sites (banks, payment providers, medical platforms)
- Opera recommends against using AI with banking, payment, or medical sites
- GDPR governed (Opera Norway AS, Oslo HQ)
- Available in most countries; **blocked in**: Afghanistan, Belarus, China, Cuba, Russia, Iran, North Korea, Syria, Venezuela, and ~20 other jurisdictions

---

## Dimension 4: Pricing and Tiers

### Free Tier (Aria — Opera One, GX, Air, Mobile, Mini)

- **Cost**: Free, no login required (as of Sept 2024)
- **Account required for**: Chat history (30-day save), higher image generation limits
- **No hard message limit** officially; "temporarily unavailable until next day" if used excessively
- Image generation: daily limits apply; flexible/unspecified ("generous")
- File uploads: up to 3 files per conversation
- No agentic browsing, no frontier model selection
- **Source**: [Opera AI FAQ](https://help.opera.com/en/browser-ai-faq) | [No-login announcement, Sept 2024](https://press.opera.com/2024/09/26/opera-makes-aria-ai-available-without-log-in/)

### Opera Neon (Premium)

- **Cost**: **$19.90/month** (publicly launched December 11, 2025)
- **Includes**:
  - GPT-5.1, Gemini 3 Pro, Nano Banana Pro frontier model access
  - Browser Operator (Do mode — agentic web tasks)
  - Make mode (cloud AI agents on European servers)
  - ODRA (deep research agent)
  - MCP Connector (connect external AI clients to browser)
  - Unlimited image generation
  - Local LLM access (Llama, Qwen, etc.)
  - Discord community access for roadmap input
- **Waitlist period**: May–December 2025; general availability December 11, 2025
- **No enterprise tier announced** as of research date
- **Positioning**: "AI power users" and early adopters
- **Sources**: [TechCrunch, Dec 2025](https://techcrunch.com/2025/12/11/opera-wants-you-to-pay-20-a-month-to-use-its-ai-powered-browser-neon/) | [ZDNET, Dec 2025](https://www.zdnet.com/article/opera-neon-ai-browser-frontier-models-security-risks-cost/)

### Two-Tier Strategy

- Opera explicitly positions Aria as free AI for "hundreds of millions" and Neon as premium upsell for power users
- Free tier upgrades (faster models, higher limits, open-source local models) announced October 2025
- **Source**: [Opera press release, Oct 2025](https://press.opera.com/2025/10/03/all-operas-flagship-and-gx-browsers-to-receive-upgraded-free-native-browser-ai-tools/)

---

## Dimension 5: Platform Support

### Desktop

| OS | Browser | AI Available |
|----|---------|-------------|
| Windows | Opera One, GX, Air, Neon | ✓ Full |
| macOS | Opera One, GX, Air, Neon | ✓ Full |
| Linux | Opera One | ✓ Full |

- Aria keyboard shortcut: `Ctrl+O` (Win/Linux), `Cmd+O` (Mac); customizable in Settings
- **Source**: [Opera download requirements](https://www.opera.com/download/requirements/)

### Mobile

| Platform | Browser | AI Available |
|----------|---------|-------------|
| Android | Opera for Android, Opera Mini | ✓ (AI button in main menu) |
| iOS | Opera for iPhone | ✓ (AI button in main menu) |

### Sync

- Chat history synced via Opera Account across desktop and mobile
- Tabs, bookmarks, history, passwords sync via Opera Account
- Opera Neon: subscription-linked to account; cross-device Neon access unclear from sources
- iOS sync historically had reported limitations per forum posts
- **Source**: [Opera AI FAQ](https://help.opera.com/en/browser-ai-faq) | [Sync help](https://help.opera.com/en/opera36/sync-your-browser/)

### Caveats

- Opera Neon: currently desktop-only (no mobile version confirmed)
- Local LLMs: desktop-only (Developer/Neon)
- AI not available in private windows on any platform

---

## Dimension 6: User Experience Quality

### Access Points

1. **Sidebar panel**: AI button top-right corner → slides open chat panel (primary entry point)
2. **Full Tab View**: Expand button within panel → opens AI as full browser tab with chat list/history sidebar
3. **Command Line** (`Ctrl+/` or `Cmd+/`): Inline quick-access; supports Page Context mode with `Tab` key toggle; quick prompts without opening full panel
4. **Context menu**: Right-click highlighted text → "Explore More", "Translate" and other quick prompts (available without login)
5. **Multiple independent tabs**: Can have multiple AI tabs open with separate conversations

### Page Context UX

- Auto-enabled when opening AI chat on a webpage (toggle visible at top of chat, off by default requires explicit disable)
- Tab Islands: ask AI about all tabs in a group simultaneously (product comparison use case)
- Blocked silently on sensitive sites (no explanation shown to user per FAQ)

### Discoverability Issues

- Forum users report Aria was removed from the sidebar in some updates (Opera GX), causing UX friction: ["Bring back the Aria on the sidebar" thread](https://forums.opera.com/topic/87378/request-bring-back-the-aria-on-the-sidebar)
- Command Line shortcut varies by keyboard layout (non-US users may use `Ctrl+Shift+7`)

### Text-to-Speech

- Aria responses can be read aloud via speaker icon; powered by Google Cloud text-to-audio
- **Status**: Shipped in stable Opera One (added May 2024)

### Image Generation UX

- Inline in chat — describe image, Aria generates it; download button provided

### File Upload UX

- Paperclip icon in chat input; supports clipboard paste; up to 3 files at once; prompt required after upload

### Overall Assessment

- UX is tightly integrated — not an overlay/extension but native browser chrome
- Low friction for casual use; keyboard power users have Command Line
- Neon UX is separate product with distinct UI (Chat/Do/Make/ODRA mode switching)
- Some UI regression complaints from forum users suggest feature placement has changed across versions

---

## Dimension 7: MCP / Extension Integration

### MCP Connector (Opera Neon — Shipped March 31, 2026)

- Opera Neon acts as an **MCP server** (Model Context Protocol — Anthropic's open standard)
- External AI clients connect to the live browser session via a secure MCP server URL
- **Supported clients out of the box**: Claude (Code), ChatGPT, Lovable, n8n, OpenClaw + any MCP-compatible client
- **Read tools** (default enabled):
  - List open tabs
  - Read page content
  - Screenshot current page
- **Write tools** (disabled by default, user must enable):
  - Switch/close tabs
  - Mouse clicks
  - Keyboard input
  - Navigate to page / go back
  - Search Google
  - Fill forms
- **Read History** tool: disabled by default; can be enabled
- **Authentication**: OAuth2; MCP server URL uniquely identifies user session
- **Reliability infrastructure**: Persistent proxy server maintains connection even when Neon is closed; returns "browser not available" cleanly when offline
- **Scope**: **Opera Neon subscribers only** as of launch date; simplified version planned for Opera One/GX (no timeline given)
- **Sources**: [Opera Neon MCP blog](https://blogs.opera.com/news/2026/03/opera-neon-adds-mcp-connector-to-the-browser/) | [Opera press release](https://press.opera.com/2026/03/31/opera-neon-adds-mcp-connector/) | [gHacks coverage](https://www.ghacks.net/2026/04/02/opera-neon-adds-mcp-connector-to-let-external-ai-tools-safely-control-live-browser-sessions/)

### Extension Ecosystem

- Opera extensions follow **Chrome WebExtensions API** (Chromium-based)
- Extension APIs documented at [dev.opera.com/extensions/apis](https://dev.opera.com/extensions/apis)
- **No dedicated Aria/AI API** exposed to extensions — extensions cannot call Aria programmatically
- Opera Add-ons API provides `opr.addons.installExtension()` and related methods
- Opera add-on store hosts Chromium-compatible extensions

### Critical Gap

- **No public API** for extensions to invoke Aria or any Opera AI capability
- Developers who want AI-in-browser integration must use MCP Connector (Neon only) or build their own extension that calls third-party APIs (OpenAI, Gemini, etc.) directly

---

## Dimension 8: Context Handling

### Current Page Context

- Auto-captured when AI chat opened on any page (can toggle off)
- Blocked on: banks, payment providers, medical platforms, and unspecified sensitive sites
- Works on standard web pages; also extended to:
  - **PDFs open in browser tab** (via Command Line Page Context, April 2025)
  - **Google Docs open in browser tab** (same feature drop)
  - **Tab Islands**: entire group of tabs queryable as single context

### File Upload Context

- Supported types: `.jpg`, `.png`, `.jpeg`, `.svg`, `.xls`, `.xlsx`, `.ods`, `.mp4`, `.mpeg`, `.mp3`, `.pdf`, `.csv`, `.txt`, `.json`, `.odt`, `.doc`, `.docx`
- Up to 3 files simultaneously
- Files sent to AI model alongside prompt; anonymized; not stored beyond 30 days
- Video (`.mp4`, `.mpeg`) and audio (`.mp3`) support is notable — multimodal
- **Status**: Shipped (January 2025 feature drop, stable rollout)
- **Source**: [File understanding blog, Jan 2025](https://blogs.opera.com/news/2025/01/aria-ai-understand-and-generate-files-opera-developer/)

### Conversation Memory (Cross-Session)

- **Aria Memory**: Opt-in; stores facts from conversations as encrypted context injected into future prompts
- User can view, edit, delete individual memories or all memories
- Memory storage: Fernet-encrypted on Opera servers; key in local browser only
- Shows "Aria Memory refreshed" banner when memory is used/updated
- **Status**: Experimental (Developer channel, Feb 2025 feature drop); not in stable Aria confirmed as of April 2026 — verify in Neon

### Chat History (Session/Cross-Session)

- Chat history: 30-day rolling window, requires Opera Account login
- Multiple independent chat threads; can reopen any prior thread
- No cross-session context carryover without Memory feature enabled

### Limitations

- No access to browser history (by default; Neon MCP has opt-in "Read History" tool)
- No access to saved passwords, form autofill data
- No awareness of other browser extensions or installed apps
- Aria has no real-time web search built in — answers from LLM training data (knowledge cutoff applies)

---

## Dimension 9: Reliability and Error Handling

### Rate Limiting

- **Officially stated**: No hard per-chat or per-message limit; "functionality might be impaired if you use the service excessively"; service becomes "temporarily unavailable until the next day" when limits exceeded
- No published specific token/request quotas
- Image generation: "generous and flexible" daily limit; higher with Opera Account; unlimited in Neon
- **Source**: [Opera AI FAQ](https://help.opera.com/en/browser-ai-faq)

### Error Handling in Practice

- Forum reports of: `"An error occurred while processing your request. Please reload or try again later."` — generic error with no root cause exposed
- [Forum thread documenting error](https://forums.opera.com/topic/73769/an-error-occurred-while-processing-your-request-please-reload-or-try-again-later-message-when-asking-aria) — widely reported, workaround is reload/retry
- No published SLA or uptime guarantees for Aria

### Agentic Reliability (Neon)

- Browser Operator / Neon "Do" mode: self-correcting on errors during Make tasks ("will attempt to self-correct")
- Human-in-the-loop checkpoints prevent runaway automation
- Prompt injection analysis: Opera implemented "prompt analysis" function scrutinizing prompts for threats
- **Acknowledged limitation**: "Due to the non-deterministic nature of AI models, the risk of a successful prompt injection attack cannot be entirely reduced to zero"
- **MCP Connector**: Persistent proxy server provides clean "browser not available" signal vs. broken connections
- **Source**: [ZDNET Neon review](https://www.zdnet.com/article/opera-neon-ai-browser-frontier-models-security-risks-cost/) | [Opera Neon security blog, Oct 2025](https://blogs.opera.com/security/2025/10/opera-neon-understanding-agentic-browser-security/)

### Third-Party Warnings

- Gartner (Dec 2025) advised businesses to "block all AI browsers," citing proprietary data leakage risk to cloud servers and prompt injection vulnerability
- Opera addressed publicly but did not fully refute

---

## Dimension 10: Developer API Access

### Public AI API

- **No public REST/SDK API for Aria** — Opera has not published a developer API allowing third parties to call Aria programmatically
- No developer documentation for Aria endpoints
- Opera's Composer AI Engine is internal infrastructure only

### MCP as De Facto Developer Interface (Neon Only)

- MCP Connector (launched March 31, 2026) is the closest to a developer API
- Allows any MCP-compatible AI client (Claude Code, n8n, custom) to control the browser
- Write tools include: clicks, keyboard, form fill, navigation, tab management
- Authentication: OAuth2 + MCP server URL
- **Limitation**: Requires Opera Neon subscription ($19.90/mo); not available in free Opera One/GX
- **Source**: [Opera Neon MCP blog](https://blogs.opera.com/news/2026/03/opera-neon-adds-mcp-connector-to-the-browser/)

### Extension APIs

- Opera follows Chrome WebExtensions standard; documented at [dev.opera.com](https://dev.opera.com/extensions/)
- Extensions can use standard browser APIs (tabs, storage, content scripts, native messaging)
- **No `opr.ai.*` namespace** — AI capabilities not exposed to extensions
- Developers building AI into Opera extensions must use direct third-party AI APIs (OpenAI, Gemini, Anthropic, etc.)

### Developer Community

- Opera Neon subscribers get Discord access with direct engineer communication
- No developer preview program or early API access announced
- Feature Drop program (Opera Developer channel) is the closest to a developer beta path

---

## Sources

### Kept (primary)
- [Opera AI FAQ (help.opera.com)](https://help.opera.com/en/browser-ai-faq) — canonical feature/policy reference
- [Browser Operator blog (Mar 2025)](https://blogs.opera.com/news/2025/03/opera-browser-operator-ai-agentics/) — agentic architecture details
- [Opera Neon MCP blog (Mar 2026)](https://blogs.opera.com/news/2026/03/opera-neon-adds-mcp-connector-to-the-browser/) — MCP implementation specifics
- [Opera Neon announcement (May 2025)](https://blogs.opera.com/news/2025/05/opera-neon-first-ai-agentic-browser/) — product architecture
- [Gemini integration announcement (May 2024)](https://blogs.opera.com/news/2024/05/aria-now-boosted-by-googles-gemini-models) — model stack
- [Aria Memory blog (Feb 2025)](https://blogs.opera.com/news/2025/02/aria-gets-memory-feature-new-ai-feature-drop/) — memory implementation
- [Local LLM — The Register (Apr 2024)](https://www.theregister.com/2024/04/03/opera_local_llm/) — on-device LLM details and limitations
- [ZDNET Neon review (Dec 2025)](https://www.zdnet.com/article/opera-neon-ai-browser-frontier-models-security-risks-cost/) — pricing, security, model list
- [PDF/Docs context blog (Apr 2025)](https://blogs.opera.com/news/2025/04/aria-command-line-page-context-mode-read-pdf-and-docs/) — context handling
- [File upload blog (Jan 2025)](https://blogs.opera.com/news/2025/01/aria-ai-understand-and-generate-files-opera-developer/) — multimodal file support
- [Opera press Oct 2025](https://press.opera.com/2025/10/03/all-operas-flagship-and-gx-browsers-to-receive-upgraded-free-native-browser-ai-tools/) — pricing strategy
- [MCP press release (Mar 2026)](https://press.opera.com/2026/03/31/opera-neon-adds-mcp-connector/) — MCP official announcement
- [Opera error forum thread](https://forums.opera.com/topic/73769/an-error-occurred-while-processing-your-request-please-reload-or-try-again-later-message-when-asking-aria) — real-world reliability signal

### Dropped
- eesel.ai blog (Opera Aria pricing/comparison) — third-party, some data stale
- Voicebot.ai LLM article — summary only, Register is more detailed
- Forums.opera.com sidebar complaint thread — anecdotal UX signal, included summary only
- TechCrunch Neon pricing — redundant with ZDNET which had more feature detail

---

## Gaps

### Unanswered Questions

1. **Exact Aria model routing logic**: Which queries go to GPT vs Gemini? No public documentation.
2. **Stable Opera One local LLM timeline**: Announced in Developer April 2024; unclear if/when promoted to stable.
3. **Opera Neon mobile**: No mention of Android/iOS Neon — appears desktop-only.
4. **Enterprise pricing**: No enterprise tier exists as of April 2026. No group/team pricing documented.
5. **Aria Memory in stable**: Feature Drop announced Feb 2025 but stable release status unclear.
6. **Extension AI API roadmap**: No indication Opera plans to expose Aria via extension API; MCP is current answer but Neon-locked.
7. **Quantitative rate limits**: No published tokens/requests/day numbers for any tier.
8. **Opera One/GX MCP timeline**: Press release mentions "simplified browser connector" coming to Opera One/GX — no date given.
9. **Neon data jurisdiction**: "Make" mode uses "European-hosted servers" — specific cloud provider and data residency guarantees not published.
10. **Aria vs. Neon Chat model parity**: Whether free Aria in 2025/2026 still uses older GPT-4-class or has been upgraded to match Neon is not confirmed.

### Suggested Next Steps

- Check [operaneon.com/faq](https://www.operaneon.com/faq) for Neon-specific FAQ (separate from main Opera AI FAQ)
- Monitor Opera Developer blog for local LLM stable release announcement
- Test MCP Connector directly to assess write tool reliability and security boundary behavior
- Review [Opera security blog](https://blogs.opera.com/security/2025/10/opera-neon-understanding-agentic-browser-security/) for full prompt injection mitigation documentation
