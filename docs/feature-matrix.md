# Aether Browser — Feature Matrix

> **Date**: 2026-04-08
> **Status**: Definitive — compiled from 5 research waves (16 reports), executive council scoring, and validation audits
> **Basis**: 142 feature candidates → 50 council-scored → 30 detailed cards below

---

## 1. Executive Summary

**Product Thesis**: Aether is an AI-native, keyboard-first browser built on Gecko that resolves the market's defining tension — users want AI assistance but don't trust it. By combining project-first workspaces, native vim/modal keybindings, and local-first AI (BYOM → on-device inference), Aether serves the power users, knowledge workers, and privacy advocates abandoned by Arc's death, Chrome's surveillance model, and Firefox's stagnation.

**Market context**: Chrome holds 65-71% share but 81% of consumers would switch for a better fit (Shift 2026). Brave proves privacy-first can scale (100M MAU, 34% YoY). Arc's $610M acquisition-then-death left 500K+ workspace-oriented users stranded. No browser combines deep keyboard control, project-based organization, and trustworthy AI.

### Top 20 Features by RICE Score

| Rank | Feature | Category | RICE | MoSCoW | Description |
|------|---------|----------|------|--------|-------------|
| 1 | Native Ad/Tracker Blocking | Core Browsing | 12.08 | Must | Built-in tracker/ad blocking via Gecko WebRequest API; beats MV3-limited extensions |
| 2 | Notification Spam Blocking | Core Browsing | 10.76 | Should | Flip default notification permission to deny; near-zero effort, universal protection |
| 3 | Vertical Tab Sidebar | Workspace | 7.45 | Must | Sidebar tab list replacing horizontal strip; visual scaffold for workspace UI |
| 4 | Frictionless Migration from Chrome | Sync | 7.00 | Must | One-click import of bookmarks, passwords, history from Chrome (65-71% market share) |
| 5 | WebExtension API Support | Extensibility | 6.65 | Must | Full Gecko-native WebExtension runtime; compat testing across top 200 extensions |
| 6 | AI Page Summarization | AI & Agents | 6.03 | Should | One-click article/PDF/YouTube summary; entry drug for AI engagement |
| 7 | Tab Unloading/Hibernation | Performance | 5.41 | Should | Automatic tab suspension via Gecko's `browser.tabs.unloadTab()`; invisible, automatic |
| 8 | Zero Telemetry Architecture | Privacy | 5.33 | Must | Verifiable zero telemetry by design; opt-in crash reporting only |
| 9 | Tab Graveyard / Recovery | Workspace | 4.87 | Should | Searchable, state-preserving closed-tab recovery; eliminates tab-hoarding fear |
| 10 | Profile Export/Import | Sync | 4.85 | Should | Full profile portability; users need an exit door to enter willingly |
| 11 | Native Command Palette / Ex-Mode | Keyboard | 4.83 | Should | Built-in `:command` line with tab completion, fuzzy search, full browser access |
| 12 | Memory-Efficient Tab Mgmt | Performance | 4.72 | Should | Workspace-aware memory management for 100+ tab workflows |
| 13 | LLM Sidebar Chat | AI & Agents | 4.56 | Should | Contextual AI chat scoped to current workspace; differentiated by local inference |
| 14 | Project-First Workspaces | Workspace | 4.53 | Should | Project-scoped tabs, history, cookies, state; Aether's identity feature |
| 15 | Versionable/Portable Config | Extensibility | 4.30 | Should | Dotfiles-culture config; version-control your browser setup |
| 16 | Native Vim/Modal Keybindings | Keyboard | 4.26 | Should | Browser-native modal editing (Normal/Insert/Command); impossible via extensions |
| 17 | Theming / Visual Customization | Extensibility | 4.23 | Should | Full visual customization; 92% want personalization (Shift 2026) |
| 18 | Full Keyboard Shortcut Customization | Keyboard | 4.21 | Should | Complete shortcut remapping with conflict detection; Firefox took 25 years |
| 19 | Keyboard-Only Full Navigation | Accessibility | 4.15 | Should | Every chrome surface keyboard-navigable; WCAG compliance |
| 20 | Per-Workspace Session Persistence | Workspace | 3.97 | Should | Scroll positions, form data, auth state preserved per workspace |

---

## 2. Feature Cards (Top 30)

### 1. Native Ad/Tracker Blocking

- **Category**: Core Browsing
- **MoSCoW**: Must
- **Kano**: Must-be
- **RICE Score**: 12.08 (R:10 I:4-5 C:0.9-1.0 E:3-4)
- **JTBD**: When I browse the web, I want ads and trackers blocked by default, so I can read content without distraction, surveillance, or malware risk.
- **User Segments**: All users (900M+ ad-block users globally)
- **Competitive Landscape**: Brave has native Shields (best-in-class). Chrome MV3 kills extension-based blocking. Firefox has Enhanced Tracking Protection but weaker ad blocking. Zen inherits Firefox's baseline. No browser except Brave blocks at engine level by default.
- **Technical Complexity**: Medium — Gecko's WebRequest API provides the foundation; need to wire into default profile, maintain filter lists, handle breakage reporting.
- **Dependencies**: None (foundation-level)
- **Key Evidence**: "MV3 is killing extension-based blocking, making native blocking the future" (Council). 900M+ users have ad blockers installed. uBlock Origin losing Chrome support is a concrete migration trigger.
- **Council Notes**: Unanimous Must (5/5). Only DA dissent on Impact (3 vs 4-5). Council overruled: MV3 makes this existential, not incremental.

### 2. Notification Spam Blocking

- **Category**: Core Browsing
- **MoSCoW**: Should
- **Kano**: Must-be
- **RICE Score**: 10.76 (R:7-9 I:1-3 C:0.8-0.9 E:1-2)
- **JTBD**: When I visit a website, I want notification prompts blocked by default, so I'm never tricked into enabling spam.
- **User Segments**: All users, especially non-technical users
- **Competitive Landscape**: Firefox already blocks notification prompts by default. Likely inherited from Gecko. Brave blocks by default. Chrome still allows prompts.
- **Technical Complexity**: Low — flip default permission to deny, add whitelist UI. Effort ~1.
- **Dependencies**: None
- **Key Evidence**: 300% increase in malicious browser push notifications in 2025 (Norton/Gen Threat Report). Users unknowingly grant permissions and can't revoke them.
- **Council Notes**: RICE inflated by TA's Effort=1, which is the correct signal — near-zero cost, do immediately. Not a differentiator but a moral protection feature.

### 3. Vertical Tab Sidebar

- **Category**: Workspace
- **MoSCoW**: Must
- **Kano**: Must-be
- **RICE Score**: 7.45 (R:7-9 I:2-4 C:0.8-1.0 E:3-6)
- **JTBD**: When I have many tabs open, I want to see readable titles in a sidebar, so I can find and manage my work without squinting at compressed favicons.
- **User Segments**: All users, knowledge workers, power users
- **Competitive Landscape**: Vivaldi (5/5 tab management), Zen (native vertical tabs), Arc (had it, now dead), Edge (added 2021), Chrome (added 2025). Post-2025 table stakes.
- **Technical Complexity**: Medium — custom chrome UI, but well-understood pattern. SA flags security audit of sidebar rendering.
- **Dependencies**: None (visual scaffold for workspace UI)
- **Key Evidence**: Chrome took 17 years to ship this. Every serious competitor has it. Visual foundation for the workspace model.
- **Council Notes**: 4 Must votes. Low controversy. SA's higher effort (6) reflects security audit, not engineering difficulty.

### 4. Frictionless Migration from Chrome

- **Category**: Sync
- **MoSCoW**: Must
- **Kano**: Must-be
- **RICE Score**: 7.00 (R:~9 I:~5 C:~0.9 E:~6)
- **JTBD**: When I decide to try Aether, I want my bookmarks, passwords, and history imported in one click, so I don't have to rebuild my digital life from scratch.
- **User Segments**: All new users (65-71% come from Chrome)
- **Competitive Landscape**: Every browser supports Chrome import. Table stakes. Firefox/Zen/Brave all do this.
- **Technical Complexity**: Medium — Gecko provides import infrastructure; needs Chrome profile parsing and extension-state migration.
- **Dependencies**: None
- **Key Evidence**: Only 2 council members scored (PS, UA) — both rated Must. "Absence from other members' lists likely reflects it was considered obvious infrastructure."
- **Council Notes**: Elevated to Must despite only 2 scorers. No counter-argument exists.

