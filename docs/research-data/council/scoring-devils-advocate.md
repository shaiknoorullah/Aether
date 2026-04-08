# Devil's Advocate — RICE Scoring

> **Role**: Argue AGAINST popular features. Find blind spots, risks, assumptions, and biases.
> **Core question**: Are we building what's fashionable, or what's needed? The graveyard of failed browsers is large.

## Top 50 Features Scored

| Rank | Feature | Category | Reach | Impact | Confidence | Effort | RICE | MoSCoW | Kano |
|------|---------|----------|-------|--------|------------|--------|------|--------|------|
| 1 | Native Ad/Tracker Blocking | Core Browsing | 9 | 3 | 0.9 | 4 | 6.08 | Must | Must-be |
| 2 | WebExtension API Support | Extensibility | 9 | 4 | 0.8 | 7 | 4.11 | Must | Must-be |
| 3 | Vertical Tab Sidebar | Workspace & Organization | 7 | 2 | 0.8 | 3 | 3.73 | Must | Must-be |
| 4 | Tab Unloading/Hibernation | Performance | 6 | 2 | 0.7 | 3 | 2.80 | Should | Must-be |
| 5 | Notification Spam Blocking | Core Browsing | 7 | 1 | 0.8 | 2 | 2.80 | Should | Must-be |
| 6 | Memory-Efficient Tab Management | Performance | 8 | 2 | 0.7 | 5 | 2.24 | Should | Must-be |
| 7 | Zero Telemetry Architecture | Privacy & Security | 4 | 2 | 0.8 | 3 | 2.13 | Should | Must-be |
| 8 | Full Keyboard Shortcut Customization | Keyboard & Input | 3 | 3 | 0.7 | 3 | 2.10 | Should | Performance |
| 9 | Native Command Palette / Ex-Mode | Keyboard & Input | 3 | 3 | 0.7 | 3 | 2.10 | Should | Delighter |
| 10 | Cross-Device Sync | Sync & Portability | 8 | 3 | 0.7 | 8 | 2.10 | Should | Must-be |
| 11 | LLM Sidebar Chat | AI & Agents | 7 | 2 | 0.7 | 5 | 1.96 | Should | Must-be |
| 12 | Cross-Platform with Full Parity | Core Browsing | 8 | 3 | 0.6 | 8 | 1.80 | Should | Must-be |
| 13 | Per-Workspace Session Persistence | Workspace & Organization | 4 | 3 | 0.6 | 4 | 1.80 | Should | Performance |
| 14 | AI Page Summarization | AI & Agents | 6 | 2 | 0.6 | 4 | 1.80 | Could | Performance |
| 15 | Sandboxed Identity Profiles | Privacy & Security | 5 | 3 | 0.7 | 6 | 1.75 | Could | Performance |
| 16 | Tab Graveyard / Recovery | Workspace & Organization | 6 | 1 | 0.8 | 3 | 1.60 | Should | Must-be |
| 17 | Keyboard-Only Full Navigation | Accessibility | 3 | 3 | 0.7 | 4 | 1.58 | Should | Must-be |
| 18 | Project-First Workspaces | Workspace & Organization | 5 | 4 | 0.6 | 8 | 1.50 | Should | Performance |
| 19 | Intelligent Tab Lifecycle Management | Workspace & Organization | 6 | 3 | 0.5 | 6 | 1.50 | Should | Performance |
| 20 | Keyboard Control Over Browser Chrome | Keyboard & Input | 2 | 4 | 0.7 | 4 | 1.40 | Should | Performance |
| 21 | Native Vim/Modal Keybindings | Keyboard & Input | 2 | 5 | 0.7 | 5 | 1.40 | Should | Performance |
| 22 | AI Writing Assistance (Inline) | AI & Agents | 5 | 2 | 0.6 | 5 | 1.20 | Won't | Performance |
| 23 | Real-Time Privacy Dashboard | Privacy & Security | 4 | 2 | 0.6 | 4 | 1.20 | Could | Performance |
| 24 | Prompt Injection Defense | AI & Agents | 5 | 4 | 0.5 | 9 | 1.11 | Should | Must-be |
| 25 | Tree-Structured Tabs | Workspace & Organization | 3 | 3 | 0.6 | 5 | 1.08 | Could | Performance |
| 26 | Per-Site Privacy Controls | Privacy & Security | 3 | 2 | 0.7 | 4 | 1.05 | Could | Performance |
| 27 | Intelligent Password Manager | Productivity | 6 | 2 | 0.6 | 7 | 1.03 | Could | Must-be |
| 28 | Per-Context Fingerprint Isolation | Privacy & Security | 3 | 3 | 0.7 | 7 | 0.90 | Could | Performance |
| 29 | BYOM (Bring Your Own Model) | AI & Agents | 2 | 3 | 0.6 | 4 | 0.90 | Could | Delighter |
| 30 | Semantic Browsing History | Core Browsing | 4 | 3 | 0.5 | 7 | 0.86 | Could | Delighter |
| 31 | Config-as-Code (Real Language) | Extensibility | 2 | 3 | 0.7 | 5 | 0.84 | Could | Delighter |
| 32 | Website Key Stealing Prevention | Keyboard & Input | 1 | 3 | 0.8 | 3 | 0.80 | Could | Performance |
| 33 | Native PKM Integration Layer | Productivity | 3 | 2 | 0.6 | 5 | 0.72 | Won't | Delighter |
| 34 | Split View / Multi-Pane | Workspace & Organization | 3 | 2 | 0.6 | 5 | 0.72 | Could | Delighter |
| 35 | Full-Text Tab Search | Workspace & Organization | 3 | 2 | 0.6 | 5 | 0.72 | Could | Delighter |
| 36 | AI-Powered Web Search | AI & Agents | 5 | 2 | 0.5 | 7 | 0.71 | Won't | Delighter |
| 37 | Local/On-Device AI Inference | AI & Agents | 4 | 3 | 0.5 | 9 | 0.67 | Could | Delighter |
| 38 | Persistent AI Memory / Context | AI & Agents | 3 | 3 | 0.5 | 7 | 0.64 | Won't | Delighter |
| 39 | MCP Server (Browser as MCP Server) | Extensibility | 2 | 3 | 0.5 | 5 | 0.60 | Could | Delighter |
| 40 | Multi-Model Selection | AI & Agents | 2 | 2 | 0.6 | 4 | 0.60 | Could | Performance |
| 41 | Context-Aware Tab Surfacing | Workspace & Organization | 4 | 2 | 0.5 | 7 | 0.57 | Won't | Delighter |
| 42 | Research-Aware AI Assistant | AI & Agents | 3 | 3 | 0.5 | 8 | 0.56 | Could | Delighter |
| 43 | Agent-Content Security Isolation | Privacy & Security | 2 | 3 | 0.5 | 7 | 0.43 | Won't | Must-be |
| 44 | Cross-Tab AI Reasoning | AI & Agents | 2 | 3 | 0.5 | 7 | 0.43 | Won't | Delighter |
| 45 | Adaptive Fingerprint Defense | Privacy & Security | 3 | 2 | 0.5 | 7 | 0.43 | Could | Performance |
| 46 | Agent Debugging / Session Replay | AI & Agents | 1 | 4 | 0.6 | 6 | 0.40 | Won't | Delighter |
| 47 | Token-Efficient Page Representation | AI & Agents | 1 | 3 | 0.6 | 5 | 0.36 | Won't | Delighter |
| 48 | Agent Automation (Multi-Step Workflows) | AI & Agents | 2 | 3 | 0.5 | 9 | 0.33 | Won't | Delighter |
| 49 | Native Agent API Surface | AI & Agents | 1 | 3 | 0.5 | 7 | 0.21 | Won't | Delighter |
| 50 | Hybrid Perception Engine (A11y + Vision) | AI & Agents | 1 | 3 | 0.5 | 8 | 0.19 | Won't | Delighter |

