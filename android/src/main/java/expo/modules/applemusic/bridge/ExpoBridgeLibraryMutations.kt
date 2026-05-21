package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidLibraryMutationsService
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

internal fun ModuleDefinitionBuilder.registerLibraryMutationsBridge(
  libraryMutationsService: () -> AndroidLibraryMutationsService,
) {
  AsyncFunction("addToLibrary") Coroutine { musicUserToken: String, resourceIds: Map<String, List<String>> ->
    libraryMutationsService().addToLibrary(musicUserToken, resourceIds)
  }

  AsyncFunction("createLibraryPlaylist") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val name = options["name"] as? String ?: ""
    val description = options["description"] as? String
    val isPublic = options["isPublic"] as? Boolean ?: false
    @Suppress("UNCHECKED_CAST")
    val tracks = options["tracks"] as? List<Map<String, String>>
    libraryMutationsService().createPlaylist(musicUserToken, name, description, isPublic, tracks)
  }

  AsyncFunction("addTracksToLibraryPlaylist") Coroutine {
      musicUserToken: String,
      playlistId: String,
      tracks: List<Map<String, String>>,
    ->
    libraryMutationsService().addTracksToPlaylist(musicUserToken, playlistId, tracks)
  }
}