### 5. WebExtension API Support

- **Category**: Extensibility
- **MoSCoW**: Must
- **Kano**: Must-be
- **RICE Score**: 6.65 (R:9-10 I:3-5 C:0.6-1.0 E:4-7)
- **JTBD**: When I switch to Aether, I want my password manager and ad blocker to work, so I'm not giving up essential tools.
- **User Segments**: All users
- **Competitive Landscape**: Gecko-native — Firefox fork inherits the WebExtension runtime. All Firefox forks support this. Chrome extensions work on Chromium forks. The real work is compat testing with custom chrome.
- **Technical Complexity**: Medium — runtime is inherited; effort is compatibility testing across top 200 extensions with Aether's custom chrome surfaces.
- **Dependencies**: None (but companion requirement: aggressive permission model)
- **Key Evidence**: "Every failed browser that launched without extension support is in the graveyard" (DA). 52% of AI extensions collect user data (SA concern). Without uBlock Origin and password managers, the browser is DOA.
- **Council Notes**: 4 Must votes. SA's Should + low Confidence (0.6) reflects extension-as-attack-surface concern. Solution: ship full support AND invest in permission warnings, runtime checks.

### 6. AI Page Summarization

- **Category**: AI & Agents
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 6.03 (R:6-9 I:2-4 C:0.6-1.0 E:3-6)
- **JTBD**: When I open a long article or PDF, I want a one-click summary, so I can decide whether it's worth reading in full.
- **User Segments**: All users, knowledge workers, researchers, students
- **Competitive Landscape**: Brave Leo, Opera Aria, Dia, Edge Copilot all have this. Commodity feature — but Aether differentiates by running it locally via BYOM.
- **Technical Complexity**: Medium — requires LLM infrastructure (BYOM). SA flags content sanitization for prompt injection.
- **Dependencies**: BYOM/LLM plumbing
- **Key Evidence**: #1 use case across all AI extensions. "Entry drug for AI engagement" (PS). Users who try summarization explore deeper features. 49% of users want AI for research support (Shift 2026).
- **Council Notes**: 3 Should votes. Funnel feature, not destination. Requires content sanitization before passing to LLM. Ship with BYOM from day one.

### 7. Tab Unloading/Hibernation

- **Category**: Performance
- **MoSCoW**: Should
- **Kano**: Must-be
- **RICE Score**: 5.41 (R:7-9 I:3-4 C:0.8-0.9 E:2-7)
- **JTBD**: When I have many tabs open, I want inactive tabs to release memory automatically, so my browser stays fast without me managing it.
- **User Segments**: All users, power users with 10+ tabs, resource-limited devices
- **Competitive Landscape**: Edge dropped 3GB→500MB with sleeping tabs. Vivaldi has tab hibernation. Chrome has tab discarding. Gecko provides `browser.tabs.unloadTab()`.
- **Technical Complexity**: Low-Medium — Gecko provides primitives. Engineering is in smart heuristics (LRU + workspace-aware suspension) and state serialization for instant restore.
- **Dependencies**: None (but workspace-awareness benefits from workspace model)
- **Key Evidence**: Edge proved massive memory savings. Invisible, automatic feature — best kind. TA effort estimate (3) is credible because Gecko provides primitives.
- **Council Notes**: TA/SA disagreement on effort (3 vs 7). TA's estimate more credible. SA's caution about serialization surfaces noted but doesn't change the high-value, low-risk calculus.

### 8. Zero Telemetry Architecture

- **Category**: Privacy
- **MoSCoW**: Must
- **Kano**: Must-be
- **RICE Score**: 5.33 (R:4-8 I:2-5 C:0.8-0.95 E:3-5)
- **JTBD**: When I use Aether, I want verifiable proof that no data leaves my machine without my consent, so I can trust my browser with my digital life.
- **User Segments**: Privacy purists, enterprise, security researchers, all users
- **Competitive Landscape**: LibreWolf ships zero telemetry. Mullvad ships zero telemetry. Brave has opt-out P3A (minimal but present). Tor has zero user telemetry. Firefox has extensive telemetry (opt-out).
- **Technical Complexity**: Low if designed from day one; catastrophically expensive to retrofit. Strip Firefox telemetry, audit all network calls, implement opt-in crash reporting.
- **Dependencies**: None (architectural constraint, not feature)
- **Key Evidence**: "If the browser phones home, every other privacy feature is theater" (SA). "Any fork can claim this by stripping telemetry" (DA) — true, but it must be verifiable. LibreWolf playbook: opt-in crash reporting with clear disclosure.
- **Council Notes**: 3 Must votes. SA scored extremely high (RICE 12.67). DA correctly notes it's marketing + engineering. Consensus: cheap to do right from day one, expensive to retrofit.

### 9. Tab Graveyard / Recovery

- **Category**: Workspace
- **MoSCoW**: Should
- **Kano**: Must-be
- **RICE Score**: 4.87 (R:~7 I:~3 C:~0.8 E:~2)
- **JTBD**: When I accidentally close a tab or want to revisit something from yesterday, I want a searchable history of closed tabs with preserved state, so I never lose my place.
- **User Segments**: All users, tab hoarders, knowledge workers
- **Competitive Landscape**: Chrome has "recently closed" (basic). Vivaldi has "Closed Tabs" list. No browser offers searchable, state-preserving recovery with workspace scoping.
- **Technical Complexity**: Low — TA estimates effort 2. State serialization + searchable index of closed tabs.
- **Dependencies**: Benefits from workspace model (per-workspace recovery)
- **Key Evidence**: CMU study: "fear of a 'black hole effect' compelled people to keep tabs open even as the number became unmanageable." This feature directly addresses the #1 cause of tab hoarding.
- **Council Notes**: Low effort, high user value. Eliminates tab-hoarding fear. Should be workspace-scoped when workspaces ship.

### 10. Profile Export/Import

- **Category**: Sync
- **MoSCoW**: Should
- **Kano**: Must-be
- **RICE Score**: 4.85 (R:~8 I:~4 C:~0.9 E:~6)
- **JTBD**: When I invest time configuring Aether, I want to export my full profile (bookmarks, settings, extensions, config), so I have a portable safety net.
- **User Segments**: Switching users, power users, enterprise
- **Competitive Landscape**: Most browsers support basic bookmark export. Few support full profile portability. Firefox Sync backs up to Mozilla servers.
- **Technical Complexity**: Medium — profile serialization, extension state, config export.
- **Dependencies**: None
- **Key Evidence**: "Users need an exit door to enter willingly" (council). Portability reduces switching anxiety. Only 2 scorers but low divergence (22.2%).
- **Council Notes**: Only 2 members scored. Both rated Should. Low controversy — considered obvious infrastructure.

### 11. Native Command Palette / Ex-Mode

- **Category**: Keyboard
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 4.83 (R:~6 I:~4 C:~0.8 E:~4)
- **JTBD**: When I want to perform any browser action, I want to type a command with fuzzy search and tab completion, so I never need to hunt through menus or remember shortcuts.
- **User Segments**: Power users, developers, VS Code users
- **Competitive Landscape**: Vivaldi has Quick Commands. qutebrowser has `:` commands. Nyxt has fuzzy command dispatch. No mainstream browser has this. VS Code trained a generation on Ctrl+Shift+P.
- **Technical Complexity**: Medium — command registry, fuzzy matching, key routing. Chrome-level work.
- **Dependencies**: Foundation for keybinding system (vim keys + shortcuts route through this)
- **Key Evidence**: "Glue for keyboard-first UX" (council). Universal entry point that makes vim mode and shortcut customization discoverable. 1 Must vote, 4 Should.
- **Council Notes**: Should with high priority. This is the universal keyboard entry point — users who never touch vim mode still benefit.

### 12. Memory-Efficient Tab Management