## Rationale for Top 10

**1. Native Ad/Tracker Blocking (RICE 6.08)** — Even the devil's advocate can't argue against table stakes. 900M+ users install ad blockers. Brave proved native blocking drives adoption. Without it, we don't deserve to exist. That said, I scored Impact at 3 not 5 because uBlock Origin via WebExtensions covers this — native blocking is incremental, not transformational.

**2. WebExtension API Support (RICE 4.11)** — The single highest-leverage feature. Without extension compatibility, there is no migration path from Firefox or Chrome. Users will not abandon their password managers, ad blockers, and workflow tools. This is the lesson every failed browser teaches: you must bring the ecosystem with you. High effort is honest — full MV3 compatibility is years of work.

**3. Vertical Tab Sidebar (RICE 3.73)** — Chrome shipped it in 2025. Edge had it for years. Firefox has it. This is now table stakes, not differentiation. We get no credit for having it, but we die without it. Classic Must-be: presence = neutral, absence = uninstall.

**4. Tab Unloading/Hibernation (RICE 2.80)** — Firefox Gecko already does this reasonably well. If we're a Firefox fork, much of this is inherited. Low effort for inherited benefit. Scored conservatively because the incremental improvement over what Gecko gives us free is small.

**5. Notification Spam Blocking (RICE 2.80)** — Firefox already blocks notification prompts by default. This is practically free to inherit and universally appreciated. Impact is only 1 because the baseline already handles most of the problem.

