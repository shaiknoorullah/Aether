# Aether Browser: Master Feature Candidate List

> **Generated**: 2026-04-08
> **Source**: 16 research reports (5 discovery, 6 competitive, 4 market, 1 validation)
> **Total candidates**: 142
> **Method**: Exhaustive extraction from Opportunities/Gaps, Pain Points, Key Findings, and JTBD sections across all reports, then deduplication and categorization

---

## Summary Table

| # | Name | Category | Evidence | Segments |
|---|------|----------|----------|----------|
| 1 | Native Vim/Modal Keybindings | Keyboard & Input | 8 | Power users, developers, RSI sufferers |
| 2 | Keyboard Control Over Browser Chrome | Keyboard & Input | 6 | Power users, vim users |
| 3 | Website Key Stealing Prevention | Keyboard & Input | 4 | Vim users, keyboard-first users |
| 4 | Text-Based Hint Mode | Keyboard & Input | 2 | Power users |
| 5 | Hint Mode Safety Controls | Keyboard & Input | 2 | Admin users, power users |
| 6 | Full Keyboard Shortcut Customization | Keyboard & Input | 5 | All power users |
| 7 | Physical-Key-Position Bindings | Keyboard & Input | 2 | Non-US keyboard layout users |
| 8 | Native Command Palette / Ex-Mode | Keyboard & Input | 5 | Power users, developers |
| 9 | Caret/Visual Mode for Text Selection | Keyboard & Input | 3 | Power users, copy-heavy workflows |
| 10 | Progressive Keyboard Onboarding | Keyboard & Input | 3 | New users transitioning to keyboard |
| 11 | Voice Input for Browsing | Keyboard & Input | 2 | Mobile users, accessibility |
| 12 | Mouse Gesture Support | Keyboard & Input | 2 | Power users |
| 13 | Project-First Workspaces | Workspace & Organization | 10 | Knowledge workers, researchers, analysts |
| 14 | Tree-Structured Tabs | Workspace & Organization | 5 | Power users, researchers |
| 15 | Vertical Tab Sidebar | Workspace & Organization | 7 | All users, knowledge workers |
| 16 | Split View / Multi-Pane | Workspace & Organization | 5 | Researchers, analysts |
| 17 | Intelligent Tab Lifecycle Management | Workspace & Organization | 6 | All users, tab hoarders |
| 18 | Per-Workspace Session Persistence | Workspace & Organization | 6 | Knowledge workers, researchers |
| 19 | Tab Fuzzy Search by Content | Workspace & Organization | 4 | Power users, researchers |
| 20 | Context-Aware Tab Surfacing | Workspace & Organization | 4 | Casual users, knowledge workers |
| 21 | Tab Graveyard / Recovery | Workspace & Organization | 4 | All users |
| 22 | Keyboard-Native Workspace Switching | Workspace & Organization | 3 | Power users |
| 23 | Named Research Contexts | Workspace & Organization | 3 | Researchers, writers |
| 24 | Glance / Modal Link Preview | Workspace & Organization | 2 | Knowledge workers |
| 25 | LLM Sidebar Chat | AI & Agents | 8 | All users |
| 26 | Research-Aware AI Assistant | AI & Agents | 6 | Knowledge workers, researchers |
| 27 | Local/On-Device AI Inference | AI & Agents | 9 | Privacy users, developers, enterprise |
| 28 | BYOM (Bring Your Own Model) | AI & Agents | 5 | Developers, privacy users |
| 29 | Multi-Model Selection | AI & Agents | 4 | Power users, developers |
| 30 | AI Page Summarization | AI & Agents | 7 | All users |
| 31 | AI Writing Assistance (Inline) | AI & Agents | 5 | Knowledge workers, casual users |
| 32 | AI-Powered Web Search | AI & Agents | 5 | All users |
| 33 | Cross-Tab AI Reasoning | AI & Agents | 5 | Researchers, knowledge workers |
| 34 | Persistent AI Memory / Context | AI & Agents | 5 | Knowledge workers |
| 35 | Agent Automation (Multi-Step Workflows) | AI & Agents | 8 | Developers, agent builders |
| 36 | Agent Debugging / Session Replay | AI & Agents | 5 | Agent developers |
| 37 | Prompt Injection Defense | AI & Agents | 7 | All users, enterprise |
| 38 | AI Skills / Slash Commands | AI & Agents | 3 | Power users |
| 39 | Ambient/Invisible AI | AI & Agents | 3 | Casual users |
| 40 | AI-Powered Translation | AI & Agents | 3 | International users |
| 41 | YouTube Transcript Analysis | AI & Agents | 3 | Researchers, students |
| 42 | AI Shopping Guardian | AI & Agents | 3 | Casual users, shoppers |
| 43 | TEE/Verifiable AI Privacy | AI & Agents | 3 | Privacy users, enterprise |
| 44 | Agent Action Verification | AI & Agents | 3 | Enterprise, security |
| 45 | Native Agent API Surface | AI & Agents | 5 | Agent developers |
| 46 | Hybrid Perception Engine (A11y + Vision) | AI & Agents | 4 | Agent developers |
| 47 | Token-Efficient Page Representation | AI & Agents | 5 | Agent developers |
| 48 | Self-Healing Agent Execution | AI & Agents | 3 | Agent developers |
| 49 | Semantic Browsing History | Core Browsing | 5 | Knowledge workers, researchers |
| 50 | Tree-Structured History | Core Browsing | 3 | Power users |
| 51 | Interaction-Aware History | Core Browsing | 2 | Power users |
| 52 | Tag-Based Bookmarks | Core Browsing | 2 | Power users |
| 53 | Native Ad/Tracker Blocking | Core Browsing | 8 | All users (900M+ ad-block users) |
| 54 | Notification Spam Blocking | Core Browsing | 4 | Casual users |
| 55 | Cookie Consent Auto-Handling | Core Browsing | 3 | All users |
| 56 | Native Dark Mode | Core Browsing | 3 | All users (10M Dark Reader users) |
| 57 | Reading Mode | Core Browsing | 2 | Knowledge workers |
| 58 | Native PDF Viewer with Keyboard | Core Browsing | 2 | Power users |
| 59 | Downloads Manager Improvements | Core Browsing | 1 | All users |
| 60 | Per-Context Fingerprint Isolation | Privacy & Security | 6 | Privacy users, journalists, activists |
| 61 | Sandboxed Identity Profiles | Privacy & Security | 7 | Multi-account users, privacy users |
| 62 | Real-Time Privacy Dashboard | Privacy & Security | 5 | Privacy users |
| 63 | Per-Site Privacy Controls | Privacy & Security | 5 | Privacy users |
| 64 | Adaptive Fingerprint Defense | Privacy & Security | 4 | Privacy users |
| 65 | Zero Telemetry Architecture | Privacy & Security | 6 | Privacy purists |
| 66 | Integrated VPN/Proxy | Privacy & Security | 4 | Privacy users, journalists |
| 67 | Encrypted DNS (DoH/DoT) Integration | Privacy & Security | 3 | Privacy users |
| 68 | Privacy-Preserving Audit Trail | Privacy & Security | 3 | Enterprise, regulated industries |
| 69 | Threat-Level Adaptation | Privacy & Security | 2 | Journalists, activists |
| 70 | Anti-CAPTCHA/Block Resolution | Privacy & Security | 3 | Privacy browser users |
| 71 | Phishing/Scam Detection | Privacy & Security | 3 | Casual users |
| 72 | Credential Vault (Hardware-Isolated) | Privacy & Security | 4 | Enterprise, agent developers |
| 73 | Auto-Update Without Telemetry | Privacy & Security | 3 | Privacy users |
| 74 | Reproducible/Auditable Builds | Privacy & Security | 2 | Security researchers |
| 75 | Agent-Content Security Isolation | Privacy & Security | 5 | Enterprise, agent developers |
| 76 | Semantic Security Sandbox | Privacy & Security | 4 | Enterprise, all agent users |
| 77 | WebExtension API Support | Extensibility | 7 | All users |
| 78 | Privileged Extension Tier | Extensibility | 3 | Power users, developers |
| 79 | Config-as-Code (Real Language) | Extensibility | 5 | Power users, developers |
| 80 | Versionable/Portable Config | Extensibility | 4 | Power users, Linux users |
| 81 | MCP Server (Browser as MCP Server) | Extensibility | 5 | Agent developers, AI tools |
| 82 | MCP Client (Consume External MCP) | Extensibility | 4 | Agent developers |
| 83 | Public Developer API for AI | Extensibility | 4 | Developers, ecosystem |
| 84 | Extension AI Hooks / SDK | Extensibility | 3 | Extension developers |
| 85 | Theming / Visual Customization | Extensibility | 4 | All users (92% want personalization) |
| 86 | Userscript Support | Extensibility | 3 | Power users, developers |
| 87 | Structured Config (Beginner to Expert) | Extensibility | 3 | All users |
| 88 | Plugin/Module System | Extensibility | 3 | Developers |
| 89 | Native PKM Integration Layer | Productivity | 5 | Researchers, writers |
| 90 | Contextual Web Clipping | Productivity | 4 | Researchers, writers |
| 91 | Inline Note-Taking | Productivity | 4 | Researchers, writers |
| 92 | Built-in Email Client | Productivity | 2 | Knowledge workers |
| 93 | Built-in Calendar | Productivity | 2 | Knowledge workers |
| 94 | Built-in RSS Reader | Productivity | 2 | Knowledge workers |
| 95 | Built-in Notes with Rich Text | Productivity | 3 | Knowledge workers |
| 96 | Third-Party App Context (Slack/Notion/Gmail) | Productivity | 3 | Knowledge workers |
| 97 | Intelligent Password Manager | Productivity | 5 | All users ($3-4.6B market) |
| 98 | Coupon/Price Comparison | Productivity | 2 | Casual users, shoppers |
| 99 | Focus/Zen Mode | Productivity | 3 | Knowledge workers |
| 100 | Tab-as-Todo / Task Integration | Productivity | 3 | Knowledge workers |
| 101 | Enhanced DevTools | Developer Tools | 3 | Developers |
| 102 | AI-Integrated DevTools | Developer Tools | 4 | Developers |
| 103 | Console/Network AI Analysis | Developer Tools | 3 | Developers |
| 104 | Agent Observability in DevTools | Developer Tools | 4 | Agent developers, enterprise |
| 105 | Chrome DevTools Protocol Compatibility | Developer Tools | 3 | Developers, automation |
| 106 | WebDriver BiDi Support | Developer Tools | 2 | Developers, testing |
| 107 | Memory-Efficient Tab Management | Performance | 6 | All users |
| 108 | Tab Unloading/Hibernation | Performance | 5 | Power users, resource-limited devices |
| 109 | Self-Healing Performance | Performance | 3 | Casual users |
| 110 | Fast Startup | Performance | 2 | All users |
| 111 | Efficient Rendering Engine | Performance | 4 | All users |
| 112 | Background Process Management | Performance | 3 | All users |
| 113 | Current/Modern Web Engine | Performance | 4 | All users |
| 114 | Cached Data Auto-Pruning | Performance | 2 | Casual users |
| 115 | Parallel Browser Sessions at Scale | Performance | 3 | Agent developers |
| 116 | Cross-Device Sync | Sync & Portability | 6 | All users |
| 117 | Profile Export/Import | Sync & Portability | 4 | Switching users |
| 118 | Frictionless Migration from Chrome | Sync & Portability | 4 | New users |
| 119 | Self-Hosted Sync Server | Sync & Portability | 3 | Privacy users |
| 120 | AI Chat Sync Across Devices | Sync & Portability | 2 | All AI users |
| 121 | Config Export/Import | Sync & Portability | 3 | Power users |
| 122 | Portable Identity Layer | Sync & Portability | 3 | All users |
| 123 | Screen Reader Integration | Accessibility | 2 | Visually impaired users |
| 124 | Always-On Accessibility Tree | Accessibility | 4 | Agent developers, accessibility |
| 125 | High Contrast/Motion Preferences | Accessibility | 2 | Accessibility users |
| 126 | Keyboard-Only Full Navigation | Accessibility | 5 | Accessibility, RSI, power users |
| 127 | ADHD-Friendly Tab Management | Accessibility | 2 | ADHD users |
| 128 | Shared Browsing Sessions | Social & Collaboration | 2 | Teams, pair programming |
| 129 | Web Annotations | Social & Collaboration | 3 | Researchers, teams |
| 130 | Collaborative Workspaces | Social & Collaboration | 2 | Teams |
| 131 | AI Agent + Human Collaboration | Social & Collaboration | 3 | Developers, teams |
| 132 | Window Manager Integration (Tiling WM) | Core Browsing | 3 | Linux users |
| 133 | CLI Profile Launch | Core Browsing | 3 | Linux users, developers |
| 134 | Cross-Platform with Full Parity | Core Browsing | 5 | All users |
| 135 | Linux First-Class Support | Core Browsing | 4 | Linux users, developers |
| 136 | Mobile Privacy Parity | Privacy & Security | 3 | Mobile users |
| 137 | Enterprise SSO/Team Management | Extensibility | 3 | Enterprise |
| 138 | Transparent Rate Limits/SLAs | AI & Agents | 3 | Developers, enterprise |
| 139 | Agent-Optimized Rendering Mode | AI & Agents | 3 | Agent developers |
| 140 | WebMCP / Structured Agent Protocol | AI & Agents | 3 | Agent developers, web developers |
| 141 | Anti-Bot Stealth (Real Browser) | AI & Agents | 4 | Agent developers, scrapers |
| 142 | Minimal Tool Surface for Agents | AI & Agents | 2 | Agent developers |

