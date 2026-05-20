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

  suspend fun getMusicVideos(options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibraryMusicVideos(options.limit, options.offset)

  data class LibrarySearchResult(
    val songs: List<Map<String, Any?>>,
    val albums: List<Map<String, Any?>>,
    val artists: List<Map<String, Any?>>,
    val playlists: List<Map<String, Any?>>,
    val musicVideos: List<Map<String, Any?>>,
  )

  suspend fun search(
    term: String,
    types: List<String>,
    options: PaginationOptions,
  ): LibrarySearchResult {
    val result = library.searchLibrary(term, types, options.limit, options.offset)
    return LibrarySearchResult(
      songs = result.songs,
      albums = result.albums,
      artists = result.artists,
      playlists = result.playlists,
      musicVideos = result.musicVideos,
    )
  }

  suspend fun getStorefrontId(): String = storefront.getStorefront()
}
