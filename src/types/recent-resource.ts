/** Album, playlist, or station from history / heavy-rotation / recently-added endpoints. */
export interface RecentResource {
  id: string;
  title: string;
  subtitle: string;
  type: string;
}

export interface RecentResourcesResponse {
  items: RecentResource[];
}