---

## Detailed Feature Candidates

```json
[
  {
    "id": 1,
    "name": "Native Vim/Modal Keybindings",
    "category": "Keyboard & Input",
    "description": "Browser-native modal editing (Normal/Insert/Command modes) with vim-style keybindings that work everywhere, not bolted on via extension. Eliminates the extension sandbox problem entirely.",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers", "competitive/firefox-ecosystem", "market/github-signals", "market/community-sentiment", "market/extension-ecosystem"],
    "user_segments": ["Power users", "Vim users", "Developers", "RSI sufferers"],
    "evidence_count": 8
  },
  {
    "id": 2,
    "name": "Keyboard Control Over Browser Chrome",
    "category": "Keyboard & Input",
    "description": "Vim keybindings that operate on browser chrome (address bar, settings, PDF viewer, reader mode, about: pages), not just web content. Extensions cannot do this due to WebExtension API sandbox.",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers", "competitive/firefox-ecosystem", "market/community-sentiment"],
    "user_segments": ["Power users", "Vim users"],
    "evidence_count": 6
  },
  {
    "id": 3,
    "name": "Website Key Stealing Prevention",
    "category": "Keyboard & Input",
    "description": "Priority system where browser-level keybindings always win unless explicitly yielded per-site. Prevents websites (GitHub, Google, YouTube) from intercepting keys like / j k before the browser.",
    "source_reports": ["discovery/power-users", "competitive/firefox-ecosystem"],
    "user_segments": ["Vim users", "Keyboard-first users"],
    "evidence_count": 4
  },
  {
    "id": 4,
    "name": "Text-Based Hint Mode",
    "category": "Keyboard & Input",
    "description": "Link following where you type the visible link text to filter matches (Vimperator-style), instead of reading generated letter labels. Eliminates cognitive pause of standard hint mode.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Power users"],
    "evidence_count": 2
  },
  {
    "id": 5,
    "name": "Hint Mode Safety Controls",
    "category": "Keyboard & Input",
    "description": "Configurable safety for hint mode: leader keys, modifier requirements, or per-domain disable lists to prevent accidental destructive actions on admin pages.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Admin users", "Power users"],
    "evidence_count": 2
  },
  {
    "id": 6,
    "name": "Full Keyboard Shortcut Customization",
    "category": "Keyboard & Input",
    "description": "Complete keyboard shortcut remapping including dangerous shortcuts (Ctrl+Q, Ctrl+W), with conflict detection, export/import of keymaps. Firefox took 25 years to ship this.",
    "source_reports": ["discovery/power-users", "competitive/firefox-ecosystem", "market/github-signals", "market/community-sentiment"],
    "user_segments": ["All power users"],
    "evidence_count": 5
  },
  {
    "id": 7,
    "name": "Physical-Key-Position Bindings",
    "category": "Keyboard & Input",
    "description": "Keybindings based on KeyboardEvent.code (physical position) rather than KeyboardEvent.key (layout-dependent), so bindings work identically on QWERTZ, Dvorak, Colemak, etc.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Non-US keyboard layout users"],
    "evidence_count": 2
  },
  {
    "id": 8,
    "name": "Native Command Palette / Ex-Mode",
    "category": "Keyboard & Input",
    "description": "Built-in command line within the browser (:open, :tabclose, :set) with tab completion, history, fuzzy search, and full access to browser internals. Like vim's : mode or rofi/dmenu.",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers", "competitive/ai-browsers"],
    "user_segments": ["Power users", "Developers"],
    "evidence_count": 5
  },
  {
    "id": 9,
    "name": "Caret/Visual Mode for Text Selection",
    "category": "Keyboard & Input",
    "description": "Select text without a mouse using keyboard-driven caret and visual mode. Non-negotiable for copy-heavy workflows.",
    "source_reports": ["competitive/power-user-browsers"],
    "user_segments": ["Power users", "Copy-heavy workflows"],
    "evidence_count": 3
  },
  {
    "id": 10,
    "name": "Progressive Keyboard Onboarding",
    "category": "Keyboard & Input",
    "description": "System that starts in normal browser mode and progressively teaches keyboard shortcuts — showing hints, suggesting keys for repeated mouse actions — lowering the barrier without diluting power.",
    "source_reports": ["competitive/power-user-browsers", "competitive/firefox-ecosystem"],
    "user_segments": ["New users transitioning to keyboard-first"],
    "evidence_count": 3
  },
  {
    "id": 11,
    "name": "Voice Input for Browsing",
    "category": "Keyboard & Input",
    "description": "Voice commands for browser navigation and AI interaction, especially on mobile.",
    "source_reports": ["competitive/ai-browsers"],
    "user_segments": ["Mobile users", "Accessibility"],
    "evidence_count": 2
  },
  {
    "id": 12,
    "name": "Mouse Gesture Support",
    "category": "Keyboard & Input",
    "description": "Native mouse gesture support for common browser actions (back, forward, close tab, new tab).",
    "source_reports": ["competitive/power-user-browsers", "competitive/firefox-ecosystem"],
    "user_segments": ["Power users"],
    "evidence_count": 2
  },
  {
    "id": 13,
    "name": "Project-First Workspaces",
    "category": "Workspace & Organization",
    "description": "Treat projects as first-class entities with scoped tabs, history, cookies, and state. Instantly switchable contexts that are invisible until entered. Replaces flat tab model with cognitive structure.",
    "source_reports": ["discovery/knowledge-workers", "discovery/power-users", "discovery/casual-users", "competitive/power-user-browsers", "competitive/firefox-ecosystem", "market/browser-trends", "market/community-sentiment", "market/extension-ecosystem"],
    "user_segments": ["Knowledge workers", "Researchers", "Analysts", "Multi-project workers"],
    "evidence_count": 10
  },
  {
    "id": 14,
    "name": "Tree-Structured Tabs",
    "category": "Workspace & Organization",
    "description": "Hierarchical tab organization showing parent-child navigation relationships and tree ancestry, preserving spatial memory.",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers", "competitive/firefox-ecosystem"],
    "user_segments": ["Power users", "Researchers"],
    "evidence_count": 5
  },
  {
    "id": 15,
    "name": "Vertical Tab Sidebar",
    "category": "Workspace & Organization",
    "description": "Vertical tab list replacing horizontal tab strip, with readable titles instead of compressed favicons. Chrome took 17 years to ship this.",
    "source_reports": ["discovery/knowledge-workers", "competitive/firefox-ecosystem", "market/github-signals", "market/community-sentiment", "market/browser-trends"],
    "user_segments": ["All users", "Knowledge workers"],
    "evidence_count": 7
  },
  {
    "id": 16,
    "name": "Split View / Multi-Pane",
    "category": "Workspace & Organization",
    "description": "Native multi-pane viewing (up to 4 tabs tiled in a grid) for comparing and synthesizing multiple sources simultaneously.",
    "source_reports": ["discovery/knowledge-workers", "competitive/firefox-ecosystem", "competitive/power-user-browsers"],
    "user_segments": ["Researchers", "Analysts"],
    "evidence_count": 5
  },
  {
    "id": 17,
    "name": "Intelligent Tab Lifecycle Management",
    "category": "Workspace & Organization",
    "description": "Graduated tab states: active, suspended (preserving state), archived (searchable), connected (linked to project). Not all-or-nothing like OneTab or force-archiving like Arc.",
    "source_reports": ["discovery/knowledge-workers", "discovery/casual-users", "market/extension-ecosystem", "market/browser-trends"],
    "user_segments": ["All users", "Tab hoarders"],
    "evidence_count": 6
  },
  {
    "id": 18,
    "name": "Per-Workspace Session Persistence",
    "category": "Workspace & Organization",
    "description": "Per-project session state capturing which tabs were open, scroll positions, form data, and progress. Survives restarts and can be paused/resumed.",
    "source_reports": ["discovery/knowledge-workers", "discovery/power-users", "discovery/casual-users"],
    "user_segments": ["Knowledge workers", "Researchers"],
    "evidence_count": 6
  },
  {
    "id": 19,
    "name": "Full-Text Tab Search",
    "category": "Workspace & Organization",
    "description": "Search open tabs by content (not just title/URL). Full-text index of rendered tab content searchable from address bar or command mode.",
    "source_reports": ["discovery/power-users", "discovery/knowledge-workers"],
    "user_segments": ["Power users", "Researchers"],
    "evidence_count": 4
  },
  {
    "id": 20,
    "name": "Context-Aware Tab Surfacing",
    "category": "Workspace & Organization",
    "description": "Browser understands context: automatically archives stale tabs, surfaces relevant ones when you return to a task. Makes it impossible to lose a page.",
    "source_reports": ["discovery/casual-users", "discovery/knowledge-workers"],
    "user_segments": ["Casual users", "Knowledge workers"],
    "evidence_count": 4
  },
  {
    "id": 21,
    "name": "Tab Graveyard / Recovery",
    "category": "Workspace & Organization",
    "description": "Closed tabs are trivially recoverable with full session state, searchable history, not just URL. Relieves fear-of-closing that drives tab hoarding.",
    "source_reports": ["discovery/knowledge-workers", "discovery/power-users"],
    "user_segments": ["All users"],
    "evidence_count": 4
  },
  {
    "id": 22,
    "name": "Keyboard-Native Workspace Switching",
    "category": "Workspace & Organization",
    "description": "Named contexts with fuzzy switching via keyboard, per-workspace keybindings, pinnable buffer positions (C-1 for buffer 1).",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers"],
    "user_segments": ["Power users"],
    "evidence_count": 3
  },
  {
    "id": 23,
    "name": "Named Research Contexts",
    "category": "Workspace & Organization",
    "description": "Persistent, named research contexts that preserve the spatial/relational structure of sources and can be paused and resumed across days.",
    "source_reports": ["discovery/knowledge-workers"],
    "user_segments": ["Researchers", "Writers"],
    "evidence_count": 3
  },
  {
    "id": 24,
    "name": "Glance / Modal Link Preview",
    "category": "Workspace & Organization",
    "description": "Quick preview of a link's content via modifier+click without navigating away from current page.",
    "source_reports": ["competitive/firefox-ecosystem"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 2
  },
  {
    "id": 25,
    "name": "LLM Sidebar Chat",
    "category": "AI & Agents",
    "description": "Integrated AI chat sidebar with current-page context awareness, supporting summarization, Q&A, and content generation.",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions", "discovery/knowledge-workers", "discovery/casual-users", "market/extension-ecosystem"],
    "user_segments": ["All users"],
    "evidence_count": 8
  },
  {
    "id": 26,
    "name": "Research-Aware AI Assistant",
    "category": "AI & Agents",
    "description": "AI that understands the user's active project context, surfaces relevant previously-visited pages, suggests connections between sources, and synthesizes findings. 49% of users want research support as top AI priority.",
    "source_reports": ["discovery/knowledge-workers", "competitive/ai-browsers", "market/browser-trends", "market/extension-ecosystem"],
    "user_segments": ["Knowledge workers", "Researchers"],
    "evidence_count": 6
  },
  {
    "id": 27,
    "name": "Local/On-Device AI Inference",
    "category": "AI & Agents",
    "description": "AI features (summarization, translation, search) running entirely on-device with no cloud data transmission. Eliminates trust-the-server problem. No privacy browser currently offers this.",
    "source_reports": ["discovery/privacy-advocates", "competitive/ai-browsers", "competitive/privacy-browsers", "competitive/ai-extensions", "market/community-sentiment", "market/browser-trends", "market/github-signals"],
    "user_segments": ["Privacy users", "Developers", "Enterprise"],
    "evidence_count": 9
  },
  {
    "id": 28,
    "name": "BYOM (Bring Your Own Model)",
    "category": "AI & Agents",
    "description": "Support for user-supplied models via Ollama, llama.cpp, or custom API endpoints. Only Brave offers this among browsers (desktop only).",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions", "market/community-sentiment"],
    "user_segments": ["Developers", "Privacy users"],
    "evidence_count": 5
  },
  {
    "id": 29,
    "name": "Multi-Model Selection",
    "category": "AI & Agents",
    "description": "User-selectable AI models (GPT, Claude, Gemini, open-source) with transparent routing rather than opaque auto-selection.",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions"],
    "user_segments": ["Power users", "Developers"],
    "evidence_count": 4
  },
  {
    "id": 30,
    "name": "AI Page Summarization",
    "category": "AI & Agents",
    "description": "One-click summarization of articles, PDFs, and YouTube videos with key points extraction. The #1 use case across all AI extensions.",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions", "discovery/casual-users", "discovery/knowledge-workers"],
    "user_segments": ["All users"],
    "evidence_count": 7
  },
  {
    "id": 31,
    "name": "AI Writing Assistance (Inline)",
    "category": "AI & Agents",
    "description": "AI-powered drafting, rewriting, grammar fixes directly in text fields on any site. Select text → edit → insert pattern.",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions", "market/extension-ecosystem"],
    "user_segments": ["Knowledge workers", "Casual users"],
    "evidence_count": 5
  },
  {
    "id": 32,
    "name": "AI-Powered Web Search",
    "category": "AI & Agents",
    "description": "AI answers with inline citations and source links, bypassing SEO-polluted results. ~50% of consumers prefer AI-powered search.",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions", "market/community-sentiment", "discovery/casual-users"],
    "user_segments": ["All users"],
    "evidence_count": 5
  },
  {
    "id": 33,
    "name": "Cross-Tab AI Reasoning",
    "category": "AI & Agents",
    "description": "AI that can reason across multiple open tabs simultaneously, compare pages, and synthesize research sessions spanning 20+ tabs.",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions", "market/community-sentiment"],
    "user_segments": ["Researchers", "Knowledge workers"],
    "evidence_count": 5
  },
  {
    "id": 34,
    "name": "Persistent AI Memory / Context",
    "category": "AI & Agents",
    "description": "AI that maintains persistent cross-session context, remembering project state and building a user knowledge graph. No extension offers this today.",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions", "market/extension-ecosystem"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 5
  },
  {
    "id": 35,
    "name": "Agent Automation (Multi-Step Workflows)",
    "category": "AI & Agents",
    "description": "Autonomous multi-step web automation: fill forms, navigate sites, complete tasks. Current 85%/step reliability degrades to ~20% for 10-step workflows. Need >95% with self-healing.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure", "competitive/ai-browsers", "market/github-signals", "market/community-sentiment"],
    "user_segments": ["Developers", "Agent builders", "Enterprise"],
    "evidence_count": 8
  },
  {
    "id": 36,
    "name": "Agent Debugging / Session Replay",
    "category": "AI & Agents",
    "description": "Step-through replay of agent sessions with synchronized accessibility tree snapshots, screenshots, LLM reasoning traces, and action outcomes. Structured error taxonomy.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure"],
    "user_segments": ["Agent developers"],
    "evidence_count": 5
  },
  {
    "id": 37,
    "name": "Prompt Injection Defense",
    "category": "AI & Agents",
    "description": "Architectural defense against prompt injection through untrusted web content. Traditional sandboxing doesn't work; requires semantic-layer isolation. OpenAI CISO calls it 'frontier, unsolved.'",
    "source_reports": ["discovery/privacy-advocates", "discovery/ai-agent-builders", "competitive/agent-infrastructure", "competitive/ai-browsers", "market/community-sentiment"],
    "user_segments": ["All users", "Enterprise"],
    "evidence_count": 7
  },
  {
    "id": 38,
    "name": "AI Skills / Slash Commands",
    "category": "AI & Agents",
    "description": "User-creatable prompt macros and community skill galleries for common AI tasks, triggerable via /slash commands.",
    "source_reports": ["competitive/ai-browsers"],
    "user_segments": ["Power users"],
    "evidence_count": 3
  },
  {
    "id": 39,
    "name": "Ambient/Invisible AI",
    "category": "AI & Agents",
    "description": "AI that helps without being visible: auto-summarize long pages when scrolling slowly, flag suspicious sites, answer questions inline — no separate panel or dialog.",
    "source_reports": ["discovery/casual-users", "discovery/knowledge-workers"],
    "user_segments": ["Casual users"],
    "evidence_count": 3
  },
  {
    "id": 40,
    "name": "AI-Powered Translation",
    "category": "AI & Agents",
    "description": "Native AI translation layer replacing Google Translate extension (40M users). Real-time page translation with context awareness.",
    "source_reports": ["market/extension-ecosystem", "competitive/ai-extensions"],
    "user_segments": ["International users"],
    "evidence_count": 3
  },
  {
    "id": 41,
    "name": "YouTube Transcript Analysis",
    "category": "AI & Agents",
    "description": "Built-in YouTube transcript extraction, timestamped summarization, and Q&A over video content.",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions"],
    "user_segments": ["Researchers", "Students"],
    "evidence_count": 3
  },
  {
    "id": 42,
    "name": "AI Shopping Guardian",
    "category": "AI & Agents",
    "description": "Built-in price comparison, automatic coupon application, fake-store detection, and retargeting ad blocking. Replaces Honey (19M users) and similar extensions.",
    "source_reports": ["discovery/casual-users", "market/extension-ecosystem"],
    "user_segments": ["Casual users", "Shoppers"],
    "evidence_count": 3
  },
  {
    "id": 43,
    "name": "TEE/Verifiable AI Privacy",
    "category": "AI & Agents",
    "description": "Cryptographically-verifiable privacy for AI inference using Trusted Execution Environments. Browser can prove 'no data left the device.' Brave has this in Nightly only.",
    "source_reports": ["competitive/ai-browsers", "competitive/privacy-browsers"],
    "user_segments": ["Privacy users", "Enterprise"],
    "evidence_count": 3
  },
  {
    "id": 44,
    "name": "Agent Action Verification",
    "category": "AI & Agents",
    "description": "Human-in-the-loop confirmation for sensitive agent actions (payments, auth, PII) with cryptographic audit trails. No tool provides pre-execution verification today.",
    "source_reports": ["competitive/agent-infrastructure", "discovery/ai-agent-builders"],
    "user_segments": ["Enterprise", "Security-conscious users"],
    "evidence_count": 3
  },
  {
    "id": 45,
    "name": "Native Agent API Surface",
    "category": "AI & Agents",
    "description": "First-class agent control API at the browser engine level (not retrofit via CDP/WebDriver). Structured semantic APIs, not debugging protocols repurposed for agents.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure", "market/github-signals"],
    "user_segments": ["Agent developers"],
    "evidence_count": 5
  },
  {
    "id": 46,
    "name": "Hybrid Perception Engine (A11y + Vision)",
    "category": "AI & Agents",
    "description": "Unified agent view combining always-on complete accessibility tree, on-demand visual annotations for canvas/charts, and semantic page understanding. DOM-first, vision-fallback.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure"],
    "user_segments": ["Agent developers"],
    "evidence_count": 4
  },
  {
    "id": 47,
    "name": "Token-Efficient Page Representation",
    "category": "AI & Agents",
    "description": "Browser-native context builder producing task-relevant page summaries, caching repeated patterns. Target: 10-30x context window efficiency vs raw page dumps. MCP uses 4x more tokens than needed.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure", "market/github-signals"],
    "user_segments": ["Agent developers"],
    "evidence_count": 5
  },
  {
    "id": 48,
    "name": "Self-Healing Agent Execution",
    "category": "AI & Agents",
    "description": "Browser-native action execution that identifies elements semantically (role, label, position) rather than by fragile selectors. Automatic retry with degraded-mode fallbacks.",
    "source_reports": ["competitive/agent-infrastructure", "discovery/ai-agent-builders"],
    "user_segments": ["Agent developers"],
    "evidence_count": 3
  },
  {
    "id": 49,
    "name": "Semantic Browsing History",
    "category": "Core Browsing",
    "description": "Content-indexed, project-scoped, semantically searchable browsing memory. 'Find that article about distributed consensus I read last Tuesday' should work. No browser offers this.",
    "source_reports": ["discovery/knowledge-workers", "discovery/power-users", "market/community-sentiment"],
    "user_segments": ["Knowledge workers", "Researchers"],
    "evidence_count": 5
  },
  {
    "id": 50,
    "name": "Tree-Structured History",
    "category": "Core Browsing",
    "description": "History showing parent-child navigation relationships (the journey, not just destinations). Current history deduplicates visits, destroying the causal chain.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Power users"],
    "evidence_count": 3
  },
  {
    "id": 51,
    "name": "Interaction-Aware History",
    "category": "Core Browsing",
    "description": "History weighted by scroll depth, time on page, and interaction events. A page read for 20 minutes ranks higher than a 2-second bounce.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Power users"],
    "evidence_count": 2
  },
  {
    "id": 52,
    "name": "Tag-Based Bookmarks",
    "category": "Core Browsing",
    "description": "Bookmarks organized by multiple overlapping tags instead of single-hierarchy folders, with fuzzy search and auto-suggested tags based on content.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Power users"],
    "evidence_count": 2
  },
  {
    "id": 53,
    "name": "Native Ad/Tracker Blocking",
    "category": "Core Browsing",
    "description": "Built-in, MV3-proof content blocking that doesn't depend on extensions Google can break. 900M+ ad-block users worldwide. Brave proved this drives adoption (100M MAU).",
    "source_reports": ["discovery/casual-users", "discovery/power-users", "discovery/privacy-advocates", "competitive/privacy-browsers", "market/extension-ecosystem", "market/browser-trends"],
    "user_segments": ["All users"],
    "evidence_count": 8
  },
  {
    "id": 54,
    "name": "Notification Spam Blocking",
    "category": "Core Browsing",
    "description": "Block all notification permission requests by default. 300% increase in malicious browser push notifications in 2025. Users unknowingly grant permissions and can't revoke them.",
    "source_reports": ["discovery/casual-users", "market/extension-ecosystem"],
    "user_segments": ["Casual users"],
    "evidence_count": 4
  },
  {
    "id": 55,
    "name": "Cookie Consent Auto-Handling",
    "category": "Core Browsing",
    "description": "Automatically handle cookie consent banners (deny all or accept minimum) without user interaction.",
    "source_reports": ["discovery/casual-users"],
    "user_segments": ["All users"],
    "evidence_count": 3
  },
  {
    "id": 56,
    "name": "Native Dark Mode",
    "category": "Core Browsing",
    "description": "Per-site dark mode with memory of preferences. Replaces Dark Reader (10M users). 92% of users want more personalization.",
    "source_reports": ["market/extension-ecosystem", "competitive/firefox-ecosystem"],
    "user_segments": ["All users"],
    "evidence_count": 3
  },
  {
    "id": 57,
    "name": "Reading Mode",
    "category": "Core Browsing",
    "description": "Distraction-free reading mode that strips ads, navigation, and clutter while preserving vim keybindings.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 2
  },
  {
    "id": 58,
    "name": "Native PDF Viewer with Keyboard",
    "category": "Core Browsing",
    "description": "PDF viewer that supports hjkl scrolling and other vim keybindings. Current browsers disable extensions in PDF view.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Power users"],
    "evidence_count": 2
  },
  {
    "id": 59,
    "name": "Downloads Manager Improvements",
    "category": "Core Browsing",
    "description": "Better download management with keyboard navigation, progress visibility, and integration with file manager.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["All users"],
    "evidence_count": 1
  },
  {
    "id": 60,
    "name": "Per-Context Fingerprint Isolation",
    "category": "Privacy & Security",
    "description": "Each identity context (work, personal, research) has a distinct, consistent fingerprint alongside isolated cookies, storage, and optional separate network routes. Firefox Containers only isolate cookies.",
    "source_reports": ["discovery/privacy-advocates", "competitive/privacy-browsers", "market/community-sentiment"],
    "user_segments": ["Privacy users", "Journalists", "Activists"],
    "evidence_count": 6
  },
  {
    "id": 61,
    "name": "Sandboxed Identity Profiles",
    "category": "Privacy & Security",
    "description": "First-class CLI support for launching profile-isolated browser instances with independent cookies, history, extensions, distinct WM_CLASS values. Not extension-level like Multi-Account Containers.",
    "source_reports": ["discovery/privacy-advocates", "discovery/power-users", "competitive/privacy-browsers"],
    "user_segments": ["Multi-account users", "Privacy users", "Linux users"],
    "evidence_count": 7
  },
  {
    "id": 62,
    "name": "Real-Time Privacy Dashboard",
    "category": "Privacy & Security",
    "description": "Live dashboard showing fingerprint uniqueness score, active trackers blocked, DNS routing path, connection encryption status, and alerts for detected leaks.",
    "source_reports": ["discovery/privacy-advocates", "competitive/privacy-browsers"],
    "user_segments": ["Privacy users"],
    "evidence_count": 5
  },
  {
    "id": 63,
    "name": "Per-Site Privacy Controls",
    "category": "Privacy & Security",
    "description": "Granular per-site API access: allow Canvas for a drawing app, block it on news sites; allow WebGL for a game, block for social media. Intelligent defaults with easy override.",
    "source_reports": ["discovery/privacy-advocates", "competitive/privacy-browsers"],
    "user_segments": ["Privacy users"],
    "evidence_count": 5
  },
  {
    "id": 64,
    "name": "Adaptive Fingerprint Defense",
    "category": "Privacy & Security",
    "description": "Dynamic fingerprinting defense that strengthens protections on tracking-heavy sites while relaxing on trusted sites. Generates realistic, diverse fingerprints that pass anti-bot checks.",
    "source_reports": ["discovery/privacy-advocates", "competitive/privacy-browsers"],
    "user_segments": ["Privacy users"],
    "evidence_count": 4
  },
  {
    "id": 65,
    "name": "Zero Telemetry Architecture",
    "category": "Privacy & Security",
    "description": "Zero telemetry by default with no data collection. Auditable network monitor shows every outbound connection. Open-source with reproducible builds.",
    "source_reports": ["discovery/privacy-advocates", "competitive/privacy-browsers", "competitive/firefox-ecosystem"],
    "user_segments": ["Privacy purists"],
    "evidence_count": 6
  },
  {
    "id": 66,
    "name": "Integrated VPN/Proxy",
    "category": "Privacy & Security",
    "description": "Built-in, coordinated VPN integration (no DNS leaks), encrypted DNS that respects the VPN tunnel, and anti-fingerprinting that doesn't trigger Cloudflare.",
    "source_reports": ["discovery/privacy-advocates", "competitive/privacy-browsers", "market/github-signals"],
    "user_segments": ["Privacy users", "Journalists"],
    "evidence_count": 4
  },
  {
    "id": 67,
    "name": "Encrypted DNS (DoH/DoT) Integration",
    "category": "Privacy & Security",
    "description": "Properly integrated DNS-over-HTTPS/TLS that doesn't bypass VPN DNS settings, with transparent routing visibility.",
    "source_reports": ["discovery/privacy-advocates"],
    "user_segments": ["Privacy users"],
    "evidence_count": 3
  },
  {
    "id": 68,
    "name": "Privacy-Preserving Audit Trail",
    "category": "Privacy & Security",
    "description": "Browser that can cryptographically prove 'no data left the device' for any browsing session. Verifiable proof of privacy claims, not trust-based.",
    "source_reports": ["competitive/privacy-browsers"],
    "user_segments": ["Enterprise", "Regulated industries"],
    "evidence_count": 3
  },
  {
    "id": 69,
    "name": "Threat-Level Adaptation",
    "category": "Privacy & Security",
    "description": "Contextual privacy system that escalates/de-escalates protection based on current identity context (personal email = low risk, source communication = high risk).",
    "source_reports": ["discovery/privacy-advocates"],
    "user_segments": ["Journalists", "Activists"],
    "evidence_count": 2
  },
  {
    "id": 70,
    "name": "Anti-CAPTCHA/Block Resolution",
    "category": "Privacy & Security",
    "description": "AI system that negotiates with anti-bot systems or provides alternative access without compromising anonymity. Privacy users are disproportionately hit by CAPTCHAs.",
    "source_reports": ["competitive/privacy-browsers", "discovery/privacy-advocates"],
    "user_segments": ["Privacy browser users"],
    "evidence_count": 3
  },
  {
    "id": 71,
    "name": "Phishing/Scam Detection",
    "category": "Privacy & Security",
    "description": "Proactive phishing site detection with clear communication in non-technical language. Edge SmartScreen blocks 95.5% vs Chrome's 86.9%.",
    "source_reports": ["discovery/casual-users"],
    "user_segments": ["Casual users"],
    "evidence_count": 3
  },
  {
    "id": 72,
    "name": "Hardware-Isolated Credential Vault",
    "category": "Privacy & Security",
    "description": "Browser-native auth vault where credentials are stored in hardware-isolated enclave, used for form filling without exposing secrets to LLM layer. Domain-scoped permissions and audit logs.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure"],
    "user_segments": ["Enterprise", "Agent developers"],
    "evidence_count": 4
  },
  {
    "id": 73,
    "name": "Auto-Update Without Telemetry",
    "category": "Privacy & Security",
    "description": "Cryptographic update verification that requires no phone-home. LibreWolf and Mullvad both lack seamless auto-update while maintaining zero telemetry.",
    "source_reports": ["competitive/privacy-browsers", "competitive/firefox-ecosystem"],
    "user_segments": ["Privacy users"],
    "evidence_count": 3
  },
  {
    "id": 74,
    "name": "Reproducible/Auditable Builds",
    "category": "Privacy & Security",
    "description": "Open-source with reproducible builds so users can verify the binary matches the source. No browser has published a comprehensive third-party privacy audit.",
    "source_reports": ["competitive/privacy-browsers", "discovery/privacy-advocates"],
    "user_segments": ["Security researchers"],
    "evidence_count": 2
  },
  {
    "id": 75,
    "name": "Agent-Content Security Isolation",
    "category": "Privacy & Security",
    "description": "New isolation primitive separating agent reasoning context from untrusted page content. Prevents prompt injection at architectural level rather than heuristics. The agent-as-cross-origin-bridge problem.",
    "source_reports": ["competitive/agent-infrastructure", "discovery/ai-agent-builders", "market/community-sentiment"],
    "user_segments": ["Enterprise", "Agent developers"],
    "evidence_count": 5
  },
  {
    "id": 76,
    "name": "Semantic Security Sandbox",
    "category": "Privacy & Security",
    "description": "Security sandbox operating at the semantic layer (agent reasoning) not just the process layer. Traditional browser sandboxing can't prevent prompt injection because it operates within the sandbox.",
    "source_reports": ["competitive/agent-infrastructure", "discovery/ai-agent-builders"],
    "user_segments": ["Enterprise", "All agent users"],
    "evidence_count": 4
  },
  {
    "id": 77,
    "name": "WebExtension API Support",
    "category": "Extensibility",
    "description": "Full WebExtension API compatibility (at minimum uBlock Origin + password manager). The #1 reason users leave keyboard-first browsers. Extension ecosystem is non-negotiable.",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers", "competitive/firefox-ecosystem", "market/extension-ecosystem"],
    "user_segments": ["All users"],
    "evidence_count": 7
  },
  {
    "id": 78,
    "name": "Privileged Extension Tier",
    "category": "Extensibility",
    "description": "Opt-in privileged extension tier with user consent that has access to browser chrome, all pages, and native OS APIs. Restoring Vimperator-era power.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Power users", "Developers"],
    "evidence_count": 3
  },
  {
    "id": 79,
    "name": "Config-as-Code (Real Language)",
    "category": "Extensibility",
    "description": "Full browser configuration in a real programming language (Python, Lua, JS) with conditionals, loops, imports, and access to browser state and event hooks.",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers"],
    "user_segments": ["Power users", "Developers"],
    "evidence_count": 5
  },
  {
    "id": 80,
    "name": "Versionable/Portable Config",
    "category": "Extensibility",
    "description": "Plain-text configuration files, bookmarks as text format, history exportable to SQLite — everything git-compatible. git diff, git commit your browser config.",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers"],
    "user_segments": ["Power users", "Linux users"],
    "evidence_count": 4
  },
  {
    "id": 81,
    "name": "MCP Server (Browser as MCP Server)",
    "category": "Extensibility",
    "description": "Browser exposes itself as an MCP server, letting Claude, ChatGPT, n8n, and other MCP clients control it. Opera Neon is the only browser with shipped MCP support.",
    "source_reports": ["competitive/ai-browsers", "competitive/agent-infrastructure", "discovery/ai-agent-builders", "market/github-signals"],
    "user_segments": ["Agent developers", "AI tools"],
    "evidence_count": 5
  },
  {
    "id": 82,
    "name": "MCP Client (Consume External MCP)",
    "category": "Extensibility",
    "description": "Browser acts as MCP client consuming external MCP servers (databases, APIs, tools). No browser does this — Opera is server-only.",
    "source_reports": ["competitive/ai-browsers", "competitive/agent-infrastructure"],
    "user_segments": ["Agent developers"],
    "evidence_count": 4
  },
  {
    "id": 83,
    "name": "Public Developer API for AI",
    "category": "Extensibility",
    "description": "Public API exposing browser AI capabilities to extensions and external tools. Zero browsers offer this — the largest shared gap across the category.",
    "source_reports": ["competitive/ai-browsers", "competitive/ai-extensions"],
    "user_segments": ["Developers", "Ecosystem"],
    "evidence_count": 4
  },
  {
    "id": 84,
    "name": "Extension AI Hooks / SDK",
    "category": "Extensibility",
    "description": "Dedicated API namespace (e.g., aether.ai.*) for extensions to invoke browser AI capabilities. No browser exposes AI to extensions via a dedicated API.",
    "source_reports": ["competitive/ai-browsers"],
    "user_segments": ["Extension developers"],
    "evidence_count": 3
  },
  {
    "id": 85,
    "name": "Theming / Visual Customization",
    "category": "Extensibility",
    "description": "Deep visual customization: gradient theming, mod store, custom CSS, switchable interface designs. 92% of users want more personalization.",
    "source_reports": ["competitive/firefox-ecosystem", "competitive/power-user-browsers", "market/browser-trends"],
    "user_segments": ["All users"],
    "evidence_count": 4
  },
  {
    "id": 86,
    "name": "Userscript Support",
    "category": "Extensibility",
    "description": "Native support for injecting JS per-site (Greasemonkey-style). Covers most automation needs even without a full extension API.",
    "source_reports": ["competitive/power-user-browsers"],
    "user_segments": ["Power users", "Developers"],
    "evidence_count": 3
  },
  {
    "id": 87,
    "name": "Structured Config (Beginner to Expert)",
    "category": "Extensibility",
    "description": "Configuration that scales from GUI settings (beginner) through structured config files to full scripting (expert) without requiring a programming language for basics.",
    "source_reports": ["competitive/firefox-ecosystem", "competitive/power-user-browsers"],
    "user_segments": ["All users"],
    "evidence_count": 3
  },
  {
    "id": 88,
    "name": "Plugin/Module System",
    "category": "Extensibility",
    "description": "Modular plugin system for extending browser capabilities beyond WebExtension limitations — deeper integration, native API access, and composable browser behaviors.",
    "source_reports": ["competitive/power-user-browsers", "competitive/ai-browsers"],
    "user_segments": ["Developers"],
    "evidence_count": 3
  },
  {
    "id": 89,
    "name": "Native PKM Integration Layer",
    "category": "Productivity",
    "description": "Protocol/API for bidirectional sync between browser state (open tabs, highlights, annotations) and PKM tools (Obsidian, Logseq, Notion). No browser offers this today.",
    "source_reports": ["discovery/knowledge-workers", "market/extension-ecosystem"],
    "user_segments": ["Researchers", "Writers"],
    "evidence_count": 5
  },
  {
    "id": 90,
    "name": "Contextual Web Clipping",
    "category": "Productivity",
    "description": "Clipping that automatically tags content with project context, the question being researched, and how it relates to other clipped content. Preserves 'why' not just 'what.'",
    "source_reports": ["discovery/knowledge-workers"],
    "user_segments": ["Researchers", "Writers"],
    "evidence_count": 4
  },
  {
    "id": 91,
    "name": "Inline Note-Taking",
    "category": "Productivity",
    "description": "Side-panel note-taking linked to source page and current project, flowing into PKM tools. Arc had this and removed it.",
    "source_reports": ["discovery/knowledge-workers", "competitive/firefox-ecosystem"],
    "user_segments": ["Researchers", "Writers"],
    "evidence_count": 4
  },
  {
    "id": 92,
    "name": "Built-in Email Client",
    "category": "Productivity",
    "description": "Integrated email client reducing context switches. Vivaldi offers this; no other power-user browser does.",
    "source_reports": ["competitive/power-user-browsers"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 2
  },
  {
    "id": 93,
    "name": "Built-in Calendar",
    "category": "Productivity",
    "description": "Integrated calendar accessible from browser sidebar, reducing app switching.",
    "source_reports": ["competitive/power-user-browsers"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 2
  },
  {
    "id": 94,
    "name": "Built-in RSS Reader",
    "category": "Productivity",
    "description": "Native RSS feed reader for following content sources without external apps.",
    "source_reports": ["competitive/power-user-browsers"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 2
  },
  {
    "id": 95,
    "name": "Built-in Notes with Rich Text",
    "category": "Productivity",
    "description": "Native note-taking with rich text editor and drag-and-drop, linked to browser context. Firefox shipped Tab Notes in Firefox 149.",
    "source_reports": ["competitive/firefox-ecosystem", "competitive/power-user-browsers", "market/github-signals"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 3
  },
  {
    "id": 96,
    "name": "Third-Party App Context (Slack/Notion/Gmail)",
    "category": "Productivity",
    "description": "AI that pulls context from SaaS tools (Slack, Notion, Gmail, Calendar) for cross-tool workflows like morning briefings and interview prep. Only Dia offers this.",
    "source_reports": ["competitive/ai-browsers"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 3
  },
  {
    "id": 97,
    "name": "Intelligent Password Manager",
    "category": "Productivity",
    "description": "Password manager that actually works on banking multi-step logins, doesn't pop up during transactions, survives browser updates. $3-4.6B market exists because browsers fail at this.",
    "source_reports": ["discovery/casual-users", "market/extension-ecosystem", "market/browser-trends"],
    "user_segments": ["All users"],
    "evidence_count": 5
  },
  {
    "id": 98,
    "name": "Coupon/Price Comparison",
    "category": "Productivity",
    "description": "Built-in price comparison and coupon finding for shopping. Replaces Honey (19M users) and similar extensions.",
    "source_reports": ["discovery/casual-users"],
    "user_segments": ["Casual users", "Shoppers"],
    "evidence_count": 2
  },
  {
    "id": 99,
    "name": "Focus/Zen Mode",
    "category": "Productivity",
    "description": "Mode that minimizes browser chrome, hides irrelevant tabs, and surfaces only task-relevant content to reduce cognitive load.",
    "source_reports": ["competitive/firefox-ecosystem", "discovery/knowledge-workers"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 3
  },
  {
    "id": 100,
    "name": "Tab-as-Todo / Task Integration",
    "category": "Productivity",
    "description": "Tabs treated as task items with status tracking, due dates, and project linkage — replacing the accidental pattern of using open tabs as to-do lists.",
    "source_reports": ["discovery/knowledge-workers"],
    "user_segments": ["Knowledge workers"],
    "evidence_count": 3
  },
  {
    "id": 101,
    "name": "Enhanced DevTools",
    "category": "Developer Tools",
    "description": "Developer tools with keyboard-first navigation, improved console, network inspection, and performance profiling.",
    "source_reports": ["competitive/power-user-browsers"],
    "user_segments": ["Developers"],
    "evidence_count": 3
  },
  {
    "id": 102,
    "name": "AI-Integrated DevTools",
    "category": "Developer Tools",
    "description": "AI that understands console errors, network requests, and can debug with you. No browser integrates AI into DevTools.",
    "source_reports": ["competitive/ai-extensions", "competitive/agent-infrastructure"],
    "user_segments": ["Developers"],
    "evidence_count": 4
  },
  {
    "id": 103,
    "name": "Console/Network AI Analysis",
    "category": "Developer Tools",
    "description": "AI analysis of console logs, network waterfall, and performance traces to identify issues and suggest fixes.",
    "source_reports": ["competitive/ai-extensions"],
    "user_segments": ["Developers"],
    "evidence_count": 3
  },
  {
    "id": 104,
    "name": "Agent Observability in DevTools",
    "category": "Developer Tools",
    "description": "Structured logging of all agent decisions and actions in enterprise-consumable format (SIEM, EDR). AI browsers are currently 'black boxes' to security tools.",
    "source_reports": ["competitive/agent-infrastructure", "discovery/ai-agent-builders"],
    "user_segments": ["Agent developers", "Enterprise security"],
    "evidence_count": 4
  },
  {
    "id": 105,
    "name": "Chrome DevTools Protocol Compatibility",
    "category": "Developer Tools",
    "description": "CDP compatibility for existing tooling ecosystem (Puppeteer, Playwright, Selenium) while providing agent-native alternatives.",
    "source_reports": ["competitive/agent-infrastructure"],
    "user_segments": ["Developers", "Automation"],
    "evidence_count": 3
  },
  {
    "id": 106,
    "name": "WebDriver BiDi Support",
    "category": "Developer Tools",
    "description": "Support for WebDriver BiDi protocol for cross-browser automation standardization.",
    "source_reports": ["competitive/agent-infrastructure"],
    "user_segments": ["Developers", "Testing"],
    "evidence_count": 2
  },
  {
    "id": 107,
    "name": "Memory-Efficient Tab Management",
    "category": "Performance",
    "description": "Memory usage competitive with Firefox/Chrome. Qutebrowser users report 100+ GiB RAM with few dozen tabs. Explicit memory management controls.",
    "source_reports": ["discovery/power-users", "discovery/casual-users", "discovery/knowledge-workers", "competitive/power-user-browsers"],
    "user_segments": ["All users"],
    "evidence_count": 6
  },
  {
    "id": 108,
    "name": "Tab Unloading/Hibernation",
    "category": "Performance",
    "description": "Intelligent tab suspension that preserves state but frees memory. Edge dropped from 3GB to 500MB with OneTab. Instant restore when needed.",
    "source_reports": ["discovery/knowledge-workers", "discovery/casual-users", "competitive/power-user-browsers"],
    "user_segments": ["Power users", "Resource-limited devices"],
    "evidence_count": 5
  },
  {
    "id": 109,
    "name": "Self-Healing Performance",
    "category": "Performance",
    "description": "Browser that proactively manages memory, prunes stale cache, and warns about resource-heavy extensions — without manual intervention.",
    "source_reports": ["discovery/casual-users"],
    "user_segments": ["Casual users"],
    "evidence_count": 3
  },
  {
    "id": 110,
    "name": "Fast Startup",
    "category": "Performance",
    "description": "Sub-second browser launch time with instant session restore.",
    "source_reports": ["discovery/casual-users"],
    "user_segments": ["All users"],
    "evidence_count": 2
  },
  {
    "id": 111,
    "name": "Efficient Rendering Engine",
    "category": "Performance",
    "description": "Current, well-maintained rendering engine that handles all modern web apps (banking, video, SPAs) without fallback to another browser.",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers"],
    "user_segments": ["All users"],
    "evidence_count": 4
  },
  {
    "id": 112,
    "name": "Background Process Management",
    "category": "Performance",
    "description": "Automatic management of background processes, preventing the CPU/memory creep that degrades performance over time.",
    "source_reports": ["discovery/casual-users"],
    "user_segments": ["All users"],
    "evidence_count": 3
  },
  {
    "id": 113,
    "name": "Current/Modern Web Engine",
    "category": "Performance",
    "description": "Rendering engine that receives security updates within days of upstream disclosure. QtWebEngine's 6-month lag and distro packaging delays are unacceptable.",
    "source_reports": ["discovery/power-users", "competitive/privacy-browsers"],
    "user_segments": ["All users"],
    "evidence_count": 4
  },
  {
    "id": 114,
    "name": "Cached Data Auto-Pruning",
    "category": "Performance",
    "description": "Automatic pruning of stale cached data that accumulates to gigabytes over time, degrading performance.",
    "source_reports": ["discovery/casual-users"],
    "user_segments": ["Casual users"],
    "evidence_count": 2
  },
  {
    "id": 115,
    "name": "Parallel Browser Sessions at Scale",
    "category": "Performance",
    "description": "Ability to spin up 1,000+ isolated browser sessions on-demand with sub-second startup for agent workloads. Local deployment limited to ~10 concurrent agents.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure"],
    "user_segments": ["Agent developers"],
    "evidence_count": 3
  },
  {
    "id": 116,
    "name": "Cross-Device Sync",
    "category": "Sync & Portability",
    "description": "Seamless sync of tabs, bookmarks, history, passwords, and settings across devices. Open a tab on phone, continue on laptop.",
    "source_reports": ["discovery/casual-users", "discovery/knowledge-workers", "competitive/ai-browsers", "market/browser-trends"],
    "user_segments": ["All users"],
    "evidence_count": 6
  },
  {
    "id": 117,
    "name": "Profile Export/Import",
    "category": "Sync & Portability",
    "description": "Complete profile export/import including passwords, history, extensions, bookmarks, open tabs, saved payment methods.",
    "source_reports": ["discovery/casual-users", "market/browser-trends"],
    "user_segments": ["Switching users"],
    "evidence_count": 4
  },
  {
    "id": 118,
    "name": "Frictionless Migration from Chrome",
    "category": "Sync & Portability",
    "description": "One-click import of everything from Chrome. The migration experience is make-or-break. 34% of non-switchers stay due to default preference.",
    "source_reports": ["discovery/casual-users", "market/browser-trends"],
    "user_segments": ["New users"],
    "evidence_count": 4
  },
  {
    "id": 119,
    "name": "Self-Hosted Sync Server",
    "category": "Sync & Portability",
    "description": "Option to bring your own sync server or self-host. LibreWolf disables Firefox Sync by default for privacy.",
    "source_reports": ["discovery/power-users", "discovery/privacy-advocates"],
    "user_segments": ["Privacy users"],
    "evidence_count": 3
  },
  {
    "id": 120,
    "name": "AI Chat Sync Across Devices",
    "category": "Sync & Portability",
    "description": "Sync AI conversation history across devices. Brave lacks this (GitHub #47308). Privacy-preserving approach needed.",
    "source_reports": ["competitive/ai-browsers"],
    "user_segments": ["All AI users"],
    "evidence_count": 2
  },
  {
    "id": 121,
    "name": "Config Export/Import",
    "category": "Sync & Portability",
    "description": "Export/import of keymaps, preferences, and customizations in portable format. Zen keyboard shortcuts not synced across profiles.",
    "source_reports": ["discovery/power-users", "competitive/firefox-ecosystem"],
    "user_segments": ["Power users"],
    "evidence_count": 3
  },
  {
    "id": 122,
    "name": "Portable Identity Layer",
    "category": "Sync & Portability",
    "description": "Cross-platform identity that isn't locked to one vendor (not Google account, Apple ID, or Microsoft account). Works everywhere, migrates from any browser.",
    "source_reports": ["discovery/casual-users", "market/browser-trends"],
    "user_segments": ["All users"],
    "evidence_count": 3
  },
  {
    "id": 123,
    "name": "Screen Reader Integration",
    "category": "Accessibility",
    "description": "Full screen reader compatibility with properly exposed accessibility tree.",
    "source_reports": ["market/extension-ecosystem"],
    "user_segments": ["Visually impaired users"],
    "evidence_count": 2
  },
  {
    "id": 124,
    "name": "Always-On Accessibility Tree",
    "category": "Accessibility",
    "description": "Accessibility tree built by default (Chromium only builds it when a screen reader is present — 9 skeleton elements without one). Critical for both accessibility and agent interaction.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure"],
    "user_segments": ["Agent developers", "Accessibility users"],
    "evidence_count": 4
  },
  {
    "id": 125,
    "name": "High Contrast/Motion Preferences",
    "category": "Accessibility",
    "description": "Native support for high contrast modes and reduced motion preferences with per-site memory.",
    "source_reports": ["market/extension-ecosystem"],
    "user_segments": ["Accessibility users"],
    "evidence_count": 2
  },
  {
    "id": 126,
    "name": "Keyboard-Only Full Navigation",
    "category": "Accessibility",
    "description": "Every browser surface navigable via keyboard only: settings, downloads, history, devtools, extension pages. Medical need for RSI/arthritis sufferers.",
    "source_reports": ["discovery/power-users", "competitive/power-user-browsers", "competitive/firefox-ecosystem"],
    "user_segments": ["Accessibility users", "RSI sufferers", "Power users"],
    "evidence_count": 5
  },
  {
    "id": 127,
    "name": "ADHD-Friendly Tab Management",
    "category": "Accessibility",
    "description": "Tab management designed for neurodivergent users — visual simplification, auto-organization, reduced cognitive overhead. MonoTab targets this specifically.",
    "source_reports": ["discovery/knowledge-workers"],
    "user_segments": ["ADHD users"],
    "evidence_count": 2
  },
  {
    "id": 128,
    "name": "Shared Browsing Sessions",
    "category": "Social & Collaboration",
    "description": "Multi-user shared browsing sessions for pair programming, collaborative research, or guided browsing.",
    "source_reports": ["competitive/power-user-browsers"],
    "user_segments": ["Teams", "Pair programming"],
    "evidence_count": 2
  },
  {
    "id": 129,
    "name": "Web Annotations",
    "category": "Social & Collaboration",
    "description": "Highlight, annotate, and connect insights across web pages. Annotations linked to source and project context.",
    "source_reports": ["discovery/knowledge-workers", "competitive/power-user-browsers"],
    "user_segments": ["Researchers", "Teams"],
    "evidence_count": 3
  },
  {
    "id": 130,
    "name": "Collaborative Workspaces",
    "category": "Social & Collaboration",
    "description": "Shared workspaces where team members can see and interact with the same tab/context set. Edge Workspaces hints at this.",
    "source_reports": ["competitive/power-user-browsers"],
    "user_segments": ["Teams"],
    "evidence_count": 2
  },
  {
    "id": 131,
    "name": "AI Agent + Human Collaboration",
    "category": "Social & Collaboration",
    "description": "Browser designed for AI agents operating alongside human users — pair browsing, shared context, handoff between human and agent control.",
    "source_reports": ["competitive/power-user-browsers", "competitive/agent-infrastructure"],
    "user_segments": ["Developers", "Teams"],
    "evidence_count": 3
  },
  {
    "id": 132,
    "name": "Window Manager Integration (Tiling WM)",
    "category": "Core Browsing",
    "description": "Browser that respects tiling WM layouts (i3/sway/hyprland), exposes window management to WM, opens pop-ups as WM-managed windows, never steals focus.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Linux users"],
    "evidence_count": 3
  },
  {
    "id": 133,
    "name": "CLI Profile Launch",
    "category": "Core Browsing",
    "description": "First-class CLI support for launching isolated browser instances with -P profilename, distinct WM_CLASS values, without Flatpak friction.",
    "source_reports": ["discovery/power-users"],
    "user_segments": ["Linux users", "Developers"],
    "evidence_count": 3
  },
  {
    "id": 134,
    "name": "Cross-Platform with Full Parity",
    "category": "Core Browsing",
    "description": "Windows, macOS, Linux, Android, iOS with full feature parity including AI. Dia/SigmaOS are macOS-only, severely limiting market.",
    "source_reports": ["competitive/ai-browsers", "market/browser-trends"],
    "user_segments": ["All users"],
    "evidence_count": 5
  },
  {
    "id": 135,
    "name": "Linux First-Class Support",
    "category": "Core Browsing",
    "description": "Linux as first-class platform with timely security updates regardless of distro packaging, tiling WM integration, and CLI-first workflows.",
    "source_reports": ["discovery/power-users", "competitive/ai-extensions"],
    "user_segments": ["Linux users", "Developers"],
    "evidence_count": 4
  },
  {
    "id": 136,
    "name": "Mobile Privacy Parity",
    "category": "Privacy & Security",
    "description": "Mobile browser with desktop-grade privacy features: containers, anti-fingerprinting, integrated VPN, local AI, no telemetry. iOS restricts all browsers to WebKit.",
    "source_reports": ["discovery/privacy-advocates"],
    "user_segments": ["Mobile users"],
    "evidence_count": 3
  },
  {
    "id": 137,
    "name": "Enterprise SSO/Team Management",
    "category": "Extensibility",
    "description": "Enterprise tier with SSO, team management, centralized policy, and audit trails. No AI browser offers this as of April 2026.",
    "source_reports": ["competitive/ai-browsers", "competitive/agent-infrastructure"],
    "user_segments": ["Enterprise"],
    "evidence_count": 3
  },
  {
    "id": 138,
    "name": "Transparent Rate Limits/SLAs",
    "category": "AI & Agents",
    "description": "Published rate limits, SLAs, and uptime metrics for AI features. Universal opacity across all current AI browsers creates trust deficit.",
    "source_reports": ["competitive/ai-browsers"],
    "user_segments": ["Developers", "Enterprise"],
    "evidence_count": 3
  },
  {
    "id": 139,
    "name": "Agent-Optimized Rendering Mode",
    "category": "AI & Agents",
    "description": "Dual rendering: 'agent mode' producing optimized semantic snapshots vs 'human mode' with full visual rendering, switchable per-tab.",
    "source_reports": ["competitive/agent-infrastructure"],
    "user_segments": ["Agent developers"],
    "evidence_count": 3
  },
  {
    "id": 140,
    "name": "WebMCP / Structured Agent Protocol",
    "category": "AI & Agents",
    "description": "Support for Google's emerging WebMCP protocol for structured AI agent interactions with websites. Chrome Canary shipped early preview Feb 2026.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure"],
    "user_segments": ["Agent developers", "Web developers"],
    "evidence_count": 3
  },
  {
    "id": 141,
    "name": "Anti-Bot Stealth (Real Browser)",
    "category": "AI & Agents",
    "description": "Browser that is inherently undetectable for automation because it IS a real browser with real rendering and natural fingerprints — not a headless browser faking it. CDP detection is the #1 anti-bot signal.",
    "source_reports": ["discovery/ai-agent-builders", "competitive/agent-infrastructure"],
    "user_segments": ["Agent developers", "Scrapers"],
    "evidence_count": 4
  },
  {
    "id": 142,
    "name": "Minimal Tool Surface for Agents",
    "category": "AI & Agents",
    "description": "Workflow-aware tool surface exposing only relevant tools per task phase. Playwright MCP's 26 tools confuse LLMs; 8 core tools cover 80% of automation.",
    "source_reports": ["discovery/ai-agent-builders"],
    "user_segments": ["Agent developers"],
    "evidence_count": 2
  }
]
```

