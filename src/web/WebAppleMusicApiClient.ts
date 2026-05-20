import {
  catalogPlaybackId,
  mapAlbum,
  mapArtist,
  mapMusicVideo,
  mapPlaylist,
  mapRating,
  mapRecentlyPlayed,
  mapRecentResource,
  mapRecommendation,
  mapReplaySummary,
  mapSong,
  mapStation,
  type AppleMusicApiResource,
} from '../mappers/apple-music-json-mapper';
import * as errors from './apple-music-errors';
import { getMusic } from './MusicKitLoader';
import {
  musicKitApiRequest,
  parseStorefrontId,
  storefrontIdFromInstance,
} from './music-kit-api';
import type { MusicKitApiResponse } from './musickit-types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function isLibraryId(id: string): boolean {
  return id.startsWith('l.') || id.startsWith('i.') || id.startsWith('p.');
}

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

function mapResourceArray<T>(
  data: unknown,
  mapper: (resource: AppleMusicApiResource) => T,
): T[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item) => mapper(item as AppleMusicApiResource));
}

function buildIdsQuery(resourceIds: Record<string, string[]>): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [type, ids] of Object.entries(resourceIds)) {
    if (ids.length > 0) {
      query[`ids[${type}]`] = ids.join(',');
    }
  }
  return query;
}

export class WebAppleMusicApiClient {
  private cachedStorefront: string | null = null;

  static isLibraryId(id: string): boolean {
    return isLibraryId(id);
  }

  private async requireAuthorized(): Promise<void> {
    const music = await getMusic();
    if (!music.isAuthorized) {
      throw errors.missingTokens();
    }
  }

