import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_OFFSET,
  normalizePaginationOptions,
  paginationBridgePayload,
} from '../pagination';

describe('normalizePaginationOptions', () => {
  it('applies v1 defaults when options omitted', () => {
    expect(normalizePaginationOptions()).toEqual({
      limit: DEFAULT_PAGINATION_LIMIT,
      offset: DEFAULT_PAGINATION_OFFSET,
    });
  });

  it('coerces limit to at least 1', () => {
    expect(normalizePaginationOptions({ limit: 0, offset: 5 })).toEqual({
      limit: 1,
      offset: 5,
    });
  });

  it('coerces offset to at least 0', () => {
    expect(normalizePaginationOptions({ limit: 10, offset: -3 })).toEqual({
      limit: 10,
      offset: 0,
    });
  });
});

describe('paginationBridgePayload', () => {
  it('returns the same shape as normalizePaginationOptions', () => {
    expect(paginationBridgePayload({ limit: 50 })).toEqual({ limit: 50, offset: 0 });
  });
});
