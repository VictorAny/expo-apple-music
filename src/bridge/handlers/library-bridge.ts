import { paginationFromMap } from '../../web/pagination';
import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';
import { BridgeResponses } from '../bridge-responses';

export function createLibraryBridge(api: WebAppleMusicApiClient) {
  return {
    async getUserPlaylists(options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const playlists = await api.getUserPlaylists(pagination.limit, pagination.offset);
      return BridgeResponses.playlists(playlists);
    },

    async getLibrarySongs(options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const songs = await api.getLibrarySongs(pagination.limit, pagination.offset);
      return BridgeResponses.songs(songs);
    },

    async getPlaylistSongs(playlistId: string, _options: Record<string, unknown>) {
      const songs = await api.getPlaylistTracks(playlistId);
      return BridgeResponses.songs(songs);
    },

    async getLibraryArtists(options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const artists = await api.getLibraryArtists(pagination.limit, pagination.offset);
      return BridgeResponses.artists(artists);
    },

    async getLibraryAlbums(options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const albums = await api.getLibraryAlbums(pagination.limit, pagination.offset);
      return BridgeResponses.albums(albums);
    },
  };
}
