# Researcher Brief T2: Pain Points & JTBD (Reddit / HN / Forums)

**Task:** Extract the most-cited, concrete pain points and jobs-to-be-done for browser power users from community discussions. Focus on vim/keyboard-driven, tiling-WM, suckless, and developer users.

**Output file:** `outputs/.drafts/power-user-T2.md`

## What to find

### Jobs-to-be-done (JTBD)
The real underlying goals — not feature requests but outcomes:
- What are they trying to accomplish when they open a browser?
- What workflows does the browser sit inside? (coding, research, note-taking, tab management)
- When do they feel the browser "gets out of the way"? When does it "fight back"?

### Pain points — specific, concrete, cited
Search Reddit/HN/lobste.rs/forums for threads about:
1. Mouse requirement frustration (forms, modals, UI elements that block keyboard navigation)
2. Tab management at scale (hundreds of tabs, no tree view, no keyboard tab search)
3. Focus mode / distraction: ads, pop-ups, cookie banners breaking keyboard flow
4. URL bar / address bar limitations (no fuzzy search across history+bookmarks+tabs, no custom commands)
5. Integration with terminal tools (fzf, rofi, dmenu, pass, clipboard managers)
6. Privacy / telemetry (Firefox data collection, Chrome surveillance)
7. Extension conflicts / breakage after browser updates
8. Multi-profile / container isolation pain
9. PDF handling in-browser
10. Keybinding customization limits (can't remap everything, site-level JS blocking vi keys)
11. Startup/memory performance
12. "Electron syndrome" — not wanting another Electron app

## Search strategy

Use web_search with queries like:
- "qutebrowser pain points complaints reddit"
- "vimium limitations frustrations site:reddit.com"
- "tridactyl broken firefox update site:reddit.com OR site:github.com"
- "power user browser frustrations tiling window manager"
- "keyboard only browser workflow developer"
- "browser power user switch qutebrowser nyxt 2024 2025"
- site:news.ycombinator.com "browser" "keyboard" "vim" "pain"
- "unixporn browser recommendation thread"
- "lobste.rs browser keyboard driven"
- "browser mouse trap frustration developer workflow"

Fetch actual Reddit/HN threads that have substantial user comments. Look for threads with 50+ comments.

Also search:
- qutebrowser issue tracker for most-upvoted issues: https://github.com/qutebrowser/qutebrowser/issues
- Tridactyl issue tracker
- Recent HN "Ask HN: What browser do you use and why?" threads

## Output format

Write `outputs/.drafts/power-user-T2.md` with:
- Top 10 JTBD statements (verb + outcome format, e.g., "Navigate between 200+ research tabs without lifting hands from home row")
- Top 15 pain points, each with: description, quote or paraphrase from source, source URL
- Any patterns/themes across sources
- Community sub-segments if different groups have different pain points
- Source URLs for every finding

Do NOT invent quotes or paraphrase without noting the source URL.