---

## Category Summary

| Category | Count | Top Signals |
|----------|-------|-------------|
| **AI & Agents** | 28 | Local AI (9 reports), Agent automation (8), Prompt injection defense (7), Page summarization (7) |
| **Workspace & Organization** | 12 | Project-first workspaces (10 reports), Vertical tabs (7), Tab lifecycle (6), Session persistence (6) |
| **Privacy & Security** | 17 | Sandboxed profiles (7), Zero telemetry (6), Fingerprint isolation (6), Per-site controls (5) |
| **Keyboard & Input** | 12 | Native vim bindings (8 reports), Keyboard chrome control (6), Shortcut customization (5), Command palette (5) |
| **Core Browsing** | 12 | Native ad blocking (8 reports), Cross-platform (5), Semantic history (5), Vertical tabs (7) |
| **Extensibility** | 12 | WebExtension support (7 reports), Config-as-code (5), MCP server (5), Developer AI API (4) |
| **Productivity** | 12 | Password manager (5 reports), PKM integration (5), Web clipping (4), Inline notes (4) |
| **Performance** | 9 | Memory efficiency (6 reports), Tab unloading (5), Modern engine (4), Rendering (4) |
| **Sync & Portability** | 7 | Cross-device sync (6 reports), Migration (4), Profile export (4) |
| **Developer Tools** | 6 | AI devtools (4 reports), Agent observability (4), CDP compatibility (3) |
| **Accessibility** | 5 | Keyboard-only navigation (5 reports), Always-on a11y tree (4) |
| **Social & Collaboration** | 4 | Annotations (3 reports), Agent-human collab (3) |

