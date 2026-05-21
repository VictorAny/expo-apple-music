import {
  mapRecentlyPlayed,
  mapRecentResource,
  mapSong,
  mapStation,
} from '../mappers/apple-music-json-mapper';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';
import { mapTopLevelResourceArray } from './rest-json';

/** History-domain Apple Music REST (recently played, heavy rotation). */
export class HistoryRestClient {
  constructor(private readonly transport: AppleMusicRestTransport) {}

  async getRecentlyPlayed(musicUserToken: string) {
    const json = await this.transport.getJson('/v1/me/recent/played', { limit: '10' }, musicUserToken);
    return mapTopLevelResourceArray(json.data, mapRecentlyPlayed);
  }

  async getRecentlyPlayedTracks(musicUserToken: string, limit: number) {
    const json = await this.transport.getJson(
      '/v1/me/recent/played/tracks',
      { limit: String(limit) },
      musicUserToken,
    );
    return mapTopLevelResourceArray(json.data, mapSong);
  }

  async getHeavyRotation(musicUserToken: string, limit: number) {
    const json = await this.transport.getJson(
      '/v1/me/history/heavy-rotation',
      { limit: String(limit) },
      musicUserToken,
    );
    return mapTopLevelResourceArray(json.data, mapRecentResource);
  }

  async getRecentlyPlayedStations(musicUserToken: string, limit: number) {
    const json = await this.transport.getJson(
      '/v1/me/recent/radio-stations',
      { limit: String(limit) },
      musicUserToken,
    );
    return mapTopLevelResourceArray(json.data, mapStation);
  }

  async getRecentlyAdded(musicUserToken: string, limit: number, offset: number) {
    const json = await this.transport.getJson(
      '/v1/me/library/recently-added',
      { limit: String(limit), offset: String(offset) },
      musicUserToken,
    );
    return mapTopLevelResourceArray(json.data, mapRecentResource);
  }
}
