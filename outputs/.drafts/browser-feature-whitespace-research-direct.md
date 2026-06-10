# Direct Research Notes: Browser Feature Whitespace 2026

## Search Terms Used
1. Direct URL fetches: brave.com/leo, vivaldi.com/features, zen-browser.app, arc.net, helperbird.com/features, mullvad.net/browser, torproject.org, nyxt-browser.com
2. Direct URL fetches: Brave BYOM support article, Brave multi-tab context, Brave AI browsing, Firefox containers wiki, Vivaldi command chains, Vivaldi workspaces, Brave privacy features, Opera Aria, Chrome AI built-in APIs
3. Direct URL fetches: Chrome built-in AI APIs developer docs, W3C cognitive accessibility, librewolf.net, sigmaos.com, floorp.app, Firefox multi-account containers support
4. Web search attempted (Exa, Perplexity, Gemini) — all rate-limited/unconfigured. Research based on direct URL fetches.

## T1: AI-Native Features Evidence

### What ships today (mid-2026):
- **Brave Leo**: Sidebar chatbot, page summarization, BYOM (local Ollama + remote APIs), Multi-Tab Context, AI Browsing (agentic, Nightly only), Skills (custom prompt templates), chat history, memory/personalization. Source: brave.com/leo, support.brave.app
- **Chrome/Gemini**: Built-in AI APIs (Translator, Language Detector, Summarizer stable in Chrome 138; Writer, Rewriter, Prompt API, Proofreader in dev/origin trial). Gemini Nano on-device. WebMCP early preview. DevTools AI assistance. Source: developer.chrome.com/docs/ai
- **Opera Aria**: Right-side AI assistant, page context awareness, image generation, file analysis, YouTube video translation, no sign-in required. Source: opera.com/features/aria
- **Edge Copilot**: Sidebar AI, page summarization, writing assistance, image generation. (Microsoft Copilot integration)
- **Arc**: Had Max (AI tab organization, 5-second previews, tidying). Arc pivoted to a "new browser" per 2024 announcement; Max features were part of Arc's innovation but company direction changed.
- **SigmaOS**: Airis AI assistant (GPT-4o based), "Look it up", Interactive Summaries. Source: sigmaos.com
- **Vivaldi**: No native AI features. Explicitly privacy-focused, no AI assistant. Source: vivaldi.com/features
- **Firefox**: No native AI chatbot. Some experimental AI features in Nightly (AI sidebar experiments). No stable AI features.
- **Zen**: No AI features listed on main site. Source: zen-browser.app
- **Nyxt**: No AI features. Lisp REPL for scripting. Source: nyxt-browser.com

### Whitespace identified (AI):
1. **No browser offers MCP as a first-class protocol** — Chrome has WebMCP in early preview for web pages, but no browser exposes MCP as a native browser-level integration for connecting to arbitrary AI tool servers
2. **No browser offers agent tool-use with granular permission systems** — Brave AI Browsing is closest but Nightly-only, runs in isolated profile, no granular per-action permission system
3. **No browser offers cross-session AI context** — Multi-tab context exists (Brave) but no browser maintains AI context across sessions/days
4. **No browser offers local model orchestration** — Brave BYOM connects to ONE local model at a time; no browser routes between multiple local models based on task
5. **No browser offers semantic search across browsing history** — All browsers have keyword-based history search only
6. **No browser offers AI-driven automated workflow recording with judgment** — Brave AI Browsing can execute tasks but doesn't record/replay user workflows with AI judgment
7. **No browser offers real-time content filtering by semantic meaning** — Ad blockers use filter lists (pattern matching), not semantic understanding

## T2: Power-User Features Evidence

### What ships today:
- **Vivaldi**: Command Chains (sequence of commands triggered by shortcut/gesture), Quick Commands (fuzzy command palette), extensive keyboard shortcuts, mouse gestures, spatial navigation, tab stacks (2-level), workspaces, session management (save/restore), tab tiling (split view), web panels, editable toolbars, user profiles. Source: vivaldi.com/features
- **Nyxt**: Full keyboard control, link hinting, fuzzy search for everything, multi-tab search, built-in REPL (Lisp), tree-based history, clipboard history, customizable autofills, extensible via Common Lisp. Source: nyxt-browser.com
- **qutebrowser**: Vim-like keyboard interface, minimal, Python-based configuration
- **Tridactyl** (Firefox extension): Vim-mode for Firefox, command-line interface, limited by WebExtension API. Source: tridactyl.xyz
- **Vimium** (Chrome extension): Vim-like navigation, link hinting, limited to page content
- **Arc**: Spaces (workspace concept), Easels, split view, command bar. Company pivoted 2024.
- **Zen**: Firefox fork with vertical tabs, workspace organization, compact mode. Source: zen-browser.app
- **Floorp**: Firefox fork, tree-style tabs, vertical tabs, workspaces. Source: floorp.app

### Whitespace identified (Power-User):
1. **No browser has true modal vim editing across ALL chrome** — Tridactyl/Vimium only work on page content; browser chrome (address bar, settings, devtools) has no vim mode
2. **No browser has scriptable pipelines** — Vivaldi Command Chains are sequential commands but no branching/conditional logic, no data transformation between steps
3. **No browser has session branching/merging** — Vivaldi saves/restores sessions but no git-like branch/merge/diff of sessions
4. **No browser has first-class programmable tab groups** — Tab groups exist but cannot be scripted as objects with properties/methods
5. **No browser has a native CLI for browser control** — Chrome DevTools Protocol exists but is a debug protocol, not a user-facing CLI
6. **No browser has UNIX pipe integration** — No browser can receive stdin or output to stdout
7. **No browser has workspace-scoped bookmarks** — Bookmarks are global in every browser
8. **No browser has built-in macro recorder with conditional logic** — Vivaldi Command Chains lack conditionals; no browser records user actions into replayable macros

