package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidLibraryService
import expo.modules.applemusic.BridgeResponses
import expo.modules.applemusic.PaginationOptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

internal fun ModuleDefinitionBuilder.registerLibraryBridge(
  libraryService: () -> AndroidLibraryService,
) {
  AsyncFunction("getUserPlaylists") Coroutine { options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.playlists(libraryService().getPlaylists(pagination))
  }

  AsyncFunction("getLibrarySongs") Coroutine { options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.songs(libraryService().getSongs(pagination))
  }

  AsyncFunction("getPlaylistSongs") Coroutine { playlistId: String, options: Map<String, Any?> ->
    BridgeResponses.songs(libraryService().getPlaylistSongs(playlistId))
  }

  AsyncFunction("getLibraryArtists") Coroutine { options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.artists(libraryService().getArtists(pagination))
  }

  AsyncFunction("getLibraryAlbums") Coroutine { options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.albums(libraryService().getAlbums(pagination))
  }
}
