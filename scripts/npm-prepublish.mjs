#!/usr/bin/env node
/**
 * Remove local Android Gradle outputs before npm pack/publish.
 * The `files` field only ships android/src/main, but a prior local build can
 * leave android/build/ on disk; this keeps publish deterministic.
 */
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('..', import.meta.url)));
for (const dir of ['android/build', 'android/.gradle']) {
  rmSync(join(root, dir), { recursive: true, force: true });
}
