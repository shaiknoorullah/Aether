# Browser Power Users in 2026: Unmet JTBD, Workflows, Pain Points, and Switch Triggers

*Research brief — vim/keyboard-driven, tiling-WM, suckless, and developer users*
*Date: 2026-06-10 | Status: Cited & Verified*

---

## Executive Summary

The keyboard-power-user browser segment is a coherent, technically sophisticated community that is large enough to matter as an early-adopter base. Vimium alone reports 500,000+ weekly active Chrome users [1]. Arch Linux — a reasonable proxy for this segment's OS of choice — has an estimated ~5 million users [2], of whom ~80% run Wayland and ~26% preferred Hyprland as their desktop environment in the January 2025 community survey (n=3,923) [3].

This segment shares a defining wound: Firefox 57 (2017) eliminated the XUL-era Vimperator and Pentadactyl extensions when Mozilla moved to WebExtensions [4]. No replacement has fully closed the gap. Users are stuck between two inadequate compromises:

1. **Standalone keyboard-first browsers** (qutebrowser, Nyxt): full vim modal control of browser chrome, but no uBlock Origin, persistent bot-detection failures, per-site cookie gaps.
2. **Firefox/Chrome + vi extension** (Tridactyl, Vimium): full modern-web compat and uBlock Origin, but capped by the WebExtension sandbox — extensions cannot intercept browser chrome events, and SPA focus traps cause constant site-specific breakage.

**The gap no product fills**: a browser offering full keyboard modal control of all browser chrome *plus* uBlock-quality adblocking *plus* native password manager integration *plus* complete modern-site compatibility *plus* stable config that survives browser updates. Every current option sacrifices at least two of these five.

---

## 1. Community Size & Evidence

### Extension Install Counts

| Project | Platform | Users | Source |
|---------|----------|-------|--------|
| Vimium | Chrome Web Store | **500,000+ weekly active** | [1] Chrome Web Store (official) |
| Vimium | GitHub | 26,539 stars, 2,578 forks, 170 contributors | [5] github.com/philc/vimium |
| Vimium-C | Chrome Web Store | **80,000 users** | [6] Chrome Web Store |
| Vimium-C | GitHub | 4,444 stars | [7] github.com/gdh1995/vimium-c |
| Tridactyl | Firefox AMO | Not publicly disclosed (maintainers note devs can see internally) | [8] tridactyl README |
| Tridactyl | GitHub | **6,220 stars**, 431 forks | [9] github.com/tridactyl/tridactyl |

**Note on Vimium user count**: A third-party tracker (ExtDown) shows "4.72M+" [10]; the Chrome Web Store official page shows "500,000+" weekly active. The discrepancy likely reflects all-time vs. weekly-active. The 500k figure is used throughout this report as the more conservative and verifiable figure.

### Standalone Keyboard-First Browsers

| Browser | Stars (June 2026) | Language | Last Significant Activity |
|---------|-------------------|----------|--------------------------|
| qutebrowser | **11,542** | Python/Qt | Last push May 2026 [11] |
| Nyxt | **10,866** | Common Lisp | Pre-release 4.0 active, last push Feb 2026 [12] |
| vimb | 1,463 | C | Last push April 2026 [13] |
| luakit | ~2,000 | Lua | v2.4.0 released Feb 2025 [14] |
| badwolf | ~200 (sr.ht) | C | v1.4.0 released Aug 2025 [15] |

### Linux / Tiling-WM Community

**Arch Linux** (opt-in pkgstats, live data, pkgstats.archlinux.de [16]):
- Window Manager installs: Hyprland **21.30%**, Sway **11.33%**, i3-wm **10.41%**, weston 9.31%, niri 6.96%, openbox 6.52%
  - *Note: percentages are of pkgstats-reporting machines; participants are self-selected, skewing toward power users*
- December 2025 figures (linuxiac analysis [17]): i3 12.75%, Hyprland 12.58%, Sway 12.43% — suggesting Hyprland has accelerated further in early 2026 (current pkgstats show it pulling ahead at 21.30%)

**Arch Community Survey** (n=3,923, January 2025) [3]:
- **Hyprland**: 26% preferred desktop environment — 2nd after KDE Plasma (36%)
- **Firefox**: 58% preferred browser; Firefox-based: 17%; Brave: 9%; Chrome: 5%
- **65%+** prefer CLI over GUI tools
- ~80% prefer Wayland over X11

