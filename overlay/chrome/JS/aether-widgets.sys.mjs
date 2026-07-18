// Aether statusbar widgets: builtin registry, config resolution, renders, and
// refresh scheduling. Pure module — no Services/Ci/IOUtils/DOM and no Date.now;
// time arrives as ctx.nowMs / scheduler nowMs arguments so tests inject clocks.
//
// Widget contract: {id, refresh_s, render(ctx) -> {text, class}}.
// refresh_s absent/0 ⇒ event-driven only; > 0 ⇒ also re-rendered on schedule.
// ctx: {mode, buffer, url, message, tabCount, nowMs, locale} (locale undefined
// ⇒ system locale).

function formatTime(ctx, options) {
  return new Intl.DateTimeFormat(ctx.locale, options).format(new Date(ctx.nowMs));
}

export const BUILTINS = {
  mode: {
    id: "mode",
    refresh_s: 0,
    render: ctx => ({
      text: ctx.buffer ? `${ctx.mode.toUpperCase()} ${ctx.buffer}` : ctx.mode.toUpperCase(),
      class: "aether-mode",
    }),
  },
  url: {
    id: "url",
    refresh_s: 0,
    render: ctx => ({ text: ctx.url ?? "", class: "aether-url" }),
  },
  msg: {
    id: "msg",
    refresh_s: 0,
    render: ctx => ({ text: ctx.message ?? "", class: "aether-message" }),
  },
  tabs: {
    id: "tabs",
    refresh_s: 0,
    render: ctx => ({ text: String(ctx.tabCount), class: "aether-tabs" }),
  },
  clock: {
    id: "clock",
    refresh_s: 30,
    render: ctx => ({
      text: formatTime(ctx, { hour: "2-digit", minute: "2-digit" }),
      class: "aether-clock",
    }),
  },
  date: {
    id: "date",
    refresh_s: 300,
    render: ctx => ({
      text: formatTime(ctx, { weekday: "short", day: "2-digit", month: "short" }),
      class: "aether-date",
    }),
  },
};

// Ordered widget defs from config: order verbatim, unknown ids skipped (so
// "workspace" can sit in a dotfile before the feature exists), duplicates
// resolve to their first position, and the legacy statusbar_clock = false
// option removes clock (back-compat with the spike's dotfiles).
export function resolveWidgets(config) {
  const requested = config?.statusbar?.widgets ?? [];
  const clockOff = config?.options?.statusbar_clock === false;
  const seen = new Set();
  const out = [];
  for (const id of requested) {
    const widget = BUILTINS[id];
    if (!widget || seen.has(id)) continue;
    if (id === "clock" && clockOff) continue;
    seen.add(id);
    out.push(widget);
  }
  return out;
}

// Interval bookkeeping for scheduled widgets. periodMs is the min refresh_s
// (ms) among scheduled widgets, or null when there are none — glue then
// creates zero timers. A late tick fires a widget once and rebases its
// deadline from the tick time: no catch-up bursts, no double-fires.
export function createScheduler(widgets, nowMs) {
  const entries = widgets
    .filter(w => (w.refresh_s ?? 0) > 0)
    .map(w => {
      const periodMs = w.refresh_s * 1000;
      return { id: w.id, periodMs, dueAt: nowMs + periodMs };
    });
  return {
    periodMs: entries.length ? Math.min(...entries.map(e => e.periodMs)) : null,
    tick(tickMs) {
      const due = [];
      for (const e of entries) {
        if (tickMs >= e.dueAt) {
          due.push(e.id);
          e.dueAt = tickMs + e.periodMs;
        }
      }
      return due;
    },
  };
}

// A broken widget is an empty slot, not an error state — a throwing render
// yields empty text and never takes the rest of the bar down with it.
export function renderWidget(widget, ctx) {
  try {
    const r = widget.render(ctx);
    return { text: r?.text ?? "", class: r?.class };
  } catch {
    return { text: "" };
  }
}