## T3: Privacy Architecture Evidence

### What ships today:
- **Brave**: Shields (ad/tracker blocking), fingerprint randomization, bounce tracking protection (debouncing, unlinkable bouncing), query parameter stripping, DOM/network state partitioning, Tor integration (private windows), client-side encrypted sync, P3A (privacy-preserving analytics), social blocking, AMP de-linking, reduced referrer. Source: brave.com/privacy-features
- **Tor Browser**: Full Tor network routing, uniform fingerprint (all users look the same), no persistent state, letterboxing
- **Mullvad Browser**: Tor Project-based (same anti-fingerprint as Tor), designed for VPN use instead of Tor network, uBlock Origin included, no telemetry, cookie isolation. Source: mullvad.net/browser
- **Firefox Multi-Account Containers**: Cookie/storage isolation per container, site assignment, VPN integration per container (with Mozilla VPN). Cookie isolation only — not full network isolation. Source: support.mozilla.org/kb/containers
- **LibreWolf**: Hardened Firefox, no telemetry, uBlock Origin included, anti-fingerprint settings. Source: librewolf.net
- **Chrome Privacy Sandbox**: Topics API, Attribution Reporting (replacing third-party cookies with "privacy-preserving" alternatives)
- **Safari ITP**: Intelligent Tracking Prevention, cross-site tracking limits

### Whitespace identified (Privacy):
1. **No browser has per-tab network identity** — Firefox containers isolate cookies but NOT network routing; Tor uses one circuit for all tabs; Mullvad uses one VPN for all tabs; no browser assigns different proxy/VPN/Tor circuits per individual tab
2. **No browser has auditable data flow visualization** — No browser shows users exactly what data leaves, to where, in real time
3. **No browser has adaptive per-site anti-fingerprinting** — Brave/Mullvad/Tor use one-size-fits-all fingerprint protection; no browser adjusts fingerprint defenses based on site threat level
4. **No browser has zero-knowledge sync without vendor account** — Brave sync is E2E encrypted but requires device chain; Firefox sync requires Mozilla account; no browser offers truly vendorless ZK sync
5. **No browser has supply chain verification for extensions** — No browser cryptographically verifies extension code hasn't been tampered with post-review
6. **No browser has automatic threat model selection** — No browser offers presets like "casual/journalist/activist" that adjust all privacy settings at once
7. **No browser has hardware-backed key isolation per browsing context** — No browser uses TPM/Secure Enclave to isolate keys between profiles/containers
8. **No browser has transparent telemetry with user-auditable logs** — Brave's P3A is closest but users can't inspect individual telemetry payloads before they send

## T4: Neurodivergent Accessibility Evidence

### What ships today:
- **Helperbird** (extension): 58 features including dyslexia fonts (OpenDyslexic, Lexend), reading ruler, dyslexia ruler, focus ruler, color overlays (24 colors), paragraph borders, line/letter/word spacing, text-to-speech (109 languages), immersive reader, reading mode, auto-scroll, speed reading, high contrast, hide images/GIFs, mute auto-playing videos, accessibility profiles (dyslexia, ADHD, low vision, Section 508), voice typing. Source: helperbird.com/features
- **Browser native features**: Reader mode (Firefox, Vivaldi, Safari, Edge), dark mode, zoom, reduced motion (CSS prefers-reduced-motion support), minimum font size settings
- **W3C WCAG 2.2**: Guidelines 1.3 (Adaptable), 2.2 (Enough Time), 3.2 (Predictable), 3.3 (Input Assistance). Supplemental guidance for cognitive accessibility exists but is NOT required by standards. Source: w3.org/WAI/cognitive
- **W3C COGA Task Force**: Working on "Making Content Usable for People with Cognitive and Learning Disabilities" — guidance for web AUTHORS, not browser implementations

### Whitespace identified (Neurodivergent):
1. **No browser has cognitive load indicators** — No browser signals when a page is complex/overwhelming (animation count, element density, color intensity)
2. **No browser has focus scaffolding** — Progressive disclosure of page content, guided reading modes that reveal content section by section
3. **No browser has ADHD-specific tab management** — Auto-archive after inactivity, gentle time-on-site nudges, tab count limits with soft warnings
4. **No browser has sensory profiles** — Save and switch complete sensory preference sets (color temperature, animation settings, sound, contrast, font) per context
5. **No browser has executive function support** — Browser-native timers, break reminders (Pomodoro), session goals, task anchoring
6. **No browser has predictable UI guarantees** — CLS (Cumulative Layout Shift) is a web vitals metric but no browser actively prevents/freezes layout shifts for users who need stability
7. **No browser has dyslexia-optimized rendering** — Helperbird offers font swaps and rulers, but no browser engine does syllable highlighting, phonetic aids, or morpheme-aware rendering
8. **No browser has task-anchored browsing** — Tie browser state to an external task/project, minimize all non-task content
9. **No browser has autism-friendly defaults** — Reduced notification pressure, explicit link destinations, consistent navigation, no surprise modals

## Cross-Domain Intersections

- AI + Neurodivergent: AI could manage cognitive load, auto-simplify pages, provide focus scaffolding — no browser combines these
- Privacy + Power-User: Scriptable privacy contexts (programmatic container management) — Firefox containers exist but aren't scriptable
- AI + Privacy: Local-only AI with no data exfiltration AND useful context — Brave BYOM is closest but limited
- Power-User + Neurodivergent: Keyboard-first accessibility for users with motor differences AND cognitive needs — no browser addresses this intersection
