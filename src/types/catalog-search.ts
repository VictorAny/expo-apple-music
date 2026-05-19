import type { Album } from './album';
import type { Song } from './song';

export const CatalogSearchType = {
  SONGS: 'songs',
  ALBUMS: 'albums',
} as const;

export type CatalogSearchType = (typeof CatalogSearchType)[keyof typeof CatalogSearchType];

export interface CatalogSearch {
  songs: Song[];
  albums: Album[];
}
