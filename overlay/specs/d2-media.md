# d2 — Media (MPRIS control, mini-player, visualizer)

## 1. Today → Instead → Thinnest

**Today**: something is playing and I don't know what or where. It might be a browser tab I can't find without hunting, Spotify behind three workspaces, or mpd. Pausing means alt-tabbing to whichever app owns it. And the browser — the thing in front of me all day — has no idea any of it exists.

**Instead**: one now-playing widget, one mini-player panel, unified controls that work regardless of which application is actually playing, and a visualizer driven by real system audio. `playerctl` is already installed on this machine, which means the abstraction I need already exists and I'm using it from the shell.

**Thinnest**: **MPRIS is the backend-agnosticism.** Firefox exposes every playing tab over MPRIS; so do Spotify, mpd (via mpDris2), and essentially every Linux player worth using. One D-Bus adapter in `aetherd` gives play/pause/next/prev/seek and full metadata across all of them — there are no per-service control adapters to write, now or ever. Chrome JS can't speak D-Bus, which is precisely the gap d1 exists to fill.

## 2. Exact behavior

### The adapter (daemon)

Enumerates MPRIS players on the session bus, tracks the **active target** (last player to report `Playing`, sticky until another starts), and streams `{player, status, title, artist, album, position, length, canGoNext, …}` on d1's event socket — on change, plus a 1s tick while playing so position stays honest without polling metadata.

Actions: `play_pause`, `next`, `prev`, `seek`, `set_target`, `list`. Every one is a D-Bus method call on the target; `aetherd` holds no player state of its own beyond which target is active.

### Widget

`media` builtin, event-driven (`refresh_s: 0`). Renders `▶ <title> — <artist>` truncated to a configured width, or `⏸` prefix when paused. **Renders empty when nothing is playing** — same rule as p3's downloads widget: a slot that's always occupied is furniture.

### Mini-player panel

`:media` opens r4's panel with a different body: transcript-free, showing target player, title/artist/album, a position bar, and the transport row. Keys: `Space` play/pause, `n`/`p` next/prev, `←`/`→` seek ±5s, `t` cycle target player, `v` toggle visualizer, `Esc` close.

**Minimize-to-corner** is `m` — the panel shrinks to a small persistent corner card (title + position bar + visualizer if enabled) that stays over page content until dismissed with `:media` again. It is a CSS state on the same element, not a second surface, and it is the only chrome in Aether that persists over content by choice.

### Search and select

Per-service **search** adapters, unlike control: `subsonic` (Navidrome/Jellyfin/Gonic — one API for all three), `spotify` (Web API, daemon-held token), `ytmusic`. Each is optional, enabled in `aetherd.toml`, and exposes exactly two actions: `search(query)` → tracks, `play(uri)` → hand off to the owning player. `:play <query>` searches enabled backends, ranks with x3, and plays the pick. A backend that isn't configured simply isn't searched — no errors, no empty sections.

### Visualizer

The honest constraint: **you cannot tap arbitrary tab audio or another application's output from chrome JS.** Web Audio's analyser only sees documents you control. So the daemon taps a PipeWire monitor source, runs the FFT, and streams magnitude bins over the event socket; the panel paints them to a `<canvas>`. This is strictly better than the browser-only version — it visualizes *system* audio, so it works for Spotify and mpd, not just tabs.

Bins, rate, and smoothing are config; default 32 bins at 30fps, which is a few KB/s over a loopback socket. The visualizer only streams while a panel with the visualizer enabled is open — no tap, no CPU, no stream otherwise.

**TOML surface** (overlay):

```toml
[media]
enabled     = true
width       = 40        # widget truncation
visualizer  = true
bins        = 32
fps         = 30

[statusbar]
widgets = ["mode", "workspace", "focus", "media", "url", "msg", "ai", "clock", "date"]
```

New registry commands: `media`, `media_play_pause`, `media_next`, `media_prev`, `media_target`, `play` — all `read`/`navigate` class except `play` (`mutate-remote`, since it commands another application).

## 3. Pure vs glue

- **`aether-media.sys.mjs`** (pure, overlay): `renderWidget(state, width)` → the widget string incl. the empty-when-idle rule; `formatPosition(pos, len)`; `panelRows(state)`; `targetList(players, active)`; `binsToBars(bins, height)` → the canvas draw list as data (so the renderer never computes).
- **`aether-panel.sys.mjs`** (r4) / **`aether-daemon-client.sys.mjs`** (d1): reused.
- **`aether.uc.js`** (glue): event subscription, canvas paint loop bound to the panel's open state, corner-card CSS state.
- **daemon (Rust)**: `mpris.rs` (D-Bus, target tracking, event emission), `audio.rs` (PipeWire monitor tap + FFT), `search/{subsonic,spotify,ytmusic}.rs`.

## 4. Unit tests (behavioral)

`overlay/test/unit/d2-media.test.mjs`:
1. `renderWidget` with nothing playing → **empty string**; paused → `⏸` prefix; playing → `▶` prefix
2. truncation at `width` never splits a multi-byte character and always leaves the ellipsis inside the budget
3. metadata with missing artist/album renders without `undefined` and without dangling separators
4. a hostile title (newlines, ANSI escapes, 10k chars, RTL overrides) renders as one line, bounded, with no control characters
5. `formatPosition` handles unknown length (live streams) as position-only, and never emits `NaN:NaN`
6. `binsToBars` clamps out-of-range magnitudes, handles an empty/short bin array, and is deterministic for a given input
7. `targetList` marks the active player and is stable when players appear/disappear mid-list
8. panel rows and every string pass the f6 lexicon sweep

`daemon/tests/mpris.rs`:
9. target selection: the most recent player to report `Playing` becomes active and stays active when it pauses; a second player starting takes over
10. a player disappearing from the bus mid-session clears the target without panicking and emits a terminal event
11. actions on a player lacking a capability (`canGoNext = false`) return a typed error rather than calling the method
12. the visualizer tap opens only while a subscriber exists and closes on the last unsubscribe (asserted by monitor-source refcount)

## 5. Visual states — `overlay/test/visual/scenarios.d/k2-media.sh`

Mock daemon replaying a canned MPRIS event stream plus synthetic FFT frames:

1. **idle** — media widget slot empty
2. **playing** — widget shows title/artist; panel open with position bar and transport row
3. **transport works** — `Space` sends `play_pause`; scenario asserts exactly one action request in the mock log (no double-send)
4. **target cycling** — two mock players; `t` switches, panel header updates
5. **minimized corner card** — `m`: small card over page content, position still advancing
6. **visualizer** — two frames captured showing different bar heights; and with `visualizer = false`, the mock log shows **zero** FFT subscription (the no-tap-no-stream rule, proven)
7. **daemon off** — widget empty, `:media` reports the daemon state, zero requests

## 6. Non-goals (budget protection)

- **No playback engine.** Aether never decodes or plays audio; it commands players that do.
- **No per-service control adapters** — MPRIS is the control layer, permanently. Only *search* is per-service.
- **No playlist/library management, no queue editing, no scrobbling, no lyrics, no album art fetching** (art would be a network fetch into chrome; the corner card is text and bars).
- **No video controls, no PiP integration** — PiP is Firefox's and works already.
- **No visualizer presets, shader modes, or fullscreen mode.** One bar renderer on r2's palette.
- **No cross-fade, EQ, or audio processing** — the tap is read-only, and a monitor tap that could modify output is a different privilege entirely.
- **No macOS/Windows media APIs.** MPRIS-only; this is a Linux tool because I run Linux.