  async request(
    method: HttpMethod,
    path: string,
    query: Record<string, string> = {},
    body?: Record<string, unknown>,
  ): Promise<MusicKitApiResponse> {
    await this.requireAuthorized();
    const music = await getMusic();
    try {
      return await musicKitApiRequest(music, method, path, query, body);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('403')) {
        throw errors.permissionDenied();
      }
      throw errors.apiError(message);
    }
  }

  private async getJson(
    path: string,
    query: Record<string, string> = {},
  ): Promise<MusicKitApiResponse> {
    return this.request('GET', path, query);
  }

  async getStorefront(): Promise<string> {
    if (this.cachedStorefront) {
      return this.cachedStorefront;
    }

    const music = await getMusic();
    const fromInstance = storefrontIdFromInstance(music);
    if (fromInstance) {
      this.cachedStorefront = fromInstance;
      return fromInstance;
    }

    const json = await this.getJson('/v1/me/storefront');
    const id = parseStorefrontId(json);
    if (!id) {
      throw errors.apiError('Storefront response missing id');
    }
    this.cachedStorefront = id;
    return id;
  }

  async catalogSearch(
    term: string,
    types: string[],
    limit: number,
    offset: number,
  ): Promise<{
    songs: Record<string, unknown>[];
    albums: Record<string, unknown>[];
    artists: Record<string, unknown>[];
    playlists: Record<string, unknown>[];
    stations: Record<string, unknown>[];
    musicVideos: Record<string, unknown>[];
  }> {
    const storefront = await this.getStorefront();
    const typeParam =
      types
        .map((t) => catalogSearchTypeParam(t))
        .filter((t): t is string => t !== null)
        .filter((t, i, arr) => arr.indexOf(t) === i)
        .join(',') || 'songs,albums';

    const json = await this.getJson(`/v1/catalog/${storefront}/search`, {
      term,
      types: typeParam,
      limit: String(limit),
      offset: String(offset),
    });

    const results = json.results ?? {};
    const songs = mapResourceArray(results.songs?.data, mapSong);
    const albums = mapResourceArray(results.albums?.data, mapAlbum);
    const artists = mapResourceArray(results.artists?.data, mapArtist);
    const playlists = mapResourceArray(results.playlists?.data, mapPlaylist);
    const stations = mapResourceArray(results.stations?.data, mapStation);
    const musicVideos = mapResourceArray(results['music-videos']?.data, mapMusicVideo);

    return { songs, albums, artists, playlists, stations, musicVideos };
  }

  private async getCatalogResource(
    path: string,
    mapper: (resource: AppleMusicApiResource) => Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const json = await this.getJson(path);
    const data = Array.isArray(json.data) ? json.data[0] : null;
    if (!data) {
      throw errors.itemNotFound('Catalog item', false);
    }
    return mapper(data as AppleMusicApiResource);
  }

  async getCatalogSong(id: string) {
    const storefront = await this.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefront}/songs/${id}`, mapSong);
  }

  async getCatalogAlbum(id: string) {
    const storefront = await this.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefront}/albums/${id}`, mapAlbum);
  }

  async getCatalogArtist(id: string) {
    const storefront = await this.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefront}/artists/${id}`, mapArtist);
  }

  async getCatalogPlaylist(id: string) {
    const storefront = await this.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefront}/playlists/${id}`, mapPlaylist);
  }

  async getCatalogStation(id: string) {
    const storefront = await this.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefront}/stations/${id}`, mapStation);
  }

  async getCatalogMusicVideo(id: string) {
    const storefront = await this.getStorefront();
    return this.getCatalogResource(`/v1/catalog/${storefront}/music-videos/${id}`, mapMusicVideo);
  }

  private async getCatalogRelationship(
    path: string,
    limit: number,
    offset: number,
    mapper: (resource: AppleMusicApiResource) => Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const json = await this.getJson(path, {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapper);
  }

  async getCatalogAlbumTracks(albumId: string, limit: number, offset: number) {
    const storefront = await this.getStorefront();
    return this.getCatalogRelationship(
      `/v1/catalog/${storefront}/albums/${albumId}/tracks`,
      limit,
      offset,
      mapSong,
    );
  }

  async getCatalogArtistAlbums(artistId: string, limit: number, offset: number) {
    const storefront = await this.getStorefront();
    return this.getCatalogRelationship(
      `/v1/catalog/${storefront}/artists/${artistId}/albums`,
      limit,
      offset,
      mapAlbum,
    );
  }

  async getCatalogPlaylistTracks(playlistId: string, limit: number, offset: number) {
    const storefront = await this.getStorefront();
    return this.getCatalogRelationship(
      `/v1/catalog/${storefront}/playlists/${playlistId}/tracks`,
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
  ) {
    const storefront = await this.getStorefront();
    const query: Record<string, string> = {
      types: types.join(',') || 'songs,albums',
      limit: String(limit),
      offset: String(offset),
    };
    if (genre) {
      query.genre = genre;
    }
    if (chart) {
      query.chart = chart;
    }
    const json = await this.getJson(`/v1/catalog/${storefront}/charts`, query);
    const results = json.results ?? {};
    return {
      songs: mapResourceArray(results.songs?.data, mapSong),
      albums: mapResourceArray(results.albums?.data, mapAlbum),
      playlists: mapResourceArray(results.playlists?.data, mapPlaylist),
      musicVideos: mapResourceArray(results['music-videos']?.data, mapMusicVideo),
    };
  }

  async getUserPlaylists(limit: number, offset: number) {
    const json = await this.getJson('/v1/me/library/playlists', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapPlaylist);
  }

  async getLibrarySongs(limit: number, offset: number) {
    const json = await this.getJson('/v1/me/library/songs', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapSong);
  }

  async getPlaylistTracks(playlistId: string) {
    const json = await this.getJson(`/v1/me/library/playlists/${playlistId}/tracks`);
    const data = Array.isArray(json.data) ? json.data : [];
    return data
      .filter((item) => String((item as AppleMusicApiResource).type ?? '').includes('song'))
      .map((item) => mapSong(item as AppleMusicApiResource));
  }

  async getRecentlyPlayed() {
    const json = await this.getJson('/v1/me/recent/played', { limit: '10' });
    return mapResourceArray(json.data, mapRecentlyPlayed);
  }

  async getRecentlyPlayedTracks(limit: number) {
    const json = await this.getJson('/v1/me/recent/played/tracks', { limit: String(limit) });
    return mapResourceArray(json.data, mapSong);
  }

  async getLibraryArtists(limit: number, offset: number) {
    const json = await this.getJson('/v1/me/library/artists', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapArtist);
  }

  async getLibraryAlbums(limit: number, offset: number) {
    const json = await this.getJson('/v1/me/library/albums', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapAlbum);
  }

  async getHeavyRotation(limit: number) {
    const json = await this.getJson('/v1/me/history/heavy-rotation', { limit: String(limit) });
    return mapResourceArray(json.data, mapRecentResource);
  }

  async getRecentlyPlayedStations(limit: number) {
    const json = await this.getJson('/v1/me/recent/radio-stations', { limit: String(limit) });
    return mapResourceArray(json.data, mapStation);
  }

  async getRecentlyAdded(limit: number, offset: number) {
    const json = await this.getJson('/v1/me/library/recently-added', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapRecentResource);
  }

  async probeLibraryAccess(): Promise<boolean> {
    try {
      await this.getJson('/v1/me/library/songs', { limit: '1' });
      return true;
    } catch {
      return false;
    }
  }

  async resolveCatalogPlaybackId(libraryId: string, mediaType: string): Promise<string> {
    const path =
      mediaType === 'song'
        ? `/v1/me/library/songs/${libraryId}`
        : mediaType === 'album'
          ? `/v1/me/library/albums/${libraryId}`
          : mediaType === 'playlist'
            ? `/v1/me/library/playlists/${libraryId}`
            : null;
    if (!path) {
      throw errors.unknownMediaType(mediaType);
    }
    const json = await this.getJson(path);
    const data = Array.isArray(json.data) ? json.data[0] : null;
    if (!data) {
      throw errors.itemNotFound(mediaType, true);
    }
    const catalogId = catalogPlaybackId(data as AppleMusicApiResource);
    if (!catalogId) {
      throw errors.itemNotFound(mediaType, true);
    }
    return catalogId;
  }

  async resolveLibrarySongCatalogIds(playlistId: string): Promise<string[]> {
    const json = await this.getJson(`/v1/me/library/playlists/${playlistId}/tracks`);
    const data = Array.isArray(json.data) ? json.data : [];
    const ids: string[] = [];
    for (const item of data) {
      const resource = item as AppleMusicApiResource;
      if (!String(resource.type ?? '').includes('song')) {
        continue;
      }
      const catalogId = catalogPlaybackId(resource);
      if (catalogId) {
        ids.push(catalogId);
      }
    }
    return ids;
  }

  async getRating(resourceType: string, id: string) {
    try {
      const json = await this.getJson(`/v1/me/ratings/${resourceType}/${id}`);
      return mapRating(json);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async setRating(resourceType: string, id: string, value: number) {
    const json = await this.request('PUT', `/v1/me/ratings/${resourceType}/${id}`, {}, {
      type: 'rating',
      attributes: { value },
    });
    return mapRating(json);
  }

  async clearRating(resourceType: string, id: string) {
    await this.request('DELETE', `/v1/me/ratings/${resourceType}/${id}`);
  }

  async addToFavorites(resourceIds: Record<string, string[]>) {
    await this.request('POST', '/v1/me/favorites', buildIdsQuery(resourceIds));
  }

  async removeFromFavorites(resourceIds: Record<string, string[]>) {
    await this.request('DELETE', '/v1/me/favorites', buildIdsQuery(resourceIds));
  }

  async addToLibrary(resourceIds: Record<string, string[]>) {
    await this.request('POST', '/v1/me/library', buildIdsQuery(resourceIds));
  }

  async createLibraryPlaylist(
    name: string,
    description: string | null,
    isPublic: boolean,
    tracks: { id: string; type: string }[] | null,
  ) {
    const attributes: Record<string, unknown> = { name, isPublic };
    if (description?.trim()) {
      attributes.description = { standard: description };
    }
    const payload: Record<string, unknown> = { attributes };
    if (tracks?.length) {
      payload.relationships = {
        tracks: {
          data: tracks.map((track) => ({ id: track.id, type: track.type })),
        },
      };
    }
    const json = await this.request('POST', '/v1/me/library/playlists', {}, payload);
    const data = Array.isArray(json.data) ? json.data[0] : null;
    if (!data) {
      throw errors.apiError('Create playlist returned no data');
    }
    return mapPlaylist(data as AppleMusicApiResource);
  }

  async addTracksToLibraryPlaylist(playlistId: string, tracks: { id: string; type: string }[]) {
    await this.request(
      'POST',
      `/v1/me/library/playlists/${playlistId}/tracks`,
      {},
      { data: tracks.map((track) => ({ id: track.id, type: track.type })) },
    );
  }

  async getRecommendations(ids: string[] | null) {
    const query: Record<string, string> = {};
    if (ids?.length) {
      query.ids = ids.join(',');
    }
    const json = await this.getJson('/v1/me/recommendations', query);
    return mapResourceArray(json.data, mapRecommendation);
  }

  async getReplay(year: number | null) {
    const query: Record<string, string> = {};
    if (year != null) {
      query['filter[year]'] = String(year);
    }
    const json = await this.getJson('/v1/me/music-summaries', query);
    return mapResourceArray(json.data, mapReplaySummary);
  }
}
