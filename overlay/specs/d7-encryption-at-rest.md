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
- **`aetherd` is the only decryptor.** The overlay asks the daemon for a store's plaintext over d1's authenticated loopback channel, and the daemon decides. That is what makes the token file's `0600` mode load-bearing, and why d1 refuses a world-readable token.

### Envelope

XChaCha20-Poly1305, random 24-byte nonce per record, AAD binding `{store, recordId, schemaVersion}` so a record cannot be moved between stores or replayed at an older schema. Version byte first, because a format that can't be migrated is a format you're stuck with.

### Degradation — the property that keeps this from ruining my week

**Encryption is off by default** (`[crypto] enabled = false`) and the browser is fully functional without it. When it is on and the daemon is unavailable, encrypted stores are **unreadable, not lost**: affected features render an explicit locked state (`graveyard: locked — daemon not running`), and nothing is silently recreated empty. Writing into a locked store is refused rather than overwriting ciphertext with plaintext. The failure mode I am designing against is not an attacker; it is me, at 1am, watching a browser cheerfully replace my encrypted graveyard with an empty one.

**Migration** is explicit and reversible: `:crypto_encrypt` converts plaintext stores in place (write ciphertext to a temp path, fsync, rename, per f4's atomic pattern), `:crypto_decrypt` converts back. Both refuse to run with the daemon unavailable, both are idempotent, and neither runs automatically on upgrade.

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
4. the overlay module exports **no** decryption, key-handling, or primitive function — an inventory assertion, so key material cannot leak into chrome by a later well-meaning refactor
5. `lockedState` copy passes the f6 lexicon sweep (a locked store is a state, not a scolding)

`daemon/tests/envelope.rs`:
6. round-trip encrypt/decrypt for empty, small, and 10 MB payloads
7. a modified ciphertext, nonce, or tag fails authentication and returns an error — never partial plaintext
8. **AAD binding**: a record's ciphertext moved to a different `store` or `recordId` fails to decrypt; replaying it under an older `schemaVersion` fails
9. nonces are unique across 100k encryptions (a repeated nonce is catastrophic for this cipher, so it is asserted, not assumed)
10. per-store subkeys differ; one store's key cannot decrypt another's records
11. key rotation re-encrypts a store and leaves old ciphertext undecryptable by the new key and vice versa
12. migration is atomic: a simulated crash mid-migration leaves either the complete plaintext or the complete ciphertext file, never a truncated one
13. `crypto_decrypt` after `crypto_encrypt` yields byte-identical original records (reversibility, asserted end to end)
14. with the keyring unavailable, the daemon reports locked and **refuses writes** rather than writing plaintext into an encrypted store

## 5. Visual states — `overlay/test/visual/scenarios.d/k7-crypto.sh`

Mock daemon with a fixed test key:

1. **encryption off** — stores are plaintext; scenario greps a known title out of the graveyard file (the baseline, proving the test can detect plaintext)
2. **after `:crypto_encrypt`** — the same grep finds **nothing**; the graveyard panel still works normally through the daemon
3. **locked state** — daemon stopped: `:graveyard` shows the locked state naming the daemon, and the file is asserted byte-identical afterward (nothing recreated, nothing overwritten)
4. **write refused while locked** — closing a tab while locked does not append plaintext to the encrypted store
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
