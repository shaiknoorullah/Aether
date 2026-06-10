# Browser Power Users in 2026: Unmet JTBD, Workflows, Pain Points, and Switch Triggers

*Research brief — vim/keyboard-driven, tiling-WM, suckless, and developer users*
*Date: 2026-06-10*

---

## Executive Summary

The keyboard-power-user browser segment is a coherent, vocal, technically sophisticated community of approximately 500k–2M active users globally — with Vimium alone reporting 500k+ weekly active Chrome users. This segment is concentrated heavily on Linux (especially Arch), uses tiling window managers (i3, Sway, Hyprland), treats the browser as a configurable system component like a text editor, and has a defining wound: Firefox 57 (2017) killed the XUL-era Vimperator/Pentadactyl extensions, and no replacement has fully recovered what was lost.

The segment is currently split between two inadequate compromises:
1. **Standalone keyboard-first browsers** (qutebrowser, Nyxt): full vim modal control but modern-web gaps, no uBlock Origin, bot-detection failures, cookie management issues.
2. **Firefox/Chrome + vi extension** (Tridactyl, Vimium): access to modern web and uBlock Origin, but fundamentally capped by the WebExtension sandbox — extensions cannot intercept browser chrome, and site-specific focus traps cause constant breakage.

**The gap no product fills:** a browser that provides (a) full keyboard modal control of all browser chrome — not just page scrolling — (b) uBlock-quality adblocking, (c) native password manager integration without CLI workarounds, (d) complete modern-site compatibility, and (e) stable keybinding config that survives browser updates. Every current option sacrifices at least two of these five.

A product that closes this gap would address a market segment with high willingness to evangelize, strong community influence (Arch/unixporn/HN as distribution channels), and zero brand loyalty to incumbents.

---

## 1. Community Size and Evidence

### Extension Users
- **Vimium (Chrome)**: 500,000+ weekly active users (Chrome Web Store official, March 2026); 26,539 GitHub stars; 170+ contributors. One third-party tracker (ExtDown) shows "4.72M+" total users, but this likely reflects all-time or cumulative count — treat as UNVERIFIED.
- **Vimium-C**: 80,000 Chrome users; 4,444 GitHub stars.
- **Tridactyl (Firefox)**: 6,220 GitHub stars; AMO user count not publicly visible per project README.

### Standalone Keyboard-First Browsers (GitHub Stars, June 2026)
| Browser | Stars | Language | Status |
|---------|-------|----------|--------|
| qutebrowser | 11,542 | Python/Qt | Active (sole maintainer, part-time) |
| Nyxt | 10,866 | Common Lisp | Active (pre-release v4.0) |
| vimb | 1,463 | C | Maintained |
| luakit | ~2,000 | Lua | Maintained (2.4.0, Feb 2025) |
| badwolf | ~200 | C | Maintained (1.4.0, Aug 2025) |

### Linux / Tiling-WM Community
- **Arch Linux**: ~5 million estimated users (2026); 0.9% global desktop Linux share per 2024 survey data.
- **Arch Community Survey** (n=3,923, Jan 2025):
  - **Hyprland**: 26% preferred desktop environment — second only to KDE Plasma (36%)
  - **Firefox**: 58% browser preference; Firefox-based: 17%; Brave: 9%; Chrome: 5%
  - **65%+** prefer CLI over GUI tools
- **Arch pkgstats** (opt-in sample, July 2025):
  - Window managers: i3 12.89%, Sway 12.28%, Hyprland ~10%
  - Editors: Vim 62%, Neovim 35% (multiple installs counted)
  - Browsers: Firefox ~60%, Chromium ~43%
- **r/hyprland**: 50k+ community members (Hyprland launched June 2022 — this is ~3-year growth).

**Inference**: The tiling-WM + vim user base within Arch alone is likely 500k–1.5M people, with significant overlap between Arch/Fedora/NixOS communities. Vimium's 500k weekly active users represents a broader segment including non-Linux users.

---

## 2. Jobs-to-Be-Done

The ten highest-frequency JTBD, derived from community discussions, blog posts, and issue trackers:

