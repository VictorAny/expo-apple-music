export function buildIdsQuery(resourceIds: Record<string, string[]>): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [type, ids] of Object.entries(resourceIds)) {
    if (ids.length > 0) {
      query[`ids[${type}]`] = ids.join(',');
    }
  }
  return query;
}
