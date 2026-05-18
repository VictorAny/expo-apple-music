#!/usr/bin/env node
/**
 * Generate a MusicKit developer JWT for local Android auth testing.
 *
 * Requires a MusicKit private key (.p8) from Apple Developer → Keys.
 * Do not commit .p8 files or generated tokens to git.
 */

import { createSign } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ENV_MUSIC_FILE = '.env.music';

function loadEnvMusic() {
  const path = resolve(process.cwd(), ENV_MUSIC_FILE);
  if (!existsSync(path)) {
    return;
  }
  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const MAX_EXPIRY_SECONDS = 15_777_000; // ~6 months (Apple Music API limit)

function usage() {
  console.log(`Usage: expo-apple-music-dev-token [options]
       expo-apple-music-dev-token --verify <jwt> [--storefront us]

Generate or verify a MusicKit developer JWT (ES256).

Generate — environment (shell or .env.music in repo root):
  APPLE_MUSIC_TEAM_ID          Apple Developer Team ID
  APPLE_MUSIC_KEY_ID           MusicKit key ID
  APPLE_MUSIC_PRIVATE_KEY_PATH Path to AuthKey_XXXX.p8

Generate options:
  --team-id <id>           Team ID (iss claim)
  --key-id <id>            Key ID (JWT kid header)
  --private-key <path>     Path to .p8 private key file
  --expires-in <duration>  Token lifetime (default: 1d). Suffix: s, m, h, d
  --write-env <path>       Write EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=… to file

Verify options:
  --verify <jwt>           Decode JWT and call Apple Music API (no Apple Music app)
  --storefront <code>      Catalog storefront for verify request (default: us)

  -h, --help               Show this help

Examples:
  npm run dev-token
  npm run dev-token -- --write-env example/.env.local
  npm run dev-token -- --verify "$(grep EXPO_PUBLIC example/.env.local | cut -d= -f2)"
`);
}

function parseDuration(value) {
  const match = /^(\d+)(s|m|h|d)?$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration "${value}". Use e.g. 1d, 12h, 30m.`);
  }
  const amount = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multipliers[unit];
}

function parseArgs(argv) {
  const options = {
    expiresIn: '1d',
    writeEnv: null,
    verifyToken: null,
    storefront: 'us',
    teamId: process.env.APPLE_MUSIC_TEAM_ID,
    keyId: process.env.APPLE_MUSIC_KEY_ID,
    privateKeyPath: process.env.APPLE_MUSIC_PRIVATE_KEY_PATH,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }
    const readValue = () => {
      const next = argv[i + 1];
      if (!next || next.startsWith('-')) {
        throw new Error(`Missing value for ${arg}`);
      }
      i += 1;
      return next;
    };
    switch (arg) {
      case '--team-id':
        options.teamId = readValue();
        break;
      case '--key-id':
        options.keyId = readValue();
        break;
      case '--private-key':
        options.privateKeyPath = readValue();
        break;
      case '--expires-in':
        options.expiresIn = readValue();
        break;
      case '--write-env':
        options.writeEnv = readValue();
        break;
      case '--verify':
        options.verifyToken = readValue();
        break;
      case '--storefront':
        options.storefront = readValue();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function decodeJwt(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Not a JWT: expected three dot-separated segments');
  }
  const decodePart = (part, label) => {
    try {
      return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
    } catch {
      throw new Error(`Could not decode JWT ${label}`);
    }
  };
  return {
    header: decodePart(parts[0], 'header'),
    payload: decodePart(parts[1], 'payload'),
  };
}

function formatUnixTime(seconds) {
  return `${new Date(seconds * 1000).toISOString()} (${seconds})`;
}

async function verifyDeveloperToken(token, storefront) {
  let header;
  let payload;
  try {
    ({ header, payload } = decodeJwt(token));
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }

  console.log('JWT header:', JSON.stringify(header, null, 2));
  console.log('JWT payload:', JSON.stringify(payload, null, 2));

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number') {
    if (payload.exp <= now) {
      console.error(`✗ Token expired at ${formatUnixTime(payload.exp)}`);
    } else {
      console.log(`✓ Not expired (exp ${formatUnixTime(payload.exp)})`);
    }
  } else {
    console.warn('? No exp claim in payload');
  }

  if (header.alg !== 'ES256') {
    console.warn(`? Unexpected alg: ${header.alg} (expected ES256)`);
  }
  if (!header.kid) {
    console.warn('? Missing kid in header');
  }
  if (!payload.iss) {
    console.warn('? Missing iss (Team ID) in payload');
  }

  const url = new URL(
    `https://api.music.apple.com/v1/catalog/${encodeURIComponent(storefront)}/search`,
  );
  url.searchParams.set('term', 'test');
  url.searchParams.set('types', 'songs');
  url.searchParams.set('limit', '1');

  console.log(`\nCalling Apple Music API: ${url.pathname}${url.search}`);

  let response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token.trim()}` },
    });
  } catch (error) {
    console.error(`✗ Network error: ${error.message}`);
    process.exit(1);
  }

  if (response.ok) {
    console.log(`✓ Apple Music API accepted token (HTTP ${response.status})`);
    console.log('  Developer JWT is valid for catalog API calls.');
    console.log('  Full Auth.authorize() still requires completing the Apple Music app flow.');
    return;
  }

  const body = await response.text();
  console.error(`✗ Apple Music API rejected token (HTTP ${response.status})`);
  if (body) {
    console.error(body.slice(0, 500));
  }
  process.exit(1);
}

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signDeveloperToken({ teamId, keyId, privateKeyPem, expiresInSeconds }) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSeconds;
  if (expiresInSeconds > MAX_EXPIRY_SECONDS) {
    throw new Error(
      `Expiry exceeds Apple maximum (~6 months). Got ${expiresInSeconds}s, max ${MAX_EXPIRY_SECONDS}s.`,
    );
  }

  const header = { alg: 'ES256', kid: keyId };
  const payload = { iss: teamId, iat: now, exp };

  const encodedHeader = base64urlJson(header);
  const encodedPayload = base64urlJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const sign = createSign('SHA256');
  sign.update(signingInput);
  sign.end();

  const signature = sign.sign({
    key: privateKeyPem,
    format: 'pem',
    dsaEncoding: 'ieee-p1363',
  });

  return `${signingInput}.${signature.toString('base64url')}`;
}

async function main() {
  loadEnvMusic();

  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    usage();
    process.exit(1);
  }

  if (options.help) {
    usage();
    process.exit(0);
  }

  if (options.verifyToken) {
    await verifyDeveloperToken(options.verifyToken, options.storefront);
    return;
  }

  const { teamId, keyId, privateKeyPath } = options;
  if (!teamId || !keyId || !privateKeyPath) {
    console.error(
      'Missing credentials. Set APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID, and APPLE_MUSIC_PRIVATE_KEY_PATH, or pass --team-id, --key-id, --private-key.',
    );
    usage();
    process.exit(1);
  }

  let privateKeyPem;
  try {
    privateKeyPem = readFileSync(resolve(privateKeyPath), 'utf8');
  } catch {
    console.error(`Could not read private key at ${privateKeyPath}`);
    process.exit(1);
  }

  let expiresInSeconds;
  try {
    expiresInSeconds = parseDuration(options.expiresIn);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const token = signDeveloperToken({
    teamId,
    keyId,
    privateKeyPem,
    expiresInSeconds,
  });

  if (options.writeEnv) {
    const envPath = resolve(options.writeEnv);
    const line = `EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=${token}\n`;
    writeFileSync(envPath, line, { flag: 'w' });
    console.error(`Wrote ${envPath}`);
  } else {
    console.log(token);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
