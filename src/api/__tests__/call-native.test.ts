import { callNative, normalizeNativeError } from '../call-native';

describe('normalizeNativeError', () => {
  it('adds operation to coded native errors', () => {
    expect(
      normalizeNativeError('Catalog.search', { code: 'permissionDenied', message: 'Auth required' }),
    ).toEqual({
      code: 'permissionDenied',
      message: 'Auth required',
      operation: 'Catalog.search',
    });
  });

  it('preserves operation on AppleMusicError', () => {
    const err = { code: 'ERROR', message: 'fail', operation: 'Library.getSongs' };
    expect(normalizeNativeError('Other', err)).toBe(err);
  });

  it('wraps unknown errors', () => {
    expect(normalizeNativeError('Auth.authorize', new Error('boom'))).toEqual({
      code: 'ERROR',
      message: 'boom',
      operation: 'Auth.authorize',
    });
  });
});

describe('callNative', () => {
  it('returns the resolved value', async () => {
    await expect(callNative('Catalog.search', async () => ({ songs: [] }))).resolves.toEqual({
      songs: [],
    });
  });

  it('rethrows normalized errors', async () => {
    await expect(
      callNative('Catalog.search', async () => {
        throw { code: 'ERROR', message: 'not found' };
      }),
    ).rejects.toEqual({
      code: 'ERROR',
      message: 'not found',
      operation: 'Catalog.search',
    });
  });
});
