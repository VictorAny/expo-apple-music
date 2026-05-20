/** Optional paging for list endpoints. Defaults: `limit` 25, `offset` 0 (see `normalizePaginationOptions`). */
export interface PaginationOptions {
  /** Max items per request. Default `25`. Coerced to at least `1`. */
  limit?: number;
  /** Zero-based index. Default `0`. Coerced to at least `0`. */
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
}
