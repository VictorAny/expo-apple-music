import { callNative } from '../api/call-native';
import { assertLibraryId } from '../api/library-ids';
import { paginationBridgePayload } from '../api/pagination';
import type { AlbumsResponse } from '../types/albums-response';
import type { ArtistsResponse } from '../types/artist';
import type { LibraryMusicVideosResponse } from '../types/library-music-videos';
import type { LibrarySearch, LibrarySearchType } from '../types/library-search';
import type { PaginationOptions } from '../types/pagination';
import type { PlaylistSongsResponse, PlaylistsResponse } from '../types/playlist';
import type { Song } from '../types/song';
import { MusicModule } from '../native-module';

export interface LibrarySongsResponse {
  songs: Song[];
}

class Library {
  public static async getPlaylists(options?: PaginationOptions): Promise<PlaylistsResponse> {
    return callNative('Library.getPlaylists', async () =>
      (await MusicModule.getUserPlaylists(paginationBridgePayload(options))) as PlaylistsResponse,
    );
  }

  public static async getSongs(options?: PaginationOptions): Promise<LibrarySongsResponse> {
    return callNative('Library.getSongs', async () =>
      (await MusicModule.getLibrarySongs(paginationBridgePayload(options))) as LibrarySongsResponse,
    );
  }

  public static async getPlaylistTracks(
    playlistId: string,
    options?: PaginationOptions,
  ): Promise<PlaylistSongsResponse> {
    assertLibraryId(playlistId, 'playlistId');
    return callNative('Library.getPlaylistTracks', async () =>
      (await MusicModule.getPlaylistSongs(playlistId, paginationBridgePayload(options))) as PlaylistSongsResponse,
    );
  }

  public static async getArtists(options?: PaginationOptions): Promise<ArtistsResponse> {
    return callNative('Library.getArtists', async () =>
      (await MusicModule.getLibraryArtists(paginationBridgePayload(options))) as ArtistsResponse,
    );
  }

  public static async getAlbums(options?: PaginationOptions): Promise<AlbumsResponse> {
    return callNative('Library.getAlbums', async () =>
      (await MusicModule.getLibraryAlbums(paginationBridgePayload(options))) as AlbumsResponse,
    );
  }

  public static async getMusicVideos(
    options?: PaginationOptions,
  ): Promise<LibraryMusicVideosResponse> {
    return callNative('Library.getMusicVideos', async () =>
      (await MusicModule.getLibraryMusicVideos(
        paginationBridgePayload(options),
      )) as LibraryMusicVideosResponse,
    );
  }

  public static async search(
    term: string,
    types: LibrarySearchType[],
    options?: PaginationOptions,
  ): Promise<LibrarySearch> {
    return callNative('Library.search', async () =>
      (await MusicModule.librarySearch(term, types, paginationBridgePayload(options))) as LibrarySearch,
    );
  }
}

export default Library;
