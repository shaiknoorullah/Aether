// Aether modal key engine — pure decision logic, no DOM, no Services, no timers.
// The chrome glue (aether.uc.js) translates keydown events into plain
// descriptors {key, ctrl, alt, meta}, feeds them here, and applies the
// returned decision:
//   {kind: "action", command, args}
//                               consume the event, dispatch the command with
//                               its arguments (always an array, empty for a
//                               plain binding; hint keys additionally carry
//                               the pressed char as .key)
//   {kind: "await_arg", command}
//                               consume; the binding ends in "<char>" and the
//                               NEXT key supplies its one argument. Exactly one
//                               action follows, or the wait is cancelled by
//                               Escape, by handleTimeout(), or by a key that is
//                               not a character.
//   {kind: "pending", buffer}   consume; glue schedules the pending timeout
//   {kind: "passthrough"}       Firefox/content gets the event untouched
//   {kind: "swallow"}           consume, do nothing (normal-mode printables
//                               never reach content)
// The glue owns setTimeout and injects expiry via handleTimeout().
//
// Modes: normal | insert | hint | palette | panel. Reserved chords are ours in
// every one of them — that is the spike's core proof and it holds per-mode.

// Commands that move the engine into a mode when they fire.
const MODE_FOR_COMMAND = {
  insert: "insert",
  hints: "hint",
  palette: "palette",
  // r4/r5: every builtin that opens a panel surface. A mod's own panel command
  // calls setMode("panel") from the glue instead.
  tabs: "panel",
  settings: "panel",
  describe: "panel",
};

// The panel's keyboard contract, identical for every panel forever: typing
// filters (printables pass through to the search input, as in palette mode)
// while movement, marking and acting are ours. Ctrl+n / Ctrl+p are absent on
// purpose — Ctrl+n is a reserved chord and Ctrl+p is Firefox's print.
const PANEL_KEYS = {
  ArrowDown: "panel_next",
  ArrowUp: "panel_prev",
  Tab: "panel_cycle", // cycle the actions for the selected row
  Enter: "panel_run", // primary action on the selection
};

// Marking is Ctrl+Space: Space itself has to keep typing a character while the
// search input has focus.
const PANEL_MARK_KEYS = new Set([" ", "Space", "Spacebar"]);

// A keymap value that ends in this suffix captures the next keystroke as its
// single argument: "m" = "mark_set<char>".
const ARG_SUFFIX = "<char>";

// parseBinding("tab_pin_goto 1") -> {command: "tab_pin_goto", args: ["1"],
// awaitsArg: false}; parseBinding("mark_set<char>") -> {command: "mark_set",
// args: [], awaitsArg: true}. Exported because which-key (r3) and the panel
// (r4) must read a binding exactly the way the engine does. Never throws — a
// hostile or empty value yields an empty command, which is inert.
export function parseBinding(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  const awaitsArg = raw.endsWith(ARG_SUFFIX);
  const body = awaitsArg ? raw.slice(0, -ARG_SUFFIX.length).trim() : raw;
  const [command = "", ...args] = body.split(/\s+/).filter(Boolean);
  return { command, args, awaitsArg };
}

function printable(key) {
  return key.length === 1;
}

export function createEngine(config) {
  const normal = config.keymap?.normal ?? {};
  const reserved = config.keymap?.reserved ?? {};
  // `awaiting` holds the command of an outstanding await_arg, null otherwise.
  const state = { mode: "normal", buffer: "", awaiting: null, awaitingArgs: [] };

  function comboFor(d) {
    let mods = "";
    if (d.ctrl) mods += "C-";
    if (d.alt) mods += "A-";
    if (d.meta) mods += "M-";
    if (!mods) return null;
    return mods + (printable(d.key) ? d.key.toLowerCase() : d.key);
  }

  function action(command, args = []) {
    state.buffer = "";
    state.awaiting = null;
    state.awaitingArgs = [];
    if (MODE_FOR_COMMAND[command]) state.mode = MODE_FOR_COMMAND[command];
    return { kind: "action", command, args };
  }

  // A bound sequence resolved: dispatch it, or start waiting for its argument.
  function fire(value) {
    const { command, args, awaitsArg } = parseBinding(value);
    if (!command) {
      // A broken binding is inert rather than a dispatch of nothing.
      state.buffer = "";
      state.awaiting = null;
      return { kind: "swallow" };
    }
    if (!awaitsArg) return action(command, args);
    state.buffer = "";
    state.awaiting = command;
    state.awaitingArgs = args;
    return { kind: "await_arg", command };
  }

  return {
    get mode() {
      return state.mode;
    },
    get buffer() {
      return state.buffer;
    },
    // The command waiting for its one character, or null.
    get awaiting() {
      return state.awaiting;
    },

    setMode(mode) {
      state.mode = mode;
      state.buffer = "";
      state.awaiting = null;
      state.awaitingArgs = [];
    },

    handleKey(d) {
      const modified = d.ctrl || d.alt || d.meta;

      // Reserved chords are ours in every mode — the spike's core proof.
      const combo = comboFor(d);
      if (combo && reserved[combo]) return action(reserved[combo]);

      // Escape always lands in normal, buffer cleared, nothing dispatched for
      // an outstanding await.
      if (d.key === "Escape") {
        state.buffer = "";
        state.awaiting = null;
        state.awaitingArgs = [];
        state.mode = "normal";
        return { kind: "action", command: "esc", args: [] };
      }

      // An outstanding await_arg captures exactly one character. Anything that
      // is not a bare character cancels the wait and is handled as it would
      // have been — a swallowed argument is worse than no mark.
      if (state.awaiting) {
        const command = state.awaiting;
        const args = state.awaitingArgs;
        state.awaiting = null;
        state.awaitingArgs = [];
        if (!modified && printable(d.key)) return action(command, [...args, d.key]);
        return { kind: "passthrough" };
      }

      switch (state.mode) {
        case "insert":
          return { kind: "passthrough" };

        case "hint":
          if (!modified && printable(d.key)) {
            return { kind: "action", command: "hint_key", key: d.key, args: [] };
          }
          return { kind: "passthrough" };

        case "palette":
          if (!modified && d.key === "Tab") return action("palette_cycle");
          if (!modified && d.key === "Enter") return action("palette_run");
          // Printables (and everything else) belong to the chrome input strip.
          return { kind: "passthrough" };

        case "panel":
          if (d.ctrl && !d.alt && !d.meta && PANEL_MARK_KEYS.has(d.key)) {
            return action("panel_mark");
          }
          if (!modified && PANEL_KEYS[d.key]) return action(PANEL_KEYS[d.key]);
          // Printables (and everything else) belong to the panel's search
          // input — without this the panel opens and eats every keystroke.
          return { kind: "passthrough" };

        default: {
          // normal: modified-but-unreserved chords and non-printables are
          // Firefox's; printables are always ours, matched or not.
          if (modified || !printable(d.key)) return { kind: "passthrough" };
          const seq = state.buffer + d.key;
          if (normal[seq]) return fire(normal[seq]);
          if (Object.keys(normal).some(k => k.startsWith(seq) && k !== seq)) {
            state.buffer = seq;
            return { kind: "pending", buffer: seq };
          }
          state.buffer = "";
          return { kind: "swallow" };
        }
      }
    },

    // Glue injects pending expiry; no timers live in this module. The same
    // window cancels an outstanding await_arg — 'm' alone must not sit there
    // waiting to eat the next character forever.
    handleTimeout() {
      state.buffer = "";
      state.awaiting = null;
      state.awaitingArgs = [];
      return { kind: "swallow" };
    },
  };
}
