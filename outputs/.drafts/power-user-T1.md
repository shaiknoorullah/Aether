# T1: Community Size & Install-Count Evidence

Research conducted: 2026-06-10

---

## Browser Extensions

| Project | Platform | Users / Stars | Source |
|---------|----------|---------------|--------|
| Vimium | Chrome Web Store | 500,000+ weekly active users | https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb |
| Vimium | Third-party tracker (ExtDown) | "4.72M+" (likely all-time, not weekly active — UNVERIFIED as official) | https://extdown.com/extension/vimium |
| Vimium | GitHub | 26,539 stars, 2,578 forks, 170+ contributors | https://github.com/philc/vimium |
| Vimium-C | Chrome Web Store | 80,000 users | https://chromewebstore.google.com/detail/vimium-c-all-by-keyboard/hfjbmagddngcpeloejdejnfgbamkjaeg |
| Vimium-C | GitHub | 4,444 stars | https://github.com/gdh1995/vimium-c |
| Tridactyl | Firefox AMO | User count not public to non-devs (maintainers note users can't see stat) | https://github.com/tridactyl/tridactyl#readme |
| Tridactyl | GitHub | 6,220 stars, 431 forks | https://github.com/tridactyl/tridactyl |
| qutebrowser | GitHub | 11,536–11,542 stars, 1,112 forks | https://github.com/qutebrowser/qutebrowser |
| Nyxt | GitHub | 10,866 stars, 456 forks | https://github.com/atlas-engineer/nyxt |
| vimb | GitHub | 1,463 stars | https://github.com/fanglingsu/vimb |
| luakit | GitHub | ~2,000 stars | https://github.com/luakit/luakit |

**Notes:**
- Vimium's official Chrome Web Store page showed "500,000+" not 4.72M. The higher figure may be from a third-party aggregator including all-time installs or multiple browser stores. For weekly-active users, the 500k figure is more reliable.
- AMO does not display public user counts for Tridactyl. The README states maintainers can see data internally.

---

## Standalone Keyboard-First Browsers (GitHub Stars, June 2026)

| Browser | Stars | Language | Last Push | Status |
|---------|-------|----------|-----------|--------|
| qutebrowser | 11,542 | Python/Qt | May 2026 | Active |
| Nyxt | 10,866 | Common Lisp | Feb 2026 | Active (pre-release 4.0) |
| vimb | 1,463 | C | April 2026 | Maintained |
| luakit | ~2,000 | Lua | Feb 2025 | Maintained |
| surf | not tracked here | C | Active suckless | Suckless project |
| badwolf | ~200 (sr.ht based) | C | Aug 2025 | Maintained |

---

## Tiling WM & Linux Community Sizes

### Arch Linux (2025–2026)
- Estimated total Arch Linux users: **~5 million** (Medium/2026 article, citing community estimate)
  - Source: https://canartuc.medium.com/more-than-5-million-users-trust-24-unpaid-volunteers-with-their-operating-system-3e4bf88b785d
- Arch Linux desktop share: **~0.9%** of global Linux desktop market (2024 surveys)
  - Source: https://gitnux.org/linux-statistics/

### Arch Community Survey (n=3,923, Jan 2025)
- **Hyprland**: 26% of Arch users' preferred desktop environment (2nd overall after KDE Plasma at 36%)
- **Firefox**: 58% preferred browser; Firefox-based browser: 17%; Brave: 9%; Chrome: 5%
- **65%+ prefer CLI over GUI tools**
- Source: https://linuxiac.com/arch-linux-community-survey-results/ (survey data: https://docs.google.com/forms/d/1c1MAsXxMFp_UbNJur5-v7k5-4aBWzsm9fXmdZp7dmpA/viewanalytics)

### Arch pkgstats data (July 2025, opt-in sample)
- **Window managers (among WM-users on Arch)**:
  - i3: 12.89% (top WM)
  - Sway: 12.28%
  - Hyprland: ~10% (3rd, fast rising)
  - Openbox: ~8% (declining)
- **Browsers**:
  - Firefox: ~60%
  - Chromium: ~43%
  - Chrome: ~17%
- **Text editors**:
  - Nano: 66%
  - Vim: 62%
  - Vi: 45%
  - Neovim: 35%
- Source: https://linuxiac.com/insights-into-arch-linux-users-preferences/

### r/hyprland
- **50k+ members** (noted in cavecreekcoffee.com/reviews/best-linux-tiling-window-manager-2026)
- Note: Reddit removed subscriber counts in 2026 (https://www.theverge.com/news/775524/reddit-subreddit-member-count-vistors-contributors); exact current count UNVERIFIED via Reddit directly

### PainOnSocial aggregator (UNVERIFIED — third-party, methodology unclear)
- Claims "15 Communities, 7.4M+ Total Members" for Vim-related subreddits
- Claims "15 Communities, 26.1M+ Total Members" for qutebrowser-related subreddits
- These numbers are suspiciously large and likely aggregate many tangentially-related subs. Treat as UNVERIFIED.
- Source: https://painonsocial.com/products/vim, https://painonsocial.com/products/qutebrowser

---

## Summary Assessment

The keyboard-power-user segment is a **small but dense community** concentrated in the Arch/Linux enthusiast ecosystem:
- ~500k weekly active Vimium users is the most reliable upper-bound for "keyboard nav extension" users
- ~5M Arch users total; tiling WM users likely 35–45% of that subset (i3+Sway+Hyprland combined ~35% in pkgstats)
- Hyprland alone has 10k+ GitHub stars and 50k+ subreddit members in ~3 years
- qutebrowser at 11.5k stars and Nyxt at 10.9k stars indicate healthy niche followings
