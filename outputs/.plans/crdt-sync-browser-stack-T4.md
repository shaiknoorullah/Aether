# T4: E2E Encryption + Key Management for P2P CRDT Sync

Research encryption and key management patterns for no-cloud, P2P, CRDT-based browser sync. Cover:

1. **Encryption layer placement**: Encrypt CRDT operations vs encrypt serialized documents vs encrypt transport. Trade-offs of each.
2. **Key exchange protocols**:
   - Noise Protocol Framework (used by WireGuard, Lightning)
   - X3DH + Double Ratchet (Signal protocol) — applicability to async P2P
   - MLS (Messaging Layer Security, RFC 9420) — group key agreement, tree-based ratcheting
3. **Key management UX**:
   - Device addition/removal flow
   - Key rotation strategies
   - Recovery (social recovery, backup keys, seed phrases)
   - Cross-device verification (QR codes, safety numbers)
4. **Existing implementations**:
   - Matrix/Element (Vodozemac, MLS migration)
   - Signal (libsignal)
   - Keybase (per-device keys, paper keys)
   - Iroh's built-in encryption (if any)
5. **CRDT-specific challenges**: Merging encrypted operations, selective sharing, access control lists on CRDT documents
6. **Performance**: Encryption overhead on sync operations, key derivation costs

Use web search and official docs. Do NOT fetch PDF files. Write findings to `outputs/.drafts/crdt-sync-browser-stack-research-T4.md` with source URLs for every claim.
