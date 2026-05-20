jest.mock('../../web/apple-music-errors', () => ({
  itemNotFound: (label: string) => new Error(`${label} not found`),
  apiError: (message: string) => new Error(message),
  unknownMediaType: (type: string) => new Error(`unknown: ${type}`),
}));

import { LibraryRestClient } from '../library-rest-client';
import type { AppleMusicRestTransport } from '../apple-music-rest-transport';

describe('LibraryRestClient', () => {
  it('getLibrarySongs calls library songs path', async () => {
    const getJson = jest.fn().mockResolvedValue({ data: [] });
    const transport: AppleMusicRestTransport = {
      getJson,
      request: jest.fn(),
    };
    const library = new LibraryRestClient(transport);

    await library.getLibrarySongs(50, 10);

    expect(getJson).toHaveBeenCalledWith('/v1/me/library/songs', {
      limit: '50',
      offset: '10',
    });
  });
});