**Arch Linux user base**: ~5 million estimated (2026) [2]; 0.9% global desktop Linux market share per 2024 survey data [18].

**r/hyprland**: 50k+ members (community launched June 2022 — ~3.5 year growth) [19].

**Arch editor installs** (pkgstats): Vim 62%, Neovim 35% of opt-in sample [20]. Confirms this population is heavily vim-oriented.

**Estimated addressable size**: If Arch has ~5M users, and tiling WMs account for ~35% of WM installs, that's ~1.75M Arch tiling-WM users. Add Fedora, NixOS, Ubuntu power users using tiling WMs. Vimium's 500k weekly active users provides a cross-platform lower bound. Working estimate: **1–3 million keyboard-power-user browser users globally**, with the Arch/Linux-native sub-segment being most concentrated and influential.

---

## 2. Jobs-to-Be-Done

The 10 highest-frequency JTBDs derived from community discussions, blog posts, and issue trackers:

**J1 — Navigate without breaking flow state (RSI + efficiency)**
"If your hands never left the keyboard, you're saving the time you would have spent switching back and forth hundreds of times." [21] For RSI sufferers it is medical necessity: "I prefer the keyboard due to severe tendonitis in my wrist and arthritis in my hands. I can use a keyboard all day with no problem. A few hours with a mouse leaves me all swollen and in pain." [22]

**J2 — Control the full browser, not just the page**
"Qutebrowser fixes the main issue I have with Vimium: you cannot control the browser itself well. Vimium does not work in certain places due to limitations imposed by web extensions and this is incredibly frustrating for me." [22] Users want vim keybindings in the address bar, tab bar, download dialogs, and settings — not just page content.

**J3 — Manage 50–200+ tabs with keyboard alone**
"I want really good tab management built in through some kind of workspace... Power user features like keyboard shortcuts are an afterthought [in major browsers]." [23] This requires: fuzzy tab search, tree/hierarchical organization, session save/restore, named workspaces.

**J4 — Block all ads and trackers at uBlock Origin quality**
uBlock Origin is a hard requirement, not a preference. It is the #1 reason power users leave otherwise-adequate keyboard browsers [24, 25].

**J5 — Configure the browser like I configure my text editor**
Store config in a version-controlled text file, reproduce on a new machine. Python config.py (qutebrowser), Lisp init (Nyxt), user.js (Firefox). The browser is treated as a system component.

**J6 — Integrate with CLI tools I already use (Unix philosophy)**
pass/gopass for passwords, fzf/rofi for launchers, mpv for video, zathura for PDFs. The browser should be one Unix process that communicates with others. Evidence: dedicated projects exist for rofi tab-switching [26, 27, 28], fzf history search [29], pass integration [30, 31, 32].

**J7 — Open any URL, bookmark, or tab with one keystroke + fuzzy search**
The address bar should be a universal command palette — fuzzy matching across history, bookmarks, open tabs, custom commands. Analogous to Telescope (Neovim) or rofi.

**J8 — Browse modern sites without bot-detection failures**
qutebrowser users are blocked by Reddit [33], Google CAPTCHAs [34], GitLab [35], and Anubis-protected sites. Users accept some web incompatibility but systematic blocking is a dealbreaker.

