// Shim so `node --test overlay/test/unit/` works even on Node versions that
// treat the positional argument as a glob (the glob matches this directory
// itself, which Node then executes as an entry point — resolving here).
// It loads every *.test.mjs beside it; node:test registers and runs them.
// New test files need no changes here.
const { readdirSync } = require("node:fs");
const { join } = require("node:path");
for (const f of readdirSync(__dirname).sort()) {
  if (f.endsWith(".test.mjs")) import(join(__dirname, f));
}
