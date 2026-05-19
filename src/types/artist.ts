export interface Artist {
  id: string;
  name: string;
  artworkUrl: string;
}

export interface ArtistsResponse {
  artists: Artist[];
}
