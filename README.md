<div align="center">

# 🜂 Aether

### A local-first, AI-native, keyboard-driven browser built to protect attention — and to give power back to the people who live inside the browser all day.

*Part executive-function prosthesis, part power-user workshop, part agent-safe AI runtime — for ADHD brains, deep-work builders, developers, and privacy-conscious people abandoned by every browser that chose engagement over intention.*

<br/>

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Status: Research / RFC](https://img.shields.io/badge/status-research%20%2F%20RFC-orange)](#-project-status)
[![Local-First](https://img.shields.io/badge/local--first-100%25-success)](#-the-open-source--local-first-pledge)
[![No Cloud Required](https://img.shields.io/badge/cloud-not%20required-success)](#-the-privacy-pledge)
[![Evidence-Based](https://img.shields.io/badge/features-evidence%20backed-9cf)](#-the-feature-matrix-evidence-backed)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)
[![Made for Neurodivergent & Power Users](https://img.shields.io/badge/made%20for-neurodivergent%20%26%20power%20users-ff69b4)](#the-adhd-problem)

> **`Aether` is a working codename — rename to taste.** `AGPL-3.0` is a deliberate default (see [Why AGPL](#-license)); swap it if your goals differ. The **browser engine is deliberately undecided** — see [Architecture](#architecture).

</div>

---

## Table of Contents

- [What is Aether?](#what-is-aether)
- [The Problem Space](#the-problem-space)
- [The ADHD Problem](#the-adhd-problem)
- [The Numbers](#the-numbers)
- [The Market Opening](#the-market-opening)
- [Why We're Building This](#why-were-building-this)
- [Who It's For](#who-its-for)
- [Impact](#impact)
- [Core Concepts](#core-concepts)
- [Features](#features)
- [The Feature Matrix (Evidence-Backed)](#-the-feature-matrix-evidence-backed)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Self-Hosting the Backend](#self-hosting-the-backend)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [Research Methodology](#research-methodology)
- [The Long-Term Vision](#the-long-term-vision)
- [Mission](#mission)
- [The Open-Source & Local-First Pledge](#-the-open-source--local-first-pledge)
- [The Privacy Pledge](#-the-privacy-pledge)
- [Contributing](#-contributing)
- [Community & Code of Conduct](#community--code-of-conduct)
- [Security](#security)
- [License](#-license)
- [Acknowledgements & Prior Art](#acknowledgements--prior-art)
- [References](#references)

---

## What is Aether?

Aether is a browser, but that's almost incidental. It is an **environment for attention and intention** — a calm, programmable, keyboard-driven home base that treats your focus as the scarcest resource you own and is engineered, end to end, to defend it, while giving power users the depth and the AI agents the safety rails that every mainstream browser refuses to ship.

Mainstream browsers are built to maximize engagement. Aether is built to maximize **intention**. By default, nothing is on screen but the page you chose — no tabs, no URL bar, no chrome, no bait. Everything else is one keystroke away in a beautiful overlay. Underneath that quiet surface lives a deeply customizable system: a fully themeable shell that inherits your desktop's aesthetic, declarative configuration you can put in version control, a local-first AI layer that can teach you, watch your flow, and orchestrate fleets of agents, native first-class integrations with the tools developers and platform engineers actually use all day, and a **trustworthy AI layer** — local-first, observable, sandboxed — for people who want AI assistance but refuse to be surveilled to get it.

It is the browser as a **prosthesis for executive function** and a **workshop for power users** at the same time — designed first for people whose brains don't run on the defaults, and useful for everyone who's tired of their browser working against them.

> **Two truths Aether is built on.** First: the browser is the operating system of modern work, and it is structurally engineered to fragment your attention. Second: users want AI assistance but **don't trust it** — and no browser today combines deep keyboard control, project-based organization, privacy by architecture, and AI that's powerful *and* sovereign. Aether is the resolution of both tensions.

---

## The Problem Space

The browser quietly became the operating system of modern work. We write code in it, review PRs in it, manage infrastructure in it, read, research, plan, communicate, and — when our attention slips — disappear into it. It is simultaneously the most powerful productivity surface ever built and the most sophisticated distraction machine ever built, and it is the *same surface*. The workshop and the casino share a window.

Four structural problems compound inside that window:

1. **Browsers optimize for engagement, not intention.** Tabs, notifications, infinite feeds, and frictionless novelty are features when the goal is time-on-site. They are hazards when the goal is finishing the thing you opened the browser to do.
2. **Tool sprawl turns a workday into a switching tax.** Knowledge work is now spread across dozens of web apps. The average company runs **89 different applications**[⁷], and every jump between them carries a cognitive cost most people never measure.
3. **The interface is hostile to focus by default, and willpower is not a fix.** The modern browsing environment is structurally engineered to fragment attention. The only durable answer is to *redesign the environment* — which is precisely what a browser, the layer everything else renders inside, is uniquely positioned to do.
4. **Users want AI, but don't trust it — and power is fragmented.** Calm UX lives in one browser, hackability in another, privacy in a third, AI in a fourth, and *none* of them are unified, local-first, agent-safe, and trustworthy. People are forced to choose between an AI that helps and an AI that doesn't sell them out. They shouldn't have to.

---

## The ADHD Problem

For the ~**6%** of adults with ADHD[⁸] — and the far larger number who are undiagnosed or otherwise neurodivergent — every one of the problems above is amplified, and several new ones appear. ADHD is, at its core, a disorder of *executive function*: the mental machinery for **task initiation, sustained attention, working memory, time perception, and impulse control**[¹¹]. The browser stresses every single one of those systems at once.

What that looks like in practice:

- **Task initiation is a wall.** Starting is harder than doing. A blank new-tab page is an invitation to wander, not a ramp into work.
- **Working memory leaks.** An interruption doesn't cost a few seconds — it can erase the entire mental context of what you were doing, leaving the "I'm back at my desk and have no idea what I was working on" spiral.
- **The 80-tab problem.** Open tabs become externalized memory and a hedge against the fear of losing things. Closing a tab *feels* like forgetting, so nothing ever closes.
- **Time blindness.** Hours vanish without a felt sense of their passing — both in distraction *and* in hyperfocus, where you surface at 2am having missed dinner, water, and meds.
- **Distraction and dopamine.** The same click that opens documentation opens the feed. Novelty is chemically rewarding, and the browser is an infinite novelty dispenser.
- **Shame loops.** Conventional "productivity" tooling tends to scold. For an ADHD brain, a punitive nudge feeds the shame that drives the next avoidance, and the tool gets disabled within a week.

The reframe Aether is built on: **these are not character flaws, and the answer is not "try harder."** They are predictable behaviors of a particular kind of nervous system interacting with an environment that was designed to exploit it. Change the environment, and you change the outcome. External scaffolding for self-regulation is not a crutch — for ADHD it is a recognized, legitimate accommodation, the same support a coach, a body-double, or a well-designed tool provides.

---

## The Numbers

> **The browser is where most of modern waking life happens — and it is the exact battleground where ADHD struggles play out. Here is the scale of it.**

**How much we live in the browser:**

- The average adult spends roughly **7 hours a day** on screens in the US, and about **6h40m globally — close to 40% of all waking hours**[¹][²]. By some surveys, US adults are **online over 10 hours a day**[³].
- The web browser is the connective tissue of that time: a large majority of internet users spend their sessions on research, communication, work, and content — the four things a browser mediates.

**What fragmentation costs everyone:**

- After a single interruption, a knowledge worker takes an average of **23 minutes and 15 seconds** to fully refocus on the original task — the landmark finding from Gloria Mark's UC Irvine research (*The Cost of Interrupted Work*, CHI 2008)[⁴].
- The average time spent on a single screen before switching has **collapsed from ~2.5 minutes (2004) to ~47 seconds**, and roughly **44% of interruptions are self-generated**[⁵].
- Most knowledge workers get only about **one hour of true focus per day**[⁶], while juggling a toolset that averages **89 applications** per company[⁷].

**What it costs the ADHD population specifically:**

- Adults with ADHD report an average of **21.6 more lost-productivity days per year** ("presenteeism") than their peers, driven directly by inattention, disorganization, and executive dysfunction[⁸].
- The total estimated US societal cost attributed to adult ADHD is roughly **$122.8 billion per year**[⁸].
- Adults with ADHD are **~60% more likely to be fired**, **~300% more likely to quit a job impulsively**[⁹], earn an estimated **17–33% less** than peers[⁹][¹⁰], and have an employment rate of about **67% vs. 87%** for non-ADHD peers with a degree[¹⁰].

**The thesis, in one line:** if ~40% of your waking life happens in the browser, and the browser is the single environment where focus, distraction, research, memory, and every work tool collide — then a browser deliberately designed to protect executive function isn't a nice-to-have. It's the highest-leverage intervention available.

---

## The Market Opening

The case isn't only humane — it's commercial. The browser market is the most consequential piece of unclaimed territory in consumer software, and the incumbents have left the door open.

- **Chrome holds 65–71% of the market — but ~81% of consumers say they'd switch** to a browser that fit them better (Shift 2026 sentiment data). That is the largest pool of dissatisfied, switchable users in software.
- **Brave proves privacy-first scales:** ~**100M monthly active users**, growing ~**34% YoY** — a refutation of the claim that privacy is a niche.
- **Arc's collapse stranded a market.** The Browser Company's ~$610M-valued Arc was effectively abandoned, leaving **500K+ workspace-oriented power users** with no home — exactly the people most willing to adopt something new.
- **AI-native browsers are arriving but compromised.** Dia, Perplexity Comet, Brave Leo, Opera Aria/Neon, and SigmaOS Airis are racing in, but they trade privacy for intelligence, or bolt AI onto an engagement-first shell. The "AI you can trust" lane is open.
- **~92% of users want personalization/customization** they can't get from Chrome — the depth that power-user browsers (Vivaldi, qutebrowser, Nyxt) serve for a fraction of the market.

No browser today combines **deep keyboard control + project-based organization + privacy by architecture + trustworthy local-first AI**. That intersection is Aether.

---

## Why We're Building This

Because the most powerful tool we have for fixing the problem *is the layer everything else renders inside*. You can't fix the browser with a browser extension bolted to the side — the host environment sets the rules. Owning the shell means owning the defaults: what's visible, what interrupts you, what gets captured, what gets blocked, and what an AI is allowed to see and do on your behalf.

Because the tools that come closest already exist but are **scattered** — calm UX in one browser, hackability in another, knowledge graphs in a third, durable workflows in a fourth, focus tracking in a fifth, privacy in a sixth — and none of them are unified, local-first, AI-native, agent-safe, and built from the ground up around both neurodivergent executive function *and* power-user depth.

And because the people who most need this are often the ones most able to build it: **technical, neurodivergent power users who spend their entire working lives in the browser** and have the skills to reshape it. Aether is being built in the open so that this community can shape it together.

---

## Who It's For

Aether is researched against five concrete user segments, in priority order:

| Segment | Core need | What Aether gives them |
|---|---|---|
| **Power users** (vim/keyboard, tiling-WM, suckless, devs) | Deep keyboard control + customization with zero alternatives | Native modal keybindings, command palette, config-as-data, scripting hooks |
| **Knowledge workers & researchers** | Escape tab overload and the context-switching tax | Workspaces, context resurrection, frictionless capture → graph |
| **Neurodivergent / ADHD builders** | External scaffolding for executive function, without shame | The Spectator, task-initiation ramps, ambient time, commitment locks |
| **Privacy advocates** | AI assistance without surveillance | Zero-telemetry by architecture, local-first AI, no-cloud E2E sync |
| **AI agent builders / developers** | Agent-safe, observable, sandboxed web automation | Control plane (IPC/CDP), sandboxed agent web access, full observability |

---

## Impact

**For the individual:**
- A measurable reduction in context-switching tax and the daily "refocus debt" it creates.
- Reclaimed working memory: your context is captured and resurrected for you, not held fragile in your head.
- A relationship with your tools that supports rather than shames — the difference between a tool you abandon and a tool that becomes a lifeline.
- Learning that finally fits a non-linear, spatial, visual brain instead of fighting it.
- AI you can actually trust, because it runs on your machine and you can read every line that watches you.

**For teams:**
- Shared, real-time collaboration and task surfaces that live where the work already happens.
- Self-hostable, auditable infrastructure that organizations can trust with sensitive work.
- Agent workflows that are sandboxed and observable instead of opaque and risky.

**For the ecosystem:**
- A reference design for what an *attention-respecting, trustworthy-AI* browser looks like — and proof that local-first, privacy-preserving, neurodivergent-first, power-user software can be world-class.

---

## Core Concepts

| Concept | What it means |
|---|---|
| **The Canvas** | By default the screen shows *only the page*. No tabs, no URL bar, no chrome. Every control is a keystroke-summoned overlay. |
| **Everything is a keybind** | Navigation, search, tabs, settings, AI, capture — all invoked by the keyboard, surfaced in fast, beautiful overlays, and dismissed instantly. Native modal (vim-like) editing, *without the ugliness*. |
| **Configuration is data** | Your entire browser is described in declarative `YAML` / `TOML` / `JSON` you can version-control and share — "ricing for browsers." Code is an escape hatch, not a requirement. |
| **Local-first by default** | Your data, your models, your sync — on your machines. The cloud is optional and never assumed. |
| **Privacy is architectural, not promised** | "We can't see your data" beats "we promise not to look." Zero telemetry by design; the AI that watches you runs locally and is open to audit. |
| **AI as a resident, not a feature** | Long-running agents live inside Aether as roles on a shared perception layer: a tutor, a researcher, a spectator. They are built around an **interruption budget** — they protect your attention rather than competing for it. |
| **Agent-safe by construction** | Agents that drive the web do so through a sandboxed, verified, observable control plane — never with your daily-driver identity, never invisibly. |
| **The environment is the intervention** | Focus, habits, and learning aren't add-ons. They're consequences of how the whole system is designed. |
| **Capture now, sort later** | Capture is zero-friction and zero-decision. Organizing is deferred and automated. |

---

## Features

> Grouped by intent. Everything here is part of the vision; see the [Roadmap](#roadmap) for sequencing and the [Feature Matrix](#-the-feature-matrix-evidence-backed) for evidence-backed prioritization.

### 🧘 The Canvas — Distraction-Free Shell
- **Zero-chrome default**: nothing visible but the webpage — no tabs, no address bar, no buttons.
- **Keyboard-first everything**: command palette, omni/URL entry, tab switcher, settings, and actions all summoned by keybind in elegant overlays, popups, and context menus.
- **Native vim/modal keybindings** (Normal / Insert / Command modes) — *impossible to do well via an extension*, and a beachhead for 660K+ keyboard-first users with zero good alternatives.
- **Focus & compact modes** with progressive disclosure — show exactly as much as you ask for, nothing more.
- **Full keyboard shortcut customization** with conflict detection across modes; **keyboard-only navigation** of every chrome surface (WCAG-aligned).

### 🗂️ Tabs & Spatial Organization
- **Vertical tab sidebar** as the post-2025 table-stakes scaffold for workspaces.
- **Rich tabs**: live previews, fuzzy search, grouping, transfer between windows/workspaces, archive, rename.
- **Doom-tab amnesty / tab graveyard**: stale tabs auto-archive to a fast, searchable, state-preserving graveyard, so closing never means losing. Declare *tab bankruptcy* safely; AI clusters the piles ("14 tabs about X — make this a project?").
- **Opinionated hierarchy** of **Workspaces → Profiles → Containers → Tab Groups**, with sane, batteries-included conventions for how they nest and when to use each.
- **Project-first workspaces**: project-scoped tabs, history, cookies, and state — Aether's identity feature.
- **Per-workspace session persistence**: scroll positions, form data, and auth state preserved per project.
- **Context resurrection** ("Where was I?"): captures not just your tab set but the *why* (a one-line or voice note), and restores the exact working context after an interruption.
- **Tab unloading / hibernation**: automatic tab suspension to keep 100+ tab workflows light.

### 🎨 Theming & Ricing
- **Fully themeable chrome**, driven entirely by design tokens / CSS variables.
- **System theme inheritance** in the spirit of `pywal` / `matugen` / `wallust` / `base16`: switch your desktop to Catppuccin and Aether's colors, fonts, light/dark mode, palette, and icons all follow — automatically.
- **Best-effort web-content theming** (reader mode, injected stylesheets) where sites allow it.

### ⌨️ Configuration as Data
- Entire browser configured in **`YAML` / `TOML` / `JSON`** — settings, keybinds, themes, layouts, statusbar, agents.
- **Declarative, version-controllable, shareable** dotfiles — version-control your entire browser setup.
- **Scripting hooks** as an escape hatch for behavior that declarative config can't express.

### 🤖 Native AI (Local-First, Trustworthy)
- **Local-first AI gateway**: speaks to **LM Studio** / **Ollama** and any OpenAI-compatible endpoint out of the box (BYOM); optional frontier models for the genuinely hard problems (your choice, your keys). The privacy claim is *architectural*.
- **AI sidebar** with full page/DOM context, scoped to the current workspace — summarize, ask, transform.
- **AI page/PDF/YouTube summarization** — the one-click "show, don't tell" AI moment.
- **Coding-agent control plane**: connect and command multiple running coding agents from inside the browser.
- **The Spectator** — an always-on, *local* observer of your active tab, dwell time, switching patterns, and idle state, which checks your behavior against your stated intent and nudges you. Designed around three rules:
  - **Local-only** — your usage never leaves your machine.
  - **Curious, not punitive** — re-orienting nudges that hand the decision back to you ("head back to X, or is this a real detour?"), never scolding.
  - **Two-sided** — it protects you from hyperfocus too ("locked in 3 hours — water? meds? it's 1am.").
- **Resident agents** that live in Aether as long-running roles on the Spectator's perception layer:
  - **Tutor agent** — maintains a living model of *how you learn*, teaches via generated concept maps/diagrams and spoken explanations (TTS), accepts spoken answers (STT), and quizzes you on a **spaced-repetition (FSRS)** schedule **gated by flow-detection** so it never interrupts deep work.
  - **Research / forager agent** — does the open-ended, rabbit-hole-prone gathering and filtering you'd otherwise lose hours to, then hands a clean digest to the Tutor.
- **Transparent AI reasoning**: agent decision-making is shown, not hidden.
- **Interruption budget**: all agents queue, dedupe, and surface nudges sparingly and on your terms.

### 🛡️ Privacy, Security & Content Control
- **Native ad & tracker blocking** using a mature blocklist engine (e.g. uBlock Origin's) — built into the engine, beating MV3-limited extensions. The #1 adoption driver.
- **Notification spam blocking**: default the notification permission to *deny*.
- **Zero-telemetry architecture**: verifiable, by design; opt-in crash reporting only.
- **Firewall and privacy tooling** surfaced as first-class settings.
- A curated set of **opinionated, pre-configured extensions** that ship working out of the box.

### 🧩 Extensibility & Compatibility
- **WebExtension API support**: a browser without password managers and uBlock Origin is dead on arrival — full extension-runtime compatibility, tested across the top extensions.
- **Composable modules / primitives**: features as composable building blocks, not a monolith.
- **Frictionless migration from Chrome/Firefox**: one-click import of bookmarks, passwords, and history (most users are Chrome refugees — import or they bounce).
- **Profile export/import**: full profile portability — users need an exit door to enter willingly.

### 🛠️ Developer & Platform-Engineer Native
- **`tmux`/`polybar`-style statusbar**: glanceable, clickable widgets for **ArgoCD cluster status**, cluster & agent notifications, **open PRs**, current tasks, and **Timewarrior** timers.
- **First-class, native-feeling integrations**: **Obsidian, GitHub, Linear, Slack, Taskwarrior, Timewarrior** — read local CLIs/files directly, call remote APIs where needed.
- **Native command palette / ex-mode**: a built-in `:command` line with tab completion, fuzzy search, and full browser access.
- **Hideable/showable chrome** down to nothing, on a keystroke.

### 📊 Dashboard as a Web App
- The **new-tab page is a full, customizable web application** — your real home base.
- **Custom cards/components** that pull live data from your own backend.
- Built-in panels for time tracking, productivity tracking, and AI / firewall / ad-block settings.

### ⚙️ Workflows & Automation (Agent-Safe)
- **Savable, replayable, runnable, durable workflows** — *with or without AI*. Steps recorded via record→replay; durability, retries, and deterministic resume delegated to a real engine you self-host (**Windmill**, **Temporal**, or **n8n**).
- **AI re-grounding** for resilient replay: when a selector breaks because a live site changed, an agent re-finds the target instead of the workflow failing.
- **Agent-safe web access**: agents act through a sandboxed, verified control plane (IPC / CDP / WebSocket), with reliability and graceful degradation as first-class concerns.
- **Sandboxed workloads** run in containers under your orchestrator.
- **Optional stealth/scraping** for automation that must survive bot detection — delivered by spinning up a **dedicated, isolated engine-level tool** (e.g. **Camoufox** / **Nodriver**) that Aether orchestrates, kept deliberately separate from your daily-driver identity. *(True fingerprint spoofing is engine-level work and a moving target[¹²]; Aether integrates the right tool rather than compromising the main browser.)*

### 🧠 Learning & Knowledge Capture
- **Recursive graph/canvas capture**: highlight anything → save it as a node with a backlink to the source, AI-auto-tagged, droppable onto a board or straight into your **Logseq/Obsidian** graph. Every node can be a single note *or* an infinitely nestable graph of its own.
- **Moodboarding, inspiration gathering, and rich bookmarking** — capture content the way a visual, associative brain actually thinks.
- The browser's superpower is **frictionless capture**; the canvas engine is borrowed, not reinvented.

### 🎯 Focus & Habits
- **Deep-focus modes** and a pervasive distraction-free posture.
- **Habit building & breaking** with **commitment-device locks** for compulsive-use loops. Locks are intentionally **enforced through an external trust anchor** (a paired peer who holds the unlock, or a genuine time-lock you can't fast-forward) so they can't be trivially self-revoked — the only design under which a software blocker actually holds.
- **Ambient, non-anxious time awareness**: glanceable elapsed time, a visual *shrinking* timer, and "this usually takes you ~X" estimates derived from your own history. Informational, never scolding.
- **Task-initiation ramps**: one keybind opens *everything* needed for task X, and the AI breaks a daunting task down to the literal first click.
- **Frictionless capture → deferred AI triage**: dump a thought into an inbox with zero in-the-moment decisions; AI sorts it into tasks/notes/graph later.

### 📨 Opinionated App Surfaces
- Minimal, productivity-first, distraction-stripped reskins for high-use daily drivers like **Gmail** and **YouTube**.

### 🔗 Sync & Collaboration
- **No-cloud, peer-to-peer, end-to-end-encrypted, decentralized sync** — built on local-first CRDTs (**Yjs / Automerge**) over a P2P transport (**Iroh / libp2p**), with a pragmatic fallback of syncing your state directory via **Syncthing**.
- **Cross-browser sync for portable workflows** — your config and state move with you.
- **Real-time team collaboration & task views** (Linear-style), native and live.
- **Body-doubling, built in**: co-work with a real teammate over the P2P layer, or with an AI body-double that works quietly alongside you and checks in — Focusmate, inside your browser.

---

## 📐 The Feature Matrix (Evidence-Backed)

Aether is researched before it is built. Every feature is scored with **RICE** (Reach × Impact × Confidence ÷ Effort), classified with **MoSCoW** (Must/Should/Could/Won't), and typed with the **Kano** model — backed by a source URL. The full matrix lives in [`docs/feature-matrix.md`](docs/feature-matrix.md) (142 candidates → 50 council-scored → 30 detailed cards). The top of the build backbone:

| Rank | Feature | Category | RICE | MoSCoW |
|------|---------|----------|------|--------|
| 1 | Native Ad/Tracker Blocking | Privacy & Security | 12.08 | **Must** |
| 2 | Notification Spam Blocking | Core Browsing | 10.76 | Should |
| 3 | Vertical Tab Sidebar | Workspace | 7.45 | **Must** |
| 4 | Frictionless Migration from Chrome | Sync | 7.00 | **Must** |
| 5 | WebExtension API Support | Extensibility | 6.65 | **Must** |
| 6 | AI Page Summarization | AI & Agents | 6.03 | Should |
| 7 | Tab Unloading/Hibernation | Performance | 5.41 | Should |
| 8 | Zero Telemetry Architecture | Privacy & Security | 5.33 | **Must** |
| 9 | Tab Graveyard / Recovery | Workspace | 4.87 | Should |
| 10 | Profile Export/Import | Sync | 4.85 | Should |
| 11 | Native Command Palette / Ex-Mode | Keyboard | 4.83 | Should |
| 12 | Memory-Efficient Tab Mgmt | Performance | 4.72 | Should |
| 13 | LLM Sidebar Chat | AI & Agents | 4.56 | Should |
| 14 | Project-First Workspaces | Workspace | 4.53 | Should |
| 15 | Native Vim/Modal Keybindings | Keyboard | 4.26 | Should |

> **Council finding:** only **4 features reached "Must" consensus** — Ad/Tracker Blocking, Vertical Tabs, WebExtensions, and Zero Telemetry. Aether's identity features (Workspaces, Vim Keys, Local AI) are strategically critical but operationally contested, and are honestly rated high-priority **"Should"** rather than overstated as "Must."

**The 12 feature categories** Aether is researched across: Core Browsing · AI & Agents · Privacy & Security · Keyboard & Input · Workspace & Organization · Extensibility · Productivity · Developer Tools · Performance · Sync & Portability · Accessibility · Social & Collaboration.

---

## Architecture

Aether is a **UI/UX shell over a web engine** — the engine is intentionally *not* where the innovation lives.

> ### ⚠️ The engine is an open decision
> The **browser delivery vehicle is deliberately undecided.** This is the single highest-leverage architectural choice in the project, and it is being resolved by dedicated research (see [Research Methodology](#research-methodology)). The candidates:
>
> | Option | Upside | Cost |
> |---|---|---|
> | **Gecko / Firefox fork** | Firefox-native WebExtension IPC (`exportFunction`/`cloneInto`, Xray-protected), strong privacy heritage; matches the pre-existing [`docs/ipc-research.md`](docs/ipc-research.md) | Heavy fork-maintenance burden, smaller extension ecosystem |
> | **Chromium / CEF fork** | Largest extension ecosystem, CDP-native agent control, dominant compatibility | MV3 limits, Google's roadmap, surveillance-adjacent defaults to undo |
> | **Custom shell over a system WebView** (WebView2 / WKWebView / WebKitGTK) | Lightest to build, deepest UI control, fast iteration | Engine-level features (stealth, deep privacy) delegated out; per-platform variance |
> | **Deeply privileged extension** | Lowest effort, ship today | Hard ceiling on what's possible (no native modal keys, no zero-chrome, MV3 cage) |
>
> The pre-decided IPC layering (below) is **Firefox-oriented** and remains valid *only* if the Gecko path is chosen; it will be revisited the moment the engine decision lands.

```
┌─────────────────────────────────────────────────────────────────┐
│                         AETHER SHELL                             │
│   keyboard-driven overlays · statusbar · dashboard web app        │
│   themeable chrome (design tokens) · capture · focus/habits       │
├─────────────────────────────────────────────────────────────────┤
│   CONFIG LAYER        YAML / TOML / JSON  +  scripting hooks       │
├───────────────┬───────────────────────────────┬───────────────────┤
│  AI LAYER     │   PERCEPTION BUS (Spectator)   │  CONTROL PLANE    │
│  model gateway│   active tab · flow · idle      │  IPC / CDP /      │
│  (local-first,│   ───────────────────────────   │  WebSocket        │
│  OpenAI-compat│   AGENT RUNTIME                  │  (agents drive    │
│  + optional   │   tutor · researcher · …         │   the browser,    │
│  frontier)    │   interruption budget            │   sandboxed)      │
├───────────────┴───────────────────────────────┴───────────────────┤
│              WEB ENGINE  (UNDECIDED — Gecko / Chromium /           │
│                          custom shell / privileged ext)           │
├─────────────────────────────────────────────────────────────────┤
│        SELF-HOSTED BACKEND (optional, your infra)                 │
│  workflow engine · sandbox/containers · orchestrator · sync peer  │
│  Windmill/Temporal · Docker/containers · ArgoCD · Iroh/Syncthing  │
└─────────────────────────────────────────────────────────────────┘
```

**Pre-decided IPC layering (Gecko path only).** Four layers, from [`docs/ipc-research.md`](docs/ipc-research.md):

| Layer | Path | Method | Security |
|-------|------|--------|----------|
| 1 | Sidebar ↔ Background | `runtime.connect` (ports) | Internal to extension |
| 2 | Background ↔ Content Script | `runtime.sendMessage` / ports | Validate sender tab/frame |
| 3 | Content Script ↔ Page | `exportFunction` + `cloneInto` | Xray-protected, validate all args |
| 4 | OS-Level (optional) | `runtime.connectNative` | Full user privileges |

*Rejected for internal channels:* `window.postMessage` (spoofable), WebSocket-localhost (auth complexity), Marionette/WebDriver BiDi (extreme risk for internal use).

**Design principles**
- The **shell is web technology** — fast iteration, deep customizability, natural AI integration.
- The **engine is a dependency**, not necessarily a fork target; engine-level concerns (e.g. stealth) are delegated to purpose-built external tools.
- **Everything observable by AI is observable locally first.** The perception bus is the shared layer every agent reads from; build it well and agents are just roles plugged in.
- **The backend is yours.** Durable execution, sandboxing, orchestration, and sync are real infrastructure — Aether integrates best-in-class self-hostable engines rather than reimplementing them.

---

## Configuration

Aether is configured the way you configure your window manager — declaratively, in plain text, in version control.

```yaml
# ~/.config/aether/config.yaml

theme:
  inherit_system: true          # follow the desktop theme automatically…
  source: base16                 # …via base16 / matugen / wallust / pywal
  fallback: catppuccin-mocha     # …or pin a scheme explicitly
  apply_to: [chrome, overlays, statusbar, dashboard, icons, fonts]

canvas:
  chrome: hidden                 # nothing on screen but the page
  reveal_on: keybind

keybinds:
  mode: modal                    # vim-like Normal / Insert / Command
  command_palette: "Space"
  omni: "g o"
  tab_switcher: "Tab"
  capture: "g c"
  ai_sidebar: "g a"
  focus_mode: "g f"

privacy:
  ad_block: true                 # native, engine-level
  tracker_block: true
  telemetry: none                # zero, by architecture
  notifications: deny            # spam blocked by default

statusbar:
  position: top
  visible: false                 # summon on keybind
  widgets:
    - { type: argocd, cluster: prod, on_click: open_dashboard }
    - { type: github, query: "is:pr is:open author:@me" }
    - { type: timewarrior, show: active }
    - { type: agents, show: notifications }

ai:
  default_provider: lmstudio     # local-first
  endpoint: "http://localhost:1234/v1"
  frontier_provider: optional    # opt-in, your keys, hard problems only
  tts: piper
  stt: whisper.cpp

agents:
  spectator:   { enabled: true, telemetry: local-only, tone: curious }
  tutor:       { enabled: true, schedule: fsrs, gated_by: flow }
  researcher:  { enabled: true, hands_off_to: tutor }
  interruption_budget: { max_per_hour: 3, quiet_hours: ["22:00", "08:00"] }

sync:
  mode: p2p                      # no cloud
  transport: iroh
  encryption: e2e

focus:
  habits:
    - block: [distracting-sites]
      lock: external-anchor      # paired peer or time-lock; not self-revocable
```

---

## Self-Hosting the Backend

Aether's heavier capabilities lean on real infrastructure you run on **your own bare-metal or VMs** — nothing here requires a vendor cloud.

| Capability | Self-hosted engine (suggested, all OSS-friendly) |
|---|---|
| Durable, replayable workflows | **Windmill** (dev-friendly) · **Temporal** (heaviest guarantees) · **n8n** (largest integration library) |
| Sandboxed workloads | **Docker / containerd / Podman**, your runtime of choice |
| Orchestration & cluster ops | Your Kubernetes + **ArgoCD** (surfaced natively in the statusbar) |
| Decentralized sync peer | **Iroh** / **libp2p** node, or **Syncthing** for the state directory |
| Local AI runtime | **LM Studio** / **Ollama** / **llama.cpp**, any OpenAI-compatible endpoint |
| Stealth automation (optional) | **Camoufox** / **Nodriver**, isolated from the daily-driver profile |

Aether ships with connector configs and health-checks for each, and treats them as first-class citizens of the dashboard and statusbar.

---

## Getting Started

> ⚠️ **Aether is in the research / RFC stage.** No browser, UI, or extension code exists yet — the repository is rigorous, evidence-backed feature research (see [Research Methodology](#research-methodology)). Commands below describe the *intended* developer setup and will firm up as the shell lands. See [Roadmap](#roadmap).

**Prerequisites (intended)**
- Node.js LTS and a package manager (`pnpm` recommended)
- A local model runner — **LM Studio** or **Ollama** — for the AI layer
- *(Optional)* A self-hosted workflow engine and container runtime for automation

```bash
# Clone
git clone https://github.com/<your-org>/aether.git
cd aether

# Install
pnpm install

# Run the shell in dev mode
pnpm dev

# Build a desktop bundle
pnpm build
```

On first run, Aether looks for `~/.config/aether/config.yaml`. If none exists, it scaffolds a minimal one you can grow.

---

## Roadmap

Shipping in vertical slices — each milestone is usable on its own. Sequencing is informed by the [Feature Matrix](#-the-feature-matrix-evidence-backed).

- [ ] **v0.0 — Decide the engine.** Resolve Gecko vs Chromium vs custom-shell via dedicated research; lock the IPC/control-plane architecture.
- [ ] **v0.1 — Home base.** Custom new-tab dashboard · `tmux`-style statusbar (ArgoCD, PRs, timers) · AI sidebar wired to LM Studio.
- [ ] **v0.2 — The Canvas.** Zero-chrome shell · keyboard-driven overlays · native modal keybindings · rich tabs (previews, fuzzy search, archive) · full theming + system inheritance.
- [ ] **v0.3 — Spaces & config.** Workspaces/Profiles/Containers/Groups hierarchy · declarative YAML/TOML config + hooks · native ad/tracker blocking · WebExtension support · Chrome/Firefox import.
- [ ] **v0.4 — Resident AI.** The Spectator (local, flow-aware) · Tutor agent (spaced repetition + TTS/STT) · Researcher agent · interruption budget · transparent reasoning.
- [ ] **v0.5 — Workflows.** Record→replay durable workflows on a self-hosted engine · AI re-grounding · sandboxed container workloads · agent-safe IPC/CDP control surface.
- [ ] **v0.6 — Knowledge & focus.** Recursive graph capture → Logseq/Obsidian · context resurrection · habit/commitment locks · ambient time · task-initiation ramps.
- [ ] **v0.7 — Decentralized sync.** P2P, e2e-encrypted, CRDT-based sync (no cloud) · profile export/import.
- [ ] **v0.8 — Collaboration.** Real-time team/task views · body-doubling · opinionated Gmail/YouTube surfaces.
- [ ] **v1.0 — Aether.** All of the above, stable, documented, and lovable.

---

## Research Methodology

Aether's defining phase is **research, not code** — the most thorough phase of the project by design. Feature discovery runs as a **multi-agent research swarm**: departments (discovery, competitive intelligence, market/domain, technical/architecture) feed an **executive council** (Product Strategist, Technical Architect, User Advocate, Security Auditor, Devil's Advocate) that scores every candidate with **RICE + MoSCoW + Kano**, with **Chain-of-Verification** validation and an evidence URL behind every claim.

- **Wave 1 (v1, complete):** 5-wave pipeline → 16 reports, 142 candidates, council scoring. Findings live in [`docs/research-data/`](docs/research-data/) and the assembled [`docs/feature-matrix.md`](docs/feature-matrix.md). *(Preserved — never overwritten.)*
- **Wave 2 (v2, in progress):** a **20-team** deep-research expansion driven by the **Feynman** research CLI, orchestrated team-by-team via **agent-manager** tmux sessions and a Claude **workflow**. Teams span the five user segments (now including a dedicated **ADHD/executive-function** team), six competitive tracks, four market/domain tracks, three technical/architecture tracks (including the **engine-decision** team), and two synthesis/red-team tracks. Output lands in `docs/research-v2/` and `outputs/`, additively.

Tooling: [Feynman](https://www.feynman.is) (`deepresearch` / `compare` / `review`), the `agent-manager` lifecycle skill, Postgres/Redis for structured findings (when provisioned), and Memory-Keeper for context snapshots.

---

## The Long-Term Vision

A world where the most-used piece of software in a person's day is *on their side* — where the environment in which we think, build, and learn is designed to protect attention rather than harvest it, and where AI assistance never costs you your sovereignty.

Aether aims to become the **reference platform for attention-respecting, neurodivergent-first, power-user-first, local-first computing**: an ecosystem where themes, agents, dashboard cards, integrations, and workflows are shared like dotfiles; where teams self-host the whole stack with full trust; and where "I can't focus" is met with a system that adapts to your brain instead of demanding your brain adapt to it.

The browser is the beachhead. The mission is bigger than the browser.

---

## Mission

> **To give people — especially neurodivergent builders and power users — a calm, sovereign, intelligent home base for their attention, and to prove that the most humane software can also be the most powerful.**

We commit to three things above all:

1. **Defend attention as the user's most precious resource.** Every default, every feature, every nudge is judged by whether it protects intention.
2. **Keep the user sovereign.** Your data, your models, your infrastructure, your rules — owned by you, inspectable by anyone, captured by no one.
3. **Build *with* the community that needs this most.** In the open, accessibly, and without shame.

---

## 🆓 The Open-Source & Local-First Pledge

- **100% open source, forever.** Aether is and will remain free and open-source software under a copyleft license. No open-core bait-and-switch, no "community edition" hostage-taking.
- **Local-first by default.** Aether runs entirely on your machines. Local AI, local data, local sync. The cloud is always *optional* and never required for any core capability.
- **Self-hostable, end to end.** Every backend dependency — workflow engine, sandboxes, orchestrator, sync — is something you can run on your own bare metal or VMs.
- **No vendor lock-in.** Standards-based, exportable, and built on interoperable OSS components you can swap.
- **No monetization of the user.** No ads, no telemetry-for-sale, no "default search deal," no dark patterns. Ever.

## 🔒 The Privacy Pledge

- **Your usage never leaves your machine without your explicit action.** The always-on Spectator and all behavioral analysis are **local-only by design** — an always-watching AI that streams your life to a cloud is a liability, not a feature, and we refuse to build it.
- **No cloud account required to use Aether.** Sync is peer-to-peer and **end-to-end encrypted**; we never hold your keys, and there is no central server that *could* read your data.
- **No tracking, no fingerprinting of you, no behavioral profiling for profit.**
- **Transparent by construction.** The code that watches you is open and auditable. You can read exactly what is observed, stored, and shared — and turn any of it off.
- **Data portability is a right.** Your config, knowledge graph, history, and state are yours to export, move, and delete at any time.

---

## 🤝 Contributing

Contributions are deeply welcome — code, design, docs, accessibility, lived experience, and ideas. Right now the highest-value contribution is **research and critique**: pressure-test the feature matrix, bring sourced evidence, and challenge the assumptions.

1. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and the [Code of Conduct](#community--code-of-conduct).
2. Browse issues labeled `good first issue` and `help wanted`.
3. Open an issue to discuss substantial changes before a large PR.
4. Fork → branch → PR. Keep PRs focused and reviewable.

**We especially value contributors who bring an ADHD / neurodivergent perspective, deep keyboard-driven workflows, or privacy/security expertise** — this software is built for you, and your insight on what actually helps (and what quietly hurts) is the most valuable input there is.

## Community & Code of Conduct

This is a project for people who are often poorly served by both software and the communities around it. We hold a high bar for kindness. Harassment, ableism, and shaming have no place here. See [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Join the conversation in [Discussions](../../discussions) and our chat (link in the repo sidebar).

## Security

Found a vulnerability? Please **do not** open a public issue. Follow the process in [`SECURITY.md`](SECURITY.md) for responsible disclosure. Given Aether's local-first, agent-driven design, we take the security of the IPC/control-plane surface, sandboxing, and the AI permission model especially seriously.

---

## 📜 License

Aether is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0-or-later)**. See [`LICENSE`](LICENSE).

**Why AGPL:** it guarantees Aether stays free and open *even when run as a network service* — closing the SaaS loophole that lets companies take open code private. That aligns directly with the anti-capture, sovereignty-first ethos of this project. If your goals differ (e.g. permissive embedding), this is the first decision to revisit.

## Acknowledgements & Prior Art

Aether stands on the shoulders of projects that got pieces of this right, and borrows shamelessly where it should:

- **Browsers & shells:** [Zen](https://zen-browser.app) (calm UX + Mods), [qutebrowser](https://qutebrowser.org) & [Nyxt](https://nyxt.atlas.engineer) (keyboard-driven, hackable), [Vivaldi](https://vivaldi.com) (deep customization), [Arc](https://arc.net) (spatial workspaces), [Brave](https://brave.com) (privacy + AI at scale), [Floorp](https://floorp.app) / [LibreWolf](https://librewolf.net) / [Min](https://minbrowser.org) (forks done right).
- **Keyboard control:** [Tridactyl](https://github.com/tridactyl/tridactyl), [Surfingkeys](https://github.com/brookhong/Surfingkeys), [Vimium](https://github.com/philc/vimium).
- **Knowledge & capture:** [Logseq](https://logseq.com), [Obsidian](https://obsidian.md), [are.na](https://are.na), recursive-canvas tools like Muse/Heptabase.
- **Automation & infra:** [Windmill](https://windmill.dev), [Temporal](https://temporal.io), [n8n](https://n8n.io), [Syncthing](https://syncthing.net), [Iroh](https://iroh.computer), CRDTs via [Yjs](https://yjs.dev) / [Automerge](https://automerge.org); agent infra like [browser-use](https://github.com/browser-use/browser-use), [Playwright MCP](https://github.com/microsoft/playwright-mcp), [Stagehand](https://github.com/browserbase/stagehand).
- **Focus & tracking:** [ActivityWatch](https://activitywatch.net), and the open Pomodoro/Time-Timer lineage.
- **Theming:** the [base16](https://github.com/chriskempson/base16), `pywal`, `matugen`, and `wallust` ricing ecosystems.
- **Local AI:** [LM Studio](https://lmstudio.ai), [Ollama](https://ollama.com), [Piper](https://github.com/rhasspy/piper), [whisper.cpp](https://github.com/ggerganov/whisper.cpp).
- **The research that grounds this project:** Gloria Mark and colleagues at UC Irvine, whose work on interruption and attention gives the problem its shape.

---

## References

1. *Average Screen Time Statistics 2026* — DemandSage. https://www.demandsage.com/screen-time-statistics/
2. *Screen Time Statistics* — Crown Counseling (global average; ~40% of waking hours). https://crowncounseling.com/statistics/screen-time/
3. *Americans now spend 10 hours online every day* — Optimum survey via Fox News. https://www.foxnews.com/tech/americans-now-spend-10-hours-online-every-day
4. *Context switching cost: the 23-minute refocus* — summary of Gloria Mark et al., *The Cost of Interrupted Work* (CHI 2008) & *No Task Left Behind?* (CHI 2005). https://contextcost.com/
5. *It Takes 23 Minutes to Refocus After One Distraction (2026)* — attention-span collapse to 47s; ~44% self-generated interruptions. https://pomogolo.com/blog/23-minute-refocus-cost
6. *Every Distraction Costs You 23 Minutes* — RescueTime (2020): ~1 hour of true focus/day. https://tctecinnovation.com/blogs/daily-blog/every-distraction-costs-you-23-minutes
7. *Context Switching Costs $450B/Year* — average company uses 89 applications. https://www.waymakeros.com/learn/context-switching-costs-450b
8. *50+ Essential Adult ADHD Statistics (2025–2026)* — Huntington Psychological Services (CDC 6.0% / ~15.5M US adults; global 6.76% / ~366.3M; 21.6 lost-productivity days/yr; ~$122.8B/yr US cost). https://huntingtonpsych.com/blog/adult-adhd-statistics
9. *ADHD Statistics and Facts* — ADHDAdvisor.org (60% more likely fired; 300% more likely to quit impulsively; up to 33% lower earnings). https://www.adhdadvisor.org/learn/adhd-statistics-and-facts
10. *ADHD Employment Statistics (2025)* — MyDisabilityJobs (employment 67% vs 87%; ~17% lower income). https://mydisabilityjobs.com/statistics/adhd-employment/
11. *Workplace Realities of ADHD* — NCDA (core challenges: task initiation, focus, time management). https://www.ncda.org/aws/NCDA/pt/sd/news_article/603220/
12. *AI Browser Automation in 2026: Camoufox, Nodriver & Stealth* — engine-level fingerprint spoofing as a separate, specialized concern. https://www.proxies.sx/blog/ai-browser-automation-camoufox-nodriver-2026

> **Market figures** (Chrome share, switching intent, Brave MAU, Arc's wind-down, personalization demand) are drawn from Aether's own competitive research; see [`docs/research-data/`](docs/research-data/), [`docs/competitive-landscape.md`](docs/competitive-landscape.md), and [`outputs/`](outputs/) for the full sourced evidence trail. The Wave-2 research pass refreshes and re-verifies these.

---

<div align="center">

**Aether** — *because the place you spend most of your life should be on your side.*

Built in the open, for the brains and the builders the defaults forgot.

</div>
