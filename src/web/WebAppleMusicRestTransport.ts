import type {
  AppleMusicHttpMethod,
  AppleMusicRestTransport,
} from '../rest/apple-music-rest-transport';
import { getErrorMessage } from '../utils/get-error-message';
import { getMusic } from './MusicKitLoader';
import * as errors from './apple-music-errors';
import { musicKitApiRequest } from './music-kit-api';
import type { MusicKitApiResponse } from './musickit-types';

/** Web HTTP adapter: MusicKit JS session for Apple Music REST. */
export class WebAppleMusicRestTransport implements AppleMusicRestTransport {
  private async requireAuthorized(): Promise<void> {
    const music = await getMusic();
    if (!music.isAuthorized) {
      throw errors.missingTokens();
    }
  }

  async request(
    method: AppleMusicHttpMethod,
    path: string,
    query: Record<string, string> = {},
    body?: Record<string, unknown>,
    musicUserToken?: string,
  ): Promise<MusicKitApiResponse> {
    await this.requireAuthorized();
    const music = await getMusic();
    try {
      return await musicKitApiRequest(music, method, path, query, body, musicUserToken);
    } catch (error) {
      const message = getErrorMessage(error);
      if (message.includes('403')) {
        throw errors.permissionDenied();
      }
      throw errors.apiError(message);
    }
  }

  async getJson(
    path: string,
    query: Record<string, string> = {},
    musicUserToken?: string,
  ): Promise<MusicKitApiResponse> {
    return this.request('GET', path, query, undefined, musicUserToken);
  }
}
