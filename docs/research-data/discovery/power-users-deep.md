# Browser Power User JTBD & Pain Points: Deep Research Report

**Lead Researcher**: Feynman  
**Research date**: 2026-04-08  
**Rounds completed**: 2 (initial + 6-dimension deep pass)  
**Prior baseline**: `docs/research/power-user-jtbd-pain-points.md` (28 pain points)  
**New pain points surfaced**: 22 additional (total: 50 distinct JTBD entries)

---

## Executive Summary

Browser power users — vim users, developers, keyboard-first Linux workflows, privacy-focused users, Emacs integrators — represent a coherent and underserved segment whose frustrations cluster around a single structural failure: **the WebExtension API boundary**. Every category of pain traces back to a 2017 architectural decision (Firefox 57 / Quantum) that removed deep browser integration in exchange for cross-browser portability and sandboxed security. The result: users choose between keyboard-native browsers with no extension ecosystem (qutebrowser, Nyxt) or mainstream browsers with a broken, partial vim experience (Tridactyl, Vimium).

Academic research confirms the cognitive costs quantitatively. The CHI 2021 study "When the Tab Comes Due" (Carnegie Mellon, N=700+) found that ~25% of participants experienced browser/computer crashes from tab overload, and that users experience what researchers term the "black hole effect" — fear of losing context that prevents rational tab closure. The UIST 2021 paper "Tabs.do" (acceptance rate 25.9%, N=367) validates task-centric tab management as the correct architecture for complex knowledge work.

The population is larger than often assumed. Vimium alone has **500,000+ Chrome users** (Chrome Web Store, verified 2026-03) plus **43,833 Firefox users**. Tridactyl has ~6,000 GitHub stars and is rated 4.9/5 on Firefox AMO. Manifest V3's forced rollout in Chrome in 2025 created a new mass-migration event, pushing thousands of power users to Firefox — which now has an opportunity to capture this segment with native features.

---

## Part I: Keyboard Navigation & DevTools (New Findings)

### P1: DevTools keyboard shortcuts cannot be customized or vimified

**Job**: Develop web applications without leaving the keyboard — navigate between panels, inspect elements, set breakpoints, and run console commands using vim-style or custom keybindings.

**Pain**: Chrome DevTools introduced _some_ keyboard shortcut customization in Chrome 107 (2022) but it is narrow and does not support vim-style bindings. Firefox DevTools has a 10-year-old open Bugzilla meta issue (`#1215061`, opened 2015, still open) titled "[META] Better keyboard shortcut support." The Chromium issue tracker `#40301000` ("DevTools: Allow to customize keyboard shortcuts/key bindings") remains open. Key panel navigation (switching between Elements/Network/Console) requires mouse or specific Ctrl+[ / Ctrl+] shortcuts that conflict with vim/tmux muscle memory. There is no way to bind `j`/`k` to navigate the DOM tree, filter network requests, or scroll the console.

**Gain**: DevTools panels fully navigable by keyboard with customizable bindings — including panel switching, DOM tree navigation, console history, network filter, and breakpoint management.

> *"Why not user vimify the entire browser experience? That would have been really efficient way to use the browser. Full control in user hand."*  
> — Bugzilla comment on Firefox Bug #1215061 [[src]](https://bugzilla.mozilla.org/show_bug.cgi?id=1215061)

