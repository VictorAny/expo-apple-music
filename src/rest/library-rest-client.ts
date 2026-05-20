import {
  catalogPlaybackId,
  mapAlbum,
  mapArtist,
  mapPlaylist,
  mapRecentResource,
  mapSong,
  type AppleMusicApiResource,
} from '../mappers/apple-music-json-mapper';
import * as errors from '../web/apple-music-errors';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';
import { mapResourceArray } from './rest-json';

/** Library-domain Apple Music REST (user collection reads + playback id resolution). */
export class LibraryRestClient {
  constructor(private readonly transport: AppleMusicRestTransport) {}

  async getLibraryPlaylists(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/playlists', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapPlaylist);
  }

  async getLibrarySongs(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/songs', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapSong);
  }

  async getPlaylistTracks(playlistId: string) {
    const json = await this.transport.getJson(`/v1/me/library/playlists/${playlistId}/tracks`);
    const data = Array.isArray(json.data) ? json.data : [];
    return data
      .filter((item) => String((item as AppleMusicApiResource).type ?? '').includes('song'))
      .map((item) => mapSong(item as AppleMusicApiResource));
  }

  async getLibraryArtists(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/artists', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapArtist);
  }

  async getLibraryAlbums(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/albums', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapAlbum);
  }

  async getRecentlyAdded(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/recently-added', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapRecentResource);
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
    const json = await this.transport.getJson(`/v1/me/library/playlists/${playlistId}/tracks`);
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
}
