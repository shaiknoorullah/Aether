# d1 — `aetherd` Foundation (one daemon, one loopback contract)

## 1. Today → Instead → Thinnest

**Today**: everything I want next — media control, taskwarrior, timewarrior, ActivityWatch, my VPS surfaces — is "external state the browser reads, renders, and acts on." Building each one into the overlay means five network stacks, five credential stores, and thousands of lines of glue in the file the v1.1.0 audit already flagged as the pressure point. Worse, it would mean putting VPS credentials inside privileged chrome JS and punching a hole in f7's loopback-only rule, which is the rule that makes the AI kill switch mean anything.

**Instead**: one local daemon. Adapters live in it, credentials live in it, remote calls happen from it. The browser talks to exactly one thing — `127.0.0.1` — forever, and the overlay's share of any integration is a widget and a panel source.

**Thinnest**: a Rust binary with an HTTP+WS server, a capability-scoped adapter registry, and a token file. On the overlay side, one pure protocol module (request builder + event parser, exactly f7's `aether-ai-client` shape) and one glue client. **The browser must work completely without the daemon** — no daemon means those widgets and panels don't exist, and nothing else changes. That is the same property f7's kill switch has, for the same reason.

## 2. Exact behavior

### Process and packaging

`daemon/` in this repo, its own `Cargo.toml`, its own version number, released independently — it is **not** on the Firefox rebase treadmill, and that separation is the main architectural point. Runs as a user systemd service (`aetherd.service`, no root). It never requires the browser and the browser never spawns it.

**The threat model, stated plainly, because three specs build guarantees on it.** The `0600` token defends against *other users* and against *web pages*. It does **not** defend against a process running as me — which is the realistic threat on a workstation running npm, cargo and pip. Such a process reads the token and gains everything the daemon holds: `exec` (d3), VPS credentials (d5), and store decryption keys (d7). So d5's "no credentials in the browser" and d7's encryption at rest **relocate** secrets rather than protecting them against local malware; what they genuinely protect against is a browser bug reaching credentials, a stolen disk, and dotfile sync. Encryption at rest is not live-session malware protection and this spec does not imply it is.

The systemd hardening is therefore either real or absent, not decorative: `ProtectSystem=strict`, `ProtectHome=read-only` with explicit `ReadWritePaths`, `NoNewPrivileges`, `SystemCallFilter=@system-service`, `RestrictAddressFamilies=AF_INET AF_UNIX`, `IPAddressAllow=localhost` plus configured endpoint hosts. None of it constrains a same-uid client; it constrains the daemon's own blast radius, which is a different and smaller claim.

### Transport and authentication

HTTP + WebSocket on `127.0.0.1`, on a **random high port chosen at first run** and recorded in the token file. A fixed 7717 is squattable: `aetherd` is a user service, so at every login there is a window where the port is unbound, and any same-user process that binds it first harvests the bearer token on the overlay's first request — and the overlay's "back off silently, forever" makes that maximally reachable. Recording the port in the `0600` file means squatting requires reading that file, which collapses the attack into the same-user case below.

A loopback port is reachable by **any local process and by any web page the browser loads**, so authentication is not optional. Each rule below does one specific job, and the spec says which — mis-attributing a defense is how a gap survives review:

- **Bearer token** in `~/.config/aether/daemon-token`, mode `0600`, generated on first run from the OS CSPRNG, compared in **constant time**. This is what stops drive-by-localhost. A missing or wrong token is a flat `401` with an empty body, byte-identical in both cases, and failed attempts are counted and logged once a minute — there is otherwise no rate limit on a brute force from a process that can reach the port but not read the file.
- **`Host` must be a loopback literal.** *This* is what stops DNS rebinding — a rebound hostname resolving to 127.0.0.1 is rejected by name.
- **Any request carrying an `Origin` header is rejected**, before authentication. This is **defense in depth over a subset**, not a general defense: `Origin` is absent on no-CORS GET subresource loads (`<img>`, `<script>`, `<iframe>`), on GET form submissions, and on top-level navigations — all of which reach the handler — and after a successful rebind the page is same-origin, where GETs carry no `Origin` at all. It closes the CORS/POST/WebSocket subset and nothing more.
- **`Content-Type: application/json` required on every POST**, which closes the simple-request form-submission path that `Origin` alone does not.
- Bind is `127.0.0.1` only, never `0.0.0.0`, and that is not configurable.
- **The overlay authenticates the daemon, not just the reverse.** `/v1/capabilities` carries a client nonce and the daemon returns `HMAC(token, nonce)`; the overlay verifies before sending anything else. Without it, authentication is one-way and the first request to an impostor is a credential disclosure.

**Spike before building this**: whether a chrome-context `fetch`/`WebSocket` sends any `Origin` value. If it sends one (`null`, or a `chrome://` serialization), the rule rejects the overlay's own socket and the daemon appears permanently down — and the tempting fix, allowlisting `Origin: null`, is exactly what sandboxed iframes and `data:` documents send, which reopens the hole. Record the answer in this spec.

**A unix domain socket in `$XDG_RUNTIME_DIR` with `SO_PEERCRED` is the stronger design** and deletes this entire apparatus — web pages cannot address unix sockets, so drive-by-localhost, rebinding, `Origin`, and port squatting all stop existing. The cost is that chrome JS must use `nsISocketTransportService` instead of `fetch`/`WebSocket`, which is real glue complexity against the maintenance budget. **Spike both before committing to TCP**, because this choice is very hard to change once d2–d7 sit on top of it.

### Protocol

`GET /v1/capabilities` → what this daemon can do, which the overlay uses to decide what to render. `POST /v1/<adapter>/<action>` with a JSON body. `GET /v1/events` upgrades to a WebSocket carrying a typed event stream (`{adapter, type, payload, seq}`); `seq` is monotonic per connection so a reconnect can report a gap rather than silently losing events.

**The WebSocket carries the token in `Sec-WebSocket-Protocol`**, as `aether.v1, aether.token.<token>`. The browser's WebSocket API cannot set request headers, so `Authorization` is not available; the obvious fallback — a query parameter — puts the token in the daemon's access log, in Necko error strings, in `about:networking`, and potentially into the `error.message` the statusbar renders. The subprotocol header is settable from JS and is not routinely logged.

Every response is `{ok: true, data}` or `{ok: false, error: {code, message}}`. **The overlay renders every daemon-supplied string as `textContent`, truncated to 200 characters, with control, zero-width and bidi characters stripped — in the overlay, never trusted from the daemon.** f7 established that rule for model output and the shipped code honors it; a daemon message is the same trust class the moment d5 lets a remote response influence it, and one `innerHTML` in statusbar glue would be chrome-privileged XSS. The f6 lexicon sweep covers the daemon's *own* static strings (asserted daemon-side) and cannot cover interpolated remote text or third-party subprocess output — so those are never rendered verbatim: a subprocess failure maps to the daemon's own swept message, with the raw text going only to the daemon log.

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

New registry commands: `daemon` (status panel), `daemon_on`, `daemon_off`, `daemon_rotate`.

`daemon_off` aborts in-flight requests and closes the socket — but it is **not** f7's kill switch and this spec does not claim it is. f7's switch means *no packets leave*, asserted by a mock gateway's request log gaining zero entries. `daemon_off` disconnects the *browser* from the daemon; the daemon keeps polling the VPS (d5), writing to taskwarrior and timewarrior (d3), and writing AW buckets (d4). **The daemon's kill switch is `systemctl --user stop aetherd`**, and the `:daemon` panel says so.

For the same reason, "the browser only ever talks to loopback" no longer implies "the browser causes no remote traffic" once d5 exists — it causes remote traffic by proxy, on a schedule it does not control, whether or not it is running. The loopback rule still means the browser holds no credentials and has no remote code path; that is the claim, and it is smaller than the one f7 could make.

`daemon_rotate` regenerates the token, rewrites the `0600` file, and invalidates the old value immediately; the overlay re-reads the token file on any `401` before backing off, so rotation is one command rather than a restart dance.

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

8. **the token never appears in any log line, error message, or event payload** — seed a sentinel token, exercise every failure path, grep all emitted output (d5's test 8, which d1 lacked entirely, applied to d1's own credential)
9. daemon-supplied strings render bounded and inert: markup, control characters, bidi overrides and a 1 MB string all pass through the render path as single-line `textContent` with no markup surviving

`daemon/tests/auth.rs` (cargo):
10. request with a valid token and no `Origin` → accepted
11. request with a valid token **and** an `Origin` header → rejected
12. **a no-`Origin` GET subresource-shaped request with no token → `401`** — the case the `Origin` rule does not cover, proving the token is what defends it
13. a POST without `Content-Type: application/json` → rejected (the simple-request form path)
14. wrong/absent token → `401` with an empty body, byte-identical in both cases (no oracle), and the comparison is **constant-time** (asserted by construction: the equality helper is the constant-time one)
15. `Host: aether.local` resolving to loopback → rejected by name
16. bind address is 127.0.0.1 even when config says otherwise (the un-overridable rule, asserted)
17. token file is created `0600` with `O_NOFOLLOW`, is a regular file owned by the running uid, and its parent directory is not group/world-writable — each refused with a named error rather than used
18. the port recorded in the token file is not the compiled default (random-port rule)
19. `/v1/capabilities` returns `HMAC(token, nonce)` for the client nonce, and the overlay's client rejects a wrong HMAC before sending a second request

`daemon/tests/registry.rs`:
20. an adapter not in `adapters` never loads and its actions 404
21. an adapter requesting an ungranted capability fails at load, naming the capability
22. every daemon-emitted **static** error string passes the lexicon sweep (word list shared with the overlay as a fixture) — and a subprocess failure surfaces the daemon's own swept message, with the third-party text present only in the log (the sweep cannot cover text it did not author, so the boundary is enforced rather than assumed)

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
