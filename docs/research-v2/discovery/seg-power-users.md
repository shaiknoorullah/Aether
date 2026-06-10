# Discovery Department Report: Browser Power Users (2026)

> **Team**: seg-power-users (department: discovery)
> **Mandate**: Browser power users 2026 (vim/keyboard, tiling-WM, suckless, devs) — unmet JTBD, workflows, pain points, switch-driving features; install/community-size evidence.
> **Date**: 2026-06-10
> **Primary source brief**: `outputs/power-user-browser-jtbd.md` (Feynman deep-research, 60 sources, verified PASS-with-notes)
> **Provenance**: `outputs/power-user-browser-jtbd.provenance.md`
> **Sibling drafts skimmed**: `outputs/.drafts/power-user-T1.md` (community size), `T2` (pain/JTBD), `T3` (landscape/gaps), `T4` (workflows/switch triggers)

---

## 1. Executive Summary

The keyboard-power-user browser segment (vim/keyboard-driven, tiling-WM, suckless, developer users) is small in absolute share but coherent, technically sophisticated, vocal, and disproportionately influential as an early-adopter and word-of-mouth base. Hard install evidence anchors the size: Vimium reports **500,000+ weekly active** Chrome users [1], Tridactyl carries **6,220 GitHub stars** [9], and qutebrowser **11,542 stars** [11]. The Linux-native sub-segment proxies through Arch Linux (~5M estimated users [2]), where tiling WMs dominate the opt-in pkgstats sample (Hyprland 21.30%, Sway 11.33%, i3 10.41% [16]) and Firefox holds 58% browser share [3]. Working addressable estimate: **1–3 million keyboard-power-user browser users globally**.

The segment carries one defining wound: **Firefox 57 (2017) killed the XUL-era Vimperator/Pentadactyl extensions**, which had offered full keyboard-modal control of *all* browser chrome [4]. No product has restored that capability. Users today are forced to choose between two permanently compromised options: (a) standalone keyboard-first browsers (qutebrowser, Nyxt) that give full chrome control but **lack uBlock Origin**, suffer systematic bot-detection blocking, and miss native password managers; or (b) mainstream browser + vi extension (Tridactyl, Vimium) that keep modern-web compat and uBlock but are **capped by the WebExtension sandbox** — they cannot touch browser chrome, and SPA/React focus traps break them constantly.

**The five-way gap no product fills**: full keyboard control of all browser chrome + uBlock-quality adblocking + native password-manager integration + complete modern-site compatibility + config stability surviving updates. Every current option sacrifices at least two. This is precisely the whitespace an AI-native, deeply-privileged Aether shell can own — *if* it ships native (not extension-bound) keyboard control, a real adblock engine, and git-committable text config. The single most-cited switch trigger is **uBlock Origin quality adblocking** [22,24,25]; the single most-cited unmet capability is **vim control of the entire browser, not just the page** [22].

---

## 2. Key Findings (each with source URL)

**F1 — The segment is real and measurable.** Vimium has 500,000+ weekly active Chrome users (official store figure; a third-party tracker claims 4.72M all-time, used only as upper bound). — https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb

**F2 — Standalone keyboard browsers have committed communities but are stagnant/single-maintainer.** qutebrowser 11,542 stars (active sole part-time maintainer), Nyxt 10,866 stars (pre-release 4.0, stability issues). — https://github.com/qutebrowser/qutebrowser

**F3 — Tiling-WM Linux is the concentrated core.** Arch pkgstats (opt-in, power-user-skewed): Hyprland 21.30%, Sway 11.33%, i3 10.41% of WM installs; ~80% on Wayland; Vim 62% / Neovim 35% editor share. — https://pkgstats.archlinux.de/fun/Window%20Managers/current and https://linuxiac.com/arch-linux-community-survey-results/

