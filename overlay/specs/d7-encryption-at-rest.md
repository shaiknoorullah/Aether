# d7 — Encryption at Rest (one crypto story, keys outside the browser)

## 1. Today → Instead → Thinnest

**Today**: everything Aether knows about me is plaintext JSON in a profile directory — the graveyard (every tab I ever closed), workspaces, scroll positions, bookmarks, history attribution, frecency, and soon a timeline of my working days and tasks pulled from my VPS. That is fine against nothing and it becomes actively bad the moment any of it syncs between machines, which is decision #3's whole direction.

**Instead**: encrypt the content, keep the keys in the daemon, and reuse the pattern already decided rather than inventing a second one — decision #3's Yjs E2EE model: **encrypt content values, leave structural metadata clear**, the Proton Docs approach. Doing this before sync exists means sync inherits it instead of retrofitting it.

**Thinnest**: one envelope format, one key hierarchy, and a store shim the existing persistence paths call instead of writing plaintext. No new storage engine, no per-feature crypto decisions, and no key material in chrome JS at any point.

## 2. Exact behavior

### What is encrypted, and what deliberately isn't

| Encrypted | Clear |
|---|---|
| urls, titles, tab names, tags | record ids, timestamps, schema versions |
| bookmark and history content | array lengths, workspace ids |
| timeline labels, task text | file structure |
| daemon secrets and endpoint tokens | which stores exist |

Structure stays clear because CRDT merge needs it (the Proton Docs bargain, adopted knowingly): an attacker with the file learns *that* I had 400 closed tabs and when, not *what* they were. That is the honest description of the protection, and it is the description that goes in the README rather than "encrypted."

### Keys

- A **master key** lives in the OS keyring (`libsecret`) or an `age` identity file (`0600`), held by `aetherd`. The browser never sees it — not the key, not a derived key, not a handle that could be replayed by another local process.
- Per-store subkeys derived with HKDF, so compromising one store's key doesn't unlock the rest, and rotating one store is possible.
- **`aetherd` is the only decryptor.** The overlay asks the daemon for a store's plaintext over d1's authenticated loopback channel, and the daemon decides.

