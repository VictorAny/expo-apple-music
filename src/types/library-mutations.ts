import type { ResourceIds } from './rating';

/** Track `type` for playlist create / add-tracks requests. */
export const PlaylistTrackType = {
  SONG: 'songs',
  LIBRARY_SONG: 'library-songs',
  MUSIC_VIDEO: 'music-videos',
  LIBRARY_MUSIC_VIDEO: 'library-music-videos',
} as const;

export type PlaylistTrackType = (typeof PlaylistTrackType)[keyof typeof PlaylistTrackType];

export interface PlaylistTrackRef {
  id: string;
  type: PlaylistTrackType;
}

export interface CreatePlaylistOptions {
  name: string;
  description?: string;
  isPublic?: boolean;
  tracks?: PlaylistTrackRef[];
}

export type { ResourceIds };
