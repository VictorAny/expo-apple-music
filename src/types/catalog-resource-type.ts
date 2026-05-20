/** Catalog resource segment for batch GET (`/v1/catalog/{storefront}/{type}?ids=`). */
export const CatalogResourceType = {
  SONGS: 'songs',
  ALBUMS: 'albums',
  ARTISTS: 'artists',
  PLAYLISTS: 'playlists',
  STATIONS: 'stations',
  MUSIC_VIDEOS: 'music-videos',
} as const;

export type CatalogResourceType = (typeof CatalogResourceType)[keyof typeof CatalogResourceType];
