export const MusicItem = {
  SONG: 'song',
  ALBUM: 'album',
  PLAYLIST: 'playlist',
  STATION: 'station',
} as const;

export type MusicItem = (typeof MusicItem)[keyof typeof MusicItem];
