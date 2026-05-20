#!/usr/bin/env node
/**
 * Copy root fixtures/*.json (API inputs) into android/src/test/resources/fixtures/
 * so Kotlin bridge-contract tests use the same files as TypeScript.
 */
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'fixtures');
const destDir = join(root, 'android/src/test/resources/fixtures');

mkdirSync(destDir, { recursive: true });

for (const name of readdirSync(srcDir)) {
  if (!name.endsWith('.json')) continue;
  copyFileSync(join(srcDir, name), join(destDir, name));
  console.log(`synced fixtures/${name} → android test resources`);
}
