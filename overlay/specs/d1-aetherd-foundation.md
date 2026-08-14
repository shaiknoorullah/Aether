# d1 — `aetherd` Foundation (one daemon, one loopback contract)

## 1. Today → Instead → Thinnest

**Today**: everything I want next — media control, taskwarrior, timewarrior, ActivityWatch, my VPS surfaces — is "external state the browser reads, renders, and acts on." Building each one into the overlay means five network stacks, five credential stores, and thousands of lines of glue in the file the v1.1.0 audit already flagged as the pressure point. Worse, it would mean putting VPS credentials inside privileged chrome JS and punching a hole in f7's loopback-only rule, which is the rule that makes the AI kill switch mean anything.

**Instead**: one local daemon. Adapters live in it, credentials live in it, remote calls happen from it. The browser talks to exactly one thing — `127.0.0.1` — forever, and the overlay's share of any integration is a widget and a panel source.

**Thinnest**: a Rust binary with an HTTP+WS server, a capability-scoped adapter registry, and a token file. On the overlay side, one pure protocol module (request builder + event parser, exactly f7's `aether-ai-client` shape) and one glue client. **The browser must work completely without the daemon** — no daemon means those widgets and panels don't exist, and nothing else changes. That is the same property f7's kill switch has, for the same reason.

## 2. Exact behavior

### Process and packaging

`daemon/` in this repo, its own `Cargo.toml`, its own version number, released independently — it is **not** on the Firefox rebase treadmill, and that separation is the main architectural point. Runs as a user systemd service (`aetherd.service`, no root, `ProtectSystem=strict`, `NoNewPrivileges`). It never requires the browser and the browser never spawns it.

### Transport and authentication

HTTP + WebSocket on `127.0.0.1:7717` (configurable). A loopback port is reachable by **any local process and by any web page the browser loads**, so authentication is not optional:

- **Bearer token** in `~/.config/aether/daemon-token`, mode `0600`, generated on first run from the OS CSPRNG. The overlay reads it via `IOUtils` at startup. Every request must carry it; a missing or wrong token is a flat `401` with no body.
- **Any request carrying an `Origin` header is rejected outright**, before authentication. Privileged chrome fetches don't send one; page-initiated fetches always do. That single rule kills the DNS-rebinding and drive-by-localhost classes, and it fails closed.
- **`Host` must be a loopback literal.** A rebound hostname that resolves to 127.0.0.1 is rejected by name.
- Bind is `127.0.0.1` only, never `0.0.0.0`, and that is not configurable.

### Protocol

`GET /v1/capabilities` → what this daemon can do, which the overlay uses to decide what to render. `POST /v1/<adapter>/<action>` with a JSON body. `GET /v1/events` upgrades to a WebSocket carrying a typed event stream (`{adapter, type, payload, seq}`); `seq` is monotonic per connection so a reconnect can report a gap rather than silently losing events.

Every response is `{ok: true, data}` or `{ok: false, error: {code, message}}` — the message is for a human and is displayed verbatim in the statusbar, so daemon error strings are inside the f6 lexicon sweep by policy (asserted daemon-side).

### Adapters and capabilities

An adapter registers a name, a set of actions, and the capabilities it needs (`exec`, `dbus`, `net:<host>`, `fs:<path>`, `audio`). `aetherd.toml` enables adapters explicitly:

```toml
[daemon]
port = 7717
adapters = ["mpris", "tasks"]      # nothing runs unless listed
```

Presence of adapter code does nothing; the enable list is the act of trust, exactly like x2's `[mods] enabled`. An adapter requesting a capability not granted in its config block fails at load with a named error rather than at first use.

### Overlay side

`[daemon] enabled` (default `false`, like f7's AI switch) plus `base_url`, validated by **f7's `validateBaseUrl`** — one loopback validator, reused, not reimplemented. Disabled or unreachable → daemon-backed widgets render empty, daemon-backed panels report `daemon not running` (neutral, names the service), and nothing else in the browser changes. Statusbar `daemon` widget shows `daemon on`/`daemon off`, matching f7's `ai` widget precedent: a switch whose state you can't see isn't a switch.

Reconnect is exponential backoff to a 30s ceiling, forever, silently. A daemon that comes back mid-session repopulates without a browser restart.

**TOML surface** (overlay):

```toml
[daemon]
enabled  = false
base_url = "http://127.0.0.1:7717"
token    = "~/.config/aether/daemon-token"
```

New registry commands: `daemon` (status panel), `daemon_on`, `daemon_off` — `daemon_off` aborts in-flight requests and closes the socket, the hard-switch contract f7 established.

## 3. Pure vs glue

- **`aether-daemon-client.sys.mjs`** (pure, Node-testable — no Services/fetch): `buildRequest(cfg, adapter, action, body)` → `{url, init}`; `parseEnvelope(text)` → `{ok, data|error}`; `eventFeed(buffer, chunk)` → `{buffer, events[], gap?}` (seq-gap detection, partial-frame reassembly — f7's `sseFeed` shape); `capabilitiesFor(caps, adapter)`.
- **`aether-ai-client.sys.mjs`** (f7, pure): `validateBaseUrl` imported, not duplicated.
- **`aether.uc.js`** (glue): token read, fetch, WS lifecycle and backoff, event dispatch to widget/panel consumers, `ctx.daemon` for the widget.
- **daemon (Rust)**: `auth.rs` (token, Origin, Host rules), `registry.rs` (adapters + capability grants), `proto.rs` (envelope, events), `server.rs`.

## 4. Unit tests (behavioral)

`overlay/test/unit/d1-daemon-client.test.mjs`:
1. `buildRequest` produces the right url/method/headers incl. the bearer token; a trailing-slash `base_url` normalizes (f7 test 2's rule, re-asserted)
2. `validateBaseUrl` rejects non-loopback daemon urls — a remote `base_url` makes the daemon unavailable, never a remote call (f7's contract holds here verbatim)
3. `parseEnvelope`: success, error, malformed JSON, and a non-envelope body each yield a defined result, never a throw
4. `eventFeed` reassembles frames split at arbitrary boundaries and yields events in order (f7 test 5's fixture pattern)
5. a `seq` gap is reported as `gap`, not hidden — a consumer must be able to know it missed something
6. events for an unknown adapter are ignored without throwing (forward compatibility with a newer daemon)
7. disabled state: the request builder is never reachable — the gate is the same `assertOn` shape as f7, verified both ways

`daemon/tests/auth.rs` (cargo):
8. request with a valid token and no `Origin` → accepted
9. request with a valid token **and** an `Origin` header → rejected, and rejected *before* token comparison (ordering asserted, so a page can't use timing to probe tokens)
10. wrong/absent token → `401` with an empty body; the response is byte-identical in both cases (no oracle)
11. `Host: aether.local` resolving to loopback → rejected by name
12. bind address is 127.0.0.1 even when config says otherwise (the un-overridable rule, asserted)
13. token file is created `0600`; a world-readable existing token file is refused with a named error rather than used

`daemon/tests/registry.rs`:
14. an adapter not in `adapters` never loads and its actions 404
15. an adapter requesting an ungranted capability fails at load, naming the capability
16. every daemon-emitted error message passes the lexicon sweep (the word list is shared with the overlay as a fixture)

## 5. Visual states — `overlay/test/visual/scenarios.d/k1-daemon.sh`

Uses a one-file mock daemon (the f7 mock-gateway pattern) that logs every request:

1. **daemon off** — `enabled = false`: daemon widget shows `daemon off`, `:daemon` panel reports it, mock log gains **zero** entries
2. **daemon on, unreachable** — enabled with nothing listening: `daemon off` state, one calm line, browser fully functional, no error spew
3. **connected** — mock running: widget `daemon on`, `:daemon` lists capabilities
4. **token enforcement** — mock configured to require the token; the scenario asserts the request carried it, and a wrong-token run shows the disconnected state
5. **reconnect** — kill the mock mid-session, restart it: widget recovers without a browser restart
6. **`daemon_off` is hard** — toggle off during an open stream: socket closed, log gains no further entries

## 6. Non-goals (budget protection)

- **No remote binding, ever.** Not behind a flag, not for "just my LAN." Remote reach is an adapter's job (d5), from the daemon, with the daemon's credentials.
- **No daemon auto-start from the browser**, no bundled installer, no supervision. systemd is the process manager.
- **No plugin system for adapters** — adapters are compiled in. A dynamically loaded native plugin is a far worse trust class than x2's code mods, with none of the same visibility.
- **No cross-machine daemon federation**, no service discovery, no mDNS.
- **No general RPC/eval endpoint.** Adapters expose named actions with typed bodies; there is no "run this" action, because that would be a remote shell with a token.
- **No daemon-side UI**, no web console, no dashboard on its port.
- **No overlay feature that hard-depends on the daemon.** If the daemon is the only way to do something, that something is optional by definition.
