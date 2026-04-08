# Technical Architect — RICE Scoring

## Assumptions

**Base architecture**: Firefox/Gecko fork with custom browser chrome (Rust + Web UI). Rationale: MV3-proof ad blocking, full WebExtension MV2 support, privacy-aligned engine, Zen Browser precedent (41K stars). Chromium fork would shift effort estimates for ad-blocking down but privacy/fingerprinting up.

**Effort calibration**:
- Extension-level (features that could be extensions): 1–3
- Browser-chrome-level (custom UI, tab management, settings): 3–6
- Engine-level (rendering, process model, networking): 6–10
- Cross-cutting (touches engine + chrome + extensions): 5–8

**Team assumption**: 4–6 senior browser engineers. 1 eng-month ≈ 1 person working full-time for 1 month.

---

## Top 50 Features Scored

| Rank | Feature | Category | Reach | Impact | Confidence | Effort | RICE | MoSCoW | Kano |
|------|---------|----------|-------|--------|------------|--------|------|--------|------|
| 1 | Native Ad/Tracker Blocking | Core Browsing | 10 | 5 | 0.9 | 3 | 15.0 | Must | Must-be |
| 2 | WebExtension API Support | Extensibility | 10 | 5 | 0.9 | 4 | 11.3 | Must | Must-be |
| 3 | Vertical Tab Sidebar | Workspace & Org | 8 | 4 | 0.9 | 3 | 9.6 | Must | Performance |
| 4 | Project-First Workspaces | Workspace & Org | 8 | 5 | 0.8 | 5 | 6.4 | Must | Delighter |
| 5 | Memory-Efficient Tab Management | Performance | 10 | 4 | 0.8 | 5 | 6.4 | Must | Must-be |
| 6 | Native Vim/Modal Keybindings | Keyboard & Input | 6 | 5 | 0.9 | 3 | 9.0 | Must | Performance |
| 7 | Keyboard Control Over Browser Chrome | Keyboard & Input | 5 | 5 | 0.9 | 4 | 5.6 | Must | Performance |
| 8 | Tab Unloading/Hibernation | Performance | 9 | 4 | 0.9 | 3 | 10.8 | Should | Performance |
| 9 | AI Page Summarization | AI & Agents | 9 | 3 | 0.8 | 3 | 7.2 | Should | Performance |
| 10 | Full Keyboard Shortcut Customization | Keyboard & Input | 6 | 4 | 0.9 | 3 | 7.2 | Should | Performance |
| 11 | Notification Spam Blocking | Core Browsing | 8 | 3 | 0.9 | 1 | 21.6 | Should | Must-be |
| 12 | Zero Telemetry Architecture | Privacy & Security | 7 | 4 | 0.8 | 4 | 5.6 | Must | Must-be |
| 13 | Native Command Palette / Ex-Mode | Keyboard & Input | 6 | 4 | 0.9 | 3 | 7.2 | Should | Performance |
| 14 | LLM Sidebar Chat | AI & Agents | 8 | 4 | 0.7 | 4 | 5.6 | Should | Performance |
| 15 | Sandboxed Identity Profiles | Privacy & Security | 6 | 4 | 0.8 | 5 | 3.8 | Should | Performance |
| 16 | Per-Context Fingerprint Isolation | Privacy & Security | 5 | 4 | 0.7 | 6 | 2.3 | Should | Performance |
| 17 | Local/On-Device AI Inference | AI & Agents | 7 | 5 | 0.5 | 8 | 2.2 | Should | Delighter |
| 18 | Intelligent Tab Lifecycle Management | Workspace & Org | 8 | 4 | 0.7 | 5 | 4.5 | Should | Performance |
| 19 | Per-Workspace Session Persistence | Workspace & Org | 7 | 4 | 0.8 | 4 | 5.6 | Should | Performance |
| 20 | Cross-Device Sync | Sync & Portability | 9 | 4 | 0.7 | 7 | 3.6 | Should | Must-be |
| 21 | Tree-Structured Tabs | Workspace & Org | 5 | 3 | 0.8 | 4 | 3.0 | Could | Performance |
| 22 | Split View / Multi-Pane | Workspace & Org | 5 | 4 | 0.7 | 5 | 2.8 | Could | Delighter |
| 23 | Keyboard-Only Full Navigation | Accessibility | 6 | 4 | 0.9 | 4 | 5.4 | Must | Must-be |
| 24 | BYOM (Bring Your Own Model) | AI & Agents | 5 | 4 | 0.8 | 3 | 5.3 | Should | Performance |
| 25 | Config-as-Code (Real Language) | Extensibility | 4 | 4 | 0.8 | 4 | 3.2 | Could | Delighter |
| 26 | Versionable/Portable Config | Extensibility | 4 | 3 | 0.9 | 2 | 5.4 | Should | Performance |
| 27 | MCP Server (Browser as MCP Server) | Extensibility | 4 | 4 | 0.7 | 4 | 2.8 | Could | Delighter |
| 28 | Prompt Injection Defense | AI & Agents | 8 | 5 | 0.4 | 8 | 2.0 | Should | Must-be |
| 29 | Agent Automation (Multi-Step) | AI & Agents | 5 | 5 | 0.5 | 8 | 1.6 | Could | Delighter |
| 30 | Research-Aware AI Assistant | AI & Agents | 6 | 4 | 0.6 | 6 | 2.4 | Could | Delighter |
| 31 | Cross-Platform Full Parity | Core Browsing | 10 | 4 | 0.7 | 9 | 3.1 | Should | Must-be |
| 32 | AI Writing Assistance (Inline) | AI & Agents | 7 | 3 | 0.7 | 3 | 4.9 | Could | Performance |
| 33 | AI-Powered Web Search | AI & Agents | 7 | 3 | 0.6 | 5 | 2.5 | Could | Performance |
| 34 | Cross-Tab AI Reasoning | AI & Agents | 5 | 4 | 0.5 | 6 | 1.7 | Could | Delighter |
| 35 | Persistent AI Memory / Context | AI & Agents | 5 | 4 | 0.6 | 5 | 2.4 | Could | Delighter |
| 36 | Agent Debugging / Session Replay | AI & Agents | 3 | 4 | 0.7 | 5 | 1.7 | Could | Performance |
| 37 | Native Agent API Surface | AI & Agents | 3 | 5 | 0.6 | 6 | 1.5 | Could | Performance |
| 38 | Token-Efficient Page Representation | AI & Agents | 3 | 4 | 0.7 | 4 | 2.1 | Could | Performance |
| 39 | Semantic Browsing History | Core Browsing | 6 | 4 | 0.6 | 5 | 2.9 | Could | Delighter |
| 40 | Real-Time Privacy Dashboard | Privacy & Security | 5 | 3 | 0.8 | 3 | 4.0 | Could | Performance |
| 41 | Per-Site Privacy Controls | Privacy & Security | 5 | 3 | 0.8 | 4 | 3.0 | Could | Performance |
| 42 | Agent-Content Security Isolation | Privacy & Security | 4 | 5 | 0.4 | 8 | 1.0 | Could | Must-be |
| 43 | Native PKM Integration Layer | Productivity | 4 | 3 | 0.7 | 4 | 2.1 | Could | Delighter |
| 44 | Intelligent Password Manager | Productivity | 8 | 3 | 0.7 | 5 | 3.4 | Could | Must-be |
| 45 | Multi-Model Selection | AI & Agents | 4 | 3 | 0.8 | 2 | 4.8 | Could | Performance |
| 46 | Hybrid Perception Engine (A11y + Vision) | AI & Agents | 3 | 4 | 0.5 | 7 | 0.9 | Won't | Performance |
| 47 | Full-Text Tab Search | Workspace & Org | 5 | 3 | 0.7 | 4 | 2.6 | Could | Performance |
| 48 | Context-Aware Tab Surfacing | Workspace & Org | 6 | 3 | 0.5 | 6 | 1.5 | Could | Delighter |
| 49 | Tab Graveyard / Recovery | Workspace & Org | 7 | 3 | 0.8 | 2 | 8.4 | Should | Must-be |
| 50 | Adaptive Fingerprint Defense | Privacy & Security | 5 | 3 | 0.5 | 7 | 1.1 | Could | Performance |

