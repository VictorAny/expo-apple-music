import { callNative } from '../api/call-native';
import { paginationBridgePayload } from '../api/pagination';
import type { PaginationOptions } from '../types/pagination';
import type { RecentResourcesResponse } from '../types/recent-resource';
import type { Song } from '../types/song';
import type { StationsResponse } from '../types/station';
import type { TracksFromLibrary } from '../types/tracks-from-library';
import { MusicModule } from '../native-module';

export interface RecentlyPlayedTracksResponse {
  songs: Song[];
}

class History {
  /** Recently played albums, playlists, and stations (mixed containers). */
  public static async getRecentlyPlayedResources(): Promise<TracksFromLibrary> {
    return callNative('History.getRecentlyPlayedResources', async () =>
      (await MusicModule.getTracksFromLibrary()) as TracksFromLibrary,
    );
  }

  /** Recently played songs — use for listening history / artist inference. */
  public static async getRecentlyPlayedTracks(
    options?: PaginationOptions,
  ): Promise<RecentlyPlayedTracksResponse> {
    return callNative('History.getRecentlyPlayedTracks', async () =>
      (await MusicModule.getRecentlyPlayedTracks(paginationBridgePayload(options))) as RecentlyPlayedTracksResponse,
    );
  }

  /** Resources the user plays most often (API may return an empty list). */
  public static async getHeavyRotation(
    options?: PaginationOptions,
  ): Promise<RecentResourcesResponse> {
    return callNative('History.getHeavyRotation', async () =>
      (await MusicModule.getHeavyRotation(paginationBridgePayload(options))) as RecentResourcesResponse,
    );
  }

  public static async getRecentlyPlayedStations(
    options?: PaginationOptions,
  ): Promise<StationsResponse> {
    return callNative('History.getRecentlyPlayedStations', async () =>
      (await MusicModule.getRecentlyPlayedStations(paginationBridgePayload(options))) as StationsResponse,
    );
  }

  /** Albums and playlists recently added to the user's library. */
  public static async getRecentlyAdded(
    options?: PaginationOptions,
  ): Promise<RecentResourcesResponse> {
    return callNative('History.getRecentlyAdded', async () =>
      (await MusicModule.getRecentlyAdded(paginationBridgePayload(options))) as RecentResourcesResponse,
    );
  }
}

export default History;
