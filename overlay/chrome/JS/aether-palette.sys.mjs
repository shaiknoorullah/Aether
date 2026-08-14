// Aether command palette (ex-mode) — pure registry/parse/completion logic.
// Command *implementations* live in aether.uc.js; this module only decides
// what an input line means and what Tab should do. No DOM, no Services.

// Every runnable command: the spike set plus the ex-only ":tab <n>",
// "palette", "theme_reload", and the v1.2.0 config/panel family.
//
// Entry shape:
//   description  REQUIRED, non-empty. One line, lowercase, factual. THREE
//                surfaces render it — which-key rows (r3), the settings
//                panel's command list (r5), and `:describe` — so a command
//                without one is invisible in all three at once.
//   risk         read | navigate | mutate-local | mutate-remote | dangerous.
//                read = looks, moves the viewport, or changes mode;
//                navigate = changes which page is shown (new tabs included);
//                mutate-local = changes state on this machine;
//                mutate-remote = sends something off this machine;
//                dangerous = discards data with no archive behind it.
//   agent        defaults to TRUE; false marks a command that only means
//                something with a human at the keyboard (mode entry, hint
//                picking, chrome surfaces). The agent runtime (v2.1) projects
//                its tool list from this table — this is not consent, it is
//                the inventory consent gets asked about.
//   min          required args (default 0)
//   usage        shown by the glue when a required arg is missing — neutral
//                wording only.
export const RISKS = ["read", "navigate", "mutate-local", "mutate-remote", "dangerous"];

