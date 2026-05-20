package expo.modules.applemusic

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/** Catalog-domain Apple Music REST (search, resources, charts). */
internal class CatalogRestClient(
  private val transport: AppleMusicRestTransport,
  private val storefront: StorefrontRestClient,
) {
  data class CatalogSearchResult(
    val songs: List<Map<String, Any?>>,
    val albums: List<Map<String, Any?>>,
    val artists: List<Map<String, Any?>>,
    val playlists: List<Map<String, Any?>>,
    val stations: List<Map<String, Any?>>,
    val musicVideos: List<Map<String, Any?>>,
  )

  suspend fun catalogSearch(
    term: String,
    types: List<String>,
    limit: Int,
    offset: Int,
  ): CatalogSearchResult =
    withContext(Dispatchers.IO) {
      val storefrontId = storefront.getStorefront()
      val typeParam =
        types
          .mapNotNull { catalogSearchTypeParam(it) }
          .distinct()
          .joinToString(",")
          .ifEmpty { "songs,albums" }

      val json =
        transport.getJson(
          "/v1/catalog/$storefrontId/search",
          mapOf(
            "term" to term,
            "types" to typeParam,
            "limit" to limit.toString(),
            "offset" to offset.toString(),
          ),
        )

      val results = json.optJSONObject("results") ?: JSONObject()
      CatalogSearchResult(
        songs =
          mapResourceArray(results.optJSONObject("songs")?.optJSONArray("data")) {
            AppleMusicJsonMapper.mapSong(it)
          },
        albums =
          mapResourceArray(results.optJSONObject("albums")?.optJSONArray("data")) {
            AppleMusicJsonMapper.mapAlbum(it)
          },
        artists =
          mapResourceArray(results.optJSONObject("artists")?.optJSONArray("data")) {
            AppleMusicJsonMapper.mapArtist(it)
          },
        playlists =
          mapResourceArray(results.optJSONObject("playlists")?.optJSONArray("data")) {
            AppleMusicJsonMapper.mapPlaylist(it)
          },
        stations =
          mapResourceArray(results.optJSONObject("stations")?.optJSONArray("data")) {
            AppleMusicJsonMapper.mapStation(it)
          },
        musicVideos =
          mapResourceArray(results.optJSONObject("music-videos")?.optJSONArray("data")) {
            AppleMusicJsonMapper.mapMusicVideo(it)
          },
      )
    }

  suspend fun getCatalogSong(id: String): Map<String, Any?> =
    getCatalogResource("/songs/$id") { AppleMusicJsonMapper.mapSong(it) }

  suspend fun getCatalogAlbum(id: String): Map<String, Any?> =
    getCatalogResource("/albums/$id") { AppleMusicJsonMapper.mapAlbum(it) }

  suspend fun getCatalogArtist(id: String): Map<String, Any?> =
    getCatalogResource("/artists/$id") { AppleMusicJsonMapper.mapArtist(it) }

  suspend fun getCatalogPlaylist(id: String): Map<String, Any?> =
    getCatalogResource("/playlists/$id") { AppleMusicJsonMapper.mapPlaylist(it) }

  suspend fun getCatalogStation(id: String): Map<String, Any?> =
    getCatalogResource("/stations/$id") { AppleMusicJsonMapper.mapStation(it) }

  suspend fun getCatalogMusicVideo(id: String): Map<String, Any?> =
    getCatalogResource("/music-videos/$id") { AppleMusicJsonMapper.mapMusicVideo(it) }

  suspend fun getCatalogResources(type: String, ids: List<String>): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val trimmed = ids.map { it.trim() }.filter { it.isNotEmpty() }
      if (trimmed.isEmpty()) {
        return@withContext emptyList()
      }
      val storefrontId = storefront.getStorefront()
      val json =
        transport.getJson(
          "/v1/catalog/$storefrontId/$type",
          mapOf("ids" to trimmed.joinToString(",")),
        )
      val data = requireDataArray(json)
      buildList {
        for (i in 0 until data.length()) {
          val resource = data.getJSONObject(i)
          mapCatalogResource(type, resource)?.let { add(it) }
        }
      }
    }

  private fun mapCatalogResource(type: String, resource: JSONObject): Map<String, Any?>? {
    val apiType = resource.optString("type", "")
    return when (type) {
      "songs" ->
        if (apiType.contains("song")) AppleMusicJsonMapper.mapSong(resource) else null
      "albums" ->
        if (apiType.contains("album")) AppleMusicJsonMapper.mapAlbum(resource) else null
      "artists" ->
        if (apiType.contains("artist")) AppleMusicJsonMapper.mapArtist(resource) else null
      "playlists" ->
        if (apiType.contains("playlist")) AppleMusicJsonMapper.mapPlaylist(resource) else null
      "stations" ->
        if (apiType.contains("station")) AppleMusicJsonMapper.mapStation(resource) else null
      "music-videos" ->
        if (apiType.contains("music-video")) AppleMusicJsonMapper.mapMusicVideo(resource) else null
      else -> null
    }
  }

  suspend fun getCatalogAlbumTracks(
    albumId: String,
    limit: Int,
    offset: Int,
  ): List<Map<String, Any?>> =
    getCatalogRelationship(
      pathSuffix = "/albums/$albumId/tracks",
      limit = limit,
      offset = offset,
      typeContains = "song",
      mapper = AppleMusicJsonMapper::mapSong,
    )

  suspend fun getCatalogArtistAlbums(
    artistId: String,
    limit: Int,
    offset: Int,
  ): List<Map<String, Any?>> =
    getCatalogRelationship(
      pathSuffix = "/artists/$artistId/albums",
      limit = limit,
      offset = offset,
      typeContains = "album",
      mapper = AppleMusicJsonMapper::mapAlbum,
    )

  suspend fun getCatalogPlaylistTracks(
    playlistId: String,
    limit: Int,
    offset: Int,
  ): List<Map<String, Any?>> =
    getCatalogRelationship(
      pathSuffix = "/playlists/$playlistId/tracks",
      limit = limit,
      offset = offset,
      typeContains = "song",
      mapper = AppleMusicJsonMapper::mapSong,
    )

  data class CatalogChartsResult(
    val songs: List<Map<String, Any?>>,
    val albums: List<Map<String, Any?>>,
    val playlists: List<Map<String, Any?>>,
    val musicVideos: List<Map<String, Any?>>,
  )

  suspend fun getCatalogCharts(
    types: List<String>,
    limit: Int,
    offset: Int,
    genre: String?,
    chart: String?,
  ): CatalogChartsResult =
    withContext(Dispatchers.IO) {
      val storefrontId = storefront.getStorefront()
      val typeParam =
        types
          .mapNotNull { catalogChartTypeParam(it) }
          .distinct()
          .joinToString(",")
          .ifEmpty { "songs,albums" }

      val query =
        buildMap {
          put("types", typeParam)
          put("limit", limit.toString())
          put("offset", offset.toString())
          genre?.takeIf { it.isNotBlank() }?.let { put("genre", it) }
          chart?.takeIf { it.isNotBlank() }?.let { put("chart", it) }
        }

      val json = transport.getJson("/v1/catalog/$storefrontId/charts", query)
      val results = json.optJSONObject("results") ?: JSONObject()
      CatalogChartsResult(
        songs = parseChartsEntries(results, "songs", "song", AppleMusicJsonMapper::mapSong),
        albums = parseChartsEntries(results, "albums", "album", AppleMusicJsonMapper::mapAlbum),
        playlists = parseChartsEntries(results, "playlists", "playlist", AppleMusicJsonMapper::mapPlaylist),
        musicVideos =
          parseChartsEntries(results, "music-videos", "music-video", AppleMusicJsonMapper::mapMusicVideo),
      )
    }

  private suspend fun getCatalogRelationship(
    pathSuffix: String,
    limit: Int,
    offset: Int,
    typeContains: String,
    mapper: (JSONObject) -> Map<String, Any?>,
  ): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val storefrontId = storefront.getStorefront()
      val json =
        transport.getJson(
          "/v1/catalog/$storefrontId$pathSuffix",
          mapOf(
            "limit" to limit.toString(),
            "offset" to offset.toString(),
          ),
        )
      val data = requireDataArray(json)
      buildList {
        for (i in 0 until data.length()) {
          val resource = data.getJSONObject(i)
          if (resource.optString("type", "").contains(typeContains)) {
            add(mapper(resource))
          }
        }
      }
    }

  private suspend fun getCatalogResource(
    pathSuffix: String,
    mapper: (JSONObject) -> Map<String, Any?>,
  ): Map<String, Any?> =
    withContext(Dispatchers.IO) {
      val storefrontId = storefront.getStorefront()
      val json = transport.getJson("/v1/catalog/$storefrontId$pathSuffix")
      val data = requireDataArray(json)
      if (data.length() == 0) {
        throw AppleMusicErrors.itemNotFound("Catalog item", false)
      }
      mapper(data.getJSONObject(0))
    }

  private fun parseChartsEntries(
    results: JSONObject,
    resultsKey: String,
    typeContains: String,
    mapper: (JSONObject) -> Map<String, Any?>,
  ): List<Map<String, Any?>> {
    val charts = results.optJSONArray(resultsKey) ?: return emptyList()
    return buildList {
      for (i in 0 until charts.length()) {
        val chart = charts.optJSONObject(i) ?: continue
        val data = chart.optJSONArray("data") ?: continue
        for (j in 0 until data.length()) {
          val resource = data.getJSONObject(j)
          if (resource.optString("type", "").contains(typeContains)) {
            add(mapper(resource))
          }
        }
      }
    }
  }

  private fun catalogChartTypeParam(type: String): String? =
    when (type) {
      "songs" -> "songs"
      "albums" -> "albums"
      "playlists" -> "playlists"
      "music-videos" -> "music-videos"
      else -> null
    }

  private fun catalogSearchTypeParam(type: String): String? =
    when (type) {
      "songs" -> "songs"
      "albums" -> "albums"
      "artists" -> "artists"
      "playlists" -> "playlists"
      "stations" -> "stations"
      "music-videos" -> "music-videos"
      else -> null
    }
}
