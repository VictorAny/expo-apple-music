import { createAppleMusicRestStack } from '../rest/apple-music-rest-stack';
import { isLibraryId } from '../rest/library-ids';
import { getMusic } from './MusicKitLoader';
import { storefrontIdFromInstance } from './music-kit-api';
import { WebAppleMusicRestTransport } from './WebAppleMusicRestTransport';

/** Web facade over shared REST domain clients (MusicKit JS transport). */
export class WebAppleMusicApiClient {
  private readonly stack = createAppleMusicRestStack(new WebAppleMusicRestTransport(), async () => {
    const music = await getMusic();
    return storefrontIdFromInstance(music);
  });

  readonly catalog = this.stack.catalog;
  readonly library = this.stack.library;
  readonly history = this.stack.history;
  readonly ratings = this.stack.ratings;
  readonly libraryMutations = this.stack.libraryMutations;
  readonly recommendations = this.stack.recommendations;

  static isLibraryId(id: string): boolean {
    return isLibraryId(id);
  }

  async request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    query: Record<string, string> = {},
    body?: Record<string, unknown>,
    musicUserToken?: string,
  ) {
    return this.stack.transport.request(method, path, query, body, musicUserToken);
  }

  async getStorefront(musicUserToken: string): Promise<string> {
    return this.stack.storefront.getUserStorefront(musicUserToken);
  }

  async catalogSearch(term: string, types: string[], limit: number, offset: number) {
    return this.catalog.catalogSearch(term, types, limit, offset);
  }

  async getCatalogSong(id: string) {
    return this.catalog.getCatalogSong(id);
  }

  async getCatalogAlbum(id: string) {
    return this.catalog.getCatalogAlbum(id);
  }

  async getCatalogArtist(id: string) {
    return this.catalog.getCatalogArtist(id);
  }

  async getCatalogPlaylist(id: string) {
    return this.catalog.getCatalogPlaylist(id);
  }

  async getCatalogStation(id: string) {
    return this.catalog.getCatalogStation(id);
  }

  async getCatalogMusicVideo(id: string) {
    return this.catalog.getCatalogMusicVideo(id);
  }

  async getCatalogAlbumTracks(albumId: string, limit: number, offset: number) {
    return this.catalog.getCatalogAlbumTracks(albumId, limit, offset);
  }

  async getCatalogArtistAlbums(artistId: string, limit: number, offset: number) {
    return this.catalog.getCatalogArtistAlbums(artistId, limit, offset);
  }

  async getCatalogPlaylistTracks(playlistId: string, limit: number, offset: number) {
    return this.catalog.getCatalogPlaylistTracks(playlistId, limit, offset);
  }

  async getCatalogCharts(
    types: string[],
    limit: number,
    offset: number,
    genre?: string | null,
    chart?: string | null,
  ) {
    return this.catalog.getCatalogCharts(types, limit, offset, genre, chart);
  }

  async getCatalogResources(type: string, ids: string[]) {
    return this.catalog.getCatalogResources(
      type as import('../types/catalog-resource-type').CatalogResourceType,
      ids,
    );
  }

  async getUserPlaylists(musicUserToken: string, limit: number, offset: number) {
    return this.library.getLibraryPlaylists(musicUserToken, limit, offset);
  }

  async getLibrarySongs(musicUserToken: string, limit: number, offset: number) {
    return this.library.getLibrarySongs(musicUserToken, limit, offset);
  }

  async getPlaylistTracks(musicUserToken: string, playlistId: string) {
    return this.library.getPlaylistTracks(musicUserToken, playlistId);
  }

  async getRecentlyPlayed(musicUserToken: string) {
    return this.history.getRecentlyPlayed(musicUserToken);
  }

  async getRecentlyPlayedTracks(musicUserToken: string, limit: number) {
    return this.history.getRecentlyPlayedTracks(musicUserToken, limit);
  }

  async getLibraryArtists(musicUserToken: string, limit: number, offset: number) {
    return this.library.getLibraryArtists(musicUserToken, limit, offset);
  }

  async getLibraryAlbums(musicUserToken: string, limit: number, offset: number) {
    return this.library.getLibraryAlbums(musicUserToken, limit, offset);
  }

  async getLibraryMusicVideos(musicUserToken: string, limit: number, offset: number) {
    return this.library.getLibraryMusicVideos(musicUserToken, limit, offset);
  }

  async librarySearch(musicUserToken: string, term: string, types: string[], limit: number, offset: number) {
    return this.library.searchLibrary(
      musicUserToken,
      term,
      types as import('../types/library-search').LibrarySearchType[],
      limit,
      offset,
    );
  }

  async getHeavyRotation(musicUserToken: string, limit: number) {
    return this.history.getHeavyRotation(musicUserToken, limit);
  }

  async getRecentlyPlayedStations(musicUserToken: string, limit: number) {
    return this.history.getRecentlyPlayedStations(musicUserToken, limit);
  }

  async getRecentlyAdded(musicUserToken: string, limit: number, offset: number) {
    return this.history.getRecentlyAdded(musicUserToken, limit, offset);
  }

  async probeLibraryAccess(musicUserToken: string): Promise<boolean> {
    return this.library.probeLibraryAccess(musicUserToken);
  }

  async resolveCatalogPlaybackId(musicUserToken: string, libraryId: string, mediaType: string) {
    return this.library.resolveCatalogPlaybackId(musicUserToken, libraryId, mediaType);
  }

  async resolveLibrarySongCatalogIds(musicUserToken: string, playlistId: string) {
    return this.library.resolveLibrarySongCatalogIds(musicUserToken, playlistId);
  }

  async getRating(musicUserToken: string, resourceType: string, id: string) {
    return this.ratings.getRating(musicUserToken, resourceType, id);
  }

  async setRating(musicUserToken: string, resourceType: string, id: string, value: number) {
    return this.ratings.setRating(musicUserToken, resourceType, id, value);
  }

  async clearRating(musicUserToken: string, resourceType: string, id: string) {
    return this.ratings.clearRating(musicUserToken, resourceType, id);
  }

  async addToFavorites(musicUserToken: string, resourceIds: Record<string, string[]>) {
    return this.ratings.addToFavorites(musicUserToken, resourceIds);
  }

  async removeFromFavorites(musicUserToken: string, resourceIds: Record<string, string[]>) {
    return this.ratings.removeFromFavorites(musicUserToken, resourceIds);
  }

  async addToLibrary(musicUserToken: string, resourceIds: Record<string, string[]>) {
    return this.libraryMutations.addToLibrary(musicUserToken, resourceIds);
  }

  async createLibraryPlaylist(
    musicUserToken: string,
    name: string,
    description: string | null,
    isPublic: boolean,
    tracks: { id: string; type: string }[] | null,
  ) {
    return this.libraryMutations.createLibraryPlaylist(
      musicUserToken,
      name,
      description,
      isPublic,
      tracks,
    );
  }

  async addTracksToLibraryPlaylist(
    musicUserToken: string,
    playlistId: string,
    tracks: { id: string; type: string }[],
  ) {
    return this.libraryMutations.addTracksToLibraryPlaylist(musicUserToken, playlistId, tracks);
  }

  async getRecommendations(musicUserToken: string, ids: string[] | null) {
    return this.recommendations.getRecommendations(musicUserToken, ids);
  }

  async getReplay(musicUserToken: string, year: number | null) {
    return this.recommendations.getReplay(musicUserToken, year);
  }
}
