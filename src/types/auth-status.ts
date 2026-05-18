/**
 * Result of {@link Auth.authorize}. Same values on iOS and Android.
 *
 * @see {@link https://github.com/wwdrew/expo-apple-music/blob/main/docs/AUTH.md} for platform mapping and handling guide.
 */
export const AuthStatus = {
  /** User completed authorization. On Android, the music user token is stored natively. */
  AUTHORIZED: 'authorized',
  /** User dismissed the flow or declined access (includes Android upsell / Apple Music cancel). */
  DENIED: 'denied',
  /** iOS: authorization has not been requested yet. */
  NOT_DETERMINED: 'notDetermined',
  /** Cannot use Apple Music for this flow (e.g. no subscription on Android, parental controls on iOS). */
  RESTRICTED: 'restricted',
  /** Error or unrecognized result (e.g. invalid developer token on Android). */
  UNKNOWN: 'unknown',
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];
