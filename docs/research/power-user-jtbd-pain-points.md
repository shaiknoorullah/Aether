# Browser Power User JTBD & Pain Points

> **Research date**: 2026-04-08  
> **Sources**: Reddit (r/vim, r/firefox, r/qutebrowser, r/unixporn), HackerNews, GitHub issue trackers (qutebrowser, nyxt, tridactyl, vimium, zen-browser), MakeUseOf, Mozilla Connect  
> **Method**: Direct extraction of user statements from community discussions and issue trackers  
> **Scope**: Browser-specific frustrations for vim users, developers, keyboard-first users, Linux users

---

## Summary

28 distinct pain points extracted across 7 categories. Each entry follows the JTBD format:

- **Job**: What the user is trying to accomplish
- **Pain**: What currently prevents them or makes it worse
- **Gain**: What ideal looks like (stated or inferred from context)
- **Source**: Direct quote or paraphrase with provenance

---

## 1. Keyboard Navigation & Vim Keybindings

### 1.1 Vim extensions can't control the browser chrome

**Job**: Navigate the entire browser (address bar, settings, tabs, bookmarks) without touching a mouse.

**Pain**: WebExtension APIs only have access to web page content. Vimium/Tridactyl cannot operate on `about:` pages, PDF viewer, reader mode, new tab page, browser settings, or extension pages. The extension silently stops working in these contexts.

**Gain**: A browser where vim-style keybindings work *everywhere* — address bar, settings pages, PDF viewer, reader mode — without dead zones.

> *"Qutebrowser fixes the main issue I have with Vimium: you cannot control the browser itself well. Vimium does not work in certain places due to limitations imposed by web extensions and this is incredibly frustrating for me."*  
> — HN user, qutebrowser thread (2024-12) [[src]](https://news.ycombinator.com/item?id=42357624)

> *"One seemingly small thing that I find quite convenient is that I can use reader mode or open a PDF and still keep hjkl for scrolling. I also use Tridactyl in Firefox, but Firefox's reader mode and opening PDFs turns disable extensions in the tab, so you can't use these scrolling keys."*  
> — HN user, qutebrowser thread [[src]](https://news.ycombinator.com/item?id=42358678)

### 1.2 Websites steal keyboard shortcuts from vim extensions

**Job**: Use `/` to search, `j`/`k` to scroll, `f` for hints — consistently across all sites.

**Pain**: Websites like GitHub, Google, YouTube, and Reddit bind their own keyboard shortcuts that intercept keys before the vim extension can process them. The `/` key is particularly contested — GitHub steals it for its own search.

**Gain**: A priority system where browser-level keybindings always win unless explicitly yielded per-site.

> *"leavegithubalone not working: websites still steal slash (/)"*  
> — Tridactyl issue #904 (open since 2018, still unresolved) [[src]](https://github.com/tridactyl/tridactyl/issues/904)

> *"No longer able to unbind j/k on google"*  
> — Tridactyl issue #4944 [[src]](https://github.com/tridactyl/tridactyl/issues/4944)

### 1.3 Hint mode has accidental activation risks

**Job**: Click links quickly via keyboard hints without accidentally triggering irreversible actions.

**Pain**: On admin pages or pages with many buttons, accidentally pressing hint keys can trigger destructive actions without confirmation. Users want a safety mechanism.

**Gain**: Hint mode with configurable safety: leader keys, modifier requirements, or per-domain disable lists.

> *"I was on an admin page for our team and accidentally hit a couple keys that pressed some random button. The page was full of buttons that had irreversible effects which were executed without confirmation."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42358708)

### 1.4 Hint mode requires a mental pause to read labels

**Job**: Follow a link the instant I decide to click it, with zero cognitive overhead.

**Pain**: Standard hint mode (press `f`, wait for letter labels to render, read label, type it) introduces a speed bump. Vimperator had a superior model: type the link text itself to filter, with numbers to disambiguate.

**Gain**: Hint mode where you type the link's visible text and the browser narrows matches, with numbers for disambiguation. No pause to read generated labels.

> *"You have to pause after hitting 'f' to wait for those letters to appear, read them, then type them. Vimperator handled links where you'd hit 'f' then type the text in the link itself, with numbers to disambiguate... it was very fast and fluid to use"*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42360228)

