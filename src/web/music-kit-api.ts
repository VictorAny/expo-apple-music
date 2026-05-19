import type { AppleMusicApiResource } from '../mappers/apple-music-json-mapper';
import type { MusicKitApiResponse, MusicKitInstance } from './musickit-types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type MusicKitRequestFn = (
  path: string,
  query?: Record<string, string>,
  options?: {
    method?: string;
    fetchOptions?: RequestInit;
  },
) => Promise<unknown>;

/**
 * Normalize Apple Music API paths for MusicKit JS.
 * Keep the `/v1` prefix — MusicKit's session base is `https://api.music.apple.com`
 * (no version in the host path). Stripping `/v1` produces invalid URLs like
 * `https://api.music.apple.com/catalog/...` that fail CORS / 405.
 */
export function toMusicKitApiPath(appleMusicApiPath: string): string {
  const trimmed = appleMusicApiPath.trim();
  if (trimmed.startsWith('/v1/')) {
    return trimmed;
  }
  if (trimmed.startsWith('v1/')) {
    return `/${trimmed}`;
  }
  if (trimmed.startsWith('/')) {
    return `/v1${trimmed}`;
  }
  return `/v1/${trimmed}`;
}

/** APISession returns `{ data: <Apple Music JSON body> }`; normalize to API shape. */
export function unwrapMusicKitApiResponse(raw: unknown): MusicKitApiResponse {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const envelope = raw as Record<string, unknown>;
  const inner = envelope.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    const body = inner as MusicKitApiResponse;
    if (body.data !== undefined || body.results !== undefined || body.errors !== undefined) {
      return body;
    }
  }
  if (
    envelope.data !== undefined ||
    envelope.results !== undefined ||
    envelope.errors !== undefined
  ) {
    return envelope as MusicKitApiResponse;
  }
  return {};
}

export function parseStorefrontId(json: MusicKitApiResponse): string | null {
  const data = json.data;
  if (Array.isArray(data) && data.length > 0) {
    const id = (data[0] as AppleMusicApiResource).id;
    if (typeof id === 'string' && id.length > 0) {
      return id.toLowerCase();
    }
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const id = (data as AppleMusicApiResource).id;
    if (typeof id === 'string' && id.length > 0) {
      return id.toLowerCase();
    }
  }
  return null;
}

function resolveMusicRequest(music: MusicKitInstance): MusicKitRequestFn {
  const api = music.api as Record<string, unknown> | MusicKitRequestFn;

  if (typeof api === 'function') {
    return api.bind(music.api);
  }

  if (api && typeof api === 'object') {
    if (typeof api.music === 'function') {
      return (api.music as MusicKitRequestFn).bind(api);
    }
    const v3 = api.v3 as Record<string, unknown> | undefined;
    if (v3 && typeof v3.music === 'function') {
      return (v3.music as MusicKitRequestFn).bind(v3);
    }
  }

  throw new Error('MusicKit API is not available');
}

export function storefrontIdFromInstance(music: MusicKitInstance): string | null {
  const id = music.storefrontId;
  if (typeof id === 'string' && id.length > 0) {
    return id.toLowerCase();
  }
  return null;
}

export async function musicKitApiRequest(
  music: MusicKitInstance,
  method: HttpMethod,
  path: string,
  query: Record<string, string> = {},
  body?: Record<string, unknown>,
): Promise<MusicKitApiResponse> {
  const request = resolveMusicRequest(music);
  const mkPath = toMusicKitApiPath(path);

  const sessionOptions: { method?: string; fetchOptions?: RequestInit } = {
    method,
  };

  if (body) {
    sessionOptions.fetchOptions = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
  }

  const raw = await request(mkPath, query, sessionOptions);
  return unwrapMusicKitApiResponse(raw);
}
