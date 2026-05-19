import type {
  RecommendationsOptions,
  RecommendationsResponse,
  ReplayOptions,
  ReplayResponse,
} from '../types/recommendation';
import { MusicModule } from '../native-module';

class Recommendations {
  /**
   * Personalized recommendations (Made for You mixes, etc.).
   * Omit `ids` to load all recommendations (MusicKit on iOS, REST on Android).
   */
  public static async get(options?: RecommendationsOptions): Promise<RecommendationsResponse> {
    return (await MusicModule.getRecommendations(options?.ids)) as RecommendationsResponse;
  }

  /**
   * Apple Music Replay summaries (`GET /v1/me/music-summaries`).
   * Requires sufficient listening history; may 404 for ineligible accounts/years.
   */
  public static async getReplay(options?: ReplayOptions): Promise<ReplayResponse> {
    return (await MusicModule.getReplay(options?.year)) as ReplayResponse;
  }
}

export default Recommendations;
