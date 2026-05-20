import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';
import { BridgeResponses } from '../bridge-responses';

export function createRecommendationsBridge(api: WebAppleMusicApiClient) {
  return {
    async getRecommendations(ids: string[] | null) {
      const recommendations = await api.getRecommendations(ids);
      return BridgeResponses.recommendations(recommendations);
    },

    async getReplay(year: number | null) {
      const summaries = await api.getReplay(year);
      return BridgeResponses.replaySummaries(summaries);
    },
  };
}
