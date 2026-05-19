import type { Song } from './song';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  artworkUrl: string;
  trackCount: number;
}

export interface PlaylistsResponse {
  playlists: Playlist[];
}

export interface PlaylistSongsResponse {
  songs: Song[];
}
