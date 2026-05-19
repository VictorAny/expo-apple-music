import { WebAppleMusicApiClient } from './WebAppleMusicApiClient';
import * as errors from './apple-music-errors';
import { getMusic } from './MusicKitLoader';

export class WebSubscriptionService {
  constructor(private readonly api = new WebAppleMusicApiClient()) {}

  async checkSubscription(): Promise<Record<string, unknown>> {
    const music = await getMusic();
    if (!music.isAuthorized) {
      throw errors.missingTokens();
    }

    const libraryOk = await this.api.probeLibraryAccess();
    const canPlay = libraryOk;

    return {
      canPlayCatalogContent: canPlay,
      canBecomeSubscriber: false,
      hasCloudLibraryEnabled: libraryOk,
      isMusicCatalogSubscriptionEligible: false,
    };
  }
}
