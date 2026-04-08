# Firefox Forks & Keyboard Extensions: Competitive Ecosystem Analysis

## Executive Summary

The Firefox fork ecosystem is experiencing a generational shift. Zen Browser has emerged as the dominant newcomer with 41k+ GitHub stars (surpassing Brave), driven by Arc Browser refugees and a focus on workspace/tab management UX. Floorp remains the most feature-rich customization-oriented fork, while Waterfox (15 years old) and LibreWolf occupy privacy-focused niches with constrained resources. All forks share a fundamental sustainability risk: dependence on Mozilla's upstream Firefox codebase with limited maintainer bandwidth. For keyboard-driven browsing, Vimium dominates in user count (~500k Chrome users) but Tridactyl and Surfingkeys offer deeper extensibility. The critical finding for Aether: no fork has solved the keyboard-first browsing problem at the browser level -- all rely on extension-layer bolted-on solutions.

## Per-Project Analysis

---

### Zen Browser

**Overview**: Free, open-source Firefox fork launched 2024, focused on privacy, customizability, and modern design. Positioned as the spiritual successor to Arc Browser.

**Feature Differentiation from Stock Firefox**:
- Vertical tab sidebar with workspaces (topic-based tab grouping)
- Split View: up to 4 tabs tiled in a grid within a single window
- Glance: modal link preview invoked via modifier+click
- Nested tab folders (added August 2025)
- Zen Mods: user-generated theme/UI customization marketplace
- Compatible with all Firefox extensions and Mozilla account sync

