# b1 scenario: site boosts deterministic — per-domain CSS dotfiles + :zap.
# Spec overlay/specs/b1-site-boosts-deterministic.md §5 visual states:
#   1. playground page unboosted — baseline, target element visible
#   2. after :zap — pick badges shown (distinct color, theme red vs hint
#      yellow), then picking the target: element gone, statusbar shows the
#      zapped confirmation; the appended dotfile rule is saved as evidence
#      (dated comment + display: none !important — file proof, not pixels)
#   3. boost dotfile re-applied after relaunch — relaunch_browser, same page:
#      element still gone (persistence via the dotfile, nothing else)
#   4. :boost_off restores the pristine page — element back, statusbar shows
#      "boost off: 127.0.0.1"
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title/
# relaunch_browser are available. Shots numbered 90+ to sort after f7's 80-84.
#
# Boosts only apply to http(s) top-level pages (file:// never gets boosts —
# that exclusion is exactly why the playground must be served here), so a
# one-file node static server serves a b1 page on 127.0.0.1. The page carries
# exactly ONE hintable element (the target button), so the pick label is
# deterministically the first hint char ('a'). Host 127.0.0.1 is an IP —
# exact match only — so the boost dotfile is <dir>/127.0.0.1.css. The boosts
# dir points at a scenario temp dir via the test dotfile; the user's real
# dotfile is restored on exit (f3/f7 pattern) so earlier scenarios keep
# passing.

AETHER_USER_CONFIG_DIR="$HOME/.config/aether"
AETHER_USER_CONFIG="$AETHER_USER_CONFIG_DIR/aether.toml"
B1_CONFIG_BACKUP="$SHOTS/aether.toml.b1-backup"
B1_PORT="${AETHER_B1_PORT:-11788}"
B1_SERVER_JS="$SHOTS/b1-static-server.mjs"
B1_SERVER_OUT="$SHOTS/b1-static-server.out"
B1_PAGE_URL="http://127.0.0.1:$B1_PORT/b1.html"
B1_BOOSTS_DIR="$SHOTS/b1-boosts"
B1_BOOST_FILE="$B1_BOOSTS_DIR/127.0.0.1.css"
B1_SERVER_PID=""

# --- teardown: kill the server, put the real dotfile back --------------------
b1_teardown() {
  if [[ -n "$B1_SERVER_PID" ]]; then
    kill "$B1_SERVER_PID" 2>/dev/null || true
    wait "$B1_SERVER_PID" 2>/dev/null || true
    B1_SERVER_PID=""
  fi
  if [[ -f "$B1_CONFIG_BACKUP" ]]; then
    mv "$B1_CONFIG_BACKUP" "$AETHER_USER_CONFIG"
  else
    rm -f "$AETHER_USER_CONFIG"
  fi
}
# (if-form, not `&&` — run.sh runs with set -e and a false test would abort)
if [[ -f "$AETHER_USER_CONFIG" ]]; then
  cp "$AETHER_USER_CONFIG" "$B1_CONFIG_BACKUP"
fi
# Sourced into run.sh's shell: chain onto its cleanup trap, restore it later.
trap 'b1_teardown; cleanup' EXIT

# --- the one-file static server ----------------------------------------------
# Serves a b1 page whose ONLY hintable element is the zap target (a loud
# banner button), so pick mode labels it with the first hint char. No deps.
cat > "$B1_SERVER_JS" <<'EOF'
import { createServer } from "node:http";

