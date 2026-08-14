# d6 — Per-Workspace Network Identity (proxy routing by workspace)

## 1. Today → Instead → Thinnest

**Today**: workspaces isolate cookies and storage through containers (f5), but every workspace shares one network identity. My `work` tabs and my `personal` tabs leave the machine from the same address, which makes the isolation half a story — and switching a system VPN to change that switches it for everything, including the thing I was in the middle of.

**Instead**: the workspace *is* the network identity. Switching from `personal` to `work` changes egress along with cookies. No other browser does this well, and it composes with machinery already built rather than adding a concept.

**Thinnest**: Firefox's proxy prefs are per-profile, but privileged JS can register a **proxy channel filter** (`nsIProtocolProxyService.registerChannelFilter`) that decides per request. If that works as documented, per-workspace routing is a filter plus a mapping table and no daemon at all for the SOCKS case. The daemon's role is only to *provide* the egress when it isn't already there.

> **Spike-gated — and the spike must test the leak paths, not the happy path.** `registerChannelFilter` demonstrably works; it is the substrate of `browser.proxy.onRequest`. Registration is not the risk. The three things the spike must answer are: (1) can traffic be made to **fail** rather than fall back to direct, (2) **where does DNS go**, and (3) how complete is channel→tab→workspace **attribution** for prefetch, beacons, service workers and speculative connects. Concretely: kill the proxy and assert zero packets at a direct-path sniffer, and run `tcpdump port 53` for the duration. If those fail, the fallback in §6 is profile-level proxy switching on workspace change — racy, not per-request, and possibly not worth shipping.

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

**Resolution**: the filter maps a channel → its loading tab → that tab's workspace → the proxy entry.

**Internal-direct is a destination allowlist, not an attribution fallback.** Defining "internal" as "no attributable tab" would make every attribution *failure* egress directly — and the channels that plausibly lack an owning tab are exactly the sensitive ones: service-worker fetches (a site registered in a proxied workspace keeps fetching direct, with its cookies, after the tab closes), OCSP requests (carrying the certificate serial of the site you just loaded), favicons, beacons, `<a ping>`, and speculative connects. In a fail-closed feature the unknown bucket must block, not bypass. So: internal-direct matches on **destination** — the f7 gateway's host:port, d1's daemon host:port, `about:`/`chrome:` protocol handlers — and anything else with no resolvable workspace fails closed. Service workers, OCSP and favicons are named explicitly in the implementation, and any residual case is listed as a known limitation rather than silently allowed.

**Failure is closed — which Gecko does not do by default and which `applyFilter` cannot express.** Three platform behaviors sit *below* the filter and each one defeats a naive implementation:

1. `network.proxy.failover_direct` defaults **true**: when the proxies in a channel's chain fail, Necko retries DIRECT.
2. `nsProtocolProxyService` keeps a failed-proxy blocklist (`network.proxy.retry_timeout`, 1800s) — after one refused connection, later channels *skip* the proxy entirely.
3. `applyFilter` has **no "block" return value**. Returning no proxyInfo means DIRECT — so the obvious way to implement a fail-closed sentinel is precisely the leak.

Therefore: the overlay owns `network.proxy.failover_direct = false` and `network.proxy.allow_bypass = false` and asserts them at startup, and fail-closed is an **explicit act** — `channel.cancel(NS_ERROR_PROXY_CONNECTION_REFUSED)` from a request observer — never "return nothing". The statusbar `network` widget shows the active workspace's egress (`net: socks 1080` / `net: direct` / `net: down`), and `down` is unmissable.

