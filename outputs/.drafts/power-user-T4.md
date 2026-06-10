# T4: Workflows, Switch Triggers & Tooling Overlap

Research conducted: 2026-06-10

---

## Documented Real Workflow Patterns

### Workflow 1: Tiling WM + keyboard browser as a unified tile
Power users in i3/Hyprland/Sway treat the browser as just another tile in their window layout. The browser must:
- Open and close without requiring mouse to find/click it
- Resize and refocus with the same WM keybindings as terminal tiles
- Not demand attention for pop-ups, dialogs, or permission prompts that grab focus

Evidence: Blog post "My Journey from i3 to Hyprland" describes maintaining "vi-style navigation muscle memory" across the entire desktop stack including browser:
https://tsoporan.com/blog/i3-to-hyprland-migration/

A new project specifically addresses this: `dumber` — "keyboard-driven web browser for tiling WMs, inspired by Zellij, built in Go" with explicit support for Hyprland, Sway, Niri, Rofi, and dmenu integration.
https://github.com/bnema/dumber (6 stars, very new, 13 open issues)

### Workflow 2: rofi/dmenu for tab switching and bookmark launching
Because browsers lack built-in fuzzy tab search accessible via global WM shortcut, users build external launchers:

- **tabflow**: "Easily switch and create tabs in Firefox using Rofi/fzf/dmenu" — https://github.com/snpshtwrx/tabflow
- **brave-rofi-menu**: "Switch Brave browser tabs using i3 and rofi" — https://github.com/antlis/brave-rofi-menu (created Jan 2025)
- **webextension-dmenu**: "Tab search, selection and beyond with a dmenu filter program" — https://github.com/alexherbo2/webextension-dmenu
- **firefox bookmark dmenu/rofi/fzf gist**: Shell script to query Firefox SQLite bookmarks and pipe to dmenu — https://gist.github.com/intrntbrn/cdb590090a9fcd0d0d32ae24092ab42a (updated Dec 2025)

These projects exist precisely because the browser's built-in tab/bookmark UX doesn't integrate with the WM's global launcher.

### Workflow 3: fzf for history/bookmark search
Power users pipe browser history/bookmarks into fzf for fuzzy command-line search:

- **fzf Chrome history/bookmarks example** in official fzf documentation: https://junegunn.github.io/fzf/examples/chrome/
  - Ruby script reads Chrome SQLite history, pipes to `fzf --ansi --multi`, opens selected URL
  - Demonstrates the pattern: browsers don't expose their history to the CLI, so users script around it

### Workflow 4: pass + browser integration
The UNIX password store (`pass`, `gopass`) is widely used in this community. Browser integration:

- **browserpass**: Go native messaging host, Chrome+Firefox extension — https://github.com/browserpass/browserpass-extension
  - Autofills login forms from pass store; protects against phishing by verifying domain
- **passff**: Firefox-specific pass extension — https://github.com/passff/passff
- **qute-pass userscript**: qutebrowser-native, uses `fake-key` to inject username+password — https://github.com/qutebrowser/qutebrowser/blob/main/misc/userscripts/qute-pass
  - Pattern: `[USERNAME]<Tab>[PASSWORD]` emulated keystrokes

These integrations require native messaging host infrastructure — they're not simple extensions. Setup friction is a barrier.

### Workflow 5: External tools replacing browser functionality
Power users systematically offload browser jobs to specialized CLI tools:

| Job | Browser fails because | External tool used |
|-----|----------------------|-------------------|
| Tab/bookmark search | No global fuzzy search | rofi + tabflow, fzf + sqlite |
| Password entry | Browser PM requires account/cloud | pass + browserpass/qute-pass |
| PDF reading | Browser PDF viewer no vi-keys | zathura (inference — no direct source found) |
| Video playback | Browser video not scriptable | mpv (inference — commonly cited in dotfile readmes) |
| Downloads | Download manager lacks CLI control | wget/curl (preference noted, no specific source) |
| RSS/reading | Browser reader mode insufficient | newsboat (separate feed reader, widely used in this community) |

**Note**: zathura/mpv/wget as browser replacements are commonly mentioned in the suckless/unixporn community ethos but I did not find direct cited evidence of their use as browser replacements in a single source. Marked as *inference* from community context.

### Workflow 6: qutebrowser config as dotfiles
qutebrowser's Python `config.py` is stored in dotfiles repos like any other config file, managed with git, shared publicly. This is a strong signal that the browser is treated as part of the system configuration, not an opaque application.

Evidence: qutebrowser documentation encourages Python config; qutebrowser README describes extensive scriptability.

### Workflow 7: Multiple profiles/contexts managed externally
Developers need work/personal/client isolation. Current approaches:
- Firefox container tabs + extensions (Multi-Account Containers)
- Separate browser profiles launched via CLI flags (`firefox -P profilename`)
- Whole browser switching via tools like switchyard (Go-based URL router, 99 stars): https://github.com/alyraffauf/switchyard

