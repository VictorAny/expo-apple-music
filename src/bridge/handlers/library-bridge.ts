import { paginationFromMap } from '../../web/pagination';
import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';
import { BridgeResponses } from '../bridge-responses';

export function createLibraryBridge(api: WebAppleMusicApiClient) {
  return {
    async getUserPlaylists(musicUserToken: string, options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const playlists = await api.getUserPlaylists(musicUserToken, pagination.limit, pagination.offset);
      return BridgeResponses.playlists(playlists);
    },

    async getLibrarySongs(musicUserToken: string, options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const songs = await api.getLibrarySongs(musicUserToken, pagination.limit, pagination.offset);
      return BridgeResponses.songs(songs);
    },

    async getPlaylistSongs(musicUserToken: string, playlistId: string, _options: Record<string, unknown>) {
      const songs = await api.getPlaylistTracks(musicUserToken, playlistId);
      return BridgeResponses.songs(songs);
    },

    async getLibraryArtists(musicUserToken: string, options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const artists = await api.getLibraryArtists(musicUserToken, pagination.limit, pagination.offset);
      return BridgeResponses.artists(artists);
    },

    async getLibraryAlbums(musicUserToken: string, options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const albums = await api.getLibraryAlbums(musicUserToken, pagination.limit, pagination.offset);
      return BridgeResponses.albums(albums);
    },

    async getLibraryMusicVideos(musicUserToken: string, options: Record<string, unknown>) {
      const pagination = paginationFromMap(options);
      const musicVideos = await api.getLibraryMusicVideos(
        musicUserToken,
        pagination.limit,
        pagination.offset,
      );
      return BridgeResponses.musicVideos(musicVideos);
    },

    async librarySearch(
      musicUserToken: string,
      term: string,
      types: string[],
      options: Record<string, unknown>,
    ) {
      const pagination = paginationFromMap(options);
      const result = await api.librarySearch(
        musicUserToken,
        term,
        types,
        pagination.limit,
        pagination.offset,
      );
      return BridgeResponses.librarySearch(result);
    },
  };
}