const [port] = process.argv.slice(2);
const PAGE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aether b1 boosts</title>
  <style>
    body { font: 16px system-ui; margin: 2rem; background: #fbf1c7; color: #3c3836; }
    #promo { display: block; padding: 1rem 2rem; margin: 1.5rem 0;
             background: #cc241d; color: #fbf1c7; font-size: 1.4rem;
             border: 4px solid #9d0006; }
  </style>
</head>
<body>
  <h1>Aether b1 boosts page</h1>
  <p>The banner button below is the zap target — the only hintable element.</p>
  <button id="promo">LOUD PROMO BANNER — zap me</button>
  <p>This paragraph stays. If the banner is gone and this text remains, the boost applied.</p>
</body>
</html>`;

createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(PAGE);
}).listen(Number(port), "127.0.0.1", () => {
  console.log(`b1 static server listening on 127.0.0.1:${port}`);
});
EOF

node "$B1_SERVER_JS" "$B1_PORT" > "$B1_SERVER_OUT" 2>&1 &
B1_SERVER_PID=$!
b1_server_ready=""
for _ in $(seq 1 40); do
  if grep -q "listening on 127.0.0.1:$B1_PORT" "$B1_SERVER_OUT" 2>/dev/null; then
    b1_server_ready=1
    break
  fi
  sleep 0.25
done
[[ -n "$b1_server_ready" ]] || { echo "[b1] static server never came up — see $B1_SERVER_OUT" >&2; exit 3; }

# --- test dotfile: boosts on, dir at the scenario temp dir -------------------
# Only [boosts] is set; the commands and pick mode (options.hint_chars) come
# from the builtins under test. The boosts dir starts EMPTY — state 1 must be
# genuinely unboosted, and :zap itself creates 127.0.0.1.css.
rm -rf "$B1_BOOSTS_DIR"
mkdir -p "$B1_BOOSTS_DIR"
mkdir -p "$AETHER_USER_CONFIG_DIR"
cat > "$AETHER_USER_CONFIG" <<EOF
[boosts]
enabled = true
dir = "$B1_BOOSTS_DIR"
EOF

# Config is read at startup only — relaunch so [boosts] points at the temp dir.
relaunch_browser
nav "$B1_PAGE_URL" 4
wait_title "Aether b1 boosts" 15 || {
  echo "[b1] page nav did not land, retrying"
  key Escape
  nav "$B1_PAGE_URL" 5
  wait_title "Aether b1 boosts" 15
}

# --- state 1: unboosted baseline — banner visible ----------------------------
shot 90-b1-unboosted-baseline

# --- state 2: :zap — pick badges, then the banner dies -----------------------
# :zap enters element-pick mode: hint-style badges in the DISTINCT pick color
# (theme red — pick-to-hide must never look like pick-to-click yellow).
key colon
type_text "zap"
key Return
sleep 1
shot 91-b1-zap-pick-badges
# The banner is the only hintable element -> its label is the first hint
# char. Picking it appends the dated display:none rule and re-applies.
key a
sleep 1.5
shot 92-b1-zapped-banner-gone
# File proof: :zap created the exact-host dotfile with a dated comment and a
# display:none !important rule (the dotfile IS the interface).
[[ -f "$B1_BOOST_FILE" ]] || {
  echo "[b1] :zap wrote no boost dotfile at $B1_BOOST_FILE" >&2
  ls -la "$B1_BOOSTS_DIR" >&2 || true
  exit 3
}
grep -qF 'display: none !important' "$B1_BOOST_FILE" || {
  echo "[b1] boost dotfile carries no display:none rule:" >&2
  cat "$B1_BOOST_FILE" >&2
  exit 3
}
grep -qE 'zapped [0-9]{4}-[0-9]{2}-[0-9]{2}' "$B1_BOOST_FILE" || {
  echo "[b1] boost dotfile rule carries no dated comment:" >&2
  cat "$B1_BOOST_FILE" >&2
  exit 3
}
{
  echo "# $B1_BOOST_FILE after :zap (created by picking the banner):"
  cat "$B1_BOOST_FILE"
} > "$SHOTS/92-b1-boost-dotfile-evidence.txt"
key Escape
sleep 1

# --- state 3: relaunch — the dotfile alone persists the zap ------------------
# A fresh browser on the same profile: nothing but the dotfile carries the
# rule (no hidden state store), so the banner must still be gone on load.
relaunch_browser
nav "$B1_PAGE_URL" 4
wait_title "Aether b1 boosts" 15
sleep 1
shot 93-b1-relaunch-still-zapped

# --- state 4: :boost_off — pristine page back, factual statusbar echo --------
key colon
type_text "boost_off"
key Return
sleep 1.5
shot 94-b1-boost-off-restored
key Escape
sleep 1
shot 95-b1-boost-off-at-rest

# --- leave the harness the way we found it -----------------------------------
b1_teardown
trap cleanup EXIT
relaunch_browser
