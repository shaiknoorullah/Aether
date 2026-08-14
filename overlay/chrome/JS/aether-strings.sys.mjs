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

// --- b1: site boosts copy ---------------------------------------------------

// Transient confirmation after :zap hides an element — the selector, factually.
export function zappedMessage(selector) {
  return `zapped: ${selector}`;
}

// Transient statusbar messages for :boost_on / :boost_off.
export function boostOnMessage(domain) {
  return `boost on: ${domain}`;
}

export function boostOffMessage(domain) {
  return `boost off: ${domain}`;
}

// :boost_on/:boost_off with no boost file for this host — neutral, no alarm.
export function noBoostMessage(host) {
  return `no boost for: ${host}`;
}

// --- b2: AI CSS boosts copy -------------------------------------------------

// The preview panel's distinct header — this is a boost review, not a chat.
export function boostPreviewHeader(domain) {
  return `boost preview — ${domain}`;
}

// Transient confirmation after Accept writes the dotfile.
export function boostWrittenMessage(domain) {
  return `boost written: ${domain}`;
}

// Dismissing is a normal outcome, not an error — neutral, factual.
export const BOOST_DISMISSED_MESSAGE = "boost dismissed";

// Strip summary: one line per rule the acceptance gate removed, and the calm
// empty state when nothing needed stripping.
export function strippedRuleLine(rule) {
  return `stripped: ${rule}`;
}

export const NOTHING_STRIPPED_MESSAGE = "nothing stripped";

// :boost on a non-http(s) page — names the scheme, nothing else happens.
export function noBoostHereMessage(scheme) {
  return `no boost here: ${scheme} pages`;
}

// :boost while [boosts] is off — names the way back on, informationally.
export const BOOSTS_OFF_MESSAGE =
  "boosts are off — enabled = true under [boosts] in aether.toml turns them on";

// :boost in a window's first moments, while the boosts-dir scan is still in
// flight — [boosts] is already on, the registry just is not up yet. Factual,
// and distinct from the off-state: saying "boosts are off" here would be
// asserting a falsehood.
export const BOOSTS_STARTING_MESSAGE =
  "boosts are still starting up — :boost again in a moment";

// The reply carried no single fenced CSS block — one calm line, nothing else.
export const BOOST_NO_CSS_MESSAGE = "no single css block in the reply";

// --- r1: live config reload copy ---------------------------------------------
// Every export below takes ONE pre-joined string (never an array), because the
// f6 harness calls each export as fn(task, "34m") and asserts the result is a
// non-empty, lexicon-clean string that echoes its first argument.

// What a reload actually re-applied: reloadedMessage("theme, keymap").
export function reloadedMessage(domains) {
  return `reloaded: ${domains}`;
}

// A reload that changed nothing is a normal outcome, not an error.
export const RELOAD_NO_CHANGE_MESSAGE = "reloaded: nothing changed";

// The domains a reload cannot reach — named, never silently dropped. The glue
// appends this after reloadedMessage: "reloaded: theme — restart for: …".
export function restartRequiredMessage(paths) {
  return `restart for: ${paths}`;
}

// A config file that did not parse: the live config stays live, and the line is
// named so it can be fixed. A typo is not a failing grade — just a line number.
export function configUnchangedMessage(line) {
  return `config unchanged: line ${line}`;
}

// --- r2: style layer copy ----------------------------------------------------

// Per-key validation: the named keys fell back to their defaults, everything
// else applied. One calm line, the keys pre-joined by the caller.
export function styleRejectedMessage(keys) {
  return `style: ${keys} ignored`;
}

// --- r3/r4: which-key and panel copy -----------------------------------------

// The truncation row under a capped list: "+7 more".
export function moreRow(count) {
  return `+${count} more`;
}

// A panel source with nothing in it — neutral, no urging.
export const PANEL_EMPTY_MESSAGE = "nothing to list here";

// Rows can change under an open panel. Marks resolve by row key, so a mark
// whose row is gone is dropped and counted — never retargeted at a neighbour.
export function droppedMarksMessage(count) {
  return `marks dropped: ${count}`;
}

// Confirmation for m<char>, and the neutral answer when '<char> has no tab.
export function markSetMessage(char) {
  return `mark: ${char}`;
}

export function noMarkMessage(char) {
  return `no mark: ${char}`;
}

// --- r5: settings panel copy -------------------------------------------------

// A value written to the panel-owned local file, and one reset back to the
// dotfile (or the builtin default).
export function settingSavedMessage(path) {
  return `saved: ${path}`;
}

export function settingResetMessage(path) {
  return `reset: ${path}`;
}

// A value the loader would not accept is refused before it is written, so the
// panel can never author a config that does not load.
export function settingRejectedMessage(key) {
  return `not applied: ${key}`;
}

// The generated header of aether.local.toml. Deleting the file is the undo, and
// the file says so itself.
export const LOCAL_CONFIG_HEADER =
  "# aether.local.toml — written by :settings, machine-local.\n" +
  "# aether.toml is yours and is never written by Aether. This file layers on\n" +
  "# top of it. Delete it to go back to the dotfile.\n";
