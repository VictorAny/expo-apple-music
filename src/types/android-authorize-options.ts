/**
 * Android-only options for {@link Auth.authorize}. Ignored on iOS.
 *
 * @see {@link https://github.com/wwdrew/expo-apple-music/blob/main/docs/AUTH.md#android-only-options}
 */
export type AndroidAuthorizeOptions = {
  /**
   * When `false` (default), show Apple’s connect/upsell screen before opening Apple Music.
   * When `true`, skip it and deeplink straight into Apple Music (`setHideStartScreen`).
   */
  hideStartScreen?: boolean;
  /**
   * Custom HTML message on the upsell screen (Apple `setStartScreenMessage`).
   * Ignored when `hideStartScreen` is `true`.
   */
  startScreenMessage?: string;
};
