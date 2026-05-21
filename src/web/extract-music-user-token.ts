import type { MusicKitInstance } from './musickit-types';

/** Music user token from MusicKit JS `authorize()` when it returns a token string. */
export function extractMusicUserToken(
  music: MusicKitInstance,
  authorizeResult?: unknown,
): string | undefined {
  if (typeof authorizeResult === 'string') {
    const trimmed = authorizeResult.trim();
    if (trimmed.length > 20 && !trimmed.toLowerCase().includes('authorized')) {
      return trimmed;
    }
  }
  const fromInstance = (music as { musicUserToken?: string }).musicUserToken;
  if (typeof fromInstance === 'string' && fromInstance.trim().length > 0) {
    return fromInstance.trim();
  }
  return undefined;
}
