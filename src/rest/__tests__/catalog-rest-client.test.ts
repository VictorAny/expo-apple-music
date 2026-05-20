jest.mock('../../web/apple-music-errors', () => ({
  itemNotFound: (label: string) => new Error(`${label} not found`),
  apiError: (message: string) => new Error(message),
  unknownMediaType: (type: string) => new Error(`unknown: ${type}`),
}));

import { CatalogRestClient } from '../catalog-rest-client';
import type { AppleMusicRestTransport } from '../apple-music-rest-transport';
import { StorefrontRestClient } from '../storefront-rest-client';

describe('CatalogRestClient', () => {
  it('catalogSearch calls storefront-scoped search path', async () => {
    const getJson = jest.fn().mockResolvedValue({
      results: {
        songs: { data: [] },
        albums: { data: [] },
        artists: { data: [] },
        playlists: { data: [] },
        stations: { data: [] },
        'music-videos': { data: [] },
      },
    });
    const transport: AppleMusicRestTransport = {
      getJson,
      request: jest.fn(),
    };
    const storefront = new StorefrontRestClient(transport, async () => 'us');
    const catalog = new CatalogRestClient(transport, storefront);

    await catalog.catalogSearch('beatles', ['songs'], 25, 0);

    expect(getJson).toHaveBeenCalledWith('/v1/catalog/us/search', {
      term: 'beatles',
      types: 'songs',
      limit: '25',
      offset: '0',
    });
  });

  it('getCatalogResources calls batch ids path', async () => {
    const getJson = jest.fn().mockResolvedValue({ data: [] });
    const transport: AppleMusicRestTransport = {
      getJson,
      request: jest.fn(),
    };
    const storefront = new StorefrontRestClient(transport, async () => 'us');
    const catalog = new CatalogRestClient(transport, storefront);

    await catalog.getCatalogResources('songs', ['1', '2']);

    expect(getJson).toHaveBeenCalledWith('/v1/catalog/us/songs', { ids: '1,2' });
  });
});
