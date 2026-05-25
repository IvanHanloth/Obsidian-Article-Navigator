/**
 * deploy.mjs — Copy plugin artifacts into an Obsidian vault's plugin folder.
 *
 * Usage (run after building):
 *   node deploy.mjs                        → copies into test_vault (default)
 *   VAULT_PATH=/path/to/vault node deploy.mjs
 *   node deploy.mjs /path/to/vault
 *
 * The script is intentionally dependency-free (Node built-ins only).
 */

import { copyFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { readFileSync } from 'fs';

// ── Resolve vault path ──────────────────────────────────────────────────────
const vaultPath = resolve(
  process.argv[2] ?? process.env.VAULT_PATH ?? 'test_vault',
);

// ── Read plugin ID from manifest ────────────────────────────────────────────
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const { id: pluginId, version } = manifest;

// ── Target directory ─────────────────────────────────────────────────────────
const dest = join(vaultPath, '.obsidian', 'plugins', pluginId);
mkdirSync(dest, { recursive: true });

// ── Files to copy ─────────────────────────────────────────────────────────────
const artifacts = ['main.js', 'manifest.json', 'styles.css'];

console.log(`\nDeploying ${pluginId} v${version} → ${dest}\n`);
for (const file of artifacts) {
  copyFileSync(file, join(dest, file));
  console.log(`  ✓  ${file}`);
}
console.log('\nDone. Reload the plugin in Obsidian to apply changes.\n');
