# f7 scenario: local AI sidebar — streaming from a loopback mock gateway,
# hard kill switch. Spec §5 visual states:
#   1. sidebar open with the prompt box focused, themed, "ai on" in the
#      statusbar (test dotfile sets [ai] enabled = true at the mock's port)
#   2. streamed mock reply rendered in the transcript (SSE replay of a canned
#      multi-chunk reply; the mock logs every request, so the shot is backed
#      by at least one logged POST — the reply provably came over the wire)
#   3. kill switch off — :ai_off, then a send attempt anyway: the panel shows
#      the calm disabled state, "ai off" in the statusbar, and the mock's
#      request log gains ZERO entries after the toggle (no network, proven,
#      not implied)
# Runs inside run.sh via source — shot/key/keys/type_text/nav/wait_title/
# relaunch_browser are available. Shots numbered 80+ to sort after f6's 70-75.
# The mock gateway is a one-file node server on 127.0.0.1 (loopback only —
# the only host [ai] may point at); it is torn down on scenario exit and the
# user's real dotfile is restored (f3 pattern), so f1–f6 keep passing.

AETHER_USER_CONFIG_DIR="$HOME/.config/aether"
AETHER_USER_CONFIG="$AETHER_USER_CONFIG_DIR/aether.toml"
F7_CONFIG_BACKUP="$SHOTS/aether.toml.f7-backup"
F7_MOCK_PORT="${AETHER_F7_MOCK_PORT:-11733}"
F7_MOCK_JS="$SHOTS/f7-mock-gateway.mjs"
F7_MOCK_LOG="$SHOTS/f7-mock-requests.log"
F7_MOCK_OUT="$SHOTS/f7-mock-gateway.out"
F7_MOCK_PID=""

# --- teardown: kill the mock, put the real dotfile back ----------------------
f7_teardown() {
  if [[ -n "$F7_MOCK_PID" ]]; then
    kill "$F7_MOCK_PID" 2>/dev/null || true
    wait "$F7_MOCK_PID" 2>/dev/null || true
    F7_MOCK_PID=""
  fi
  if [[ -f "$F7_CONFIG_BACKUP" ]]; then
    mv "$F7_CONFIG_BACKUP" "$AETHER_USER_CONFIG"
  else
    rm -f "$AETHER_USER_CONFIG"
  fi
}
# (if-form, not `&&` — run.sh runs with set -e and a false test would abort)
if [[ -f "$AETHER_USER_CONFIG" ]]; then
  cp "$AETHER_USER_CONFIG" "$F7_CONFIG_BACKUP"
fi
# Sourced into run.sh's shell: chain onto its cleanup trap, restore it later.
trap 'f7_teardown; cleanup' EXIT

# --- the one-file mock gateway -----------------------------------------------
# SSE replay of a canned multi-chunk reply on POST /v1/chat/completions;
# appends one JSON line per request (any request) to the log file. No deps.
cat > "$F7_MOCK_JS" <<'EOF'
import { createServer } from "node:http";
import { appendFileSync } from "node:fs";

const [port, logPath] = process.argv.slice(2);
const REPLY = [
  "Hello from the ", "loopback mock ", "gateway. ",
  "This reply ", "streamed into the ", "Aether sidebar ",
  "one SSE chunk ", "at a time.",
];

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
        if (i < REPLY.length) {
          res.write(
            "data: " +
              JSON.stringify({ choices: [{ delta: { content: REPLY[i++] } }] }) +
              "\n\n",
          );
        } else {
          clearInterval(timer);
          res.write("data: [DONE]\n\n");
          res.end();
        }
      }, 120);
      res.on("close", () => clearInterval(timer));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("mock gateway: only POST .../chat/completions here\n");
    }
  });
}).listen(Number(port), "127.0.0.1", () => {
  console.log(`mock gateway listening on 127.0.0.1:${port}`);
});
EOF

: > "$F7_MOCK_LOG"
node "$F7_MOCK_JS" "$F7_MOCK_PORT" "$F7_MOCK_LOG" > "$F7_MOCK_OUT" 2>&1 &
F7_MOCK_PID=$!
# Wait for the listen line on stdout (no HTTP probe — probes would pollute the
# request log the zero-entries assertion counts).
f7_mock_ready=""
for _ in $(seq 1 40); do
  if grep -q "listening on 127.0.0.1:$F7_MOCK_PORT" "$F7_MOCK_OUT" 2>/dev/null; then
    f7_mock_ready=1
    break
  fi
  sleep 0.25
