import type { IPaginationOptions } from '../types/pagination';
import type { ISong } from '../types/song';
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
}

export default History;
