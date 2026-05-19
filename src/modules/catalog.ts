import type { Album } from '../types/album';
import type { CatalogAlbumTracksResponse } from '../types/catalog-album-tracks';
import type { CatalogSearch, CatalogSearchType } from '../types/catalog-search';
import type { Artist } from '../types/artist';
import type { MusicVideo } from '../types/music-video';
import type { PaginationOptions } from '../types/pagination';
import type { Playlist } from '../types/playlist';
import type { Song } from '../types/song';
import type { Station } from '../types/station';
import { MusicModule } from '../native-module';

class Catalog {
  public static async search(
    term: string,
    types: CatalogSearchType[],
    options?: PaginationOptions,
  ): Promise<CatalogSearch> {
    return (await MusicModule.catalogSearch(term, types, options ?? {})) as CatalogSearch;
  }

  public static async getSong(id: string): Promise<Song> {
    return (await MusicModule.getCatalogSong(id)) as Song;
  }

  public static async getAlbum(id: string): Promise<Album> {
    return (await MusicModule.getCatalogAlbum(id)) as Album;
  }

  public static async getArtist(id: string): Promise<Artist> {
    return (await MusicModule.getCatalogArtist(id)) as Artist;
  }

  public static async getPlaylist(id: string): Promise<Playlist> {
    return (await MusicModule.getCatalogPlaylist(id)) as Playlist;
  }

  public static async getStation(id: string): Promise<Station> {
    return (await MusicModule.getCatalogStation(id)) as Station;
  }

  public static async getMusicVideo(id: string): Promise<MusicVideo> {
    return (await MusicModule.getCatalogMusicVideo(id)) as MusicVideo;
  }

  public static async getAlbumTracks(
    albumId: string,
    options?: PaginationOptions,
  ): Promise<CatalogAlbumTracksResponse> {
    return (await MusicModule.getCatalogAlbumTracks(albumId, options ?? {})) as CatalogAlbumTracksResponse;
  }
}

export default Catalog;
