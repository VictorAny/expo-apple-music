import type { AlbumsResponse } from '../types/albums-response';
import type { ArtistsResponse } from '../types/artist';
import type { PaginationOptions } from '../types/pagination';
import type { PlaylistSongsResponse, PlaylistsResponse } from '../types/playlist';
import type { Song } from '../types/song';
import { MusicModule } from '../native-module';
import MusicKit from './music-kit';

export interface LibrarySongsResponse {
  songs: Song[];
}

class Library {
  public static async getPlaylists(options?: PaginationOptions): Promise<PlaylistsResponse> {
    return MusicKit.getUserPlaylists(options);
  }

  public static async getSongs(options?: PaginationOptions): Promise<LibrarySongsResponse> {
    return MusicKit.getLibrarySongs(options);
  }

  public static async getPlaylistTracks(
    playlistId: string,
    options?: PaginationOptions,
  ): Promise<PlaylistSongsResponse> {
    return MusicKit.getPlaylistSongs(playlistId, options);
  }

  public static async getArtists(options?: PaginationOptions): Promise<ArtistsResponse> {
    return (await MusicModule.getLibraryArtists(options ?? {})) as ArtistsResponse;
  }

  public static async getAlbums(options?: PaginationOptions): Promise<AlbumsResponse> {
    return (await MusicModule.getLibraryAlbums(options ?? {})) as AlbumsResponse;
  }
}

export default Library;