done
[[ -n "$f7_mock_ready" ]] || { echo "[f7] mock gateway never came up — see $F7_MOCK_OUT" >&2; exit 3; }

# f7_log_count — request-log line count (0 when the file is empty)
f7_log_count() { grep -c . "$F7_MOCK_LOG" 2>/dev/null || true; }

# --- test dotfile: switch ON, gateway at the mock ----------------------------
# Only [ai] is set; keymap (a = "ai") and the default widget order (incl. the
# ai slot) come from the builtins under test.
mkdir -p "$AETHER_USER_CONFIG_DIR"
cat > "$AETHER_USER_CONFIG" <<EOF
# f7 visual-test dotfile: local AI sidebar against the mock gateway.
[ai]
enabled = true
base_url = "http://127.0.0.1:$F7_MOCK_PORT/v1"
model = "aether-visual-test"
EOF
relaunch_browser

PLAYGROUND="file://$HERE/pages/playground.html"
nav "$PLAYGROUND?f7-ai" 3
wait_title "Aether playground" 10 || {
  echo "[f7] playground nav did not land, retrying"
  key Escape
  nav "$PLAYGROUND?f7-ai" 5
}
wait_title "Aether playground" 15

# --- state 1: a opens the sidebar, prompt focused, "ai on" in the bar --------
key a
sleep 1.5
shot 80-f7-sidebar-open-ai-on

# --- state 2: type, Enter, watch the canned reply stream in ------------------
# Opening focused the prompt, so the keys below land in it, not in NORMAL.
type_text "hello over the loopback"
key Return
sleep 6   # mock streams 8 content chunks at 120ms + fetch overhead
shot 81-f7-streamed-reply
F7_SENT="$(f7_log_count)"
if [[ "${F7_SENT:-0}" -lt 1 ]]; then
  echo "[f7] the mock never saw a request — the reply shot cannot be a stream" >&2
  exit 3
fi
{
  echo "# mock request log after the first send (state 2):"
  cat "$F7_MOCK_LOG"
} > "$SHOTS/81-f7-streamed-reply-evidence.txt"

# --- reserved chords are ours WHILE the prompt has focus ---------------------
# The prompt follows the urlbar/insert rule: unreserved keys pass through to
# it, but Ctrl+T/Ctrl+W stay intercepted (spec §2; the f0/f1 guarantee).
# Ctrl+T typed into the focused prompt must open OUR new tab (summoned
# nav-bar, INSERT badge) — not Firefox's native one; Ctrl+W must close it via
# the workspace-safe path and land back on the playground tab.
key ctrl+t
sleep 1.5
shot 81b-f7-ctrl-t-in-prompt
key ctrl+w
sleep 1.5
shot 81c-f7-ctrl-w-back
wait_title "Aether playground" 10

# --- state 3: :ai_off — hard switch, zero network, calm panel ----------------
# Esc: prompt -> NORMAL, panel stays open (spec: Esc returns focus, a closes).
key Escape
key colon
type_text "ai_off"
key Return
sleep 1
shot 82-f7-ai-off-toggle
key Escape
sleep 1

# Close and reopen the panel: it must come back in the calm off-state (prompt
# disabled, one neutral line, "ai off" in the statusbar).
key a
sleep 0.5
key a
sleep 1.5
shot 83-f7-kill-switch-off-panel

# Send attempt anyway. If the off-state is right the prompt takes no input;
# if it wrongly still took input, the glue's assertOn gate must still keep
# the socket closed — either way the log must not move. ('h' is unbound in
# NORMAL and 'i'/Return are harmless, so the attempt is safe if focus fell
# through to content.)
F7_OFF_BASELINE="$(f7_log_count)"
type_text "hi"
key Return
sleep 3
key Escape
F7_OFF_AFTER="$(f7_log_count)"
if [[ "${F7_OFF_AFTER:-0}" -ne "${F7_OFF_BASELINE:-0}" ]]; then
  echo "[f7] kill switch leaked: request log grew $F7_OFF_BASELINE -> $F7_OFF_AFTER while off" >&2
  exit 3
fi
{
  echo "# kill-switch proof: mock request-log line count before/after the off-state send attempt"
  echo "before: $F7_OFF_BASELINE"
  echo "after:  $F7_OFF_AFTER"
  echo "# (state 2 proved the log DOES grow when the switch is on — this zero is not vacuous)"
} > "$SHOTS/84-f7-kill-switch-no-network-evidence.txt"
shot 84-f7-kill-switch-no-network

# --- leave the harness the way we found it -----------------------------------
f7_teardown
trap cleanup EXIT
relaunch_browser
