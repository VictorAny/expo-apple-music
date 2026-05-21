import { callNative } from '../api/call-native';
import { paginationBridgePayload } from '../api/pagination';
import { requireMusicUserToken } from '../api/require-music-user-token';
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
  public static async getRecentlyPlayedResources(musicUserToken: string): Promise<TracksFromLibrary> {
    requireMusicUserToken(musicUserToken, 'History.getRecentlyPlayedResources');
    return callNative('History.getRecentlyPlayedResources', async () =>
      (await MusicModule.getRecentlyPlayedResources(musicUserToken)) as TracksFromLibrary,
    );
  }

  public static async getRecentlyPlayedTracks(
    musicUserToken: string,
    options?: PaginationOptions,
  ): Promise<RecentlyPlayedTracksResponse> {
    requireMusicUserToken(musicUserToken, 'History.getRecentlyPlayedTracks');
    return callNative('History.getRecentlyPlayedTracks', async () =>
      (await MusicModule.getRecentlyPlayedTracks(
        musicUserToken,
        paginationBridgePayload(options),
      )) as RecentlyPlayedTracksResponse,
    );
  }

  public static async getHeavyRotation(
    musicUserToken: string,
    options?: PaginationOptions,
  ): Promise<RecentResourcesResponse> {
    requireMusicUserToken(musicUserToken, 'History.getHeavyRotation');
    return callNative('History.getHeavyRotation', async () =>
      (await MusicModule.getHeavyRotation(
        musicUserToken,
        paginationBridgePayload(options),
      )) as RecentResourcesResponse,
    );
  }

  public static async getRecentlyPlayedStations(
    musicUserToken: string,
    options?: PaginationOptions,
  ): Promise<StationsResponse> {
    requireMusicUserToken(musicUserToken, 'History.getRecentlyPlayedStations');
    return callNative('History.getRecentlyPlayedStations', async () =>
      (await MusicModule.getRecentlyPlayedStations(
        musicUserToken,
        paginationBridgePayload(options),
      )) as StationsResponse,
    );
  }

  public static async getRecentlyAdded(
    musicUserToken: string,
    options?: PaginationOptions,
  ): Promise<RecentResourcesResponse> {
    requireMusicUserToken(musicUserToken, 'History.getRecentlyAdded');
    return callNative('History.getRecentlyAdded', async () =>
      (await MusicModule.getRecentlyAdded(
        musicUserToken,
        paginationBridgePayload(options),
      )) as RecentResourcesResponse,
    );
  }
}

export default History;
