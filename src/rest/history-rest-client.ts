import {
  mapRecentlyPlayed,
  mapRecentResource,
  mapSong,
  mapStation,
} from '../mappers/apple-music-json-mapper';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';
import { mapResourceArray } from './rest-json';

/** History-domain Apple Music REST (recently played, heavy rotation). */
export class HistoryRestClient {
  constructor(private readonly transport: AppleMusicRestTransport) {}

  async getRecentlyPlayed() {
    const json = await this.transport.getJson('/v1/me/recent/played', { limit: '10' });
    return mapResourceArray(json.data, mapRecentlyPlayed);
  }

  async getRecentlyPlayedTracks(limit: number) {
    const json = await this.transport.getJson('/v1/me/recent/played/tracks', {
      limit: String(limit),
    });
    return mapResourceArray(json.data, mapSong);
  }

  async getHeavyRotation(limit: number) {
    const json = await this.transport.getJson('/v1/me/history/heavy-rotation', {
      limit: String(limit),
    });
    return mapResourceArray(json.data, mapRecentResource);
  }

  async getRecentlyPlayedStations(limit: number) {
    const json = await this.transport.getJson('/v1/me/recent/radio-stations', {
      limit: String(limit),
    });
    return mapResourceArray(json.data, mapStation);
  }

  async getRecentlyAdded(limit: number, offset: number) {
    const json = await this.transport.getJson('/v1/me/library/recently-added', {
      limit: String(limit),
      offset: String(offset),
    });
    return mapResourceArray(json.data, mapRecentResource);
  }
}
