import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';

export function createRatingsBridge(api: WebAppleMusicApiClient) {
  return {
    getRating: (resourceType: string, id: string) => api.getRating(resourceType, id),
    setRating: (resourceType: string, id: string, value: number) => api.setRating(resourceType, id, value),
    clearRating: async (resourceType: string, id: string) => {
      await api.clearRating(resourceType, id);
    },
    addToFavorites: async (resourceIds: Record<string, string[]>) => {
      await api.addToFavorites(resourceIds);
    },
    removeFromFavorites: async (resourceIds: Record<string, string[]>) => {
      await api.removeFromFavorites(resourceIds);
    },
  };
}
