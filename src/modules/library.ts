import type { IAlbumsResponse } from '../types/albums-response';
import type { IArtistsResponse } from '../types/artist';
import type { IPaginationOptions } from '../types/pagination';
import type { IPlaylistsResponse, IPlaylistSongsResponse } from '../types/playlist';
import type { ISong } from '../types/song';
import { MusicModule } from '../native-module';
import MusicKit from './music-kit';

export interface ILibrarySongsResponse {
  songs: ISong[];
}

class Library {
  public static async getPlaylists(options?: IPaginationOptions): Promise<IPlaylistsResponse> {
    return MusicKit.getUserPlaylists(options);
  }

  public static async getSongs(options?: IPaginationOptions): Promise<ILibrarySongsResponse> {
    return MusicKit.getLibrarySongs(options);
  }

  public static async getPlaylistTracks(
    playlistId: string,
    options?: IPaginationOptions,
  ): Promise<IPlaylistSongsResponse> {
    return MusicKit.getPlaylistSongs(playlistId, options);
  }

  public static async getArtists(options?: IPaginationOptions): Promise<IArtistsResponse> {
    return (await MusicModule.getLibraryArtists(options ?? {})) as IArtistsResponse;
  }

  public static async getAlbums(options?: IPaginationOptions): Promise<IAlbumsResponse> {
    return (await MusicModule.getLibraryAlbums(options ?? {})) as IAlbumsResponse;
  }
}

export default Library;
