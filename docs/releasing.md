# Releasing

A release is a tag. Everything after `git push origin vX.Y.Z` is automated by
`.github/workflows/release.yml`; everything before it is a deliberate act.

## Cut a release

A version is complete or it isn't (`docs/feature-matrix-build.md`) — only tag a
version the build matrix marks complete.

1. On `main`, in one commit (`chore(release): vX.Y.Z`):
   - `overlay/VERSION` → `X.Y.Z` (drop any `-dev` suffix)
   - `docs/releases/vX.Y.Z.md` from `docs/releases/TEMPLATE.md` — the Highlights,
     in your words
   - `git-cliff --tag vX.Y.Z --output CHANGELOG.md` (regenerates the file with
     the new section; `pipx run git-cliff …` if it is not installed)
2. `git tag -s vX.Y.Z -m "Aether X.Y.Z"` (signed if you have a key; annotated
   either way) and `git push origin main vX.Y.Z`.
3. Watch the `release` workflow. It refuses to publish if the tag and
   `overlay/VERSION` disagree, if the unit tests fail, or if the glue file is
   over its ceiling.
4. Next commit on `main`: bump `overlay/VERSION` to the next `-dev`.

## What the workflow does

| Step | Automated |
|---|---|
| tag == `overlay/VERSION` check | yes |
| `node --test overlay/test/unit/` + `scripts/check-budget.sh` | yes |
| `aether-X.Y.Z.tar.gz` — `git archive` of the installable tree, `gzip -n` (same tag → same bytes) | yes |
| `SHA256SUMS` | yes |
| SLSA build-provenance attestation (Sigstore, `actions/attest-build-provenance`) | yes |
| Release notes = `docs/releases/vX.Y.Z.md` + `git-cliff --latest` + install/verify block | yes |
| GitHub release via `gh release create --verify-tag` | yes |
| Visual suite (`overlay/test/visual/run.sh`) | **no** — needs Xvfb + a browser; run it locally before tagging |
| The monthly Firefox drill | **no** — see `docs/execution-plan.md` Standing Drills |

Supply chain: every action is pinned to a full commit SHA (dependabot bumps
them monthly), workflows default to `permissions: {}` and grant per job,
checkout never persists credentials, the release job has no caches, and
git-cliff is installed from a hash-pinned wheel
(`.github/release-requirements.txt`).

## Verify a release

```sh
gh release download vX.Y.Z --repo shaiknoorullah/Aether
sha256sum -c SHA256SUMS
gh attestation verify aether-X.Y.Z.tar.gz --repo shaiknoorullah/Aether
```

The attestation proves the tarball was built by this repository's release
workflow from the tagged commit — not that the code is good.

## Tags to create once (history)

Only `v1.1.0` exists. The changelog's sections assume:

| Tag | Commit | What |
|---|---|---|
| `v1.0.0` | `9820777` | Merge PR #2 — the seven-feature floor (2026-07-18) |
| `v1.1.0` | `dff9aec` | exists — Merge PR #3 (2026-08-13) |
| `v1.2.0` | the merge of the v1.2.0 glue PR | not yet — v1.2.0's wiring is not on `main` |

`git tag -a v1.0.0 9820777 -m "Aether 1.0.0" && git push origin v1.0.0` —
pushing a historical tag publishes nothing: GitHub runs the workflow file as it
exists at the tagged commit, and `release.yml` does not exist there. Make a
GitHub release for it by hand if you want one.
