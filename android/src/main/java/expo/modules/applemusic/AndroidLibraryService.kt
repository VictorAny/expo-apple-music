package expo.modules.applemusic

import android.content.Context

internal class AndroidLibraryService(context: Context) {
  private val api = AppleMusicApiClient(context)

  suspend fun getPlaylists(options: PaginationOptions): List<Map<String, Any?>> =
    api.getLibraryPlaylists(options.limit, options.offset)

  suspend fun getSongs(options: PaginationOptions): List<Map<String, Any?>> =
    api.getLibrarySongs(options.limit, options.offset)

  suspend fun getPlaylistSongs(playlistId: String): List<Map<String, Any?>> {
    val songs = api.getPlaylistTracks(playlistId)
    if (songs.isEmpty()) {
      throw AppleMusicErrors.playlistNotFound()
    }
    return songs
  }

  suspend fun getRecentlyPlayed(): List<Map<String, Any?>> = api.getRecentlyPlayed()
}
