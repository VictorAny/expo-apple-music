import type { AuthStatus } from '../types/auth-status';
import type { AndroidAuthorizeOptions } from '../types/android-authorize-options';
import type { ICheckSubscription } from '../types/check-subscription';
import type { IStorefront } from '../types/storefront';
import { MusicModule } from '../native-module';

/**
 * Apple Music authorization and subscription checks.
 *
 * @see {@link https://github.com/wwdrew/expo-apple-music/blob/main/docs/AUTH.md} full auth guide (developer token, return values, requirements).
 */
class Auth {
  /**
   * Requests authorization to access the user's Apple Music account.
   *
   * **iOS** — Shows the system media-library permission dialog. The `developerToken` and
   * `options` arguments are ignored. Requires MusicKit on your App ID and
   * `NSAppleMusicUsageDescription` from the config plugin.
   *
   * **Android** — Requires a MusicKit **developer JWT** as `developerToken`. Opens the MusicKit
   * auth flow (optional upsell → Apple Music app).
   * Requires the Apple Music app installed and the user signed in with a subscription in most cases.
   *
   * @param developerToken - Android only. Signed JWT from your backend or Apple Developer tooling.
   * @param options - Android only. Upsell screen (`hideStartScreen`, `startScreenMessage`).
   * @returns {@link AuthStatus} — `authorized` | `denied` | `notDetermined` | `restricted` | `unknown`
   *
   * @throws On Android, rejects with `MISSING_DEVELOPER_TOKEN` when no developer JWT is provided.
   */
  public static async authorize(
    developerToken?: string,
    options?: AndroidAuthorizeOptions,
  ): Promise<AuthStatus> {
    const status = await MusicModule.authorization(
      developerToken ?? null,
      options?.startScreenMessage ?? null,
      options?.hideStartScreen ?? false,
    );
    return status as AuthStatus;
  }

  /**
   * Checks subscription capabilities via `MusicSubscription.current`.
   *
   * **iOS only** — Android rejects with `UNSUPPORTED_PLATFORM` until implemented.
   *
   * Call after `authorize()` returns `authorized` to see if the user can play catalog content.
   */
  public static async checkSubscription(): Promise<ICheckSubscription> {
    return (await MusicModule.checkSubscription()) as ICheckSubscription;
  }

  /** User's Apple Music storefront country code (e.g. `us`). Requires prior authorization. */
  public static async getStorefront(): Promise<IStorefront> {
    return (await MusicModule.getStorefront()) as IStorefront;
  }
}

export default Auth;
