# T3: Existing Browser Projects & Feature Gaps

Research conducted: 2026-06-10

---

## Historical Context: The Firefox 57 Extinction Event

**Vimperator** and **Pentadactyl** were the gold-standard vim-Firefox integrations — they used XUL API which gave full browser chrome access. Firefox 57 (Quantum, November 2017) removed XUL in favor of WebExtensions. Neither extension was rewritten. Both died.

- Vimperator: "Vimperator will stop working with Firefox 57... it would require a full rewrite of Vimperator, which nobody has volunteered for." https://github.com/vimperator/vimperator-labs
- Pentadactyl: Discontinued. Wikipedia: https://en.wikipedia.org/wiki/Pentadactyl_%28extension%29
- The WebExtension sandbox fundamentally cannot replicate what XUL allowed: intercept all key events in browser chrome, modify native UI, access internal Firefox APIs.

This event is the defining trauma of the keyboard-browser community. Every solution since 2017 is a compromise.

---

## Current Landscape

### 1. qutebrowser
- **Status**: Active. Sole maintainer (The-Compiler/Freya Bruhin) works part-time funded by donations. Last push: May 2026.
- **Architecture**: Python + Qt/QtWebEngine (Chromium backend)
- **GitHub**: 11,542 stars — https://github.com/qutebrowser/qutebrowser
- **Key features**: Full vim modal UI for browser chrome (not just page); Python config file; command mode `:open`, `:tabopen`; f-hinting; userscripts; QuickMarks; custom search engines; host-based adblocking + python-adblock (Brave-style)
- **Key gaps**:
  - No uBlock Origin (not an extension browser — biggest user complaint)
  - No native Bitwarden/1Password integration (qute-pass userscript exists for pass)
  - Tree-style tabs: WIP PR #8082 (feature has been requested since 2015, issue #927)
  - Per-site cookie persistence: architectural gap in QtWebEngine profile model
  - Video codecs: proprietary codec support requires platform-specific builds; macOS particularly affected
  - Bot detection: CAPTCHAs, Reddit blocking (issue #8599), Anubis instance blocking (issue #8509)
  - Wayland: supported but has had recurring issues; hardware acceleration with AMD+Wayland required fix in Qt ≤6.9
  - Security update cadence: Chromium baseline updated ~every 6 months via Qt releases
  - Python performance: slower than native browsers, higher RAM usage with many tabs

### 2. Nyxt
- **Status**: Active. Pre-release 4.0 (4.0.0-pre-release-8, May 2025). Common Lisp.
- **GitHub**: 10,866 stars — https://github.com/atlas-engineer/nyxt
- **Key features**: Fully programmable in Common Lisp (extends/overrides any browser behavior); multiple renderer support (WebKitGTK, Electron, planned others); mode system; Emacs-style keybindings by default; Gopher/Gemini support
- **Key gaps**:
  - Stability: "I have to kill -9 it multiple times a day — multiple times an hour if using it a lot." (https://hyperion.ser1.net/post/web-browser-reflections/)
  - Learning curve: Common Lisp required for real configuration. "I don't want to learn LISP so I can set my proper keybindings." (HN #28632422)
  - Vim alignment: defaults to Emacs-style bindings; vim users find it misaligned out of the box
  - Still pre-release 4.0 as of mid-2025; production stability uncertain
  - Smaller community than qutebrowser (10.9k vs 11.5k stars, but Nyxt has 160 mentions vs qutebrowser's 473 on LibHunt)

### 3. Tridactyl (Firefox extension)
- **Status**: Active. 6,220 stars. Last AMO update: Feb 2026.
- **GitHub**: https://github.com/tridactyl/tridactyl
- **Key features**: Closest Firefox replacement for Vimperator; custom keybindings to arbitrary JS; `:bind` to any command; native messaging host for deeper integration; ex-commands; hint mode; visual mode; container support
- **Key gaps**:
  - Browser chrome is inaccessible — can't intercept address bar focus, tab bar shortcuts, native dialogs
  - Firefox focus-steal on new tab is a persistent issue (issue #4105)
  - Site-specific breakage: React/SPA focus traps, CSP conflicts (issues #5024, #5128)
  - Updates break configs: every Firefox major version has broken Tridactyl at some point
  - PDF/reader-mode pages disable extensions entirely — no vim keys in PDF or reader mode
  - FIDO2/passkey: passthrough mode needed (issue #956, resolved 2020 but passkeys still fragile)

### 4. Vimium (Chrome/Chromium extension)
- **Status**: Active. 26,539 stars. Last push May 2026.
- **GitHub**: https://github.com/philc/vimium
- **Key features**: f-hinting, J/K tab navigation, o/O for URL/history search, T for tab search, visual mode, custom keybindings
- **Key gaps**:
  - Manifest V3 migration (v2.0) broke bookmarklets on CSP-restricted sites (issue #4331)
  - Cannot control browser chrome (tab bar, address bar, native menus)
  - Vomnibar doesn't integrate tree-style tabs
  - No syncing of config across machines (feature request #4600)
  - Less powerful than Tridactyl (no arbitrary JS binding)
  - New tab page UX: address bar always takes focus, defeating Vimium on new tabs (issue #4741)

### 5. Vimb
- **Status**: Maintained but niche. 1,463 stars. Last push April 2026.
- **Architecture**: C + WebKit2GTK
- **GitHub**: https://github.com/fanglingsu/vimb
- **Key features**: Lightweight C browser, vi-like, no Python/Qt dependency
- **Key gaps**: Very limited adblocking, small contributor base (70 contributors), less feature-complete than qutebrowser

### 6. Luakit
- **Status**: Maintained. 2.4.0 released Feb 2025.
- **Architecture**: C + WebKitGTK, Lua scripting
- **GitHub**: https://github.com/luakit/luakit
- **Key features**: Lua-scriptable, power-user oriented, fast
- **Key gaps**: Small userbase, limited documentation, WebKit2 migration caveats noted in README

### 7. surf (suckless)
- **Status**: Active suckless project.
- **Architecture**: C + WebKit2/GTK+
- **Homepage**: https://surf.suckless.org/
- **Key features**: Minimal codebase (~1,500 LoC), XEmbed support, follows suckless philosophy
- **Key gaps**:
  - No tabs natively — requires external `tabbed` program
  - No built-in password manager
  - No adblocking
  - Navigation via dmenu/external tools, not vim modal
  - Suckless explicitly rejects feature creep — intentionally minimal

### 8. BadWolf
- **Status**: Maintained. 1.4.0 released August 2025.
- **Architecture**: C + WebKitGTK
- **Homepage**: https://hacktivis.me/projects/badwolf
- **Key features**: Privacy-oriented (JS off by default, ephemeral sessions), minimal ~1500 LoC
- **Key gaps**: "The common shortcuts are available, no vi-modal edition or single-key shortcuts" — explicitly does NOT implement vim mode

### 9. Zen Browser (Firefox fork)
- **Status**: Active, significant momentum (2025–2026)
- **Key features**: Arc-inspired vertical tabs, workspaces, split view, smart tab routing (June 2026 feature)
- **Vim alignment**: Very limited. A PR to add basic vim navigation to URL bar (ctrl+j/k) was merged (PR #10518): https://github.com/zen-browser/desktop/pull/10518. Not a keyboard-first browser.
- **Power user assessment**: "The Zen browser might be... a best reincarnation of the dying Firefox for power users" (blog.shiftine.sh) — but this refers to workspace management, not keyboard-first use.

### 10. Vimium C (Chrome extension)
- **Status**: Active. 4,444 stars. Last push Feb 2026.
- **GitHub**: https://github.com/gdh1995/vimium-c
- **Key features**: More actively maintained fork of Vimium concepts; 80k Chrome users
- **Key gaps**: Same fundamental WebExtension sandbox limitations as Vimium

---

## Feature Gap Matrix

| Feature | qutebrowser | Nyxt | Tridactyl (FF) | Vimium (Chrome) | surf | Zen |
|---------|-------------|------|----------------|-----------------|------|-----|
| hjkl page scroll | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (no ext) |
| hjkl in iframes/PDFs | Partial | Partial | ❌ (PDF disabled) | ❌ | Partial | ❌ |
| Command-line URL bar | ✅ | ✅ | ✅ | Partial (vomnibar) | External | ❌ |
| Fuzzy tab search | Partial | ✅ | ✅ | ✅ (T key) | ❌ | ✅ |
| Container/profile isolation | Partial | Partial | ✅ (FF native) | ❌ | ❌ | ✅ |
| uBlock Origin | ❌ | ❌ | ✅ (FF ext) | ✅ (Chrome ext) | ❌ | ✅ |
| Pass/gopass integration | ✅ (userscript) | Partial | ✅ (passff) | ✅ (browserpass) | ❌ | ✅ |
| Custom keybinding remap | ✅ | ✅ | ✅ | ✅ | Patch-based | ❌ |
| Arbitrary scripting | ✅ (Python) | ✅ (Lisp) | ✅ (JS) | ❌ | Patch-based | ❌ |
| Native messaging / external tools | ✅ (userscripts) | ✅ | ✅ | Limited | ❌ | Limited |
| Low resource usage | Moderate | Moderate | Depends on FF | Depends on Chrome | Minimal | Moderate |
| Wayland native | ✅ (with issues) | ✅ | ✅ (via FF) | ✅ (via Chrome) | ✅ | ✅ |
| Tree-style tabs | WIP | Partial | ✅ (ext) | ❌ | ❌ | ✅ |
| Modern site compat | Moderate | Moderate | ✅ | ✅ | Moderate | ✅ |
| uBlock Origin support | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |

**Legend**: ✅ = supported, ❌ = not supported, Partial = works with caveats

---

## Top Unresolved Issues by Project

### qutebrowser
1. Tree-style tabs (#927, 2015-present, 81+ reactions) — https://github.com/qutebrowser/qutebrowser/issues/927
2. Per-site cookie persistence — multiple related issues, architectural
3. Reddit/Anubis blocking (#8599, #8509) — https://github.com/qutebrowser/qutebrowser/issues/8599
4. FIDO2/passkey support (#8533) — https://github.com/qutebrowser/qutebrowser/issues/8533
5. Encrypted password store (#180, 2014-present) — https://github.com/qutebrowser/qutebrowser/issues/180

### Tridactyl
1. Site-specific key capture failures (#5024, #5128)
2. PDF/reader-mode key access (related to #541) — https://github.com/tridactyl/tridactyl/issues/541
3. Firefox native focus steal on new tab (#4105) — https://github.com/tridactyl/tridactyl/issues/4105
4. 898 total open issues — https://github.com/tridactyl/tridactyl/issues

### Vimium
1. Bookmarklets broken by MV3/CSP (#4331) — https://github.com/philc/vimium/issues/4331
2. New tab page UX (#4741) — https://github.com/philc/vimium/issues/4741
3. 877 total open issues — https://github.com/philc/vimium/issues

---

## Pattern: What No Project Solves Well

1. **Full browser chrome keyboard control** — impossible via WebExtension API; requires standalone browser
2. **Modern site compat + keyboard purity** — qutebrowser has keyboard purity but modern-web gaps; Firefox+Tridactyl has compat but API limits
3. **uBlock-quality adblocking + true vim-modal UI** — no single browser has both
4. **Stable, ergonomic pass/Bitwarden integration** — workarounds exist but native integration is absent
5. **Tree-style tabs at scale** — qutebrowser is still shipping this (WIP); Tridactyl delegates to Tree Style Tab extension
6. **Zero configuration-breakage on browser updates** — fundamentally at odds with extension model
