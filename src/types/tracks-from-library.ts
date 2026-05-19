import type { MusicItem } from './music-item';

export interface IUserTrack {
  id: string;
  title: string;
  subtitle: string;
  type: MusicItem | string;
}

export interface ITracksFromLibrary {
  recentlyPlayedItems: IUserTrack[];
}
