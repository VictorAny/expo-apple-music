package expo.modules.applemusic

import android.content.Context

internal class AndroidLibraryMutationsService(
  private val libraryMutations: LibraryMutationsRestClient,
) {
  constructor(context: Context) : this(AppleMusicRestStack.create(context).libraryMutations)

  suspend fun addToLibrary(resourceIds: Map<String, List<String>>) {
    libraryMutations.addToLibrary(resourceIds)
  }

  suspend fun createPlaylist(
    name: String,
    description: String?,
    isPublic: Boolean,
    tracks: List<Map<String, String>>?,
  ): Map<String, Any?> = libraryMutations.createLibraryPlaylist(name, description, isPublic, tracks)

  suspend fun addTracksToPlaylist(playlistId: String, tracks: List<Map<String, String>>) {
    libraryMutations.addTracksToLibraryPlaylist(playlistId, tracks)
  }
}