**Community Health**:
- **GitHub Stars**: 41.2k (as of April 2026) -- Source: [GitHub](https://github.com/zen-browser/desktop)
- **Forks**: 1,424
- **Open Issues**: ~485
- **Commit Activity**: 41,174 contributions in the past year -- Source: [GitHub org](https://github.com/zen-browser)
- **Release Cadence**: Regular beta releases (latest 1.19.6b, April 2, 2026) -- Source: [Releases](https://github.com/zen-browser/desktop/releases)
- Active Reddit engagement from developer; users praise "fast iteration, responsive team" -- Source: [Product Hunt](https://www.producthunt.com/products/zen-browser/reviews)

**Sustainability Assessment**:
- **Funding**: Community donations via Patreon and Ko-fi only -- Source: [FAQ](https://docs.zen-browser.app/faq)
- **Bus Factor**: CRITICAL (1). "It's a one man project who manages all the pull requests" -- Source: [GitHub Discussion #11476](https://github.com/zen-browser/desktop/discussions/11476)
- **Core Team**: Mauro V. (creator/main dev), ~6 listed contributors for specific areas (macOS, themes, split views) -- Source: [About](https://zen-browser.app/about/)
- **Contributor Friction**: Reported lack of documented contribution setup; "help with setup was not forthcoming" -- Source: [GitHub Discussion #11476](https://github.com/zen-browser/desktop/discussions/11476)
- **Risk**: Explosive growth (0 to 41k stars in ~2 years) with no commercial backing and single-maintainer bottleneck. Classic open-source sustainability crisis trajectory.

**Why Is Zen Growing So Fast?**
1. **Arc vacuum**: Arc Browser announced end of new features; Zen captured the migration -- Source: [Wikipedia](https://en.wikipedia.org/wiki/Zen_Browser)
2. **UX innovation**: Workspaces, split view, and glance are genuinely novel for Firefox-based browsers
3. **Aesthetic appeal**: Gradient theming, mod store, clean sidebar design appeal to design-conscious users
4. **Community-responsive development**: Developer actively implements Reddit feature requests -- Source: [XDA](https://www.xda-developers.com/stop-using-brave-and-chrome-zen-browser-is-the-only-one-id-recommend/)
5. **Performance**: "Smooth performance and low CPU use on Mac" -- Source: [Product Hunt](https://www.producthunt.com/products/zen-browser/reviews)

**Confidence**: HIGH (10+ independent sources)

---

### Floorp

**Overview**: Free, open-source Japanese Firefox fork. The most customizable Firefox derivative, targeting power users who want deep UI control.

**Feature Differentiation from Stock Firefox**:
- 5 switchable interface designs including OS-specific themes
- Vertical tabs, multi-functional sidebars, custom CSS support
- Toolbar relocation (title bar, combined tab+URL bar line)
- Native mouse gesture support (v12.0+)
- Built-in Floorp Notes with rich text editor and drag-and-drop
- Cross-window workspace synchronization
- PWA support
- Zen Mode (focus mode minimizing browser chrome)
- Chrome extension support (added v12.11.0, March 2026)

**Community Health**:
- **GitHub Stars**: 8,091 -- Source: [GitHub](https://github.com/Floorp-Projects)
- **Forks**: 248
- **Repositories**: 41 across the Floorp-Projects org -- Source: [GitHub org](https://github.com/orgs/Floorp-Projects/repositories)
- **Last Updated**: April 5, 2026
- **Release Cadence**: Regular releases; v12.12.0 most recent -- Source: [Neowin](https://www.neowin.net/software/floorp-browser-12120/)
- **Base**: Switched from Firefox ESR back to rapid release Firefox (v12.1.0, August 2025) -- Source: [Wikipedia](https://en.wikipedia.org/wiki/Floorp)

**Sustainability Assessment**:
- **Funding**: Not publicly documented; appears volunteer-driven
- **Bus Factor**: LOW-MEDIUM. Multiple listed contributors but core development appears concentrated
- **Upstream Strategy**: Switched between ESR and rapid release, indicating ongoing tension with upstream tracking
- **Risk**: Medium. Feature breadth creates large maintenance surface. Chrome extension support is ambitious but adds complexity.

**Confidence**: HIGH (8+ independent sources)

---

### Waterfox

**Overview**: Oldest active Firefox fork (est. 2011). Privacy-focused, targeting users who want Firefox without telemetry. Acquired by System1 (ad company) in 2020; now operates under BrowserWorks.

**Feature Differentiation from Stock Firefox**:
- All telemetry, tracking, analytics removed
- Oblivious DNS by default
- Private Tabs (built-in, not just private windows)
- Vertical Tree Tabs
- DRM disabled by default
- Supports Firefox, Chrome, and Opera extensions
- Waterfox Private Search (subscription service)

**Community Health**:
- **GitHub Stars**: 5.4k -- Source: [GitHub](https://github.com/BrowserWorks/waterfox)
- **Last Updated**: January 28, 2026 (concerning gap vs. April 2026)
- **Contributor Diversity**: "Highly dependent on a single organization, indicating a lack of diverse organizational support" -- Source: [Linux Foundation Insights](https://insights.linuxfoundation.org/project/browserworks-waterfox/contributors)
- **Retention**: "Excellent contributor retention" -- Source: [Linux Foundation Insights](https://insights.linuxfoundation.org/project/browserworks-waterfox/contributors)

**Sustainability Assessment**:
- **Funding**: Waterfox Private Search subscription + Ecosia partnership. "When Bing terminated all third-party search contracts it hit hard... revenue has been poor since, with a few months in the red recently" -- Source: [15 Years Blog Post](https://www.waterfox.com/blog/15-years-of-forking/)
- **Bus Factor**: LOW. Single-org dependency (BrowserWorks/Alex Kontos)
- **System1 Acquisition**: Privacy browser owned by ad company creates trust tension -- Source: [CyberExpress](https://thecyberexpress.com/what-is-waterfox/)
- **Longevity**: 15 years (March 2026 anniversary), proving long-term viability despite resource constraints -- Source: [Blog](https://www.waterfox.com/blog/15-years-of-forking/)
- **Risk**: Revenue model fragile. Single-person dependency. But 15-year track record is meaningful.

**Confidence**: HIGH (8+ independent sources)

---

### LibreWolf

**Overview**: Privacy-hardened Firefox build. Not a traditional fork -- uses Firefox stable source with configuration overlays and bundled extensions. The most privacy-extreme option.

**Feature Differentiation from Stock Firefox**:
- uBlock Origin pre-installed
- WebGL disabled (fingerprinting vector)
- Forces en-US language to websites
- DNS/WebRTC forced inside proxy
- All telemetry, data collection, DRM disabled
- No search/form history, no autofill, no prefetching
- Disk cache disabled; temp files cleared on close
- Privacy-conscious default search engines (DuckDuckGo, Searx, Qwant)

**Community Health**:
- **Primary Platform**: Codeberg.org (not GitHub) -- Source: [LibreWolf](https://librewolf.net/)
- **Communication**: Matrix-based
- **Development Model**: Configuration overlay + extension bundling (minimal code divergence)
- **Updates**: Built from latest Firefox stable source

**Sustainability Assessment**:
- **Funding**: Volunteer-driven, explicitly does not solicit donations (per Lobsters discussion)
- **Bus Factor**: CRITICAL. Contributor "ohfp" stated: "We would not even remotely be able to fork and maintain a browser fully, let alone to continually develop and improve it." -- Source: [LWN](https://lwn.net/Articles/1012453/)
- **Upstream Strategy**: Lightest-weight fork model. Minimal divergence from Firefox. "The unwanted features Mozilla implements are reasonably easy to remove" -- Source: [Lobsters](https://lobste.rs/s/c7t7kz/look_at_firefox_forks)
- **Risk**: Low maintenance burden (by design), but no capacity to absorb a major upstream disruption. Sustainable only as long as Firefox itself is.

**Confidence**: HIGH (5+ independent sources)

---

### Keyboard Extensions: Tridactyl, Surfingkeys, Vimium

#### Vimium
- **Browser**: Chrome/Chromium (primary), Firefox port exists
- **GitHub Stars**: 26.3k -- Source: [GitHub](https://github.com/philc/vimium)
- **Chrome Users**: ~500,000 -- Source: [Chrome Web Store](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb)
- **Rating**: 4.8/5 on Chrome Web Store
- **Approach**: Minimal, focused. Navigation + link hinting + tab management. No browser UI modification.
- **Configuration**: Basic custom key mappings
- **Limitation**: Cannot operate on Chrome internal pages, Web Store, or PDFs. Extension sandbox constraints.

#### Tridactyl
- **Browser**: Firefox only
- **GitHub Stars**: 6.1k -- Source: [GitHub](https://github.com/tridactyl/tridactyl)
- **Forks**: 427
- **Approach**: Full Vimperator/Pentadactyl successor. Aims to replace Firefox's entire control mechanism.
- **Configuration**: `.tridactylrc` file -- version-controllable, portable across machines -- Source: [pakstech.com](https://pakstech.com/blog/browse-web-with-keyboard/)
- **Key Differentiator**: Command-line mode (`:` prefix), ex-commands, ability to source external configs
- **Limitation**: Firefox-only. "Steep learning curve... extensive command set" -- Source: [SaaSHub](https://www.saashub.com/compare-tridactyl-vs-surfingkeys). "May be resource-intensive" with many custom scripts.
- **Funding**: GitHub Sponsors for main developer (Oliver Blanthorn) -- Source: [DEV](https://dev.to/szabgab/github-sponsors-oliver-blanthorn-main-developer-of-tridactyl-1249)

#### Surfingkeys
- **Browser**: Chrome + Firefox + Safari (via Mac App Store) + Edge
- **GitHub Stars**: 5.9k -- Source: [GitHub](https://github.com/brookhong/Surfingkeys)
- **Forks**: 528
- **Firefox Users**: ~1,882 daily -- Source: [chrome-stats.com](https://chrome-stats.com/d/surfingkeys_ff/download?hl=en)
- **Approach**: JavaScript-first configuration. Custom JS functions mapped to keyboard shortcuts.
- **Key Differentiator**: Full JS scripting engine for automation. Cross-browser. "A power tool for automating tasks with simple keystrokes" -- Source: [pakstech.com](https://pakstech.com/blog/browse-web-with-keyboard/)
- **Limitation**: Non-standard default keybindings (E/R for tabs, S/D for navigation). Learning curve for Vim users.
- **Maintained by**: Single developer (Brook Hong)

#### Which Keyboard Extension Is Most Capable?

| Capability | Vimium | Tridactyl | Surfingkeys |
|---|---|---|---|
| **Link hinting** | Yes | Yes | Yes |
| **Custom keybinds** | Basic | Advanced (.tridactylrc) | Advanced (JS) |
| **Scripting** | No | Limited (ex-commands) | Full JavaScript |
| **Cross-browser** | Chrome+Firefox | Firefox only | Chrome+Firefox+Safari+Edge |
| **Command line** | Vomnibar | Full ex-mode | Omnibar |
| **Browser UI control** | None | Some (via Firefox APIs) | None |
| **Config portability** | Export/import | .tridactylrc (git-friendly) | JS file (git-friendly) |
| **User base** | ~500k (largest) | ~6.1k GH stars | ~5.9k GH stars |

**Most capable**: Surfingkeys (JS scripting + cross-browser). **Most Vim-faithful**: Tridactyl (Vimperator lineage). **Most accessible**: Vimium (simplest, largest user base).

**Confidence**: HIGH (multiple independent comparison sources)

---

## Comparison Matrix: Firefox Forks

| Dimension | Zen Browser | Floorp | Waterfox | LibreWolf |
|---|---|---|---|---|
| **Founded** | 2024 | ~2022 | 2011 | ~2020 |
| **GitHub Stars** | 41.2k | 8.1k | 5.4k | N/A (Codeberg) |
| **Primary Focus** | UX/Design/Tabs | Customization | Privacy/Detelemetry | Hardened Privacy |
| **Firefox Base** | Rapid release | Rapid release (since v12.1) | ESR-based | Stable release |
| **Vertical Tabs** | Yes (core) | Yes | Yes (Tree Tabs) | No (use extension) |
| **Workspaces** | Yes | Yes | No | No |
| **Split View** | Yes (grid) | No | No | No |
| **Custom CSS** | Via Mods | Yes (deep) | Limited | Via user overrides |
| **PWA Support** | No | Yes | No | No |
| **Mouse Gestures** | No | Yes (native) | No | No |
| **Chrome Extensions** | No | Yes (v12.11+) | Yes | No |
| **DRM** | Enabled | Enabled | Disabled default | Disabled |
| **Telemetry** | Reduced | Disabled | Removed | Removed |
| **Funding** | Patreon/Ko-fi | Unknown/Volunteer | Subscription + partnerships | Volunteer |
| **Bus Factor** | 1 (critical) | Low-medium | 1 (Alex Kontos) | Low (volunteer team) |
| **3+ Year Survival?** | Uncertain | Likely | Proven (15 years) | Likely (lightweight) |

## Sustainability Risk Assessment

### The Fundamental Constraint of Firefox Forks

"Browsers are extremely high-velocity projects that must be kept up-to-date for important security patches. Maintaining a fork in these conditions is challenging, with the only sustainable approach being to diverge as little as possible from the upstream project." -- Source: [Cliqz/0x65.dev](https://0x65.dev/blog/2019-12-17/why-we-forked-firefox-and-not-chromium.html)

**Upstream merge burden**: Hard forks can produce "merge diffs with around 1 million changes and multiple conflicts." Lightweight forks using configuration overlays reduce this to "less than 100 lines of diff." -- Source: [Sam Macbeth](https://sammacbeth.eu/building-a-firefox-fork)

**Merge problem categories** (from academic research on browser forks):
1. Textual conflicts from overlapping changes
2. Build breaks from renamed/changed upstream APIs
3. Structural changes requiring API usage updates
4. Test failures from removed/customized features

Source: [ICSE 2020 Paper](https://chaowang-vt.github.io/pubDOC/SungLKCW20_ICSE_merge.pdf)

**Mitigating factor**: Firefox 136+ added vertical tabs and sidebar natively, reducing the need for fork patches in this area. -- Source: [Blue Fox](https://www.bluefoxconsultant.com/en/blog/blue-fox-articles-2/comparison-of-some-firefox-forks-193)

### Which Projects Survive 3+ Years?

| Project | Age | Survival Likelihood | Reasoning |
|---|---|---|---|
| **Waterfox** | 15 years | HIGH | Proven track record. Revenue model exists (fragile). |
| **LibreWolf** | ~6 years | HIGH | Minimal divergence = minimal maintenance. Survives as long as Firefox does. |
| **Floorp** | ~4 years | MEDIUM-HIGH | Feature-rich = large maintenance surface, but active development and growing community. |
| **Zen Browser** | ~2 years | MEDIUM | Explosive growth but single-maintainer bottleneck. Donation-only funding. If Mauro V. burns out, project is at severe risk. |
| **Tridactyl** | ~7 years | HIGH | Extension, not fork. Small surface area. Single-dev but GitHub Sponsors funded. |
| **Surfingkeys** | ~8 years | HIGH | Extension, not fork. Cross-browser. Single dev (Brook Hong). |
| **Vimium** | ~13 years | HIGH | Mature, minimal scope, large user base. |

## Opportunities & Gaps for Aether

### Gap 1: No Browser Has Native Keyboard-First Navigation
Every keyboard solution is an extension bolted onto a mouse-first browser. Extensions cannot:
- Operate on browser chrome (address bar, settings, extensions page)
- Intercept page loads before rendering
- Access cross-origin iframes consistently
- Modify the browser's actual navigation model

**Opportunity**: A browser built keyboard-first from the ground up would eliminate the extension sandbox problem entirely.

### Gap 2: Fork Sustainability Is Unsolved
Every fork faces the same upstream merge burden. No fork has found a sustainable economic model beyond donations and fragile search partnerships.

**Opportunity**: Building on a rendering engine (Gecko/WebKit) without forking a full browser avoids the maintenance trap. Alternatively, building natively with a library approach (embedding Servo/WebKit) would decouple from upstream browser release cycles.

### Gap 3: Workspace/Tab Management Is Extension-Deep, Not Architecture-Deep
Zen's workspaces, Floorp's sidebars, and Vivaldi's tab stacks are UI layers over the same flat tab model. No browser has rethought the underlying data model for how pages relate to each other.

**Opportunity**: An AI-native browser could model page relationships, context, and task graphs natively rather than through manual workspace organization.

### Gap 4: Configuration Is Either Too Simple or Too Complex
Vimium: too simple. Tridactyl: requires Vim expertise. Surfingkeys: requires JavaScript. No middle ground exists between "basic settings" and "write code."

**Opportunity**: Structured, discoverable configuration that scales from beginner to expert without requiring a programming language.

### Gap 5: No Cross-Browser Keyboard Extension Covers All Surfaces
Even Surfingkeys (the most cross-browser option) cannot touch browser-internal pages. Tridactyl is Firefox-only. None works on mobile.

**Opportunity**: A browser that owns its UI layer can make every surface keyboard-navigable, including settings, downloads, history, and devtools.

## Pain Points (Ranked by Severity)

| # | Pain Point | Severity | Sources | Confidence |
|---|-----------|----------|---------|------------|
| 1 | Single-maintainer bottleneck in fastest-growing fork (Zen) | Critical | [GitHub Discussion](https://github.com/zen-browser/desktop/discussions/11476), [FAQ](https://docs.zen-browser.app/faq) | HIGH |
| 2 | Upstream merge burden for all forks (security lag, API breaks) | Critical | [0x65.dev](https://0x65.dev/blog/2019-12-17/why-we-forked-firefox-and-not-chromium.html), [LWN](https://lwn.net/Articles/1012453/), [Lobsters](https://lobste.rs/s/c7t7kz/look_at_firefox_forks) | HIGH |
| 3 | Keyboard extensions can't access browser chrome or internal pages | High | [Nyxt comparison](https://nyxt-browser.com/article/nyxt-versus-plugins.org), [SaaSHub](https://www.saashub.com/compare-tridactyl-vs-surfingkeys) | HIGH |
| 4 | No sustainable economic model for privacy-focused forks | High | [Waterfox blog](https://www.waterfox.com/blog/15-years-of-forking/), [LWN](https://lwn.net/Articles/1012453/) | HIGH |
| 5 | Zen keyboard shortcuts not synced across profiles | Medium | [werd.io](https://werd.io/why-im-all-in-on-zen-browser/) | MEDIUM |
| 6 | Contributor onboarding friction (Zen lacks documented setup) | Medium | [GitHub Discussion](https://github.com/zen-browser/desktop/discussions/11476) | MEDIUM |
| 7 | Waterfox DRM disabled by default breaks streaming services | Medium | [helpdeskgeek](https://helpdeskgeek.com/reviews/firefox-vs-waterfox-which-browser-is-safer-to-use/) | MEDIUM |
| 8 | Floorp memory consumption higher than Firefox | Low | [JMooreWV](https://jmoorewv.com/blog/reviews/floorp-browser-review/) | LOW |

## Sources

### Zen Browser
- https://en.wikipedia.org/wiki/Zen_Browser
- https://github.com/zen-browser/desktop
- https://github.com/zen-browser
- https://github.com/zen-browser/desktop/releases
- https://github.com/zen-browser/desktop/discussions/11476
- https://zen-browser.app/about/
- https://docs.zen-browser.app/faq
- https://www.producthunt.com/products/zen-browser/reviews
- https://www.xda-developers.com/stop-using-brave-and-chrome-zen-browser-is-the-only-one-id-recommend/
- https://werd.io/why-im-all-in-on-zen-browser/
- https://techpp.com/2026/01/30/zen-browser-review/
- https://fossforce.com/2026/01/get-your-zen-on-with-zen-browser/
- https://efficient.app/apps/zen
- https://releasebot.io/updates/zen-browser
- https://openalternative.co/compare/brave/vs/zen-browser

### Floorp
- https://en.wikipedia.org/wiki/Floorp
- https://github.com/Floorp-Projects/Floorp
- https://github.com/Floorp-Projects
- https://blog.floorp.app/en/release/12.1.0/
- https://www.neowin.net/software/floorp-browser-12120/
- https://floorp.app/
- https://sourceforge.net/projects/floorp-browser.mirror/
- https://docs.floorp.app/docs/contributing/contributors/
- https://jmoorewv.com/blog/reviews/floorp-browser-review/

### Waterfox
- https://github.com/BrowserWorks/waterfox
- https://www.waterfox.com/blog/15-years-of-forking/
- https://www.waterfox.com/blog/
- https://insights.linuxfoundation.org/project/browserworks-waterfox/contributors
- https://thecyberexpress.com/what-is-waterfox/
- https://slashdot.org/software/comparison/Mozilla-Firefox-vs-Waterfox/
- https://helpdeskgeek.com/reviews/firefox-vs-waterfox-which-browser-is-safer-to-use/

### LibreWolf
- https://librewolf.net/
- https://librewolf.net/docs/features/
- https://codeberg.org/librewolf
- https://lwn.net/Articles/1012453/
- https://lobste.rs/s/c7t7kz/look_at_firefox_forks

### Keyboard Extensions
- https://github.com/philc/vimium
- https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb
- https://github.com/tridactyl/tridactyl
- https://github.com/brookhong/Surfingkeys
- https://devctrl.blog/posts/tridactyl-surfingkeys-vimium-on-steroids/
- https://pakstech.com/blog/browse-web-with-keyboard/
- https://www.saashub.com/compare-tridactyl-vs-surfingkeys
- https://dev.to/szabgab/github-sponsors-oliver-blanthorn-main-developer-of-tridactyl-1249

### Fork Sustainability
- https://0x65.dev/blog/2019-12-17/why-we-forked-firefox-and-not-chromium.html
- https://sammacbeth.eu/building-a-firefox-fork
- https://chaowang-vt.github.io/pubDOC/SungLKCW20_ICSE_merge.pdf
- https://lwn.net/Articles/1012453/
- https://lobste.rs/s/c7t7kz/look_at_firefox_forks
- https://news.ycombinator.com/item?id=43361959
- https://www.bluefoxconsultant.com/en/blog/blue-fox-articles-2/comparison-of-some-firefox-forks-193
