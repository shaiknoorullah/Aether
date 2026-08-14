// Aether which-key (r3) — pure render-state for the discovery panel. Turns the
// pending key prefix plus the keymap.normal table into a sorted candidate list,
// caps that list, and answers the one timing question the panel asks. No
// Services, no IOUtils, no DOM, no timers, no wall-clock: `elapsedMs` is a
// PARAMETER, because the threshold rule is the behaviour worth testing and a
// setTimeout in the glue is not a place a test can reach.
//
// What this module OWNS:
//   candidatesFor(keymap, prefix, registry) — which sequences continue `prefix`,
//     in a deterministic order, each carrying the one description line that
//     which-key, :describe and the settings panel all render.
//   truncate(rows, max) — the palette_max_items cap plus the remainder count.
//     The "+N more" copy itself is aether-strings' moreRow(); we return a number.
//   shouldShow(state) — enabled? forced? held long enough? A primitive boolean.
//
// Recorded decisions, so a reader does not have to re-derive them:
//
//   ROW SHAPE is {sequence, remaining, command, description}. Spec §3 writes
//   the row as {remaining, command, description}; `sequence` is a deliberate
//   widening — the glue needs a stable per-row address that survives a
//   re-render, and deriving it from prefix+remaining in the glue would put
//   string surgery in the untested lane. Everything else about the shape is
//   the spec's.
//
//   SORT is: code POINT count of `remaining` ascending (so one astral
//   keystroke is one key, not two UTF-16 units), then code POINT value,
//   position by position. That is the whole rule — no case folding, no
//   localeCompare, no Intl. "Alphabetically" (spec §2) is under-specified for
//   a keymap that contains `0`, `W`, `a` and `?`, and the one property the
//   panel actually needs is that the order is identical on every machine and
//   under every locale, which only a raw code-point order gives. Case-folding
//   as a tiebreak was tried and rejected: it makes `W` and `w` compare equal
//   at the character level and pushes the decision into a second, weaker
//   comparison, which is exactly the kind of order a reader cannot predict
//   from looking at the panel. A prefix that splits a surrogate pair would
//   leave half a code point in `remaining`; that is left alone rather than
//   special-cased, because the engine builds its pending buffer out of whole
//   `d.key` values and cannot produce one.
//
//   SHADOWED SEQUENCES ARE LISTED. The engine fires the first exact match
//   (aether-keys.sys.mjs), so if both `ga` and `gab` are bound, `gab` can
//   never fire. We still render it. Spec §2 says "every binding whose key
//   sequence starts with that prefix", and a binding that can never fire is a
//   broken binding — the feature's stated job is to make those VISIBLE (spec
//   §4 test 6), not to hide the evidence. Marking such a row as shadowed would
//   need a fifth row field and a spec change; it is filed, not smuggled in.
//
//   A GARBAGE CAP MEANS NO CAP. Only a finite `max >= 0` caps; NaN, "8",
//   undefined, null, a negative, Infinity, an object — all of them show every
//   row. The alternative (falling back to a built-in 8, the aether-graveyard
//   DEFAULT_CAP idiom) was rejected because it invents a cap the reader never
//   configured and then hides rows behind a "+N more" line they cannot
//   explain: a silent, undocumented second source of truth for a number spec
//   §2 says is `palette_max_items` and nothing else. Showing too many rows is
//   a visible, self-explaining failure; hiding rows is not. The configured cap
//   is palette_max_items, there is exactly one of those, and truncate() does
//   not carry a spare.
//
//   RESERVED CHORDS ARE NOT ROWS. `keymap.reserved` (C-w, C-t, C-n, C-Tab) is
//   not merged into the root list, even though spec §2 calls that list "every
//   top-level binding". A reserved chord is a whole-chord match that never
//   enters the pending buffer, so folding it into the same prefix table would
//   invent prefixes no keystroke can produce: with "C-w" as a key, prefix "C"
//   would render `-w`, `-t`, `-n`, `-Tab` as continuations of a `C` that the
//   engine cannot be in. Listing four reserved chords under the *empty* prefix
//   only is a render concern (the glue can append them as a static block); it
//   is not something candidatesFor's prefix rule can express. Filed, not
//   smuggled in.
//
//   BINDINGS ARE READ BY DESCRIPTOR, THE ENGINE READS THEM BY INDEX.
//   aether-keys' dispatch does `normal[seq]`, which fires an accessor binding;
//   ownValue returns undefined for one, so which-key drops it. The two reads
//   diverge, in the direction that hides a binding the engine would fire —
//   the inverse of the feature's job. It is unreachable from a dotfile
//   (parseToml only ever produces plain data), the safe half of the divergence
//   lives here, and aether-keys is not this feature's file: reported upward
//   rather than papered over. A test pins which-key's half so the choice
//   cannot be mutated away silently.
//
// What this module deliberately does NOT own, because it has no pure surface:
//   - the timer that produces elapsedMs, and every path that clears it;
//   - the root list's dismissal rule ("any key closes it, and that key is then
//     handled normally" — spec §2), which is glue state in aether.uc.js;
//   - the normal-mode-only gate (spec §2 "Modes"). `shouldShow` takes no `mode`
//     parameter on purpose: the spec pins its signature, and a mode argument
//     would move a decision the glue already makes into a second place.
//   Both are UNVERIFIED today, in either lane: spec §5's six h3 scenarios
//   contain no mode case, and overlay/test/visual/scenarios.d/h3-which-key.sh
//   has not been written yet. Do not read this header as a claim of coverage.
//
// Which-key is never on the dispatch path. It reads state the key engine
// already holds; a sequence resolves on exactly the same timing whether the
// panel is up or not.

