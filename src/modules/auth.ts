import { Platform } from 'react-native';

import { callNative } from '../api/call-native';
import {
  ensureDeveloperToken,
  refreshDeveloperToken,
  resolveDeveloperToken,
  syncDeveloperTokenToPlatform,
} from '../api/developer-token';
import { parseAuthorizeResult } from '../api/parse-authorize-result';
import { requireMusicUserToken } from '../api/require-music-user-token';
import type { AndroidAuthorizeOptions } from '../types/android-authorize-options';
import type { AuthorizeResult } from '../types/authorize-result';
import type { CheckSubscription } from '../types/check-subscription';
import type { Storefront } from '../types/storefront';
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
   * Returns `musicUserToken` when `status` is `authorized` — store it in your app (e.g. Zustand).
   * The native module does not persist the music user token.
   *
   * @throws On Android and web, rejects with `MISSING_DEVELOPER_TOKEN` when no developer JWT is available
   * (argument or {@link AppleMusic.configure} provider).
   */
  public static async authorize(
    developerToken?: string,
    options?: AndroidAuthorizeOptions,
  ): Promise<AuthorizeResult> {
    return callNative('Auth.authorize', async () => {
      let token: string | null = null;
      if (Platform.OS === 'android' || Platform.OS === 'web') {
        token = await ensureDeveloperToken(developerToken);
      } else {
        const resolved = await resolveDeveloperToken(developerToken);
        if (resolved) {
          await syncDeveloperTokenToPlatform(resolved);
          token = resolved;
        }
      }
      const raw = await MusicModule.authorization(
        token,
        options?.startScreenMessage ?? null,
        options?.hideStartScreen ?? false,
      );
      return parseAuthorizeResult(raw);
    });
  }

  /**
   * Fetches a fresh developer JWT from your `configureAppleMusic` provider and syncs it to native / web.
   * Call on app startup or when API responses suggest an expired developer token.
   */
  public static async refreshDeveloperToken(): Promise<string> {
    return callNative('Auth.refreshDeveloperToken', () => refreshDeveloperToken());
  }

  public static async checkSubscription(musicUserToken: string): Promise<CheckSubscription> {
    requireMusicUserToken(musicUserToken, 'Auth.checkSubscription');
    return callNative('Auth.checkSubscription', async () =>
      (await MusicModule.checkSubscription(musicUserToken)) as CheckSubscription,
    );
  }

  public static async getStorefront(musicUserToken: string): Promise<Storefront> {
    requireMusicUserToken(musicUserToken, 'Auth.getStorefront');
    return callNative('Auth.getStorefront', async () =>
      (await MusicModule.getStorefront(musicUserToken)) as Storefront,
    );
  }
}

export default Auth;
