package expo.modules.applemusic

import android.content.Context

internal class AndroidCatalogService(context: Context) {
  private val api = AppleMusicApiClient(context)

  data class SearchResult(
    val songs: List<Map<String, Any?>>,
    val albums: List<Map<String, Any?>>,
    val artists: List<Map<String, Any?>>,
    val playlists: List<Map<String, Any?>>,
    val stations: List<Map<String, Any?>>,
    val musicVideos: List<Map<String, Any?>>,
  )

  suspend fun search(
    term: String,
    types: List<String>,
    options: PaginationOptions,
  ): SearchResult {
    val result = api.catalogSearch(term, types, options.limit, options.offset)
    return SearchResult(
      songs = result.songs,
      albums = result.albums,
      artists = result.artists,
      playlists = result.playlists,
      stations = result.stations,
      musicVideos = result.musicVideos,
    )
  }

  suspend fun getSong(id: String): Map<String, Any?> = api.getCatalogSong(id)

  suspend fun getAlbum(id: String): Map<String, Any?> = api.getCatalogAlbum(id)

  suspend fun getArtist(id: String): Map<String, Any?> = api.getCatalogArtist(id)

  suspend fun getPlaylist(id: String): Map<String, Any?> = api.getCatalogPlaylist(id)

  suspend fun getStation(id: String): Map<String, Any?> = api.getCatalogStation(id)

  suspend fun getMusicVideo(id: String): Map<String, Any?> = api.getCatalogMusicVideo(id)

  suspend fun getAlbumTracks(
    albumId: String,
    options: PaginationOptions,
  ): List<Map<String, Any?>> = api.getCatalogAlbumTracks(albumId, options.limit, options.offset)

  suspend fun getArtistAlbums(
    artistId: String,
    options: PaginationOptions,
  ): List<Map<String, Any?>> = api.getCatalogArtistAlbums(artistId, options.limit, options.offset)

  suspend fun getPlaylistTracks(
    playlistId: String,
    options: PaginationOptions,
  ): List<Map<String, Any?>> = api.getCatalogPlaylistTracks(playlistId, options.limit, options.offset)
}