---

## Switch Triggers

Triggers documented from blog posts and community threads — ranked by frequency/urgency:

### ST1: uBlock Origin quality adblocking (CRITICAL — most cited)
- "I stopped using [qutebrowser] when YouTube ads became too invasive, and went back to Firefox + Vimium + uBlockOrigin." (HN, https://news.ycombinator.com/item?id=42356668)
- "uBlock Origin: vastly superior to brave-style adblocking provided to Qutebrowser." (port19.xyz, https://port19.xyz/tech/bye-qutebrowser/)
- Switch trigger: native uBlock Origin support (requires being a WebExtension-capable browser)

### ST2: Per-site cookie persistence (qutebrowser-specific)
- "The continued lack of per-site cookie persistence" caused 2-year qutebrowser user to switch. (port19.xyz)
- Switch trigger: sessions that remember logins per site across browser restarts

### ST3: Password manager native extension (Bitwarden/KeePassXC/pass)
- "The lack of a solid Bitwarden integration in QuteBrowser is kind of hurting though." (HN)
- "I switched back to Firefox partly because KeePassXC's extension makes entering credentials far more convenient." (paritybit.ca, https://www.paritybit.ca/blog/qutebrowser-to-firefox/)
- Switch trigger: first-class native Bitwarden/pass integration without userscript workarounds

### ST4: Modern web compatibility (Proxmox noVNC, site focus bugs)
- "Some sites which I would use would have elements that wouldn't load or work properly in qutebrowser." (paritybit.ca)
- Switch trigger: sites that work reliably on Chrome/Firefox but fail on Qt-based browsers

### ST5: Privacy/fingerprint control
- "There isn't even an option to disable WebRTC [in qutebrowser]. You have to launch qutebrowser with a command line flag just to disable reading from the HTML canvas." (paritybit.ca)
- Switch trigger: built-in privacy controls (WebRTC disable, canvas API blocking) without CLI flags

### ST6: Developer tools quality
- "Firefox's set much more intuitive and the easy-to-use live stylesheet editor makes it really easy for me to experiment." (paritybit.ca)
- Switch trigger: developer-class DevTools (network panel, CSS live-editing, accessibility tree)

### ST7: Tree-style tab support
- Issue #927 open since 2015, 81+ reactions. Users explicitly waiting for this.
- "Is hierarchical, incredibly information dense. I have sometimes hundreds or thousands of tabs open." (Brave issue #44345, https://github.com/brave/brave-browser/issues/44345)
- Switch trigger: keyboard-navigable tree/hierarchical tab management

### ST8: Stable keybinding config that survives browser updates
- Tridactyl/Vimium users experience config breakage after every Firefox/Chrome major version.
- Switch trigger: browser that version-locks vim-keybindings to config, not browser API version

### ST9: Dark mode / visual parity with mainstream browsers
- "Dark Reader: Most of the web is stuck in light mode, which contributes greatly to eye strain. The Dark Reader extension helps in ways Qutebrowser simply can't." (port19.xyz)
- Switch trigger: dark mode support for arbitrary pages

### ST10: Wayland-native operation
- 2025 Arch survey: ~80% prefer Wayland. qutebrowser has Wayland support but with recurring GTK/Qt issues.
- Switch trigger: browser that works natively on Wayland without XWayland fallback or screen-tearing

---

## Feature Taboo List (What This Segment Actively Rejects)

| Feature | Evidence |
|---------|---------|
| Telemetry / "phone home" | arkenfox (https://github.com/hnhx/user.js), lacuna (https://github.com/woolkingx/lacuna), ungoogled-chromium (https://github.com/ungoogled-software/ungoogled-chromium) — all exist to remove browser telemetry |
| Auto-updates breaking configs | Multiple Tridactyl issues; Firefox quantum killed Vimperator entirely |
| Mouse-first UI | Core ethos: "I want a browser where keyboard shortcuts are not an afterthought" (HN #19306243) |
| Cloud sync of browsing data | Privacy concern; also breaks local-only dotfile management philosophy |
| Pocket / sponsored shortcuts | Firefox survey complaints; reason users maintain hardened profiles |
| Electron-based shell | Not evidenced directly for browsers (Electron browser doesn't exist in this space), but frequently cited for other tools |
| Excessive dependencies (Python, Qt) | "Qutebrowser's dependencies needed to run it take up more space than Firefox itself." (brycev.com) |
| Modal confirmation dialogs | "A dialog box appears, and it takes the key presses instead of the browser" (qutebrowser issue #6136) |
| "Asking me to sign in" / browser accounts | Privacy; also breaks local profile philosophy |