- **Category**: Performance
- **MoSCoW**: Should
- **Kano**: Must-be
- **RICE Score**: 4.72 (R:~7 I:~4 C:~0.8 E:~5)
- **JTBD**: When I have 100+ tabs across workspaces, I want my browser to stay under 2GB RAM, so my system remains responsive.
- **User Segments**: All users, power users, users on 8GB laptops
- **Competitive Landscape**: Chrome ~600MB for 5 tabs. Firefox ~450MB baseline. Vivaldi ~960MB for 10 tabs. Edge sleeping tabs drop 3GB→500MB. All browsers have improved, but Aether's workspace model encourages more tabs than typical usage.
- **Technical Complexity**: Medium — workspace-aware memory budgets, aggressive suspension, efficient state serialization.
- **Dependencies**: Tab Unloading/Hibernation, Workspace model
- **Key Evidence**: "A browser that chews through RAM is unshippable" (UA). Existential for workspace thesis — 100+ tabs across projects is the expected use case.
- **Council Notes**: DA underestimates impact because Aether's model encourages more tabs. TA correctly flags this as existential for workspace thesis. Prerequisite, not differentiator.

### 13. LLM Sidebar Chat

- **Category**: AI & Agents
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 4.56 (R:~7 I:~3-4 C:~0.7-0.9 E:~4-6)
- **JTBD**: When I'm reading or researching, I want to ask questions about the page content in a sidebar, so I can get answers without losing my place.
- **User Segments**: All users, knowledge workers, researchers
- **Competitive Landscape**: Brave Leo, Opera Aria, Edge Copilot, Dia — every AI browser has this. Standalone tools (ChatGPT, Claude) are a tab away. The sidebar alone is commodity.
- **Technical Complexity**: Medium — LLM integration, page content extraction, UI. SA flags every chat interaction as a data exfiltration opportunity.
- **Dependencies**: BYOM infrastructure, Prompt Injection Defense
- **Key Evidence**: "ChatGPT is a tab away" (DA — correct). But sidebar + local AI + workspace context = differentiated (PS — also correct). Value is multiplicative with Local AI and Workspaces.
- **Council Notes**: Commodity alone, differentiator combined. Ship with BYOM integration from day one, not as standalone. 69.8% divergence reflects this tension.

### 14. Project-First Workspaces

- **Category**: Workspace
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 4.53 (R:5-9 I:4-5 C:0.6-0.9 E:5-8)
- **JTBD**: When I work on multiple projects, I want each project's tabs, history, cookies, and state isolated and instantly switchable, so I can context-switch without cognitive overhead.
- **User Segments**: Knowledge workers, researchers, analysts, multi-project developers
- **Competitive Landscape**: Arc had Spaces (dead). Vivaldi has Workspaces (44% never create one — discoverability failure). Zen has workspaces (beta quality). Firefox has Containers (cookies only). No browser delivers full project-scoped isolation with good UX.
- **Technical Complexity**: High — touches tab management, session storage, cookie isolation, history scoping. Firefox Containers provides cookie isolation foundation. Effort 5-8 depending on scope.
- **Dependencies**: Vertical Tab Sidebar, Tab Management, Sandboxed Identity Profiles (for full isolation)
- **Key Evidence**: "This IS Aether's identity — but contested on effort, learning curve, and Arc's cautionary tale" (council). Arc proved demand but died. Vivaldi proved low adoption without good UX. Must be discoverable-when-needed, not forced-at-first-run.
- **Council Notes**: 76.6% divergence. PS+TA say Must (product identity). DA correctly identifies Arc survivorship bias. Consensus: Should with highest priority. Ship in v1.0 but don't gate launch on it. If <30% of beta users create a second workspace within 30 days, reconsider thesis.

### 15. Versionable/Portable Config

- **Category**: Extensibility
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 4.30 (R:~6 I:~4 C:~0.8 E:~4)
- **JTBD**: When I set up a new machine, I want to clone my browser config from a git repo, so I have identical setup everywhere.
- **User Segments**: Power users, Linux users, dotfiles enthusiasts
- **Competitive Landscape**: qutebrowser has a Python config file. Nyxt has Lisp config. No mainstream browser supports version-controlled configuration. Firefox uses opaque profile directories.
- **Technical Complexity**: Low-Medium — human-readable config format, stable schema, merge-friendly structure.
- **Dependencies**: Full Keyboard Shortcut Customization (config includes keybindings)
- **Key Evidence**: Dotfiles culture among target beachhead segment. Only 2 scorers, low divergence (40.7%). Power-user stickiness feature.
- **Council Notes**: Only 2 members scored. Both rated Should. Not controversial — clearly valuable for target audience.

### 16. Native Vim/Modal Keybindings

