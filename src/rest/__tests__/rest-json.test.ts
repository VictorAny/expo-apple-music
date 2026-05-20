jest.mock('../../web/apple-music-errors', () => ({
  apiError: (message: string) => new Error(message),
}));

import { mapResourceArray, mapTopLevelResourceArray, parseDataArray } from '../rest-json';

describe('parseDataArray', () => {
  it('returns an empty array when data is empty', () => {
    expect(parseDataArray([])).toEqual([]);
  });

  it('rejects missing data', () => {
    expect(() => parseDataArray(undefined)).toThrow(/missing "data"/);
  });

  it('rejects non-array data', () => {
    expect(() => parseDataArray({ id: '1' })).toThrow(/not an array/);
  });
});

describe('mapResourceArray', () => {
  const mapper = (resource: { id?: string }) => ({ id: resource.id ?? '' });

  it('returns empty for optional nested buckets', () => {
    expect(mapResourceArray(undefined, mapper)).toEqual([]);
    expect(mapResourceArray(null, mapper)).toEqual([]);
  });

  it('maps array resources', () => {
    expect(mapResourceArray([{ id: 'a' }, { id: 'b' }], mapper)).toEqual([
      { id: 'a' },
      { id: 'b' },
    ]);
  });

  it('rejects non-array when bucket is present', () => {
    expect(() => mapResourceArray('bad', mapper)).toThrow(/not an array/);
  });
});

describe('mapTopLevelResourceArray', () => {
  it('requires top-level data', () => {
    expect(() => mapTopLevelResourceArray(undefined, () => ({}))).toThrow(/missing "data"/);
  });
});
