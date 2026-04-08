# Brave Leo AI — Comprehensive Feature Research

**Research date:** 2026-04-08  
**Primary sources:** Brave official docs, Help Center, GitHub wiki/issues, The Register, roadmap blog

---

## 1. AI Model Access and Selection

### Shipped

**Free tier models:**
- Qwen 3 VL 30B
- Claude 4.5 Haiku
- Llama 3.1 8B
- Llama 4 Scout
- Llama 4 Maverick
- GPT-OSS 20B

**Premium-only additional models:**
- Qwen 3 VL 235B
- Qwen 3 Coder 480B
- DeepSeek v3.1
- Claude 4.6 Sonnet
- Claude 4.6 Opus
- Mistral Large 2407
- Pixtral Large 2502
- GPT OSS 120B
- Gemma 3 12B

Source: [Brave Help Center — Model Differences](https://support.brave.com/hc/en-us/articles/26727364100493-What-are-the-differences-between-Leo-s-AI-Models)

**All models hosted by Brave.** As of June 30, 2025, Brave hosts every model (including Anthropic Claude) on its own secure infrastructure. No traffic goes to Anthropic, Meta, or any third-party model provider.  
Source: [Leo Android launch post](https://brave.com/blog/leo-android) and model help article (updated note June 30, 2025)

**Automatic mode:** Leo can auto-select the best model for each prompt/context via prompt classification (in development per roadmap).  
Source: [Leo roadmap 2025](https://brave.com/blog/leo-roadmap-2025-update/)

**Model switching:** Users select model via 3-dot menu in Leo panel or `brave://settings/leo-ai`. Skills can be pinned to specific models.  
Source: [Help Center — Model Differences](https://support.brave.com/hc/en-us/articles/26727364100493-What-are-the-differences-between-Leo-s-AI-Models)

**Bring Your Own Model (BYOM):** Connect local models (via Ollama) or remote APIs (OpenAI GPT-4, Grok, etc.). Requires desktop, Brave ≥1.69, 8GB RAM minimum for local.  
Source: [BYOM Help Center](https://support.brave.com/hc/en-us/articles/34070140231821-How-do-I-use-the-Bring-Your-Own-Model-BYOM-with-Brave-Leo)

**ChatGPT account integration:** Separate feature allowing users to connect their OpenAI account directly.  
Source: [Help Center article](https://support.brave.app/hc/en-us/articles/39622541285645-How-do-I-add-my-ChatGPT-account-to-Brave-Leo)

### On-device / cloud split

All Brave-native models run in the **cloud** on Brave's servers (not on-device). Brave uses a reverse proxy to strip IP addresses.  
**On-device AI: not yet shipped.** Listed as a roadmap item: "Integrated, pre-configured client-side models" and "WebLLM exploration (in development)".  
Source: [Roadmap table](https://brave.com/blog/leo-roadmap-2025-update/)

**TEE (Trusted Execution Environment):** Currently only in **Brave Nightly** for DeepSeek V3.1, using Near AI with Intel TDX + Nvidia TEE. Described as moving from "trust me bro" to "trust but verify." Not yet in stable release.  
Source: [The Register, Nov 2025](https://www.theregister.com/2025/11/22/brave_leo_trusted_execution_environment/)

---

## 2. Agent Automation Capabilities

### Status: Experimental / Nightly only — NOT in stable release

**"AI Browsing"** is Leo's agentic mode. Currently requires:
- Brave **Nightly** v1.87+
- Manual flag enable: `brave://flags` → `#brave-ai-chat-agent-profile` → Enabled
- Desktop only (Android/iOS planned but not shipped)
- No Leo Premium required for testing  
Source: [AI Browsing Help Center](https://support.brave.com/hc/en-us/articles/41240379376909-How-do-I-use-AI-Browsing-in-Brave)

**Capabilities when enabled:**
- Navigate to websites autonomously
- Research topics across multiple sources
- Compare products across shopping sites
- Add items to shopping carts
- Check promo codes before purchase
- Fact-check by visiting multiple sources
- Complete multi-step workflows
- Works with Skills for reusable automations (e.g., `/fact-check`, `/competitive`)

**Security architecture:**
- **Isolated profile:** AI Browsing runs in a completely separate browser profile — own cookies, caches, logged-in state. Main profile is NOT accessible.
- **Alignment checker:** A second AI model reviews planned actions before execution to catch prompt injections and model confusion.
- **User consent gates:** Sensitive/flagged actions require explicit user permission before proceeding.
- **Access restrictions:** Cannot access `brave://` internal pages, non-HTTPS sites, Safe Browsing–flagged sites.
- **No logs:** Conversations not logged; IP anonymized via reverse proxy.

**Known limitations:**
- Rate limits can interrupt complex tasks (workaround: instruct agent to "continue")
- Cannot access user's main browsing profile or logged-in sessions
- Prompt injection attacks on malicious websites are an acknowledged risk
- No BYOM support for AI Browsing yet (planned)

**Roadmap items (not yet shipped):**
- Filling editable form fields (listed as "Incomplete")
- Task scheduling and recurring tasks
- Background tasks with notifications
- Multi-site workflows
- Auth for 3rd-party APIs  
Source: [Roadmap table](https://brave.com/blog/leo-roadmap-2025-update/)

---

## 3. Privacy Model

### Zero Data Retention (shipped)

- Conversations **not stored** on Brave servers after response is generated
- No IP address logging (reverse proxy strips IPs before request hits model servers)
- No conversation transcripts retained
- No model training on user conversations
- Data discarded immediately after chat session ends
- Chat history exists **only in local device storage**; user can clear via Settings  
Source: [Brave Privacy Policy — Leo section](https://brave.com/privacy/browser/)

### No account required for free tier (shipped)

Free Leo requires no Brave account creation.

### Unlinkable subscription tokens (shipped)

Premium subscribers receive cryptographic unlinkable tokens to validate subscription. The email used to create the account **cannot be linked** to actual Leo usage.  
Source: [Model differences help article](https://support.brave.com/hc/en-us/articles/26727364100493-What-are-the-differences-between-Leo-s-AI-Models)

### Temporary chats (shipped)

Chats can be marked temporary, not written to local history. Chat history can also be disabled entirely.

### Third-party data sharing

**None for Brave-native models.** As of June 30, 2025, Brave hosts all models. No data reaches Anthropic, Meta, DeepSeek, Mistral, or any other party.

**BYOM exception:** If user connects a third-party API (OpenAI, etc.) via BYOM, Brave's privacy protections do NOT apply. Data goes directly to the third-party per their own policies. Help article explicitly warns users.  
Source: [BYOM Help Center](https://support.brave.com/hc/en-us/articles/34070140231821-How-do-I-use-the-Bring-Your-Own-Model-BYOM-with-Brave-Leo)

### TEE — verifiable privacy (partial, Nightly only)

Intel TDX + Nvidia TEE via Near AI. Currently DeepSeek V3.1 only in Nightly. Full rollout timeline not specified.  
Source: [The Register](https://www.theregister.com/2025/11/22/brave_leo_trusted_execution_environment/)

### Customization and memory data

All stored locally in user preferences. Not synced to Brave servers. User-managed (add/edit/delete individual memories or clear all).  
Source: [Customization & Memory Help Center](https://support.brave.com/hc/en-us/articles/38441287509261-How-do-I-use-Leo-customization-and-memory-features)

---

## 4. Pricing and Tiers

### Free Tier — $0, no account required (shipped)

- 6 models available (see Section 1)
- "Reasonable" rate limits (exact quota not published)
- All core privacy protections
- No early feature access
- Chat history (local)
- Skills, Multi Tab Context

### Leo Premium — $14.99/month or $149.99/year (shipped)

- 14 models (adds Claude 4.6 Sonnet, Claude 4.6 Opus, DeepSeek v3.1, Qwen 3 VL 235B, Qwen 3 Coder 480B, Mistral Large, Pixtral, GPT OSS 120B, Gemma 3 12B)
- Higher rate limits + priority access
- Early access to new features
- Covers **up to 10 devices** across Android, Linux, macOS, Windows
- Unlinkable subscription privacy  
Source: [Multi Tab Context Help Center](https://support.brave.com/hc/en-us/articles/38614934646029-How-to-Use-Multi-Tab-Context-with-Brave-Leo) and [Leo pricing blog](https://www.eesel.ai/blog/brave-leo-pricing)

### Enterprise Tier — Not available

No enterprise offering, group policy, SSO, or team management is currently available. Enterprise group policy is listed as roadmap item.  
Source: [Roadmap table](https://brave.com/blog/leo-roadmap-2025-update/)

### Other monetization in development

- Crypto payments for subscriptions (in development)
- Ad-supported option (roadmap)
- Brave Rewards integration (roadmap)  
Source: [Roadmap table](https://brave.com/blog/leo-roadmap-2025-update/)

### Rate limit known issues

- Free tier's "Organize Tabs" feature was reported to immediately exhaust free quotas (GitHub issue #51139, marked `priority/P2`, since resolved)
- Premium has higher but still unspecified quotas  
Source: [GitHub issue #51139](https://github.com/brave/brave-browser/issues/51139)

---

## 5. Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Windows | ✅ Shipped | Full feature parity |
| macOS | ✅ Shipped | Full feature parity |
| Linux | ✅ Shipped | Full feature parity |
| Android | ✅ Shipped | + voice input; BYOM not available |
| iOS | ✅ Shipped | + voice input; BYOM not available |
| Web (standalone) | ❌ No | Requires Brave browser |
| BYOM | Desktop only | Windows/macOS/Linux ≥1.69 |
| AI Browsing (agentic) | Desktop Nightly only | Android/iOS planned |
| Multi Tab Context | Desktop + Android | ≥1.81 |
| Skills | Desktop + Android | ≥1.85 |

Source: [Leo landing page](https://brave.com/leo/) and platform-specific help articles

### Cross-device sync — NOT available

Chat history is local only. Leo memories and customization are local only.  
GitHub issue [#47308](https://github.com/brave/brave-browser/issues/47308) ("Leo - Add memories and customizations as part of Brave sync") is **open** with label `feature/sync` — not yet implemented.  
Cross-device sync is listed as a roadmap item under User Experience.  
Source: [GitHub issue #47308](https://github.com/brave/brave-browser/issues/47308), [Brave Community thread](https://community.brave.app/t/someday-brave-sync-leo-ai-everywhere/627032)

---

## 6. User Experience Quality

### Access points (shipped)

- **Sidebar:** Leo icon in browser toolbar opens persistent sidebar companion
- **Full-page:** `brave://leo-ai` for dedicated conversation view with history in left column
- **Address bar:** Type a prompt → select "Ask Leo"
- **Right-click context menu:** Quick access for selected text (summarize, explain, etc.)
- **Tab Organization:** Ask Leo to group/filter open tabs by topic, create new windows for filtered sets  
Source: [Leo landing page](https://brave.com/leo/), [Roadmap blog](https://brave.com/blog/leo-roadmap-2025-update/)

### Skills (shipped — desktop + Android, ≥1.85)

- `/slash` command shortcuts for reusable prompts
- Built-in skills: `/explain`, `/improve`, `/change-tone-persuasive`, `/social-media-post`
- User-created skills with model pinning; stored locally; max 5000 char prompt
- Skills persist across sessions; editable/deletable  
Source: [Skills Help Center](https://support.brave.com/hc/en-us/articles/41599880226317-How-do-I-use-Skills-in-Brave-Leo)

### Conversation UX

- Editable prompts, response regeneration
- Like/dislike feedback buttons + feedback forms
- Chat history (local) with continuation across sessions
- Temporary chat mode
- Conversation starters (contextual suggestions)
- Language auto-detection; responds in user's language
- Supports markdown output, code blocks with copy

### Context input methods

- Paperclip icon → select tabs + upload files
- "@" symbol for tab/bookmark/history context (in development)
- Drag and drop (listed as roadmap)

### Mobile UX

- Voice input on iOS and Android (voice-to-text)
- Tab-based enhanced mobile UI
- Leo accessible via browser menu → Leo AI icon

### Friction assessment

- Free tier is frictionless (no account, immediate access)
- Rate limits on free tier can be hit quickly for feature-heavy tasks (known issue)
- BYOM setup requires manual configuration (Ollama install, endpoint URLs, API keys)
- AI Browsing requires Nightly download + flag enable — high friction for most users

### Discoverability

- Leo icon is a first-class browser toolbar item
- Address bar integration lowers discovery friction significantly
- Right-click menu integration for casual users

---

## 7. MCP/Extension Integration

### What exists

**Brave Search MCP Server (shipped, separate product):**  
Open-source TypeScript server at [github.com/brave/brave-search-mcp-server](https://github.com/brave/brave-search-mcp-server) (872 stars). Allows *other* AI tools (e.g., Claude Desktop) to use Brave Search as a tool. Created June 2025.  
**This is not Leo having MCP support — it is Brave Search being usable FROM other MCP-compatible clients.**  
Source: [Brave Search MCP repo](https://github.com/brave/brave-search-mcp-server), [Brave guide](https://brave.com/search/api/guides/use-with-claude-desktop-with-mcp/)

**Brave Search API Skills (separate product):**  
The Brave Search API dashboard has a "Skills" concept for API workflows — unrelated to Leo Skills.  
Source: [Brave Search API dashboard](https://api-dashboard.search.brave.com/documentation/resources/skills)

### What does NOT exist (yet)

- Leo does **not** support MCP tools natively (cannot consume MCP servers)
- No WebExtension API for Leo (extensions cannot call Leo programmatically)
- No plugin/extension framework for Leo

### Roadmap

MCP interfaces for Leo are listed explicitly in the **Future** column of the roadmap table under both "AI Model Infrastructure" and "Productivity and utility":
> "MCP interfaces" — Future  
> "Plugin/extension framework (incl MCP tools)" — Future  
Source: [Roadmap blog](https://brave.com/blog/leo-roadmap-2025-update/)

### Conversation API tools (internal, shipped in v1.82)

GitHub issue #44358 ("AI Chat Conversation API tools client support") was shipped in v1.82 release as an internal infrastructure improvement — adds `tools` field support to the Conversation API. This is the foundation for future MCP/tool use but is not a public developer API.  
Source: [GitHub issue #44358](https://github.com/brave/brave-browser/issues/44358)

---

## 8. Context Handling

### Current page context (shipped)

Leo automatically accesses the page the user is viewing when opened in sidebar mode. DOM tree parsing and accessibility tree used for content extraction.

### Multi Tab Context (shipped — desktop + Android, ≥1.81)

- Select/deselect specific tabs via paperclip icon in message input
- Upload files directly through the same interface
- Free for all users
- Context window size varies by model  
Source: [Multi Tab Context Help Center](https://support.brave.com/hc/en-us/articles/38614934646029-How-to-Use-Multi-Tab-Context-with-Brave-Leo)

### Supported content types (shipped)

| Content Type | Support |
|-------------|---------|
| Web pages | ✅ |
| PDFs | ✅ |
| YouTube videos (transcripts) | ✅ |
| Google Docs | ✅ |
| Google Sheets | ✅ |
| Images (on-page + uploaded) | ✅ (multimodal) |
| Brave Talk video call transcripts | ✅ |
| Screenshots | ✅ (multiple) |

Source: [Roadmap blog context section](https://brave.com/blog/leo-roadmap-2025-update/), [Leo docs/PDF integration blog](https://brave.com/leo-docsupport/)

### Memory and personalization (shipped — desktop + Android, ≥1.82)

- User sets: preferred name, job/role, tone, personal info
- Manual memory items: specific facts Leo should remember
- Stored in local preferences only; not synced; persists across sessions
- Memory can be disabled entirely; individual items deletable  
Source: [Customization & Memory Help Center](https://support.brave.com/hc/en-us/articles/38441287509261-How-do-I-use-Leo-customization-and-memory-features)

### Conversation history (shipped)

- Stored locally only
- Accessible via sidebar ("…" → Conversation history) or `brave://leo-ai` left column
- Can be disabled so no history stored at all

### Real-time search augmentation (shipped)

Leo uses Brave Search API to inject real-time results into answers, with citations/links.  
Source: [Roadmap blog](https://brave.com/blog/leo-roadmap-2025-update/)

### In development / roadmap

- Browser history as context: **in development**
- Bookmarks as context: **in development**
- "@" symbol to mention tabs/bookmarks/history: **in development**
- Adaptive/personalized memories (auto-learned, not just manual): **Future**
- 3rd-party API context (Google, Notion, GitHub): **Future**
- Agent-to-agent context pipelines: **Future**  
Source: [Roadmap table](https://brave.com/blog/leo-roadmap-2025-update/)

---

## 9. Reliability and Error Handling

### Rate Limits

- **Free tier:** "Reasonable rate limits" — exact numbers not published
- **Premium tier:** "Higher rate limits" — exact numbers not published
- Rate limits are dynamic (Brave says availability "may vary depending on traffic levels")
- Known issue: Free tier hits rate limits quickly on feature-heavy tasks. GitHub issue #51139 reported "Organize Tabs" immediately exhausted free quota (marked `priority/P2`, resolved)
- AI Browsing known limitation: complex multi-step tasks may be interrupted by rate limits; user must instruct "continue" to resume

Source: [GitHub #51139](https://github.com/brave/brave-browser/issues/51139), [AI Browsing Help](https://support.brave.com/hc/en-us/articles/41240379376909-How-do-I-use-AI-Browsing-in-Brave)

### Uptime / SLA

No published SLA. No public status page found. Community reports occasional "technical limitation" errors.  
Source: [Brave Community thread](https://community.brave.app/t/brave-response-blames-technical-limitation/646020)

### Hallucination / accuracy

Brave explicitly warns: responses may contain misleading or false information. Bias from training data may appear. Recommendation to double-check responses. Like/dislike feedback mechanism provided.  
Source: [GitHub Wiki](https://github.com/brave/brave-browser/wiki/Brave-Leo), [Leo FAQ](https://brave.com/leo/)

### Error handling behavior

- No documented fallback chain (e.g., if Claude 4.6 unavailable, fall back to Haiku)
- "Automatic mode" likely does model routing but behavior on failure not documented
- Rate limit errors prompt users to wait or upgrade

### Model freshness

Models updated without version pinning — users cannot lock to a specific model version. Brave notes "Models will change from time-to-time."  
Source: [Model differences help article](https://support.brave.com/hc/en-us/articles/26727364100493-What-are-the-differences-between-Leo-s-AI-Models)

---

## 10. Developer API Access

### No public Leo API

There is no documented public API for Leo. No endpoint is provided for external systems to programmatically interact with Leo.

### Brave Search API (separate, public)

- REST API for web search results
- Pricing: $5/1,000 requests; $5 free credits/month
- Endpoints: web, news, images, videos, summaries
- Used internally by Leo to augment answers
- Publicly available for developers  
Source: [Brave Search API](https://brave.com/search/api/)

### Brave Search MCP Server (open source)

- TypeScript MCP server: [github.com/brave/brave-search-mcp-server](https://github.com/brave/brave-search-mcp-server) (MIT license)
- Allows MCP-compatible clients (Claude Desktop, etc.) to call Brave Search as a tool
- Created June 2025; 872 stars  
Source: [GitHub repo](https://github.com/brave/brave-search-mcp-server)

### Internal Conversation API (not public)

GitHub issue #44358 (shipped v1.82, milestone 1.82.x) added `tools` support to Leo's internal Conversation API. This is an internal brave-core API used by browser components. No public documentation or external access.  
Source: [GitHub issue #44358](https://github.com/brave/brave-browser/issues/44358)

### WebExtension API for Leo — Does not exist

No `browser.leo.*` WebExtension API. Extensions cannot call Leo programmatically. This is listed in the roadmap as **Future**: "Plugin/extension framework."

### MCP consumption by Leo — Does not exist yet

Leo cannot act as an MCP client to consume external MCP servers. Listed as **Future** in roadmap.

### Developer roadmap

From the roadmap Future column:
- "MCP interfaces" (both infrastructure and tools for productivity)
- "Plugin/extension framework (incl MCP tools)"
- "3rd party APIs (Google, Notion, GitHub, etc.)" — contextual data, not an outbound API
- "Agent marketplaces"  
Source: [Roadmap blog](https://brave.com/blog/leo-roadmap-2025-update/)

---

## Sources

### Kept

| Source | URL | Relevance |
|--------|-----|-----------|
| Brave Leo landing page | https://brave.com/leo/ | Primary product page, pricing, FAQ |
| Leo Model Differences — Help Center | https://support.brave.com/hc/en-us/articles/26727364100493 | Authoritative model list, free vs premium |
| Leo Roadmap 2025 Update — Brave Blog | https://brave.com/blog/leo-roadmap-2025-update/ | Most comprehensive feature status and future plans |
| AI Browsing Help Center | https://support.brave.com/hc/en-us/articles/41240379376909 | Agentic capabilities, security, limitations |
| Skills Help Center | https://support.brave.com/hc/en-us/articles/41599880226317 | Skills/automation feature detail |
| BYOM Help Center | https://support.brave.com/hc/en-us/articles/34070140231821 | Model selection, on-device, privacy nuances |
| Multi Tab Context Help Center | https://support.brave.com/hc/en-us/articles/38614934646029 | Context handling, pricing detail |
| Customization & Memory Help Center | https://support.brave.com/hc/en-us/articles/38441287509261 | Memory architecture |
| Brave Browser Privacy Policy | https://brave.com/privacy/browser/ | Authoritative privacy commitments |
| The Register — TEE article | https://www.theregister.com/2025/11/22/brave_leo_trusted_execution_environment/ | TEE details, Nightly status |
| Leo Android launch post | https://brave.com/blog/leo-android | Anthropic hosting change (June 2025) |
| GitHub Wiki — Brave Leo | https://github.com/brave/brave-browser/wiki/Brave-Leo | Dev-facing summary, memory internals |
| GitHub issue #44358 | https://github.com/brave/brave-browser/issues/44358 | Conversation API tools (internal) |
| GitHub issue #47308 | https://github.com/brave/brave-browser/issues/47308 | Sync feature not yet implemented |
| GitHub issue #51139 | https://github.com/brave/brave-browser/issues/51139 | Rate limit bug on free tier |
| Brave Search MCP Server | https://github.com/brave/brave-search-mcp-server | MCP for search (not Leo) |
| Brave Search API | https://brave.com/search/api/ | Public developer API (search, not Leo) |

### Dropped

| Source | Reason |
|--------|--------|
| eesel.ai blog posts | Third-party SaaS competitor; some pricing data stale (still listed old Llama 2/Mixtral models); kept only for $14.99 pricing corroboration |
| medium.com/flow-specialty | Generic AI agent article, not Leo-specific |
| fillapp.ai blog | Generic browser AI roundup, no primary Leo data |
| hostpapa.com agentic browsers | No Leo-specific information |

---

## Gaps

### Unanswered / needs follow-up

1. **Exact rate limits** — Brave does not publish token/request quotas for free or premium tiers. Only "reasonable" and "higher."
2. **Uptime/SLA** — No public status page or SLA found. Single community thread suggests occasional errors.
3. **TEE rollout timeline** — When will TEE expand beyond DeepSeek V3.1 in Nightly to other models and stable release?
4. **AI Browsing stable release date** — No announced timeline for moving out of Nightly.
5. **On-device model timeline** — "WebLLM exploration in development" with no concrete date.
6. **MCP integration timeline** — Listed as "Future" with no milestone attached.
7. **Enterprise offering** — No enterprise tier exists; enterprise group policy is listed as roadmap item but no timeline.
8. **Sync implementation timeline** — GitHub issue #47308 is open; no milestone set.
9. **Context window sizes per model** — Not published; "may be limited depending on selected model."

### Suggested next steps

- Monitor `brave://flags` in Nightly builds for `#brave-ai-chat-agent-profile` stable promotion
- Track [github.com/brave/brave-browser/milestone](https://github.com/brave/brave-browser/milestones) for MCP and sync milestone assignments
- Check [brave.com/series/security-privacy-in-agentic-browsing/](https://brave.com/series/security-privacy-in-agentic-browsing/) for agentic security model details
- Review brave-core source for `ai_chat` component to understand Conversation API structure