---

## Rationale for Top 10

### 1. Native Ad/Tracker Blocking (RICE 15.0)
On a Gecko fork, we inherit uBlock Origin's full MV2 capabilities and can integrate content blocking at the network layer. Brave proved this is the single strongest adoption driver. Effort is 3 because Gecko's WebRequest API is production-proven; we're wiring it into the default profile, not reinventing filtering. This is the most RICE-efficient feature in the entire list.

### 2. WebExtension API Support (RICE 11.3)
Firefox fork gives us this nearly for free — the WebExtension runtime is Gecko-native. Effort is 4 (not 2) because our custom browser chrome will break some extension UI assumptions (popups, sidebars, browser action placement). Compatibility testing across top 200 extensions is the real work. Without this, users can't bring password managers, and the browser is dead on arrival.

### 3. Tab Unloading/Hibernation (RICE 10.8)
Gecko already has `browser.tabs.unloadTab()`. The engineering is in building smart heuristics (LRU with pinned-tab exceptions, workspace-aware suspension) and state serialization for instant restore. Moderate chrome-level work. High reach because every user with 20+ tabs benefits.

### 4. Vertical Tab Sidebar (RICE 9.6)
Browser chrome work — replace horizontal tab strip with vertical panel. Firefox shipped this in 2025; we can study their implementation. The hard part is making it work with workspaces, tree-tabs, and keyboard navigation simultaneously. Effort 3 because it's UI-layer only, no engine changes.

