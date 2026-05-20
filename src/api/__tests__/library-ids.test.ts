import { assertLibraryId, isLibraryId } from '../library-ids';

describe('isLibraryId', () => {
  it('recognizes library prefixes', () => {
    expect(isLibraryId('i.abc')).toBe(true);
    expect(isLibraryId('l.abc')).toBe(true);
    expect(isLibraryId('p.abc')).toBe(true);
  });

  it('rejects catalog numeric ids', () => {
    expect(isLibraryId('1441164424')).toBe(false);
  });
});

describe('assertLibraryId', () => {
  it('throws INVALID_LIBRARY_ID for catalog ids', () => {
    expect(() => assertLibraryId('1441164424', 'playlistId')).toThrow(
      expect.objectContaining({
        code: 'INVALID_LIBRARY_ID',
        message: expect.stringContaining('playlistId'),
      }),
    );
  });
});
