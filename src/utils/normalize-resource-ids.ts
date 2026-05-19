import type { ResourceIds } from '../types/rating';

/** Drops empty type keys before sending to native REST helpers. */
export function normalizeResourceIds(resourceIds: ResourceIds): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [type, ids] of Object.entries(resourceIds)) {
    const filtered = ids?.filter((id) => id.length > 0) ?? [];
    if (filtered.length > 0) {
      result[type] = filtered;
    }
  }
  return result;
}
