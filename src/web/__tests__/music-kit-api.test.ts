import {
  parseStorefrontId,
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
