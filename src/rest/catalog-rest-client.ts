import {
  mapAlbum,
  mapArtist,
  mapMusicVideo,
  mapPlaylist,
  mapSong,
  mapStation,
  type AppleMusicApiResource,
} from '../mappers/apple-music-json-mapper';
import * as errors from '../web/apple-music-errors';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';
import { mapResourceArray } from './rest-json';
import { StorefrontRestClient } from './storefront-rest-client';

export type CatalogSearchResult = {
  songs: Record<string, unknown>[];
  albums: Record<string, unknown>[];
  artists: Record<string, unknown>[];
  playlists: Record<string, unknown>[];
  stations: Record<string, unknown>[];
  musicVideos: Record<string, unknown>[];
};

export type CatalogChartsResult = {
  songs: Record<string, unknown>[];
  albums: Record<string, unknown>[];
  playlists: Record<string, unknown>[];
  musicVideos: Record<string, unknown>[];
};

function catalogSearchTypeParam(type: string): string | null {
  switch (type) {
    case 'songs':
    case 'song':
      return 'songs';
    case 'albums':
    case 'album':
      return 'albums';
    case 'artists':
    case 'artist':
      return 'artists';
    case 'playlists':
    case 'playlist':
      return 'playlists';
    case 'stations':
    case 'station':
      return 'stations';
    case 'music-videos':
    case 'musicVideos':
    case 'musicVideo':
      return 'music-videos';
    default:
      return null;
  }
}

function catalogChartTypeParam(type: string): string | null {
  switch (type) {
    case 'songs':
    case 'song':
      return 'songs';
    case 'albums':
    case 'album':
      return 'albums';
    case 'playlists':
    case 'playlist':
      return 'playlists';
    case 'music-videos':
    case 'musicVideos':
    case 'musicVideo':
      return 'music-videos';
    default:
      return null;
  }
}

/** Catalog-domain Apple Music REST (search, resources, charts). */
export class CatalogRestClient {
  constructor(
    private readonly transport: AppleMusicRestTransport,
    private readonly storefront: StorefrontRestClient,
  ) {}

  async catalogSearch(
    term: string,
    types: string[],
    limit: number,
    offset: number,
  ): Promise<CatalogSearchResult> {
    const storefrontId = await this.storefront.getStorefront();
    const typeParam =
      types
        .map((t) => catalogSearchTypeParam(t))
        .filter((t): t is string => t !== null)
        .filter((t, i, arr) => arr.indexOf(t) === i)
        .join(',') || 'songs,albums';

    const json = await this.transport.getJson(`/v1/catalog/${storefrontId}/search`, {
      term,
      types: typeParam,
      limit: String(limit),
      offset: String(offset),
    });

    const results = json.results ?? {};
    return {
      songs: mapResourceArray(results.songs?.data, mapSong),
      albums: mapResourceArray(results.albums?.data, mapAlbum),
      artists: mapResourceArray(results.artists?.data, mapArtist),
      playlists: mapResourceArray(results.playlists?.data, mapPlaylist),
      stations: mapResourceArray(results.stations?.data, mapStation),
      musicVideos: mapResourceArray(results['music-videos']?.data, mapMusicVideo),
    };
  }

  private async getCatalogResource(
    path: string,
    mapper: (resource: AppleMusicApiResource) => Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const json = await this.transport.getJson(path);
    const data = Array.isArray(json.data) ? json.data[0] : null;
    if (!data) {
      throw errors.itemNotFound('Catalog item', false);
    }
    return mapper(data as AppleMusicApiResource);
  }

  async getCatalogSong(id: string): Promise<Record<string, unknown>> {
    const storefrontId = await this.storefront.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefrontId}/songs/${id}`, mapSong);
  }

  async getCatalogAlbum(id: string): Promise<Record<string, unknown>> {
    const storefrontId = await this.storefront.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefrontId}/albums/${id}`, mapAlbum);
  }

  async getCatalogArtist(id: string): Promise<Record<string, unknown>> {
    const storefrontId = await this.storefront.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefrontId}/artists/${id}`, mapArtist);
  }

  async getCatalogPlaylist(id: string): Promise<Record<string, unknown>> {
    const storefrontId = await this.storefront.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefrontId}/playlists/${id}`, mapPlaylist);
  }

  async getCatalogStation(id: string): Promise<Record<string, unknown>> {
    const storefrontId = await this.storefront.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefrontId}/stations/${id}`, mapStation);
  }

  async getCatalogMusicVideo(id: string): Promise<Record<string, unknown>> {
    const storefrontId = await this.storefront.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefrontId}/music-videos/${id}`, mapMusicVideo);
  }

  private async getCatalogRelationship(
    path: string,
    limit: number,
    offset: number,
    mapper: (resource: AppleMusicApiResource) => Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const json = await this.transport.getJson(path, {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapper);
  }

  async getCatalogAlbumTracks(
    albumId: string,
    limit: number,
    offset: number,
  ): Promise<Record<string, unknown>[]> {
    const storefrontId = await this.storefront.getStorefront();
    return this.getCatalogRelationship(
      `/v1/catalog/${storefrontId}/albums/${albumId}/tracks`,
      limit,
      offset,
      mapSong,
    );
  }

  async getCatalogArtistAlbums(
    artistId: string,
    limit: number,
    offset: number,
  ): Promise<Record<string, unknown>[]> {
    const storefrontId = await this.storefront.getStorefront();
    return this.getCatalogRelationship(
      `/v1/catalog/${storefrontId}/artists/${artistId}/albums`,
      limit,
      offset,
      mapAlbum,
    );
  }

  async getCatalogPlaylistTracks(
    playlistId: string,
    limit: number,
    offset: number,
  ): Promise<Record<string, unknown>[]> {
    const storefrontId = await this.storefront.getStorefront();
    return this.getCatalogRelationship(
      `/v1/catalog/${storefrontId}/playlists/${playlistId}/tracks`,
      limit,
      offset,
      mapSong,
    );
  }

  async getCatalogCharts(
    types: string[],
    limit: number,
    offset: number,
    genre?: string | null,
    chart?: string | null,
  ): Promise<CatalogChartsResult> {
    const storefrontId = await this.storefront.getStorefront();
    const typeParam =
      types
        .map((t) => catalogChartTypeParam(t))
        .filter((t): t is string => t !== null)
        .filter((t, i, arr) => arr.indexOf(t) === i)
        .join(',') || 'songs,albums';

    const query: Record<string, string> = {
      types: typeParam,
      limit: String(limit),
      offset: String(offset),
    };
    if (genre) {
      query.genre = genre;
    }
    if (chart) {
      query.chart = chart;
    }
    const json = await this.transport.getJson(`/v1/catalog/${storefrontId}/charts`, query);
    const results = json.results ?? {};
    return {
      songs: mapResourceArray(results.songs?.data, mapSong),
      albums: mapResourceArray(results.albums?.data, mapAlbum),
      playlists: mapResourceArray(results.playlists?.data, mapPlaylist),
      musicVideos: mapResourceArray(results['music-videos']?.data, mapMusicVideo),
    };
  }
}
