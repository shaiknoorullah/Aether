# Researcher Brief T1: Community Size & Install-Count Evidence

**Task:** Gather quantitative evidence of community sizes and install counts for the browser power-user segment (vim/keyboard-driven, tiling-WM, suckless, developers).

**Output file:** `outputs/.drafts/power-user-T1.md`

## What to find

1. **Reddit community sizes** (subscriber counts, activity): r/unixporn, r/vim, r/neovim, r/qutebrowser, r/i3wm, r/swaywm, r/hyprland, r/awesomewm, r/bspwm, r/xmonad, r/DWM
2. **Browser extension install counts**:
   - Vimium (Chrome Web Store) — find install count
   - Vimium-C — find install count
   - Tridactyl (Firefox AMO) — find install count / user count
   - Vimium FF (AMO) — find install count
   - qutebrowser GitHub stars and AUR install stats
   - Nyxt browser GitHub stars
   - Vimb GitHub stars
   - Luakit GitHub stars
3. **ArchLinux AUR package stats**: qutebrowser, surf, luakit, nyxt — votes / installs if available
4. **GitHub repository stats**: stars, forks, open issues, contributor count for qutebrowser, nyxt, tridactyl, vimium, vimium-C
5. **StackOverflow Developer Survey 2024/2025**: % of developers on Linux, % using tiling WMs, any browser preference data
6. **Other proxy metrics**: Arch Linux install base estimates, NixOS user counts, any published Linux desktop surveys

## Search strategy

Use web_search with queries like:
- "Vimium chrome extension install count 2024 2025"
- "qutebrowser github stars users"
- "tridactyl firefox extension users"
- "r/unixporn subscribers 2025"
- "r/vim r/neovim community size"
- "arch linux user base size estimate"
- "Linux desktop market share tiling window manager"
- site:aur.archlinux.org qutebrowser votes

Also fetch:
- https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb (or search for it)
- https://addons.mozilla.org/en-US/firefox/addon/tridactyl-vim/ (AMO page)
- https://github.com/qutebrowser/qutebrowser
- https://github.com/nicowillis/nyxt (or correct repo)
- Reddit stats pages for the relevant subreddits

## Output format

Write `outputs/.drafts/power-user-T1.md` with:
- A structured table of all communities/projects with size metric, date observed, and source URL
- Raw numbers — do not round or estimate without flagging
- Mark any number that could not be verified as UNVERIFIED
- Include all source URLs you actually fetched

Do NOT invent numbers. If a stat is unavailable, write "not found" and note what you searched.
