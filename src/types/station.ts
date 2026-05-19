export interface IStation {
  id: string;
  name: string;
  artworkUrl: string;
}

export interface IStationsResponse {
  stations: IStation[];
}
