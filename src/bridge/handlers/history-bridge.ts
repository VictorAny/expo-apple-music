import { paginationFromMap } from '../../web/pagination';
import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';
import { BridgeResponses } from '../bridge-responses';

export function createHistoryBridge(api: WebAppleMusicApiClient) {
  return {
    async getRecentlyPlayedResources() {
      const tracks = await api.getRecentlyPlayed();
      return BridgeResponses.recentlyPlayedResources(tracks);
    },

    async getRecentlyPlayedTracks(options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const songs = await api.getRecentlyPlayedTracks(pagination.limit);
      return BridgeResponses.songs(songs);
    },

    async getHeavyRotation(options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const items = await api.getHeavyRotation(pagination.limit);
      return BridgeResponses.recentItems(items);
    },

    async getRecentlyPlayedStations(options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const stations = await api.getRecentlyPlayedStations(pagination.limit);
      return BridgeResponses.stations(stations);
    },

    async getRecentlyAdded(options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const items = await api.getRecentlyAdded(pagination.limit, pagination.offset);
      return BridgeResponses.recentItems(items);
    },
  };
}
