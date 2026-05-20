/**
 * Bridge contract parity — shared golden inputs/outputs under fixtures/.
 * TypeScript mapper is the reference adapter; Kotlin tests load the same inputs.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { AppleMusicApiResource } from '../apple-music-json-mapper';
import {
  mapAlbum,
  mapArtist,
  mapPlaylist,
  mapRating,
  mapRecentResource,
  mapSong,
} from '../apple-music-json-mapper';

const FIXTURES_ROOT = join(__dirname, '../../../fixtures');

export function loadApiFixture(name: string): AppleMusicApiResource {
  return JSON.parse(readFileSync(join(FIXTURES_ROOT, name), 'utf8')) as AppleMusicApiResource;
}

export function loadExpectedBridge(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(FIXTURES_ROOT, 'expected', name), 'utf8')) as Record<
    string,
    unknown
  >;
}

export function loadRatingsEnvelope(name: string): { data?: AppleMusicApiResource[] } {
  return JSON.parse(readFileSync(join(FIXTURES_ROOT, name), 'utf8')) as {
    data?: AppleMusicApiResource[];
  };
}

export type BridgeContractCase = {
  name: string;
  input: string;
  expected: string;
  map: (input: unknown) => unknown;
};

export const BRIDGE_CONTRACT_CASES: BridgeContractCase[] = [
  {
    name: 'catalog song',
    input: 'catalog-song.json',
    expected: 'song.catalog.json',
    map: (r) => mapSong(r as AppleMusicApiResource),
  },
  {
    name: 'catalog album',
    input: 'catalog-album.json',
    expected: 'album.catalog.json',
    map: (r) => mapAlbum(r as AppleMusicApiResource),
  },
  {
    name: 'library artist',
    input: 'library-artist.json',
    expected: 'artist.library.json',
    map: (r) => mapArtist(r as AppleMusicApiResource),
  },
  {
    name: 'catalog playlist',
    input: 'catalog-playlist.json',
    expected: 'playlist.catalog.json',
    map: (r) => mapPlaylist(r as AppleMusicApiResource),
  },
  {
    name: 'library recent album',
    input: 'library-recent-album.json',
    expected: 'recent-resource.library-album.json',
    map: (r) => mapRecentResource(r as AppleMusicApiResource),
  },
  {
    name: 'rating like',
    input: 'ratings-response.json',
    expected: 'rating.like.json',
    map: (r) => mapRating(r as { data?: AppleMusicApiResource[] }),
  },
];
