import type { Album } from './album';
import type { Artist } from './artist';
import type { MusicVideo } from './music-video';
import type { Playlist } from './playlist';
import type { Song } from './song';
import type { Station } from './station';

export const CatalogSearchType = {
  SONGS: 'songs',
  ALBUMS: 'albums',
  ARTISTS: 'artists',
  PLAYLISTS: 'playlists',
  STATIONS: 'stations',
  MUSIC_VIDEOS: 'music-videos',
} as const;

export type CatalogSearchType = (typeof CatalogSearchType)[keyof typeof CatalogSearchType];

export interface CatalogSearch {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  stations: Station[];
  musicVideos: MusicVideo[];
}
