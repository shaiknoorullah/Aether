# Customization Browser Forks (2026): Department Report

> **Team**: `comp-customization-forks` · **Department**: Competitive
> **Mandate**: Customization-focused browser forks (Zen, Floorp, Waterfox, LibreWolf, Mullvad, Min, Thorium) — engine base, theming, privacy defaults, differentiators.
> **Date**: 2026-06-10
> **Primary source brief**: `outputs/customization-browser-forks-comparison.md` (primary-source comparison matrix, all claims traced to ≥1 URL).

---

## 1. Executive Summary

The customization-fork landscape splits cleanly along two axes that no single product reconciles: **theming depth** and **privacy hardening**. The two leaders on ricing — Zen (Arc-style sidebar UI, Mods ecosystem, Boosts for per-site CSS/JS) and Floorp (dual sidebars, layout presets, mouse gestures, built-in theme switcher) — both ship only moderate, unhardened privacy defaults. The two leaders on privacy — LibreWolf (zero-config hardening: uBO preinstalled, RFP on, Pocket stripped, telemetry off) and Mullvad (Tor-stack crowd-hiding: letterboxing, uniform fingerprint, cookies cleared on close) — both either ignore theming (LibreWolf) or actively forbid it (Mullvad), because customization breaks the anti-fingerprinting model. **This privacy-vs-customization split is the central whitespace for Aether.**

All five Gecko-based forks (Zen, Floorp, LibreWolf, Waterfox, Mullvad) track Firefox upstream; divergence is in feature set, hardening, and update channel (ESR vs Rapid Release), not engine. The two non-Gecko outliers — Thorium (compiler-optimized Chromium LTS, performance-first, no privacy audit) and Min (Electron/Chromium, radical minimalism, now feature-frozen) — are neither customization nor privacy leaders. A recurring structural weakness across the field is **sustainability and bus factor**: Waterfox, Thorium, and Min are effectively solo-developer or maintenance-mode projects, and Zen/Floorp are small single-team efforts. Two themes are notably absent from every fork: **vim-like keyboard control baked in at the browser level** (all rely on bolt-on extensions like Tridactyl/Vimium that cannot touch browser chrome), and **a sync layer that ports a power user's customizations across machines without surveillance**.

---

## 2. Key Findings (each with source)

