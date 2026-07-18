# OpenUI + AI → A Personalized Internet (research brief, 2026-07-18)

Question: what is "OpenUI," and how can Aether use it alongside local AI to personalize the web I actually browse?

"OpenUI" is two unrelated things. Both matter here, differently.

## A. wandb/OpenUI — the generative-UI app

What it is: open-source "describe UI, see it rendered live" tool by Weights & Biases; primary output is HTML+Tailwind, converted to React/Svelte/Web Components via a second LLM call. Self-described "like v0 but open source." (https://github.com/wandb/openui)

Facts that matter for us:
- **Apache-2.0**, 22.5k stars — but **near-dormant**: no releases ever, last substantive commits Sept 2025, 2026 activity is dependency bots. Treat as reference code, not a dependency.
- **Monolithic demo app, not a library**: FastAPI backend (owns auth/storage/telemetry — note: `weave` telemetry is a core dep, conflicts with our zero-telemetry floor) + React SPA. No npm/PyPI component API.
- **Local models are first-class**: `OLLAMA_HOST` and `OPENAI_COMPATIBLE_ENDPOINT` env vars, LiteLLM for everything else — exactly matches our local-AI gateway decision (`/v1` convergence).
- **The reusable IP is three patterns, each <500 lines**, worth extracting rather than embedding:
  1. The system prompt ("TailwindCSS Virtuoso", body-only output, shadcn CSS variables — i.e. themeable by design) and the framework-conversion prompt (`frontend/src/api/openai.ts`).
  2. The SSE streaming proxy with model-prefix routing (`backend/openui/server.py`).
  3. The **sandboxed-iframe renderer**: generated HTML hydrated via `postMessage` into an iframe with a restrictive `sandbox` attribute, theme vars injected, annotations flowing back as messages (`frontend/src/components/HtmlAnnotator.tsx`). This is the right containment shape for rendering LLM-generated UI inside a browser we control.

Comparables: Vercel AI SDK generative UI and CopilotKit (~30k stars, MIT) are the *library*-shaped versions; Thesys C1 is the commercial API; Google's A2UI is a protocol spec; Dyad is the local-first app-builder cousin. (URLs in agent provenance below.)

## B. W3C Open UI — the standards group

What it is: W3C Community Group standardizing the primitives behind common UI controls (author-facing; upstreams to WHATWG/CSSWG). Outputs and **Gecko status** (July 2026):

| Primitive | Status in Firefox |
|---|---|
| Popover API | ✅ 125 (2024); `popover=hint` ✅ 149 |
| CSS Anchor Positioning | ✅ 147 (Jan 2026) |
| Invoker Commands (`command`/`commandfor`) | ✅ 144 |
| `<details name>` exclusive accordion | ✅ 130 |
| Customizable `<select>` (`appearance: base-select`, `::picker`) | ⏳ parser lands in 153 (days away); styling Nightly-pref'd; Mozilla position: positive |
| Interest Invokers (`interestfor`) | ❌ position under review |

Why it matters to Aether:
- **`base-select` makes previously untouchable UI restylable from user-origin CSS.** The OS-native `<select>` picker was unreachable by any stylesheet; once base appearance ships in Gecko, an extension/userContent-origin rule can flip any site's selects into in-page, fully styleable DOM with a *standardized* selector vocabulary (`::picker(select)`, `::checkmark`, `<selectedcontent>`). Same selectors on every site — a cross-site theming contract.
- A thin Gecko fork could go further: restyle base-appearance controls **browser-wide at the UA-stylesheet level** — a tiny diff that themes native controls on every site at once. This is the cheapest "personalize the whole internet" lever that exists.
- The same primitives (popover, anchor positioning, invokers) are available to privileged chrome — our overlay's own UI (palette, hints, statusbar flyouts) can be declarative instead of JS positioning code.
- Caveat: Open UI is author-facing; nothing in it targets user-side reskinning. The wins above are consequences, not goals.

## C. The landscape: who has done AI-personalized web, and what happened

- **Mature and non-AI**: Stylus/UserCSS, Tampermonkey, uBO's procedural cosmetic filters (the most battle-tested per-site DOM-rewrite corpus in existence), Dark Reader (algorithmic re-theming — proof automatic re-theming works without AI). **Zen shipped native Boosts in v1.20b (May 2026)** — per-domain colors/fonts/zap, in a Gecko fork, no AI. Arc's Boosts died with Arc; Dia has no equivalent.
- **AI restyling of arbitrary sites has essentially never shipped**: only academic prototypes (Stylette, CHI 2022 — 80% vs 35% task success over DevTools; CMU UIST '23; arXiv:2502.18701's screen-reader-oriented in-place semantic rewrite) and toy repos (ReSkin-AI, 13 stars). Every major AI browser chose agents-acting-on-pages or full generative replacement (Google Generative UI, Opera Neon "Make") over restyling existing pages. The gap Aether cares about is genuinely open.
- **The cautionary tale**: commercial accessibility overlays (accessiBe et al.) promised automated runtime re-rendering, delivered breakage, and drew an FTC action. Automated whole-page rewriting over-promised is a documented failure category.
- **Arc's trust rule is the precedent that matters**: CSS Boosts were shareable, JS Boosts were not. Generated CSS and generated JS are different trust classes.
- **Safety facts**: content scripts and inserted CSS bypass page CSP, but DOM-injected `<script>` is CSP-subject; Shadow DOM needs per-root `adoptedStyleSheets` walking; anti-tamper MutationObserver arms races apply. Prompt injection reaches any model that reads page DOM — Brave demonstrated instruction-following from page text and even screenshots; Anthropic measured 23.6% attack success unmitigated (11.2% mitigated); OpenAI says on record it's "unlikely to ever be fully solved." A CSS-only output tier sharply limits blast radius (residual risk: attacker-influenced CSS hiding security indicators); LLM-generated JS is a direct injection→execution path.

## D. Synthesis — the Aether personalization ladder

Four tiers, ordered by trust class and by when they enter the plan. The design rule throughout: **the model proposes, deterministic code disposes** — generation happens once, output is inspectable dotfiles, application is dumb and cached.

**Tier 0 — deterministic theming (floor item 3, no AI).** pywal/base16 ingestion into chrome CSS vars *and* a user-origin content stylesheet: shadcn-style variable mapping (borrowed from OpenUI's prompt design) + Dark-Reader-class algorithmic adjustment + `base-select`/`::picker` rules the moment Gecko ships them (UA-wide native-control theming). Zen Boosts–style zap/color/font per domain, stored as dotfiles. This alone makes "the internet matches my rice" real, with zero model calls.

**Tier 1 — AI-generated site boosts (CSS-only trust class; after floor item 7, local-AI sidebar).** Palette command: `:boost` → local model receives the page's *style skeleton* (selectors, computed palette, layout landmarks — not full content, shrinking both tokens and injection surface) plus my base16 palette → emits UserCSS → written to `~/.config/aether/boosts/<domain>.css`, git-committable, reviewed in a diff view, applied deterministically on every future visit. Generation is one-shot per site, not per-pageload — no latency tax, no drift. Regeneration is a manual command when a site breaks (Healenium-style selector self-healing is a later experiment, not a promise). Arc rule enforced: this tier never emits JS.

**Tier 2 — semantic re-render views (post-gate, EF-motivated).** Reader-mode generalized: readability/a11y-tree extraction → browser-owned calm view for reading-heavy or overstimulating pages ("calm view" as a task-conditioned focus tool — the EF floor item grown up). If an LLM restructures (heading hierarchy, labels), apply arXiv:2502.18701's lesson: diff-and-reinsert integrity checking, because models silently drop content. Never on transactional flows.

**Tier 3 — generative replacement, own surfaces only (post-gate).** The wandb OpenUI patterns (sandboxed-iframe + postMessage hydration, streaming proxy, themeable prompt) reused for surfaces *I own*: new-tab dashboard, statusbar widget bodies, sidebar panels — local model generates bespoke mini-UIs bound to my data (feeds, APIs, notes). Never a replacement for third-party transactional pages; that's where the accessibility-overlay graveyard and the injection demos live.

**Standing safety rules** (consistent with decision #2): generated JS anywhere near page context requires explicit per-case consent and review — different trust class, always; the boost generator uses the local gateway by default (kills the exfiltration leg of Willison's lethal trifecta); everything generated lands in dotfiles, nothing is applied invisibly.

## Provenance

Compiled from three research passes (wandb/OpenUI repo + files; Open UI/W3C + Mozilla positions/Bugzilla/release notes; landscape + safety). Key sources: github.com/wandb/openui (README, server.py, openai.ts, HtmlAnnotator.tsx, pyproject), open-ui repo README, MDN Firefox release notes (125/144/147/149/153), mozilla/standards-positions #902 #965 #1060 #1142 #1181, bugzilla #1944403 #1974787, developer.chrome.com/blog/a-customizable-select, webkit.org/blog/17967, resources.arc.net Boosts docs, zen-browser.app/release-notes + linuxiac.com (Zen 1.20 Boosts), github.com/openstyles/stylus, github.com/gorhill/ublock (procedural filters), github.com/mozilla/readability, stylette.kixlab.org (CHI 2022), arxiv.org/abs/2502.18701, research.google/blog/generative-ui, overlayfactsheet.com, brave.com/blog/comet-prompt-injection + unseeable-prompt-injections, claude.com/blog/claude-for-chrome, openai.com/index/hardening-atlas-against-prompt-injection, simonw.substack.com (lethal trifecta), github.com/tekaratzas/ReSkin-AI, geoffreylitt.com (malleable software, Wildcard), healenium.io.

Caveats: open-ui.org, MDN, Bugzilla, caniuse and Google Groups were partially 403-blocked by the research environment's egress proxy — several browser-version claims rest on search snippets of those pages (weakest: Safari's anchor-positioning version; Firefox 149 for `popover=hint`). wandb/OpenUI's LiteLLM routing for non-OpenAI providers is inferred from structure, not read line-by-line. "No AI Boost generation ever shipped in Arc" and "no major browser ships LLM re-theming" are absence-of-evidence claims.