### 5. Native Vim/Modal Keybindings (RICE 9.0)
This is our identity feature. Browser-chrome-level: intercept keyboard events before they reach content, maintain modal state machine (Normal/Insert/Command), and route keys through a configurable binding layer. Effort 3 because it's event handling and UI state — no engine changes. The key insight: this must be built into the chrome event pipeline, not bolted on, which is exactly why extensions fail at it.

### 6. Tab Graveyard / Recovery (RICE 8.4)
Session state is already serialized by Gecko. Effort 2: extend session store to keep closed-tab history as searchable index, expose via chrome UI. Low risk, high user-facing value.

### 7. Notification Spam Blocking (RICE 21.6)
Trivial to implement — flip the default permission to "deny" and add a whitelist UI. Effort 1. The RICE score is artificially high because effort is so low, which is exactly right: do this on day one.

### 8. AI Page Summarization (RICE 7.2)
If BYOM/LLM infrastructure exists, summarization is a thin layer on top: extract page content (readability.js or equivalent), send to model, render in sidebar. Effort 3 assumes the LLM plumbing is a separate feature (BYOM). Without LLM infra, effort jumps to 6+.

### 9. Full Keyboard Shortcut Customization (RICE 7.2)
Config layer that maps physical key events to browser actions. The binding table is the easy part; conflict detection across modes (Normal, Insert, Command, per-site overrides) is the real work. Effort 3 — all browser-chrome-level.

### 10. Native Command Palette / Ex-Mode (RICE 7.2)
Fuzzy-searchable command registry exposed via `:` mode. Every browser action registers a command; ex-mode is the UI. Effort 3 — depends on having the action registry from the keybinding system (shared infrastructure). This is the glue that makes keyboard-first usable for non-vim-users too.

---

## Rationale for "Must Have" Picks

### Native Ad/Tracker Blocking
Without this, we lose the single largest driver of browser adoption outside of defaults. 900M+ users run ad blockers. On a Gecko fork, we have architectural advantage over Chromium's MV3 restrictions. Shipping without this is shipping a privacy browser that doesn't block ads — a contradiction in terms.

### WebExtension API Support
The #1 reason users abandon keyboard-first browsers (qutebrowser, nyxt) is the lack of extensions. Password managers alone are a blocker — users will not manually type passwords. On Gecko fork, we inherit this, but must verify compatibility with our custom chrome.

### Vertical Tab Sidebar
Not negotiable for a knowledge-worker browser. Horizontal tabs are unusable past 15 tabs. This is table stakes for the target segment, and every competitor (Arc, Zen, Vivaldi, Edge) already has this.

### Project-First Workspaces
This is the product thesis. Without workspaces, we're "yet another browser with vim keys." The engineering is significant (effort 5) because it touches tab management, session storage, cookie isolation, history scoping, and the sidebar UI. But it's all browser-chrome-level work — no engine changes needed. Firefox Containers proved the cookie isolation model works.