**6. Memory-Efficient Tab Management (RICE 2.24)** — Wide reach but limited marginal improvement over modern browser baselines. Every browser has gotten better at this. The "100 tabs = 8GB RAM" problem is largely solved.

**7. Zero Telemetry Architecture (RICE 2.13)** — More marketing positioning than engineering. Any Firefox fork can claim this by stripping telemetry. Low effort, moderate reach among privacy-conscious users. But it costs us: no crash reports, no usage analytics to guide product decisions. We're flying blind.

**8. Full Keyboard Shortcut Customization (RICE 2.10)** — Reasonable scope, reasonable audience. Firefox took 25 years to ship this, which tells you something about both demand and difficulty. Still, it's the kind of polish that earns loyalty from power users who actually retain.

**9. Native Command Palette (RICE 2.10)** — VS Code trained a generation to expect Ctrl+Shift+P. Arc had this. Low effort, delights power users. Not transformative but a good signal of taste.

**10. Cross-Device Sync (RICE 2.10)** — Essential for real-world adoption but I refuse to pretend this is easy. Building privacy-preserving sync that actually works is a multi-year effort. Firefox Sync exists and we might inherit pieces, but "should" not "must" because you can launch without it if your desktop experience is compelling enough.

## Rationale for "Must Have" Picks

Only **three** features earned Must from me. Every other "Must" I've seen proposed is either achievable via extensions, inherited from our engine, or aspiration masquerading as necessity.

**Native Ad/Tracker Blocking** — The privacy browser value proposition collapses without this. It's the single feature most correlated with browser switching intent. Brave's entire growth story is built on native ad blocking. Not having it at launch is not viable.

**WebExtension API Support** — The graveyard of browsers that launched without extension support is the entire graveyard. Users have 3-10 extensions they consider essential. You cannot ask them to abandon those AND learn a new browser simultaneously. The switching cost is already high enough.

**Vertical Tab Sidebar** — In 2026, launching a browser aimed at knowledge workers without vertical tabs is like launching a text editor without syntax highlighting. It's no longer a feature; it's an expectation. Chrome, Edge, Firefox, Arc, Zen, Vivaldi — everyone has it.

## Controversial Picks

### Project-First Workspaces: Should, not Must (RICE 1.50)

This will be my most contested score. The research says evidence count 10. The council will want this as the #1 feature. Here's why I disagree:

**Arc tried this and died.** The Browser Company built the most ambitious workspace-based browser ever, raised massive funding, attracted passionate users, and then pivoted away entirely before being acquired. The lesson isn't "workspaces are bad" — it's that the market for project-organized browsing is narrower than vocal online users suggest. Arc's active user count never justified its valuation.

**"Knowledge workers" is not "all users."** The evidence comes disproportionately from researchers, analysts, and developers — segments that over-index on Reddit, HN, and Product Hunt. The median browser user has 10-20 tabs and no concept of "projects." We're projecting our own workflows onto the market.

**Effort is massive.** Scoping cookies, history, state, and identity per workspace is architecturally complex. It touches every subsystem. The 8 effort estimate might be optimistic. Arc had a full team on this for years.

