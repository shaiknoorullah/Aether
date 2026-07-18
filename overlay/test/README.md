# Aether Overlay Tests

Two layers, zero npm dependencies.

## unit/ — node:test on pure `.sys.mjs` modules

```sh
node --test overlay/test/unit/        # from the repo root
```

Plain `node:test` + `node:assert` against the pure exported functions of the
overlay's `.sys.mjs` modules (e.g. `parseToml` / `deepMerge` in
`chrome/JS/aether-config.sys.mjs`). Test files are `*.test.mjs`;
`unit/index.js` is a shim that lets the bare directory path work as the test
target across Node versions — new test files need no registration.

**Purity rule**: anything imported by a unit test must be loadable in plain
Node. Browser/Gecko dependencies (`Services`, `IOUtils`, `PathUtils`, `Ci`,
actors, DOM) may only be touched inside functions that unit tests don't call —
injected or referenced lazily, never imported/dereferenced at module top level.
If a function needs a browser API, split the pure logic out and test that.

## visual/ — real-browser scenarios

```sh
overlay/test/visual/run.sh [scenario...]   # default: all of scenarios.d/
```

Launches a Gecko browser (LibreWolf in CI, any Firefox via `AETHER_APP_DIR`)
under Xvfb with the overlay wired in, drives it with xdotool, and captures
labeled screenshots to `visual/shots/` for review. This layer is where
keyboard interception, chrome hiding, and actor behavior get verified —
everything the purity rule keeps out of `unit/`.
