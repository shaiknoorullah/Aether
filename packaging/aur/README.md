# AUR draft — `aether-git`

**Not published.** Builds locally (`makepkg`, no root; 70 files: overlay under
`/usr/share/aether`, `/usr/bin/aether`, system desktop entry + hicolor icons,
autoconfig in `/usr/lib/firefox`, a pacman hook). Publishing is a decision, not
a step — it turns a personal tool into something with users, which the project
rules say waits until real users exist.

Open questions before it could ship:

1. **Autoconfig ownership.** The package owns `/usr/lib/firefox/aether.cfg` and
   two prefs files there, so every Firefox profile on the machine loads the
   loader (it returns early unless the profile has `chrome/chrome.manifest`)
   and runs autoconfig unsandboxed. That is install.sh's footprint too, just
   tracked by pacman. Any other package or admin autoconfig
   (`general.config.filename`) conflicts — one wins by pref load order.
2. **Two install paths must stay exclusive.** A checkout's `install.sh` writes
   `config.js`/`config-prefs.js`; the package writes `aether.cfg`/
   `aether-autoconfig.js`. Both set `general.config.filename`. Pick one.
3. **Per-user setup is a manual step** (`/usr/share/aether/overlay/install.sh`,
   printed by `aether.install`): profiles live in `$HOME`, which a package must
   not touch. It also installs a per-user launcher entry that shadows the
   system one — harmless, but redundant.
4. **The hook only reminds.** `aether-firefox.hook` prints the monthly-drill
   reminder after a Firefox upgrade; running the visual suite as root from a
   pacman hook would be wrong.

Regenerate `.SRCINFO` after editing: `makepkg --printsrcinfo > .SRCINFO`.
