# b2 scenario: AI CSS boosts — :boost streams a canned reskin from the f7-style
# mock gateway into a preview, review-gated, written through the b1 store.
# Spec overlay/specs/b2-ai-css-boosts.md §5 visual states:
#   1. preview panel streaming the generated CSS — :boost on the served page,
#      shot mid/post-stream: distinct "boost preview" header, CSS text in the
#      transcript, the page itself UNCHANGED (baseline shot for comparison)
#   2. strip summary visible before accept — stream done: the stripped rules
#      listed (the canned reply deliberately smuggles one @import and one
#      remote url()), review bar showing Enter/Esc, still nothing applied
#   3. accepted boost applied — Enter: page loudly recolored, "boost written:
#      127.0.0.1" in the statusbar; file proof that the dotfile exists with
#      the dated generated header and no surviving @import, and request-log
#      proof that the skeleton carried NO page text (sentinel absent) while a
#      real selector DID go out (proven, not implied)
#   4. kill switch off — :ai_off, then :boost: the calm f7 off-state, "ai off"
#      in the statusbar, mock log gained ZERO entries (the switch is hard here
#      too)
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title/
# relaunch_browser are available. Shots numbered 96+ to sort after b1's 90-95.
#
# Boosts only apply to http(s) pages, so a one-file static server serves the
# b2 page on 127.0.0.1 (b1 pattern); the mock gateway is the f7 pattern
# extended with a canned :boost reply — one fenced CSS block that loudly
# recolors the page. Both live on loopback (the only host [ai] may point at),
# both torn down on exit; the user's real dotfile is restored (f3/f7/b1
# pattern) so every other scenario keeps passing. The f7 scenario's own mock
# keeps its existing canned chat reply untouched — this is a separate mock.

AETHER_USER_CONFIG_DIR="$HOME/.config/aether"
AETHER_USER_CONFIG="$AETHER_USER_CONFIG_DIR/aether.toml"
B2_CONFIG_BACKUP="$SHOTS/aether.toml.b2-backup"
B2_MOCK_PORT="${AETHER_B2_MOCK_PORT:-11744}"
B2_PAGE_PORT="${AETHER_B2_PAGE_PORT:-11799}"
B2_MOCK_JS="$SHOTS/b2-mock-gateway.mjs"
B2_MOCK_LOG="$SHOTS/b2-mock-requests.log"
B2_MOCK_OUT="$SHOTS/b2-mock-gateway.out"
B2_SERVER_JS="$SHOTS/b2-static-server.mjs"
B2_SERVER_OUT="$SHOTS/b2-static-server.out"
B2_PAGE_URL="http://127.0.0.1:$B2_PAGE_PORT/b2.html"
B2_BOOSTS_DIR="$SHOTS/b2-boosts"
B2_BOOST_FILE="$B2_BOOSTS_DIR/127.0.0.1.css"
# The page carries this sentinel text — the request log must never see it.
B2_SENTINEL="B2-SENTINEL-7f3d9"
B2_MOCK_PID=""
B2_SERVER_PID=""

# --- teardown: kill both servers, put the real dotfile back ------------------
b2_teardown() {
  if [[ -n "$B2_MOCK_PID" ]]; then
    kill "$B2_MOCK_PID" 2>/dev/null || true
    wait "$B2_MOCK_PID" 2>/dev/null || true
    B2_MOCK_PID=""
  fi
  if [[ -n "$B2_SERVER_PID" ]]; then
    kill "$B2_SERVER_PID" 2>/dev/null || true
    wait "$B2_SERVER_PID" 2>/dev/null || true
    B2_SERVER_PID=""
  fi
  if [[ -f "$B2_CONFIG_BACKUP" ]]; then
    mv "$B2_CONFIG_BACKUP" "$AETHER_USER_CONFIG"
  else
    rm -f "$AETHER_USER_CONFIG"
  fi
}
# (if-form, not `&&` — run.sh runs with set -e and a false test would abort)
if [[ -f "$AETHER_USER_CONFIG" ]]; then
  cp "$AETHER_USER_CONFIG" "$B2_CONFIG_BACKUP"