I scored it Should because it IS a strong differentiator if executed well — but it's not what kills us if we don't have it at launch.

### Local/On-Device AI: Could, not Must (RICE 0.67)

The research gives this 9 evidence points. The council will likely score it as Must or Should. I score it Could.

**The quality gap is enormous.** Local models running on consumer hardware produce substantially worse results than cloud models. Users who try local summarization after using GPT-4 will be disappointed. We'd be shipping a worse experience and calling it "privacy."

**Hardware requirements exclude most users.** Useful local inference requires ≥8GB VRAM or Apple Silicon with sufficient unified memory. The median laptop cannot run a model that produces acceptable quality. Reach of 4, not 9.

**The technology is moving fast — in the wrong direction for us.** Models are getting BIGGER, not smaller. The best models require more compute, not less. We'd be swimming upstream against the capability frontier.

**9 effort months is optimistic.** Integrating llama.cpp or similar, managing model downloads, handling GPU/CPU fallback, optimizing inference across diverse hardware — this is a product in itself.

### Agent Automation: Won't (RICE 0.33)

The research flags 8 evidence points. Multiple council members will push for this. I think it's a trap.

**19.7% success rate for 10-step workflows.** This is the current state of the art. We're not going to solve it. Google, OpenAI, and Anthropic are throwing billions at this problem. A browser startup adding agent infrastructure doesn't move the needle on the fundamental reliability issue.

**Google is building WebMCP into Chrome 146 Canary.** We'd be competing against the browser engine vendor on their home turf. When Chrome ships native agent APIs, our custom APIs become legacy overnight.

**Agent developers don't need a special browser.** They use Playwright, Puppeteer, and Selenium with headless Chrome. A new browser with a new API surface is migration cost with unclear benefit.

**It's fashionable, not needed.** "AI agents" is the 2025-2026 hype cycle. Every startup is pivoting to agents. The market for reliable browser automation exists (it's called enterprise RPA), but it doesn't need a consumer browser to enable it.

### LLM Sidebar Chat: Should, not Must (RICE 1.96)

Every AI browser has this, so others will call it Must. But: ChatGPT is a tab away. Claude is a tab away. Extensions like Sider, MaxAI, Monica already do this. Browser-native adds marginal convenience, not transformation. I scored it Should because for an "AI-native browser" positioning, not having it looks odd — but it's table stakes that add zero differentiation.

### Vim Keybindings: Should, not Must (RICE 1.40)

This will infuriate the power-user faction. ~660K keyboard-first browser users in a 5B+ user market is 0.013%. We are building for this segment, yes, but "Must" implies the product fails without it. A browser with excellent keyboard shortcuts and a command palette can launch without full modal vim keybindings and still serve keyboard-first users. Ship it in v1.1, not v1.0.

### AI Features Generally: Massive Skepticism

I scored 11 of 20 AI features as "Won't." This is deliberate. We risk becoming an AI feature graveyard — building 20 mediocre AI features instead of 3 excellent browser features. The browser is the platform; AI is the capability layer. Get the platform right first. Every engineering month spent on AI-Powered Web Search or Cross-Tab AI Reasoning is a month NOT spent on the workspace model, performance, and extension compatibility that determine whether anyone uses this browser at all.

The AI features that survived my filter are the ones where browser-native integration provides a structural advantage over extensions/services: sidebar chat (page context awareness), page summarization (DOM access), and prompt injection defense (security necessity). Everything else can be an extension, a service, or a future addition.

### The Survivorship Bias Warning

Our evidence comes from vocal online communities: Reddit, Hacker News, GitHub stars, Product Hunt. These communities over-represent:
- Developers and power users (vs the general population)
- AI enthusiasts (vs the AI-skeptical majority)
- Privacy advocates (vs the "I have nothing to hide" majority)
- Linux users (vs Windows/macOS users)
- English speakers (vs the global market)

The 81% "willing to switch" statistic does not mean 81% WILL switch. Willingness ≠ action. Chrome's inertia is not just habit — it's Google account integration, password sync, extension libraries, and corporate IT policies. Every browser that launched thinking "users want to switch" learned that wanting and doing are different things.

We should build a browser that people USE, not one that people on Hacker News upvote.