### Memory-Efficient Tab Management
Gecko's multi-process architecture (Fission) gives us per-site process isolation but also per-site memory overhead. With workspaces encouraging 100+ tabs across projects, memory management is existential. Effort 5 because it requires tuning the process model, building the hibernation system, and testing across real workloads.

### Native Vim/Modal Keybindings
This is the other half of the product thesis. A keyboard-first browser without native vim keybindings is Zen Browser — and Zen has 41K stars precisely because it doesn't do this. The 660K+ keyboard-first browser users are our beachhead. Must be native (not extension) to control browser chrome.

### Keyboard Control Over Browser Chrome
Extensions cannot control browser chrome (address bar, settings, devtools). This is the fundamental limitation that killed Vimperator/Pentadactyl and makes current vim extensions second-class. Must be built into the chrome layer from day one.

### Zero Telemetry Architecture
For a privacy-focused browser, any telemetry is a trust violation. Firefox's telemetry (even anonymized) is why LibreWolf and Mullvad Browser exist. This is effort 4 because we must audit and strip all Gecko phone-home behavior (studies, crash reports, safebrowsing, etc.) while preserving update capability. Well-understood problem — LibreWolf has a playbook.

### Keyboard-Only Full Navigation
Every browser surface must be keyboard-navigable: settings, downloads, history, extensions page, devtools. This is both an accessibility requirement and a keyboard-first requirement. If we miss even one surface, the keyboard-first promise is broken. Effort 4 because it's auditing and fixing every chrome page.

---

## Controversial Picks

### Local/On-Device AI scored as "Should" not "Must" (RICE 2.2)
Despite being the #2 evidence feature, I scored this with Effort 8 and Confidence 0.5. Here's why:
- **Effort 8**: Integrating llama.cpp or similar into a browser process is engine-adjacent work. Memory management conflicts with tab management (a 7B model eats 4-8GB). GPU scheduling conflicts with rendering. Cross-platform GPU inference (CUDA, Metal, Vulkan, ROCm) is 4 separate backends. This is not "call an API" — it's embedding an ML runtime into a browser.
- **Confidence 0.5**: Unclear if on-device models are good enough for the promised use cases (summarization, translation) at the sizes that fit in browser memory alongside tabs. 3B models are mediocre; 7B models compete with tabs for RAM.
- Should, not Must, because BYOM (Effort 3) provides the same privacy guarantee for users running Ollama locally, without embedding the runtime. Ship BYOM first, add native inference later when hardware catches up.

### Agent Automation scored as "Could" (RICE 1.6)
The research shows 19.7% reliability for 10-step workflows. This is an unsolved research problem, not an engineering task. Effort 8 and Confidence 0.5. Building agent infra that works at 95%+ reliability requires breakthroughs in self-healing selectors, page understanding, and error recovery that no one has achieved. Ship the Agent API Surface and let the ecosystem iterate; don't bet the launch on solving an open research problem.

### Prompt Injection Defense scored as "Should" with Confidence 0.4
OpenAI's CISO calls this "frontier, unsolved." I gave it Effort 8 because there is no known architecture that reliably prevents prompt injection from untrusted web content. But it's "Should" because shipping AI features without even attempting isolation is irresponsible. The honest path: ship with aggressive sandboxing, human-in-the-loop for sensitive actions, and clear warnings. Don't claim to have solved it.

### Cross-Device Sync scored as "Should" with Effort 7
Sync is a distributed systems problem. Building a sync server, handling conflict resolution, supporting offline-first with merge, and doing it all without collecting user data (E2E encrypted) is 7 eng-months minimum. Firefox Sync took Mozilla years. It's "Should" because v1 can ship without it — users survived Arc without sync for a year.

### Cross-Platform Full Parity scored as "Should" with Effort 9
Effort 9 because "full parity" across Windows, macOS, Linux, Android, iOS is 5 separate platform engineering efforts. iOS forces WebKit (no Gecko), which means a completely different engine for one platform. Android Gecko (GeckoView) exists but needs custom chrome. This is "Should" because launching Linux-first with macOS/Windows following is a viable strategy for the beachhead segment.

### Notification Spam Blocking at Rank 11 despite RICE 21.6
The raw RICE score is the highest in the list because Effort is 1. This is correct — it should be done immediately. But it doesn't define the product, so I didn't rank it higher. It's the "paint the bike shed" feature: cheap, obvious, do it, move on.

