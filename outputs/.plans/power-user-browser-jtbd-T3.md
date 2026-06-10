# Researcher Brief T3: Existing Browser Projects & Feature Gaps

**Task:** Document existing browser projects targeting vim/power users, their feature sets, and where they fall short. Find concrete evidence of unmet needs from issue trackers and community discussions.

**Output file:** `outputs/.drafts/power-user-T3.md`

## Projects to cover

### Primary targets (vi-keybinding / keyboard-first browsers)
- **qutebrowser** — Python/Qt, hjkl navigation, command mode
- **Nyxt** (formerly Next) — Lisp-based, fully programmable, Emacs-style
- **Vimb** — C/WebKit, minimal, vi-like
- **Luakit** — Lua-scriptable, WebKit
- **Surf** — suckless, minimal C, no tabs
- **Badwolf** — WebKitGTK, minimal

### Extensions for mainstream browsers
- **Vimium** (Chrome/Chromium)
- **Vimium-C** (Chrome, actively maintained fork)
- **Tridactyl** (Firefox) — closest to real vim integration
- **Vimfx** (Firefox, discontinued — why?)
- **Pentadactyl** (Firefox, discontinued — why?)

### New-wave / AI-augmented
- **Arc Browser** — spaces, command bar; does it serve power users?
- **Zen Browser** (Firefox fork) — keyboard workflow?
- **Floorp** — Firefox fork, power user features
- **Brave** — keyboard shortcuts, privacy

## For each project, find

1. Current maintenance status (active / abandoned / slow)
2. Key differentiating features vs. vanilla browser
3. Most-upvoted unresolved issues / feature requests in their tracker
4. Community complaints about what it still can't do
5. Reasons users cite for abandoning the project or staying despite pain

## Search strategy

Use web_search with queries like:
- "qutebrowser vs tridactyl comparison 2024 2025"
- "nyxt browser review limitations"
- "vimium tridactyl extension vs qutebrowser"
- "why did people stop using pentadactyl vimfx"
- "qutebrowser missing features wishlist"
- "surf browser suckless limitations"
- "tridactyl firefox limitations site keys broken"
- "keyboard browser 2024 developer recommendation"
- "arc browser keyboard shortcuts power user review"
- "zen browser power user 2025"

Fetch:
- https://github.com/qutebrowser/qutebrowser/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
- https://github.com/tridactyl/tridactyl/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
- https://github.com/nicowillis/nyxt or correct nyxt repo issues
- qutebrowser FAQ / docs for known limitations

## Feature gap matrix to produce

For each browser/extension, note support for:
- hjkl navigation everywhere (including inside modals/iframes/PDFs)
- Command-line style URL bar with custom commands
- Tab search with fuzzy match
- Container/profile isolation
- Password manager integration (pass, bitwarden)
- Custom keybinding remapping
- Scriptability / user scripts
- Native messaging / external tool integration
- Low resource usage
- Wayland-native support (2025 relevance)

## Output format

Write `outputs/.drafts/power-user-T3.md` with:
- Per-project summary (status, key features, key gaps, community size)
- Feature gap matrix table
- Top unresolved issues per project (with GitHub links)
- Patterns across projects: what does no one solve well?
- Source URLs for every claim

Do NOT invent GitHub issue numbers or feature claims. Only report what you actually found.
