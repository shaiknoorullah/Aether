// Aether focus sessions (f6) — pure session model, elapsed formatting, and
// the notification-suppression predicate. No Services/prefs/DOM and no
// Date.now; time arrives as nowMs arguments so tests inject clocks. A session
// is {task, workspace, startedAt}: started by naming a task, ended only by
// :done or a workspace switch. Never a countdown, never auto-expiry, never a
// stat — the pref flip and all messaging live in aether.uc.js glue.

// Start a session bound to the active workspace. Starting over an active
// session is glue overwriting its field with this fresh result — a switch,
// not an error shape.
export function startSession(task, workspace, nowMs) {
  return { task: String(task).trim(), workspace, startedAt: nowMs };
}

// End a session. {ended: session} for an active one; {ended: null} with no
// session (glue's neutral-copy path). Never throws.
export function endSession(session) {
  return { ended: session ?? null };
}

// A switch to a different workspace ends the session (ended rides along for
// the quiet done-message); the session's own workspace is a no-op; no
// session → both null.
export function onWorkspaceSwitch(session, newWorkspace) {
  if (!session) return { session: null, ended: null };
  if (session.workspace === newWorkspace) return { session, ended: null };
  return { session: null, ended: session };
}

// A rename is not a context switch: a session bound to the renamed workspace
// follows the new name. Without this the binding goes stale — a later switch
// to the workspace the user never left would falsely end the session (and a
// new workspace reusing the old name would falsely keep it alive).
export function onWorkspaceRename(session, oldName, newName) {
  if (!session || session.workspace !== oldName) return session;
  return { ...session, workspace: newName };
}

// Calm, factual elapsed: "<1m" for the first minute (a seconds tick is a
// timer), then floored minutes, then "2h 7m" from one hour. No zero-pad, no
// cap, no special casing — long is just long.
export function formatElapsed(startedAt, nowMs) {
  const mins = Math.floor((nowMs - startedAt) / 60_000);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// True only for (active session ∧ [focus] quiet_notifications). The pref
// itself is glue's business.
export function notificationsSuppressed(session, config) {
  return Boolean(session) && config?.focus?.quiet_notifications === true;
}
