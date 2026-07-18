// Aether modal key engine — pure decision logic, no DOM, no Services, no timers.
// The chrome glue (aether.uc.js) translates keydown events into plain
// descriptors {key, ctrl, alt, meta}, feeds them here, and applies the
// returned decision:
//   {kind: "action", command}   consume the event, dispatch the command
//                               (hint keys carry the pressed char as .key)
//   {kind: "pending", buffer}   consume; glue schedules the pending timeout
//   {kind: "passthrough"}       Firefox/content gets the event untouched
//   {kind: "swallow"}           consume, do nothing (normal-mode printables
//                               never reach content)
// The glue owns setTimeout and injects expiry via handleTimeout().

// Commands that move the engine into a mode when they fire.
const MODE_FOR_COMMAND = {
  insert: "insert",
  hints: "hint",
  palette: "palette",
};

function printable(key) {
  return key.length === 1;
}

export function createEngine(config) {
  const normal = config.keymap?.normal ?? {};
  const reserved = config.keymap?.reserved ?? {};
  const state = { mode: "normal", buffer: "" };

  function comboFor(d) {
    let mods = "";
    if (d.ctrl) mods += "C-";
    if (d.alt) mods += "A-";
    if (d.meta) mods += "M-";
    if (!mods) return null;
    return mods + (printable(d.key) ? d.key.toLowerCase() : d.key);
  }

  function action(command) {
    state.buffer = "";
    if (MODE_FOR_COMMAND[command]) state.mode = MODE_FOR_COMMAND[command];
    return { kind: "action", command };
  }

  return {
    get mode() {
      return state.mode;
    },
    get buffer() {
      return state.buffer;
    },

    setMode(mode) {
      state.mode = mode;
      state.buffer = "";
    },

    handleKey(d) {
      const modified = d.ctrl || d.alt || d.meta;

      // Reserved chords are ours in every mode — the spike's core proof.
      const combo = comboFor(d);
      if (combo && reserved[combo]) return action(reserved[combo]);

      // Escape always lands in normal, buffer cleared.
      if (d.key === "Escape") {
        state.buffer = "";
        state.mode = "normal";
        return { kind: "action", command: "esc" };
      }

      switch (state.mode) {
        case "insert":
          return { kind: "passthrough" };

        case "hint":
          if (!modified && printable(d.key)) {
            return { kind: "action", command: "hint_key", key: d.key };
          }
          return { kind: "passthrough" };

        case "palette":
          if (!modified && d.key === "Tab") return action("palette_cycle");
          if (!modified && d.key === "Enter") return action("palette_run");
          // Printables (and everything else) belong to the chrome input strip.
          return { kind: "passthrough" };

        default: {
          // normal: modified-but-unreserved chords and non-printables are
          // Firefox's; printables are always ours, matched or not.
          if (modified || !printable(d.key)) return { kind: "passthrough" };
          const seq = state.buffer + d.key;
          if (normal[seq]) return action(normal[seq]);
          if (Object.keys(normal).some(k => k.startsWith(seq) && k !== seq)) {
            state.buffer = seq;
            return { kind: "pending", buffer: seq };
          }
          state.buffer = "";
          return { kind: "swallow" };
        }
      }
    },

    // Glue injects pending expiry; no timers live in this module.
    handleTimeout() {
      state.buffer = "";
      return { kind: "swallow" };
    },
  };
}
