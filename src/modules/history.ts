import type { IPaginationOptions } from '../types/pagination';
import type { IRecentResourcesResponse } from '../types/recent-resource';
import type { ISong } from '../types/song';
import type { IStationsResponse } from '../types/station';
import type { ITracksFromLibrary } from '../types/tracks-from-library';
import { MusicModule } from '../native-module';
import MusicKit from './music-kit';

export interface IRecentlyPlayedTracksResponse {
  songs: ISong[];
}

class History {
  /** Recently played albums, playlists, and stations (mixed containers). */
  public static async getRecentlyPlayedResources(): Promise<ITracksFromLibrary> {
    return MusicKit.getTracksFromLibrary();
  }

  /** Recently played songs — use for listening history / artist inference. */
  public static async getRecentlyPlayedTracks(
    options?: IPaginationOptions,
  ): Promise<IRecentlyPlayedTracksResponse> {
    return (await MusicModule.getRecentlyPlayedTracks(options ?? {})) as IRecentlyPlayedTracksResponse;
  }

  /** Resources the user plays most often (API may return an empty list). */
  public static async getHeavyRotation(
    options?: IPaginationOptions,
  ): Promise<IRecentResourcesResponse> {
    return (await MusicModule.getHeavyRotation(options ?? {})) as IRecentResourcesResponse;
  }

  public static async getRecentlyPlayedStations(
    options?: IPaginationOptions,
  ): Promise<IStationsResponse> {
    return (await MusicModule.getRecentlyPlayedStations(options ?? {})) as IStationsResponse;
  }

  /** Albums and playlists recently added to the user's library. */
  public static async getRecentlyAdded(
    options?: IPaginationOptions,
  ): Promise<IRecentResourcesResponse> {
    return (await MusicModule.getRecentlyAdded(options ?? {})) as IRecentResourcesResponse;
  }
}

export default History;
