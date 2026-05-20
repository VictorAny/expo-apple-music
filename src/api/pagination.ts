import type { PaginationOptions } from '../types/pagination';

export const DEFAULT_PAGINATION_LIMIT = 25;
export const DEFAULT_PAGINATION_OFFSET = 0;

export interface NormalizedPagination {
  limit: number;
  offset: number;
}

/** Applies v1 defaults (limit 25, offset 0) and coerces to non-negative integers. */
export function normalizePaginationOptions(
  options?: PaginationOptions,
): NormalizedPagination {
  const limit = Math.max(1, options?.limit ?? DEFAULT_PAGINATION_LIMIT);
  const offset = Math.max(0, options?.offset ?? DEFAULT_PAGINATION_OFFSET);
  return { limit, offset };
}

/** Payload for native bridge methods that accept `limit` / `offset` in an options map. */
export function paginationBridgePayload(options?: PaginationOptions): PaginationOptions {
  return normalizePaginationOptions(options);
}