import { parseBinding } from "./aether-keys.sys.mjs";
import { REGISTRY } from "./aether-palette.sys.mjs";

// A keymap is the keymap.normal TABLE, {sequence: bindingValue}. A string's or
// an array's indices are not key sequences, so only a non-array object counts.
function isTable(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Hostile own keys ("__proto__", "constructor") are read as plain data: the
// descriptor, never a getter and never the prototype's accessor. Reading
// through a getter would let an untrusted table run code during a render pass
// and return different rows for identical arguments.
function ownValue(table, key) {
  const desc = Object.getOwnPropertyDescriptor(table, key);
  return desc && "value" in desc ? desc.value : undefined;
}

// The one description line, read as DATA. Deliberately not a describeCommand()
// call: that indexes registry[name] and registry[name].description, which
// invokes getters — and the registry is mod-extensible, i.e. untrusted. Same
// field, same fallback ("no usable description" → the raw command name), so
// which-key, :describe and the settings panel still render one text; a test
// pins that equivalence against the shipped REGISTRY.
function ownDescription(registry, command) {
  const entry = ownValue(registry, command);
  if (!isTable(entry)) return "";
  const value = ownValue(entry, "description");
  return typeof value === "string" ? value : "";
}

// Keystrokes, not UTF-16 code units: one astral binding is one key, and the
// sort key is computed once per row rather than once per comparison.
function codePoints(text) {
  const points = [];
  for (const ch of text) points.push(ch.codePointAt(0));
  return points;
}

// Keystroke count first, then code point by code point. No case folding, no
// localeCompare, no Intl: a locale-dependent order would put the same keymap
// in a different order on a different machine.
function byRemaining(a, b) {
  const left = a.points;
  const right = b.points;
  if (left.length !== right.length) return left.length - right.length;
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

// Every sequence that CONTINUES `prefix` — s.startsWith(prefix) and strictly
// longer, because an exact match is not a continuation: it fires, and a
// zero-remaining row would be a blank line offering nothing.
//
// Total by construction. A non-table keymap yields []; a non-string prefix is
// the empty prefix (String(null) would be "null" and would silently blank the
// panel); a binding whose parsed command is empty is dropped individually, its
// siblings untouched. An UNKNOWN command is kept and rendered as its raw name —
// a typo'd or not-yet-loaded binding has to stay visible, that is the feature.
export function candidatesFor(keymap, prefix = "", registry = REGISTRY) {
  if (!isTable(keymap)) return [];
  const head = typeof prefix === "string" ? prefix : "";
  // A non-table registry (null included — Object.hasOwn(null, …) throws) means
  // "no descriptions", not "use the builtins": only an omitted argument selects
  // REGISTRY, via the default above.
  const table = isTable(registry) ? registry : {};

  // Decorate-sort-undecorate: the sort key (the remaining code points) is
  // computed once per row and never leaks into the row itself, which stays
  // exactly the four render fields.
  const decorated = [];
  for (const sequence of Object.keys(keymap)) {
    if (sequence.length <= head.length || !sequence.startsWith(head)) continue;
    const { command } = parseBinding(ownValue(keymap, sequence));
    if (!command) continue;
    const remaining = sequence.slice(head.length);
    decorated.push({
      points: codePoints(remaining),
      row: {
        sequence,
        remaining,
        command,
        description: ownDescription(table, command) || command,
      },
    });
  }
  decorated.sort(byRemaining);
  return decorated.map(d => d.row);
}

// Cap the list at `max` rows and count the rest. The kept rows are the SAME
// objects, in a freshly allocated array — that is what "never a partial final
// row" means mechanically. A finite max >= 0 caps (and it floors, so 8.9 never
// paints a ninth row), 0 being a real cap of zero. Anything else — NaN, "8",
// undefined, null, a negative, Infinity, an object — means NO cap: this
// function never invents a limit the reader did not configure, because a row
// hidden behind an unexplained "+N more" is a worse failure than a long panel.
// Shape-agnostic on purpose: it slices whatever array it is handed, so a
// non-array is the empty result rather than a throw in the render path.
export function truncate(rows, max) {
  if (!Array.isArray(rows)) return { rows: [], moreCount: 0 };
  if (!Number.isFinite(max) || max < 0) return { rows: rows.slice(), moreCount: 0 };
  const limit = Math.floor(max);
  return {
    rows: rows.slice(0, limit),
    moreCount: Math.max(0, rows.length - limit),
  };
}

// Should the panel be painted right now? Every field is read with ownValue,
// for the same two reasons candidatesFor reads the keymap that way, and they
// bite harder here: a polluted Object.prototype (`Object.prototype.forced =
// true`, from a mod, a dependency, or a sync'd profile) would otherwise make
// shouldShow({}) true and paint exactly the permanent HUD rule 4 exists to
// forbid — a destructure walks the prototype chain — and an accessor on the
// state object would run code inside a keydown handler and could throw,
// contradicting rule 1. The cost is that a state object inheriting its fields
// from a prototype reads as empty; the glue builds an object literal per
// keystroke, and "own data only" is the whole contract.
//
// Decided in this order:
//   1. a non-object state is false rather than a throw (glue calls this from
//      the keydown path);
//   2. which_key_ms that is not a finite, non-negative number DISABLES the
//      feature — -1 is the documented off switch, and disabled outranks
//      forced, so -1 kills the `?` root list too;
//   3. forced === true (strict — a truthy 1 or "yes" is not a `?` press) shows
//      the root list immediately, BEFORE any clock reading is consulted: the
//      `?` path has no timer, so it arrives with no elapsedMs at all, and a
//      clock guard placed above this line would silently make `?` do nothing;
//   4. an empty or non-string pending sequence never shows on its own:
//      which-key is not a permanent HUD;
//   5. a non-finite or negative elapsedMs is a broken clock reading and paints
//      nothing;
//   6. otherwise elapsedMs >= whichKeyMs, so which_key_ms = 0 is instant.
export function shouldShow(state) {
  if (state === null || typeof state !== "object" || Array.isArray(state)) return false;
  const pendingKeys = ownValue(state, "pendingKeys");
  const elapsedMs = ownValue(state, "elapsedMs");
  const whichKeyMs = ownValue(state, "whichKeyMs");
  const forced = ownValue(state, "forced");
  if (!Number.isFinite(whichKeyMs) || whichKeyMs < 0) return false;
  if (forced === true) return true;
  if (typeof pendingKeys !== "string" || pendingKeys.length === 0) return false;
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return false;
  return elapsedMs >= whichKeyMs;
}
