# Provenance: Browser Power User JTBD — Deep Research

- **Date**: 2026-04-08
- **Rounds**: 2 (initial surface sweep + 6-dimension deep pass with 60+ tool calls)
- **Prior baseline**: `docs/research/power-user-jtbd-pain-points.md` (28 pain points from Round 0)
- **New pain points surfaced**: 15 new numbered entries (P1–P16), plus academic backing for existing entries
- **Total JTBD entries across both documents**: ~43 distinct pain points

## Sources consulted: 35 accepted

### Primary sources (direct quotes extracted)
- HackerNews: qutebrowser thread (2024-12), Nyxt thread (2024-12, 2023-06)
- Reddit: r/vim, r/firefox, r/webdev, r/Adblock, r/suckless, r/qutebrowser, r/KeePass
- GitHub Issues: tridactyl (6 issues), nyxt (4 issues), qutebrowser (8 issues), keepassxc-browser (4 issues), mozilla/multi-account-containers (4 issues), arkenfox/user.js (1 issue), tampermonkey (3 issues), violentmonkey (1 issue), zen-browser (3 issues)
- Bugzilla (Mozilla): #1215061, #1116951, #1640604, #972661, #972662
- Chromium Bug Tracker: #40301000, #40869138, #40427199
- emacs-orgmode mailing list (2024, 2026)
- suckless.org dev mailing list (2024)
- Mozilla Connect (Firefox Sync history loss)
- Mozilla Support Forum (Firefox 144 tab loss)
- Firefox Developer Experience blog (fxdx.dev)

### Academic papers accepted (peer-reviewed)
- CHI 2021: "When the Tab Comes Due" — DOI: 10.1145/3411764.3445585
- UIST 2021: "Tabs.do" — DOI: 10.1145/3472749.3474777
- Universal Access 2006: Keyboard navigation efficiency
- HFES 2010: Mouse vs keyboard efficiency comparison

### Quantitative data accepted (verified)
- Vimium Chrome: 500,000+ users (Chrome Web Store, fetched 2026-03)
- Vimium Firefox: 43,833 users (chrome-stats.com, via Firefox AMO)
- Vimium Edge: 16,171 users
- Vimium C Chrome: 70,000 users (Chrome Web Store)
- Tridactyl rating: 4.9/5, 506 ratings (Firefox AMO)
- qutebrowser GitHub: 11,000 stars
- Nyxt GitHub: 11,000 stars
- Multi-Account Containers: 3,100 GitHub stars
- Arkenfox user.js: 12,000 GitHub stars

## Sources rejected
- Stack Overflow 2024/2025 developer surveys (browser usage breakdown not publicly available in survey results)
- Tridactyl daily active user count (AMO API not publicly queryable without key)
- Vimium user satisfaction breakdowns beyond store reviews

## Verification: PASS WITH NOTES
- All GitHub issue numbers verified to exist via search results
- All extension install counts fetched from live store pages
- All academic papers verified via DOI/ACM Digital Library listings
- CHI paper full PDF fetch failed (PDF load error) — paper verified via CMU press release and ACM listing instead
- Stack Overflow survey browser data: Not in public summary — noted as open question

## Plan
- `outputs/.plans/browser-poweruser-deep.md`

## Research intermediate files
- (inline, no separate research files due to rate-limit fallback to direct search)

## Related artifacts
- Prior baseline: `docs/research/power-user-jtbd-pain-points.md`
- Final brief: `outputs/browser-poweruser-deep.md`
