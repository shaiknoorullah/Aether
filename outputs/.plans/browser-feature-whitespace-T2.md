# T2: Power-User Browser Features + Whitespace (2026)

## Objective
Map power-user features across browsers and identify workflow primitives NO browser provides.

## Scope
Research: Vivaldi, Arc, Zen, Firefox (with userChrome), Brave, Orion, Floorp, qutebrowser, nyxt, Luakit, surf. Also cover key extensions: Vimium, Tridactyl, Surfingkeys, Tree Style Tab, Sidebery, userChrome.js.

## Key Questions
1. What power-user features does each browser ship natively?
2. What can only be achieved via extensions/hacks, and what are the limits?
3. What power-user patterns does NO browser or extension offer? Look for:
   - True vim-mode with modal editing in all browser chrome (not just page content)
   - Scriptable browser pipelines (chain actions: open URL → extract → transform → save)
   - Session architecture (named sessions, session branching/merging, session templates)
   - Composable/detachable UI panels (move any panel anywhere, float, tile)
   - Terminal-grade keybinding system (arbitrary key sequences, leader keys, modes)
   - Built-in macro recorder with conditional logic
   - Tab groups as first-class programmable objects
   - CLI for browser control (beyond DevTools protocol)
   - Git-like history (branch, diff, merge browsing sessions)
   - Native split-view with independent scroll/zoom per pane
   - Workspace-aware bookmarks (bookmarks scoped to workspace context)
   - Browser-native UNIX pipe integration
4. Note which gaps are addressed by extensions partially vs. not at all.

## Output
Write to `outputs/.drafts/browser-feature-whitespace-research-t2.md` with:
- Feature matrix: browser × power-user feature
- Whitespace features with evidence of absence
- Source URLs for every claim
- Notes on why each gap might exist (engine limitations, niche audience, maintenance cost)

## Rules
- Use web search for current docs, forums, GitHub repos
- Do NOT fetch PDF files
- Every claim needs a source URL
- Mark uncertain items as "unverified"
