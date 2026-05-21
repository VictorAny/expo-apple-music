import { callNative } from '../api/call-native';
import { assertLibraryId } from '../api/library-ids';
import { paginationBridgePayload } from '../api/pagination';
import { requireMusicUserToken } from '../api/require-music-user-token';
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
  public static async getPlaylists(
    musicUserToken: string,
    options?: PaginationOptions,
  ): Promise<PlaylistsResponse> {
    requireMusicUserToken(musicUserToken, 'Library.getPlaylists');
    return callNative('Library.getPlaylists', async () =>
      (await MusicModule.getUserPlaylists(
        musicUserToken,
        paginationBridgePayload(options),
      )) as PlaylistsResponse,
    );
  }

  public static async getSongs(
    musicUserToken: string,
    options?: PaginationOptions,
  ): Promise<LibrarySongsResponse> {
    requireMusicUserToken(musicUserToken, 'Library.getSongs');
    return callNative('Library.getSongs', async () =>
      (await MusicModule.getLibrarySongs(
        musicUserToken,
        paginationBridgePayload(options),
      )) as LibrarySongsResponse,
    );
  }

  public static async getPlaylistTracks(
    musicUserToken: string,
    playlistId: string,
    options?: PaginationOptions,
  ): Promise<PlaylistSongsResponse> {
    requireMusicUserToken(musicUserToken, 'Library.getPlaylistTracks');
    assertLibraryId(playlistId, 'playlistId');
    return callNative('Library.getPlaylistTracks', async () =>
      (await MusicModule.getPlaylistSongs(
        musicUserToken,
        playlistId,
        paginationBridgePayload(options),
      )) as PlaylistSongsResponse,
    );
  }

  public static async getArtists(
    musicUserToken: string,
    options?: PaginationOptions,
  ): Promise<ArtistsResponse> {
    requireMusicUserToken(musicUserToken, 'Library.getArtists');
    return callNative('Library.getArtists', async () =>
      (await MusicModule.getLibraryArtists(
        musicUserToken,
        paginationBridgePayload(options),
      )) as ArtistsResponse,
    );
  }

  public static async getAlbums(
    musicUserToken: string,
    options?: PaginationOptions,
  ): Promise<AlbumsResponse> {
    requireMusicUserToken(musicUserToken, 'Library.getAlbums');
    return callNative('Library.getAlbums', async () =>
      (await MusicModule.getLibraryAlbums(
        musicUserToken,
        paginationBridgePayload(options),
      )) as AlbumsResponse,
    );
  }

  public static async getMusicVideos(
    musicUserToken: string,
    options?: PaginationOptions,
  ): Promise<LibraryMusicVideosResponse> {
    requireMusicUserToken(musicUserToken, 'Library.getMusicVideos');
    return callNative('Library.getMusicVideos', async () =>
      (await MusicModule.getLibraryMusicVideos(
        musicUserToken,
        paginationBridgePayload(options),
      )) as LibraryMusicVideosResponse,
    );
  }

  public static async search(
    musicUserToken: string,
    term: string,
    types: LibrarySearchType[],
    options?: PaginationOptions,
  ): Promise<LibrarySearch> {
    requireMusicUserToken(musicUserToken, 'Library.search');
    return callNative('Library.search', async () =>
      (await MusicModule.librarySearch(
        musicUserToken,
        term,
        types,
        paginationBridgePayload(options),
      )) as LibrarySearch,
    );
  }
}

export default Library;
