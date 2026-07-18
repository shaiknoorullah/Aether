// Aether command palette (ex-mode) — pure registry/parse/completion logic.
// Command *implementations* live in aether.uc.js; this module only decides
// what an input line means and what Tab should do. No DOM, no Services.

// Every runnable command: the spike set plus the ex-only ":tab <n>" and
// "palette". Metadata: `min` required args (default 0), `usage` shown by the
// glue when a required arg is missing — neutral wording only.
export const REGISTRY = {
  back: {},
  bottom: {},
  esc: {},
  forward: {},
  half_down: {},
  half_up: {},
  hints: {},
  insert: {},
  open: { usage: "open <url>" }, // no url → summon the urlbar
  open_tab: {},
  palette: {},
  reload: {},
  scroll_down: {},
  scroll_up: {},
  tab: { min: 1, usage: "tab <n>" }, // switch to tab n (1-based)
  tab_close: {},
  tab_new: {},
  tab_next: {},
  tab_prev: {},
  top: {},
};

// The exact statusbar copy for an unknown command — neutral, non-shaming.
export function unknownMessage(name) {
  return `no command: ${name}`;
}

// parse("open example.com") → {name: "open", args: ["example.com"]}
// Unknown name or missing required arg → {unknown: <name>} (plus usage when
// the registry has it); never a `name` property, never a throw.
export function parse(input) {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return { unknown: "" };
  const [name, ...args] = tokens;
  const entry = REGISTRY[name];
  if (!entry) return { unknown: name };
  if (args.length < (entry.min ?? 0)) return { unknown: name, usage: entry.usage };
  return { name, args };
}

// Prefix completion on the command-name token only; sorted ascending, capped
// by maxItems (glue passes options.palette_max_items).
export function complete(input, registry = REGISTRY, maxItems = Infinity) {
  const name = input.trimStart().split(/\s+/, 1)[0];
  return Object.keys(registry)
    .filter(n => n.startsWith(name))
    .sort()
    .slice(0, maxItems);
}

// Tab stepping: index -1 means nothing selected yet; each cycle advances,
// wrapping past the last candidate, and rewrites ONLY the command-name token
// of input — typed args survive untouched.
export function cycle(state) {
  const { candidates } = state;
  if (!candidates?.length) return state;
  const index = (state.index + 1) % candidates.length;
  const rest = state.input.trim().split(/\s+/).filter(Boolean).slice(1);
  return { input: [candidates[index], ...rest].join(" "), candidates, index };
}
