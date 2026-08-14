#!/usr/bin/env bash
# Aether overlay installer.
# Provisions the 'aether' Firefox profile and wires in the self-owned
# autoconfig loader (overlay/loader/ — no external dependency).
set -euo pipefail

OVERLAY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE_NAME="aether"
MOZ_DIR="${HOME}/.mozilla/firefox"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/aether"

log() { printf '\033[1;35m[aether]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[aether]\033[0m %s\n' "$*" >&2; exit 1; }

# --- 1. Locate the Firefox installation ------------------------------------
# Autoconfig is read from the *application* directory — the one holding
# application.ini next to the real binary — not from wherever the launcher sits.
# Distros ship a /usr/bin shell wrapper (`exec /usr/lib/firefox/firefox "$@"`),
# and readlink -f resolves a wrapper to itself, so the dirname alone is wrong.
is_app_dir() { [[ -f "$1/application.ini" ]]; }

resolve_app_dir() {
  local bin dir target
  bin="$(command -v firefox)" || return 1
  bin="$(readlink -f "$bin")"
  dir="$(dirname "$bin")"
  is_app_dir "$dir" && { printf '%s\n' "$dir"; return 0; }

  # Shell-wrapper case: follow the path it execs.
  if [[ -f "$bin" ]] && head -c 2 "$bin" 2>/dev/null | grep -q '#!'; then
    target="$(grep -oE '/[^[:space:]"'"'"']*/(firefox|librewolf|waterfox)(-bin)?' "$bin" | head -1 || true)"
    if [[ -n "$target" && -e "$target" ]]; then
      dir="$(dirname "$(readlink -f "$target")")"
      is_app_dir "$dir" && { printf '%s\n' "$dir"; return 0; }
    fi
  fi

  for dir in /usr/lib/firefox /usr/lib64/firefox /opt/firefox \
             /usr/lib/librewolf /usr/lib/waterfox; do
    is_app_dir "$dir" && { printf '%s\n' "$dir"; return 0; }
  done
  return 1
}

if [[ -n "${FIREFOX_DIR:-}" ]]; then
  is_app_dir "$FIREFOX_DIR" || die "no application.ini in ${FIREFOX_DIR} — that is not the application directory"
else
  FIREFOX_DIR="$(resolve_app_dir)" ||
    die "could not locate the Firefox application directory (set FIREFOX_DIR to the dir holding application.ini)"
fi
log "firefox app dir: ${FIREFOX_DIR}"

# --- 2. Install the Aether autoconfig loader --------------------------------
# Our own ~40-line loader (overlay/loader/) — no external dependency.
# If the browser already has an autoconfig file (LibreWolf/Waterfox), append to
# it; otherwise install a fresh config.js (autoconfig skips its first line).
install_autoconfig() {
  local existing_cfg
  existing_cfg="$(ls "${FIREFOX_DIR}"/*.cfg 2>/dev/null | head -1 || true)"
  $1 mkdir -p "${FIREFOX_DIR}/defaults/pref"
  if [[ -n "$existing_cfg" ]]; then
    if ! grep -q "AETHER-LOADER" "$existing_cfg"; then
      cat "${OVERLAY_DIR}/loader/aether-loader.cfg" | $1 tee -a "$existing_cfg" >/dev/null
    fi
  else
    { echo "// aether"; cat "${OVERLAY_DIR}/loader/aether-loader.cfg"; } | $1 tee "${FIREFOX_DIR}/config.js" >/dev/null
    printf 'pref("general.config.filename", "config.js");\npref("general.config.obscure_value", 0);\n' | \
      $1 tee "${FIREFOX_DIR}/defaults/pref/config-prefs.js" >/dev/null
  fi
  $1 cp "${OVERLAY_DIR}/loader/zz-aether.js" "${FIREFOX_DIR}/defaults/pref/zz-aether.js"
}
autoconfig_current() {
  local cfg
  cfg="$(ls "${FIREFOX_DIR}"/*.cfg "${FIREFOX_DIR}"/config.js 2>/dev/null | head -1 || true)"
  [[ -n "$cfg" ]] && grep -q "AETHER-LOADER" "$cfg" 2>/dev/null &&
    cmp -s "${OVERLAY_DIR}/loader/zz-aether.js" "${FIREFOX_DIR}/defaults/pref/zz-aether.js"
}
if autoconfig_current; then
  log "autoconfig already current"
elif [[ -w "$FIREFOX_DIR" ]]; then
  install_autoconfig ""
  log "autoconfig installed"
else
  log "need sudo to write autoconfig into ${FIREFOX_DIR}"
  install_autoconfig "sudo"
  log "autoconfig installed"
fi

# --- 3. Create the profile ---------------------------------------------------
resolve_profile() {
  [[ -f "${MOZ_DIR}/profiles.ini" ]] || return 0
  awk -F= -v name="$PROFILE_NAME" -v moz="$MOZ_DIR" '
    /^\[/{n=""; p=""; rel=1}
    $1=="Name"{n=$2}
    $1=="IsRelative"{rel=$2}
    $1=="Path"{p=$2}
    n==name && p!="" {print (rel=="1" ? moz "/" p : p); exit}
  ' "${MOZ_DIR}/profiles.ini"
}

profile_path="$(resolve_profile)"
if [[ -z "$profile_path" ]]; then
  log "creating profile '${PROFILE_NAME}'"
  "${FIREFOX_DIR}/firefox" -CreateProfile "$PROFILE_NAME" >/dev/null 2>&1
  profile_path="$(resolve_profile)"
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
