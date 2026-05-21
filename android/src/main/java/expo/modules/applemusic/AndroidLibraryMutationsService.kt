package expo.modules.applemusic

import android.content.Context

internal class AndroidLibraryMutationsService(
  private val libraryMutations: LibraryMutationsRestClient,
) {
  constructor(context: Context) : this(AppleMusicRestStack.create(context).libraryMutations)

  suspend fun addToLibrary(musicUserToken: String, resourceIds: Map<String, List<String>>) {
    libraryMutations.addToLibrary(musicUserToken, resourceIds)
  }

  suspend fun createPlaylist(
    musicUserToken: String,
    name: String,
    description: String?,
    isPublic: Boolean,
    tracks: List<Map<String, String>>?,
  ): Map<String, Any?> =
    libraryMutations.createLibraryPlaylist(musicUserToken, name, description, isPublic, tracks)

  suspend fun addTracksToPlaylist(
    musicUserToken: String,
    playlistId: String,
    tracks: List<Map<String, String>>,
  ) {
    libraryMutations.addTracksToLibraryPlaylist(musicUserToken, playlistId, tracks)
  }
}