### F1 — Theming and privacy are inversely correlated across the entire fork field
Zen and Floorp rate highest on documented theming capability but lowest-but-Min on privacy hardening; LibreWolf and Mullvad invert that exactly. No fork scores well on both. Source: `outputs/customization-browser-forks-comparison.md` "Ricing Capability at a Glance" + "Privacy Defaults at a Glance"; corroborated by [Blue Fox Firefox-fork comparison](https://www.bluefoxconsultant.com/en/blog/blue-fox-articles-2/comparison-of-some-firefox-forks-193) and [LWN.net: A look at Firefox forks](https://lwn.net/Articles/1012453/).

### F2 — Zen's theming is the most architecturally novel: multi-layer CSS + Mods + per-site Boosts
Zen ships per-workspace theming, CSS custom properties, SVG icon dynamic coloring, a built-in color picker, a curated first-party Mods ecosystem (zen-browser.app/mods), and — new in v1.20 — Boosts for per-site CSS/JS injection. Source: [DeepWiki: Zen UI Styling & Theming Architecture](https://deepwiki.com/zen-browser/desktop/5.3-ui-styling-and-theming-architecture); [Linuxiac: Zen 1.20 Boosts](https://linuxiac.com/zen-browser-1-20-adds-boosts-for-per-site-web-customization/).

### F3 — Floorp is the deepest pure-UI ricing target: dual sidebars, layout presets, gestures, built-in theme switcher
Floorp centralizes UI config in "Floorp Hub," ships switchable themes (Lepton/Photon/Proton/Firefox UI Fix/Fluerial), dual sidebars, multiple tab-bar layouts, notes panel, and mouse gestures. Source: [DeepWiki: Floorp UI Themes and Customization](https://deepwiki.com/Floorp-Projects/Floorp/5.3-ui-themes-and-customization); [floorp.app](https://floorp.app/).

### F4 — LibreWolf proves zero-config privacy hardening is shippable as a default profile
LibreWolf ships maximum hardening out of box: telemetry off, Pocket removed at build time, ETP strict, uBlock Origin preinstalled, `privacy.resistFingerprinting` on, no Mozilla account required — defined declaratively in a public `librewolf.cfg`. Source: [librewolf.cfg (GitLab)](https://gitlab.com/librewolf-community/settings/blob/master/librewolf.cfg); [LibreWolf.net](https://librewolf.net/).

### F5 — Mullvad's "crowd-hiding" model is fundamentally incompatible with customization
Mullvad runs the Tor Browser stack without the Tor network: RFP on, letterboxing, font restriction, canvas blocked, uniform user agent, cookies cleared on every close. Theming is actively discouraged because any UI divergence makes a user distinguishable. Source: [Mullvad hard facts](https://mullvad.net/en/browser/hard-facts); [Techlore: customizing Mullvad without losing anonymity](https://discuss.techlore.tech/t/how-to-customize-mullvad-browser-without-sacrificing-anonymity/13643).

### F6 — Waterfox is first to ship a process-level native ad blocker and an explicit anti-AI stance
Waterfox 6.6.11–12 ships Brave's `adblock-rust` as a native (non-extension) blocker in preview — faster than extension-based uBO — and the developer states "we still don't have AI in the browser" as deliberate product philosophy. Trade-off: text ads allowed on the default Startpage search partner for revenue. Source: [Waterfox 6.6.12 release notes](https://www.waterfox.com/releases/6.6.12/); [Waterfox: 15 Years of Forking](https://www.waterfox.com/blog/15-years-of-forking/).

### F7 — Update cadence ranges from near-zero lag to 18+ months behind upstream
LibreWolf ships ≤3 days after Firefox stable (often same-day); Zen ~2 weeks; Floorp/Waterfox ~monthly; Mullvad stable lags 12+ months on features (ESR cycle); Thorium's LTS strategy puts it ~18 months behind Chromium stable. Cadence is a direct security-posture signal. Source: [LibreWolf FAQ](https://librewolf.net/docs/faq/); [Thorium M138 tracker issue #1067](https://github.com/Alex313031/thorium/issues/1067); brief "Update Cadence Comparison."

### F8 — Customization claims frequently outrun reality (verification gaps)
Zen's "no telemetry" claim conflicts with a confirmed live connection to `incoming.telemetry.mozilla.org` (issue #10560); Waterfox GTK theming is "supported" but broken by an open regression (#4128); Thorium's "strengthen privacy/security" claim has no published audit. Source: [Zen issue #10560](https://github.com/zen-browser/desktop/issues/10560); [Waterfox issue #4128](https://github.com/BrowserWorks/waterfox/issues/4128); [Thorium.rocks](https://thorium.rocks/).

### F9 — Sustainability/bus-factor is a field-wide structural risk
Waterfox (solo dev, acknowledged revenue challenges), Thorium (solo dev, switched to LTS explicitly to relieve maintenance burden), and Min (feature-frozen as of Oct 2025, Chromium-upgrades-only) are all single-maintainer or maintenance-mode. Source: [Min project-update issue #2647](https://github.com/minbrowser/min/issues/2647); [Thorium issue #1067](https://github.com/Alex313031/thorium/issues/1067); [Waterfox: 15 Years of Forking](https://www.waterfox.com/blog/15-years-of-forking/).

### F10 — userChrome is the lowest-common-denominator theming substrate, but it is unmaintained-CSS, not a system
LibreWolf and Waterfox expose userChrome (via toggle / enabled by default) but offer no curated first-party theming on top; Zen and Floorp build structured systems above it (Mods, Floorp Hub). Mullvad technically leaves `toolkit.legacyUserProfileCustomizations.stylesheets` on but discourages use. userChrome is powerful but brittle (breaks on Firefox UI refactors). Source: [LibreWolf preferences.ftl (Fossies)](https://fossies.org/linux/librewolf/browser/preferences/preferences.ftl); [Waterfox advanced customization docs](https://www.waterfox.com/support/waterfox-advanced-customization-and-configuration/).

---

## 3. Implied Aether Feature Candidates

| # | Feature | Category | JTBD | Evidence |
|---|---|---|---|---|
| C1 | **Theming-aware fingerprint isolation** — layer UI theming/ricing on a fingerprint surface that is sandboxed from the anti-tracking layer, so users get Zen/Floorp-grade customization AND Mullvad/LibreWolf-grade resistance | Privacy & Security | "Let me deeply customize my browser without becoming more trackable" | Brief Aether-Specific Observation #1 & #2; F1, F5 |
| C2 | **Structured theming system (Mods + per-site Boosts), not raw userChrome** — curated, installable, signed UI/CSS bundles plus per-site CSS/JS injection, built on a stable theming API rather than brittle chrome CSS | Extensibility | "Reskin and re-layout my browser reliably without my themes breaking each update" | F2, F3, F10; [Zen DeepWiki](https://deepwiki.com/zen-browser/desktop/5.3-ui-styling-and-theming-architecture) |
| C3 | **Zero-config hardened privacy default profile** (uBO-equivalent native blocking + RFP + telemetry-off) shipped as the out-of-box default, declaratively defined like `librewolf.cfg` | Privacy & Security | "Give me hardened privacy on first launch with no manual about:config" | F4; [librewolf.cfg](https://gitlab.com/librewolf-community/settings/blob/master/librewolf.cfg) |
| C4 | **Process-level native ad/tracker blocker** (adblock-rust-class) instead of relying on an extension, for lower latency and tamper resistance | Performance | "Block ads/trackers faster and more robustly than an extension can" | F6; [Waterfox 6.6.12](https://www.waterfox.com/releases/6.6.12/) |
| C5 | **Sidebar-first spatial workspaces with split view + link preview** (Zen Glance / 4-way split / per-workspace identity) as a native, keyboard-drivable surface | Workspace & Organization | "Organize many tabs spatially and preview/compare without losing context" | Brief Zen differentiators; [SupaSidebar guide](https://supasidebar.com/blog/zen-browser-features-guide-2026) |
| C6 | **Native vim-like keyboard control across all browser chrome** — modal navigation that reaches address bar, settings, and chrome that WebExtension-based tools (Tridactyl/Vimium) cannot | Keyboard & Input | "Drive the entire browser, not just page content, from the keyboard" | Brief Aether Observation #3; v1 firefox-ecosystem.md finding that no fork solved keyboard-first at engine level |
| C7 | **Transparent outgoing-connection ledger** — a user-auditable log of every network connection the browser itself makes, closing the trust gap Zen's telemetry incident exposed | Privacy & Security | "Verify my browser isn't phoning home behind my back" | F8; [Zen issue #7000 transparency](https://github.com/zen-browser/desktop/issues/7000) + [#10560](https://github.com/zen-browser/desktop/issues/10560) |
| C8 | **Portable customization/profile sync** — export-and-sync a power user's theming, workspaces, keybindings, and hardening profile across machines without a surveillance backend | Sync & Portability | "Carry my exact browser setup between machines privately" | Field gap: no customization fork offers privacy-respecting sync of UI config; F1/F9 (forks lack durable infra) |
| C9 | **Rapid, transparent security cadence with visible upstream lag** — ship within days of upstream and surface the current lag to the user, avoiding Thorium/Mullvad-style multi-month gaps | Performance | "Know my browser is current with upstream security fixes" | F7; [LibreWolf FAQ](https://librewolf.net/docs/faq/) |

---

## 4. Competitive / Whitespace Notes

- **The unoccupied quadrant is "deep theming + maximum privacy."** Every fork sits on one axis. Zen/Floorp own customization; LibreWolf/Mullvad own privacy. An architecture that sandboxes the fingerprint surface from the UI/theming layer (C1) would occupy whitespace no competitor can reach without abandoning their core model — Mullvad *cannot* add theming without breaking crowd-hiding; LibreWolf has chosen not to invest in theming at all.
- **Theming-as-a-system vs theming-as-CSS.** Only Zen (Mods/Boosts) and Floorp (Hub) treat customization as a managed, distributable system. LibreWolf, Waterfox, Thorium, and Min expose raw substrates (userChrome, Chrome extension themes, userscripts) with no curation, signing, or stability guarantees. A signed, API-backed theming system (C2) is both a differentiator and a maintenance-cost reducer (avoids brittle chrome-CSS breakage).
- **Native blocking is an emerging frontier, not a solved space.** Waterfox is the *only* fork shipping process-level blocking (adblock-rust, still preview). LibreWolf still depends on the uBO extension. Native blocking + hardened defaults + no telemetry in one package does not yet exist (brief Observation #4) — combining C3 + C4 lands there first.
- **Keyboard-first is unclaimed at the browser level.** No fork in this set ships native modal/vim control; all keyboard power is bolted on via extensions that the WebExtension API bars from browser chrome. This is a clean differentiator (C6) and aligns with the Aether power-user thesis.
- **Sync is a structural gap, not just a missing feature.** Mullvad has *no* sync by design; Zen relies on Mozilla account sync (re-introducing a Mozilla dependency the privacy crowd left for). Privacy-respecting portability of a *customized, hardened* profile (C8) is unserved.
- **Non-Gecko outliers are not competition for this mandate.** Thorium (performance-first, no privacy audit, 18-month upstream lag) and Min (feature-frozen, no WebExtensions, no uBO) neither lead on customization nor privacy. They inform Performance (Thorium's PGO/LTO claim) and minimalism, not the core theming/privacy contest.

---

## 5. Risks

| Risk | Description | Mitigation lever |
|---|---|---|
| **R1 — Fingerprint/theming sandboxing may be infeasible** | C1 assumes UI theming can be isolated from the fingerprintable surface. Mullvad's stance implies the opposite: any user-visible divergence can leak. If theming inevitably alters detectable surfaces (fonts, window metrics, render timing), C1 collapses to the same trade-off everyone else faces. | Validate technically before committing; consider theming that touches only non-fingerprintable chrome layers; per-tab identity scoping. |
| **R2 — userChrome/chrome-CSS brittleness** | Building a theming system on Firefox chrome internals (as Zen/Floorp do) means every upstream UI refactor can break themes. Floorp's ESR↔Rapid-Release churn and Waterfox's open GTK regression (#4128) show this is a live, recurring failure mode. | Define a stable theming API surface (C2) decoupled from raw chrome DOM; version and test themes against upstream changes. |
| **R3 — Upstream-tracking burden vs hardening** | Fast cadence (LibreWolf ≤3 days) and deep customization pull in opposite directions: the more the chrome is modified, the harder it is to rebase on each rapid-release Firefox. Forks that fell behind (Mullvad stable, Thorium LTS) did so partly to relieve this. | Minimize invasive chrome patching; prefer extension-API and config-layer changes over deep source forks where possible. |
| **R4 — Sustainability / bus factor** | The entire reference field is small teams or solo devs (F9). Aether's own ambitions (theming + privacy + keyboard + sync + agents) imply a maintenance surface larger than any single fork here — the exact trap that forced Min into feature-freeze and Thorium into LTS. | Scope ruthlessly; treat each pillar as a module with bounded maintenance; avoid over-broad feature surface early. |
| **R5 — Privacy-claim credibility** | Zen's telemetry incident (#10560) shows that "no telemetry" claims without verifiable evidence destroy trust with the privacy audience — exactly Aether's target. Unaudited claims (Thorium) are treated as marketing. | Ship verifiable evidence (auditable connection ledger C7, public config like `librewolf.cfg`); never make unverifiable privacy claims. |
| **R6 — Native blocker maintenance and breakage** | Process-level blocking (C4) is harder to maintain than an extension (filter-list compatibility, site breakage, must rebuild on engine updates). Waterfox ships it only as preview for these reasons. | Keep filter-list compatibility with established ecosystems (uBO lists); allow per-site disable; treat as enhancement over, not replacement of, extension support. |
| **R7 — Mozilla-dependency reintroduction via sync** | A naive sync solution that leans on Mozilla accounts (as Zen does) re-creates the dependency privacy-focused users abandoned. | Build C8 on a self-hostable / E2E-encrypted backend; no mandatory third-party account. |

---

## Sources

All source URLs are inherited from and traceable to the primary-source brief at `outputs/customization-browser-forks-comparison.md` (52 sources, primary-source methodology). Key citations used above:

- Zen theming/Boosts: https://deepwiki.com/zen-browser/desktop/5.3-ui-styling-and-theming-architecture · https://linuxiac.com/zen-browser-1-20-adds-boosts-for-per-site-web-customization/
- Zen telemetry/transparency: https://github.com/zen-browser/desktop/issues/10560 · https://github.com/zen-browser/desktop/issues/7000
- Floorp theming: https://deepwiki.com/Floorp-Projects/Floorp/5.3-ui-themes-and-customization · https://floorp.app/
- LibreWolf hardening: https://librewolf.net/ · https://gitlab.com/librewolf-community/settings/blob/master/librewolf.cfg · https://librewolf.net/docs/faq/
- Waterfox native blocker / anti-AI: https://www.waterfox.com/releases/6.6.12/ · https://www.waterfox.com/blog/15-years-of-forking/ · https://github.com/BrowserWorks/waterfox/issues/4128
- Mullvad crowd-hiding: https://mullvad.net/en/browser/hard-facts · https://discuss.techlore.tech/t/how-to-customize-mullvad-browser-without-sacrificing-anonymity/13643
- Thorium: https://thorium.rocks/ · https://github.com/Alex313031/thorium/issues/1067
- Min: https://github.com/minbrowser/min/issues/2647
- Cross-fork: https://www.bluefoxconsultant.com/en/blog/blue-fox-articles-2/comparison-of-some-firefox-forks-193 · https://lwn.net/Articles/1012453/