fi
# Sourced into run.sh's shell: chain onto its cleanup trap, restore it later.
trap 'b2_teardown; cleanup' EXIT

# --- the mock gateway: canned :boost reply, request-logging ------------------
# SSE replay of one fenced CSS block that LOUDLY recolors the b2 page, with
# one @import and one remote url() smuggled in so the strip summary is
# non-empty. Appends one JSON line per request (any request) to the log. No
# deps.
cat > "$B2_MOCK_JS" <<'EOF'
import { createServer } from "node:http";
import { appendFileSync } from "node:fs";

const [port, logPath] = process.argv.slice(2);
const REPLY = [
  "Here is a boost for this page — a loud recolor in your palette.",
  "",
  "```css",
  "/* b2 mock boost: loud recolor */",
  "body { background: #b16286 !important; color: #fbf1c7 !important; }",
  "h1 { color: #fabd2f !important; }",
  "#hero { background: #d65d0e !important; color: #1d2021 !important; border-color: #fabd2f !important; }",
  ".b2-card { background: #458588 !important; color: #ebdbb2 !important; }",
  "@import url(\"https://evil.example/steal.css\");",
  ".beacon { background-image: url(https://evil.example/beacon.png); }",
  "```",
  "",
  "Enjoy the reskin.",
].join("\n");
const CHUNKS = REPLY.match(/[\s\S]{1,24}/g) ?? [];

createServer((req, res) => {
  let body = "";
  req.on("data", c => { body += c; });
  req.on("end", () => {
    appendFileSync(
      logPath,
      JSON.stringify({ t: Date.now(), method: req.method, url: req.url, body }) + "\n",
    );
    if (req.method === "POST" && req.url.endsWith("/chat/completions")) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      });
      res.write('data: {"choices":[{"delta":{"role":"assistant"}}]}\n\n');
      let i = 0;
      const timer = setInterval(() => {
        if (i < CHUNKS.length) {
          res.write(
            "data: " +
              JSON.stringify({ choices: [{ delta: { content: CHUNKS[i++] } }] }) +
              "\n\n",
          );
        } else {
          clearInterval(timer);
          res.write("data: [DONE]\n\n");
          res.end();
        }
      }, 110);
      res.on("close", () => clearInterval(timer));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("mock gateway: only POST .../chat/completions here\n");
    }
  });
}).listen(Number(port), "127.0.0.1", () => {
  console.log(`b2 mock gateway listening on 127.0.0.1:${port}`);
});
EOF

: > "$B2_MOCK_LOG"
node "$B2_MOCK_JS" "$B2_MOCK_PORT" "$B2_MOCK_LOG" > "$B2_MOCK_OUT" 2>&1 &
B2_MOCK_PID=$!
# Wait for the listen line on stdout (no HTTP probe — probes would pollute the
# request log the zero-entries assertion counts).
b2_mock_ready=""
for _ in $(seq 1 40); do
  if grep -q "listening on 127.0.0.1:$B2_MOCK_PORT" "$B2_MOCK_OUT" 2>/dev/null; then
    b2_mock_ready=1
    break
  fi
  sleep 0.25
done
[[ -n "$b2_mock_ready" ]] || { echo "[b2] mock gateway never came up — see $B2_MOCK_OUT" >&2; exit 3; }

# b2_log_count — request-log line count (0 when the file is empty)
b2_log_count() { grep -c . "$B2_MOCK_LOG" 2>/dev/null || true; }

# --- the one-file static server: the page under boost ------------------------
# Light gruvbox page so the canned purple/orange recolor is unmissable. The
# sentinel paragraph is page TEXT — structure may travel to the model, this
# string must not.
cat > "$B2_SERVER_JS" <<EOF
import { createServer } from "node:http";

