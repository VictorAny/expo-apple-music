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
  ) {
    return this.stack.transport.request(method, path, query, body);
  }

  async getStorefront(): Promise<string> {
    return this.stack.storefront.getStorefront();
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

  async getUserPlaylists(limit: number, offset: number) {
    return this.library.getLibraryPlaylists(limit, offset);
  }

  async getLibrarySongs(limit: number, offset: number) {
    return this.library.getLibrarySongs(limit, offset);
  }

  async getPlaylistTracks(playlistId: string) {
    return this.library.getPlaylistTracks(playlistId);
  }

  async getRecentlyPlayed() {
    return this.history.getRecentlyPlayed();
  }

  async getRecentlyPlayedTracks(limit: number) {
    return this.history.getRecentlyPlayedTracks(limit);
  }

  async getLibraryArtists(limit: number, offset: number) {
    return this.library.getLibraryArtists(limit, offset);
  }

  async getLibraryAlbums(limit: number, offset: number) {
    return this.library.getLibraryAlbums(limit, offset);
  }

  async getHeavyRotation(limit: number) {
    return this.history.getHeavyRotation(limit);
  }

  async getRecentlyPlayedStations(limit: number) {
    return this.history.getRecentlyPlayedStations(limit);
  }

  async getRecentlyAdded(limit: number, offset: number) {
    return this.history.getRecentlyAdded(limit, offset);
  }

  async probeLibraryAccess(): Promise<boolean> {
    return this.library.probeLibraryAccess();
  }

  async resolveCatalogPlaybackId(libraryId: string, mediaType: string) {
    return this.library.resolveCatalogPlaybackId(libraryId, mediaType);
  }

  async resolveLibrarySongCatalogIds(playlistId: string) {
    return this.library.resolveLibrarySongCatalogIds(playlistId);
  }

  async getRating(resourceType: string, id: string) {
    return this.ratings.getRating(resourceType, id);
  }

  async setRating(resourceType: string, id: string, value: number) {
    return this.ratings.setRating(resourceType, id, value);
  }

  async clearRating(resourceType: string, id: string) {
    return this.ratings.clearRating(resourceType, id);
  }

  async addToFavorites(resourceIds: Record<string, string[]>) {
    return this.ratings.addToFavorites(resourceIds);
  }

  async removeFromFavorites(resourceIds: Record<string, string[]>) {
    return this.ratings.removeFromFavorites(resourceIds);
  }

  async addToLibrary(resourceIds: Record<string, string[]>) {
    return this.libraryMutations.addToLibrary(resourceIds);
  }

  async createLibraryPlaylist(
    name: string,
    description: string | null,
    isPublic: boolean,
    tracks: { id: string; type: string }[] | null,
  ) {
    return this.libraryMutations.createLibraryPlaylist(name, description, isPublic, tracks);
  }

  async addTracksToLibraryPlaylist(playlistId: string, tracks: { id: string; type: string }[]) {
    return this.libraryMutations.addTracksToLibraryPlaylist(playlistId, tracks);
  }

  async getRecommendations(ids: string[] | null) {
    return this.recommendations.getRecommendations(ids);
  }

  async getReplay(year: number | null) {
    return this.recommendations.getReplay(year);
  }
}
