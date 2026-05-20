import { mapRecommendation, mapReplaySummary } from '../mappers/apple-music-json-mapper';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';
import { mapResourceArray } from './rest-json';

/** Recommendations and Replay Apple Music REST. */
export class RecommendationsRestClient {
  constructor(private readonly transport: AppleMusicRestTransport) {}

  async getRecommendations(ids: string[] | null) {
    const query: Record<string, string> = {};
    if (ids?.length) {
      query.ids = ids.join(',');
    }
    const json = await this.transport.getJson('/v1/me/recommendations', query);
    return mapResourceArray(json.data, mapRecommendation);
  }

  async getReplay(year: number | null) {
    const query: Record<string, string> = {};
    if (year != null) {
      query['filter[year]'] = String(year);
    }
    const json = await this.transport.getJson('/v1/me/music-summaries', query);
    return mapResourceArray(json.data, mapReplaySummary);
  }
}