- **Category**: Keyboard
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 4.26 (R:2-6 I:3-5 C:0.7-0.9 E:3-6)
- **JTBD**: When I use my browser, I want the same modal editing model as vim (Normal/Insert/Command modes) that works on browser chrome, not just web content, so I never have to touch my mouse.
- **User Segments**: Vim users (660K+ measurable), developers, RSI sufferers
- **Competitive Landscape**: qutebrowser has native vim (5/5 keyboard control, ugly UI, no extensions). Vimium/Tridactyl are extensions (can't control chrome, dead zones on about: pages, PDF viewer). Nyxt has Emacs+Vim (unstable, poor JS performance). Zero mainstream browsers support this natively.
- **Technical Complexity**: Medium — event interception in chrome pipeline, modal state machine, configurable binding layer. TA: "Effort 3 because it's event handling and UI state, no engine changes."
- **Dependencies**: Command Palette (command mode routes through it), Keyboard Shortcut Customization
- **Key Evidence**: "660K users in a 5B+ market is 0.013%" (DA — numerically correct but strategically wrong). "Vim users are the most vocal, technically sophisticated, blog-writing demographic in software" (consensus). The switching incentive isn't "slightly better" — it's "finally possible."
- **Council Notes**: 84.4% divergence — highest of any feature. TA scored 9.00, DA scored 1.40. Beachhead strategy argument wins: these users have been abandoned since Firefox killed XUL. Opt-in, not default.

### 17. Theming / Visual Customization

- **Category**: Extensibility
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 4.23 (R:~7 I:~4 C:~0.8 E:~5)
- **JTBD**: When I use Aether daily, I want to customize its appearance to match my aesthetic and workflow, so it feels like mine.
- **User Segments**: All users (92% want personalization — Shift 2026)
- **Competitive Landscape**: Vivaldi leads (deep visual customization). Zen has Zen Mods (theme marketplace). Firefox has basic theming. Chrome has limited themes.
- **Technical Complexity**: Medium — CSS-based theming system, theme marketplace, user CSS support.
- **Dependencies**: None
- **Key Evidence**: "92% demand more personalization" (Shift 2026). Retention feature, not acquisition feature. Only 2 scorers, extremely low divergence (1.6%).
- **Council Notes**: Retention-focused. Not urgent for launch but important for stickiness.

### 18. Full Keyboard Shortcut Customization

- **Category**: Keyboard
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 4.21 (R:~6 I:~4 C:~0.8 E:~4)
- **JTBD**: When my browser shortcuts conflict with my terminal/editor muscle memory, I want to remap any shortcut including dangerous ones (Ctrl+Q, Ctrl+W), so nothing fights my workflow.
- **User Segments**: All power users, vim/tmux/WM users
- **Competitive Landscape**: Firefox shipped customizable shortcuts in late 2025 after 25 years. Vivaldi has GUI shortcut editor. qutebrowser has full config-file customization. Chrome has minimal shortcut editing.
- **Technical Complexity**: Medium — conflict detection across modes (normal browsing, vim mode, extension shortcuts), export/import.
- **Dependencies**: Foundation for keybinding system
- **Key Evidence**: "Firefox took 25 years to ship this" (discovery). Ctrl+Q quitting the browser with 50 tabs open is a universally cited pain point.
- **Council Notes**: Foundation for the keybinding system. Conflict detection across vim mode, extension shortcuts, and browser defaults is the hard part.

### 19. Keyboard-Only Full Navigation

- **Category**: Accessibility
- **MoSCoW**: Should
- **Kano**: Must-be
- **RICE Score**: 4.15 (R:3-6 I:3-5 C:0.8-1.0 E:3-6)
- **JTBD**: When I browse without a mouse (by choice or necessity), I want every browser surface navigable via keyboard, so I'm never blocked.
- **User Segments**: Accessibility users (RSI, motor impairment), keyboard-first users, WCAG compliance
- **Competitive Landscape**: qutebrowser (full keyboard). Nyxt (full keyboard). No mainstream browser achieves 100% keyboard navigation of all chrome surfaces.
- **Technical Complexity**: Medium-High — every UI surface must be keyboard-navigable. Ongoing quality bar, not a discrete feature.
- **Dependencies**: None (cross-cutting requirement)
- **Key Evidence**: "Accessibility is not subject to reach-based scoring — it's a legal and moral requirement" (UA). WCAG compliance. Serves RSI sufferers, motor-impaired users, and the keyboard-first promise.
- **Council Notes**: UA wins this debate on principle. DA's low reach (3) reflects flawed framing. Consensus: treat as ongoing quality bar — every chrome surface shipped must be keyboard-navigable. Add to Definition of Done.

### 20. Per-Workspace Session Persistence

- **Category**: Workspace
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 3.97 (R:~6 I:~4 C:~0.8 E:~5)
- **JTBD**: When I switch between workspaces and come back to one days later, I want scroll positions, form data, and auth state preserved exactly as I left them, so workspaces feel like real contexts, not disposable tab groups.
- **User Segments**: Knowledge workers, researchers, multi-project developers
- **Competitive Landscape**: No browser fully preserves session state per workspace/container. Firefox session restore is global. Arc had per-Space persistence (dead). Vivaldi workspaces don't preserve scroll positions.
- **Technical Complexity**: High — state serialization per workspace including DOM state, scroll, form data, cookies, auth. Depends on workspace infrastructure.
- **Dependencies**: Project-First Workspaces
- **Key Evidence**: "Makes workspaces sticky" (council). Without persistence, workspaces are cosmetic tab groups. This is the lock-in feature that converts trial users to committed users.
- **Council Notes**: 1 Must vote. Makes workspaces real vs. cosmetic. Critical for workspace thesis.

### 21. Intelligent Tab Lifecycle Management

- **Category**: Workspace
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 3.82 (R:~6 I:~4 C:~0.8 E:~5)
- **JTBD**: When I accumulate tabs I no longer actively need, I want the browser to intelligently suggest archiving, grouping, or closing them, so my workspace stays manageable without manual cleanup.
- **User Segments**: All users, tab hoarders, knowledge workers
- **Competitive Landscape**: Arc had forced auto-archiving (user backlash). No browser has intelligent, workspace-aware lifecycle management. Chrome has basic tab grouping suggestions.
- **Technical Complexity**: Medium — heuristics for tab relevance, workspace-aware priority, non-intrusive suggestions.
- **Dependencies**: Workspace model, Tab Unloading
- **Key Evidence**: "Tabs function as poor substitutes for task management" (CMU study). 25% of users crash browsers from too many tabs.
- **Council Notes**: Workspace-aware tab management. Must learn from Arc's mistake: suggest, don't force.

### 22. Sandboxed Identity Profiles

- **Category**: Privacy
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 3.60 (R:~6 I:~3-4 C:~0.7-0.8 E:~5-8)
- **JTBD**: When I use the web for work, personal, and research, I want each identity fully isolated (cookies, storage, fingerprint), so sites can't track me across contexts.
- **User Segments**: Multi-account users, privacy users, journalists, activists
- **Competitive Landscape**: Firefox Multi-Account Containers (cookies only — fingerprint and IP shared). Brave has basic profiles. No browser provides per-context fingerprint isolation. Users resort to multiple browsers or VMs.
- **Technical Complexity**: High — process-isolated containers with separate cookie jars, storage, and ideally per-context fingerprints. Firefox Containers provides foundation.
- **Dependencies**: Foundation for workspace isolation (each workspace gets its own jar)
- **Key Evidence**: "Workspace isolation without cookie/state isolation is cosmetic" (SA). Firefox Containers proves the cookie model works but doesn't address fingerprinting. Privacy Guides community hierarchy: Containers < Profiles < Desktop Users < VMs.
- **Council Notes**: SA scored high (6.00), DA low (1.75). Consensus: powers workspaces invisibly. Explicit multi-identity management as discoverable power feature.

### 23. Keyboard Control Over Browser Chrome

- **Category**: Keyboard
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 3.33 (R:~4 I:~4 C:~0.7-0.8 E:~4-5)
- **JTBD**: When I'm in vim mode, I want keybindings to work on address bar, settings, PDF viewer, and devtools, so there are no dead zones where I'm forced to use a mouse.
- **User Segments**: Vim users, power users
- **Competitive Landscape**: qutebrowser (full chrome control). No extension can do this — WebExtension API sandboxes extensions from browser chrome. This is literally the reason to build a browser instead of an extension.
- **Technical Complexity**: Medium — intercept keyboard events in chrome pipeline before content routing. Must be designed into the chrome layer from day one.
- **Dependencies**: Vim/Modal Keybindings, Command Palette
- **Key Evidence**: "Extensions cannot control browser chrome — this is the fundamental limitation that killed Vimperator/Pentadactyl" (TA). Tridactyl issue #904 (open since 2018, unresolved) about websites stealing `/` key demonstrates the structural problem.
- **Council Notes**: 75% divergence. TA+PS see it as structural differentiator. DA sees narrow reach. Compound feature: palette + vim + chrome control = complete keyboard-first system. Each piece multiplies the others' value.

### 24. Real-Time Privacy Dashboard

- **Category**: Privacy
- **MoSCoW**: Could
- **Kano**: Performance
- **RICE Score**: 3.24 (R:~5 I:~3 C:~0.7 E:~4)
- **JTBD**: When I want to understand how a site tracks me, I want a real-time visualization of blocked trackers, cookies, and fingerprint attempts, so I can make informed decisions about what to allow.
- **User Segments**: Privacy users, security researchers
- **Competitive Landscape**: Brave Shields shows per-site blocking stats. DuckDuckGo shows tracker blocking counts. No browser provides a comprehensive real-time privacy dashboard with fingerprint attempt visualization.
- **Technical Complexity**: Medium — data collection from blocking engine, UI visualization, per-site summaries.
- **Dependencies**: Ad/Tracker Blocking infrastructure
- **Key Evidence**: SA scores high; others moderate. "Privacy visibility" — making protection tangible builds trust. Users can't value what they can't see.
- **Council Notes**: SA-driven priority. Bundle with Sandboxed Profiles for comprehensive privacy UX.

### 25. Website Key Stealing Prevention

- **Category**: Keyboard
- **MoSCoW**: Should
- **Kano**: Performance
- **RICE Score**: 3.11 (R:~4 I:~3 C:~0.7 E:~3)
- **JTBD**: When I'm on GitHub or YouTube, I want my browser-level shortcuts (/, j, k) to always work, so websites can't hijack my keyboard.
- **User Segments**: Vim users, keyboard-first users
- **Competitive Landscape**: No browser solves this. Tridactyl issue #904 (open since 2018). qutebrowser handles it via native implementation. Extensions fundamentally cannot win this fight due to event ordering.
- **Technical Complexity**: Low-Medium — priority system where browser-level bindings win unless explicitly yielded per-site. Must intercept before content scripts run.
- **Dependencies**: Vim/Modal Keybindings
- **Key Evidence**: GitHub, Google, YouTube all bind `/` for search, conflicting with vim search. Users file bugs against extensions that structurally cannot be fixed.
- **Council Notes**: Only 3 scorers. Keyboard protection feature that eliminates a class of frustration unique to keyboard-first users.

### 26. Per-Site Privacy Controls

- **Category**: Privacy
- **MoSCoW**: Could
- **Kano**: Performance
- **RICE Score**: 3.08 (R:~5 I:~3 C:~0.7 E:~5)
- **JTBD**: When I visit a site I partially trust, I want granular control over what that site can access (cookies, scripts, fingerprint data, notifications), so I can balance usability and privacy per-site.
- **User Segments**: Privacy users, power users
- **Competitive Landscape**: Brave has per-site Shields toggles (best-in-class). Firefox has per-site permissions. uBlock has per-site rules. No browser offers unified per-site privacy including fingerprint controls.
- **Technical Complexity**: Medium — unified privacy control panel per site, integrating blocking, cookies, permissions, fingerprint settings.
- **Dependencies**: Ad/Tracker Blocking, Sandboxed Profiles
- **Key Evidence**: SA-driven priority. Granular control for users who don't want all-or-nothing privacy.
- **Council Notes**: Could — useful but not essential for launch. Bundle with privacy dashboard.

### 27. Cross-Device Sync

- **Category**: Sync
- **MoSCoW**: Should
- **Kano**: Must-be
- **RICE Score**: 2.99 (R:~7 I:~3 C:~0.7 E:~5)
- **JTBD**: When I switch between my laptop and desktop, I want my tabs, bookmarks, and settings synced securely, so I can continue where I left off.
- **User Segments**: All users
- **Competitive Landscape**: Chrome Sync (Google account). Firefox Sync (Mozilla account). Brave Sync (QR code, no account). Safari iCloud sync. All require some server trust.
- **Technical Complexity**: High — E2E encryption required to maintain privacy promise. Self-hosted option desirable. Server infrastructure needed.
- **Dependencies**: Zero Telemetry Architecture (sync must not compromise privacy)
- **Key Evidence**: Expected by month 3, not day 1. E2E encryption is non-negotiable for privacy positioning. Brave's QR-code-only sync (no account required) is the gold standard model.
- **Council Notes**: Should — but not launch-critical. E2E encryption required. Follow Brave's account-free model.

### 28. Intelligent Password Manager

- **Category**: Productivity
- **MoSCoW**: Could
- **Kano**: Must-be
- **RICE Score**: 2.98 (R:~6 I:~3 C:~0.7 E:~5)
- **JTBD**: When I log into sites, I want reliable autofill that works on complex login forms, so I never have to remember or type passwords.
- **User Segments**: All users ($3-4.6B market)
- **Competitive Landscape**: Chrome, Firefox, Edge, Safari all have built-in password managers. Third-party (1Password, Bitwarden) are superior. WebExtension compat means Bitwarden works out of the box.
- **Technical Complexity**: High — form detection, multi-step login support, secure storage, sync.
- **Dependencies**: WebExtension API (makes dedicated password managers work, reducing urgency)
- **Key Evidence**: Security-critical feature. WebExtension compat reduces urgency — Bitwarden/1Password work via extensions. Built-in can come later.
- **Council Notes**: Could — WebExtension support makes this non-urgent. Build later when the team has capacity.

### 29. AI Writing Assistance (Inline)

- **Category**: AI & Agents
- **MoSCoW**: Could
- **Kano**: Performance
- **RICE Score**: 2.91 (R:~5 I:~3 C:~0.7 E:~5)
- **JTBD**: When I'm composing an email or writing a post, I want inline AI suggestions for grammar, tone, and completion, so I can write faster and more clearly.
- **User Segments**: Knowledge workers, casual users
- **Competitive Landscape**: Edge Copilot has inline writing. Dia excels at inline text editing. Grammarly is the dominant extension. Brave Leo doesn't do inline editing.
- **Technical Complexity**: Medium — requires contenteditable/textarea integration, LLM calls, UI overlay. Depends on LLM infrastructure.
- **Dependencies**: BYOM/LLM infrastructure
- **Key Evidence**: Grammarly has 30M+ users, proving demand. But as an extension-level feature, not browser-level. Differentiation comes from local inference preserving writing privacy.
- **Council Notes**: Could — depends on LLM infra maturity. Phase 3 feature.

### 30. BYOM (Bring Your Own Model)

- **Category**: AI & Agents
- **MoSCoW**: Should
- **Kano**: Delighter
- **RICE Score**: 2.84 (R:2-5 I:3-4 C:0.6-0.8 E:3-7)
- **JTBD**: When I want AI features without trusting a third party, I want to point Aether at my own Ollama/LLM endpoint, so I get AI assistance with zero data leaving my machine.
- **User Segments**: Developers, privacy users, enterprise
- **Competitive Landscape**: Brave Leo supports Ollama BYOM (desktop ≥1.69) — the only browser with this. Opera/Neon has 150 local model variants but not true BYOM. Dia and SigmaOS are cloud-only. No other browser supports user-provided endpoints.
- **Technical Complexity**: Low-Medium — API integration layer pointing at user-hosted endpoints. TA: effort 3 because "it's an API integration layer."
- **Dependencies**: None (enables all AI features)
- **Key Evidence**: "80% of the value [of local AI] at 37% of the cost" (council). Bridge to native local inference. Same privacy guarantee as on-device inference for users who run Ollama. 83% divergence reflects uncertainty about AI features broadly, not BYOM specifically.
- **Council Notes**: 3 Should votes. Critical bridge to local AI. Ship before native inference — gives users the privacy guarantee immediately while hardware catches up.

---

## 3. Gap Analysis

Features no competitor browser currently offers — Aether's opportunity to be first.

### Gap 1: Keyboard Control Over Browser Chrome (Native Vim in All Surfaces)

- **What**: Native modal vim keybindings that work on browser chrome (address bar, settings, PDF viewer, reader mode, about: pages, devtools) — not just web content.
- **Why it matters**: Extensions fundamentally cannot do this due to WebExtension API sandbox limitations. Tridactyl issue #904 has been open since 2018. 660K+ keyboard-first users have been abandoned since Firefox killed XUL in 2017. This audience has zero alternatives.
- **How hard**: Medium (TA: effort 3). Chrome-level event pipeline work, no engine changes. Must be designed into the chrome layer from day one.
- **Competitive advantage window**: Wide (2-3+ years). No mainstream browser is pursuing this. Zen has a GitHub discussion requesting it (#2017) but no implementation. Building this natively requires browser-level commitment that extension developers cannot replicate.

### Gap 2: Project-Scoped Workspaces with Full State Isolation

- **What**: Workspaces that scope not just tabs but cookies, storage, history, fingerprint, and session state per project — making each workspace a complete, isolated browsing context.
- **Why it matters**: Firefox Containers isolate cookies only (fingerprint/IP shared). Vivaldi workspaces are cosmetic tab groups (44% never use them). Arc had the closest implementation but is dead. No browser delivers the full vision of "project as first-class entity."
- **How hard**: High (effort 5-8). Touches tab management, session storage, cookie isolation, history scoping. Gecko's Container infrastructure provides 60% of the foundation.
- **Competitive advantage window**: Medium (1-2 years). Zen could pursue this. But the full-isolation model (cookies + fingerprint + state + history) is architecturally complex enough that incremental forks won't get there quickly.

### Gap 3: Local-First AI with Privacy Guarantee

- **What**: AI features (summarization, chat, writing) that run entirely on-device or via user-controlled endpoints, with verifiable zero cloud data transmission.
- **Why it matters**: "52% of AI extensions collect user data" (competitive research). Washington Post reviewer deleted all 4 AI browsers due to privacy concerns. Brave Leo is the closest (self-hosted models, zero retention) but still transmits data to Brave's servers. True local-first AI resolves the market's defining tension.
- **How hard**: Low for BYOM (effort 3 — API integration). High for native inference (effort 7-9 — llama.cpp integration, GPU/CPU fallback, model management). Ship BYOM first.
- **Competitive advantage window**: Narrow for BYOM (Brave already has Ollama support). Wide for native on-device inference as a default experience (no competitor shipping this at browser level).

### Gap 4: Unified Keyboard Priority System (Website Key Stealing Prevention)

- **What**: A priority system where browser-level keybindings always win unless explicitly yielded per-site, preventing websites from hijacking keyboard shortcuts.
- **Why it matters**: GitHub steals `/`, YouTube steals `j`/`k`, Google steals `/` — all conflict with vim keybindings. Extensions cannot fix this due to event ordering in the WebExtension API. This is a structural problem that only browser-level implementation can solve.
- **How hard**: Low-Medium (effort 2-3). Intercept keyboard events in chrome pipeline before content scripts run. Per-site yield configuration.
- **Competitive advantage window**: Wide (indefinite). This requires browser-level implementation. No extension can solve it. No browser vendor is prioritizing it because the audience is small — but for that audience, it's transformative.

### Gap 5: Versionable Browser Configuration (Config-as-Code)

- **What**: Human-readable, merge-friendly configuration files that can be version-controlled via git, covering keybindings, settings, themes, workspace layouts, and privacy preferences.
- **Why it matters**: Power users (the beachhead segment) manage dotfiles for every tool except their browser. Firefox uses opaque profile directories. Chrome stores settings in non-portable SQLite databases. The browser is the last major developer tool that can't be version-controlled.
- **How hard**: Low-Medium (effort 3-4). Human-readable format (TOML/YAML), stable schema with backward compatibility, merge-friendly structure.
- **Competitive advantage window**: Medium (2+ years). No browser vendor is pursuing this. qutebrowser has a Python config file but no extension support or modern web compat. The combination of versionable config + mainstream browser features is unique.

### Gap 6: Workspace-Scoped AI Context

- **What**: AI features (sidebar chat, summarization, search) that are automatically scoped to the current workspace's tabs and history — not the entire browser.
- **Why it matters**: Current AI browsers (Brave Leo, Opera Aria) have global context. When a user asks "summarize my research," the AI should know which project they mean. Workspace scoping makes AI useful for knowledge work, not just individual pages.
- **How hard**: Medium. Requires workspace model + LLM infrastructure + context windowing. Architectural dependency on workspaces being real (not cosmetic).
- **Competitive advantage window**: Medium-Wide (1-3 years). No competitor has workspace-scoped AI because no competitor has real workspaces + AI. Aether's unique combination creates this possibility.

---

## 4. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | **Single-source claims masquerading as validated** — Several key statistics (81% switching willingness, 40% context-switching cost) come from single studies or industry-commissioned reports (Shift is a browser company). Over-reliance on these risks building on shaky foundations. | Medium | High | Validation Wave 3 verified core claims. Treat Shift-commissioned data as directional, not precise. Cross-reference with behavioral data from beta telemetry (opt-in). Mark all single-source claims in feature justifications. |
| 2 | **AI hype risk** — 11 of 20 AI features scored "Won't" by the Devil's Advocate. Agent automation has 19.7% success rate for 10-step workflows. Shipping unreliable AI features damages credibility more than shipping no AI features. | High | High | Ship BYOM as infrastructure, not headline feature. Lead with proven use cases (summarization, sidebar chat). Don't claim to have solved prompt injection. Human-in-the-loop for all agent actions. Set expectations honestly. |
| 3 | **Firefox/Gecko fork sustainability** — Firefox declined from 32% (2009) to ~2.3% (2025). Gecko maintenance depends on Mozilla's funding (95% from Google search deal). If Mozilla collapses, Aether's engine has no upstream maintainer. | Medium | Critical | Monitor Mozilla financial health quarterly. Maintain fork divergence budget (track merge cost per release). Invest in Gecko knowledge within team. Plan migration strategy to alternative engine as contingency (2+ year horizon). |
| 4 | **Niche market trap** — Keyboard-first users are 0.013% of the browser market (660K / 5B+). If Aether only appeals to vim users, it becomes qutebrowser with better UI — not a sustainable business. | Medium | High | Workspace + privacy + AI features must appeal beyond the beachhead. Vim mode is opt-in, not default. Command palette is the universal entry point. Track segment diversity in user base. If >80% of users are vim users after 6 months, broaden marketing. |
| 5 | **Over-indexing on Reddit/HN sentiment** — Power user communities are vocal but represent <1% of browser users. Reddit crowned Zen over Chrome, but Chrome has 5B users and Zen has <1M. Feature priorities derived from community sentiment may not reflect mass-market needs. | High | Medium | Weight community signals as demand indicators, not market size indicators. Use beta analytics (opt-in) to validate. Compare community requests against broader market data (Shift report, McKinsey studies). Don't build features only community members want. |
| 6 | **Privacy-performance tradeoff** — Anti-fingerprinting breaks websites proportionally to protection strength (Tor = unusable for streaming; Mullvad triggers CAPTCHAs everywhere). If Aether's privacy defaults cause daily friction, users switch back to Chrome. | High | High | Adopt Brave's randomization model (less breakage than uniformity). Ship per-site privacy controls early. Aggressive allowlisting for common sites. Privacy dashboard to let users understand and adjust tradeoffs. Default to "strong but usable," not "maximum." |
| 7 | **Agent reliability gap** — Multi-step agent success rate is 19.7% for 10-step workflows. Google, OpenAI, Anthropic are investing billions. Aether can't out-resource them on agent reliability. | High | Medium | Don't compete on agent execution. Ship the API surface and debugging tools (foundation). Let agent reliability improve externally. Position as the best browser for agent developers to build on, not as an agent itself. |
| 8 | **WebMCP competitive threat** — Google shipped WebMCP preview in Chrome Canary (Feb 2026). If WebMCP becomes the standard for structured agent-browser interaction, and it's Chrome-native, Aether's agent platform advantage evaporates. | Medium | High | Implement MCP server support alongside WebMCP. Be protocol-agnostic. The advantage is Aether's privacy model and workspace context, not the protocol. Ship MCP support in Phase 4 but track WebMCP evolution from day one. |
| 9 | **Zen Browser competition** — Zen has 41.2K GitHub stars, active community, workspaces, vertical tabs, and is also a Firefox fork. Zen could capture Aether's target audience before Aether launches. | High | Medium | Zen's weaknesses: bus factor=1, community donations only, no AI, no vim keys, perpetually beta quality. Aether differentiates on keyboard-first + AI + full workspace isolation. Monitor Zen features quarterly. If Zen ships vim mode, reprioritize. |
| 10 | **Funding/sustainability** — No commercial browser has achieved profitability without advertising (Chrome/Google), corporate backing (Edge/Microsoft), or crypto (Brave). Aether needs a sustainable revenue model that doesn't conflict with its privacy promise. | High | Critical | Explore: premium AI features (cloud model access), enterprise licensing, optional paid sync, sponsored search (privacy-respecting, user-controlled). Study Brave's ad-replacement model (controversial but generating $30M+ revenue). Define revenue model before Phase 2. |
| 11 | **Arc precedent — workspaces don't sell** — Arc built the most ambitious workspace browser, raised massive funding, and pivoted away. 44% of Vivaldi users never create a workspace. The market for project-organized browsing may be narrower than community voices suggest. | Medium | High | Make workspaces discoverable-when-needed, not forced. Measure: if <30% of beta users create a second workspace in 30 days, reconsider product thesis. Arc failed on forced opinionated UX (auto-archiving tabs), not on the workspace concept itself. |
| 12 | **AI-privacy tension is irreconcilable** — Local models produce substantially worse results than cloud models. Hardware requirements (≥8GB VRAM) exclude most users. Users may choose Chrome+ChatGPT over Aether+local-LLM because the quality gap is too visible. | Medium | High | BYOM lets users choose their quality-privacy tradeoff. Don't force local-only. Offer cloud API keys as opt-in with clear data disclosures. Models are improving rapidly — the gap narrows each quarter. Ship the infrastructure now; the models will catch up. |

---

## 5. User Segment Profiles

### Segment 1: Power Users (Vim Users, Keyboard-First Developers)

**Description**: Developers and technical users who live in the terminal, use vim/neovim, manage dotfiles, tile their windows, and view the browser as the last tool that doesn't respect their workflow. They'll tolerate rough edges for deep control.

**Estimated size**: 660K-1M measurable (Vimium 500K Chrome, Tridactyl ~60K Firefox, qutebrowser ~100K), potential 2-3M including adjacent keyboard-power-user population.

**Top 10 features by importance**:
1. Native Vim/Modal Keybindings — "finally possible," not "slightly better"
2. Keyboard Control Over Browser Chrome — the structural problem extensions can't solve
3. Website Key Stealing Prevention — eliminates daily friction
4. Full Keyboard Shortcut Customization — muscle memory compatibility
5. Native Command Palette / Ex-Mode — universal command interface
6. Versionable/Portable Config — dotfiles culture
7. WebExtension API Support — password managers, dev tools
8. Native Ad/Tracker Blocking — table stakes
9. Tab Unloading/Hibernation — 100+ tab workflows
10. Theming / Visual Customization — ricing culture

**Key pain points**: Extensions can't control browser chrome (about: pages, settings, PDF viewer). Websites hijack keyboard shortcuts. Can't version-control browser config. Forced to choose between keyboard purity (qutebrowser — no extensions) and web compat (Firefox + Vimium — dead zones).

**Why they switch**: No alternative exists. This is the "finally possible" segment. They've been abandoned since Firefox killed XUL in 2017. They'll switch for native vim that works everywhere, write blog posts, and evangelize in communities that massively over-index in developer influence.

### Segment 2: Knowledge Workers (Researchers, Writers, Analysts)

**Description**: Multi-project professionals who juggle 30-100+ tabs across different work contexts. They use the browser as their primary work tool and need cognitive structure, not just tab management.

**Estimated size**: 10-50M (knowledge workers who maintain 20+ tabs regularly — CMU: 30% of users are chronic tab hoarders, global browser user base ~5B).

**Top 10 features by importance**:
1. Project-First Workspaces — context isolation for multi-project work
2. Vertical Tab Sidebar — readable tab titles, spatial memory
3. Per-Workspace Session Persistence — continuity across days/weeks
4. Tab Graveyard / Recovery — eliminates "black hole effect" fear
5. AI Page Summarization — research acceleration
6. LLM Sidebar Chat — questions about page content without context-switch
7. Memory-Efficient Tab Mgmt — 100+ tabs must not crash the system
8. Frictionless Migration from Chrome — they're coming from Chrome
9. Tab Unloading/Hibernation — invisible performance
10. Native Ad/Tracker Blocking — focused reading

**Key pain points**: Context switching costs 40% productivity, 23 min to refocus per interruption. Tabs serve as to-do lists, external memory, and project holders — all poorly. Arc died. Vivaldi workspaces are undiscoverable (44% never use them). Browser-PKM integration is broken.

**Why they switch**: Arc's death left them stranded. Zen is perpetually beta. Aether's workspace model (discoverable, not forced) + session persistence + AI research tools = the browser they've been waiting for since Arc died.

### Segment 3: Privacy Advocates

**Description**: Spectrum from "I don't want Google tracking me" everyday users to journalists/activists facing state-level surveillance. They prioritize trust, verifiability, and architectural guarantees over feature richness.

**Estimated size**: 100M+ (Brave's MAU proves demand at scale). Smaller hardcore segment: ~10-20M (VPN users, Tor users, LibreWolf/Mullvad users).

**Top 10 features by importance**:
1. Zero Telemetry Architecture — "we can't see your data" > "we promise not to look"
2. Native Ad/Tracker Blocking — tracking protection is privacy
3. Sandboxed Identity Profiles — identity compartmentalization
4. Per-Site Privacy Controls — granular trust decisions
5. Real-Time Privacy Dashboard — visibility builds trust
6. WebExtension API Support — uBlock Origin, privacy extensions
7. Frictionless Migration from Chrome — escaping Google
8. BYOM (Bring Your Own Model) — AI without cloud data exposure
9. Profile Export/Import — portability = no vendor lock-in
10. Cross-Device Sync (E2E Encrypted) — sync without trusting the server

**Key pain points**: No browser delivers strong privacy without site breakage. Chrome is surveillance. Brave has trust deficit (2020 affiliate scandal). LibreWolf lacks auto-update and faces macOS deprecation. AI features are viewed as active threats (prompt injection, cloud data). Fingerprinting is escalating (LinkedIn scanning 6,167 extensions).

**Why they switch**: Zero telemetry by architecture (verifiable, not just claimed). Non-Chromium engine avoids Google's structural control. Local-first AI resolves the AI-privacy tension. Sandboxed profiles with per-context fingerprint isolation goes beyond Firefox Containers.

### Segment 4: Casual Users

**Description**: The mainstream — social media, shopping, entertainment, basic info lookup. They never chose Chrome; it was pre-installed. They want the web to "just work" without ads, slowdowns, or confusion.

**Estimated size**: ~4B+ (the browser user base minus power users and specialists).

**Top 10 features by importance**:
1. Native Ad/Tracker Blocking — removes the web's hostility
2. Notification Spam Blocking — stops the spam they unknowingly enabled
3. Frictionless Migration from Chrome — or they don't switch
4. Tab Unloading/Hibernation — "my computer isn't slow anymore"
5. Memory-Efficient Tab Mgmt — works on their 8GB laptop
6. AI Page Summarization — "what does this article say?"
7. WebExtension API Support — they don't install many, but the ones they have must work
8. Theming / Visual Customization — make it feel like theirs
9. Intelligent Password Manager — autofill that actually works
10. Vertical Tab Sidebar — readable tabs

**Key pain points**: Pop-up ads, notification spam, RAM consumption, password/autofill failures, tab clutter. They don't know what "privacy" means technically, but they know "something is wrong" with tracking. AI features face trust and complexity gaps — they want simple, not configurable.

**Why they switch**: They won't seek Aether out — they'll hear about it from the power users who evangelize it. The switching moment: "my friend set up this browser and now my computer is fast, ads are gone, and I never see those notification pop-ups." Aether must work perfectly with zero configuration for this segment.

### Segment 5: AI/Agent Builders

**Description**: Developers building browser automation, AI agents, web scraping, and testing infrastructure. They use Playwright/Puppeteer with headless Chrome today and fight anti-bot detection, token consumption, and debugging blindness.

**Estimated size**: ~500K-2M (browser automation market projected $4.5B→$76.8B by 2034, MCP SDK 97M+ monthly downloads).

**Top 10 features by importance**:
1. Native Agent API Surface — structured interface for agent interaction
2. Agent Debugging / Session Replay — observability for multi-step agent failures
3. Token-Efficient Page Representation — reduce 114K tokens/task to 27K
4. Always-On Accessibility Tree — Chromium doesn't build a11y tree without screen reader
5. MCP Server (Browser as MCP) — standard protocol for agent communication
6. Prompt Injection Defense — security for production deployments
7. WebDriver BiDi Support — standard automation protocol
8. Chrome DevTools Protocol Compatibility — existing tooling must work
9. Parallel Browser Sessions at Scale — multiple concurrent agent sessions
10. Anti-Bot Stealth (Real Browser) — agents need to look like real users

**Key pain points**: Multi-step reliability is 19.7% for 10-step workflows. Token consumption is 4x higher via MCP than CLI. Anti-bot detection is an escalating arms race. Debugging is "programming with a blindfold on." Context window exhaustion kills long-running tasks. Security is fundamentally unsolved (24% prompt injection success rate).

**Why they switch**: They don't switch their daily browser — they adopt Aether as their agent development platform. A real browser (not headless Chrome) with native agent APIs, efficient page representations, and first-party debugging tools eliminates the anti-bot detection problem and reduces token costs 4x. But this segment is Phase 4 — the platform must be stable first.

---

## 6. Competitive Matrix

Rows = top 20 features. Columns = major browsers. Cells: ✔ = shipped, ◐ = partial, ✖ = absent. Aether column = target state.

| Feature | Chrome | Firefox | Brave | Vivaldi | Zen | Arc/Dia | Opera | qutebrowser | **Aether (target)** |
|---------|--------|---------|-------|---------|-----|---------|-------|-------------|-------------------|
| Native Ad/Tracker Blocking | ✖ (MV3 kills ext) | ◐ (ETP only) | ✔ (Shields) | ✖ (ext only) | ◐ (inherits FF) | ✖ | ✔ (built-in) | ✖ | **✔** |
| Notification Spam Blocking | ✖ (prompts) | ✔ (default deny) | ✔ | ◐ | ✔ (inherits FF) | ✖ | ◐ | N/A | **✔** |
| Vertical Tab Sidebar | ◐ (2025, basic) | ◐ (extension) | ✖ | ✔ | ✔ | ✔ (Arc) / ✖ (Dia) | ◐ | ✖ | **✔** |
| Migration from Chrome | N/A | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ | **✔** |
| WebExtension Support | ✔ (MV3) | ✔ | ✔ (Chrome exts) | ✔ (Chrome exts) | ✔ (FF exts) | ✖ (Dia) | ✔ (Chrome exts) | ✖ | **✔** |
| AI Page Summarization | ◐ (Gemini) | ✖ | ✔ (Leo) | ✖ | ✖ | ✔ (Dia) | ✔ (Aria) | ✖ | **✔ (local)** |
| Tab Unloading/Hibernation | ✔ | ◐ (manual) | ✖ | ✔ | ◐ | ✖ | ✖ | ✖ | **✔** |
| Zero Telemetry | ✖ | ✖ (opt-out) | ◐ (P3A opt-out) | ✖ | ◐ | ✖ | ✖ | ✔ | **✔** |
| Tab Graveyard / Recovery | ◐ (basic) | ◐ (basic) | ◐ | ◐ | ◐ | ✖ | ◐ | ✖ | **✔ (workspace-scoped)** |
| Profile Export/Import | ◐ | ◐ | ◐ | ◐ | ◐ | ✖ | ◐ | ✖ | **✔ (full)** |
| Command Palette | ✖ | ✖ | ✖ | ✔ (Quick Cmds) | ✖ | ✖ | ✖ | ✔ (`:` mode) | **✔** |
| Memory-Efficient Tab Mgmt | ◐ | ◐ | ◐ | ◐ (hibernation) | ◐ | ✖ | ◐ | ✔ (minimal) | **✔** |
| LLM Sidebar Chat | ◐ (Gemini) | ✖ | ✔ (Leo) | ✖ | ✖ | ✔ (Dia) | ✔ (Aria) | ✖ | **✔ (local-first)** |
| Project-First Workspaces | ✖ | ◐ (Containers) | ✖ | ◐ (cosmetic) | ◐ (basic) | ✔ (Arc, dead) | ✔ (basic) | ✖ | **✔ (full isolation)** |
| Versionable Config | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ (Python) | **✔** |
| Native Vim Keybindings | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | **✔** |
| Theming/Customization | ◐ | ◐ | ◐ | ✔ | ✔ (Mods) | ✖ | ◐ | ✖ | **✔** |
| Keyboard Shortcut Customization | ✖ | ✔ (2025) | ✖ | ✔ | ✖ | ✖ | ✖ | ✔ | **✔** |
| Keyboard-Only Full Nav | ✖ | ◐ | ✖ | ◐ | ✖ | ✖ | ✖ | ✔ | **✔** |
| Per-Workspace Persistence | ✖ | ✖ | ✖ | ✖ | ✖ | ◐ (Arc, dead) | ✖ | ✖ | **✔** |

**Key insight**: qutebrowser leads on keyboard features but has zero web compat (no extensions, no ad blocking). Vivaldi leads on tab management and customization but has no keyboard depth or AI. Brave leads on privacy + AI but has neither workspaces nor keyboard-first design. No single browser covers more than 40% of Aether's target feature set. Aether's competitive advantage is the combination, not any single feature.

---

## 7. Build Priority — Phased Roadmap

### Phase 0: Foundation (Month 1-3)
*Fork Gecko, strip telemetry, establish the privacy contract.*

| Feature | RICE | MoSCoW | Effort |
|---------|------|--------|--------|
| Zero Telemetry Architecture | 5.33 | Must | Low (design-in, not bolt-on) |
| Native Ad/Tracker Blocking | 12.08 | Must | Medium (wire into default profile) |
| Notification Spam Blocking | 10.76 | Should | Trivial (flip default, ~1 day) |

**Success criteria**: Browser boots, loads pages, blocks ads/trackers. Zero network calls to non-user-initiated destinations verified by packet capture. Opt-in crash reporting with transparent disclosure.

**Estimated effort**: 2-3 engineers, 3 months.

### Phase 1: Core Differentiation (Month 3-6)
*The features that make Aether recognizably different from "a Gecko fork."*

| Feature | RICE | MoSCoW | Effort |
|---------|------|--------|--------|
| Vertical Tab Sidebar | 7.45 | Must | Medium |
| WebExtension API Support | 6.65 | Must | Medium (compat testing) |
| Frictionless Migration from Chrome | 7.00 | Must | Medium |
| Native Vim/Modal Keybindings | 4.26 | Should | Medium (TA: effort 3) |
| Native Command Palette / Ex-Mode | 4.83 | Should | Medium |
| Full Keyboard Shortcut Customization | 4.21 | Should | Medium |
| Keyboard Control Over Browser Chrome | 3.33 | Should | Medium |
| Tab Graveyard / Recovery | 4.87 | Should | Low (TA: effort 2) |
| Tab Unloading/Hibernation | 5.41 | Should | Low-Medium |
| Memory-Efficient Tab Mgmt | 4.72 | Should | Medium |

**Dependency chain**: Keybinding infrastructure (Vim + Customization + Command Palette + Chrome Control) is one architectural unit — design together, ship together. Vertical tabs must precede workspaces.

**Success criteria**: A keyboard-first user can import Chrome profile, navigate the entire browser via vim keybindings with no dead zones, manage tabs in a vertical sidebar, and run their existing extensions. This is the "beachhead launch" — the version power users blog about.

**Estimated effort**: 4-6 engineers, 3 months.

### Phase 2: AI & Privacy Platform (Month 6-9)
*The features that create the "holy shit" switching moment for knowledge workers.*

| Feature | RICE | MoSCoW | Effort |
|---------|------|--------|--------|
| Project-First Workspaces | 4.53 | Should | High |
| Per-Workspace Session Persistence | 3.97 | Should | High |
| Sandboxed Identity Profiles | 3.60 | Should | High |
| Intelligent Tab Lifecycle Mgmt | 3.82 | Should | Medium |
| BYOM (Bring Your Own Model) | 2.84 | Should | Low-Medium (TA: effort 3) |
| LLM Sidebar Chat | 4.56 | Should | Medium |
| AI Page Summarization | 6.03 | Should | Medium |
| Prompt Injection Defense | 2.81 | Should | Medium-High (progressive) |
| Profile Export/Import | 4.85 | Should | Medium |
| Keyboard-Only Full Navigation | 4.15 | Should | Ongoing (formalized this phase) |

**Dependency chain**: Workspace infrastructure → Session persistence → Tab lifecycle → AI context. BYOM → LLM Sidebar → AI Summarization. Sandboxed Profiles → Workspace isolation. Prompt injection defense gates all AI features.

**Success criteria**: A knowledge worker can create project workspaces with full state isolation, ask the AI sidebar to summarize research scoped to the current workspace, and switch contexts without cognitive overhead. BYOM works with Ollama. Prompt injection defense provides conservative defaults with human-in-the-loop.

**Estimated effort**: 6-8 engineers, 3 months.

### Phase 3: Polish & Ecosystem (Month 9-12)
*Retention, cross-platform, and ecosystem features.*

| Feature | RICE | MoSCoW | Effort |
|---------|------|--------|--------|
| Cross-Device Sync (E2E Encrypted) | 2.99 | Should | High |
| Theming / Visual Customization | 4.23 | Should | Medium |
| Versionable/Portable Config | 4.30 | Should | Medium |
| Cross-Platform (macOS/Windows) | 2.60 | Should | High |
| Real-Time Privacy Dashboard | 3.24 | Could | Medium |
| Per-Site Privacy Controls | 3.08 | Could | Medium |
| Website Key Stealing Prevention | 3.11 | Should | Low |
| AI Writing Assistance (Inline) | 2.91 | Could | Medium |
| Multi-Model Selection | 2.52 | Could | Low |
| Tree-Structured Tabs | 2.33 | Could | Medium |

**Success criteria**: Users can sync across devices with E2E encryption. macOS and Windows builds pass compat testing. Config is versionable via git. Retention metrics: 60-day retention >40%.

**Estimated effort**: 6-8 engineers, 3 months.

### Phase 4: Agent Infrastructure (Post-Launch)
*Research-adjacent features that benefit from ecosystem maturation.*

| Feature | RICE | MoSCoW | Effort |
|---------|------|--------|--------|
| Local/On-Device AI Inference | 2.44 | Should | Very High |
| Native Agent API Surface | 1.06 | Could | Medium |
| Agent Debugging / Session Replay | 1.15 | Could | Medium |
| MCP Server (Browser as MCP) | 1.61 | Could | Medium |
| Agent Automation (Multi-Step) | 1.29 | Could | Very High |
| Cross-Tab AI Reasoning | 1.38 | Could | High |
| Persistent AI Memory / Context | 1.69 | Could | Medium |
| Semantic Browsing History | 2.42 | Could | Medium |
| Config-as-Code (Real Language) | 2.06 | Could | Medium |
| Adaptive Fingerprint Defense | 2.14 | Could | High |

**Success criteria**: Agent developers can build on Aether's API surface. Local inference works on ≥8GB unified memory / 6GB VRAM hardware. MCP server interoperates with the emerging ecosystem. Agent debugging provides session replay and trace visualization.

**Estimated effort**: Variable — depends on agent ecosystem maturation and hardware trends. Target: begin engineering in Month 12, ship incrementally.

---

*Document compiled from 16 research reports across 5 waves, executive council scoring with 5 perspectives, and 3 validation audits. All claims are traceable to source reports in `docs/research-data/`. Feature scores reflect weighted RICE consensus (PS=1.2×, TA=1.2×, UA/SA/DA=1.0×) with debate transcripts for high-divergence features.*
