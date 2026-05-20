import { configureMusicKit } from '../../web/MusicKitLoader';
import { authStatusFromAuthorizeError, authStatusFromMusicKit } from '../../web/map-auth-status';
import * as errors from '../../web/apple-music-errors';
import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';
import type { WebSubscriptionService } from '../../web/WebSubscriptionService';
import { BridgeResponses } from '../bridge-responses';

function requireDeveloperToken(developerToken: string | null | undefined): string {
  if (!developerToken?.trim()) {
    throw errors.missingDeveloperToken();
  }
  return developerToken.trim();
}

export function createAuthBridge(api: WebAppleMusicApiClient, subscription: WebSubscriptionService) {
  return {
    async authorization(
      developerToken: string | null,
      _startScreenMessage: string | null,
      _hideStartScreen: boolean | null,
    ): Promise<string> {
      const token = requireDeveloperToken(developerToken);
      const music = await configureMusicKit(token);
      if (music.isAuthorized) {
        return 'authorized';
      }
      try {
        const result = await music.authorize();
        return authStatusFromMusicKit(music, result);
      } catch (error) {
        return authStatusFromAuthorizeError(error);
      }
    },

    checkSubscription: () => subscription.checkSubscription(),

    async getStorefront() {
      const id = await api.getStorefront();
      return BridgeResponses.storefront(id);
    },
  };
}