### 1.5 Firefox took 25 years to ship customizable keyboard shortcuts

**Job**: Remap browser keyboard shortcuts to match muscle memory from vim/tmux/WM workflows.

**Pain**: Firefox only shipped customizable keyboard shortcuts in late 2025/early 2026. For 25 years, Ctrl+Q (quit), Ctrl+W (close tab), and other dangerous shortcuts were hardcoded. Extensions could not reliably override browser-level shortcuts.

**Gain**: Full keyboard shortcut customization including dangerous shortcuts, conflict detection, and export/import of keymaps.

> *"Firefox finally lets you customize Keyboard Shortcuts, 25 years after the first request"*  
> — r/firefox (2025-12) [[src]](https://www.reddit.com/r/firefox/comments/1ozmjos/firefox_finally_lets_you_customize_keyboard/)

### 1.6 Keyboard input handling is broken across keyboard layouts

**Job**: Use vim-style keybindings on non-US keyboard layouts (QWERTZ, Dvorak, Colemak, etc.) without per-layout reconfiguration.

**Pain**: Nyxt's input handling historically relied on `KeyboardEvent.key` which is layout-dependent. On macOS, Option key triggers a layer making `M-s` register as `M-ß`. QWERTZ users must bind `C-z` when they mean `C-y`.

**Gain**: Physical key position-based binding (`KeyboardEvent.code`) so bindings work identically regardless of OS keyboard layout.

> *"(2) is stateful and not portable... People using alternative keyboard layouts can still use their keybindings without extra ad-hoc manipulations"*  
> — Nyxt issue #3584 [[src]](https://github.com/atlas-engineer/nyxt/issues/3584)

---

## 2. Tab & Buffer Management

### 2.1 Flat tab lists don't represent cognitive structure

**Job**: Organize browsing sessions by task/project, not by chronological order of tab opening.

**Pain**: Tabs are a flat, ordered list. Power users have 50–200+ tabs spanning multiple unrelated projects. The tab bar becomes a compressed, unreadable strip of favicons. Finding a specific tab requires scanning or using Ctrl+Tab cycling, which is random-feeling.

**Gain**: Hierarchical or tree-structured tabs with project grouping, fuzzy search over tab content (not just title/URL), and spatial memory preserved.

> *"Navigating a flat list of tabs feels like a chore... Tab search only indexes title/url, not the content — If I have 50 tabs opened, currently on tab 35, and remember a vague term I read in one of the 34 tabs before — How do I trace my way back to it?"*  
> — HN Ask thread [[src]](https://news.ycombinator.com/item?id=39247432)

### 2.2 Buffer ordering in keyboard-first browsers is unpredictable

**Job**: Use `switch-buffer-next`/`prev` to cycle through a known, predictable set of buffers (like tabs in a terminal multiplexer).

**Pain**: In Nyxt, buffer ordering comes from a hash table with no guaranteed order. Newly created buffers appear in apparently random positions. There is no way to reorder or pin buffers.

**Gain**: User-controllable buffer ordering, pinnable positions (`C-1` for buffer 1), and rational default ordering (creation time, tree ancestry).

> *"switch-buffer-next/prev... imposes a tree structure on the output of buffer-list which comes from a call to alex:hash-table-values which I guess has no idea about sort order. Newly created buffers get slotted into the ordering at apparently random places."*  
> — Nyxt issue #1695 [[src]](https://github.com/atlas-engineer/nyxt/issues/1695)

### 2.3 Context switching happens inside the browser, not between apps

**Job**: Focus deeply on one task at a time without being visually reminded of all other open tasks.

**Pain**: A single browser window with mixed tabs (work, research, personal, admin) forces cognitive context-switching every time the tab bar is glanced at. Profiles and workspaces exist in Vivaldi but are absent or weak in Firefox and Chrome.

**Gain**: Workspace isolation where each task context is invisible until deliberately entered — separate tab sets, separate history, separate session state.

> *"Most of my work now lives in the browser... At any given moment, my Vivaldi tab bar contained a mix of deep work, background research, admin tasks, distractions, and things I was afraid to close because I might need them later. That meant every glance at the tab bar forced my brain to parse multiple contexts at once."*  
> — MakeUseOf (2026-02) [[src]](https://www.makeuseof.com/reduced-context-switching-on-linux-redesigning-browser-workflow/)

### 2.4 Tab hoarding driven by fear of losing context

**Job**: Safely close tabs knowing I can find that page again if needed.

**Pain**: Browser history is a giant unsorted list. Bookmarks require manual organization. Users keep tabs open as memory prosthetics. 100+ open tabs degrade performance and increase cognitive load.

**Gain**: Reliable session restore, searchable session history with full-text indexing, and "tab graveyard" patterns where closed tabs are trivially recoverable.

> *"I stopped keeping tabs open out of fear. If I needed something later, I trusted the session restore."*  
> — MakeUseOf article [[src]](https://www.makeuseof.com/reduced-context-switching-on-linux-redesigning-browser-workflow/)

> *"OneTab was the solution for me. I see it as a 'tab graveyard': with one click, my current tabs are saved somewhere. I feel good because they are not lost, but most of the time I don't go back to the list."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=36025900)

### 2.5 History is a flat timeline with no relational structure

**Job**: Retrace how I arrived at a page — the *path* through the web, not just the destination.

**Pain**: Browser history records URLs and timestamps but loses the navigation graph. If you visit foo → bar → baz → bar, history shows foo, baz, bar (deduplicating the first visit to bar). The causal chain is destroyed.

**Gain**: Tree-structured history showing parent-child navigation relationships, with the ability to revisit the *journey* not just individual pages.

> *"Browsers should remember browsing history (what pages have I been on, and how did I get there), yet I never seen a browser that can do that."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42355658)

> *"If you're on site foo, then go to bar, then baz, then bar again. The history GUI is not going to show foo, bar, baz, bar. It's going to show foo, baz, bar. The first time you went to bar is hidden."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42363111)

---

## 3. Extension Ecosystem & Programmability

### 3.1 Keyboard-first browsers lack the extension ecosystem

**Job**: Use a keyboard-driven browser *and* keep password manager, ad blocker, container tabs, and other essential extensions.

**Pain**: Qutebrowser and Nyxt have no WebExtension support. Users are forced to choose between keyboard-first UX and the extension ecosystem (uBlock Origin, Bitwarden, Multi-Account Containers). This is the #1 reason users leave these browsers.

**Gain**: A browser that is natively keyboard-driven *and* supports the full WebExtension API (or at minimum uBlock Origin + password manager).

> *"I tried really hard with QB... but the lack of uBlock Origin makes browsing random sites horrible."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42358608)

