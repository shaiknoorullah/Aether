#!/usr/bin/env bash
# Aether overlay installer — Phase 0 spike.
# Provisions the 'aether' Firefox profile, vendors fx-autoconfig, wires the overlay in.
set -euo pipefail

OVERLAY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FXAC_URL="https://github.com/MrOtherGuy/fx-autoconfig/archive/refs/heads/master.tar.gz"
PROFILE_NAME="aether"
MOZ_DIR="${HOME}/.mozilla/firefox"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/aether"

log() { printf '\033[1;35m[aether]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[aether]\033[0m %s\n' "$*" >&2; exit 1; }

# --- 1. Locate the Firefox installation ------------------------------------
if [[ -z "${FIREFOX_DIR:-}" ]]; then
  fx_bin="$(command -v firefox)" || die "firefox not found in PATH (set FIREFOX_DIR to override)"
  fx_bin="$(readlink -f "$fx_bin")"
  FIREFOX_DIR="$(dirname "$fx_bin")"
fi
[[ -x "${FIREFOX_DIR}/firefox" ]] || die "no firefox binary in ${FIREFOX_DIR} (set FIREFOX_DIR)"
log "firefox install dir: ${FIREFOX_DIR}"

# --- 2. Vendor fx-autoconfig ------------------------------------------------
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
log "fetching fx-autoconfig..."
curl -fsSL "$FXAC_URL" | tar -xz -C "$tmp" --strip-components=1

# Loader utils live in the profile chrome dir; ours is symlinked from the repo,
# so they land in overlay/chrome/utils (gitignored).
mkdir -p "${OVERLAY_DIR}/chrome/utils"
cp -r "$tmp/profile/chrome/utils/." "${OVERLAY_DIR}/chrome/utils/"

# Autoconfig entry points go into the Firefox install dir (usually root-owned).
install_autoconfig() {
  $1 mkdir -p "${FIREFOX_DIR}/defaults/pref"
  $1 cp "$tmp/program/config.js" "${FIREFOX_DIR}/config.js"
  $1 cp "$tmp/program/defaults/pref/config-prefs.js" "${FIREFOX_DIR}/defaults/pref/config-prefs.js"
}
if [[ -w "$FIREFOX_DIR" ]]; then
  install_autoconfig ""
else
  log "need sudo to write autoconfig into ${FIREFOX_DIR}"
  install_autoconfig "sudo"
fi
log "autoconfig installed"

# --- 3. Create the profile ---------------------------------------------------
profile_path=""
if [[ -f "${MOZ_DIR}/profiles.ini" ]]; then
  profile_path="$(awk -F= -v name="$PROFILE_NAME" '
    /^\[/{sect=1; n=""; p=""; rel=1}
    $1=="Name"{n=$2}
    $1=="IsRelative"{rel=$2}
    $1=="Path"{p=$2}
    n==name && p!="" {print (rel=="1" ? ENVIRON["MOZ_DIR"] "/" p : p); exit}
  ' MOZ_DIR="$MOZ_DIR" "${MOZ_DIR}/profiles.ini" || true)"
fi
if [[ -z "$profile_path" ]]; then
  log "creating profile '${PROFILE_NAME}'"
  "${FIREFOX_DIR}/firefox" -CreateProfile "$PROFILE_NAME" >/dev/null 2>&1
  profile_path="$(MOZ_DIR="$MOZ_DIR" awk -F= -v name="$PROFILE_NAME" '
    /^\[/{n=""; p=""; rel=1}
    $1=="Name"{n=$2}
    $1=="IsRelative"{rel=$2}
    $1=="Path"{p=$2}
    n==name && p!="" {print (rel=="1" ? ENVIRON["MOZ_DIR"] "/" p : p); exit}
  ' "${MOZ_DIR}/profiles.ini")"
fi
[[ -n "$profile_path" && -d "$profile_path" ]] || die "could not resolve profile path for '${PROFILE_NAME}'"
log "profile: ${profile_path}"

# --- 4. Wire the overlay into the profile ------------------------------------
if [[ -e "${profile_path}/chrome" && ! -L "${profile_path}/chrome" ]]; then
  die "${profile_path}/chrome exists and is not a symlink — move it aside first"
fi
ln -sfn "${OVERLAY_DIR}/chrome" "${profile_path}/chrome"
log "chrome/ symlinked"

if [[ -f "${profile_path}/user.js" && ! -f "${profile_path}/user.js.pre-aether" ]]; then
  mv "${profile_path}/user.js" "${profile_path}/user.js.pre-aether"
  log "existing user.js backed up to user.js.pre-aether"
fi
cp "${OVERLAY_DIR}/prefs/user.js" "${profile_path}/user.js"
log "user.js installed"

# --- 5. Seed the dotfile config ----------------------------------------------
mkdir -p "$CONFIG_DIR"
if [[ ! -f "${CONFIG_DIR}/aether.toml" ]]; then
  cp "${OVERLAY_DIR}/config/aether.toml" "${CONFIG_DIR}/aether.toml"
  log "seeded ${CONFIG_DIR}/aether.toml"
else
  log "keeping existing ${CONFIG_DIR}/aether.toml"
fi

log "done. launch with: ${OVERLAY_DIR}/bin/aether"
