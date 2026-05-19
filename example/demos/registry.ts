import type { ComponentType } from "react";
import * as auth from "./auth";
import * as catalog from "./catalog";
import * as history from "./history";
import * as hooks from "./hooks";
import * as library from "./library";
import * as libraryMutations from "./libraryMutations";
import * as player from "./player";
import * as ratings from "./ratings";
import * as recommendations from "./recommendations";

export type MethodDemoMap = Record<string, ComponentType>;

export const METHOD_DEMOS: Record<string, MethodDemoMap> = {
  auth: {
    authorize: auth.AuthorizeDemo,
    checkSubscription: auth.CheckSubscriptionDemo,
    getStorefront: auth.GetStorefrontDemo,
  },
  catalog: {
    search: catalog.SearchDemo,
    getSong: catalog.GetSongDemo,
    getAlbum: catalog.GetAlbumDemo,
    getArtist: catalog.GetArtistDemo,
    getPlaylist: catalog.GetPlaylistDemo,
    getStation: catalog.GetStationDemo,
    getMusicVideo: catalog.GetMusicVideoDemo,
    getAlbumTracks: catalog.GetAlbumTracksDemo,
    getArtistAlbums: catalog.GetArtistAlbumsDemo,
    getPlaylistTracks: catalog.GetPlaylistTracksDemo,
    getCharts: catalog.GetChartsDemo,
  },
  player: {
    configurePlayer: player.ConfigurePlayerDemo,
    setQueue: player.SetQueueDemo,
    playLibrarySong: player.PlayLibrarySongDemo,
    playLibraryPlaylist: player.PlayLibraryPlaylistDemo,
    getCurrentState: player.GetCurrentStateDemo,
    play: player.PlayDemo,
    pause: player.PauseDemo,
    togglePlayerState: player.TogglePlayerStateDemo,
    skipToNextEntry: player.SkipToNextEntryDemo,
    skipToPreviousEntry: player.SkipToPreviousEntryDemo,
    restartCurrentEntry: player.RestartCurrentEntryDemo,
    seekToTime: player.SeekToTimeDemo,
    addListener: player.AddListenerDemo,
  },
  library: {
    getPlaylists: library.GetPlaylistsDemo,
    getSongs: library.GetSongsDemo,
    getPlaylistTracks: library.GetPlaylistTracksDemo,
    getArtists: library.GetArtistsDemo,
    getAlbums: library.GetAlbumsDemo,
  },
  history: {
    getRecentlyPlayedResources: history.GetRecentlyPlayedResourcesDemo,
    getRecentlyPlayedTracks: history.GetRecentlyPlayedTracksDemo,
    getHeavyRotation: history.GetHeavyRotationDemo,
    getRecentlyPlayedStations: history.GetRecentlyPlayedStationsDemo,
    getRecentlyAdded: history.GetRecentlyAddedDemo,
  },
  "library-mutations": {
    addToLibrary: libraryMutations.AddToLibraryDemo,
    createPlaylist: libraryMutations.CreatePlaylistDemo,
    addTracksToPlaylist: libraryMutations.AddTracksToPlaylistDemo,
  },
  ratings: {
    getRating: ratings.GetRatingDemo,
    setRating: ratings.SetRatingDemo,
    clearRating: ratings.ClearRatingDemo,
    addToFavorites: ratings.AddToFavoritesDemo,
    removeFromFavorites: ratings.RemoveFromFavoritesDemo,
  },
  recommendations: {
    get: recommendations.GetRecommendationsDemo,
    getReplay: recommendations.GetReplayDemo,
  },
  hooks: {
    useCurrentSong: hooks.UseCurrentSongDemo,
    useIsPlaying: hooks.UseIsPlayingDemo,
    usePlaybackState: hooks.UsePlaybackStateDemo,
  },
};

export function getMethodDemo(
  moduleId: string,
  methodId: string,
): ComponentType | undefined {
  return METHOD_DEMOS[moduleId]?.[methodId];
}
