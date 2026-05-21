import { mapPlaylist, type AppleMusicApiResource } from '../mappers/apple-music-json-mapper';
import * as errors from '../web/apple-music-errors';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';
import { buildIdsQuery } from './resource-ids-query';

/** Library write/mutation Apple Music REST. */
export class LibraryMutationsRestClient {
  constructor(private readonly transport: AppleMusicRestTransport) {}

  async addToLibrary(musicUserToken: string, resourceIds: Record<string, string[]>) {
    await this.transport.request('POST', '/v1/me/library', buildIdsQuery(resourceIds), undefined, musicUserToken);
  }

  async createLibraryPlaylist(
    musicUserToken: string,
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
    const json = await this.transport.request(
      'POST',
      '/v1/me/library/playlists',
      {},
      payload,
      musicUserToken,
    );
    const data = Array.isArray(json.data) ? json.data[0] : null;
    if (!data) {
      throw errors.apiError('Create playlist returned no data');
    }
    return mapPlaylist(data as AppleMusicApiResource);
  }

  async addTracksToLibraryPlaylist(
    musicUserToken: string,
    playlistId: string,
    tracks: { id: string; type: string }[],
  ) {
    await this.transport.request(
      'POST',
      `/v1/me/library/playlists/${playlistId}/tracks`,
      {},
      { data: tracks.map((track) => ({ id: track.id, type: track.type })) },
      musicUserToken,
    );
  }
}
