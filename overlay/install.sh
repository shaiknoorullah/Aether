#!/usr/bin/env bash
# Aether overlay installer.
# Provisions the 'aether' Firefox profile, wires in the self-owned autoconfig
# loader (overlay/loader/ — no external dependency), and puts an Aether entry
# with its icon in the app launcher.
#
#   ./install.sh                      everything (autoconfig needs sudo once)
#   ./install.sh --launcher-only      just the app-launcher entry + icons
#   ./install.sh --uninstall-launcher remove the launcher entry + icons only —
#                                     never the profile, never the dotfiles
#
# Run it as YOUR user, never with sudo: it asks for sudo itself for the one
# system step (autoconfig into the Firefox directory).
set -euo pipefail

OVERLAY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGO_DIR="$(cd "${OVERLAY_DIR}/.." && pwd)/assets/logo"
PROFILE_NAME="aether"
MOZ_DIR="${HOME}/.mozilla/firefox"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/aether"
DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}"
ICON_SIZES=(16 24 32 48 64 128 256 512)

log() { printf '\033[1;35m[aether]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[aether]\033[0m %s\n' "$*" >&2; exit 1; }

# Per-user by design: the profile, the dotfile and the launcher entry are
# yours. Under sudo HOME is /root, so all three land in root's home and the
# browser you launch finds none of them (2026-10-04, the first real install).
if (( EUID == 0 )); then
  die "run as your user, not with sudo — the one step that needs root asks for it"
fi

# --- launcher: desktop entry + hicolor icons, per-user, no sudo --------------
# Launchers find apps through $XDG_DATA_HOME/applications and icons through the
# hicolor theme; caches are refreshed when the tools exist and skipped when not.
refresh_launcher_caches() {
  if command -v update-desktop-database >/dev/null; then
    update-desktop-database -q "${DATA_DIR}/applications" 2>/dev/null || true
  fi
  if command -v gtk-update-icon-cache >/dev/null; then
    gtk-update-icon-cache -q -t -f "${DATA_DIR}/icons/hicolor" 2>/dev/null || true
  fi
  if command -v kbuildsycoca6 >/dev/null; then
    kbuildsycoca6 >/dev/null 2>&1 || true
  fi
}

install_launcher() {
  local size launcher exec_path
  [[ -d "$LOGO_DIR" ]] || die "no logo assets at ${LOGO_DIR}"
  for size in "${ICON_SIZES[@]}"; do
    install -Dm644 "${LOGO_DIR}/png/aether-${size}.png" \
      "${DATA_DIR}/icons/hicolor/${size}x${size}/apps/aether.png"
  done
  install -Dm644 "${LOGO_DIR}/aether.svg" "${DATA_DIR}/icons/hicolor/scalable/apps/aether.svg"
  install -Dm644 "${LOGO_DIR}/aether-symbolic.svg" \
    "${DATA_DIR}/icons/hicolor/symbolic/apps/aether-symbolic.svg"

  # Exec must be absolute (bin/aether is not on PATH); quoted per the desktop
  # entry spec so a checkout path with spaces still launches.
  launcher="${OVERLAY_DIR}/bin/aether"
  exec_path="\"${launcher//\"/\\\"}\""
  mkdir -p "${DATA_DIR}/applications"
  local line
  while IFS= read -r line; do
    if [[ "$line" == "Exec=aether"* ]]; then
      printf 'Exec=%s%s\n' "$exec_path" "${line#Exec=aether}"
    else
      printf '%s\n' "$line"
    fi
  done < "${OVERLAY_DIR}/share/aether.desktop" > "${DATA_DIR}/applications/aether.desktop"
  chmod 644 "${DATA_DIR}/applications/aether.desktop"
  refresh_launcher_caches
  log "launcher entry: ${DATA_DIR}/applications/aether.desktop (search \"Aether\")"
}

uninstall_launcher() {
  local size
  rm -f "${DATA_DIR:?}/applications/aether.desktop" \
        "${DATA_DIR:?}/icons/hicolor/scalable/apps/aether.svg" \
        "${DATA_DIR:?}/icons/hicolor/symbolic/apps/aether-symbolic.svg"
  for size in "${ICON_SIZES[@]}"; do
    rm -f "${DATA_DIR:?}/icons/hicolor/${size}x${size}/apps/aether.png"
  done
  refresh_launcher_caches
  log "launcher entry and icons removed (profile and dotfiles untouched)"
}

case "${1:-}" in
  "") ;;
  -h|--help) awk 'NR > 1 && /^#/ { sub(/^# ?/, ""); print; next } NR > 1 { exit }' "${BASH_SOURCE[0]}"; exit 0 ;;
  --launcher-only) install_launcher; exit 0 ;;
  --uninstall-launcher) uninstall_launcher; exit 0 ;;
  *) die "unknown option: $1 (try --launcher-only or --uninstall-launcher)" ;;
esac

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
# first_existing <path...> — the first path that exists (an unmatched glob
# stays literal and fails -e), or nothing.
first_existing() {
  local f
  for f in "$@"; do
    [[ -e "$f" ]] && { printf '%s\n' "$f"; return 0; }
  done
  return 0
}
install_autoconfig() {
  local existing_cfg
  existing_cfg="$(first_existing "${FIREFOX_DIR}"/*.cfg)"
  $1 mkdir -p "${FIREFOX_DIR}/defaults/pref"
  if [[ -n "$existing_cfg" ]]; then
    if ! grep -q "AETHER-LOADER" "$existing_cfg"; then
      $1 tee -a "$existing_cfg" < "${OVERLAY_DIR}/loader/aether-loader.cfg" >/dev/null
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
  cfg="$(first_existing "${FIREFOX_DIR}"/*.cfg "${FIREFOX_DIR}"/config.js)"
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
# Firefox 147+ keeps profiles under $XDG_CONFIG_HOME/mozilla/firefox when
# ~/.mozilla does not exist (fresh machines); existing setups stay legacy.
# Search both, legacy first — the same order Firefox itself uses.
resolve_profile() {
  local moz
  for moz in "$MOZ_DIR" "${XDG_CONFIG_HOME:-$HOME/.config}/mozilla/firefox"; do
    [[ -f "${moz}/profiles.ini" ]] || continue
    awk -F= -v name="$PROFILE_NAME" -v moz="$moz" '
      /^\[/{n=""; p=""; rel=1}
      $1=="Name"{n=$2}
      $1=="IsRelative"{rel=$2}
      $1=="Path"{p=$2}
      n==name && p!="" {print (rel=="1" ? moz "/" p : p); found=1; exit}
      END{exit !found}
    ' "${moz}/profiles.ini" && return 0
  done
  return 0
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

# --- 6. App launcher entry ---------------------------------------------------
install_launcher

log "done. launch from your app launcher (\"Aether\") or: ${OVERLAY_DIR}/bin/aether"