> *"The lack of a solid Bitwarden integration in QuteBrowser is kind of hurting though."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42360359)

> *"The one thing holding me back from this is not being able to run UBlock origin on it yet."*  
> — HN user on Nyxt [[src]](https://news.ycombinator.com/item?id=42355405)

> *"Every time I've tried to use Qutebrowser, or similar — I end up bouncing from it because I want proper extension support."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42359745)

### 3.2 WebExtension API is too restricted for power-user extensions

**Job**: Build extensions that deeply integrate with browser internals — modify the address bar, intercept all navigation, control browser chrome.

**Pain**: The WebExtension API (post-Firefox 57 / post-XUL) deliberately sandboxes extensions away from browser internals. Tridactyl can't work on `about:` pages, can't modify CSP headers as freely as Vimium (due to Firefox restrictions), and can't embed its own PDF viewer due to security update concerns.

**Gain**: A privileged extension tier (opt-in, with user consent) that has access to browser chrome, all pages, and native OS APIs.

> *"I'm still a little sad Vimperator — the precursor to all of these — does not work in modern browsers because it was so good but Tridactyl is certainly as close as one is allowed to get with WebExtensions."*  
> — HN user kqr [[src]](https://news.ycombinator.com/item?id=41911981)

> *"The late, great Vimperator extension was more comparable to QuteBrowser but it stopped functioning (on Firefox) when they switched from XUL to web extensions."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42360359)

