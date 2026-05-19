export interface Station {
  id: string;
  name: string;
  artworkUrl: string;
}

export interface StationsResponse {
  stations: Station[];
}
