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

  suspend fun getRecentlyPlayedTracks(options: PaginationOptions): List<Map<String, Any?>> =
    api.getRecentlyPlayedTracks(options.limit)

  suspend fun getArtists(options: PaginationOptions): List<Map<String, Any?>> =
    api.getLibraryArtists(options.limit, options.offset)

  suspend fun getAlbums(options: PaginationOptions): List<Map<String, Any?>> =
    api.getLibraryAlbums(options.limit, options.offset)

  suspend fun getHeavyRotation(options: PaginationOptions): List<Map<String, Any?>> =
    api.getHeavyRotation(options.limit)

  suspend fun getRecentlyPlayedStations(options: PaginationOptions): List<Map<String, Any?>> =
    api.getRecentlyPlayedStations(options.limit)

  suspend fun getRecentlyAdded(options: PaginationOptions): List<Map<String, Any?>> =
    api.getRecentlyAdded(options.limit, options.offset)

  suspend fun getStorefrontId(): String = api.getStorefront()
}
