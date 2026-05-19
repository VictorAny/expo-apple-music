export interface IArtist {
  id: string;
  name: string;
  artworkUrl: string;
}

export interface IArtistsResponse {
  artists: IArtist[];
}
