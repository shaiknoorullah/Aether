# x4 — The GitHub Mod (the reference mod, and the API's first real consumer)

## 1. Today → Instead → Thinnest

**Today**: GitHub is where a large share of my day happens and its UI is built for discovery by mouse — a repo is four clicks and a search box away, a PR review means scrolling past a promo banner, a sticky sub-header, and a Copilot pitch to reach the diff. Meanwhile x1 and x2 would ship as an API designed against imagined consumers, which is how extension APIs end up wrong in ways you only discover a year later.

**Instead**: build the GitHub mod **while** designing the facade, in-repo, as the reference implementation. It is simultaneously the thing I want daily and the forcing function that proves the API. If `git:open` is awkward to write, the facade is wrong and gets fixed before it is frozen.

**Thinnest**: it is a mod — no overlay changes are permitted by this spec. Style through b1's pipeline, commands through x1's facade, candidates through x3's ranker, panels through r4's primitive. If the GitHub mod needs something the facade can't express, that is a finding, and the finding goes to x1 rather than into a special case here.

**And it found three immediately, which is the point of building it alongside the facade rather than after.** x1 grants no DOM access, no network, and no arbitrary file read — so the parts of this mod that need page interaction, the GitHub API, or a cache file outside `aether.storage` are **not buildable in v1.3**. Rather than pretend otherwise, the mod ships in two stages:

| v1.3 — buildable on x1 today | Deferred to v2.1 (needs a2's page action) |
|---|---|
| `style.css` | `git:review` — the whole workflow |
| `git:open`, `git:pr`, `git:prs` | `git:new_pr`, `git:new_repo` (need the API) |
| `git:checks`, `git:files` | comment / label / approve / request-changes |

The v1.3 half is real and useful — URL parsing plus a repo list is most of the daily value — and it exercises `defineCommand`, namespacing, `site()`, candidate providers and x3 ranking, which is the API surface most likely to be wrong. The deferred half is what the facade genuinely cannot express, and naming it here is the finding: **the facade should not be declared frozen until a2 has shown what a page-acting consumer needs**. `aether.version` therefore starts at `0.x` in v1.3 and reaches `1.0` after a2, not before.

The repo cache also has to live where x1 can read it: `aether.storage` is one JSON file per script, so the `gh` output is written **into that file** by a timer I own, not read from an arbitrary path the facade cannot open.

## 2. Exact behavior

Ships in-repo at `overlay/mods/github/`, symlinked or copied into `~/.config/aether/mods/`, `tier = "code"`, `namespace = "git"`.

### Style (`style.css`)

Hides the promo furniture and reclaims vertical space on the surfaces I actually use: the Copilot banners, the "Explore repositories" dashboard panel, the sticky sub-header on file views (which covers the first lines of code when you deep-link to a line number), the newsletter/marketing blocks, and the footer. Widens the diff column. Nothing hidden is a control I use — a mod that hides functionality is a mod I fight.

### Commands

| Command | Behavior |
|---|---|
| `git:open <repo>` | open a repo — candidates from my repo list, x3-ranked |
| `git:pr <repo>` | open a repo's PR list |
| `git:prs` | my open PRs across repos |
| `git:new_repo <name>` | create, then open it |
| `git:new_pr` | open a PR from the current branch context of the repo in this tab |
| `git:checks` | this PR's checks tab |
| `git:files` | this PR's changed-files view |
| `git:review` | start the review workflow (below) |

Candidates come from a **daemon-free source in v1.3**. x1 grants neither network nor process access, so a timer I own runs `gh repo list --json` and writes the result into this mod's `aether.storage` file; the mod reads it through one accessor. When `aetherd` lands (v2.0), a daemon adapter replaces that source and the commands do not change — the substitution is a test of the architecture.

**No token, ever.** `gh` holds the auth; the browser holds none. This is the concrete version of the rule that credentials never live in chrome.

### The review workflow

`git:review` on a PR page runs a stateful, keyboard-driven pass:

1. hides everything but the diff (style state toggled, not a new surface)
2. `]` / `[` move between changed files, using the mod's own file list rather than GitHub's scroll behavior
3. `c` opens a comment on the focused hunk, `Enter` submits, `Esc` discards
4. `l` opens a label picker on r4's panel primitive with x3 ranking
5. `A` approves, `R` requests changes — both behind an explicit confirm, because they are the two irreversible acts in a review
6. `q` exits and restores the page

All of it is x1 commands plus r4 panels; the only mod-specific logic is the file list and the hunk targeting, which use the same content-actor descriptor pipeline b1's `:zap` proved.

### Settings (`settings.toml`)

Surfaces three rows in r5: which style groups are hidden (banners / sticky header / footer), the repo cache path, and the default review scope. Proves that a mod's settings appear in the panel with no panel changes.

## 3. Pure vs glue

This mod has no overlay-side code at all, which is the point. Within the mod:

- **`lib/repos.js`** (pure, Node-testable): `parseRepoCache(text)` → `[{owner, name, updated}]` with hostile-input guards; `repoCandidates(repos)` → x3-shaped candidate rows; `repoUrl(entry, section)`.
- **`lib/pr.js`** (pure): `parsePrUrl(url)` → `{owner, repo, number} | null` for every GitHub PR URL shape (files, checks, commits, a comment anchor, an enterprise host); `prSubUrl(parsed, section)`.
- **`commands.js`**: registration only — thin, so the logic stays testable.
- **`style.css`**: selectors, grouped and commented by what they hide, because in six months I will need to know why a rule exists.

## 4. Unit tests (behavioral) — `overlay/test/unit/x4-github-mod.test.mjs`

1. `parsePrUrl` handles `/owner/repo/pull/12`, `/files`, `/checks`, `/commits/<sha>`, `#discussion_r…` anchors, query strings, and a trailing slash — all yielding the same `{owner, repo, number}`
2. non-PR GitHub URLs and non-GitHub URLs → `null`, never a partial parse
3. `prSubUrl` round-trips: parse a files URL, ask for `checks`, get the canonical checks URL
4. `parseRepoCache`: valid `gh repo list --json` output parses; truncated JSON, wrong shape, and prototype-polluting keys are each handled without throwing
5. an empty or missing cache yields zero candidates and a usable (not broken) command — the mod degrades to "no suggestions," never to an error
6. `repoCandidates` output validates against x3's expected row shape (contract test between mod and matcher)
7. every command name is `git:`-namespaced and passes x1's `validateCommandDef` — the mod is its own conformance test for x2's namespace rule
8. every command carries a description and a `risk` class; `git:new_repo` and the approve/request-changes actions are `mutate-remote` (guard: v2.1's agent policy must not auto-approve PRs)
9. `style.css` passes b1's `sanitizeCss` byte-identically — the shipped mod contains no fetch vectors, asserted rather than reviewed by eye

## 5. Visual states — `overlay/test/visual/scenarios.d/i4-github-mod.sh`

Against a local fixture page reproducing GitHub's structure (no network in the visual harness — the same discipline as the f7 mock gateway):

1. **unstyled fixture** — baseline with banner, sticky header, narrow diff
2. **mod applied** — furniture gone, diff column widened, `:mods` shows `github / code / enabled`
3. **`git:open` candidates** — a seeded repo cache; typing three interior characters shows x3-ranked matches with highlights
4. **review mode** — `git:review` on the fixture PR: diff-only view, file navigation with `]`, shot per state
5. **irreversible acts confirm** — `A` shows a confirm step and does nothing without it
6. **no-cache degradation** — cache file removed: `git:open` opens with zero candidates and a neutral line, browser fully functional

## 6. Non-goals (budget protection)

- **No GitHub API calls from the browser, and no token in chrome.** `gh` owns auth; v2.0's daemon owns it after that.
- **No write operations beyond the four in the review workflow** (comment, label, approve, request changes). No merging, no branch management, no issue triage — the browser is not becoming a git client.
- **No offline/cached rendering of GitHub content** — this styles and navigates the real site.
- **No support for GitHub Enterprise hosts** beyond URL parsing tolerating them; the style selectors target github.com.
- **No auto-refresh of the repo cache from inside the browser** — a timer I own writes it. The mod reads one file.
- **No second reference mod in this pass.** One consumer is enough to find the API's flaws; two is scope.
