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

  it('getLibraryMusicVideos calls library music-videos path', async () => {
    const getJson = jest.fn().mockResolvedValue({ data: [] });
    const library = new LibraryRestClient({ getJson, request: jest.fn() });

    await library.getLibraryMusicVideos(25, 0);

    expect(getJson).toHaveBeenCalledWith('/v1/me/library/music-videos', {
      limit: '25',
      offset: '0',
    });
  });

  it('searchLibrary calls library search path', async () => {
    const getJson = jest.fn().mockResolvedValue({
      results: {
        'library-songs': { data: [] },
        'library-albums': { data: [] },
        'library-artists': { data: [] },
        'library-playlists': { data: [] },
        'library-music-videos': { data: [] },
      },
    });
    const library = new LibraryRestClient({ getJson, request: jest.fn() });

    await library.searchLibrary('beatles', ['library-songs'], 10, 0);

    expect(getJson).toHaveBeenCalledWith('/v1/me/library/search', {
      term: 'beatles',
      types: 'library-songs',
      limit: '10',
      offset: '0',
    });
  });
});
