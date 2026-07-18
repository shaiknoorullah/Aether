# Execution Plan — Research → Daily Driver

Prime directive: every phase fits the maintenance budget. Rebases get an evening a month; features get evenings and weekends. Anything that doesn't fit gets cut, not stretched.

## Phase 0 — The Spike (no fork, no build)

Goal: prove zero-chrome + modal keyboard interception on **stock Firefox** using the autoconfig/userChromeJS pattern (fx-autoconfig). No build infrastructure — the "overlay" starts life as a dotfiles-style directory symlinked into a dedicated Firefox profile. This is the cheapest possible test of the engine decision: if privileged autoconfig JS can own the keyboard and the chrome, the thin-fork thesis holds before I own a single patch.

Tasks, in order:

1. **Scaffold** `overlay/` in this repo: `chrome/` (userChrome.css, userContent.css), autoconfig loader (`config.js` + `defaults/pref/config-prefs.js`), `user.js` prefs, and an install script that provisions a separate `aether` Firefox profile. My daily browser stays untouched until Phase 1.
2. **Zero-chrome**: hide tab strip, nav-bar, urlbar (summonable on demand); full-viewport content; minimal statusbar (mode indicator, URL, clock — the ambient time anchor from day one).
3. **Modal input**: capture-phase keydown listener on the browser window in privileged JS. Prove the load-bearing claims: override Ctrl+W/T/N/Tab, and normal-mode keys never reach page content (site key-stealing prevention — the thing extensions structurally can't do).
4. **Minimum navigable set**: `j/k` scroll, `d/u` half-page, `gg/G`, `H/L` history, `o` open (urlbar summon), `t`/`x` tab open/close, `J/K` tab cycle, `f` hint mode (MVP link enumeration is fine).
5. **Config as data**: keymap and options in TOML under `~/.config/aether/`, parsed at startup. Hot-reload is a nice-to-have, not spike scope.
6. **Prefs baseline**: telemetry off, arkenfox-lite hardening in `user.js`.

Exit criteria:
- Chrome fully hidden; all reserved shortcuts overridden; modal browsing works on real sites I use (GitHub, Gmail, YouTube, docs sites).
- Survives a Firefox point-release update with zero changes (autoconfig = no rebase cost — measure this, don't assume it).
- I can browse a full evening without the mouse except by choice.

Estimate: 1–2 weeks of evenings. If autoconfig turns out insufficient for some interception, that finding is the first legitimate source patch — it moves me to Phase 2 early, with data instead of speculation.

## Phase 1 — The Daily-Drive Gate

Switch my default browser to the aether profile for 30 days. Extensions: uBlock Origin + Bitwarden, nothing keyboard-related — the chrome layer owns keys now.

- Keep a friction log: one line per annoyance, no fixing mid-flow unless it blocks work.
- Gate: after 30 days, am I opening another browser out of *need*? Each instance is either a fix or a scope cut. If the profile doesn't survive the month, the project thesis needs rework before any more building.

Note on honesty: the research called native blocking a Must — that was market framing (MV3 insurance for Chrome refugees). On Firefox, uBO works. Native blocking waits until uBO personally fails me.

## Phase 2 — Own the Build (LibreWolf pattern) — only when forced

Trigger: the first requirement autoconfig cannot express (compile-time telemetry/Pocket removal, true pre-parse interception, branding). Not before.

- Layout: `patches/*.patch` + `mozconfig` + prefs + branding + a build script; track the Firefox **release** channel.
- Monthly rebase drill from day one: pull the new tag, reapply, build, log wall-clock time. Budget: one evening. Two consecutive over-budget months ⇒ cut features or evaluate ESR.

## Phase 3+ — The Feature Ladder

Order from CLAUDE.md, each gated by daily use and the budget:

1. **Keybindings** — done in the spike; deepen (hint-mode quality, per-site modes) only as friction demands.
2. **Blocking** — uBO until it fails me; native only then.
3. **Workspaces** — contextualIdentities + session groups; full state isolation is the long-term shape, cookie isolation is the first rung.
4. **Local-AI bridge** — sidebar → OpenAI-compatible gateway (`OLLAMA_ORIGINS=moz-extension://*`), hard kill switch from the first commit.
5. **Agent runtime** — the decision #2 control plane (MCP → validated WebExt messaging → Xray bridge), per-tool consent, everything logged. Last, because it depends on everything above and on nothing being rushed.

Per feature: a one-page mini-spec (what I do today / what the browser should do instead / thinnest implementation), build it, then a 2-week personal-use verdict — keep, fix, or kill. Kill without ceremony; the research corpus is full of features that would have been fun to build.

## Standing Drills

- **Monthly**: Firefox update + rebase (or autoconfig no-op check), cost logged in this file's changelog.
- **Per feature**: friction-log review before starting the next rung.
- **Never**: adoption metrics, roadmaps for other people, or resurrecting the council.
