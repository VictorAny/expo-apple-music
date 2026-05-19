import type { MusicItem } from './music-item';

export interface UserTrack {
  id: string;
  title: string;
  subtitle: string;
  type: MusicItem | string;
}

export interface TracksFromLibrary {
  recentlyPlayedItems: UserTrack[];
}
