import type { CatalogSearch, CatalogSearchType } from '../types/catalog-search';
import type { MusicItem } from '../types/music-item';
import type { PaginationOptions } from '../types/pagination';
import type { PlaylistSongsResponse, PlaylistsResponse } from '../types/playlist';
import type { Song } from '../types/song';
import type { TracksFromLibrary } from '../types/tracks-from-library';
import { MusicModule } from '../native-module';

/** @deprecated Use {@link PaginationOptions} */
export type EndlessListOptions = PaginationOptions;

export interface LibrarySongsResponse {
  songs: Song[];
}

class MusicKit {
  public static async catalogSearch(
    search: string,
    types: CatalogSearchType[],
    options?: EndlessListOptions,
  ): Promise<CatalogSearch> {
    return (await MusicModule.catalogSearch(search, types, options ?? {})) as CatalogSearch;
  }

  public static async setPlaybackQueue(itemId: string, type: MusicItem): Promise<void> {
    await MusicModule.setPlaybackQueue(itemId, type);
  }

  public static async getTracksFromLibrary(): Promise<TracksFromLibrary> {
    return (await MusicModule.getTracksFromLibrary()) as TracksFromLibrary;
  }

  public static async getUserPlaylists(options?: EndlessListOptions): Promise<PlaylistsResponse> {
    return (await MusicModule.getUserPlaylists(options ?? {})) as PlaylistsResponse;
  }

  public static async getLibrarySongs(
    options?: EndlessListOptions,
  ): Promise<LibrarySongsResponse> {
    return (await MusicModule.getLibrarySongs(options ?? {})) as LibrarySongsResponse;
  }

  public static async getPlaylistSongs(
    playlistId: string,
    options?: EndlessListOptions,
  ): Promise<PlaylistSongsResponse> {
    return (await MusicModule.getPlaylistSongs(playlistId, options ?? {})) as PlaylistSongsResponse;
  }

  public static async playLibrarySong(songId: string): Promise<void> {
    await MusicModule.playLibrarySong(songId);
  }

  public static async playLibraryPlaylist(playlistId: string, startingAt = -1): Promise<void> {
    await MusicModule.playLibraryPlaylist(playlistId, startingAt);
  }
}

export default MusicKit;
