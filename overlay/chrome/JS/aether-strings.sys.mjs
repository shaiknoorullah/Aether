// Aether EF copy (f6) — every user-visible focus-session string lives here
// and nowhere else. The non-shaming guarantee is mechanical: the lexicon
// sweep in f6-strings.test.mjs asserts no banned stem appears in any literal
// across the overlay, and this module is where the f6 surface is audited.
// Copy is factual echo only — no durations on end, no summaries, no judgment.

// Transient statusbar message for :focus <task>.
export function focusStartedMessage(task) {
  return `focus: ${task}`;
}

// Transient message for :done and the quiet workspace-switch end — an echo
// of the task, never a duration, never a report card.
export function doneMessage(task) {
  return `done: ${task}`;
}

// :done with no session — neutral, nothing else happens.
export const NO_SESSION_MESSAGE = "no focus session";

// Statusbar focus widget: task plus calm elapsed.
export function focusWidgetText(task, elapsed) {
  return `${task} · ${elapsed}`;
}

// --- f7: local AI sidebar copy ----------------------------------------------

// The calm off-state panel line: what's off and the way back on. Informational
// only — no alarm, no urging.
export const AI_OFF_PANEL_MESSAGE = "ai is off — :ai_on enables it";

// Transient statusbar messages for :ai_on / :ai_off.
export const AI_ON_MESSAGE = "ai: on";
export const AI_OFF_MESSAGE = "ai: off";

// One calm transcript line when the gateway can't be reached (or the stream
// drops) — names the configured gateway, no retry pressure.
export function gatewayErrorMessage(baseUrl) {
  return `gateway not reachable at ${baseUrl}`;
}
