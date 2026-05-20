import type { AppleMusicApiResource } from '../mappers/apple-music-json-mapper';
import * as errors from '../web/apple-music-errors';

/** Top-level list responses must include a `data` array (may be empty). */
export function parseDataArray(data: unknown): AppleMusicApiResource[] {
  if (data === undefined || data === null) {
    throw errors.apiError('Apple Music API response missing "data"');
  }
  if (!Array.isArray(data)) {
    throw errors.apiError('Apple Music API response "data" is not an array');
  }
  return data as AppleMusicApiResource[];
}

/**
 * Map a `data` array (or optional nested search bucket).
 * `undefined` / `null` → empty (type omitted from search). Non-array → reject.
 */
export function mapResourceArray<T>(
  data: unknown,
  mapper: (resource: AppleMusicApiResource) => T,
): T[] {
  if (data === undefined || data === null) {
    return [];
  }
  if (!Array.isArray(data)) {
    throw errors.apiError('Apple Music API response "data" is not an array');
  }
  return data.map((item) => mapper(item as AppleMusicApiResource));
}

/** Parse required top-level `data`, then map resources. */
export function mapTopLevelResourceArray<T>(
  data: unknown,
  mapper: (resource: AppleMusicApiResource) => T,
): T[] {
  return mapResourceArray(parseDataArray(data), mapper);
}
