package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidLibraryService
import expo.modules.applemusic.BridgeResponses
import expo.modules.applemusic.PaginationOptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

internal fun ModuleDefinitionBuilder.registerLibraryBridge(
  libraryService: () -> AndroidLibraryService,
) {
  AsyncFunction("getUserPlaylists") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.playlists(libraryService().getPlaylists(musicUserToken, pagination))
  }

  AsyncFunction("getLibrarySongs") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.songs(libraryService().getSongs(musicUserToken, pagination))
  }

  AsyncFunction("getPlaylistSongs") Coroutine {
      musicUserToken: String,
      playlistId: String,
      options: Map<String, Any?>,
    ->
    BridgeResponses.songs(libraryService().getPlaylistSongs(musicUserToken, playlistId))
  }

  AsyncFunction("getLibraryArtists") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.artists(libraryService().getArtists(musicUserToken, pagination))
  }

  AsyncFunction("getLibraryAlbums") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.albums(libraryService().getAlbums(musicUserToken, pagination))
  }

  AsyncFunction("getLibraryMusicVideos") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.musicVideos(libraryService().getMusicVideos(musicUserToken, pagination))
  }

  AsyncFunction("librarySearch") Coroutine {
      musicUserToken: String,
      term: String,
      types: List<String>,
      options: Map<String, Any?>,
    ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.librarySearch(libraryService().search(musicUserToken, term, types, pagination))
  }
}
