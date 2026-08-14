# d6 — Per-Workspace Network Identity (proxy routing by workspace)

## 1. Today → Instead → Thinnest

**Today**: workspaces isolate cookies and storage through containers (f5), but every workspace shares one network identity. My `work` tabs and my `personal` tabs leave the machine from the same address, which makes the isolation half a story — and switching a system VPN to change that switches it for everything, including the thing I was in the middle of.

**Instead**: the workspace *is* the network identity. Switching from `personal` to `work` changes egress along with cookies. No other browser does this well, and it composes with machinery already built rather than adding a concept.

**Thinnest**: Firefox's proxy prefs are per-profile, but privileged JS can register a **proxy channel filter** (`nsIProtocolProxyService.registerChannelFilter`) that decides per request. If that works as documented, per-workspace routing is a filter plus a mapping table and no daemon at all for the SOCKS case. The daemon's role is only to *provide* the egress when it isn't already there.

> **Spike-gated.** This spec assumes `registerChannelFilter` is usable from the overlay's chrome context, can resolve a request to its owning tab (and therefore workspace), and applies before connection. That must be proven by a throwaway ~20-line spike **before this spec is built**; it is the one load-bearing assumption. If it fails, the fallback is coarser and documented in §6 — profile-level proxy switching on workspace change, which is uglier and racier and might be rejected outright.

## 2. Exact behavior

**Mapping**:

```toml
[workspaces.network]
work     = "socks5://127.0.0.1:1080"    # e.g. an ssh -D or wireguard-bound proxy
personal = "direct"
research = "socks5://127.0.0.1:1081"
default  = "direct"                      # unlisted workspaces
```

Only `direct`, `socks5://`, `socks4://`, `http://` and `https://` proxy URLs are accepted, and **the host must be loopback** — the same rule as f7 and d1. A remote proxy address in the browser is a credential-bearing network path in the wrong process; if egress is remote, a local listener fronts it and the daemon or `ssh`/`wg` owns that hop.

**Resolution**: the filter maps a channel → its loading tab → that tab's workspace → the proxy entry. Channels with no attributable tab (favicons for chrome UI, browser-internal fetches, the f7 gateway, d1's daemon socket) resolve to a **fixed, explicit** rule rather than the current workspace's: internal traffic is always `direct` to loopback, and never routed through a workspace proxy. Otherwise switching workspaces would silently reroute the AI gateway.

**Failure is closed, loudly.** If a workspace's proxy is unreachable, requests in that workspace **fail** — they do not fall back to direct. A network-identity feature that silently degrades to your real address is worse than not having it, because you'd trust it. The statusbar `network` widget shows the active workspace's egress (`net: socks 1080` / `net: direct` / `net: down`), and `down` is unmissable.

**Verification, not assumption**: `:net_check` fetches an IP-echo endpoint **through the daemon**, per workspace, and reports what the outside world actually sees. A claim about egress that you can't check is a claim you shouldn't make. Results are shown, never stored.

**Interaction with containers**: containers (f5) and proxy rules are orthogonal and both keyed by workspace, so no new identity concept appears. A tab moved between workspaces (r4's action) changes both its container and its egress — which is the correct and possibly surprising behavior, so the move action names it.

**TOML surface**: as above, plus the widget:

```toml
[statusbar]
widgets = ["mode", "workspace", "network", "url", "msg", "clock", "date"]
```

New registry commands: `net_check` (`read`), `net_reload` (`mutate-local`). No command sets a proxy directly — routing comes from config, so an agent or a script can never move my traffic.

## 3. Pure vs glue

- **`aether-network.sys.mjs`** (pure): `parseProxy(url)` → `{type, host, port} | error`, enforcing the loopback rule; `resolveFor(map, workspace, isInternal)` → the proxy entry, with the internal-traffic override; `renderWidget(state)`; `validateMap(table)` → normalized map plus named rejections.
- **`aether.uc.js`** (glue): the channel filter registration, channel→tab→workspace attribution, filter teardown on workspace deletion, health probe.
- **daemon (Rust)**: `netcheck.rs` — the IP-echo call, so the check itself doesn't leak from the browser.

## 4. Unit tests (behavioral) — `overlay/test/unit/d6-network.test.mjs`

1. `parseProxy` accepts the four schemes on loopback hosts and rejects every non-loopback host, including `0.0.0.0`, a public IP, a hostname, and an IPv6 non-loopback (rejection is unavailability, never a fallback — f7's phrasing and f7's rule)
2. `direct` is valid and distinct from an unset entry
3. `resolveFor`: a mapped workspace gets its proxy; an unmapped one gets `default`; **internal traffic always resolves to direct regardless of workspace** (asserted for the gateway and daemon cases specifically)
4. a workspace mapped to an invalid proxy resolves to **fail-closed**, never to direct (the load-bearing safety property, asserted explicitly)
5. `validateMap` names rejected entries and keeps valid ones; an entirely invalid map yields all-fail-closed rather than all-direct
6. `renderWidget` for direct / proxied / down states; `down` is visually distinct and passes the lexicon sweep
7. resolution is pure and total: an unknown workspace, a null workspace, and a missing map each resolve deterministically without throwing

Glue-level assertions live in the visual scenario, since channel filtering can't be unit-tested off-browser.

## 5. Visual states — `overlay/test/visual/scenarios.d/k6-network.sh`

Two loopback SOCKS proxies with distinguishable exit behavior (each tagging responses), plus a fixture echo server:

1. **workspace A routes through proxy 1** — echo page shows proxy 1's tag; widget shows the socks state
2. **workspace switch changes egress** — same page in workspace B shows proxy 2's tag, no restart, no reload of the other workspace's tabs
3. **direct workspace** — echo shows no proxy tag
4. **fail-closed** — kill proxy 1: requests in workspace A fail visibly, widget shows `down`, and the scenario asserts the echo server received **nothing** from that workspace (no silent direct fallback — the single most important assertion in this spec)
5. **internal traffic unaffected** — with a workspace proxy down, the f7 mock gateway still receives its request (internal override proven)
6. **`:net_check`** reports per-workspace egress matching the proxy tags

## 6. Non-goals (budget protection)

- **No VPN management.** No wireguard config, no tunnel lifecycle, no kill-switch for the whole machine. `wg-quick` exists.
- **No remote proxy addresses in browser config** — loopback fronts only.
- **No per-tab or per-site proxy rules.** Workspace granularity only; a per-site rule table is a routing engine, and routing engines grow.
- **No proxy authentication** in the browser (a proxy needing credentials is fronted by a local listener that holds them).
- **No automatic proxy discovery**, no PAC files, no WPAD — all three are remote-controlled routing, which is the opposite of the point.
- **No fingerprint or user-agent changes.** Network identity here means egress path, not anti-fingerprinting; conflating them would over-claim protection that isn't there.
- **No fallback-to-direct, ever, under any failure.** Not a preference — the feature's meaning depends on it.

**If the spike fails**: the fallback is switching `network.proxy.*` prefs on workspace change. It is racy (in-flight requests from the previous workspace may use the new proxy), it is not per-request, and it may be judged not worth shipping. That judgement happens after the spike, with data — not now, and not by stretching this spec to cover both.
