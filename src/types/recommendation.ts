import type { Album } from './album';
import type { Artist } from './artist';
import type { Playlist } from './playlist';
import type { Song } from './song';
import type { Station } from './station';

export interface Recommendation {
  id: string;
  title: string;
  resourceTypes: string[];
  playlists: Playlist[];
  albums: Album[];
  stations: Station[];
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
}

export interface ReplaySummary {
  id: string;
  type: string;
  name: string;
  year?: number;
  topSongs: Song[];
  topAlbums: Album[];
  topArtists: Artist[];
}

export interface ReplayResponse {
  summaries: ReplaySummary[];
}

export interface RecommendationsOptions {
  /** Personal-recommendation ids (e.g. `6-27s5hU6azhJY`). Omit to fetch all via native/REST. */
  ids?: string[];
}

export interface ReplayOptions {
  /** Calendar year; omit for the latest eligible year Apple returns. */
  year?: number;
}
