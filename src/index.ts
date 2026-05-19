export type { IPlaybackState } from './types/playback-state';

export * from './types/song';

export * from './types/playback-status';

export * from './types/catalog-search';

export * from './types/album';

export * from './types/auth-status';

export type { AndroidAuthorizeOptions } from './types/android-authorize-options';

export * from './types/check-subscription';

export * from './types/music-item';

export * from './types/tracks-from-library';

export * from './types/playlist';

export * from './types/pagination';

export * from './types/artist';

export * from './types/storefront';

export * from './types/recent-resource';

export * from './types/station';

export * from './types/albums-response';

import useCurrentSong from './hooks/use-current-song';
import useIsPlaying from './hooks/use-is-playing';
import usePlaybackState from './hooks/use-playback-state';
import Auth from './modules/auth';
import Catalog from './modules/catalog';
import History from './modules/history';
import Library from './modules/library';
import MusicKit from './modules/music-kit';
import Player from './modules/player';

export type { ILibrarySongsResponse } from './modules/library';

export type { IEndlessListOptions } from './modules/music-kit';

export type { IRecentlyPlayedTracksResponse } from './modules/history';

export type { IAlbumsResponse } from './types/albums-response';

export type { IPlayerConfig, IPlaybackError } from './modules/player';

export type { AppleMusicError } from './utils/apple-music-error';

export { isLibraryItem } from './utils/is-library-item';

export { getErrorMessage } from './utils/get-error-message';

export {
  useCurrentSong,
  useIsPlaying,
  usePlaybackState,
  Auth,
  Catalog,
  History,
  Library,
  Player,
  MusicKit,
};
