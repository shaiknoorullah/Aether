# T2: Pain Points & JTBD — Community Evidence

Research conducted: 2026-06-10

---

## Jobs-to-Be-Done (JTBD)

Derived from community discussions, blog posts, and HN threads. JTBD format: "When [context], I want to [action], so I can [outcome]."

1. **Navigate without lifting hands from home row.** "If your hands never left the keyboard, you're saving the time you would have spent switching back and forth hundreds of times." (HowToGeek/qutebrowser review, https://www.howtogeek.com/this-minimalist-browser-lets-me-browse-entirely-with-my-keyboardmostly/)

2. **Follow links on any page by typing letters, not clicking.** Users want f-hinting to work across modals, iframes, PDFs, and dynamically-generated content — not just plain HTML links.

3. **Open URLs and search without the address bar ever stealing keyboard focus.** HN user: "When I open Firefox, the native interface immediately gets input focus of keyboard, and I need to click with the cursor inside the page area... The same annoying behavior occurs when I use CTRL-T" (Tridactyl issue #4105, https://github.com/tridactyl/tridactyl/issues/4105)

4. **Search and navigate 50–200+ open tabs without a mouse.** "I want really good tab management built in through some kind of workspace... keyboard shortcuts are an afterthought [in major browsers]." (HN, https://news.ycombinator.com/item?id=19306243)

5. **Block all ads and trackers at uBlock Origin quality.** Power users treat uBlock Origin as non-negotiable; inferior alternatives are unacceptable for random web browsing.

6. **Integrate with pass/gopass/KeePassXC for credentials.** Users want native messaging host that lets a password manager fill credentials without copying to clipboard and risking clipboard history leaks.

7. **Script and extend browser behavior in a real programming language.** qutebrowser users praise Python config; Nyxt users want Common Lisp extensibility; Tridactyl users want arbitrary JS binding. The shared JTBD: "configure the browser the same way I configure my editor."

8. **Prevent browser auto-updates from breaking keybinding configs.** Users who have carefully configured Tridactyl/Vimium regularly lose config when Firefox/Chrome updates change extension APIs.

9. **Keep browsing entirely within keyboard flow state, never reaching for the mouse.** For RSI sufferers this is also medical. HN: "I prefer the keyboard due to severe tendonitis in my wrist and arthritis in my hands. I can use a keyboard all day with no problem. A few hours with a mouse leaves me all swollen and in pain." (https://news.ycombinator.com/item?id=42356668)

10. **Browse modern sites without being detected as a bot or broken by site-specific quirks.** Power-user browsers running non-standard UA strings get blocked by bot-detection (Cloudflare, Anubis, Google CAPTCHAs), requiring constant user-agent workarounds.

---

## Top Pain Points (with Evidence)

### P1: WebExtension API can't control browser chrome — extensions are fundamentally limited
- The browser address bar, tabs bar, and native UI are outside the extension sandbox.
- "Qutebrowser fixes the main issue I have with Vimium: you cannot control the browser itself well. Vimium does not work in certain places due to limitations imposed by web extensions and this is incredibly frustrating for me." (HN comment, https://news.ycombinator.com/item?id=42356668)
- Mozilla was prepared to accept a patch for a lower-level key API but "people have repeatedly lost interest... the reward for getting it working being a months-long negotiation with Mozilla." (HN, https://news.ycombinator.com/item?id=24636650)
- Tridactyl's keyboard-api experiment repo (55 stars) is a stalled attempt to fix this: https://github.com/tridactyl

### P2: JavaScript focus traps — sites steal keyboard events from extensions
- React/Next.js/SPA apps frequently intercept keyboard events before extensions can see them.
- "Website stops Tridactyl receiving key events until `tri fillcmdline` is run in the address bar" (Tridactyl issue #5024, https://github.com/tridactyl/tridactyl/issues/5024)
- "keys broken on nextjs.org when Adguard is enabled" (Tridactyl issue #5128, https://github.com/tridactyl/tridactyl/issues/5128)
- Multiple workarounds documented in tridactyl troubleshooting: https://github.com/tridactyl/tridactyl/blob/master/doc/troubleshooting.md

### P3: qutebrowser — no uBlock Origin (inferior adblocking)
- "The lack of Ublock Origin makes browsing random sites horrible. People say the builtin ad blockers are good enough; for me, they are not even remotely good enough." (HN, https://news.ycombinator.com/item?id=42356668)
- "uBlock Origin: state of the art adblocking via uBlock Origin. This is vastly superior to brave-style adblocking provided to Qutebrowser by python-adblock." (port19.xyz farewell, https://port19.xyz/tech/bye-qutebrowser/)
- This is the #1 cited reason for switching away from qutebrowser.

### P4: qutebrowser — bot-detection/CAPTCHA failures
- "Most web sites, including google, constantly bombard me with captchas when I use qutebrowser." (Issue #8703, https://github.com/qutebrowser/qutebrowser/issues/8703)
- Reddit itself actively blocks qutebrowser (Issue #8599, June 2025, https://github.com/qutebrowser/qutebrowser/issues/8599)
- GitLab.gnome.org blocks by Chromium version string (Issue #8509, https://github.com/qutebrowser/qutebrowser/issues/8509)
- qutebrowser 3.5.0 changed default UA to drop `QtWebEngine/...` to reduce blocking, but Anubis bot-detection still varies by exact Chromium version string.

### P5: qutebrowser — per-site cookie persistence missing
- "The continued lack of per-site cookie persistence in Qutebrowser resulted in me having to log into every account (except discord for some reason) on each new browser session." (port19.xyz, https://port19.xyz/tech/bye-qutebrowser/)
- This is a long-standing architectural issue with QtWebEngine's profile model.

### P6: Tridactyl/extensions break on browser updates
- "Tridactyl breaks sometimes when updating" (Issue #290, https://github.com/tridactyl/tridactyl/issues/290)
- Multiple Firefox version transitions have broken Tridactyl; the Firefox 57 Quantum release killed Vimperator and Pentadactyl entirely, since WebExtensions can't replicate XUL-level access.
- "Vimperator will stop working with Firefox 57" — nobody volunteered to rewrite it under WebExtension constraints. (https://github.com/vimperator/vimperator-labs)

### P7: Tree-style tabs not available in qutebrowser
- Issue #927, open since September 2015, 81 reactions (👍). (https://github.com/qutebrowser/qutebrowser/issues/927)
- A PR (#8082) is in progress: https://github.com/qutebrowser/qutebrowser/pull/8082
- Power users with hundreds of tabs require tree/hierarchical organization; flat tab bars fail at scale.

### P8: Manifest V3 regression — bookmarklets broken in Vimium
- "When opening bookmarklets via the Vomnibar, they will fail to run if the page has a restrictive CSP. This is a new limitation in Vimium v2.0 because we've moved to Manifest v3." (Issue #4331, https://github.com/philc/vimium/issues/4331)
- MV3 also restricts dynamic script injection, limiting extension power in Chrome.
- Mozilla's MV3 implementation is less restrictive than Chrome's per Mozilla blog: https://blog.mozilla.org/en/firefox/firefox-manifest-v3-adblockers/

### P9: Password manager integration gaps
- qutebrowser has a userscript workaround (qute-pass) but no native Bitwarden/1Password support.
- "The lack of a solid Bitwarden integration in QuteBrowser is kind of hurting though." (HN, https://news.ycombinator.com/item?id=42356668)
- "I switched back to Firefox partly because KeePassXC's extension makes entering credentials far more convenient." (paritybit.ca, https://www.paritybit.ca/blog/qutebrowser-to-firefox/)
- pass users have browserpass (native messaging host): https://github.com/browserpass/browserpass-extension

### P10: Security/update lag in QtWebEngine
- qutebrowser ships new Chromium baseline ~every 6 months; security patches backported 1–2 months.
- "I'd love to use this but a key problem seems to be that they don't get updated as soon as a security fix is released, which for browser engines is quite often." (HN, https://news.ycombinator.com/item?id=42356668)
- Stable Linux distros (Debian/Ubuntu) may not backport security patches to QtWebEngine.

### P11: qutebrowser memory usage
- "I really enjoy using qutebrowser. It's a shame that I often end up using more than 100GiB of RAM with a few dozen tabs, almost like it leaks memory." (HN, https://news.ycombinator.com/item?id=42356668)
- "Qutebrowser is anything but small or fast... it is about half as fast [as Firefox]." (brycev.com, https://brycev.com/blog/why-i-am-switching-to-firefox/)

### P12: New tab page focus — address bar always takes focus on new tab
- This is a systemic issue across browsers. "The address bar always has keyboard focus on new tabs" — makes new-tab behavior hostile to Vimium. (Vimium Issue #4741, https://github.com/philc/vimium/issues/4741)
- Tridactyl users hit this constantly (issue #4105).

### P13: Browser telemetry / privacy philosophy mismatch
- Firefox defaults include Pocket, telemetry, sponsored shortcuts. Power users maintain projects like arkenfox (https://github.com/hnhx/user.js) and lacuna (https://github.com/woolkingx/lacuna) to strip these.
- Chrome/Chromium: ungoogled-chromium project exists specifically to remove Google integrations.
- Multiple blog posts cite telemetry as reason to prefer qutebrowser *despite* its other limitations (then switch away from qutebrowser for other reasons).

### P14: Nyxt — Common Lisp barrier and stability
- "I tried Nyxt but quickly got lost trying to [configure it]... I don't want to learn LISP to set my proper keybindings." (HN, https://news.ycombinator.com/item?id=28632422)
- "Nyxt is a really decent browser... But it freezes. A lot. Like, I have to kill -9 it multiple times a day." (hyperion.ser1.net, https://hyperion.ser1.net/post/web-browser-reflections/)
- Nyxt targets Emacs-style keybindings by default, not vim — vim-oriented users find it misaligned.

---

## Community Sub-Segment Differences

| Sub-segment | Primary pain | Primary tool | Main complaint |
|-------------|-------------|-------------|----------------|
| Vim purists | Missing full browser chrome control | qutebrowser | No uBlock Origin; bot detection |
| Tiling WM users | Mouse-dependency in browser UI | Firefox+Tridactyl | Focus traps; extension breakage |
| Suckless/minimalists | Bloat, dependencies, complexity | surf | No tabs natively; no password manager |
| Developers | DevTools quality; multi-env isolation | Firefox/Chrome | Profile/container management; extension MV3 |
| RSI/accessibility | Must stay on keyboard for medical reasons | Vimium/qutebrowser | Any mouse requirement is painful |
| Privacy-first | Telemetry, fingerprinting, tracking | Librewolf/ungoogled-chromium | Browser phoning home; cloud sync |
