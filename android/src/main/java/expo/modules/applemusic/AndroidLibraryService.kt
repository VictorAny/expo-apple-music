package expo.modules.applemusic

import android.content.Context

internal class AndroidLibraryService(
  private val library: LibraryRestClient,
  private val storefront: StorefrontRestClient,
) {
  constructor(stack: AppleMusicRestStack) : this(stack.library, stack.storefront)

  constructor(context: Context) : this(AppleMusicRestStack.create(context))

  suspend fun getPlaylists(musicUserToken: String, options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibraryPlaylists(musicUserToken, options.limit, options.offset)

  suspend fun getSongs(musicUserToken: String, options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibrarySongs(musicUserToken, options.limit, options.offset)

  suspend fun getPlaylistSongs(musicUserToken: String, playlistId: String): List<Map<String, Any?>> {
    val songs = library.getPlaylistTracks(musicUserToken, playlistId)
    if (songs.isEmpty()) {
      throw AppleMusicErrors.playlistNotFound()
    }
    return songs
  }

  suspend fun getArtists(musicUserToken: String, options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibraryArtists(musicUserToken, options.limit, options.offset)

  suspend fun getAlbums(musicUserToken: String, options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibraryAlbums(musicUserToken, options.limit, options.offset)

  suspend fun getMusicVideos(musicUserToken: String, options: PaginationOptions): List<Map<String, Any?>> =
    library.getLibraryMusicVideos(musicUserToken, options.limit, options.offset)

  data class LibrarySearchResult(
    val songs: List<Map<String, Any?>>,
    val albums: List<Map<String, Any?>>,
    val artists: List<Map<String, Any?>>,
    val playlists: List<Map<String, Any?>>,
    val musicVideos: List<Map<String, Any?>>,
  )

  suspend fun search(
    musicUserToken: String,
    term: String,
    types: List<String>,
    options: PaginationOptions,
  ): LibrarySearchResult {
    val result = library.searchLibrary(musicUserToken, term, types, options.limit, options.offset)
    return LibrarySearchResult(
      songs = result.songs,
      albums = result.albums,
      artists = result.artists,
      playlists = result.playlists,
      musicVideos = result.musicVideos,
    )
  }

  suspend fun getStorefrontId(musicUserToken: String): String = storefront.getStorefront(musicUserToken)
}
