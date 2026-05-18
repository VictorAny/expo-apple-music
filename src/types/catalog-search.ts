import type { IAlbum } from './album';
import type { ISong } from './song';

export const CatalogSearchType = {
  SONGS: 'songs',
  ALBUMS: 'albums',
} as const;

export type CatalogSearchType = (typeof CatalogSearchType)[keyof typeof CatalogSearchType];

export interface ICatalogSearch {
  songs: ISong[];
  albums: IAlbum[];
}
