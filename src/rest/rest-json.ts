import type { AppleMusicApiResource } from '../mappers/apple-music-json-mapper';

export function mapResourceArray<T>(
  data: unknown,
  mapper: (resource: AppleMusicApiResource) => T,
): T[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item) => mapper(item as AppleMusicApiResource));
}