**DNS is a separate problem and it is not fully solved.** A channel filter routes *connections*, not name resolution — and Mozilla bug [1799411](https://bugzilla.mozilla.org/show_bug.cgi?id=1799411) is **open** against `proxy.onRequest`, this same mechanism, covering HTTPS-RR/SVCB lookups, DNS prefetch and `browser.dns.resolve` escaping the proxy. `network.proxy.socks_remote_dns` is profile-wide, so a per-workspace design has no pref-level lever; the per-channel lever is `TRANSPARENT_PROXY_RESOLVES_HOST` on the proxyInfo, which does not reach every resolution site.

So this spec sets `TRANSPARENT_PROXY_RESOLVES_HOST` on every SOCKS5 proxyInfo, and the overlay owns `network.dns.disablePrefetch = true`, `network.predictor.enabled = false`, and HTTPS-RR resolution off — and then **states the residual leak plainly** rather than implying DNS is contained. Per-request proxying in Gecko today cannot fully control DNS; TCP goes through the proxy and some name lookups may not.

**WebRTC** does not use Necko channels and is unreachable by a channel filter, so a page in a proxied workspace could otherwise reveal the machine's real addresses. `media.peerconnection.ice.proxy_only = true` is set whenever any workspace has a non-direct proxy, and asserted. This is egress, not fingerprinting, so it is in scope rather than covered by §6's anti-fingerprinting disclaimer.

**Verification, not assumption**: `:net_check` loads an IP-echo endpoint **from a content channel in a real tab in the target workspace** — the only path that exercises the filter. Running it from the daemon would measure the *daemon's* egress, which is internal-direct by rule, and would prove nothing about whether the channel filter works; a verification that can't fail is the kind of claim §2 exists to avoid. Results are shown, never stored.

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
3. `resolveFor`: a mapped workspace gets its proxy; an unmapped one gets `default`; **a request to an allowlisted internal destination resolves direct regardless of workspace** (asserted for the gateway and daemon host:port specifically) while **a request with no resolvable workspace and a non-allowlisted destination fails closed** — the two halves asserted separately, since conflating them is the fail-open bug
4. a workspace mapped to an invalid proxy resolves to **fail-closed**, never to direct — and `fail-closed` is a distinct sentinel that glue must convert into `channel.cancel()`, asserted as a value distinct from "no proxy"
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
5. **fail-closed after Gecko has blocklisted the proxy** — kill the proxy, make one request so Necko marks it bad, *then* make more: still zero direct requests. Step 4 alone passes against an implementation that leaks on every subsequent channel
6. **prefs are actually set** — assert `failover_direct`, `allow_bypass`, `ice.proxy_only`, `dns.disablePrefetch` and `predictor.enabled` at their required values (prefs.js evidence, the method f6 already uses)
7. **DNS** — `tcpdump port 53` for the scenario's duration; the run records what leaked. This test *documents* the residual rather than asserting zero, because zero is not achievable today and a green test claiming otherwise would be the worst outcome
8. **internal traffic unaffected** — with a workspace proxy down, the f7 mock gateway still receives its request (destination allowlist proven)
9. **service worker does not bypass** — register a SW in a proxied workspace, close the tab, trigger a background fetch: it does not reach the direct path
10. **`:net_check`** reports per-workspace egress matching the proxy tags, measured from a content channel in each workspace

## 6. Non-goals (budget protection)

- **No VPN management.** No wireguard config, no tunnel lifecycle, no kill-switch for the whole machine. `wg-quick` exists.
- **No remote proxy addresses in browser config** — loopback fronts only.
- **No per-tab or per-site proxy rules.** Workspace granularity only; a per-site rule table is a routing engine, and routing engines grow.
- **No proxy authentication** in the browser (a proxy needing credentials is fronted by a local listener that holds them).
- **No automatic proxy discovery**, no PAC files, no WPAD — all three are remote-controlled routing, which is the opposite of the point.
- **No fingerprint or user-agent changes.** Network identity here means egress path, not anti-fingerprinting; conflating them would over-claim protection that isn't there. WebRTC *is* in scope, because it is egress.
- **No fallback-to-direct, ever, under any failure.** Not a preference — the feature's meaning depends on it, and delivering it requires the two prefs and the explicit cancel above, not just a filter that declines to name a proxy.
- **No claim that DNS is contained.** Per-request proxying in Gecko cannot fully control name resolution today (bug 1799411, open). The mitigations above narrow it; the residual is documented, and the visual scenario records what leaks rather than asserting a zero it cannot deliver.

**If the spike fails**: the fallback is switching `network.proxy.*` prefs on workspace change. It is racy (in-flight requests from the previous workspace may use the new proxy), it is not per-request, and it may be judged not worth shipping. That judgement happens after the spike, with data — not now, and not by stretching this spec to cover both.
