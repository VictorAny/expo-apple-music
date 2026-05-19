import { NativeModule, registerWebModule } from 'expo-modules-core';

import { paginationFromMap } from './web/pagination';
import { configureMusicKit } from './web/MusicKitLoader';
import { authStatusFromAuthorizeError, authStatusFromMusicKit } from './web/map-auth-status';
import * as errors from './web/apple-music-errors';
import { WebAppleMusicApiClient } from './web/WebAppleMusicApiClient';
import { WebPlaybackController } from './web/WebPlaybackController';
import { WebPlaybackObserver } from './web/WebPlaybackObserver';
import { WebQueueService } from './web/WebQueueService';
import { WebSubscriptionService } from './web/WebSubscriptionService';

function requireDeveloperToken(developerToken: string | null | undefined): string {
  if (!developerToken?.trim()) {
    throw errors.missingDeveloperToken();
  }
  return developerToken.trim();
}

export class ExpoAppleMusicModule extends NativeModule {
  __expo_module_name__ = 'ExpoAppleMusic';

  private readonly api = new WebAppleMusicApiClient();
  private readonly subscription = new WebSubscriptionService(this.api);
  private readonly queue = new WebQueueService(this.api);
  private readonly playback = new WebPlaybackController();
  private readonly playbackObserver = new WebPlaybackObserver();

  async authorization(
    developerToken: string | null,
    _startScreenMessage: string | null,
    _hideStartScreen: boolean | null,
  ): Promise<string> {
    const token = requireDeveloperToken(developerToken);
    const music = await configureMusicKit(token);
    if (music.isAuthorized) {
      return 'authorized';
    }

    try {
      const result = await music.authorize();
      return authStatusFromMusicKit(music, result);
    } catch (error) {
      return authStatusFromAuthorizeError(error);
    }
  }

  async checkSubscription(): Promise<Record<string, unknown>> {
    return this.subscription.checkSubscription();
  }

  async catalogSearch(
    term: string,
    types: string[],
    options: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const pagination = paginationFromMap(options);
    const result = await this.api.catalogSearch(term, types, pagination.limit, pagination.offset);
    return result;
  }

  async getCatalogSong(id: string) {
    return this.api.getCatalogSong(id);
  }

  async getCatalogAlbum(id: string) {
    return this.api.getCatalogAlbum(id);
  }

  async getCatalogArtist(id: string) {
    return this.api.getCatalogArtist(id);
  }

  async getCatalogPlaylist(id: string) {
    return this.api.getCatalogPlaylist(id);
  }

  async getCatalogStation(id: string) {
    return this.api.getCatalogStation(id);
  }

  async getCatalogMusicVideo(id: string) {
    return this.api.getCatalogMusicVideo(id);
  }

  async getCatalogAlbumTracks(albumId: string, options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const songs = await this.api.getCatalogAlbumTracks(albumId, pagination.limit, pagination.offset);
    return { songs };
  }

  async getCatalogArtistAlbums(artistId: string, options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const albums = await this.api.getCatalogArtistAlbums(
      artistId,
      pagination.limit,
      pagination.offset,
    );
    return { albums };
  }

  async getCatalogPlaylistTracks(playlistId: string, options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const songs = await this.api.getCatalogPlaylistTracks(
      playlistId,
      pagination.limit,
      pagination.offset,
    );
    return { songs };
  }

  async getCatalogCharts(types: string[], options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const result = await this.api.getCatalogCharts(
      types,
      pagination.limit,
      pagination.offset,
      (options.genre as string | undefined) ?? null,
      (options.chart as string | undefined) ?? null,
    );
    return result;
  }

  async setPlaybackQueue(itemId: string, type: string): Promise<string> {
    await this.queue.setQueue(itemId, type);
    return 'Track(s) added to queue';
  }

  async getStorefront(): Promise<Record<string, unknown>> {
    const id = await this.api.getStorefront();
    return { id };
  }

  async getTracksFromLibrary(): Promise<Record<string, unknown>> {
    const tracks = await this.api.getRecentlyPlayed();
    return { recentlyPlayedItems: tracks };
  }

  async getRecentlyPlayedTracks(options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const songs = await this.api.getRecentlyPlayedTracks(pagination.limit);
    return { songs };
  }

