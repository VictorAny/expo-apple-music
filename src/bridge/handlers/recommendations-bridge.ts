import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';
import { BridgeResponses } from '../bridge-responses';

export function createRecommendationsBridge(api: WebAppleMusicApiClient) {
  return {
    async getRecommendations(musicUserToken: string, ids: string[] | null) {
      const recommendations = await api.getRecommendations(musicUserToken, ids);
      return BridgeResponses.recommendations(recommendations);
    },

    async getReplay(musicUserToken: string, year: number | null) {
      const summaries = await api.getReplay(musicUserToken, year);
      return BridgeResponses.replaySummaries(summaries);
    },
  };
}
