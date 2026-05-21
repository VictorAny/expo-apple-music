import { callNative } from '../api/call-native';
import { requireMusicUserToken } from '../api/require-music-user-token';
import type {
  RecommendationsOptions,
  RecommendationsResponse,
  ReplayOptions,
  ReplayResponse,
} from '../types/recommendation';
import { MusicModule } from '../native-module';

class Recommendations {
  public static async get(
    musicUserToken: string,
    options?: RecommendationsOptions,
  ): Promise<RecommendationsResponse> {
    requireMusicUserToken(musicUserToken, 'Recommendations.get');
    return callNative('Recommendations.get', async () =>
      (await MusicModule.getRecommendations(musicUserToken, options?.ids)) as RecommendationsResponse,
    );
  }

  public static async getReplay(
    musicUserToken: string,
    options?: ReplayOptions,
  ): Promise<ReplayResponse> {
    requireMusicUserToken(musicUserToken, 'Recommendations.getReplay');
    return callNative('Recommendations.getReplay', async () =>
      (await MusicModule.getReplay(musicUserToken, options?.year)) as ReplayResponse,
    );
  }
}

export default Recommendations;