export const REGISTRY = {
  ai: { description: "toggle the local ai sidebar", risk: "read", agent: false },
  ai_off: {
    // kill switch off — hard: aborts any in-flight request
    description: "turn the ai kill switch off, stopping any request in flight",
    risk: "mutate-local",
  },
  ai_on: {
    // kill switch on, persisted over the TOML value
    description: "turn the ai kill switch on",
    risk: "mutate-local",
  },
  back: { description: "go back one page in this tab", risk: "navigate" },
  boost: {
    // b2: generate an AI CSS reskin into a review-gated preview
    description: "ask the local model for a css reskin of this site, to review",
    risk: "mutate-remote",
  },
  boost_edit: {
    description: "open this domain's boost dotfile in a new tab",
    risk: "navigate",
  },
  boost_off: {
    description: "turn this domain's boost off for the session",
    risk: "mutate-local",
  },
  boost_on: {
    description: "turn this domain's boost back on",
    risk: "mutate-local",
  },
  bottom: { description: "scroll to the bottom of the page", risk: "read" },
  config_reload: {
    // r1 — NOT `reload`: that name is page reload and is bound to `r`.
    description: "re-read the config files and apply what can change now",
    risk: "mutate-local",
  },
  describe: {
    description: "show what a command does",
    usage: "describe [command]",
    risk: "read",
  },
  done: {
    // ends the focus session; no session → neutral copy, nothing else
    description: "end the focus session",
    risk: "mutate-local",
  },
  esc: {
    description: "leave the current mode and return to normal",
    risk: "read",
    agent: false,
  },
  focus: {
    min: 1,
    usage: "focus <task>", // start a focus session (multi-word task)
    description: "start a focus session on a task",
    risk: "mutate-local",
  },
  forward: { description: "go forward one page in this tab", risk: "navigate" },
  graveyard: {
    usage: "graveyard [query]", // query optional — no query lists the newest
    description: "search closed tabs and reopen one",
    risk: "read",
  },
  half_down: { description: "scroll down half a screen", risk: "read" },
  half_up: { description: "scroll up half a screen", risk: "read" },
  hints: {
    description: "label every link and follow the one you type",
    risk: "read",
    agent: false,
  },
  insert: {
    description: "enter insert mode, where keys reach the page",
    risk: "read",
    agent: false,
  },
  mark_jump: {
    min: 1,
    usage: "mark_jump <char>",
    description: "jump to the tab marked with a letter",
    risk: "navigate",
  },
  mark_set: {
    min: 1,
    usage: "mark_set <char>",
    description: "mark this tab with a letter",
    risk: "mutate-local",
  },
  open: {
    usage: "open <url>", // no url → summon the urlbar
    description: "open a url in this tab",
    risk: "navigate",
  },
  open_tab: { description: "open a url in a new tab", risk: "navigate" },
  palette: {
    description: "open the command palette",
    risk: "read",
    agent: false,
  },
  reload: {
    // PAGE reload, bound to `r` since the spike. Config reload is
    // `config_reload`; registering over this name would silently turn `r`
    // into a config reload.
    description: "reload the page in this tab",
    risk: "navigate",
  },
  scroll_down: { description: "scroll down", risk: "read" },
  scroll_up: { description: "scroll up", risk: "read" },
  settings: {
    description: "open the settings panel",
    risk: "read",
    agent: false,
  },
  tab: {
    min: 1,
    usage: "tab <n>", // switch to tab n (1-based)
    description: "switch to tab n",
    risk: "navigate",
  },
  tab_close: {
    usage: "tab_close [id]", // no id → the current tab
    description: "close a tab into the graveyard",
    risk: "mutate-local",
  },
  tab_duplicate: {
    min: 1,
    usage: "tab_duplicate <id>",
    description: "open a second tab on the same page",
    risk: "navigate",
  },
  tab_move_ws: {
    min: 2,
    usage: "tab_move_ws <id> <workspace>",
    description: "move a tab to another workspace",
    risk: "mutate-local",
  },
  tab_new: { description: "open a new tab", risk: "navigate" },
  tab_next: { description: "switch to the next tab", risk: "navigate" },
  tab_pin: {
    min: 1,
    usage: "tab_pin <id>",
    description: "pin a tab to a number in this workspace",
    risk: "mutate-local",
  },
  tab_pin_goto: {
    min: 1,
    usage: "tab_pin_goto <n>",
    description: "switch to the tab pinned at a number",
    risk: "navigate",
  },
  tab_prev: { description: "switch to the previous tab", risk: "navigate" },
  tab_rename: {
    min: 2,
    usage: "tab_rename <id> <name>",
    description: "give a tab your own name, alongside its real title",
    risk: "mutate-local",
  },
  // The tab panel's DEFAULT action (ACTION_COMMANDS.switch in
  // aether-tabsource.sys.mjs) — what Enter does on open. Registered here so
  // the panel, the palette and the agent all reach the same one command.
  tab_select: {
    min: 1,
    usage: "tab_select <id>",
    description: "switch to a tab by id",
    risk: "navigate",
  },
  tab_tag: {
    min: 2,
    usage: "tab_tag <id> <tags>",
    description: "tag a tab so search can find it",
    risk: "mutate-local",
  },
  tabs: {
    description: "open the tab panel: search, switch, and act on tabs",
    risk: "read",
    agent: false,
  },
  tabs_toggle: {
    description: "toggle the vertical tab strip for this window",
    risk: "read",
    agent: false,
  },
  theme_reload: {
    description: "re-read the palette files and recolour the chrome",
    risk: "mutate-local",
  },
  top: { description: "scroll to the top of the page", risk: "read" },
  which_key: {
    description: "show the bindings that continue the keys you have pressed",
    risk: "read",
    agent: false,
  },
  ws: {
    min: 1,
    usage: "ws <name>", // switch-or-create a workspace
    description: "switch to a workspace, creating it if it is new",
    risk: "mutate-local",
  },
  ws_next: { description: "cycle to the next workspace", risk: "mutate-local" },
  ws_rename: {
    min: 1,
    usage: "ws_rename <name>",
    description: "rename the current workspace",
    risk: "mutate-local",
  },
  zap: {
    // hint-pick an element to hide into the domain's boost dotfile
    description: "pick an element to hide on this site from now on",
    risk: "mutate-local",
    agent: false,
  },
};

// The normalized view of a registry entry — the one place the `agent` default
// and the description fallback live, so which-key, the settings panel and
// :describe can never disagree. Unknown name → null.
export function commandEntry(name, registry = REGISTRY) {
  if (typeof name !== "string" || !Object.hasOwn(registry, name)) return null;
  const entry = registry[name] ?? {};
  return {
    name,
    description: entry.description || name,
    risk: entry.risk ?? "read",
    agent: entry.agent !== false,
    min: entry.min ?? 0,
    usage: entry.usage ?? null,
  };
}

// A binding can name a command the registry has never heard of (a typo, or a
// mod that is not loaded yet). That has to stay VISIBLE — a row reading the
// raw name — rather than vanishing from which-key and the settings panel.
export function describeCommand(name, registry = REGISTRY) {
  return commandEntry(name, registry)?.description ?? String(name ?? "");
}

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