### 3.3 Tridactyl hits CSP and permission walls

**Job**: Use Tridactyl's command-line and hint mode on all websites without manual CSP workarounds.

**Pain**: Firefox's Content Security Policy enforcement blocks Tridactyl's injected scripts on sites like raw GitHub pages. Vimium on Chrome doesn't have the same limitation. Users must manually configure CSP exceptions.

**Gain**: Browser-level exemption for trusted extensions from CSP restrictions on all sites.

> *"Tridactyl needs CSP tweaks to work on 'raw' GitHub pages but Vimium doesn't"*  
> — Tridactyl issue #5298 [[src]](https://github.com/tridactyl/tridactyl/issues/5298)

---

## 4. Performance & Stability

### 4.1 Keyboard-first browsers have severe memory issues

**Job**: Keep a keyboard-first browser running all day with 30-100 tabs without it consuming all system memory.

**Pain**: Qutebrowser users report 100+ GiB memory usage with a few dozen tabs. Nyxt reports "extremely high memory" with a single tab open. These aren't mainstream browsers with years of memory optimization.

**Gain**: Memory usage competitive with Firefox/Chrome for the same number of tabs, with tab unloading and explicit memory management controls.

> *"I really enjoy using qutebrowser... It's a shame that I often end up using more than 100GiB of RAM with a few dozen tabs, almost like it leaks memory."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42357844)

> *"Extremely high memory used in spite of having only 1 tab open"*  
> — Nyxt issue #1129 [[src]](https://github.com/atlas-engineer/nyxt/issues/1129)

### 4.2 Niche browsers can't handle modern web apps

**Job**: Use qutebrowser/nyxt as daily driver including bank logins, video streaming, SPAs.

**Pain**: QtWebEngine lags behind Chromium releases (6-month cycle). Bank login flows, QR codes, authentication, and video playback (proprietary codecs) frequently break. Users are forced back to Firefox/Chrome for specific tasks.

**Gain**: A keyboard-first browser built on a current, well-maintained engine that handles all modern web apps without fallback.

> *"I loved qutebrowser, but many pages didn't work because of the rendering engine. That made me go back to Firefox."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42355948)

> *"I've recently started using QB and I noticed certain sites doesn't work. Almost every time it is some kind of authentication flow or something bank-related."*  
> — r/qutebrowser [[src]](https://www.reddit.com/r/qutebrowser/comments/1rqoqss/login_issues_on_certain_sites.json)

### 4.3 Nyxt crashes and hangs frequently

**Job**: Use a programmable, Lisp-based browser for daily work without losing state.

**Pain**: Nyxt crashes when changing buffers, when Wayland is used, when fast-typing in auto-complete, and when restoring sessions with history. Users report trying to adopt Nyxt annually and bouncing each time.

**Gain**: A programmable browser that is as stable as Firefox for daily use.

> *"A few years ago I doggedly tried to switch to Nyxt for everyday use. I really liked the concept, but at the time, it was too buggy, and constantly crashed on me."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42355287)

> *"Nyxt crashes when changing buffers repeatedly"*  
> — Nyxt issue #3393 [[src]](https://github.com/atlas-engineer/nyxt/issues/3393)

---

## 5. Linux & Window Manager Integration

### 5.1 Browser fights the window manager instead of cooperating

**Job**: Browser integrates cleanly with i3/sway/hyprland — respects focus rules, doesn't steal focus, works with tiling layouts.

**Pain**: Pop-up windows, permission dialogs, download prompts, and new windows from the browser disrupt tiling WM layouts. Notifications steal focus. Browser assumes it manages its own window positioning.

**Gain**: Browser that exposes window management to the WM, opens pop-ups as WM-managed windows, and never steals focus.

