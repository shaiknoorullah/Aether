# Researcher Brief T4: Workflows, Switch Triggers & Tooling Overlap

**Task:** Document the real daily workflows of vim/keyboard-driven, tiling-WM, and suckless browser power users. Find concrete evidence of what would make them switch browsers. Identify tooling overlap — what non-browser tools they rely on because browsers fail them.

**Output file:** `outputs/.drafts/power-user-T4.md`

## What to find

### Real workflows
Look for documented workflows in:
- Personal blogs / til.simonwillison.net style writeups
- Dotfile repositories (GitHub) with browser config comments
- "My browser workflow" posts on HN, Reddit, personal blogs
- YouTube/screencasts of tiling-WM setups featuring browser use (titles/descriptions only — no video parsing)
- Wiki pages for qutebrowser, tridactyl, Nyxt describing intended workflows

Specific workflow patterns to document:
1. Research / reading workflows (how they manage reading queues, annotations, bookmarks)
2. Developer workflows (localhost dev, DevTools use, multiple environments)
3. Password / credential workflows (pass + browser integration, bitwarden CLI)
4. Note-taking integration (org-mode, Obsidian, Markdown notes from browser)
5. Tab management at scale (session save/restore, tab groups, tree tabs)
6. Search and navigation patterns (custom search engines, bang commands, URL patterns)
7. Multi-monitor / tiling integration (browser as just another tiling tile)

### Switch triggers
What concrete features would cause someone to switch? Search for:
- "I would switch to X browser if it had..."
- "The only thing keeping me on Firefox/qutebrowser is..."
- "I tried X but went back to Y because..."
- Feature request threads that have high engagement ("if this existed I'd switch")

### Tooling overlap — tools power users reach for because browsers fail
Examples to verify and expand:
- **rofi / dmenu** as bookmark/tab launcher (browser doesn't have fuzzy tab search)
- **fzf** for history/bookmark search via custom scripts
- **pass / gopass** as password manager (browser password managers rejected)
- **newsboat / newsraft** for RSS (browser reader mode rejected as insufficient)
- **zathura** for PDFs (browser PDF viewer rejected as inadequate)
- **mpv** for video (browser video player rejected)
- **wget / curl** for downloads (browser download manager rejected)
- **clipboard managers** (xclip, wl-clipboard) because browser clipboard handling is poor
- **xdotool / ydotool** for browser automation when extensions fail
- Custom scripts / userscripts for missing browser features

### Feature taboo — what this segment actively rejects
- Telemetry / "phone home" behavior
- Auto-updates that break configs
- Mouse-dependent UI elements that can't be keyboard-driven
- Electron-based browsers
- Cloud sync of browsing data
- Forced UI changes (Firefox Proton backlash, Chrome manifest V3 backlash)

## Search strategy

Use web_search with queries like:
- "tiling window manager browser workflow i3 sway"
- "qutebrowser workflow developer dotfiles"
- "pass password manager browser integration"
- "rofi browser bookmark launcher"
- "fzf browser history search"
- "vim user browser workflow 2024 2025"
- "switch to qutebrowser from firefox why"
- "why I use qutebrowser blog"
- "manifest v3 impact keyboard extension users"
- "browser telemetry opt out power user linux"
- "zathura mpv browser replacement workflow"
- "browser workflow dotfiles github"
- site:news.ycombinator.com "qutebrowser" OR "tridactyl" OR "keyboard browser"

Fetch dotfile repos or blog posts that document actual workflows. Look for GitHub repos with browser configs.

## Output format

Write `outputs/.drafts/power-user-T4.md` with:
- 5-7 documented real workflow patterns with sources
- Top 10 switch triggers (ranked by frequency/urgency of mention), each with source
- Tooling overlap table: tool | job it does | source
- Feature taboo list with evidence
- Any quantitative evidence (e.g., "X% of Linux users use pass")
- Source URLs for every finding

Do NOT invent workflows or switch triggers. Only report what you actually found in sources.
