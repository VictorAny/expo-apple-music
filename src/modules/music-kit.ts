import type { CatalogSearchType, ICatalogSearch } from '../types/catalog-search';
import type { MusicItem } from '../types/music-item';
import type { IPlaylistsResponse, IPlaylistSongsResponse } from '../types/playlist';
import type { ISong } from '../types/song';
import type { ITracksFromLibrary } from '../types/tracks-from-library';
import { MusicModule } from '../native-module';

export interface IEndlessListOptions {
  offset?: number;
  limit?: number;
}

export interface ILibrarySongsResponse {
  songs: ISong[];
}

class MusicKit {
  public static async catalogSearch(
    search: string,
    types: CatalogSearchType[],
    options?: IEndlessListOptions,
  ): Promise<ICatalogSearch> {
    return (await MusicModule.catalogSearch(search, types, options ?? {})) as ICatalogSearch;
  }

  public static async setPlaybackQueue(itemId: string, type: MusicItem): Promise<void> {
    await MusicModule.setPlaybackQueue(itemId, type);
  }

  public static async getTracksFromLibrary(): Promise<ITracksFromLibrary> {
    return (await MusicModule.getTracksFromLibrary()) as ITracksFromLibrary;
  }

  public static async getUserPlaylists(options?: IEndlessListOptions): Promise<IPlaylistsResponse> {
    return (await MusicModule.getUserPlaylists(options ?? {})) as IPlaylistsResponse;
  }

  public static async getLibrarySongs(
    options?: IEndlessListOptions,
  ): Promise<ILibrarySongsResponse> {
    return (await MusicModule.getLibrarySongs(options ?? {})) as ILibrarySongsResponse;
  }

  public static async getPlaylistSongs(
    playlistId: string,
    options?: IEndlessListOptions,
  ): Promise<IPlaylistSongsResponse> {
    return (await MusicModule.getPlaylistSongs(playlistId, options ?? {})) as IPlaylistSongsResponse;
  }

  public static async playLibrarySong(songId: string): Promise<void> {
    await MusicModule.playLibrarySong(songId);
  }

  public static async playLibraryPlaylist(playlistId: string, startingAt = -1): Promise<void> {
    await MusicModule.playLibraryPlaylist(playlistId, startingAt);
  }
}

export default MusicKit;