> *"On Linux, and specifically with a calm desktop environment... window behavior is predictable. I pinned the browser to a specific workspace and adjusted focus rules so new windows did not steal attention."*  
> — MakeUseOf [[src]](https://www.makeuseof.com/reduced-context-switching-on-linux-redesigning-browser-workflow/)

### 5.2 Profiles and containers are clumsy on Linux

**Job**: Launch isolated browser instances (separate cookies, history, extensions) for different identities from the CLI.

**Pain**: Firefox profiles require manual `-P profilename --no-remote` flags. Flatpak makes profile launching from CLI even harder. Multi-Account Containers are extension-level, not OS-level, so they share the process and can't be independently managed by the WM.

**Gain**: First-class CLI support for launching profile-isolated browser instances, each appearing as independent WM windows with distinct WM_CLASS values for window rules.

> *"How to launch firefox with a specific profile in linux... How to launch a specific profile with flatpak from the CLI?"*  
> — r/firefox (multiple threads) [[src]](https://www.reddit.com/r/firefox/comments/1qcim81/how_to_launch_firefox_with_a_specific_profile_in/) [[src]](https://www.reddit.com/r/firefox/comments/ur36t9/how_to_launch_a_specific_profile_with_flatpak/)

### 5.3 QtWebEngine security updates lag behind on Linux distros

**Job**: Run qutebrowser with an up-to-date, secure rendering engine on stable Linux distros.

**Pain**: Debian/Ubuntu "stable" never ships QtWebEngine security backports. Qt itself only updates the Chromium baseline every 6 months with security patches every 1-2 months. Users must use alternative Qt sources or accept running months-old Chromium.

**Gain**: A browser engine that receives security updates within days of upstream disclosure, regardless of distro packaging.

> *"There is the issue of 'stable' Linux distributions (mostly Debian/Ubuntu) which never get those updates to you unfortunately, and don't seem to care about those being security-relevant either."*  
> — The-Compiler (qutebrowser author) [[src]](https://news.ycombinator.com/item?id=42365069)

---

## 6. Programmability & Configuration

### 6.1 Config-as-code with real language, not JSON/YAML

**Job**: Configure every aspect of the browser using a real programming language with conditionals, loops, and imports.

**Pain**: Firefox uses `about:config` (flat key-value), Chrome uses JSON policies. Neither supports programmatic configuration. Qutebrowser's Python config is praised specifically because it enables conditional logic (e.g., disable JS per-domain).

**Gain**: Full configuration in a real language (Python, Lua, Lisp, or similar) with access to browser state, event hooks, and the ability to compose behaviors.

> *"The python config is great too, I use it to disable javascript conditionally."*  
> — HN user [[src]](https://news.ycombinator.com/item?id=42357844)

> *"Nyxt differs fundamentally in its philosophy — rather than exposing a set of parameters for customization, Nyxt allows you to customize all functionality. Every single class, method, and function is overwritable and reconfigurable."*  
> — HN user quoting Nyxt docs [[src]](https://news.ycombinator.com/item?id=42362075)

### 6.2 No command mode / ex-mode equivalent in mainstream browsers

**Job**: Execute browser actions via a command line within the browser (like vim's `:` command mode or dmenu/rofi).

**Pain**: Firefox and Chrome have no built-in command palette. Tridactyl adds one via WebExtension but it's limited by the API sandbox. The only browsers with real command modes are qutebrowser and Nyxt, which lack the extension ecosystem.

**Gain**: A native command mode (`:open`, `:tabclose`, `:set`, `:source`) integrated into the browser with tab completion, history, and full access to browser internals.

> *"There's also some magic feeling when pressing 'o' and having access to the world."*  
> — HN user on qutebrowser [[src]](https://news.ycombinator.com/item?id=42357844)

### 6.3 Configuration should be versionable and portable

**Job**: Store browser configuration in git, sync across machines, share with others.

**Pain**: Firefox profiles are binary blobs (SQLite databases, proprietary formats). Chrome settings sync is Google-account-tied. Neither is designed for `git diff` or collaborative configuration.

**Gain**: Plain-text configuration files, bookmarks as a text format, history exportable to SQLite, everything `git`-compatible.

> *"Everything gets saved to a SQLite database, so you can plug it into your own home-made tools"*  
> — HN Ask thread [[src]](https://news.ycombinator.com/item?id=39247432)

> *"Bring your own sync server / self-hostable sync server"*  
> — Same thread

---

## 7. Search, History & Bookmarks

### 7.1 Bookmarks should be tag-based, not folder-based

**Job**: Organize bookmarks by multiple overlapping categories without duplicating them.

**Pain**: Folder-based bookmarks force a single hierarchy. A page about "Rust + WebAssembly + Performance" can only live in one folder. Tags would allow cross-cutting organization.

**Gain**: Tag-based bookmarks with fuzzy search, auto-suggested tags based on content, and flat retrieval.

> *"Bookmarking should be tag based, not folder based"*  
> — HN Ask thread [[src]](https://news.ycombinator.com/item?id=39247432)

### 7.2 Full-text search over open tabs

**Job**: Find a tab by remembering a word or phrase from its *content*, not its title.

**Pain**: Browser tab search (Ctrl+Tab, `%` prefix in Firefox) only matches tab titles and URLs. If you remember reading a specific term in one of 50 open tabs, there's no way to search for it.

**Gain**: Full-text index of rendered tab content, searchable from the address bar or command mode.

> *"Tab search only indexes title/url, not the content — If I have 50 tabs opened and remember a vague term I read in one of the 34 tabs before — How do I trace my way back to it?"*  
> — HN Ask thread [[src]](https://news.ycombinator.com/item?id=39247432)

### 7.3 No interaction-aware history

**Job**: History should know *how much* I engaged with a page, not just that I visited it.

**Pain**: History is a binary "visited" flag with a timestamp. A page I spent 20 minutes reading is indistinguishable from one I bounced from in 2 seconds.

**Gain**: History weighted by scroll depth, time on page, and interaction events. Search results ranked by engagement.

> *"Interaction-aware search ranking. For instance, if you scroll 60% of the way through on one tab and then search for a term that existed at the 55% mark on that tab, it should show up first."*  
> — HN Ask thread [[src]](https://news.ycombinator.com/item?id=39247432)

---

## Cross-Cutting Themes

| Theme | Pain Points | Key Insight |
|---|---|---|
| **Extension vs. Native** | 1.1, 1.2, 3.1, 3.2, 3.3 | The fundamental tension: keyboard-first UX requires native integration, but the extension ecosystem requires a mainstream engine. No browser solves both. |
| **Vimperator Nostalgia** | 1.1, 3.2, 1.4 | XUL-era Vimperator (pre-2017) is the gold standard. Every keyboard tool since is described as "as close as one is allowed to get." |
| **Tab Overload** | 2.1, 2.3, 2.4, 2.5 | Users with 50–200+ tabs need spatial/semantic organization, not just more tabs. Tree-style tabs and workspaces are workarounds for a missing abstraction. |
| **Fear of Losing Context** | 2.4, 2.5, 7.3 | Tab hoarding is a symptom of unreliable history/session restore. Fix the retrieval problem and the hoarding behavior reduces. |
| **Config as Code** | 6.1, 6.2, 6.3 | Power users want to `git commit` their browser config. Text-file configuration with a real language is a hard requirement. |
| **Linux Second-Class** | 5.1, 5.2, 5.3, 4.2 | Browsers assume desktop environment with compositing WM. Tiling WM integration, CLI profile management, and timely security updates are neglected. |
| **RSI / Ergonomics** | 1.1, 1.3, 1.4 | Keyboard preference is often driven by physical pain (RSI, arthritis), not elitism. Reducing mouse-keyboard switching is a medical need for some users. |

---

## Aether Opportunity Matrix

Features that would directly address the highest-frequency pain points, mapped to the project's feature taxonomy:

| Pain Point | Aether Category | No Competitor Solves |
|---|---|---|
| Native vim mode everywhere (1.1) | Keyboard & Input | Partially (qutebrowser, but no extensions) |
| Website key stealing prevention (1.2) | Keyboard & Input | **Yes — no browser solves this natively** |
| Workspace isolation with separate state (2.3) | Workspace & Organization | Partially (Vivaldi workspaces, Arc spaces) |
| Tree-structured history (2.5) | Core Browsing | Partially (Nyxt global history tree, but unstable) |
| Keyboard-first + full extension support (3.1) | Extensibility | **Yes — gap in every existing browser** |
| Config-as-code in a real language (6.1) | Extensibility | Partially (qutebrowser Python, Nyxt CL) |
| Command mode / ex-mode (6.2) | Keyboard & Input | Partially (qutebrowser, Nyxt) |
| Full-text tab search (7.2) | Productivity | **Yes — no browser indexes tab content** |
| Tag-based bookmarks (7.1) | Core Browsing | **Yes — all major browsers use folders** |
| Interaction-aware history (7.3) | Core Browsing | **Yes — no browser tracks engagement depth** |

Bolded rows represent features where **no existing browser** provides a native solution — these are the strongest differentiation opportunities.

---

## Sources Index

| # | Source | URL |
|---|---|---|
| 1 | HN: Qutebrowser thread (2024-12) | https://news.ycombinator.com/item?id=42356668 |
| 2 | HN: Nyxt thread (2024-12) | https://news.ycombinator.com/item?id=42354691 |
| 3 | HN: Nyxt thread (2023-06) | https://news.ycombinator.com/item?id=36006423 |
| 4 | HN: Tridactyl comment | https://news.ycombinator.com/item?id=41911665 |
| 5 | HN: Ask — Browser wishlist | https://news.ycombinator.com/item?id=39247432 |
| 6 | HN: Ask — Many browser tabs | https://news.ycombinator.com/item?id=36024176 |
| 7 | HN: TabTab — keyboard workspace | https://news.ycombinator.com/item?id=43786933 |
| 8 | r/firefox: Customizable keyboard shortcuts | https://www.reddit.com/r/firefox/comments/1ozmjos/ |
| 9 | r/qutebrowser: Login issues | https://www.reddit.com/r/qutebrowser/comments/1rqoqss/ |
| 10 | MakeUseOf: Context switching on Linux | https://www.makeuseof.com/reduced-context-switching-on-linux-redesigning-browser-workflow/ |
| 11 | Tridactyl #904: Websites steal slash | https://github.com/tridactyl/tridactyl/issues/904 |
| 12 | Tridactyl #5298: CSP issues | https://github.com/tridactyl/tridactyl/issues/5298 |
| 13 | Tridactyl #4944: Unbind j/k on Google | https://github.com/tridactyl/tridactyl/issues/4944 |
| 14 | Nyxt #3584: Input handling strategy | https://github.com/atlas-engineer/nyxt/issues/3584 |
| 15 | Nyxt #1695: Buffer ordering confusion | https://github.com/atlas-engineer/nyxt/issues/1695 |
| 16 | Nyxt #3393: Crash on buffer switch | https://github.com/atlas-engineer/nyxt/issues/3393 |
| 17 | Nyxt #1129: Memory usage | https://github.com/atlas-engineer/nyxt/issues/1129 |
| 18 | Qutebrowser #8856: Runaway memory | https://github.com/qutebrowser/qutebrowser/issues/8856 |
| 19 | Zen Browser #10518: Vim urlbar navigation | https://github.com/zen-browser/desktop/pull/10518 |
| 20 | Vimium #4828: focusInput broken | https://github.com/philc/vimium/issues/4828 |
| 21 | r/firefox: Profile launching on Linux | https://www.reddit.com/r/firefox/comments/1qcim81/ |
| 22 | Brave #53726: Vim navigation request | https://github.com/brave/brave-browser/issues/53726 |
| 23 | Mozilla Connect: Customizable Hotkeys | https://connect.mozilla.org/t5/discussions/customizable-hotkeys-is-live-please-help-us-scope-version-2/ |
