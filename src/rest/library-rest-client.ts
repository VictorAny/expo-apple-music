import {
  catalogPlaybackId,
  mapAlbum,
  mapArtist,
  mapMusicVideo,
  mapPlaylist,
  mapSong,
  type AppleMusicApiResource,
} from '../mappers/apple-music-json-mapper';
import type { LibrarySearchType } from '../types/library-search';
import * as errors from '../web/apple-music-errors';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';
import { mapResourceArray, mapTopLevelResourceArray, parseDataArray } from './rest-json';

export type LibrarySearchResult = {
  songs: Record<string, unknown>[];
  albums: Record<string, unknown>[];
  artists: Record<string, unknown>[];
  playlists: Record<string, unknown>[];
  musicVideos: Record<string, unknown>[];
};

function librarySearchTypeParam(type: string): string | null {
  switch (type) {
    case 'library-songs':
    case 'songs':
      return 'library-songs';
    case 'library-albums':
    case 'albums':
      return 'library-albums';
    case 'library-artists':
    case 'artists':
      return 'library-artists';
    case 'library-playlists':
    case 'playlists':
      return 'library-playlists';
    case 'library-music-videos':
    case 'music-videos':
    case 'musicVideos':
      return 'library-music-videos';
    default:
      return null;
  }
}

/** Library-domain Apple Music REST (user collection reads + playback id resolution). */
export class LibraryRestClient {
  constructor(private readonly transport: AppleMusicRestTransport) {}

  async getLibraryPlaylists(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/playlists', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapTopLevelResourceArray(json.data, mapPlaylist);
  }

  async getLibrarySongs(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/songs', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapTopLevelResourceArray(json.data, mapSong);
  }

  async getPlaylistTracks(playlistId: string) {
    const json = await this.transport.getJson(`/v1/me/library/playlists/${playlistId}/tracks`);
    const data = parseDataArray(json.data);
    return data
      .filter((item) => String((item as AppleMusicApiResource).type ?? '').includes('song'))
      .map((item) => mapSong(item as AppleMusicApiResource));
  }

  async getLibraryArtists(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/artists', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapTopLevelResourceArray(json.data, mapArtist);
  }

  async getLibraryAlbums(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/albums', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapTopLevelResourceArray(json.data, mapAlbum);
  }

  async getLibraryMusicVideos(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/music-videos', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapTopLevelResourceArray(json.data, mapMusicVideo);
  }

  async searchLibrary(
    term: string,
    types: LibrarySearchType[],
    limit: number,
    offset: number,
  ): Promise<LibrarySearchResult> {
    const typeParam = [...new Set(types.map(librarySearchTypeParam).filter(Boolean))].sort().join(
      ',',
    );
    const typesQuery = typeParam || 'library-songs,library-albums';

    const json = await this.transport.getJson('/v1/me/library/search', {
      term,
      types: typesQuery,
      limit: String(limit),
      offset: String(offset),
    });

    const results = (json.results ?? {}) as Record<string, { data?: AppleMusicApiResource[] }>;
    return {
      songs: mapResourceArray(results['library-songs']?.data, mapSong),
      albums: mapResourceArray(results['library-albums']?.data, mapAlbum),
      artists: mapResourceArray(results['library-artists']?.data, mapArtist),
      playlists: mapResourceArray(results['library-playlists']?.data, mapPlaylist),
      musicVideos: mapResourceArray(results['library-music-videos']?.data, mapMusicVideo),
    };
  }

  async probeLibraryAccess(): Promise<boolean> {
    try {
      await this.transport.getJson('/v1/me/library/songs', { limit: '1' });
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
    const json = await this.transport.getJson(path);
    const rows = parseDataArray(json.data);
    const data = rows[0];
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
    const json = await this.transport.getJson(`/v1/me/library/playlists/${playlistId}/tracks`);
    const data = parseDataArray(json.data);
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
}
