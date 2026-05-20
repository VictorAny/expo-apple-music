package expo.modules.applemusic

import android.content.Context

internal class AndroidLibraryService(
  private val library: LibraryRestClient,
  private val storefront: StorefrontRestClient,
) {
  constructor(stack: AppleMusicRestStack) : this(stack.library, stack.storefront)

  constructor(context: Context) : this(AppleMusicRestStack.create(context))

  suspend fun getPlaylists(options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibraryPlaylists(options.limit, options.offset)

  suspend fun getSongs(options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibrarySongs(options.limit, options.offset)

  suspend fun getPlaylistSongs(playlistId: String): List<Map<String, Any?>> {
    val songs = library.getPlaylistTracks(playlistId)
    if (songs.isEmpty()) {
      throw AppleMusicErrors.playlistNotFound()
    }
    return songs
  }

  suspend fun getArtists(options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibraryArtists(options.limit, options.offset)

  suspend fun getAlbums(options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibraryAlbums(options.limit, options.offset)

  suspend fun getStorefrontId(): String = storefront.getStorefront()
}
