/** Album, playlist, or station from history / heavy-rotation / recently-added endpoints. */
export interface IRecentResource {
  id: string;
  title: string;
  subtitle: string;
  type: string;
}

export interface IRecentResourcesResponse {
  items: IRecentResource[];
}
