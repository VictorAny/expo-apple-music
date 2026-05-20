jest.mock('../apple-music-errors', () => ({
  apiError: (message: string) => new Error(message),
}));

import {
  parseStorefrontId,
  throwIfApiErrors,
  toMusicKitApiPath,
  unwrapMusicKitApiResponse,
} from '../music-kit-api';

describe('toMusicKitApiPath', () => {
  it('preserves /v1 paths used by Android/iOS', () => {
    expect(toMusicKitApiPath('/v1/me/storefront')).toBe('/v1/me/storefront');
    expect(toMusicKitApiPath('/v1/catalog/gb/search')).toBe('/v1/catalog/gb/search');
  });

  it('adds /v1 when missing', () => {
    expect(toMusicKitApiPath('/me/library/songs')).toBe('/v1/me/library/songs');
  });
});

describe('unwrapMusicKitApiResponse', () => {
  it('unwraps MusicKit APISession envelope', () => {
    const body = { data: [{ id: 'us', type: 'storefronts' }] };
    expect(unwrapMusicKitApiResponse({ data: body })).toEqual(body);
  });

  it('passes through raw Apple Music API JSON', () => {
    const body = { data: [{ id: 'us' }] };
    expect(unwrapMusicKitApiResponse(body)).toEqual(body);
  });

  it('rejects invalid envelope', () => {
    expect(() => unwrapMusicKitApiResponse(null)).toThrow(/Invalid MusicKit API response/);
    expect(() => unwrapMusicKitApiResponse({ foo: 1 })).toThrow(/Invalid MusicKit API response/);
  });

  it('rejects Apple Music errors array in body', () => {
    expect(() =>
      unwrapMusicKitApiResponse({
        errors: [{ detail: 'Invalid parameter' }],
      }),
    ).toThrow(/Invalid parameter/);
  });
});

describe('throwIfApiErrors', () => {
  it('no-ops when errors absent', () => {
    expect(() => throwIfApiErrors({ data: [] })).not.toThrow();
  });
});

describe('parseStorefrontId', () => {
  it('reads storefront id from data array', () => {
    expect(
      parseStorefrontId({
        data: [{ id: 'gb', type: 'storefronts' }],
      }),
    ).toBe('gb');
  });
});
