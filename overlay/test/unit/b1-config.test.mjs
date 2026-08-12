// b1 — Config surface: [boosts] defaults + example-TOML sync guard (SDD RED).
// Spec: overlay/specs/b1-site-boosts-deterministic.md §2 "TOML surface",
// §4 test 19. The f0 sync guard extends to the b1 surface: DEFAULTS.boosts
// in aether-config.sys.mjs and the [boosts] section of the example
// overlay/config/aether.toml must never drift apart.
//
// Contract pinned here:
//   DEFAULTS.boosts = { enabled: true, dir: "~/.config/aether/boosts" }
//   enabled is the master switch (off = no reads, no applies, :zap
//   unavailable); dir holds the <domain>.css dotfiles.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { parseToml, AetherConfig } from "../../chrome/JS/aether-config.sys.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_TOML = join(HERE, "..", "..", "config", "aether.toml");

// 19. [boosts] defaults + the f0 sync guard -----------------------------------

test("config: DEFAULTS.boosts — master switch ON, dotfile dir under ~/.config/aether", () => {
  const boosts = AetherConfig.DEFAULTS.boosts;
  assert.ok(boosts, "DEFAULTS must carry a boosts section");
  assert.equal(boosts.enabled, true, "boosts are on by default — deterministic, zero AI, zero risk");
  assert.equal(boosts.dir, "~/.config/aether/boosts", "the <domain>.css dotfiles live with the config");
});

test("config: [boosts] joins without displacing existing defaults", () => {
  assert.equal(AetherConfig.DEFAULTS.options.hint_chars, "asdfghjkl", "pick mode reuses hint_chars");
  assert.equal(AetherConfig.DEFAULTS.ai.enabled, false, "boosts joins, never replaces");
});

test("config: example aether.toml [boosts] section parses identically to DEFAULTS", () => {
  const parsed = parseToml(readFileSync(EXAMPLE_TOML, "utf8"));
  assert.ok(parsed.boosts, "example aether.toml has no [boosts] section");
  assert.deepEqual(
    parsed.boosts,
    AetherConfig.DEFAULTS.boosts,
    "overlay/config/aether.toml [boosts] and DEFAULTS drifted apart",
  );
});
