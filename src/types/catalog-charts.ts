import type { Album } from './album';
import type { MusicVideo } from './music-video';
import type { PaginationOptions } from './pagination';
import type { Playlist } from './playlist';
import type { Song } from './song';

export const CatalogChartType = {
  SONGS: 'songs',
  ALBUMS: 'albums',
  PLAYLISTS: 'playlists',
  MUSIC_VIDEOS: 'music-videos',
} as const;

export type CatalogChartType = (typeof CatalogChartType)[keyof typeof CatalogChartType];

export interface CatalogChartsOptions extends PaginationOptions {
  /** Apple genre ID filter */
  genre?: string;
  /** Chart kind, e.g. `most-played` */
  chart?: string;
}

export interface CatalogCharts {
  songs: Song[];
  albums: Album[];
  playlists: Playlist[];
  musicVideos: MusicVideo[];
}