**What this protects, stated honestly** (d1's threat model, applied here): backups, a stolen or discarded disk, and dotfile sync. It does **not** protect a live session against malware running as me — that process reads d1's token and asks the daemon to decrypt, exactly as the browser does. Encryption at rest is not live-session protection and this spec does not imply otherwise.

- **There is a recovery path, and it is mandatory before encrypting.** `:crypto_encrypt` refuses to run until `:crypto_export_key` has been invoked once and acknowledged; it prints recovery material to store wherever `age` identities are stored. A lost keyring (a login-password change, a corrupted keyring db, an OS reinstall) otherwise makes the graveyard, bookmarks, workspaces and timeline permanently unreadable — and, correctly per the design above, *not deleted*, so they sit on disk forever as garbage that can't be confidently removed. For a personal tool that is a larger real-world risk than the attacker being defended against.
- `aetherd` is a user service and may start before the graphical session unlocks the keyring, so the keyring is **re-acquired on a retry loop** rather than latched as locked until a daemon restart.

### Envelope

XChaCha20-Poly1305, random 24-byte nonce per record, AAD binding `{version, store, recordId, schemaVersion, keyId}`. The version byte is *inside* the AAD, not merely first on the wire — an unauthenticated version byte is the one value an attacker can flip to select which parser runs. `keyId` makes "wrong key" and "corrupt ciphertext" distinguishable, which rotation needs.

AAD binding prevents moving a record between stores and replaying it at an older schema. It does **not** prevent whole-file rollback: an older copy of the store authenticates perfectly. A monotonic per-store generation counter in a signed store header covers that, and it matters more once decision #3's sync exists and a stale peer can offer one.

### Degradation — the property that keeps this from ruining my week

**Encryption is off by default** (`[crypto] enabled = false`) and the browser is fully functional without it. When a store is encrypted and the daemon is unavailable, it is **unreadable, not lost**: affected features render an explicit locked state (`graveyard: locked — daemon not running`), and nothing is silently recreated empty. The failure mode I am designing against is not an attacker; it is me, at 1am, watching a browser cheerfully replace my encrypted graveyard with an empty one.

**That guarantee is currently false in shipped code, and this spec fixes it first.** `aether-graveyard-service.sys.mjs:33-41` catches *every* read error and calls `deserialize(text)`, which returns an **empty store** on unparseable input (`aether-graveyard.sys.mjs:69-73`); `_persist()` then does `IOUtils.writeUTF8(path, text, {tmpPath})` — an atomic rename over the file, no backup. `aether-workspaces-service.sys.mjs` is identical. Both are named in this spec's default `stores` array. So turning on `[crypto]` and restarting the daemon at the wrong moment, then closing one tab, destroys the entire graveyard. The existing design is not merely silent about this guarantee; it is engineered against it, on purpose — "tolerant by design — a missing/corrupt file must never brick".

So, as a precondition of this feature (and worth doing regardless of whether encryption is ever enabled):

- **"Absent" and "unreadable" become different states.** A missing file starts empty, which is correct. A file that exists and cannot be parsed returns a `LOCKED` sentinel that is **not an empty collection**.
- **A store whose last read did not return a store never persists.** The write path checks, refuses, and surfaces — rather than logging to `console.error` where nothing sees it.
- **`backupFile` is added to both writes**, so even a clobber is recoverable.
- Refused writes are **buffered in memory and flushed on unlock**, and the locked state is shown in the consuming surface *before* the first write is refused — otherwise "the tab is gone forever" is the silent outcome and a scenario asserting "no plaintext was appended" would certify it as a pass.

**Encryption state is a property of the bytes, never of the config.** `isEncrypted(blob)` runs on **every** store read unconditionally, whatever `[crypto] enabled`, `stores`, or `[daemon] enabled` say. Otherwise the easy paths are the dangerous ones: flipping `enabled = false` to debug something, dropping a store from the array, or carrying a stale dotfile to a second machine all route the plain reader at ciphertext, which "starts empty" and clobbers on first write. A store whose file is encrypted while crypto is off is a locked state naming the mismatch, and it refuses writes.

**Migration** is explicit and reversible: `:crypto_encrypt` converts plaintext stores, `:crypto_decrypt` converts back. Both refuse to run with the daemon unavailable, both are idempotent, and neither runs automatically on upgrade.

The atomicity needs stating precisely, because f4's pattern does not provide what it is usually credited with: `IOUtils.writeUTF8(path, text, {tmpPath})` performs a rename but **no fsync** and no parent-directory fsync. So migration writes with `flush: true` plus a parent-directory fsync. And the on-disk layout is **one file of many envelopes per store**, not a file per record — with a file per record, "atomic migration" is not achievable by one rename, and a crash leaves a half-encrypted store, which is exactly the mixed state where a plain reader sees partial garbage and the clobber above fires on the survivors.

**TOML surface**:

```toml
[crypto]
enabled = false
stores  = ["graveyard", "bookmarks", "timeline", "workspaces"]   # opt in per store
```

New registry commands: `crypto_status` (`read`), `crypto_encrypt`, `crypto_decrypt` (`dangerous` — they rewrite every record in a store, and v2.1's policy must never auto-run them).

## 3. Pure vs glue

- **`aether-crypto.sys.mjs`** (pure, overlay-side — **no key material, no primitives**): `isEncrypted(blob)`; `envelopeHeader(blob)` → `{version, store, recordId}` for routing; `lockedState(store)` → the display state. The overlay's crypto module deliberately cannot decrypt anything; it can only recognize that something is encrypted and ask.
- **daemon (Rust)**: `keys.rs` (keyring/age, HKDF derivation, rotation), `envelope.rs` (XChaCha20-Poly1305, AAD binding, version byte), `stores.rs` (per-store encrypt/decrypt, atomic migration).
- **`aether.uc.js`** (glue): store reads/writes routed through the daemon when a store is encrypted; locked-state rendering in each consumer.

## 4. Unit tests (behavioral)

`overlay/test/unit/d7-crypto.test.mjs`:
1. `isEncrypted` distinguishes an envelope from plaintext JSON, including a JSON document that *starts with* envelope-looking bytes
2. `envelopeHeader` parses version/store/recordId and rejects a truncated or corrupt header without throwing
3. an unknown envelope version yields a locked state naming the version, never an attempted parse
4. **`deserialize` returns a `LOCKED` sentinel, not an empty store**, for ciphertext and for unparseable input — and the sentinel is not array-like, not iterable, and fails any truthiness check a caller might use to mean "empty"
5. **the write path refuses when the last read was not a store**: a simulated read failure followed by a `bury()` performs no write at all (the shipped-code bug, pinned as a regression test)
6. all four states of `{file encrypted, not} × {crypto on, off}` refuse writes whenever the file is encrypted — including with crypto configured off, since encryption is a property of the bytes
7. refused writes buffer and flush on unlock, in order, with nothing dropped
8. the overlay module exports **no** decryption, key-handling, or primitive function — an inventory assertion, so key material cannot leak into chrome by a later well-meaning refactor
9. `lockedState` copy passes the f6 lexicon sweep (a locked store is a state, not a scolding)

`daemon/tests/envelope.rs`:
10. round-trip encrypt/decrypt for empty, small, and 10 MB payloads
11. a modified ciphertext, nonce, or tag fails authentication and returns an error — never partial plaintext
12. **AAD binding**: a record's ciphertext moved to a different `store` or `recordId` fails to decrypt; replaying it under an older `schemaVersion` fails; **flipping the version byte** fails, since it is inside the AAD
13. a whole-store rollback to an older file is detected by the generation counter (the case AAD binding does *not* cover)
14. nonces are unique across 100k encryptions (a repeated nonce is catastrophic for this cipher, so it is asserted, not assumed)
15. per-store subkeys differ; one store's key cannot decrypt another's records
16. key rotation re-encrypts a store, `keyId` distinguishes wrong-key from corruption, and old ciphertext is undecryptable by the new key and vice versa
17. migration is atomic **at every record boundary**: a simulated crash after each record leaves either the complete plaintext or the complete ciphertext file, never a truncated or half-converted one
18. `crypto_decrypt` after `crypto_encrypt` yields byte-identical original records (reversibility, asserted end to end)
19. with the keyring unavailable, the daemon reports locked and **refuses writes** rather than writing plaintext into an encrypted store; a keyring that unlocks later is re-acquired without a daemon restart
20. `:crypto_encrypt` refuses until `:crypto_export_key` has been acknowledged, and the exported material decrypts a store on a machine with no keyring entry

## 5. Visual states — `overlay/test/visual/scenarios.d/k7-crypto.sh`

Mock daemon with a fixed test key:

1. **encryption off** — stores are plaintext; scenario greps a known title out of the graveyard file (the baseline, proving the test can detect plaintext)
2. **after `:crypto_encrypt`** — the same grep finds **nothing**; the graveyard panel still works normally through the daemon
3. **locked state** — daemon stopped: `:graveyard` shows the locked state naming the daemon, and the file is asserted byte-identical afterward (nothing recreated, nothing overwritten)
4. **write refused while locked, and not lost** — closing a tab while locked appends no plaintext, *and* the tab **reappears in the graveyard once the daemon returns**. Asserting only "no plaintext was appended" would certify the silent loss of the tab as a pass
5. **crypto off, file encrypted** — flip `[crypto] enabled = false` with an encrypted store on disk, close a tab: the store is still locked and still byte-identical, because encryption is a property of the bytes
5. **recovery** — daemon restarted: panel works again with all prior entries intact
6. **reversibility** — `:crypto_decrypt` restores plaintext identical to the step-1 file

## 6. Non-goals (budget protection)

- **No key material in the browser**, ever — not cached, not derived, not "just the public half."
- **No password prompt in the browser.** Unlocking is the daemon's business (keyring, or an `age` identity you unlock however you unlock it).
- **No encryption of Firefox's own stores** — Places, cookies, cache, sessionstore are Firefox's, and pretending otherwise would over-claim. Full-disk encryption is the honest answer for those.
- **No custom crypto.** One AEAD, one KDF, both from audited crates. No cipher selection, no config knob for algorithms.
- **No plausible deniability, hidden volumes, or anti-forensics.**
- **No sync in this spec** — this is at-rest only. It exists now so decision #3's sync inherits an envelope rather than inventing one.
- **No metadata protection.** Stated plainly here and in the README: structure is clear by design, and this protects content, not the shape of my activity.
