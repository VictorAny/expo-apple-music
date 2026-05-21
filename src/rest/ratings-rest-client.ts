import { mapRating } from '../mappers/apple-music-json-mapper';
import { getErrorMessage } from '../utils/get-error-message';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';
import { buildIdsQuery } from './resource-ids-query';

/** Ratings and favorites Apple Music REST. */
export class RatingsRestClient {
  constructor(private readonly transport: AppleMusicRestTransport) {}

  async getRating(musicUserToken: string, resourceType: string, id: string) {
    try {
      const json = await this.transport.getJson(
        `/v1/me/ratings/${resourceType}/${id}`,
        {},
        musicUserToken,
      );
      return mapRating(json as Parameters<typeof mapRating>[0]);
    } catch (error) {
      const message = getErrorMessage(error);
      if (message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async setRating(musicUserToken: string, resourceType: string, id: string, value: number) {
    const json = await this.transport.request(
      'PUT',
      `/v1/me/ratings/${resourceType}/${id}`,
      {},
      { type: 'rating', attributes: { value } },
      musicUserToken,
    );
    return mapRating(json as Parameters<typeof mapRating>[0]);
  }

  async clearRating(musicUserToken: string, resourceType: string, id: string) {
    await this.transport.request('DELETE', `/v1/me/ratings/${resourceType}/${id}`, {}, undefined, musicUserToken);
  }

  async addToFavorites(musicUserToken: string, resourceIds: Record<string, string[]>) {
    await this.transport.request('POST', '/v1/me/favorites', buildIdsQuery(resourceIds), undefined, musicUserToken);
  }

  async removeFromFavorites(musicUserToken: string, resourceIds: Record<string, string[]>) {
    await this.transport.request('DELETE', '/v1/me/favorites', buildIdsQuery(resourceIds), undefined, musicUserToken);
  }
}
