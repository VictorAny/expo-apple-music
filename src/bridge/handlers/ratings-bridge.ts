import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';

export function createRatingsBridge(api: WebAppleMusicApiClient) {
  return {
    getRating: (musicUserToken: string, resourceType: string, id: string) =>
      api.getRating(musicUserToken, resourceType, id),
    setRating: (musicUserToken: string, resourceType: string, id: string, value: number) =>
      api.setRating(musicUserToken, resourceType, id, value),
    clearRating: async (musicUserToken: string, resourceType: string, id: string) => {
      await api.clearRating(musicUserToken, resourceType, id);
    },
    addToFavorites: async (musicUserToken: string, resourceIds: Record<string, string[]>) => {
      await api.addToFavorites(musicUserToken, resourceIds);
    },
    removeFromFavorites: async (musicUserToken: string, resourceIds: Record<string, string[]>) => {
      await api.removeFromFavorites(musicUserToken, resourceIds);
    },
  };
}
