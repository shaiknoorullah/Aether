# d5 — Remote Surfaces (my VPS, without credentials in the browser)

## 1. Today → Instead → Thinnest

**Today**: the services I run on my VPS — powerhouse, gnosis, ArgoCD, whatever comes next — are things I check by opening a tab, logging in, and reading a dashboard. That's a context switch for a number I wanted glanceable, and the alternative (calling them from the browser) would mean holding API credentials inside privileged chrome JS and breaking f7's loopback-only rule, which is the rule that makes every other network claim in this project checkable.

**Instead**: the daemon holds the credentials and does the TLS. The browser asks `127.0.0.1` for a rendered result. Remote surfaces become statusbar widgets and panel sources, and the overlay's network policy never changes.

**Thinnest**: one generic HTTP adapter driven by declarative endpoint definitions, plus a response-shaping step, so adding a service is a config block rather than Rust. Service-specific adapters only when a service needs auth flows a config block can't express.

> **Open input required.** `github.com/shaiknoorullah/powerhouse` and `/gnosis` are private and I have no authenticated access, so this spec is written against **assumptions**: each exposes an HTTP API returning JSON, reachable over TLS, authenticated by a bearer token or mTLS, and reachable either publicly or over a wireguard/tailscale mesh. If any of that is wrong — a database rather than an API, a websocket protocol, session cookies, no TLS — the endpoint definition below changes shape and the adapter may need service-specific code. Everything else in this spec (credential location, consent model, failure behavior) holds regardless.

## 2. Exact behavior

### Endpoint definitions

```toml
# ~/.config/aether/aetherd.toml
[[endpoints]]
name     = "powerhouse"
url      = "https://powerhouse.internal/api/v1/status"
auth     = "bearer:powerhouse_token"    # names a secret, never contains one
interval = "60s"
timeout  = "5s"
widget   = "{status} · {queue_depth}"   # rendered by the daemon
panel    = ["jobs[].name", "jobs[].state", "jobs[].updated"]
```

Secrets are **named, never inlined**: `auth` references a key in a separate `secrets.toml` (mode `0600`) or, preferably, a command (`auth = "cmd:pass show aether/powerhouse"`) so the token can live in `pass` or a keyring and never sit in a config file at all. A config file with a token in it gets committed to dotfiles eventually; a config file with a *reference* cannot leak one.

### Polling and failure

The daemon polls at `interval`, caches the last good response with its timestamp, and streams updates over d1's event socket. Failure semantics matter more than success ones:

- A failed poll **keeps the last good value and marks it stale** — the widget renders `powerhouse · 3 (stale 4m)`. A widget that blanks on a blip teaches you to ignore it; one that lies about freshness is worse.
- Backoff on repeated failure to a 5-minute ceiling, and a single statusbar line on the *transition* into failure, never per attempt.
- `timeout` is enforced daemon-side. A hung VPS never blocks anything in the browser, because the browser is only ever talking to loopback.

### Surfaces

- **Widget**: one `remote:<name>` builtin per endpoint, rendering the daemon-formatted string, empty when the endpoint is disabled or has never succeeded.
- **Panel**: `:remote <name>` opens r4's panel over the `panel` projection — rows with x3 filtering. Read-only in this pass.
- **Actions** are opt-in per endpoint and explicitly declared (`actions = [{name = "restart", method = "POST", path = "/jobs/{id}/restart"}]`). Every declared action is `mutate-remote` class, and there are no implicit ones — a GET-only endpoint can never be made to write by a browser-side bug.

### Mesh and reachability

If the services sit behind wireguard or tailscale, the daemon uses the host's existing route — it does not manage tunnels, hold mesh keys, or bring interfaces up. `wg-quick` and `tailscaled` are better at that than anything I'd write, and a daemon that manages network interfaces is a daemon that needs privileges I don't want it to have.

**TOML surface** (overlay): endpoints are discovered from d1's `/v1/capabilities`, so the overlay needs nothing per endpoint. Widget placement is the only overlay-side config:

```toml
[statusbar]
widgets = ["mode", "workspace", "remote:powerhouse", "url", "msg", "clock", "date"]
```

New registry commands: `remote` (`read`), `remote_action` (`mutate-remote`, always confirmed).

## 3. Pure vs glue

- **`aether-remote.sys.mjs`** (pure, overlay): `renderWidget(state)` incl. the stale-marking rule; `projectRows(data, projection)` → panel rows from a dotted-path projection, tolerant of missing paths; `staleness(lastOk, now)`.
- **daemon (Rust)**: `endpoints.rs` (definition parsing, secret resolution via file or command, poll loop, backoff), `http.rs` (TLS client with a pinned timeout, no redirect-following to a different host).

## 4. Unit tests (behavioral)

`overlay/test/unit/d5-remote.test.mjs`:
1. `renderWidget` for never-succeeded → empty; fresh → value; stale → value plus the age marker (all three asserted, since silent staleness is the failure mode)
2. `projectRows` with a missing path yields a row with an empty cell, never `undefined` and never a dropped row
3. a projection resolving to an object or array renders a bounded summary rather than `[object Object]`
4. hostile response data (huge strings, control characters, prototype keys) renders bounded, single-line, and pollutes nothing
5. `staleness` formatting passes the f6 lexicon sweep (a stale widget states age; it does not scold the service)

`daemon/tests/endpoints.rs`:
6. `auth = "bearer:<name>"` resolves from the secrets file; a missing secret fails the endpoint at load with a named error rather than polling unauthenticated
7. `auth = "cmd:…"` executes as argv (never a shell string) and trims exactly one trailing newline
8. **a resolved secret never appears in any log line, error message, or event payload** — asserted by seeding a sentinel secret and grepping all emitted output
9. a non-2xx or timed-out poll retains the last good value and marks it stale; backoff reaches but does not exceed the ceiling
10. redirects to a different host are refused (a redirect is not a place to re-send a bearer token)
11. an endpoint declaring no `actions` 404s every write attempt, including well-formed ones
12. endpoint config with a non-https url is refused unless the host is loopback (a plaintext token on a network path is a bug, not a preference)

## 5. Visual states — `overlay/test/visual/scenarios.d/k5-remote.sh`

Mock HTTPS endpoint on loopback, logging requests:

1. **widget with a value** — fresh poll rendered in the statusbar
2. **stale marking** — mock stopped: value retained with the age marker, one transition line, no error spew
3. **recovery** — mock restarted: marker clears without a browser restart
4. **panel** — `:remote powerhouse` rows from the projection, x3-filterable
5. **no credentials in the browser** — the scenario greps the browser's own request log: every request went to `127.0.0.1`, and the sentinel token appears nowhere in browser-side state
6. **action confirms** — `remote_action` requires the confirm step; the mock log shows nothing until it is given

## 6. Non-goals (budget protection)

- **No credentials in the browser, in any form** — not a token, not a cookie, not a session. This is the reason the daemon exists.
- **No tunnel management** — no wireguard config, no mesh keys, no interface control.
- **No generic HTTP client exposed to mods or scripts.** Endpoints are declared in the daemon's config by me; a facade that can call arbitrary URLs is an exfiltration channel with extra steps.
- **No write actions by default**, no inferred REST semantics, no "it's a PUT so it's probably safe."
- **No service-specific dashboards or rich rendering** — one widget string and one row projection per endpoint.
- **No alerting, thresholds, or notifications** on remote values. A widget you can glance at is the feature; a browser that interrupts me about queue depth is not.
- **No response caching to disk** — last value in memory, gone on restart.
