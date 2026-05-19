export function paginationFromMap(options: Record<string, unknown> = {}): {
  limit: number;
  offset: number;
} {
  const limit = Math.max(1, Number(options.limit ?? 25));
  const offset = Math.max(0, Number(options.offset ?? 0));
  return { limit, offset };
}
