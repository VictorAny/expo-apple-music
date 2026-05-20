import type { MusicKitApiResponse } from '../web/musickit-types';

export type AppleMusicHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Platform HTTP adapter for Apple Music REST paths (`/v1/...`). */
export interface AppleMusicRestTransport {
  request(
    method: AppleMusicHttpMethod,
    path: string,
    query?: Record<string, string>,
    body?: Record<string, unknown>,
  ): Promise<MusicKitApiResponse>;

  getJson(path: string, query?: Record<string, string>): Promise<MusicKitApiResponse>;
}