const [port] = process.argv.slice(2);
const PAGE = \`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aether b2 boost</title>
  <style>
    body { font: 16px system-ui; margin: 2rem; background: #fbf1c7; color: #3c3836; }
    h1 { color: #3c3836; }
    #hero { display: block; padding: 1rem 2rem; margin: 1.5rem 0;
            background: #ebdbb2; color: #3c3836; font-size: 1.3rem;
            border: 6px solid #d5c4a1; }
    .b2-card { padding: 0.75rem 1rem; margin: 0.5rem 0; background: #f2e5bc; }
  </style>
</head>
<body>
  <h1>Aether b2 boost page</h1>
  <div id="hero">HERO — the accepted boost recolors me loudly</div>
  <p class="b2-card">card one — pale until the boost lands</p>
  <p class="b2-card">card two — pale until the boost lands</p>
  <p>$B2_SENTINEL — this page text must never reach the model.</p>
</body>
</html>\`;

createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(PAGE);
}).listen(Number(port), "127.0.0.1", () => {
  console.log(\`b2 static server listening on 127.0.0.1:\${port}\`);
});
EOF

node "$B2_SERVER_JS" "$B2_PAGE_PORT" > "$B2_SERVER_OUT" 2>&1 &
B2_SERVER_PID=$!
b2_server_ready=""
for _ in $(seq 1 40); do
  if grep -q "listening on 127.0.0.1:$B2_PAGE_PORT" "$B2_SERVER_OUT" 2>/dev/null; then
    b2_server_ready=1
    break
  fi
  sleep 0.25
done
[[ -n "$b2_server_ready" ]] || { echo "[b2] static server never came up — see $B2_SERVER_OUT" >&2; exit 3; }

# --- test dotfile: AI on at the mock, boosts dir at the temp dir -------------
# ZERO new TOML keys (spec §2): [ai] and [boosts] already say everything.
# The boosts dir starts EMPTY — the preview must run against a genuinely
# unboosted page, and only Accept creates 127.0.0.1.css.
rm -rf "$B2_BOOSTS_DIR"
mkdir -p "$B2_BOOSTS_DIR"
mkdir -p "$AETHER_USER_CONFIG_DIR"
cat > "$AETHER_USER_CONFIG" <<EOF
# b2 visual-test dotfile: AI CSS boosts against the mock gateway.
[ai]
enabled = true
base_url = "http://127.0.0.1:$B2_MOCK_PORT/v1"
model = "aether-visual-test"

[boosts]
enabled = true
dir = "$B2_BOOSTS_DIR"
EOF

# Config is read at startup only — relaunch so [ai]/[boosts] take effect.
relaunch_browser
nav "$B2_PAGE_URL" 4
wait_title "Aether b2 boost" 15 || {
  echo "[b2] page nav did not land, retrying"
  key Escape
  nav "$B2_PAGE_URL" 5
  wait_title "Aether b2 boost" 15
}

# --- baseline: unboosted page, for the state-1 "page unchanged" comparison ---
shot 96-b2-unboosted-baseline

# --- state 1: :boost — the preview streams, the page stays unchanged ---------
key colon
type_text "boost"
key Return
sleep 2   # skeleton round-trip + first SSE chunks (~28 chunks at 110ms)
shot 97-b2-preview-streaming

# --- state 2: stream done — strip summary + review bar, still nothing applied
sleep 5
shot 98-b2-strip-summary-review-bar
B2_GEN_COUNT="$(b2_log_count)"
if [[ "${B2_GEN_COUNT:-0}" -lt 1 ]]; then
  echo "[b2] the mock never saw a request — the preview cannot be a stream" >&2
  exit 3
fi
# Nothing is applied or written during preview: the dotfile must not exist yet.
if [[ -f "$B2_BOOST_FILE" ]]; then
  echo "[b2] the boost dotfile exists BEFORE accept — preview must never write:" >&2
  cat "$B2_BOOST_FILE" >&2
  exit 3
fi

# --- state 3: Enter accepts — written, applied, loudly recolored -------------
key Return
sleep 2.5
shot 99-b2-accepted-applied

# File proof: Accept created the exact-host dotfile with the dated generated
# header, and the sanitizer stripped the smuggled fetch vectors on the way in.
[[ -f "$B2_BOOST_FILE" ]] || {
  echo "[b2] Accept wrote no boost dotfile at $B2_BOOST_FILE" >&2
  ls -la "$B2_BOOSTS_DIR" >&2 || true
  exit 3
}
grep -qE 'boost generated [0-9]{4}-[0-9]{2}-[0-9]{2}' "$B2_BOOST_FILE" || {
  echo "[b2] boost dotfile carries no dated generated header:" >&2
  cat "$B2_BOOST_FILE" >&2
  exit 3
}
if grep -q '@import' "$B2_BOOST_FILE"; then
  echo "[b2] the smuggled @import survived into the dotfile:" >&2
  cat "$B2_BOOST_FILE" >&2
  exit 3
fi
if grep -q 'evil.example' "$B2_BOOST_FILE"; then
  echo "[b2] a remote beacon URL survived into the dotfile:" >&2
  cat "$B2_BOOST_FILE" >&2
  exit 3
fi
{
  echo "# $B2_BOOST_FILE after Accept (generated header + sanitized CSS):"
  cat "$B2_BOOST_FILE"
} > "$SHOTS/99-b2-boost-dotfile-evidence.txt"

# Request-log proof: the skeleton carried NO page text (sentinel absent) while
# a real selector DID go out (the skeleton is structure, not content).
if grep -q "$B2_SENTINEL" "$B2_MOCK_LOG"; then
  echo "[b2] PAGE TEXT LEAKED: the sentinel appears in a request body" >&2
  grep "$B2_SENTINEL" "$B2_MOCK_LOG" >&2
  exit 3
fi
grep -q 'hero' "$B2_MOCK_LOG" || {
  echo "[b2] no selector in the request body — did the skeleton go out at all?" >&2
  cat "$B2_MOCK_LOG" >&2
  exit 3
}
# One-shot per invocation: accepting must not have fired another request.
B2_AFTER_ACCEPT="$(b2_log_count)"
if [[ "${B2_AFTER_ACCEPT:-0}" -ne "${B2_GEN_COUNT:-0}" ]]; then
  echo "[b2] accept triggered extra requests: $B2_GEN_COUNT -> $B2_AFTER_ACCEPT (generation is one-shot)" >&2
  exit 3
fi
{
  echo "# mock request log after accept — sentinel '$B2_SENTINEL' absent, selector present:"
  cat "$B2_MOCK_LOG"
} > "$SHOTS/99-b2-request-log-evidence.txt"
key Escape
sleep 1

# --- state 4: kill switch off — :boost shows the calm f7 off-state, zero net -
key colon
type_text "ai_off"
key Return
sleep 1
B2_OFF_BASELINE="$(b2_log_count)"
key colon
type_text "boost"
key Return
sleep 3
shot 99b-b2-kill-switch-off
B2_OFF_AFTER="$(b2_log_count)"
if [[ "${B2_OFF_AFTER:-0}" -ne "${B2_OFF_BASELINE:-0}" ]]; then
  echo "[b2] kill switch leaked: request log grew $B2_OFF_BASELINE -> $B2_OFF_AFTER while off" >&2
  exit 3
fi
{
  echo "# kill-switch proof: mock request-log line count before/after :boost while off"
  echo "before: $B2_OFF_BASELINE"
  echo "after:  $B2_OFF_AFTER"
  echo "# (state 1 proved the log DOES grow when the switch is on — this zero is not vacuous)"
} > "$SHOTS/99b-b2-kill-switch-no-network-evidence.txt"
key Escape
sleep 1

# The :ai_off above persisted the switch off (that IS the f7 contract) — flip
# it back on so the profile-shared persisted pref cannot skew the f7 scenario
# that runs later in the same harness pass.
key colon
type_text "ai_on"
key Return
sleep 1
key Escape

# --- leave the harness the way we found it -----------------------------------
b2_teardown
trap cleanup EXIT
relaunch_browser
