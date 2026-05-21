import { Platform } from 'react-native';

import { AppleMusicErrorCode } from '../constants/apple-music-error-codes';
import { MusicModule } from '../native-module';
import type { AppleMusicConfigureOptions, DeveloperTokenProvider } from '../types/developer-token-provider';
import { configureMusicKit } from '../web/MusicKitLoader';
import { isJwtExpired } from './decode-jwt-exp';

let provider: DeveloperTokenProvider | null = null;
let refreshBufferSeconds = 300;
let cachedToken: string | null = null;

export function configureAppleMusic(options: AppleMusicConfigureOptions): void {
  provider = options.getDeveloperToken;
  if (options.refreshBufferSeconds != null) {
    refreshBufferSeconds = Math.max(0, options.refreshBufferSeconds);
  }
}

export function hasDeveloperTokenProvider(): boolean {
  return provider != null;
}

export function getCachedDeveloperToken(): string | null {
  return cachedToken;
}

export function isDeveloperTokenExpired(
  token: string,
  bufferSeconds: number = refreshBufferSeconds,
): boolean {
  return isJwtExpired(token, bufferSeconds);
}

function setCache(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) {
    throw {
      code: AppleMusicErrorCode.missingDeveloperToken,
      message: 'getDeveloperToken returned an empty string.',
    };
  }
  cachedToken = trimmed;
  return trimmed;
}

async function fetchFromProvider(): Promise<string> {
  if (!provider) {
    throw {
      code: AppleMusicErrorCode.missingDeveloperToken,
      message:
        'No developer JWT available. Pass Auth.authorize(token), call configureAppleMusic({ getDeveloperToken }), or set a provider.',
    };
  }
  return setCache(await provider());
}

/**
 * Resolves a developer JWT: explicit argument → valid cache → provider.
 */
export async function resolveDeveloperToken(explicit?: string): Promise<string | undefined> {
  if (explicit?.trim()) {
    return setCache(explicit);
  }
  if (cachedToken && !isDeveloperTokenExpired(cachedToken)) {
    return cachedToken;
  }
  if (provider) {
    return fetchFromProvider();
  }
  return cachedToken ?? undefined;
}

/** Pushes the developer JWT to native storage (iOS/Android) or MusicKit JS (web). */
export async function syncDeveloperTokenToPlatform(token: string): Promise<void> {
  const trimmed = token.trim();
  if (!trimmed) {
    return;
  }
  if (Platform.OS === 'web') {
    await configureMusicKit(trimmed);
    return;
  }
  await MusicModule.setDeveloperToken(trimmed);
}

/**
 * Fetches a fresh JWT from the provider (if configured), updates cache, and syncs to the platform.
 */
export async function refreshDeveloperToken(): Promise<string> {
  const token = provider ? await fetchFromProvider() : cachedToken;
  if (!token) {
    throw {
      code: AppleMusicErrorCode.missingDeveloperToken,
      message: 'configureAppleMusic({ getDeveloperToken }) before refreshDeveloperToken().',
    };
  }
  await syncDeveloperTokenToPlatform(token);
  return token;
}

/**
 * Ensures a non-expired developer JWT is cached and synced to native / MusicKit JS.
 */
export async function ensureDeveloperToken(explicit?: string): Promise<string> {
  const token = await resolveDeveloperToken(explicit);
  if (!token) {
    throw {
      code: AppleMusicErrorCode.missingDeveloperToken,
      message:
        'Apple Music developer JWT is required. Pass Auth.authorize(token) or configureAppleMusic({ getDeveloperToken }).',
    };
  }
  await syncDeveloperTokenToPlatform(token);
  return token;
}
