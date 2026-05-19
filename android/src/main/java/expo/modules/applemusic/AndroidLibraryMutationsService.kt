package expo.modules.applemusic

import android.content.Context

internal class AndroidLibraryMutationsService(context: Context) {
  private val api = AppleMusicApiClient(context)

  suspend fun addToLibrary(resourceIds: Map<String, List<String>>) {
    api.addToLibrary(resourceIds)
  }

  suspend fun createPlaylist(
    name: String,
    description: String?,
    isPublic: Boolean,
    tracks: List<Map<String, String>>?,
  ): Map<String, Any?> = api.createLibraryPlaylist(name, description, isPublic, tracks)

  suspend fun addTracksToPlaylist(playlistId: String, tracks: List<Map<String, String>>) {
    api.addTracksToLibraryPlaylist(playlistId, tracks)
  }
}
