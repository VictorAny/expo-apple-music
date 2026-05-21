/**
 * Supplies a MusicKit developer JWT when the cached token is missing or near expiry.
 *
 * Implement with Remote Config, your API, Cloud Functions, etc. Never embed the `.p8` key in the app.
 *
 * @see {@link https://github.com/wwdrew/expo-apple-music/blob/main/docs/AUTH.md#developer-token-rotation}
 */
export type DeveloperTokenProvider = () => Promise<string>;

export type AppleMusicConfigureOptions = {
  /**
   * Called when a fresh developer JWT is needed (startup, before `authorize`, or when cached token expires).
   * Must return a non-empty signed JWT (max ~6 months per Apple).
   */
  getDeveloperToken: DeveloperTokenProvider;
  /**
   * Refresh this many seconds before JWT `exp`. Default `300` (5 minutes).
   */
  refreshBufferSeconds?: number;
};
