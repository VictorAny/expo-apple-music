package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidLibraryMutationsService
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

internal fun ModuleDefinitionBuilder.registerLibraryMutationsBridge(
  libraryMutationsService: () -> AndroidLibraryMutationsService,
) {
  AsyncFunction("addToLibrary") Coroutine { resourceIds: Map<String, List<String>> ->
    libraryMutationsService().addToLibrary(resourceIds)
  }

  AsyncFunction("createLibraryPlaylist") Coroutine { options: Map<String, Any?> ->
    val name = options["name"] as? String ?: ""
    val description = options["description"] as? String
    val isPublic = options["isPublic"] as? Boolean ?: false
    @Suppress("UNCHECKED_CAST")
    val tracks = options["tracks"] as? List<Map<String, String>>
    libraryMutationsService().createPlaylist(name, description, isPublic, tracks)
  }

  AsyncFunction("addTracksToLibraryPlaylist") Coroutine {
    playlistId: String,
    tracks: List<Map<String, String>>,
  ->
    libraryMutationsService().addTracksToPlaylist(playlistId, tracks)
  }
}