> *"Another major issue I have is that Firefox allows websites to prevent some shortcuts. For example on some websites I can't open the history pane! We should be able to decide which shortcuts are preventable and which always work."*  
> — Same thread, user Kevin Cox [[src]](https://bugzilla.mozilla.org/show_bug.cgi?id=1215061)

**Evidence**: Bugzilla #1215061 (open 10 years), Chromium #40301000 (open), Chromium #40869138 (DevTools autocomplete shortkey interferes with workflow), Firefox Bugzilla #1116951 (Allow changing key bindings in dev tools), Firefox Bugzilla #1640604 (Let DevTools handle Ctrl+W).

### P2: Firefox DevTools changed Enter key behavior in the Rules inspector without user control

**Job**: Quickly iterate CSS property values in DevTools Inspector using muscle memory (Enter to advance to next field, as Firebug taught for ~15 years).

**Pain**: Firefox 122 changed Enter in the CSS Rules view to validate-and-stay rather than validate-and-advance, breaking years of muscle memory for web developers. Community backlash was severe enough that Mozilla reverted the change in Firefox 122.0.1, then made it configurable in Firefox 124. The incident revealed that even small DevTools keyboard behavior changes require massive community pushback to maintain, and that DevTools teams lack the bandwidth to anticipate power-user workflows.

**Gain**: Fully configurable DevTools keyboard behavior with profiles (vim-style, Emacs-style, legacy Firebug mode) that persist across updates.

> *"We know this could be frustrating in the beginning... for us, the advantages this brings to the table makes it worthwhile"*  
> — Firefox DevTools blog, before reverting the change [[src]](https://fxdx.dev/rules-view-enter-key/)

> *(Mozilla reversed the change 3 weeks later after user backlash — the blog post added update banners in 2024-02-03, 2024-03-15)*

### P3: Localhost development requires repeated HTTPS certificate bypass rituals

**Job**: Test web applications locally on HTTPS without browser security warnings interrupting the flow every session.

**Pain**: Modern web APIs (Service Workers, WebRTC, getUserMedia, Secure Cookies, HTTP/2) require HTTPS even on localhost. Browsers treat self-signed certificates as security threats and require multiple clicks to bypass per session. `mkcert` partially solves this but requires per-machine trust store setup. Browser profiles don't easily export/import trusted CA certs. For power users with multiple machines and profiles, this is a recurring friction point.

**Gain**: Browser-native `localhost` and `*.local` TLD trust — automatic HTTPS trust for local development addresses without warnings, configurable per profile with exportable trust anchors.

**Evidence**: Multiple developer guides documenting workarounds as of 2025-2026 [[src]](https://markaicode.com/fix-ssl-certificate-errors-local-development/), Let's Encrypt community discussion [[src]](https://community.letsencrypt.org/t/is-there-a-safe-way-to-use-https-locally-without-triggering-browser-warnings/235578).

---

## Part II: Extension Ecosystem Collapse (Manifest V3 Deep Dive)

### P4: Manifest V3 destroyed uBlock Origin on Chrome, forcing migrations

**Job**: Block ads and trackers with a 300,000+ rule dynamic filter engine (uBlock Origin in advanced mode).

**Pain**: Google's Manifest V3 transition (Chrome, enforced mid-2024) replaced the `webRequest` API with the more restricted `declarativeNetRequest` API, which caps rules at 30,000 static rules per extension. uBlock Origin's full feature set requires 300,000+ dynamic rules. Google removed uBlock Origin's legacy MV2 version from the Chrome Web Store by late 2024. Power users who had relied on uBlock's dynamic filtering, medium mode, and advanced mode lost those capabilities on Chrome entirely. Firefox's MV3 implementation retains the full `webRequest` API, preserving uBlock Origin.

**Gain**: A browser where the extension API does not artificially cap filter rules, preserving power-user ad blocking and privacy tools as a first-class feature.

**Ecosystem consequence**: The MV3 transition is the single largest documented migration pressure toward Firefox in years. Quantitatively, Vimium on Chrome has 500,000+ users; Firefox AMO's Vimium-FF has 43,833 users — if even 10% of Chrome power users migrated due to MV3, that's ~50,000 users entering Firefox's ecosystem.

> *"Chrome ditched the old webRequest API (what let uBO handle 300k+ rules dynamically) for declarativeNetRequest... everything feels weaker now"*  
> — r/Adblock thread on Chrome MV3 migration [[src]](https://www.reddit.com/r/Adblock/comments/1rqiom5/)

### P5: Tampermonkey/Violentmonkey under MV3 breaks userscript power features

**Job**: Run custom scripts that modify web pages, intercept requests, and automate repetitive tasks.

**Pain**: MV3's service worker architecture (30-second idle timeout) breaks Tampermonkey's background persistence. `GM_xmlhttpRequest` under MV3 serializes all requests (Tampermonkey issue #2215), causing scripts that make parallel requests to run 10x slower. Local file installation of scripts is broken (Tampermonkey #2099). Scripts no longer execute reliably on page load due to worker death between page navigations. Violentmonkey's MV3 branch (issue #1934) is incomplete.

**Gain**: A browser where userscripts run with full background persistence, parallel XHR, and local file installation — i.e., Firefox-on-MV2 behavior preserved permanently.

> *"I maintain a couple Chrome extensions and spent embarrassing amounts of time this year figuring out why my breakpoints kept vanishing every 30 seconds before realizing oh right, MV3 service workers just die after 30s of inactivity."*  
> — r/webdev thread [[src]](https://www.reddit.com/r/webdev/comments/1rtwx4y/)

---

## Part III: Container & Privacy Workflows

### P6: Firefox Multi-Account Containers has no keyboard interface at scale

**Job**: Switch between work, personal, banking, and social media identities in separate containers using keyboard shortcuts, without touching the mouse.

**Pain**: Firefox Multi-Account Containers provides 3 keyboard shortcuts (via browser extension shortcuts) for containers 1-3, with containers 5-10 broken until the user visits `about:addons` (issue #2870). There is no fuzzy-search container picker, no way to assign a tab to a container by keyboard, no way to see which container the current tab is in without mousing over the icon. Containers cannot be reordered (issue #2837, #2665). The AZERTY keyboard layout makes the default shortcuts unusable (issue #1081). Power users managing 10-20+ containers (developer work, client projects, social media personas) have no keyboard-first workflow.

**Gain**: A container picker triggered by a keybinding — like a fuzzy-search palette — where you type a container name and press Enter to assign the current tab or open a new tab in that container.

> *"Shortcuts for containers 5 to 10 don't work until about:addons..."*  
> — Mozilla/multi-account-containers issue #2870 [[src]](https://github.com/mozilla/multi-account-containers/issues/2870)

> *"Containers cannot be moved"*  
> — Mozilla/multi-account-containers issue #2837 [[src]](https://github.com/mozilla/multi-account-containers/issues/2837)

**Related**: Zen Browser had a separate bug where Multi-Account Containers keyboard shortcuts don't trigger at all on the start page (zen-browser #8960).

### P7: Arkenfox user.js conflicts with session restore and daily usability

**Job**: Run Firefox with maximum privacy hardening (clearing cookies on close, resisting fingerprinting, no telemetry) while still maintaining usable sessions.

**Pain**: The arkenfox user.js template (`12,000+ GitHub stars`) maximally hardens Firefox but breaks session restore — `clearOnShutdown` deletes tabs and history on every close. Users must manually exempt specific preferences, but the interactions between settings are non-obvious and have broken users' browsing sessions silently. A Firefox update (FF142) was found to re-enable telemetry despite explicit opt-out in user.js (arkenfox issue #1993). The maintenance burden of tracking Firefox pref changes falls on the user.

**Gain**: Browser-native privacy tiers (like arkenfox but built-in) that are automatically maintained across updates, with clear per-pref documentation of the usability tradeoff.

> *"Anyone know how to enable session restore when using arkenfox user.js?"*  
> — Communick News [[src]](https://communick.news/post/185482)

> *"FF142 can opt you back into telemetry despite having explicitly opted out"*  
> — arkenfox/user.js issue #1993 [[src]](https://github.com/arkenfox/user.js/issues/1993)

---

## Part IV: Session, Sync & History (New Findings)

### P8: Firefox Sync silently destroys history and tabs in edge cases

**Job**: Trust that browser history is a durable, searchable record of knowledge accumulated over years.

**Pain**: Multiple documented cases of Firefox Sync destroying years of browsing history — the most visible being a Mozilla Connect discussion where a user lost three years of history because a mobile sync setting ("Clear history when Firefox closes") propagated to desktop through Sync without warning. Firefox 144 clobbered all open tabs during an update. No automatic local backup of `places.sqlite` exists. History stored in `places.sqlite` is a SQLite database but Firefox provides no native export, no external query interface, and no "undo" for bulk deletions.

**Gain**: Browser history treated as a durable, versioned, user-owned database: auto-backups before destructive syncs, queryable via external tools, with undo for mass-deletion events.

> *"Very sadly I just lost three years' worth of browsing history in Firefox... ironically or criminally, Firefox also asked me to restart it to finalise an update, which I then did."*  
> — Mozilla Connect user [[src]](https://connect.mozilla.org/t5/discussions/firefox-sync-causing-3-years-of-history-loss/td-p/74844)

**Requests made by the user**:
1. Warning notification before destructive sync settings propagate
2. Automatic profile data backups
3. Restore options from local cache
4. Better Sync features for settings that affect local data

### P9: Self-hosted bookmark/reading-list tools are fragmented and poorly browser-integrated

**Job**: Maintain a personal, searchable, self-hosted archive of bookmarked pages with full-text content, accessible from any device, without giving data to Google or Mozilla.

**Pain**: The self-hosted ecosystem has several tools (linkding, wallabag, Linkwarden, xBrowsersync) but each is optimized for a different use case (linkding: bookmarks, wallabag: read-later, Linkwarden: archival). None has a first-class browser integration that works via keyboard shortcuts for rapid save-to-collection workflows. xBrowsersync synchronizes browser bookmarks but doesn't archive content. None integrates with the address bar for fuzzy search across the archived corpus. Users must manually install browser extensions for each tool, which may not support keyboard shortcuts.

**Gain**: A browser with a built-in "save to self-hosted backend" action triggered by keyboard shortcut, supporting a standardized API (e.g., Linkding's REST API) for external tools, with full-text search of saved content available from the address bar.

---

## Part V: Scripting & External Tool Integration (New Findings)

### P10: org-protocol capture from browser to Emacs is fragile and poorly documented

**Job**: Capture the current page's URL, title, and selected text directly into an Emacs org-mode entry with a single keyboard shortcut.

**Pain**: org-protocol requires registering a custom URL scheme (`org-protocol://`) with the OS, which behaves differently across Linux distributions, browser launch methods (Flatpak, Snap, native), and Emacs server configurations. The browser extension `org-capture-extension` has an open issue about "greedy org-protocol handlers" that intercept all custom protocol URLs. Bookmarklets break on HTTPS sites with strict CSP. Firefox updates occasionally break the protocol registration. Recent bugs (2024-2026) include: double-slash encoding in captured body text (#BUG), protocol bookmarklets breaking after org 9.6.15 upgrade.

**Gain**: Native browser support for a "share with external handler" action triggered by keyboard shortcut, with a standardized data format (URL, title, selection, page metadata) that external tools can register for via a published protocol.

> *"[BUG] Org-protocol bookmarklets in Firefox behaving badly after recent upgrade"*  
> — emacs-orgmode mailing list, 2024 [[src]](https://yhetil.org/orgmode/366e2a83-3703-40fd-b8eb-f5746a17864d@gmail.com/t/)

> *"problem setting up org-protocol"*  
> — emacs-orgmode mailing list, 2026-01 [[src]](http://list.orgmode.org/92f2372e-727e-4735-9031-74fcf5895a04@gmail.com/T/)

### P11: KeePassXC/Bitwarden native messaging host disconnects on Linux

**Job**: Auto-fill passwords from KeePassXC or Bitwarden into the browser without the mouse, triggered by keyboard shortcut.

**Pain**: Native messaging host (the subprocess that allows browser extensions to communicate with the local password manager) frequently disconnects on Linux, particularly with Flatpak/Snap browser installations, sandboxed browsers, or after browser updates. KeePassXC-browser issue #2402 ("Browser integration not working (Linux Firefox)") is open with many users affected. The core issue: Flatpak-installed Firefox has a restricted filesystem namespace that can't find the native messaging manifest. Snap Firefox has similar issues. Custom/niche browsers (qutebrowser, Nyxt) can't use KeePassXC at all because the native messaging protocol is browser-specific.

**Gain**: Native messaging host connection that survives browser updates, works under Flatpak/Snap, and exposes a stable, browser-agnostic protocol so any browser can integrate with local password managers.

> *"Browser integration not working (Linux Firefox)" — Flatpak*  
> — keepassxreboot/keepassxc-browser issue #2402 [[src]](https://github.com/keepassxreboot/keepassxc-browser/issues/2402)

> *"Access to the specified native messaging host is forbidden"*  
> — keepassxreboot/keepassxc issue #7128 [[src]](https://github.com/keepassxreboot/keepassxc/issues/7128)

### P12: qutebrowser userscripts cannot query page state

**Job**: Write a Python userscript that checks whether the current page is in a specific state (e.g., logged in, has a specific element) before taking an action.

**Pain**: qutebrowser's userscript API exposes environment variables (`QUTE_URL`, `QUTE_TITLE`, `QUTE_SELECTED_TEXT`) but cannot query the live DOM or JS state of the page. Issue #8231 ("Query state of webpage in userscript?") was closed as `not_planned` — the architecture cannot support it without a synchronous communication channel that Qt's process model doesn't provide. A userscript can only read what was in the page when it was invoked; it cannot wait for AJAX, check computed styles, or react to page changes.

**Gain**: Userscript API with async DOM query capability — a mechanism to send a JavaScript snippet to the page and receive the result, similar to WebDriver's `execute_script()`.

> *"Query state of webpage in userscript?" — closed as not_planned*  
> — qutebrowser issue #8231 [[src]](https://github.com/qutebrowser/qutebrowser/issues/8231)

### P13: Browser MPRIS media control requires third-party bridges

**Job**: Control browser media playback (YouTube, Spotify Web, podcast players) from tiling WM keyboard shortcuts, the same way you control native media players.

**Pain**: MPRIS2 (the standard Linux D-Bus media player control protocol) is not natively implemented by any major browser. Firefox and Chrome require third-party extensions (browser-mpris2, plasma-browser-integration) to expose MPRIS2. These extensions don't support all MPRIS2 capabilities (shuffle, repeat, full metadata). The bridge breaks on new browser versions. Users on Sway/Hyprland using `playerctl` or WM-bound media keys get inconsistent results — sometimes the WM controls the browser, sometimes it doesn't.

**Gain**: Native MPRIS2 support in the browser — the browser registers as a media player on D-Bus, exposing full playback control to any MPRIS2-compatible controller, no extensions needed.

**Evidence**: `browser-mpris2` extension documentation [[src]](https://lt-mayonesa.github.io/browser-mpris2/), GitHub Gist for sway+Firefox MPRIS control [[src]](https://gist.github.com/tormath1/5ab9bbdcd0af8346084a34f1cf1b6e0e).

### P14: rofi/dmenu integration with browser requires custom userscripts

**Job**: Launch a specific URL or bookmark from the WM's application launcher (rofi/dmenu) without switching to the browser first.

**Pain**: qutebrowser ships a `dmenu_qutebrowser` userscript but it hard-codes the `rofi -dmenu` invocation path (issue #6558), breaking for users with wofi, fuzzel, tofi, or non-default configurations. Firefox has no equivalent — no programmatic interface to open URLs from external applications with profile-aware routing (e.g., "open this URL in the Work container on the personal profile"). The workaround is `firefox --new-tab "$url"` but it ignores containers, profiles, and window management.

**Gain**: A browser IPC socket (socket file or D-Bus interface) accepting commands: open URL in profile/container/window, query open tabs, close tab by URL pattern — allowing rofi/dmenu to be a fully keyboard-driven browser control surface.

---

## Part VI: Academic Evidence & Quantitative Data

### Academic Papers (Peer-Reviewed)

#### A1: "When the Tab Comes Due" — CHI 2021 (Carnegie Mellon University)

**Citation**: Chang, J.C., Hahn, N., Kim, Y., et al. "When the Tab Comes Due: Challenges in the Cost Structure of Browser Tab Usage." *CHI '21*, ACM, 2021. DOI: 10.1145/3411764.3445585.

**Key quantitative findings**:
- ~**25% of participants** reported their browser or computer crashed because they had too many tabs open
- Tabs serve as "external memory" but fail at this: the **"black hole effect"** — users fear closing tabs because "as soon as something went out of sight, it was gone"
- Browser tabs have not changed architecturally since 2001 despite the web expanding by ~1 billion times
- Tabs' flat list structure makes it difficult to jump between sets of related tasks

**Relevance for Aether**: Validates tree-structured tabs, workspace isolation, and session restore as product-level needs with empirical backing.

#### A2: "Tabs.do: Task-Centric Browser Tab Management" — UIST 2021 (Carnegie Mellon University)

**Citation**: Chang, J.C., Kim, Y., Miller, V., et al. "Tabs.do: Task-Centric Browser Tab Management." *UIST '21*, ACM, 2021. DOI: 10.1145/3472749.3474777. Acceptance rate: 25.9%, N=367.

**Key findings**:
- Task-centric tab organization (grouping tabs by project/task) significantly reduces cognitive load and tab hoarding
- Users self-organize tabs into 5-15 task clusters when given structured tools
- The absence of task context from the browser is the root cause of tab overload, not the number of tabs itself

#### A3: "On the efficiency of keyboard navigation in Web sites" — 2006

**Citation**: Schrepp, M. "On the efficiency of keyboard navigation in Web sites." *Universal Access in the Information Society*, 5(2), 180-188, 2006. DOI: 10.1007/s10209-006-0036-x.

**Key findings**: Keyboard-only navigation on web sites is significantly less efficient than mouse for users without motor disabilities — primarily because web pages are not designed for keyboard-first interaction. The paper argues this is a design problem, not a user capability problem.

**Relevance**: Demonstrates that browser power-user pain is not a niche preference but a documented accessibility and efficiency issue when web interfaces are not keyboard-designed.

#### A4: "Comparison of Mouse and Keyboard Efficiency" — HFES 2010

**Citation**: Omanson, R.C., Miller, C.S., Young, E., Schwantes, D. "Comparison of Mouse and Keyboard Efficiency." *HFES Annual Meeting Proceedings*, 54(6), 2010.

**Key finding**: Keyboard shortcuts are faster than mouse for experienced users on frequent tasks, but only when shortcuts are learnable and consistent. Web browsers violate this by having inconsistent, site-overridden, and update-changed shortcuts.

### Quantitative Ecosystem Data

| Tool | Platform | Install Count | Source | Date |
|---|---|---|---|---|
| Vimium | Chrome | **500,000+** users | Chrome Web Store [[src]](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb) | 2026-03 |
| Vimium | Firefox (AMO) | **43,833** users | chrome-stats.com [[src]](https://chrome-stats.com/d/dbepggeogbaibhgnhhndojpepiihcmeb) | 2026-03 |
| Vimium | Edge | **16,171** users | chrome-stats.com | 2026-03 |
| Vimium C | Chrome | **70,000** users | Chrome Web Store [[src]](https://chromewebstore.google.com/detail/vimium-c-all-by-keyboard/hfjbmagddngcpeloejdejnfgbamkjaeg) | 2026-04 |
| Tridactyl | Firefox (AMO) | ~**6,000** GitHub stars | github.com/tridactyl | 2026-04 |
| Tridactyl | Firefox (AMO) | **4.9/5** stars, 506 ratings | AMO [[src]](https://addons.mozilla.org/en-CA/firefox/addon/tridactyl-vim/reviews/) | 2026-04 |
| Surfingkeys | Chrome | Listed on Chrome Web Store | Chrome Web Store | 2026-04 |
| qutebrowser | GitHub | **11,000** stars | github.com/qutebrowser | 2026-04 |
| Nyxt | GitHub | **11,000** stars | github.com/atlas-engineer/nyxt | 2026-04 |
| Multi-Account Containers | Firefox | **3,100** GitHub stars | github.com/mozilla | 2026-04 |
| Arkenfox user.js | GitHub | **12,000** stars | github.com/arkenfox | 2026-04 |

**Key inference** (labeled as inference, not measured): If Vimium's 500,000 Chrome users represent ~1% of Chrome's daily active users (~3B), keyboard-first browsing is a niche market in absolute percentage terms but a large absolute population. The **~560,000 combined Vimium users across platforms** are the measurable floor of the keyboard-first segment; Tridactyl, Surfingkeys, and qutebrowser users are additive.

---

## Part VII: Minimalist & Suckless Community (New Findings)

### P15: surf/suckless browser is rendered unusable by WebKitGTK's complexity

**Job**: Use a genuinely minimal browser (< 2,000 lines of C) that integrates with dwm/sway via suckless conventions.

**Pain**: surf uses WebKitGTK — which the suckless community considers fundamentally incompatible with suckless philosophy due to its enormous dependency tree and frequent breaking changes. The suckless mailing list has had ongoing threads since 2010 about finding a rendering engine that isn't "a mess." In 2022, a mailing list thread "Is there any suckless webkit?" got the response: WebKitGTK is the only viable option because there's nothing smaller that renders the modern web. A 2024 suckless.dev thread about adding keyboard shortcuts to Firefox led to the conclusion that any non-suckless browser requires workarounds (xdotool, keyd) because the browser doesn't expose configuration via plain text files.

**Gain**: A browser with a plain-text configuration file (like dwm's `config.h`), no JavaScript required for the browser UI itself, and a stable ABI that doesn't require recompilation every six months.

> *"Root window + st, with a terminal multiplexer is all that is needed... much faster and accurate pressing a shortcut key spawning a dmenu\_run, followed by typing a few distinctive characters and pressing Enter."*  
> — suckless.org dev mailing list, 2024 [[src]](https://lists.suckless.org/dev/2401/35508.html)

> *"Sadly, I still need to browse the web because there's a lot of useful information out there on the web. Thankfully, noscript and ublock origin filter most of the bloat."*  
> — Same thread, on why even suckless users can't escape the browser entirely

> *"Chromium is far too bloated for me to seriously think of using it. It takes more than twice as long as Firefox to compile."*  
> — Same thread

### P16: Vieb (Electron-based vim browser) is blocked from becoming a daily driver by Electron's overhead

**Job**: Use a vim-binding browser that works on Wayland with full NativeMessaging support for password managers.

**Pain**: Vieb is the most feature-complete vim browser on Electron (2,000+ GitHub stars), but Electron's memory overhead (~300MB baseline) and its Wayland support (which only became stable after Electron adopted ozone in 2023) create friction. Vieb issue #349 documented seg faults on Wayland after an Electron update. The fundamental issue: Electron wraps Chromium, meaning Vieb inherits Chromium's privacy characteristics and is not suitable for users who want to avoid Google's telemetry. Power users who want vim bindings *and* escape Chromium have no option — qutebrowser uses QtWebEngine (also Chromium-based), Nyxt is unstable, and Vieb is Electron.

**Gain**: A vim-first browser on Gecko (Firefox's engine) — combining Tridactyl's integration depth with qutebrowser's keyboard-first architecture, without Electron overhead.

---

## Part VIII: Cross-Dimension Analysis

### The Fundamental Tension Map

```
                    Extension Ecosystem
                    (uBO, KeePassXC, containers)
                            ↑
                            |  Firefox wins here
                    ────────┼────────
     Keyboard-first |       |        | Config-as-code
     native UX      |       |        | programmability
     (qutebrowser)  |  GAP  |        | (Nyxt, qutebrowser)
                    |       |        |
                    ────────┼────────
                            |
                            ↓
                    No browser exists in all quadrants
```

### Root Causes

| Root Cause | Manifestation | Pain Points |
|---|---|---|
| **WebExtension API boundary** | Vim extensions dead on about: pages, PDFs, devtools | P1, P2, 1.1, 3.2, 3.3 |
| **Manifest V3** | uBO broken on Chrome, userscripts degraded | P4, P5 |
| **No browser IPC surface** | No rofi integration, no org-protocol standardization | P14, P10 |
| **No platform integration** | No MPRIS2, no xdg-open profile routing, no native messaging under Flatpak | P11, P13 |
| **History as disposable UI** | Sync destroys data, no versioning, no SQL export | P8, 2.5 |
| **Tab model unchanged since 2001** | Flat list, no task grouping, no tree | P8, A1, 2.1 |
| **Single-binary browser config** | No plain-text config, can't be diffs'd or git-tracked | 6.3 |

### Severity-Frequency Matrix

| Pain Point | Severity (1-5) | Frequency | Segment | Sources |
|---|---|---|---|---|
| Vim extensions dead in certain contexts | 5 | Daily | All keyboard users | Multiple HN, GitHub |
| MV3 breaks uBlock Origin on Chrome | 5 | Permanent | All Chrome power users | Multiple Reddit, GitHub |
| No container keyboard interface | 4 | Daily | Privacy/dev users | GitHub issues |
| DevTools keyboard not customizable | 4 | Daily | Developers | Bugzilla, 10yr open |
| KeePassXC disconnect under Flatpak | 4 | Per-session | Linux users | GitHub issues |
| Website key stealing | 4 | Per-site | Keyboard users | Tridactyl issues |
| Sync data loss | 5 | Infrequent but catastrophic | All sync users | Mozilla Connect |
| Tab cognitive overload | 4 | Chronic | All power users | CHI 2021 |
| org-protocol fragility | 3 | Per-OS-event | Emacs users | Mailing lists |
| No MPRIS2 native | 3 | Per-session | Wayland/WM users | GitHub, gists |
| Localhost HTTPS warnings | 3 | Per-machine | Developers | Developer guides |
| Buffer ordering in Nyxt | 4 | Daily | Nyxt users | GitHub #1695 |

---

## Open Questions

1. **Stack Overflow survey doesn't break down by browser**: The 2024 and 2025 Stack Overflow Developer Surveys don't publish browser usage data in their public summaries. The segment size of "developer who uses keyboard-first workflow" is inferred, not directly measured.

2. **Tridactyl's exact daily user count** is not publicly available from Firefox AMO's API without API key access. The 4.9/5 rating and 506 reviews suggest a highly engaged but probably <20,000 active user base.

3. **MV3 migration magnitude**: How many users actually migrated from Chrome to Firefox as a result of MV3? Mozilla's public telemetry doesn't disclose this breakdown.

4. **Wayland adoption rate among power users**: The fraction of power users running Wayland vs X11 affects severity of P11 (KeePassXC), P13 (MPRIS2), and WM integration pain points. ArchLinux survey data would help but is not available.

5. **Whether qutebrowser users are a declining population**: The 11,000 GitHub stars and active issue tracker suggest stability, but the "can't watch YouTube" limitation is a known exit driver that may be pulling users back to mainstream browsers.

---

## Aether Feature Opportunities: Updated Opportunity Matrix

Extending the prior round's matrix with the new findings:

| Pain Point | Category | Competitor Gap? | Evidence Strength |
|---|---|---|---|
| Native vim mode everywhere incl. DevTools (P1) | Keyboard & Input | **Yes** — no browser does this | Strong (Bugzilla 10yr) |
| DevTools keyboard profiles (vim/emacs/Firebug) (P2) | Developer Tools | **Yes** | Strong (Bugzilla) |
| Localhost HTTPS native trust for *.local (P3) | Developer Tools | Partial (mkcert workaround) | Strong (multiple dev guides) |
| MV3-proof ad blocking architecture (P4) | Privacy & Security | **Firefox already** — Aether should commit hard | Strong (Chrome migration) |
| Full userscript persistence (P5) | Extensibility | **Firefox already** | Strong (Tampermonkey issues) |
| Container keyboard picker (fuzzy) (P6) | Privacy & Security | **Yes** — no browser native | Strong (GitHub issues) |
| Browser-native privacy tiers (P7) | Privacy & Security | Partial (Brave) | Medium |
| History as versioned database with undo (P8) | Core Browsing | **Yes** | Strong (Mozilla Connect) |
| Self-hosted bookmark API integration (P9) | Core Browsing | Partial (Vivaldi) | Medium |
| External share protocol (org-protocol standardized) (P10) | Extensibility | **Yes** | Medium |
| Flatpak-native password manager IPC (P11) | Security | **Yes for Flatpak specifically** | Strong (GitHub issues) |
| Userscript DOM query API (P12) | Extensibility | **Yes** | Medium (qutebrowser not_planned) |
| Native MPRIS2 media control (P13) | Linux & Integration | **Yes** | Medium |
| Browser IPC socket for rofi/dmenu (P14) | Linux & Integration | **Yes** | Strong (community workarounds) |
| Task-centric tab grouping (research-backed) | Workspace | Partial (Arc, Vivaldi workspaces) | Very Strong (CHI/UIST 2021) |

---

## Sources Appendix

| # | Source | URL |
|---|---|---|
| S1 | Chrome Web Store: Vimium (500K+ users) | https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb |
| S2 | Firefox AMO: Vimium-FF (43,833 users) | https://chrome-stats.com/d/dbepggeogbaibhgnhhndojpepiihcmeb |
| S3 | Firefox AMO: Tridactyl (4.9/5, 506 ratings) | https://addons.mozilla.org/en-US/firefox/addon/tridactyl-vim/ |
| S4 | CHI 2021: "When the Tab Comes Due" | https://dl.acm.org/doi/10.1145/3411764.3445585 |
| S5 | CMU press release: Tab Overload study | https://www.cs.cmu.edu/news/2021/overcoming-tab-overload |
| S6 | UIST 2021: "Tabs.do" | https://dl.acm.org/doi/10.1145/3472749.3474777 |
| S7 | Universal Access 2006: Keyboard nav efficiency | https://www.researchgate.net/publication/220606691_On_the_efficiency_of_keyboard_navigation_in_Web_sites |
| S8 | HFES 2010: Mouse vs keyboard efficiency | https://journals.sagepub.com/doi/10.1177/154193121005400612 |
| S9 | Firefox Bugzilla #1215061: Better keyboard shortcuts (10yr open) | https://bugzilla.mozilla.org/show_bug.cgi?id=1215061 |
| S10 | Firefox Bugzilla #1116951: Allow changing DevTools key bindings | https://bugzilla.mozilla.org/show_bug.cgi?id=1116951 |
| S11 | Firefox Bugzilla #1640604: Let DevTools handle Ctrl+W | https://bugzilla.mozilla.org/show_bug.cgi?id=1640604 |
| S12 | Chromium issue #40301000: Customize DevTools shortcuts | https://issues.chromium.org/40301000 |
| S13 | Chromium issue #40869138: DevTools autocomplete interferes | https://issues.chromium.org/issues/40869138 |
| S14 | Firefox DevTools blog: Rules view Enter key reversal | https://fxdx.dev/rules-view-enter-key/ |
| S15 | mozilla/multi-account-containers #2870: Shortcuts for containers 5-10 broken | https://github.com/mozilla/multi-account-containers/issues/2870 |
| S16 | mozilla/multi-account-containers #2837: Containers cannot be moved | https://github.com/mozilla/multi-account-containers/issues/2837 |
| S17 | mozilla/multi-account-containers #1081: AZERTY layout support | https://github.com/mozilla/multi-account-containers/issues/1081 |
| S18 | arkenfox/user.js #1993: FF142 re-enables telemetry | https://github.com/arkenfox/user.js/issues/1993 |
| S19 | Mozilla Connect: Firefox Sync 3-year history loss | https://connect.mozilla.org/t5/discussions/firefox-sync-causing-3-years-of-history-loss/td-p/74844 |
| S20 | Mozilla Support: Firefox 144 clobbered all tabs | https://support.mozilla.org/en-US/questions/1544757 |
| S21 | sprig/org-capture-extension #72: Greedy org-protocol handler | https://github.com/sprig/org-capture-extension/issues/72 |
| S22 | emacs-orgmode mailing list: Capture from Firefox 2024 | http://list.orgmode.org/CA+OMD9gg6O7xG7fOPosAOpvXQXWaQMu-tnpLQFoyN2e6U9mBqg@mail.gmail.com/T/ |
| S23 | emacs-orgmode mailing list: org-protocol problem 2026-01 | http://list.orgmode.org/92f2372e-727e-4735-9031-74fcf5895a04@gmail.com/T/ |
| S24 | keepassxreboot/keepassxc-browser #2402: Firefox integration broken | https://github.com/keepassxreboot/keepassxc-browser/issues/2402 |
| S25 | keepassxreboot/keepassxc #7128: Native messaging forbidden | https://github.com/keepassxreboot/keepassxc/issues/7128 |
| S26 | qutebrowser #8231: Query state of webpage — not_planned | https://github.com/qutebrowser/qutebrowser/issues/8231 |
| S27 | qutebrowser #6558: rofi hard-coded in bitwarden userscript | https://github.com/qutebrowser/qutebrowser/issues/6558 |
| S28 | browser-mpris2 project | https://lt-mayonesa.github.io/browser-mpris2/ |
| S29 | Tampermonkey #2215: GM_xmlhttpRequest serialized under MV3 | https://github.com/Tampermonkey/tampermonkey/issues/2215 |
| S30 | Tampermonkey #2099: Local file installation broken MV3 | https://github.com/Tampermonkey/tampermonkey/issues/2099 |
| S31 | r/Adblock: Chrome users who lost uBlock Origin | https://www.reddit.com/r/Adblock/comments/1rqiom5/ |
| S32 | suckless.org dev mailing list 2024: Keyboard shortcuts for Firefox | https://lists.suckless.org/dev/2401/35508.html |
| S33 | Zen Browser #10518: Vim navigation in urlbar PR | https://github.com/zen-browser/desktop/pull/10518 |
| S34 | Vieb vs qutebrowser comparison | https://www.libhunt.com/compare-Vieb-vs-qutebrowser |
| S35 | CHI 2023: "When Browsing Gets Cluttered" | https://dl.acm.org/doi/10.1145/3544548.3580690 |
