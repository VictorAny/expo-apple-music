import { paginationFromMap } from '../../web/pagination';
import * as errors from '../../web/apple-music-errors';
import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';
import { BridgeResponses } from '../bridge-responses';

export function createCatalogBridge(api: WebAppleMusicApiClient) {
  return {
    async catalogSearch(term: string, types: string[], options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const result = await api.catalogSearch(term, types, pagination.limit, pagination.offset);
      return BridgeResponses.catalogSearch(result);
    },

    getCatalogSong: (id: string) => api.getCatalogSong(id),
    getCatalogAlbum: (id: string) => api.getCatalogAlbum(id),
    getCatalogArtist: (id: string) => api.getCatalogArtist(id),
    getCatalogPlaylist: (id: string) => api.getCatalogPlaylist(id),
    getCatalogStation: (id: string) => api.getCatalogStation(id),
    getCatalogMusicVideo: (id: string) => api.getCatalogMusicVideo(id),

    async getCatalogAlbumTracks(albumId: string, options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const songs = await api.getCatalogAlbumTracks(albumId, pagination.limit, pagination.offset);
      return BridgeResponses.songs(songs);
    },

    async getCatalogArtistAlbums(artistId: string, options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const albums = await api.getCatalogArtistAlbums(artistId, pagination.limit, pagination.offset);
      return BridgeResponses.albums(albums);
    },

    async getCatalogPlaylistTracks(playlistId: string, options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const songs = await api.getCatalogPlaylistTracks(playlistId, pagination.limit, pagination.offset);
      return BridgeResponses.songs(songs);
    },

    async getCatalogCharts(types: string[], options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const result = await api.getCatalogCharts(
        types,
        pagination.limit,
        pagination.offset,
        (options.genre as string | undefined) ?? null,
        (options.chart as string | undefined) ?? null,
      );
      return BridgeResponses.catalogCharts(result);
    },

    async getCatalogResources(type: string, ids: string[]) {
      const items = await api.getCatalogResources(type, ids);
      switch (type) {
        case 'songs':
          return BridgeResponses.songs(items);
        case 'albums':
          return BridgeResponses.albums(items);
        case 'artists':
          return BridgeResponses.artists(items);
        case 'playlists':
          return BridgeResponses.playlists(items);
        case 'stations':
          return BridgeResponses.stations(items);
        case 'music-videos':
          return BridgeResponses.musicVideos(items);
        default:
          throw errors.unknownMediaType(type);
      }
    },
  };
}
