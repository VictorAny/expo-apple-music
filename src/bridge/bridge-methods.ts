/**
 * Canonical Expo bridge method names grouped by domain.
 * Native modules (iOS/Android/Web) should register exactly these names.
 * Public JS API lives in `src/modules/*` (`Catalog.search` → `catalogSearch`, etc.).
 */

export type BridgeDomain =
  | 'auth'
  | 'catalog'
  | 'library'
  | 'history'
  | 'player'
  | 'ratings'
  | 'libraryMutations'
  | 'recommendations';

export type BridgeMethodSpec = {
  domain: BridgeDomain;
  /** Expo `AsyncFunction` / `Function` name exposed to JS via `MusicModule`. */
  nativeName: string;
  /** Public TS module method (documentation / parity checks). */
  publicName: string;
};

export const BRIDGE_METHODS: readonly BridgeMethodSpec[] = [
  { domain: 'auth', nativeName: 'setDeveloperToken', publicName: 'Auth.refreshDeveloperToken' },
  { domain: 'auth', nativeName: 'authorization', publicName: 'Auth.authorize' },
  { domain: 'auth', nativeName: 'checkSubscription', publicName: 'Auth.checkSubscription' },
  { domain: 'auth', nativeName: 'getStorefront', publicName: 'Auth.getStorefront' },

  { domain: 'catalog', nativeName: 'catalogSearch', publicName: 'Catalog.search' },
  { domain: 'catalog', nativeName: 'getCatalogSong', publicName: 'Catalog.getSong' },
  { domain: 'catalog', nativeName: 'getCatalogAlbum', publicName: 'Catalog.getAlbum' },
  { domain: 'catalog', nativeName: 'getCatalogArtist', publicName: 'Catalog.getArtist' },
  { domain: 'catalog', nativeName: 'getCatalogPlaylist', publicName: 'Catalog.getPlaylist' },
  { domain: 'catalog', nativeName: 'getCatalogStation', publicName: 'Catalog.getStation' },
  { domain: 'catalog', nativeName: 'getCatalogMusicVideo', publicName: 'Catalog.getMusicVideo' },
  { domain: 'catalog', nativeName: 'getCatalogAlbumTracks', publicName: 'Catalog.getAlbumTracks' },
  { domain: 'catalog', nativeName: 'getCatalogArtistAlbums', publicName: 'Catalog.getArtistAlbums' },
  { domain: 'catalog', nativeName: 'getCatalogPlaylistTracks', publicName: 'Catalog.getPlaylistTracks' },
  { domain: 'catalog', nativeName: 'getCatalogCharts', publicName: 'Catalog.getCharts' },
  { domain: 'catalog', nativeName: 'getCatalogResources', publicName: 'Catalog.getByIds' },

  { domain: 'library', nativeName: 'getUserPlaylists', publicName: 'Library.getPlaylists' },
  { domain: 'library', nativeName: 'getLibrarySongs', publicName: 'Library.getSongs' },
  { domain: 'library', nativeName: 'getPlaylistSongs', publicName: 'Library.getPlaylistTracks' },
  { domain: 'library', nativeName: 'getLibraryArtists', publicName: 'Library.getArtists' },
  { domain: 'library', nativeName: 'getLibraryAlbums', publicName: 'Library.getAlbums' },
  { domain: 'library', nativeName: 'getLibraryMusicVideos', publicName: 'Library.getMusicVideos' },
  { domain: 'library', nativeName: 'librarySearch', publicName: 'Library.search' },

  { domain: 'history', nativeName: 'getRecentlyPlayedResources', publicName: 'History.getRecentlyPlayedResources' },
  { domain: 'history', nativeName: 'getRecentlyPlayedTracks', publicName: 'History.getRecentlyPlayedTracks' },
  { domain: 'history', nativeName: 'getHeavyRotation', publicName: 'History.getHeavyRotation' },
  { domain: 'history', nativeName: 'getRecentlyPlayedStations', publicName: 'History.getRecentlyPlayedStations' },
  { domain: 'history', nativeName: 'getRecentlyAdded', publicName: 'History.getRecentlyAdded' },

  { domain: 'player', nativeName: 'setPlaybackQueue', publicName: 'Player.setQueue' },
  { domain: 'player', nativeName: 'playLibrarySong', publicName: 'Player.playLibrarySong' },
  { domain: 'player', nativeName: 'playLibraryPlaylist', publicName: 'Player.playLibraryPlaylist' },
  { domain: 'player', nativeName: 'configurePlayer', publicName: 'Player.configurePlayer' },
  { domain: 'player', nativeName: 'getCurrentState', publicName: 'Player.getCurrentState' },
  { domain: 'player', nativeName: 'play', publicName: 'Player.play' },
  { domain: 'player', nativeName: 'pause', publicName: 'Player.pause' },
  { domain: 'player', nativeName: 'skipToNextEntry', publicName: 'Player.skipToNextEntry' },
  { domain: 'player', nativeName: 'skipToPreviousEntry', publicName: 'Player.skipToPreviousEntry' },
  { domain: 'player', nativeName: 'restartCurrentEntry', publicName: 'Player.restartCurrentEntry' },
  { domain: 'player', nativeName: 'seekToTime', publicName: 'Player.seekToTime' },
  { domain: 'player', nativeName: 'togglePlayerState', publicName: 'Player.togglePlayerState' },

  { domain: 'ratings', nativeName: 'getRating', publicName: 'Ratings.getRating' },
  { domain: 'ratings', nativeName: 'setRating', publicName: 'Ratings.setRating' },
  { domain: 'ratings', nativeName: 'clearRating', publicName: 'Ratings.clearRating' },
  { domain: 'ratings', nativeName: 'addToFavorites', publicName: 'Ratings.addToFavorites' },
  { domain: 'ratings', nativeName: 'removeFromFavorites', publicName: 'Ratings.removeFromFavorites' },

  { domain: 'libraryMutations', nativeName: 'addToLibrary', publicName: 'LibraryMutations.addToLibrary' },
  { domain: 'libraryMutations', nativeName: 'createLibraryPlaylist', publicName: 'LibraryMutations.createPlaylist' },
  {
    domain: 'libraryMutations',
    nativeName: 'addTracksToLibraryPlaylist',
    publicName: 'LibraryMutations.addTracksToPlaylist',
  },

  { domain: 'recommendations', nativeName: 'getRecommendations', publicName: 'Recommendations.get' },
  { domain: 'recommendations', nativeName: 'getReplay', publicName: 'Recommendations.getReplay' },
] as const;

export const BRIDGE_EVENTS = [
  'onPlaybackStateChange',
  'onCurrentSongChange',
  'onPlaybackTimeUpdate',
  'onPlaybackError',
] as const;

export function bridgeMethodsForDomain(domain: BridgeDomain): BridgeMethodSpec[] {
  return BRIDGE_METHODS.filter((m) => m.domain === domain);
}
