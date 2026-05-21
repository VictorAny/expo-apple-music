import type { MusicKitInstance } from './musickit-types';

/** MusicKit JS `authorizationStatus` values (StoreKit). */
export const MusicKitAuthorizationStatus = {
  UNAVAILABLE: -1,
  NOT_DETERMINED: 0,
  DENIED: 1,
  RESTRICTED: 2,
  AUTHORIZED: 3,
} as const;

export type AuthStatusValue =
  | 'authorized'
  | 'denied'
  | 'notDetermined'
  | 'restricted'
  | 'unknown';

/** MusicKit JS `authorize()` resolves with a music user token string on success. */
function isMusicUserTokenString(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 20 && !trimmed.toLowerCase().includes('authorized');
}

function fromAuthorizationStatus(status: number): AuthStatusValue {
  switch (status) {
    case MusicKitAuthorizationStatus.AUTHORIZED:
      return 'authorized';
    case MusicKitAuthorizationStatus.DENIED:
      return 'denied';
    case MusicKitAuthorizationStatus.RESTRICTED:
      return 'restricted';
    case MusicKitAuthorizationStatus.NOT_DETERMINED:
      return 'notDetermined';
    default:
      return 'unknown';
  }
}

/**
 * Map MusicKit JS authorize() return values and instance flags to bridge `AuthStatus`.
 * `authorize()` may return a music user token string, not a status label.
 */
export function authStatusFromMusicKit(
  music: MusicKitInstance,
  authorizeResult?: unknown,
): AuthStatusValue {
  if (music.isAuthorized) {
    return 'authorized';
  }

  if (music.isRestricted) {
    return 'restricted';
  }

  if (typeof authorizeResult === 'number') {
    return fromAuthorizationStatus(authorizeResult);
  }

  if (typeof authorizeResult === 'string') {
    const value = authorizeResult.toLowerCase();
    if (value.includes('authorized')) {
      return 'authorized';
    }
    if (value.includes('denied') || value.includes('not_authorized')) {
      return 'denied';
    }
    if (value.includes('restricted')) {
      return 'restricted';
    }
    if (value.includes('not_determined')) {
      return 'notDetermined';
    }
    if (isMusicUserTokenString(authorizeResult)) {
      return 'authorized';
    }
  }

  if (typeof music.authorizationStatus === 'number') {
    return fromAuthorizationStatus(music.authorizationStatus);
  }

  return 'unknown';
}

export function authStatusFromAuthorizeError(error: unknown): AuthStatusValue {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  const normalized = message.toLowerCase();
  if (
    normalized.includes('restricted') ||
    normalized.includes('subscription') ||
    normalized.includes('no_subscription')
  ) {
    return 'restricted';
  }
  if (
    normalized.includes('cancel') ||
    normalized.includes('denied') ||
    normalized.includes('unauthorized') ||
    normalized.includes('authorization_error')
  ) {
    return 'denied';
  }
  return 'unknown';
}
