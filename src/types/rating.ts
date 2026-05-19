/** Apple Music API path segment for `GET/PUT/DELETE /v1/me/ratings/{type}/{id}`. */
export const RatingResourceType = {
  SONG: 'songs',
  ALBUM: 'albums',
  PLAYLIST: 'playlists',
  MUSIC_VIDEO: 'music-videos',
  STATION: 'stations',
  LIBRARY_SONG: 'library-songs',
  LIBRARY_ALBUM: 'library-albums',
  LIBRARY_PLAYLIST: 'library-playlists',
  LIBRARY_MUSIC_VIDEO: 'library-music-videos',
} as const;

export type RatingResourceType = (typeof RatingResourceType)[keyof typeof RatingResourceType];

/** Like (`1`) or dislike (`-1`) — only values Apple accepts. */
export const RatingValue = {
  LIKE: 1,
  DISLIKE: -1,
} as const;

export type RatingValue = (typeof RatingValue)[keyof typeof RatingValue];

export interface Rating {
  id: string;
  value: RatingValue;
}

/** Query keys for `ids[{type}]` on favorites and add-to-library endpoints. */
export const LibraryResourceType = {
  SONGS: 'songs',
  ALBUMS: 'albums',
  PLAYLISTS: 'playlists',
  MUSIC_VIDEOS: 'music-videos',
  STATIONS: 'stations',
} as const;

export type LibraryResourceType = (typeof LibraryResourceType)[keyof typeof LibraryResourceType];

export type ResourceIds = Partial<Record<LibraryResourceType, string[]>>;
