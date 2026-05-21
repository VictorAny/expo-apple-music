import { Platform } from 'react-native';

import { callNative } from '../api/call-native';
import { parseAuthorizeResult } from '../api/parse-authorize-result';
import { requireMusicUserToken } from '../api/require-music-user-token';
import {
  requireDeveloperTokenString,
  syncDeveloperTokenToPlatform,
} from '../api/sync-developer-token';
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
   * Pass a **developer JWT** you obtained in your app (`developerToken`). On Android and web it is required.
   * On iOS it is optional (media-library permission can succeed without it); when provided it is stored for REST.
   *
   * Returns `musicUserToken` when `status` is `authorized` — store it in your app (e.g. Zustand).
   * The native module does not persist the music user token.
   *
   * @throws On Android and web, rejects with `MISSING_DEVELOPER_TOKEN` when `developerToken` is missing or blank.
   */
  public static async authorize(
    developerToken?: string,
    options?: AndroidAuthorizeOptions,
  ): Promise<AuthorizeResult> {
    return callNative('Auth.authorize', async () => {
      const requiresDeveloperToken = Platform.OS === 'android' || Platform.OS === 'web';
      let token: string | null = null;
      if (requiresDeveloperToken) {
        token = requireDeveloperTokenString(developerToken, 'Auth.authorize');
        await syncDeveloperTokenToPlatform(token);
      } else if (developerToken?.trim()) {
        token = developerToken.trim();
        await syncDeveloperTokenToPlatform(token);
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
   * Stores a developer JWT on native / MusicKit JS without re-running user sign-in.
   * Your app fetches or mints the token; this method only applies the string you pass.
   */
  public static async setDeveloperToken(developerToken: string): Promise<void> {
    return callNative('Auth.setDeveloperToken', async () => {
      const token = requireDeveloperTokenString(developerToken, 'Auth.setDeveloperToken');
      await syncDeveloperTokenToPlatform(token);
    });
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