  async getLibraryArtists(options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const artists = await this.api.getLibraryArtists(pagination.limit, pagination.offset);
    return { artists };
  }

  async getLibraryAlbums(options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const albums = await this.api.getLibraryAlbums(pagination.limit, pagination.offset);
    return { albums };
  }

  async getHeavyRotation(options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const items = await this.api.getHeavyRotation(pagination.limit);
    return { items };
  }

  async getRecentlyPlayedStations(options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const stations = await this.api.getRecentlyPlayedStations(pagination.limit);
    return { stations };
  }

  async getRecentlyAdded(options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const items = await this.api.getRecentlyAdded(pagination.limit, pagination.offset);
    return { items };
  }

  configurePlayer(mixWithOthers: boolean): Record<string, unknown> {
    return this.playback.configurePlayer(mixWithOthers);
  }

  async getCurrentState(): Promise<Record<string, unknown>> {
    return this.playback.currentState();
  }

  async getUserPlaylists(options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const playlists = await this.api.getUserPlaylists(pagination.limit, pagination.offset);
    return { playlists };
  }

  async getLibrarySongs(options: Record<string, unknown>) {
    const pagination = paginationFromMap(options);
    const songs = await this.api.getLibrarySongs(pagination.limit, pagination.offset);
    return { songs };
  }

  async getPlaylistSongs(playlistId: string, _options: Record<string, unknown>) {
    const songs = await this.api.getPlaylistTracks(playlistId);
    return { songs };
  }

  async playLibrarySong(_songId: string): Promise<string> {
    await this.queue.playLibrarySong(_songId);
    return 'Library song added to queue';
  }

  async playLibraryPlaylist(playlistId: string, startingAt: number): Promise<string> {
    await this.queue.playLibraryPlaylist(playlistId, startingAt);
    return 'Library playlist added to queue';
  }

  async getRating(resourceType: string, id: string) {
    return this.api.getRating(resourceType, id);
  }

  async setRating(resourceType: string, id: string, value: number) {
    return this.api.setRating(resourceType, id, value);
  }

  async clearRating(resourceType: string, id: string) {
    await this.api.clearRating(resourceType, id);
  }

  async addToFavorites(resourceIds: Record<string, string[]>) {
    await this.api.addToFavorites(resourceIds);
  }

  async removeFromFavorites(resourceIds: Record<string, string[]>) {
    await this.api.removeFromFavorites(resourceIds);
  }

  async addToLibrary(resourceIds: Record<string, string[]>) {
    await this.api.addToLibrary(resourceIds);
  }

  async createLibraryPlaylist(options: Record<string, unknown>) {
    const name = String(options.name ?? '');
    const description = options.description != null ? String(options.description) : null;
    const isPublic = Boolean(options.isPublic ?? false);
    const tracks = Array.isArray(options.tracks)
      ? (options.tracks as { id: string; type: string }[])
      : null;
    return this.api.createLibraryPlaylist(name, description, isPublic, tracks);
  }

  async addTracksToLibraryPlaylist(
    playlistId: string,
    tracks: { id: string; type: string }[],
  ) {
    await this.api.addTracksToLibraryPlaylist(playlistId, tracks);
  }

  async getRecommendations(ids: string[] | null) {
    const recommendations = await this.api.getRecommendations(ids);
    return { recommendations };
  }

  async getReplay(year: number | null) {
    const summaries = await this.api.getReplay(year);
    return { summaries };
  }

  play(): void {
    void this.playback.play();
  }

  pause(): void {
    void this.playback.pause();
  }

  skipToNextEntry(): void {
    void this.playback.skipToNextEntry();
  }

  skipToPreviousEntry(): void {
    void this.playback.skipToPreviousEntry();
  }

  restartCurrentEntry(): void {
    void this.playback.restartCurrentEntry();
  }

  seekToTime(time: number): void {
    void this.playback.seekToTime(time);
  }

  togglePlayerState(): void {
    void this.playback.togglePlayerState();
  }

  startObserving(): void {
    this.playbackObserver.start(this);
  }

  stopObserving(): void {
    this.playbackObserver.stop();
  }
}

const moduleInstance = registerWebModule(
  ExpoAppleMusicModule,
  'ExpoAppleMusic',
) as unknown as ExpoAppleMusicModule;

export default moduleInstance;