**F4 — Firefox is the segment's incumbent, not Chrome.** Arch Community Survey (n=3,923): Firefox 58% preferred browser, Firefox-based 17%, Brave 9%, Chrome 5%; 65%+ prefer CLI over GUI. This favors a Firefox-fork delivery vehicle for credibility with this segment. — https://linuxiac.com/arch-linux-community-survey-results/

**F5 — The WebExtension API ceiling is a fundamental architectural limit, not a bug.** Extensions cannot intercept keyboard events in browser chrome (address bar, tab bar, native dialogs); Mozilla was willing to accept a lower-level keyboard API patch but no contributor completed the review. Every extension-based vim layer lives below this ceiling. — https://news.ycombinator.com/item?id=24636650

**F6 — SPA/React focus traps systematically break extension vim layers.** Next.js/React steal keyboard focus; Tridactyl documents recurring per-site breakage (issues #5024, #5128, both 2024) with 4+ per-site fix patterns. — https://github.com/tridactyl/tridactyl/issues/5128

**F7 — Missing uBlock Origin is the #1 exit reason from standalone keyboard browsers.** "The lack of Ublock Origin makes browsing random sites horrible... builtin ad blockers are not even remotely good enough." python-adblock is explicitly rejected as insufficient. — https://port19.xyz/tech/bye-qutebrowser/

**F8 — Standalone keyboard browsers are systematically bot-blocked in 2024–2026.** qutebrowser is blocked by Reddit (#8599), triggers Google CAPTCHAs (#8703), and is blocked by Anubis on GitLab (#8509). Systematic blocking (vs. occasional breakage) is a dealbreaker. — https://github.com/qutebrowser/qutebrowser/issues/8599

**F9 — Config-as-code is a hard requirement, treated like editor config.** Users want a version-controlled text config (Python/Lua/TOML/Lisp) reproducible on a new machine, decoupled from browser API version. The Firefox 57 trauma and recurring Tridactyl breakage drive this. — https://github.com/vimperator/vimperator-labs

**F10 — Native password-manager integration is missing and fragile where it exists.** qute-pass emulates keystrokes (breaks on non-standard forms); Bitwarden/1Password users have no first-class option. "The lack of a solid Bitwarden integration in QuteBrowser is kind of hurting." — https://news.ycombinator.com/item?id=42356668

**F11 — Tab management at 50–200+ tabs needs hierarchy; tree-style tabs are a decade-old unmet request.** qutebrowser #927 open since 2015 (81+ reactions), draft PR #8082 still unmerged June 2026; Brave #44345 documents the same need ("hundreds or thousands of tabs"). — https://github.com/qutebrowser/qutebrowser/issues/927

**F12 — Unix-tool composition is a defining workflow, with whole projects existing to bridge the gap.** Dedicated tools exist because browsers don't expose tab/bookmark/history data to WM launchers: tabflow (rofi/fzf tab switch), webextension-dmenu, browserpass (pass native messaging), fzf history. A new project `dumber` explicitly targets "keyboard-driven web browser for tiling WMs." — https://github.com/bnema/dumber

**F13 — Privacy controls are wanted without about:config archaeology.** arkenfox, lacuna, and ungoogled-chromium exist purely to provide telemetry-free, hardened defaults on top of mainstream browsers — signalling demand for first-class privacy UI. — https://github.com/arkenfox/user.js (segment also references hnhx/user.js, woolkingx/lacuna, ungoogled-software/ungoogled-chromium)

**F14 — Manifest V3 is actively regressing extension power.** Vimium v2.0 (MV3) broke bookmarklets under restrictive CSP and restricts dynamic script injection — eroding the customization patterns power users relied on, widening the case for a non-extension-bound architecture. — https://github.com/philc/vimium/issues/4331

**F15 — Wayland-native rendering is now table stakes for this segment.** ~80% of Arch users on Wayland and Hyprland the top WM; a browser with persistent Wayland issues (tearing, screen-share, fractional scaling) is real friction in 2026. — https://linuxiac.com/arch-linux-community-survey-results/

---

## 3. Implied Aether Feature Candidates

Mapped to the 12 Aether categories. Bolded "whitespace" = no existing browser solves natively. RICE inputs are in the returned structured object; below is the narrative rationale.

| # | Feature | Aether Category | Addresses | Whitespace? |
|---|---------|-----------------|-----------|-------------|
| C1 | **Native vim/modal control of the entire browser chrome** (address bar, tab bar, dialogs, settings, PDF, reader) | Keyboard & Input | F5, J2/ST2 | **Yes — only qutebrowser/Nyxt, and they sacrifice adblock+compat** |
| C2 | **uBlock-Origin-class adblock + cosmetic filtering + scriptlet injection, native** | Privacy & Security | F7, ST1 | **Yes — the deciding switch trigger; no keyboard-native browser has it** |
| C3 | **Site keyboard-capture priority / focus-trap immunity** (browser-level keys win unless yielded per-site) | Keyboard & Input | F6, P2 | **Yes — no browser solves SPA/React focus traps natively** |
| C4 | **Git-committable text config in a real language** (TOML + scripting), decoupled from browser version | Extensibility | F9, ST4 | Partial (qutebrowser Python, Nyxt CL) — but with stability guarantee, Yes |
| C5 | **Tree-style / hierarchical tabs + named workspaces + fuzzy tab search at 200+ tabs** | Workspace & Organization | F11, J3 | Partial (Tree Style Tab ext, Vivaldi) — native + keyboard-first is whitespace |
| C6 | **Universal command palette** (fuzzy across history, bookmarks, open tabs, commands — Telescope/rofi-like) | Productivity | J7 | Partial — none unify all four sources natively keyboard-first |
| C7 | **Native password-manager integration** (pass + Bitwarden/1Password): keybind → fuzzy search → autofill, no clipboard | Privacy & Security | F10, ST3 | **Yes — no first-class pass+Bitwarden keyboard flow exists** |
| C8 | **Unix-tool / CLI IPC surface** — expose tabs/bookmarks/history to external launchers (rofi/dmenu/fzf) and accept commands via a local socket/native-messaging host | Extensibility | F12, W2–W5 | **Yes — whole ecosystem of glue projects exists because no browser does this** |
| C9 | **First-class privacy UI** (telemetry-off default, WebRTC/canvas/first-party-isolation toggles) — no about:config archaeology, no account required | Privacy & Security | F13, ST7/ST10 | Partial — arkenfox/ungoogled prove demand; native polished UI is whitespace |
| C10 | **Modern-site compatibility guarantee** (standard engine + UA management) so the browser is never systematically bot-blocked | Core Browsing | F8, ST6 | This is *why* a Chromium/Firefox engine fork beats a bespoke QtWebEngine shell |
| C11 | **Tiling-WM / Wayland-native behavior** — no focus-grabbing modal dialogs, opens as a clean tile, Wayland-native rendering | Performance | F15, W1 | Partial — most browsers assume compositing DE; clean tiling behavior is whitespace |
| C12 | **DevTools at Firefox/Chrome quality** (network inspector, CSS live-edit, a11y tree) for the developer sub-segment | Developer Tools | ST9 | Table stakes — a reason devs prefer Firefox over qutebrowser; must not regress |

---

## 4. Competitive / Whitespace Notes

**The five-axis tradeoff table (from the brief) is the core competitive map.** No current product wins all five axes; Vimperator/Pentadactyl (pre-2017, XUL) was the last to do so:

| | Full kbd chrome | uBlock-class adblock | Modern compat | Native pass/PM | Config stability |
|-|---|---|---|---|---|
| qutebrowser | ✅ | ❌ | Partial | Partial (userscript) | ✅ |
| Nyxt | ✅ | ❌ | Partial | Partial | Partial |
| Firefox + Tridactyl | ❌ | ✅ | ✅ | ✅ | ❌ |
| Chrome + Vimium | ❌ | ✅ | ✅ | ✅ | ❌ (MV3 risk) |
| surf (suckless) | Partial | ❌ | Partial | ❌ | ✅ |
| Zen Browser | ❌ | ✅ (FF ext) | ✅ | ✅ (FF ext) | ❌ (ext-based) |
| **Aether target** | **✅ native** | **✅ native** | **✅ engine fork** | **✅ native** | **✅ versioned config** |

Source: `outputs/power-user-browser-jtbd.md` §4.

**Delivery-vehicle implication.** The brief strongly favors a **Firefox-fork or deeply-privileged shell over a custom QtWebEngine browser**: (a) Firefox is the segment's incumbent (58% share, F4); (b) standalone QtWebEngine browsers eat the bot-detection and security-lag penalties (F8, P11 — ~6-month Chromium baseline lag); (c) the WebExtension ceiling (F5) means an *extension* can never deliver C1/C3, so Aether must own the chrome at a privileged level. Mozilla's MV3 is more permissive than Chrome's (open question #3), which is a Firefox-side advantage worth preserving.

**Zen Browser is the nearest momentum competitor but not a threat to this segment** — it targets visual/workspace (Arc-like) users, not keyboard-first; its vim contribution is a single Ctrl+J/K URL-bar PR. `dumber` is an early signal that the tiling-WM-native niche is being actively chased by indie devs; Aether should move before that space consolidates.

**Strongest differentiation (bolded whitespace above): C1, C2, C3, C7, C8.** Shipping C1+C2 together is the single biggest unlock — it collapses the two-option compromise that has defined the segment since 2017.

---

## 5. Risks

**R1 — Engine maintenance burden.** Owning chrome at a privileged level (fork or custom shell) inherits the security-update treadmill that already burns qutebrowser (~6-month Chromium baseline lag, security backports 1–2 months behind upstream [P11]). Underestimating this is the project-killer risk. Mitigation: track an upstream engine closely; do not bespoke a WebEngine.

**R2 — uBlock Origin is a moving, MV3-pressured target.** "uBlock-class" requires DNR/MV3-equivalent or a more permissive engine; Chrome's MV3 already degrades uBO. Building C2 natively is real engineering, and "good enough" is explicitly rejected by this segment (F7). Mitigation: lean Firefox-side MV3 permissiveness or a native filtering engine, not a Chrome MV3 extension.

**R3 — The segment is small and anti-commercial.** 1–3M globally, telemetry-averse, account-sign-in-averse, sponsored-content-averse (Feature Taboo List). This is an early-adopter beachhead, not a revenue base; monetization conflicts directly with its values. Mitigation: treat as credibility/word-of-mouth wedge, monetize adjacent segments.

**R4 — Config-stability promise is a long-term contract.** The Firefox 57 trauma means breaking config across updates would permanently burn trust (F9, ST4). A versioned, deprecation-policied config API is a hard commitment, not a feature you ship once.

**R5 — Feature taboos are landmines.** Telemetry, silent auto-updates that break config, mouse-only UI, cloud sync of browsing data, account sign-in prompts, and Pocket/sponsored shortcuts are each individually disqualifying for this segment. Any of them in a default build forfeits the beachhead.

**R6 — Evidence caveats.** Vimium count is 500k weekly-active (conservative) vs. 4.72M third-party (unverified); the 1–3M addressable estimate is derived inference; Tridactyl AMO user count is not public; zathura/mpv-as-replacements are inference, not authoritative. Sizing should be treated as order-of-magnitude, not precise.

**R7 — Developer sub-segment may diverge.** Open question #6: DevTools-heavy developers may have materially different requirements (C12 weight, agent/automation needs) than non-developer keyboard power users. Treating the segment as monolithic risks mis-prioritizing.

---

*Source index: see `outputs/power-user-browser-jtbd.md` §9 (60 sources). Bracketed [n] references in this report map to that index.*