---

## Evidence Heat Map (Reports Mentioning Each Category)

| Category | discovery | competitive | market | Total Reports |
|----------|-----------|-------------|--------|---------------|
| AI & Agents | 4/5 | 5/6 | 4/4 | 13/15 |
| Workspace & Org | 3/5 | 3/6 | 3/4 | 9/15 |
| Privacy & Security | 2/5 | 3/6 | 2/4 | 7/15 |
| Keyboard & Input | 2/5 | 3/6 | 3/4 | 8/15 |
| Core Browsing | 3/5 | 2/6 | 3/4 | 8/15 |
| Extensibility | 2/5 | 4/6 | 2/4 | 8/15 |
| Productivity | 2/5 | 2/6 | 2/4 | 6/15 |
| Performance | 3/5 | 2/6 | 1/4 | 6/15 |
| Sync & Portability | 2/5 | 1/6 | 1/4 | 4/15 |
| Developer Tools | 1/5 | 2/6 | 0/4 | 3/15 |
| Accessibility | 1/5 | 1/6 | 1/4 | 3/15 |
| Social & Collab | 1/5 | 2/6 | 0/4 | 3/15 |

---

## Top 20 Feature Candidates by Evidence Count

| Rank | Feature | Evidence | Category |
|------|---------|----------|----------|
| 1 | Project-First Workspaces | 10 | Workspace & Organization |
| 2 | Local/On-Device AI Inference | 9 | AI & Agents |
| 3 | Native Ad/Tracker Blocking | 8 | Core Browsing |
| 4 | Native Vim/Modal Keybindings | 8 | Keyboard & Input |
| 5 | LLM Sidebar Chat | 8 | AI & Agents |
| 6 | Agent Automation (Multi-Step) | 8 | AI & Agents |
| 7 | WebExtension API Support | 7 | Extensibility |
| 8 | Vertical Tab Sidebar | 7 | Workspace & Organization |
| 9 | AI Page Summarization | 7 | AI & Agents |
| 10 | Prompt Injection Defense | 7 | AI & Agents |
| 11 | Sandboxed Identity Profiles | 7 | Privacy & Security |
| 12 | Memory-Efficient Tab Management | 6 | Performance |
| 13 | Cross-Device Sync | 6 | Sync & Portability |
| 14 | Per-Context Fingerprint Isolation | 6 | Privacy & Security |
| 15 | Zero Telemetry Architecture | 6 | Privacy & Security |
| 16 | Keyboard Control Over Browser Chrome | 6 | Keyboard & Input |
| 17 | Intelligent Tab Lifecycle | 6 | Workspace & Organization |
| 18 | Per-Workspace Session Persistence | 6 | Workspace & Organization |
| 19 | Research-Aware AI Assistant | 6 | AI & Agents |
| 20 | Cross-Platform Full Parity | 5 | Core Browsing |

---

## Validation Notes

Per the consistency audit (`validation/consistency-audit.md`):
- **No contradictions** found across 16 reports
- Key shared-source dependencies flagged: 52% AI data collection (Incogni), 81% switching willingness (Shift), 19.7% agent reliability (CIO Influence)
- Low-confidence claims: ~660K keyboard users (estimate), 25% tab crash rate (single source), AI browsers 60% YoY growth (blog citing Statista)
- All 10 cross-reference points are CONSISTENT or MINOR_DISCREPANCY
