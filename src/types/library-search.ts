import type { Album } from './album';
import type { Artist } from './artist';
import type { MusicVideo } from './music-video';
import type { Playlist } from './playlist';
import type { Song } from './song';

/** Apple Music API `types` values for `GET /v1/me/library/search`. */
export const LibrarySearchType = {
  SONGS: 'library-songs',
  ALBUMS: 'library-albums',
  ARTISTS: 'library-artists',
  PLAYLISTS: 'library-playlists',
  MUSIC_VIDEOS: 'library-music-videos',
} as const;

export type LibrarySearchType = (typeof LibrarySearchType)[keyof typeof LibrarySearchType];

export interface LibrarySearch {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  musicVideos: MusicVideo[];
}