### BYOM scored higher than Local AI
BYOM (Effort 3, RICE 5.3) vs Local AI (Effort 8, RICE 2.2). The technical architect's perspective: BYOM is an API integration layer pointing at user-hosted endpoints (Ollama, llama.cpp, OpenAI-compatible APIs). Local AI is embedding the inference runtime. The first gives 80% of the value at 37% of the cost. Ship BYOM, defer native inference.

### Hybrid Perception Engine scored "Won't" (RICE 0.9)
Effort 7, Confidence 0.5. Combining accessibility tree with vision model fallback is a research project disguised as a feature. The a11y tree alone (which Chromium already builds on-demand, and we'd need to make always-on) covers 90% of agent needs. Vision fallback for canvas/charts is a nice-to-have that doubles the engineering surface. Do the a11y tree well first.

---

## Dependency Map (Critical Chains)

```
Keybinding Infrastructure (Vim + Customization + Command Palette)
  └── Keyboard-Only Full Navigation
  └── Keyboard-Native Workspace Switching

Workspace Infrastructure (Project-First Workspaces)
  ├── Per-Workspace Session Persistence (depends on workspace model)
  ├── Intelligent Tab Lifecycle (depends on workspace-aware tab model)
  ├── Context-Aware Tab Surfacing (depends on workspace + lifecycle)
  ├── Named Research Contexts (specialization of workspaces)
  └── Cross-Tab AI Reasoning (needs workspace context)

Privacy Infrastructure (Zero Telemetry + Sandboxed Profiles)
  ├── Per-Context Fingerprint Isolation (depends on profile isolation)
  ├── Adaptive Fingerprint Defense (depends on fingerprint isolation)
  └── Per-Site Privacy Controls (depends on privacy framework)

AI Infrastructure (BYOM + LLM Sidebar Chat)
  ├── AI Page Summarization (needs LLM plumbing)
  ├── AI Writing Assistance (needs LLM plumbing)
  ├── Research-Aware AI Assistant (needs LLM + workspace context)
  ├── Persistent AI Memory (needs storage + LLM)
  └── Local/On-Device AI (replaces cloud path in BYOM)

Agent Infrastructure (Native Agent API Surface)
  ├── Agent Automation (needs API surface)
  ├── Agent Debugging (needs agent runtime)
  ├── MCP Server (needs agent API)
  ├── Token-Efficient Page Repr (needs page understanding)
  └── Prompt Injection Defense (cross-cuts agent + AI)
```

## Technical Risk Assessment

| Risk Level | Features | Why |
|-----------|----------|-----|
| **Low** (well-understood) | Ad blocking, WebExtensions, Vertical tabs, Tab unloading, Keybindings, Command palette, Notification blocking, Tab graveyard, Config files, Theming | Existing implementations to reference. Browser-chrome-level work. |
| **Medium** (complex but tractable) | Workspaces, Session persistence, Sandboxed profiles, LLM sidebar, BYOM, Page summarization, Cross-device sync, Memory management, MCP server | Multiple subsystems involved. Need careful architecture but no unknowns. |
| **High** (novel/research-adjacent) | Local AI inference, Prompt injection defense, Agent automation, Cross-tab reasoning, Adaptive fingerprinting, Semantic security sandbox, Hybrid perception | Unsolved problems, unclear architectures, or hardware-dependent performance. |

## Recommended Build Order (Phases)

**Phase 0 — Foundation (Month 1–3)**: Fork Gecko, strip telemetry, build custom chrome shell, keybinding infrastructure.
**Phase 1 — Identity (Month 3–6)**: Vim keybindings, command palette, vertical tabs, ad blocking, WebExtension compat, keyboard-only nav.
**Phase 2 — Differentiation (Month 6–9)**: Project-first workspaces, session persistence, tab lifecycle, sandboxed profiles, BYOM, LLM sidebar.
**Phase 3 — Polish (Month 9–12)**: Page summarization, cross-device sync, privacy dashboard, split view, config-as-code, migration tools.
**Phase 4 — Frontier (Post-launch)**: Local AI, agent automation, prompt injection defense, cross-tab reasoning, agent API surface.
