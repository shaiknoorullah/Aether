# Comparison Plan: Browser Delivery Vehicle

## Slug
`browser-delivery-vehicle`

## Question
Which delivery vehicle should an AI-native, keyboard-first, privacy-respecting browser use in 2026?

## Options Under Comparison
1. **Firefox/Gecko fork** (e.g., Zen Browser, LibreWolf, Waterfox, Floorp)
2. **Chromium/CEF fork** (e.g., Brave, Vivaldi, Arc, Thorium)
3. **Custom shell over system WebView** (WebView2 on Windows, WKWebView on macOS, WebKitGTK on Linux)
4. **Deeply privileged browser extension** (WebExtension + native messaging on an existing browser)

## Dimensions to Evaluate
| Dimension | What to measure |
|-----------|----------------|
| **Control** | Depth of UI/chrome customization, ability to modify rendering pipeline, network stack access |
| **Fork-maintenance burden** | Upstream merge frequency, patch complexity, team size needed, examples of burnout/abandonment |
| **Extension compatibility** | WebExtension API coverage, Chrome Web Store access, MV3 implications |
| **AI/IPC/CDP capability** | Chrome DevTools Protocol support, native messaging, inter-process hooks for AI agents |
| **Zero-chrome & native modal keybinding** | Feasibility of removing all default chrome, implementing vim-like modal input at the platform level |
| **Licensing** | MPL-2.0 vs BSD-3 vs proprietary WebView terms, patent grants, redistribution constraints |

## Sources to Gather
- **Primary**: Mozilla/Firefox source docs, Chromium project docs, WebView2/WKWebView/WebKitGTK docs
- **Case studies**: Zen Browser (Gecko fork), Brave/Vivaldi/Arc (Chromium forks), Nyxt (WebKitGTK shell), Min (Electron/WebView), Surf (WebKitGTK)
- **Developer testimony**: Fork maintainer blogs, post-mortems, GitHub discussions
- **Technical docs**: CDP spec, WebExtension API tables, Firefox remote debugging protocol
- **Licensing**: MPL-2.0, Chromium BSD, Apple/Microsoft WebView terms
- **Recent news**: 2025-2026 developments (Firefox architecture changes, Chrome MV3 enforcement, WebView2 Linux status)

## Research Subagent Assignments (parallel)
1. **Firefox/Gecko fork research** — Zen, LibreWolf, Waterfox maintenance burden; Firefox customization depth; GeckoView; remote debugging protocol
2. **Chromium/CEF fork research** — Brave, Vivaldi, Arc architecture; CEF vs full fork; CDP capabilities; MV3 timeline
3. **WebView shell research** — WebView2 status (esp. Linux), WKWebView limitations, WebKitGTK/Nyxt/Surf; cross-platform feasibility
4. **Privileged extension research** — WebExtension API limits, native messaging, Sidebar API, userChrome.css vs extension-only; what's impossible without fork-level access

## Verification Pass
- Cross-check maintenance burden claims against actual commit histories
- Verify licensing terms against official license texts
- Confirm CDP/remote-debug protocol capabilities against current docs
- Check 2025-2026 status of WebView2 on Linux, Firefox's WebExtension API parity

## Output Structure
Single file: `outputs/browser-delivery-vehicle-comparison.md`
- Executive summary with recommendation
- Comparison matrix (source × dimension)
- Mermaid architecture diagram showing control depth per option
- Detailed analysis per dimension
- Agreement / Disagreement / Uncertainty sections
- Sources with direct URLs
