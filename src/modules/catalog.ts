import { callNative } from '../api/call-native';
import { paginationBridgePayload } from '../api/pagination';
import type { Album } from '../types/album';
import type { AlbumsResponse } from '../types/albums-response';
import type { CatalogAlbumTracksResponse } from '../types/catalog-album-tracks';
import type { CatalogCharts, CatalogChartType, CatalogChartsOptions } from '../types/catalog-charts';
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
    return callNative('Catalog.search', async () =>
      (await MusicModule.catalogSearch(term, types, paginationBridgePayload(options))) as CatalogSearch,
    );
  }

  public static async getSong(id: string): Promise<Song> {
    return callNative('Catalog.getSong', async () => (await MusicModule.getCatalogSong(id)) as Song);
  }

  public static async getAlbum(id: string): Promise<Album> {
    return callNative('Catalog.getAlbum', async () => (await MusicModule.getCatalogAlbum(id)) as Album);
  }

  public static async getArtist(id: string): Promise<Artist> {
    return callNative('Catalog.getArtist', async () => (await MusicModule.getCatalogArtist(id)) as Artist);
  }

  public static async getPlaylist(id: string): Promise<Playlist> {
    return callNative('Catalog.getPlaylist', async () =>
      (await MusicModule.getCatalogPlaylist(id)) as Playlist,
    );
  }

  public static async getStation(id: string): Promise<Station> {
    return callNative('Catalog.getStation', async () => (await MusicModule.getCatalogStation(id)) as Station);
  }

  public static async getMusicVideo(id: string): Promise<MusicVideo> {
    return callNative('Catalog.getMusicVideo', async () =>
      (await MusicModule.getCatalogMusicVideo(id)) as MusicVideo,
    );
  }

  public static async getAlbumTracks(
    albumId: string,
    options?: PaginationOptions,
  ): Promise<CatalogAlbumTracksResponse> {
    return callNative('Catalog.getAlbumTracks', async () =>
      (await MusicModule.getCatalogAlbumTracks(albumId, paginationBridgePayload(options))) as CatalogAlbumTracksResponse,
    );
  }

  public static async getArtistAlbums(
    artistId: string,
    options?: PaginationOptions,
  ): Promise<AlbumsResponse> {
    return callNative('Catalog.getArtistAlbums', async () =>
      (await MusicModule.getCatalogArtistAlbums(artistId, paginationBridgePayload(options))) as AlbumsResponse,
    );
  }

  public static async getPlaylistTracks(
    playlistId: string,
    options?: PaginationOptions,
  ): Promise<CatalogAlbumTracksResponse> {
    return callNative('Catalog.getPlaylistTracks', async () =>
      (await MusicModule.getCatalogPlaylistTracks(
        playlistId,
        paginationBridgePayload(options),
      )) as CatalogAlbumTracksResponse,
    );
  }

  public static async getCharts(
    types: CatalogChartType[],
    options?: CatalogChartsOptions,
  ): Promise<CatalogCharts> {
    return callNative('Catalog.getCharts', async () =>
      (await MusicModule.getCatalogCharts(types, options ?? {})) as CatalogCharts,
    );
  }
}

export default Catalog;
