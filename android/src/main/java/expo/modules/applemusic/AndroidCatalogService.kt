package expo.modules.applemusic

import android.content.Context

internal class AndroidCatalogService(
  private val catalog: CatalogRestClient,
) {
  constructor(context: Context) : this(AppleMusicRestStack.create(context).catalog)

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
    val result = catalog.catalogSearch(term, types, options.limit, options.offset)
    return SearchResult(
      songs = result.songs,
      albums = result.albums,
      artists = result.artists,
      playlists = result.playlists,
      stations = result.stations,
      musicVideos = result.musicVideos,
    )
  }

  suspend fun getSong(id: String): Map<String, Any?> = catalog.getCatalogSong(id)

  suspend fun getAlbum(id: String): Map<String, Any?> = catalog.getCatalogAlbum(id)

  suspend fun getArtist(id: String): Map<String, Any?> = catalog.getCatalogArtist(id)

  suspend fun getPlaylist(id: String): Map<String, Any?> = catalog.getCatalogPlaylist(id)

  suspend fun getStation(id: String): Map<String, Any?> = catalog.getCatalogStation(id)

  suspend fun getMusicVideo(id: String): Map<String, Any?> = catalog.getCatalogMusicVideo(id)

  suspend fun getAlbumTracks(
    albumId: String,
    options: PaginationOptions,
  ): List<Map<String, Any?>> = catalog.getCatalogAlbumTracks(albumId, options.limit, options.offset)

  suspend fun getArtistAlbums(
    artistId: String,
    options: PaginationOptions,
  ): List<Map<String, Any?>> = catalog.getCatalogArtistAlbums(artistId, options.limit, options.offset)

  suspend fun getPlaylistTracks(
    playlistId: String,
    options: PaginationOptions,
  ): List<Map<String, Any?>> = catalog.getCatalogPlaylistTracks(playlistId, options.limit, options.offset)

  data class ChartsResult(
    val songs: List<Map<String, Any?>>,
    val albums: List<Map<String, Any?>>,
    val playlists: List<Map<String, Any?>>,
    val musicVideos: List<Map<String, Any?>>,
  )

  suspend fun getCharts(
    types: List<String>,
    options: PaginationOptions,
    genre: String?,
    chart: String?,
  ): ChartsResult {
    val result = catalog.getCatalogCharts(types, options.limit, options.offset, genre, chart)
    return ChartsResult(
      songs = result.songs,
      albums = result.albums,
      playlists = result.playlists,
      musicVideos = result.musicVideos,
    )
  }
}
