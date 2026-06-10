#!/usr/bin/env bash
# Aether Wave-2 research swarm driver.
# Drives the 20-team feynman fleet via agent-manager: start -> approve plan ->
# wait for autonomous completion -> record status. Runs teams in waves to keep
# web-search concurrency sane. Designed to run in the background.
#
#   bash scripts/run_fleet.sh            # all teams, waves of 5
#   CONCURRENCY=4 bash scripts/run_fleet.sh
set -u

REPO=/home/devsupreme/work/aether-browser
export REPO_ROOT="$REPO"
AM=(python3 /home/devsupreme/.claude/skills/agent-manager/scripts/main.py)
STATUS="$REPO/docs/research-v2/fleet-status.tsv"
LOG="$REPO/docs/research-v2/fleet-run.log"
CONCURRENCY="${CONCURRENCY:-5}"
PLAN_TIMEOUT="${PLAN_TIMEOUT:-180}"      # max sec to wait for the plan/approval gate
RUN_TIMEOUT="${RUN_TIMEOUT:-2400}"       # max sec for one team's research (40 min)
POLL="${POLL:-25}"                       # poll interval (sec)

# agent short-names in dependency-free order (segments, competitive, market, technical, synthesis)
TEAMS=(
  seg-power-users seg-knowledge-workers seg-neurodivergent-adhd seg-privacy-advocates seg-ai-agent-builders
  comp-ai-browsers comp-power-user-browsers comp-customization-forks comp-privacy-browsers comp-ai-ext-agentinfra comp-knowledge-focus-tools
  mkt-browser-trends mkt-adhd-econ-evidence mkt-local-first-ai mkt-automation-sync
  tech-engine-decision tech-ai-control-ipc tech-selfhost-p2p-sync
  syn-whitespace-gaps syn-redteam-risk
)

ts() { date '+%Y-%m-%dT%H:%M:%S'; }
log() { echo "[$(ts)] $*" | tee -a "$LOG"; }

# tmux session name for an agent short-name -> agent-emp-NNNN (truncated by tmux)
session_of() {
  local name="$1" id
  id=$(grep -l "^name: ${name}$" "$REPO"/agents/EMP_*.md | head -1 | sed -E 's#.*/(EMP_[0-9]+)\.md#\1#')
  echo "agent-$(printf '%s' "$id" | tr 'A-Z_' 'a-z-')"   # EMP_0001 -> agent-emp-0001
}

pane() { tmux capture-pane -p -t "$1" -S -12 2>/dev/null; }

is_running() { tmux ls -F '#{session_name}' 2>/dev/null | grep -qx "$1"; }

set_status() {  # name  state  note
  printf '%s\t%s\t%s\t%s\n' "$(ts)" "$1" "$2" "${3:-}" >> "$STATUS"
}

APPROVE="Approved — proceed with the full research now. Do not ask for any further confirmation. Execute all rounds autonomously, verify every claim against a source URL, and write the final cited brief into outputs/ when complete."

# Start one team and push it past the approval gate.
launch_team() {
  local name="$1" sess; sess="$(session_of "$name")"
  if is_running "$sess"; then
    # already running: only approve if it's still parked at the plan gate, never re-approve a working/done run
    if pane "$sess" | grep -qi "AWAITING APPROVAL"; then
      log "$name: pre-existing session at approval gate — approving"
      "${AM[@]}" send "$name" "$APPROVE" >>"$LOG" 2>&1
    else
      log "$name: pre-existing session in-flight ($sess) — monitoring only"
    fi
    set_status "$name" launched "pre-existing"
    return 0
  fi
  log "$name: starting via agent-manager"
  "${AM[@]}" start "$name" >>"$LOG" 2>&1
  # wait for the plan/approval gate
  local waited=0
  while (( waited < PLAN_TIMEOUT )); do
    local p; p="$(pane "$sess")"
    if echo "$p" | grep -qiE "AWAITING APPROVAL|Type your message"; then break; fi
    sleep 5; waited=$((waited+5))
  done
  log "$name: approving plan (waited ${waited}s)"
  "${AM[@]}" send "$name" "$APPROVE" >>"$LOG" 2>&1
  set_status "$name" launched "approved"
}

# Block until a team finishes its research (idle after having worked) or times out.
wait_team() {
  local name="$1" sess; sess="$(session_of "$name")"
  local waited=0 saw_working=0 idle_streak=0
  while (( waited < RUN_TIMEOUT )); do
    if ! is_running "$sess"; then
      log "$name: session ended"; set_status "$name" done "session-exited"; return 0
    fi
    local p; p="$(pane "$sess")"
    if echo "$p" | grep -q "Working\.\.\."; then
      saw_working=1; idle_streak=0
    elif echo "$p" | grep -q "Type your message"; then
      idle_streak=$((idle_streak+1))   # count idle regardless; fast-path still gates on saw_working
    fi
    # done if it worked then went idle, OR if it's been solidly idle (early-finisher we caught already-idle)
    if (( saw_working && idle_streak >= 3 )) || (( idle_streak >= 6 )); then
      log "$name: completed (idle after work=${saw_working}, streak=${idle_streak}, ${waited}s)"; set_status "$name" done "completed"; return 0
    fi
    sleep "$POLL"; waited=$((waited+POLL))
  done
  log "$name: TIMEOUT after ${waited}s — leaving session for inspection"
  set_status "$name" timeout "ran ${waited}s"
  return 1
}

main() {
  mkdir -p "$REPO/docs/research-v2"
  # optional: restrict to a subset of teams passed as args (e.g. resume from a later wave)
  if (( $# > 0 )); then TEAMS=("$@"); fi
  printf '# ts\tname\tstate\tnote\n' >> "$STATUS"
  log "=== Aether Wave-2 fleet start: ${#TEAMS[@]} teams, concurrency=${CONCURRENCY} ==="
  local i=0
  while (( i < ${#TEAMS[@]} )); do
    local wave=("${TEAMS[@]:i:CONCURRENCY}")
    log "--- wave: ${wave[*]} ---"
    for t in "${wave[@]}"; do launch_team "$t"; sleep 3; done
    # wait for the whole wave to finish before the next (keeps web concurrency bounded)
    for t in "${wave[@]}"; do wait_team "$t"; done
    i=$((i+CONCURRENCY))
  done
  log "=== fleet complete ==="
  # quick harvest index: map agents to whatever briefs now exist in outputs/
  ls -1t "$REPO"/outputs/*.md 2>/dev/null | head -40 >> "$LOG"
  log "ALL_DONE"
}

main "$@"