**J9 — Keep browsing data local and telemetry-free**
Projects like arkenfox (https://github.com/hnhx/user.js) [36], lacuna [37], and ungoogled-chromium [38] exist specifically because Firefox and Chrome default behaviors conflict with this JTBD.

**J10 — Have keybindings that survive browser updates**
The Firefox 57 extinction of Vimperator/Pentadactyl is a remembered community trauma [4]. Today's users experience a lower-grade version via recurring Tridactyl and Vimium breakage after browser updates.

---

## 3. Concrete Pain Points

### P1 — WebExtension API ceiling (FUNDAMENTAL ARCHITECTURAL LIMIT)
Extensions cannot intercept keyboard events in browser chrome (address bar, tab bar, native dialogs). This is a hard API limit, not a bug. Mozilla was prepared to accept a lower-level keyboard API patch but no contributor completed the months-long review process [39]. Every extension-based vim layer lives inside this ceiling.

### P2 — Site-specific keyboard capture failures (SPA/React focus traps)
React, Next.js, and SPA frameworks frequently steal keyboard focus from extensions. Tridactyl documents multiple per-site workarounds. Issues #5024 [40] and #5128 [41] (both 2024) show this is an ongoing unsolved problem. The troubleshooting guide [42] lists at least 4 per-site fix patterns.

### P3 — qutebrowser: no uBlock Origin *(most cited exit reason)*
"The lack of Ublock Origin makes browsing random sites horrible. People say the builtin ad blockers are good enough; for me, they are not even remotely good enough." [22] "uBlock Origin is vastly superior to brave-style adblocking provided to Qutebrowser by python-adblock." [25] No workaround exists — qutebrowser does not support WebExtensions.

### P4 — qutebrowser: systematic bot-detection failures (2024–2025)
Reddit actively blocks qutebrowser [33, opened June 2025]. Google triggers CAPTCHAs constantly [34]. GitLab.gnome.org blocks by Chromium version string [35]. qutebrowser 3.5.0 changed its default UA string to mitigate some blocking [43], but Anubis bot-detection varies by exact version and still causes breakage.

### P5 — qutebrowser: per-site cookie persistence missing
"The continued lack of per-site cookie persistence resulted in me having to log into every account on each new browser session." [25] This caused a 2-year sponsored user to migrate. Root cause: QtWebEngine profile model architecture.

### P6 — Firefox focus steal on new tab (Tridactyl / Vimium)
When opening a new tab, Firefox gives the address bar focus, defeating extension key capture. "When I open Firefox, the native interface immediately gets input focus of keyboard, and I need to click with the cursor inside the page area... the same annoying behavior occurs when I use CTRL-T." [44] Extensions cannot override this.

### P7 — Tridactyl / Vimium config breakage on browser updates
Firefox and Chrome major versions regularly break extension behavior. Tridactyl issue #290 [45] and the pattern of recurring breakage confirm this. The Firefox 57 Quantum release eliminated two major extensions permanently [4]. Today's Tridactyl users live with a lower-severity version of this risk continuously.

### P8 — qutebrowser: tree-style tabs missing
Requested since September 2015. Issue #927: 81 reactions (👍) [46]. A work-in-progress draft PR (#8082) [47] is open as of June 2026 but unmerged. Power users managing hundreds of tabs need hierarchical organization; a flat tab bar fails at scale.

### P9 — Manifest V3 regression: bookmarklets broken in Vimium
"When opening bookmarklets via the Vomnibar, they will fail to run if the page has a restrictive CSP. This is a new limitation in Vimium v2.0 because we've moved to Manifest v3." [48] MV3 also restricts dynamic script injection, limiting customization patterns that power users relied on.

### P10 — Password manager integration friction
qutebrowser's qute-pass userscript [32] emulates keystrokes for credential entry. It is fragile (breaks on non-standard form structures) and requires pass. Bitwarden/1Password users have no first-class solution. "The lack of a solid Bitwarden integration in QuteBrowser is kind of hurting though." [22] "I switched back [to Firefox] partly because KeePassXC's extension makes entering credentials far more convenient." [49]

### P11 — qutebrowser: QtWebEngine security update lag
Chromium baseline update cycle: every ~6 months via Qt release. Security patches backported 1–2 months behind upstream [50]. Stable Linux distros (Debian/Ubuntu) may lag further without backporting. This is a meaningful attack surface for a browser.

### P12 — Nyxt: stability and Lisp learning curve
Nyxt freezes requiring `kill -9` multiple times per day per one reviewer [51]. "I don't want to learn LISP so I can set my proper keybindings." [52] Nyxt defaults to Emacs-style keybindings, not vim-style — a mismatch for the majority of this segment who are vim users.

---

## 4. Existing Browser Landscape

### The Historical Break: Firefox 57 (2017)
Vimperator and Pentadactyl were the gold standard — XUL API gave full browser chrome access. Firefox 57 removed XUL. "It would require a full rewrite of Vimperator, which nobody has volunteered for." [4] Pentadactyl is discontinued [53]. No current solution restores what was lost.

This is the defining constraint on every current option: the WebExtension API was designed for average users, not keyboard-modal browser control.

### Current Solutions: The Unavoidable Tradeoffs

| | Full keyboard browser chrome | uBlock-quality adblocking | Modern site compat | Native pass/PM | Config stability |
|-|------|------|------|------|------|
| **qutebrowser** | ✅ | ❌ | Partial | Partial (userscript) | ✅ |
| **Nyxt** | ✅ | ❌ | Partial | Partial | Partial (pre-release) |
| **Firefox + Tridactyl** | ❌ | ✅ | ✅ | ✅ | ❌ (breakage risk) |
| **Chrome + Vimium** | ❌ | ✅ | ✅ | ✅ | ❌ (MV3 risk) |
| **surf (suckless)** | Partial | ❌ | Partial | ❌ | ✅ (patch-based) |
| **Zen Browser** | ❌ | ✅ (via FF ext) | ✅ | ✅ (via FF ext) | ❌ (ext-based) |

*The Vimperator/Pentadactyl generation had all five via XUL. No current solution does.*

### Project Status Summary

**qutebrowser** [11]: 11,542 stars. Active sole maintainer (part-time, donation-funded). Major known gaps: no uBlock Origin, no Bitwarden native, tree-style tabs WIP (draft PR #8082), per-site cookie persistence, bot-detection failures. Security: ~6-month Chromium baseline lag. Wayland support present but has had recurring issues requiring workarounds.

**Nyxt** [12]: 10,866 stars. Common Lisp, programmable from the ground up. Pre-release 4.0 as of May 2025. Key problems: stability (kill-9 reports), Emacs-default keybindings, steep Lisp learning curve. Conceptually the most powerful but least production-ready.

**Tridactyl** [9]: 6,220 stars, last AMO update Feb 2026. Closest Firefox replacement for Vimperator. Hard limits: browser chrome inaccessible via WebExtension API, site-specific focus traps, PDF/reader mode disables extensions.

**Vimium** [5]: 26,539 stars, 500k+ weekly active users. Simplest and most accessible. Hard limits: same WebExtension ceiling as Tridactyl. MV3 migration introduced bookmarklet regression. Less powerful than Tridactyl for custom scripting.

**Zen Browser** [54]: Firefox fork with Arc-inspired UI, significant momentum in 2025–2026. A PR adding basic vim navigation to the URL bar (Ctrl+J/K) was merged [54]. Not keyboard-first; targets visual/workspace organization users.

**surf** [55]: suckless philosophy. No tabs natively (requires `tabbed` utility). No adblocking, no password manager. Intentionally minimal — a philosophical statement, not a daily driver for most.

---

## 5. Documented Workflows

### W1: tiling-WM browser as a keyboard-controlled tile
Users run the browser as just another tiled window in i3/Hyprland/Sway. The browser must: open/close via WM keybinding, not demand mouse for any interaction, not spawn modal dialogs that grab focus away from the WM. A project named `dumber` explicitly targets this: "keyboard-driven web browser for tiling WMs, inspired by Zellij" with support for rofi, dmenu, Hyprland, Sway, Niri. [56]

### W2: rofi/dmenu for tab switching and bookmark launching
External launchers substitute for the missing keyboard-accessible tab/bookmark search:
- `tabflow`: "Easily switch and create tabs in Firefox using Rofi/fzf/dmenu" [26]
- `brave-rofi-menu`: "Switch Brave tabs using i3 and rofi" [27]
- `webextension-dmenu`: "Tab search, selection and beyond with a dmenu filter program" [28]
- Firefox bookmark menu via dmenu/rofi/fzf (gist, updated Dec 2025) [57]

These projects exist because browsers don't expose tab/bookmark data to global WM launchers.

### W3: fzf for history and bookmark search
Power users pipe browser history/bookmarks into fzf for fuzzy CLI search. The official fzf documentation includes a Ruby script example for Chrome history/bookmarks [29] — a signal that this is a widely-documented pattern, not an edge case.

### W4: pass + browser via native messaging
The UNIX password store (`pass`) is widely used in this community. Integrations:
- `browserpass` [30]: Go native messaging host for Chrome+Firefox, autofills from pass store, phishing-protected by domain verification
- `passff` [31]: Firefox-specific pass extension
- `qute-pass` [32]: qutebrowser userscript using `fake-key` to inject credentials

### W5: External tools replacing browser functions (tooling overlap)

| Browser Job | Tool Used | Why Browser Fails |
|-------------|-----------|-------------------|
| Tab/bookmark search | rofi + tabflow, fzf | No global fuzzy launcher |
| Password entry | pass + browserpass / qute-pass | Browser PM requires cloud or lacks pass support |
| PDF reading | zathura (*inference*) | No vi-keys in browser PDF viewer |
| Video playback | mpv (*inference*) | Browser video not scriptable/controllable |
| RSS/reading | newsboat | Reader mode insufficient, no queue management |

*Items marked "inference" reflect community ethos and common dotfile setups but no single authoritative source was found enumerating these as explicit browser replacements.*

---

## 6. Switch Triggers (Ranked by Frequency of Evidence)

**ST1 — uBlock Origin quality adblocking** *(CRITICAL — most-cited exit reason)*
Multiple blog posts and HN comments cite this as the primary reason for leaving keyboard-first standalone browsers. Any new browser targeting this segment must natively support uBlock Origin or provide equivalent cosmetic filtering + scriptlet injection. "Good enough" alternatives are explicitly rejected. [22, 24, 25]

**ST2 — Full keyboard control of all browser chrome**
Address bar, tab bar, dialogs, settings — everything without a mouse. This is what qutebrowser provides and what no extension can. Users who have experienced this feel "Vimium is not the same." [22]

**ST3 — Native password manager integration (pass / Bitwarden)**
First-class integration, not fragile userscript workarounds. Target workflow: keybind → fuzzy-search credential → autofill, no clipboard exposure. [22, 49]

**ST4 — Stable config that survives browser updates**
Version-controlled text file (Python, Lua, TOML) decoupled from browser API version. The Firefox 57 trauma and recurring Tridactyl breakage are the motivators. [4, 45]

**ST5 — Tree-style tabs at scale**
qutebrowser issue #927 (2015-present, 81+ reactions) [46]. Brave browser issue #44345 documents the same need: "Is hierarchical... I sometimes have hundreds or thousands of tabs open." [58]

**ST6 — Modern web compatibility without bot-detection failures**
Reddit, Google, Cloudflare-protected sites, Proxmox noVNC, modern SPA apps must work. Users accept some tradeoffs but systematic blocking is a dealbreaker. [33, 34, 49]

**ST7 — Privacy controls without manual user.js maintenance**
WebRTC disable, canvas API blocking, first-party isolation, no telemetry — exposed through normal settings UI, not `about:config` archaeology. Projects arkenfox [36], lacuna [37], and ungoogled-chromium [38] all exist to provide this on top of mainstream browsers.

**ST8 — Wayland-native, no screen tearing**
With ~80% of Arch users on Wayland [3] and Hyprland at 21.30% of WM installs [16], a browser with persistent Wayland issues is a real friction point in 2026.

**ST9 — Developer tooling at Firefox/Chrome DevTools quality**
Network inspector, CSS live-editing, accessibility tree. Cited as a reason to prefer Firefox over qutebrowser. [49]

**ST10 — Zero telemetry, no account requirement, no cloud sync**
All data stays local. No sign-in prompt. No sponsored shortcuts. The existence and popularity of arkenfox, lacuna, and ungoogled-chromium projects signals how strongly this is valued. [36, 37, 38]

---

## 7. Feature Taboo List

| Pattern | Evidence |
|---------|---------|
| Telemetry / background network activity | arkenfox [36], lacuna [37], ungoogled-chromium [38] |
| Auto-updates silently breaking configs | Vimperator extinction [4]; recurring Tridactyl breakage [45] |
| Mouse-only UI elements | "Keyboard shortcuts are an afterthought" [23]; RSI motivation [22] |
| Cloud sync of browsing data | Conflicts with local-only dotfile philosophy; privacy concerns |
| Sponsored shortcuts / Pocket | Firefox hardening guides cite these as first-to-remove [36] |
| Excessive startup dependencies (Python/Qt) | "Dependencies take more space than Firefox itself" [24] |
| Modal dialogs capturing unexpected input | qutebrowser issue #6136 [59]: "A dialog box appears and takes key presses" |
| Browser account sign-in prompts | Privacy and local-control concerns; philosophy of self-managed credentials |

---

## 8. Open Questions

1. **What fraction of Vimium's 500k weekly users are on Linux vs. macOS/Windows?** macOS power users (no tiling WM native, Cmd-key differences) likely overlap but have distinct needs.
2. **How large is the NixOS/Fedora tiling-WM community?** These users share most behaviors with the Arch segment but are harder to quantify.
3. **Will MV3 further restrict extension capabilities in 2026–2027?** Mozilla's MV3 is more permissive than Chrome's [60]; this differential may widen and create a Firefox-extension advantage.
4. **Is Nyxt 4.0 on a stability trajectory?** The pre-release status and kill-9 reports [51] suggest it's not yet production-quality; if stabilized, it becomes a stronger alternative.
5. **How much of the tiling-WM community has fully migrated to Wayland?** The 80% Wayland figure is Arch-specific [3].
6. **Does the developer sub-segment (DevTools-heavy users) have meaningfully different requirements from non-developer power users?** The paritybit.ca post [49] suggests yes.

---

## 9. Sources

| # | Source | URL |
|---|--------|-----|
| 1 | Vimium Chrome Web Store | https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb |
| 2 | Arch Linux ~5M users estimate (Medium, 2026) | https://canartuc.medium.com/more-than-5-million-users-trust-24-unpaid-volunteers-with-their-operating-system-3e4bf88b785d |
| 3 | Arch Linux Community Survey (n=3923, Jan 2025) | https://linuxiac.com/arch-linux-community-survey-results/ |
| 4 | Vimperator discontinuation (Firefox 57) | https://github.com/vimperator/vimperator-labs |
| 5 | Vimium GitHub | https://github.com/philc/vimium |
| 6 | Vimium-C Chrome Web Store | https://chromewebstore.google.com/detail/vimium-c-all-by-keyboard/hfjbmagddngcpeloejdejnfgbamkjaeg |
| 7 | Vimium-C GitHub | https://github.com/gdh1995/vimium-c |
| 8 | Tridactyl README (user count note) | https://github.com/tridactyl/tridactyl/blob/master/readme.md |
| 9 | Tridactyl GitHub | https://github.com/tridactyl/tridactyl |
| 10 | ExtDown Vimium (UNVERIFIED, third-party) | https://extdown.com/extension/vimium |
| 11 | qutebrowser GitHub | https://github.com/qutebrowser/qutebrowser |
| 12 | Nyxt GitHub | https://github.com/atlas-engineer/nyxt |
| 13 | vimb GitHub | https://github.com/fanglingsu/vimb |
| 14 | luakit 2.4.0 release | https://github.com/luakit/luakit/releases/tag/2.4.0 |
| 15 | badwolf 1.4.0 release | https://distfiles.hacktivis.me/releases/badwolf/badwolf-1.4.0.txt |
| 16 | Arch pkgstats WM stats (live) | https://pkgstats.archlinux.de/fun/Window%20Managers/current |
| 17 | Linuxiac: Arch WM preferences (Dec 2025 figures) | https://linuxiac.com/which-desktop-environment-do-arch-linux-users-prefer/ |
| 18 | Gitnux Linux statistics (2026 edition) | https://gitnux.org/linux-statistics/ |
| 19 | r/hyprland 50k+ members | https://cavecreekcoffee.com/reviews/best-linux-tiling-window-manager-2026/ |
| 20 | Linuxiac: Arch user preferences (pkgstats) | https://linuxiac.com/insights-into-arch-linux-users-preferences/ |
| 21 | HowToGeek: qutebrowser keyboard browser | https://www.howtogeek.com/this-minimalist-browser-lets-me-browse-entirely-with-my-keyboardmostly/ |
| 22 | HN: qutebrowser discussion thread | https://news.ycombinator.com/item?id=42356668 |
| 23 | HN: keyboard-centric power user browser | https://news.ycombinator.com/item?id=19306243 |
| 24 | brycev.com: Why I'm switching to Firefox | https://brycev.com/blog/why-i-am-switching-to-firefox/ |
| 25 | port19.xyz: Farewell qutebrowser | https://port19.xyz/tech/bye-qutebrowser/ |
| 26 | tabflow: Firefox + Rofi tab switching | https://github.com/snpshtwrx/tabflow |
| 27 | brave-rofi-menu | https://github.com/antlis/brave-rofi-menu |
| 28 | webextension-dmenu | https://github.com/alexherbo2/webextension-dmenu |
| 29 | fzf Chrome history/bookmarks example | https://junegunn.github.io/fzf/examples/chrome/ |
| 30 | browserpass | https://github.com/browserpass/browserpass-extension |
| 31 | passff | https://github.com/passff/passff |
| 32 | qute-pass userscript | https://github.com/qutebrowser/qutebrowser/blob/main/misc/userscripts/qute-pass |
| 33 | qutebrowser: Reddit blocking (issue #8599) | https://github.com/qutebrowser/qutebrowser/issues/8599 |
| 34 | qutebrowser: CAPTCHA issue (#8703) | https://github.com/qutebrowser/qutebrowser/issues/8703 |
| 35 | qutebrowser: GitLab Anubis blocking (#8509) | https://github.com/qutebrowser/qutebrowser/issues/8509 |
| 36 | arkenfox/user.js (Firefox telemetry removal) | https://github.com/hnhx/user.js |
| 37 | lacuna (Firefox privacy build) | https://github.com/woolkingx/lacuna |
| 38 | ungoogled-chromium | https://github.com/ungoogled-software/ungoogled-chromium |
| 39 | HN: WebExtension keyboard API limitation | https://news.ycombinator.com/item?id=24636650 |
| 40 | Tridactyl: site key capture issue #5024 | https://github.com/tridactyl/tridactyl/issues/5024 |
| 41 | Tridactyl: NextJS keys broken #5128 | https://github.com/tridactyl/tridactyl/issues/5128 |
| 42 | Tridactyl: troubleshooting.md | https://github.com/tridactyl/tridactyl/blob/master/doc/troubleshooting.md |
| 43 | qutebrowser changelog (UA change in 3.5.0) | https://www.qutebrowser.org/doc/changelog.html |
| 44 | Tridactyl: Firefox focus steal #4105 | https://github.com/tridactyl/tridactyl/issues/4105 |
| 45 | Tridactyl: breaks on update #290 | https://github.com/tridactyl/tridactyl/issues/290 |
| 46 | qutebrowser: tree-style tabs #927 (81 reactions) | https://github.com/qutebrowser/qutebrowser/issues/927 |
| 47 | qutebrowser: tree tabs draft PR #8082 | https://github.com/qutebrowser/qutebrowser/pull/8082 |
| 48 | Vimium: bookmarklets broken by MV3 #4331 | https://github.com/philc/vimium/issues/4331 |
| 49 | paritybit.ca: qutebrowser to Firefox | https://www.paritybit.ca/blog/qutebrowser-to-firefox/ |
| 50 | HN: qutebrowser security update lag | https://news.ycombinator.com/item?id=42356668 |
| 51 | hyperion.ser1.net: Nyxt stability review | https://hyperion.ser1.net/post/web-browser-reflections/ |
| 52 | HN: Nyxt Lisp barrier | https://news.ycombinator.com/item?id=28632422 |
| 53 | Pentadactyl (Wikipedia) | https://en.wikipedia.org/wiki/Pentadactyl_%28extension%29 |
| 54 | Zen Browser: vim urlbar PR #10518 | https://github.com/zen-browser/desktop/pull/10518 |
| 55 | surf (suckless) | https://surf.suckless.org/ |
| 56 | dumber: keyboard-driven browser for tiling WMs | https://github.com/bnema/dumber |
| 57 | Firefox bookmark dmenu/rofi/fzf (gist) | https://gist.github.com/intrntbrn/cdb590090a9fcd0d0d32ae24092ab42a |
| 58 | Brave: real tree tabs request #44345 | https://github.com/brave/brave-browser/issues/44345 |
| 59 | qutebrowser: dialog focus issue #6136 | https://github.com/qutebrowser/qutebrowser/issues/6136 |
| 60 | Mozilla: Manifest V3 approach | https://blog.mozilla.org/en/firefox/firefox-manifest-v3-adblockers/ |
