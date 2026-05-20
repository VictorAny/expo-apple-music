import { callNative } from '../api/call-native';
import { assertLibraryId } from '../api/library-ids';
import { paginationBridgePayload } from '../api/pagination';
import type { AlbumsResponse } from '../types/albums-response';
import type { ArtistsResponse } from '../types/artist';
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
}

export default Library;