**J1 — Navigate without breaking flow state** *(RSI, efficiency)*
"If your hands never left the keyboard, you're saving the time you would have spent switching back and forth hundreds of times." [HowToGeek qutebrowser review] This is the primary motivation. Keyboard control isn't about speed alone — for RSI sufferers it is medical necessity. HN: "I prefer the keyboard due to severe tendonitis... I can use a keyboard all day with no problem. A few hours with a mouse leaves me all swollen and in pain."

**J2 — Control the full browser, not just the page** *(completeness)*
Users want vim keybindings in the address bar, tab bar, settings, download dialogs, and history — not just on web pages. "Qutebrowser fixes the main issue I have with Vimium: you cannot control the browser itself well. Vimium does not work in certain places due to limitations imposed by web extensions and this is incredibly frustrating." [HN #42356668]

**J3 — Manage 50–200 tabs with keyboard alone** *(scale)*
"I want really good tab management... A workspace should be kind of like an editor workspace." [HN #19306243] This includes: fuzzy tab search, tree/hierarchical organization, session save/restore, named workspaces.

**J4 — Block all ads and trackers at uBlock Origin quality** *(privacy + focus)*
uBlock Origin is non-negotiable to this segment. It's cited both as a requirement and as the #1 reason people leave otherwise-adequate keyboard browsers.

**J5 — Configure the browser like I configure my editor** *(dotfiles philosophy)*
Store browser config in a text file, check it into git, reproduce the environment on a new machine. Python config.py (qutebrowser), Lisp init (Nyxt), `about:config` + user.js (Firefox hardening).

**J6 — Integrate with CLI tools I already use** *(Unix philosophy)*
pass/gopass for passwords, fzf/rofi for launchers, mpv for video, zathura for PDFs, wget for downloads. The browser should be one Unix process that talks to others, not a monolith.

**J7 — Open any URL, bookmark, or tab with one keystroke + fuzzy search** *(navigation speed)*
The address bar should be a universal command palette — fuzzy matching history, bookmarks, open tabs, custom commands. Like Telescope in Neovim or rofi.

**J8 — Browse modern sites without bot-detection failures** *(reliability)*
Users accept some web incompatibility as a tradeoff, but being blocked by CAPTCHAs on Google, Reddit, GitLab, and Cloudflare-protected sites is a practical dealbreaker.

**J9 — Keep browsing data local and telemetry-free** *(privacy philosophy)*
Projects like arkenfox, lacuna, and ungoogled-chromium exist because Firefox and Chrome default behaviors are incompatible with this JTBD. The community actively patches and hardens browsers as a practice.

**J10 — Have keybindings that survive browser updates** *(reliability)*
The Firefox 57 extinction of Vimperator/Pentadactyl is a remembered trauma. Users want their investment in muscle memory and config to be durable.

---

## 3. Concrete Pain Points

### P1: WebExtension API ceiling (FUNDAMENTAL)
The most fundamental pain: extensions cannot intercept keyboard events in browser chrome (address bar, tab bar, native dialogs). This is an architectural limit of the WebExtension API, not a Vimium/Tridactyl bug. Mozilla was prepared to accept a lower-level keyboard API patch but no one completed the months-long review process. [HN #24636650] Every extension is built on top of this ceiling.

### P2: Site-specific keyboard capture failures
React, Next.js, and other SPA frameworks frequently steal keyboard focus from extensions. Tridactyl documents multiple workarounds (`:seturl $URL noiframe true`, `:set allowautofocus true`) but these require per-site manual configuration. Issues #5024 and #5128 show this is an ongoing, unsolved problem in 2024–2025.

### P3: qutebrowser — no uBlock Origin
The #1 cited reason for leaving qutebrowser. python-adblock (Brave-style) is genuinely inferior to uBlock Origin's cosmetic filtering, element zapper, and scriptlet injection. No workaround exists — qutebrowser is not a WebExtension browser.

### P4: qutebrowser — bot detection failures (2024–2025)
Reddit actively blocks qutebrowser [issue #8599, June 2025]. Google CAPTCHAs are triggered constantly [issue #8703]. GitLab.gnome.org blocks by Chromium version string [issue #8509]. These are not fixable by the qutebrowser maintainer — they depend on site operators updating bot-detection rules.

### P5: qutebrowser — per-site cookie persistence
Sessions don't persist login state per site. Users must re-authenticate every session. This caused at least one 2-year sponsored user to switch away [port19.xyz]. Architectural root: QtWebEngine profile model.

### P6: Firefox focus steal on new tab (Tridactyl/Vimium)
When opening a new tab, Firefox gives the address bar focus, not the page. Extensions cannot intercept this. The only workarounds are indirect and unreliable. This breaks muscle memory on every new tab.

### P7: Tridactyl/Vimium config breakage on browser updates
Firefox and Chrome major version updates regularly break extension behavior. The Firefox 57 event eliminated two major extensions permanently. Today's users live with a lower-grade version of this fear. Tridactyl issue #290 and the recurring "breaks sometimes when updating" pattern confirm this.

### P8: Tree-style tabs missing in qutebrowser
Requested since September 2015. 81+ reactions. A work-in-progress PR (#8082) exists but is not merged. Users with hundreds of tabs have no tree organization option. This is available in Firefox via the Tree Style Tab extension — another advantage of the extension ecosystem.

### P9: Manifest V3 regressions in Vimium
MV3 migration broke bookmarklets on CSP-restricted sites [issue #4331]. The new API also restricts dynamic script injection, which limits extension power in ways that specifically hurt power users who relied on bookmarklets for quick actions.

### P10: Password manager integration friction
qutebrowser's qute-pass userscript emulates keystrokes for `[USER]<Tab>[PASSWORD]`. This is fragile (form structure variations break it), requires pass to be configured, and has no fallback for Bitwarden/1Password users. Bitwarden users on qutebrowser have no first-class solution.

### P11: qutebrowser security lag
Chromium baseline update every ~6 months via Qt release cycle. Security patches backported 1–2 months behind upstream. Stable distros (Debian/Ubuntu) may lag further. For a browser this is a meaningful attack surface exposure.

### P12: Nyxt stability and learning curve
Nyxt freezes requiring `kill -9` multiple times per day [hyperion.ser1.net]. Common Lisp configuration is a steep barrier for vim users who don't use Emacs. The project's defaults are Emacs-style, not vim-style, creating an immediate mismatch.

---

## 4. Existing Browser Landscape

### The Gap Nobody Fills
The fundamental split: **standalone keyboard browsers** (qutebrowser/Nyxt) give full control but lack modern-web features; **extension-based vim layers** (Tridactyl/Vimium) have modern-web compat but hit a hard ceiling from the WebExtension sandbox.

| | Full keyboard browser chrome | uBlock Origin quality | Modern site compat | Native pass/PM | Stable config |
|-|------|------|------|------|------|
| qutebrowser | ✅ | ❌ | Partial | Partial (userscript) | ✅ |
| Nyxt | ✅ | ❌ | Partial | Partial | Partial (unstable) |
| Firefox + Tridactyl | ❌ | ✅ | ✅ | ✅ | ❌ (breakage risk) |
| Chrome + Vimium | ❌ | ✅ | ✅ | ✅ | ❌ (MV3 risk) |
| surf | Partial | ❌ | Partial | ❌ | ✅ (patch-based) |

**The Vimperator/Pentadactyl generation had all five via XUL.** No current solution does.

### Key Historical Lesson
Vimperator and Pentadactyl died because they were built entirely on XUL — a privileged API Mozilla eventually removed. Any keyboard browser built as an extension today faces the same structural risk: the browser vendor controls the API, and WebExtension API limitations are not going away.

This is why several community members have moved to qutebrowser or Nyxt despite their modern-web limitations: at least those browsers are standalone applications not subject to extension API deprecation.

---

## 5. Tooling Overlap (What CLI Tools Replace Browser Functions)

| Browser Function | Why Browser Fails | External Tool | Evidence |
|-----------------|-------------------|--------------|---------|
| Tab/bookmark search | No fuzzy global launcher | rofi + tabflow, fzf | tabflow (GitHub), fzf docs |
| Password autofill | No first-class pass integration | browserpass, passff | browserpass repo |
| PDF reading | No vi-keys in PDF viewer | zathura (inference) | Community ethos; no single source |
| Video | No mpv-quality video | mpv (inference) | Community ethos |
| Downloads | No wget-style control | wget/curl (inference) | Community ethos |
| RSS/reading | Reader mode insufficient | newsboat | Widely used in unixporn community |

**Note**: zathura/mpv/wget as browser replacements are established community practice but I did not find a single authoritative source enumerating all three. Items marked "inference" derive from community ethos, not a specific cited source.

---

## 6. Switch Triggers (Ranked by Frequency)

What would cause this segment to switch to a new browser product:

**ST1 — uBlock Origin quality adblocking** *(CRITICAL)*
The single most-cited reason power users leave keyboard-first standalone browsers. Any new browser targeting this segment must either natively support uBlock Origin or implement equivalent cosmetic filtering, element zapping, and scriptlet injection. "Good enough" alternatives are explicitly rejected.

**ST2 — Full keyboard control of all browser chrome**
Not just page scrolling: address bar, tab bar, dialog boxes, download panel, settings. Everything accessible without mouse. This is what qutebrowser provides and what Vimium fundamentally cannot.

**ST3 — Native password manager integration (pass/Bitwarden)**
First-class, not via fragile userscript workarounds. Bitwarden CLI or native messaging host for pass. The workflow: key combo → fuzzy-search credential → autofill. No clipboard exposure.

**ST4 — Stable config that survives browser updates**
Version-controlled text config (Python, Lua, TOML, JSON) that is not coupled to browser API version. If a browser update changes behavior, it should not silently break keybindings.

**ST5 — Tree-style tabs at scale**
Hierarchical tab management, keyboard-navigable, supporting 100–1000+ tabs. This is demanded by research-heavy users, and no keyboard-first browser currently ships it (qutebrowser WIP).

**ST6 — Modern web compatibility without bot-detection failures**
Reddit, Google, Cloudflare-protected sites, noVNC/Proxmox, modern SPA apps. The browser must pass as a mainstream browser to bot-detection systems.

**ST7 — Privacy controls without manual CLI flags or user.js maintenance**
Built-in WebRTC disable, canvas API blocking, first-party isolation, no telemetry — surfaced through a normal settings UI, not requiring `about:config` archaeology.

**ST8 — Wayland-native, no screen tearing**
With 80% of Arch users on Wayland (2025 survey), a browser with XWayland fallback or flickering issues is a real-world friction point.

**ST9 — Developer tooling at Firefox/Chrome DevTools quality**
Network inspector, CSS live-editing, accessibility tree. qutebrowser uses QtWebEngine's DevTools (Chromium-derived) which is adequate but not the polished experience developers expect.

**ST10 — Zero telemetry, no account requirement, no cloud sync**
All data stays local. No sign-in prompt. No sponsored shortcuts. The community has projects (arkenfox, lacuna, ungoogled-chromium) dedicated to removing these from mainstream browsers — the signal is that they're highly valued requirements.

---

## 7. Feature Taboo

| Pattern | Evidence |
|---------|---------|
| Telemetry / "phone home" | arkenfox, lacuna, ungoogled-chromium: dedicated projects to remove browser telemetry |
| Auto-updates breaking config | Vimperator extinction; recurring Tridactyl breakage issues |
| Mouse-only UI elements | "Keyboard shortcuts are an afterthought" [HN #19306243]; RSI motivation |
| Cloud sync of browsing data | Conflict with local-only dotfile philosophy and privacy requirements |
| Sponsored shortcuts / Pocket | Firefox hardening guides consistently cite these as first-to-remove |
| Excessive startup runtime (Python/Qt) | "Dependencies take up more space than Firefox itself" [brycev.com] |
| Modal dialogs that capture input unexpectedly | qutebrowser issue #6136: "A dialog box appears and takes key presses" |
| Browser accounts (Google/Firefox accounts) | Privacy and local-control concerns |

---

## 8. Open Questions

1. **What fraction of the 500k Vimium users are on Linux vs. macOS/Windows?** macOS power users likely overlap significantly, and their pain points (Cmd vs. Ctrl, no WM) differ.
2. **How large is the NixOS/Fedora/Ubuntu tiling-WM community?** These users share most behaviors with the Arch segment but are harder to quantify.
3. **Will Manifest V3 stabilize or further restrict extension capabilities over 2026–2027?** Mozilla's more permissive MV3 may create a Firefox-extension advantage.
4. **Is the Nyxt 4.0 release (Common Lisp browser) stabilizing?** The pre-release status and kill-9 reports suggest it's not yet production-quality, but trajectory matters.
5. **How much of the tiling-WM community uses Wayland exclusively vs. still on X11?** The 80% Wayland figure is specific to Arch.
6. **Are there meaningful DevTools requirements differences between developers (who use DevTools heavily) and non-developer power users?** This affects whether a keyboard browser needs fully-featured DevTools or can ship lighter tooling.

---

## 9. Recommended Next Steps

1. **Design priority**: Build around the five-requirement gap: full chrome keyboard control + uBlock-quality adblocking + native pass/PM + modern site compat + stable config. Every design decision should trace to this checklist.
2. **Engine choice implication**: The WebExtension API ceiling argues for a standalone browser (Firefox fork, Chromium fork, or custom shell), not a privileged extension. Extensions cannot solve P1/P2 (browser chrome control, focus steal).
3. **Community entry point**: r/unixporn, r/hyprland, qutebrowser IRC/Matrix, Tridactyl GitHub issues, and HN are the primary distribution channels. Early adopters should be recruited from these communities for feedback.
4. **Keybinding philosophy**: Default to vim-modal (normal/insert/command mode), but make mode switching and keybinding remapping fully programmable — suckless users and Emacs users both exist in this segment.
5. **Feature priority order** (from switch triggers): (1) uBlock Origin or equivalent, (2) full keyboard chrome, (3) pass/Bitwarden native, (4) tree-style tabs, (5) modern site compat, (6) stable config format.
6. **Minimal viable differentiation**: A Firefox fork with deep vim-modal keyboard chrome integration, stable config format, and first-class pass/Bitwarden would outperform every current option for the Tridactyl user segment — without requiring new engine investment.

---

## Sources (Inline Links in Text Above)

Key sources referenced throughout:
- Arch Linux Community Survey (n=3923, Jan 2025): https://linuxiac.com/arch-linux-community-survey-results/
- Arch pkgstats analysis (July 2025): https://linuxiac.com/insights-into-arch-linux-users-preferences/
- Vimium Chrome Web Store: https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb
- qutebrowser GitHub: https://github.com/qutebrowser/qutebrowser
- Nyxt GitHub: https://github.com/atlas-engineer/nyxt
- Tridactyl GitHub: https://github.com/tridactyl/tridactyl
- HN: qutebrowser keyboard browser thread: https://news.ycombinator.com/item?id=42356668
- HN: keyboard-centric power user browser: https://news.ycombinator.com/item?id=19306243
- port19.xyz farewell to qutebrowser: https://port19.xyz/tech/bye-qutebrowser/
- paritybit.ca: switch from qutebrowser: https://www.paritybit.ca/blog/qutebrowser-to-firefox/
- brycev.com: switch to Firefox: https://brycev.com/blog/why-i-am-switching-to-firefox/
- qutebrowser Reddit blocking: https://github.com/qutebrowser/qutebrowser/issues/8599
- qutebrowser CAPTCHA issue: https://github.com/qutebrowser/qutebrowser/issues/8703
- qutebrowser tree-style tabs: https://github.com/qutebrowser/qutebrowser/issues/927
- Tridactyl site-specific breakage: https://github.com/tridactyl/tridactyl/issues/5024
- Tridactyl Firefox focus steal: https://github.com/tridactyl/tridactyl/issues/4105
- Vimium MV3 bookmarklet regression: https://github.com/philc/vimium/issues/4331
- Vimperator discontinuation: https://github.com/vimperator/vimperator-labs
- Nyxt stability review: https://hyperion.ser1.net/post/web-browser-reflections/
- Nyxt Lisp barrier: https://news.ycombinator.com/item?id=28632422
- browserpass: https://github.com/browserpass/browserpass-extension
- rofi tab switching (tabflow): https://github.com/snpshtwrx/tabflow
- fzf browser history: https://junegunn.github.io/fzf/examples/chrome/
- arkenfox/user.js: https://github.com/hnhx/user.js
- lacuna: https://github.com/woolkingx/lacuna
- ungoogled-chromium: https://github.com/ungoogled-software/ungoogled-chromium
- Hyprland community size: https://cavecreekcoffee.com/reviews/best-linux-tiling-window-manager-2026/
- HN: WebExtension keyboard API limitation: https://news.ycombinator.com/item?id=24636650
