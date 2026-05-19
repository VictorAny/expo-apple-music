package expo.modules.applemusic

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

internal class AppleMusicApiClient(
  private val context: Context,
) {
  private val http =
    OkHttpClient.Builder()
      .connectTimeout(30, TimeUnit.SECONDS)
      .readTimeout(30, TimeUnit.SECONDS)
      .build()

  @Volatile
  private var cachedStorefront: String? = null

  private fun requireTokens(): Pair<String, String> {
    val developer = MusicKitAuthStorage.getDeveloperToken(context)
    val user = MusicKitAuthStorage.getMusicUserToken(context)
    if (developer.isNullOrBlank() || user.isNullOrBlank()) {
      throw AppleMusicErrors.missingTokens()
    }
    return developer to user
  }

  suspend fun getStorefront(): String =
    withContext(Dispatchers.IO) {
      cachedStorefront?.let { return@withContext it }
      val json = getJson("/v1/me/storefront")
      val id = json.getJSONArray("data").getJSONObject(0).getString("id")
      cachedStorefront = id
      id
    }

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
      val storefront = getStorefront()
      val typeParam =
        types
          .mapNotNull { catalogSearchTypeParam(it) }
          .distinct()
          .joinToString(",")
          .ifEmpty { "songs,albums" }

      val json =
        getJson(
          "/v1/catalog/$storefront/search",
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

  private suspend fun getCatalogRelationship(
    pathSuffix: String,
    limit: Int,
    offset: Int,
    typeContains: String,
    mapper: (JSONObject) -> Map<String, Any?>,
  ): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val storefront = getStorefront()
      val json =
        getJson(
          "/v1/catalog/$storefront$pathSuffix",
          mapOf(
            "limit" to limit.toString(),
            "offset" to offset.toString(),
          ),
        )
      val data = json.optJSONArray("data") ?: JSONArray()
      val items = mutableListOf<Map<String, Any?>>()
      for (i in 0 until data.length()) {
        val resource = data.getJSONObject(i)
        if (resource.optString("type", "").contains(typeContains)) {
          items.add(mapper(resource))
        }
      }
      items
    }

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
      val storefront = getStorefront()
      val typeParam =
        types
          .mapNotNull { catalogChartTypeParam(it) }
          .distinct()
          .joinToString(",")
          .ifEmpty { "songs,albums" }

      val query =
        mutableMapOf(
          "types" to typeParam,
          "limit" to limit.toString(),
          "offset" to offset.toString(),
        )
      genre?.takeIf { it.isNotBlank() }?.let { query["genre"] = it }
      chart?.takeIf { it.isNotBlank() }?.let { query["chart"] = it }

      val json = getJson("/v1/catalog/$storefront/charts", query)
      val results = json.optJSONObject("results") ?: JSONObject()
      CatalogChartsResult(
        songs = parseChartsEntries(results, "songs", "song", AppleMusicJsonMapper::mapSong),
        albums = parseChartsEntries(results, "albums", "album", AppleMusicJsonMapper::mapAlbum),
        playlists = parseChartsEntries(results, "playlists", "playlist", AppleMusicJsonMapper::mapPlaylist),
        musicVideos =
          parseChartsEntries(results, "music-videos", "music-video", AppleMusicJsonMapper::mapMusicVideo),
      )
    }

  private fun parseChartsEntries(
    results: JSONObject,
    resultsKey: String,
    typeContains: String,
    mapper: (JSONObject) -> Map<String, Any?>,
  ): List<Map<String, Any?>> {
    val charts = results.optJSONArray(resultsKey) ?: return emptyList()
    val items = mutableListOf<Map<String, Any?>>()
    for (i in 0 until charts.length()) {
      val chart = charts.optJSONObject(i) ?: continue
      val data = chart.optJSONArray("data") ?: continue
      for (j in 0 until data.length()) {
        val resource = data.getJSONObject(j)
        if (resource.optString("type", "").contains(typeContains)) {
          items.add(mapper(resource))
        }
      }
    }
    return items
  }

  private fun catalogChartTypeParam(type: String): String? =
    when (type) {
      "songs" -> "songs"
      "albums" -> "albums"
      "playlists" -> "playlists"
      "music-videos" -> "music-videos"
      else -> null
    }

  private suspend fun getCatalogResource(
    pathSuffix: String,
    mapper: (JSONObject) -> Map<String, Any?>,
  ): Map<String, Any?> =
    withContext(Dispatchers.IO) {
      val storefront = getStorefront()
      val json = getJson("/v1/catalog/$storefront$pathSuffix")
      val data = json.optJSONArray("data")
      if (data == null || data.length() == 0) {
        throw AppleMusicErrors.itemNotFound("Catalog item", false)
      }
      mapper(data.getJSONObject(0))
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

  suspend fun getLibraryPlaylists(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        getJson(
          "/v1/me/library/playlists",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapPlaylist(it) }
    }

  suspend fun getLibrarySongs(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        getJson(
          "/v1/me/library/songs",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapSong(it) }
    }

  suspend fun getPlaylistTracks(playlistId: String): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json = getJson("/v1/me/library/playlists/$playlistId/tracks")
      val data = json.optJSONArray("data") ?: JSONArray()
      val songs = mutableListOf<Map<String, Any?>>()
      for (i in 0 until data.length()) {
        val resource = data.getJSONObject(i)
        if (resource.optString("type", "").contains("song")) {
          songs.add(AppleMusicJsonMapper.mapSong(resource))
        }
      }
      songs
    }

  suspend fun getRecentlyPlayed(): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json = getJson("/v1/me/recent/played", mapOf("limit" to "10"))
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapRecentlyPlayed(it) }
    }

  suspend fun getRecentlyPlayedTracks(limit: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        getJson(
          "/v1/me/recent/played/tracks",
          mapOf("limit" to limit.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapSong(it) }
    }

  suspend fun getLibraryArtists(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        getJson(
          "/v1/me/library/artists",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapArtist(it) }
    }

  suspend fun getLibraryAlbums(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        getJson(
          "/v1/me/library/albums",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapAlbum(it) }
    }

  suspend fun getHeavyRotation(limit: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        getJson(
          "/v1/me/history/heavy-rotation",
          mapOf("limit" to limit.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapRecentResource(it) }
    }

  suspend fun getRecentlyPlayedStations(limit: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        getJson(
          "/v1/me/recent/played/stations",
          mapOf("limit" to limit.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapStation(it) }
    }

  suspend fun getRecentlyAdded(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        getJson(
          "/v1/me/library/recently-added",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapRecentResource(it) }
    }

  /** Lightweight request used by [AndroidSubscriptionService] heuristics. */
  suspend fun probeLibraryAccess(): Boolean =
    withContext(Dispatchers.IO) {
      try {
        getJson("/v1/me/library/songs", mapOf("limit" to "1"))
        true
      } catch (_: Exception) {
        false
      }
    }

  suspend fun resolveCatalogPlaybackId(libraryId: String, mediaType: String): String =
    withContext(Dispatchers.IO) {
      val path =
        when (mediaType) {
          "song" -> "/v1/me/library/songs/$libraryId"
          "album" -> "/v1/me/library/albums/$libraryId"
          "playlist" -> "/v1/me/library/playlists/$libraryId"
          else -> throw AppleMusicErrors.unknownMediaType(mediaType)
        }
      val json = getJson(path)
      val resource = json.getJSONArray("data").getJSONObject(0)
      AppleMusicJsonMapper.catalogPlaybackId(resource)
        ?: throw AppleMusicErrors.itemNotFound(mediaType.replaceFirstChar { it.uppercase() }, true)
    }

  suspend fun resolveLibrarySongCatalogIds(playlistId: String): List<String> =
    withContext(Dispatchers.IO) {
      val json = getJson("/v1/me/library/playlists/$playlistId/tracks")
      val data = json.optJSONArray("data") ?: JSONArray()
      val ids = mutableListOf<String>()
      for (i in 0 until data.length()) {
        val resource = data.getJSONObject(i)
        if (!resource.optString("type", "").contains("song")) continue
        AppleMusicJsonMapper.catalogPlaybackId(resource)?.let { ids.add(it) }
      }
      ids
    }

  suspend fun getRating(resourceType: String, id: String): Map<String, Any?>? =
    withContext(Dispatchers.IO) {
      try {
        val json = getJson("/v1/me/ratings/$resourceType/$id")
        mapRating(json)
      } catch (error: expo.modules.kotlin.exception.CodedException) {
        if (error.message?.contains("(404)") == true) {
          return@withContext null
        }
        throw error
      }
    }

  suspend fun setRating(resourceType: String, id: String, value: Int): Map<String, Any?> =
    withContext(Dispatchers.IO) {
      val body =
        JSONObject()
          .put("type", "rating")
          .put(
            "attributes",
            JSONObject().put("value", value),
          )
      val json =
        request(
          AppleMusicHttpMethod.PUT,
          "/v1/me/ratings/$resourceType/$id",
          body = body,
        )
      mapRating(json)
    }

  suspend fun clearRating(resourceType: String, id: String): Unit =
    withContext(Dispatchers.IO) {
      request(AppleMusicHttpMethod.DELETE, "/v1/me/ratings/$resourceType/$id")
    }

  suspend fun addToFavorites(resourceIds: Map<String, List<String>>): Unit =
    withContext(Dispatchers.IO) {
      request(
        AppleMusicHttpMethod.POST,
        "/v1/me/favorites",
        query = buildIdsQuery(resourceIds),
      )
    }

  suspend fun removeFromFavorites(resourceIds: Map<String, List<String>>): Unit =
    withContext(Dispatchers.IO) {
      request(
        AppleMusicHttpMethod.DELETE,
        "/v1/me/favorites",
        query = buildIdsQuery(resourceIds),
      )
    }

  suspend fun addToLibrary(resourceIds: Map<String, List<String>>): Unit =
    withContext(Dispatchers.IO) {
      request(
        AppleMusicHttpMethod.POST,
        "/v1/me/library",
        query = buildIdsQuery(resourceIds),
      )
    }

  suspend fun createLibraryPlaylist(
    name: String,
    description: String?,
    isPublic: Boolean,
    tracks: List<Map<String, String>>?,
  ): Map<String, Any?> =
    withContext(Dispatchers.IO) {
      val attributes =
        JSONObject()
          .put("name", name)
          .put("isPublic", isPublic)
      if (!description.isNullOrBlank()) {
        attributes.put(
          "description",
          JSONObject().put("standard", description),
        )
      }

      val payload = JSONObject().put("attributes", attributes)
      if (!tracks.isNullOrEmpty()) {
        val trackData = JSONArray()
        tracks.forEach { track ->
          trackData.put(
            JSONObject()
              .put("id", track["id"])
              .put("type", track["type"]),
          )
        }
        payload.put(
          "relationships",
          JSONObject().put(
            "tracks",
            JSONObject().put("data", trackData),
          ),
        )
      }

      val json =
        request(
          AppleMusicHttpMethod.POST,
          "/v1/me/library/playlists",
          body = payload,
        )
      val data = json.optJSONArray("data") ?: JSONArray()
      if (data.length() == 0) {
        throw AppleMusicErrors.apiError("Create playlist returned no data")
      }
      AppleMusicJsonMapper.mapPlaylist(data.getJSONObject(0))
    }

  suspend fun addTracksToLibraryPlaylist(
    playlistId: String,
    tracks: List<Map<String, String>>,
  ): Unit =
    withContext(Dispatchers.IO) {
      val trackData = JSONArray()
      tracks.forEach { track ->
        trackData.put(
          JSONObject()
            .put("id", track["id"])
            .put("type", track["type"]),
        )
      }
      request(
        AppleMusicHttpMethod.POST,
        "/v1/me/library/playlists/$playlistId/tracks",
        body = JSONObject().put("data", trackData),
      )
    }

  suspend fun getRecommendations(ids: List<String>?): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val query =
        if (!ids.isNullOrEmpty()) {
          mapOf("ids" to ids.joinToString(","))
        } else {
          emptyMap()
        }
      val json = getJson("/v1/me/recommendations", query)
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapRecommendation(it) }
    }

  suspend fun getReplay(year: Int?): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val query =
        if (year != null) {
          mapOf("filter[year]" to year.toString())
        } else {
          emptyMap()
        }
      val json = getJson("/v1/me/music-summaries", query)
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapReplaySummary(it) }
    }

  suspend fun request(
    method: AppleMusicHttpMethod,
    path: String,
    query: Map<String, String> = emptyMap(),
    body: JSONObject? = null,
  ): JSONObject =
    withContext(Dispatchers.IO) {
      val (developerToken, userToken) = requireTokens()
      val urlBuilder =
        HttpUrl.Builder()
          .scheme("https")
          .host("api.music.apple.com")
          .encodedPath(path)

      query.forEach { (key, value) -> urlBuilder.addQueryParameter(key, value) }

      val jsonMediaType = "application/json".toMediaType()
      val requestBody = body?.toString()?.toRequestBody(jsonMediaType)

      val requestBuilder =
        Request.Builder()
          .url(urlBuilder.build())
          .header("Authorization", "Bearer $developerToken")
          .header("Music-User-Token", userToken)

      when (method) {
        AppleMusicHttpMethod.GET -> requestBuilder.get()
        AppleMusicHttpMethod.POST ->
          requestBuilder.post(requestBody ?: "{}".toRequestBody(jsonMediaType))
        AppleMusicHttpMethod.PUT ->
          requestBuilder.put(requestBody ?: "{}".toRequestBody(jsonMediaType))
        AppleMusicHttpMethod.DELETE ->
          if (requestBody != null) {
            requestBuilder.delete(requestBody)
          } else {
            requestBuilder.delete()
          }
      }

      http.newCall(requestBuilder.build()).execute().use { response ->
        val responseBody = response.body?.string().orEmpty()
        if (!response.isSuccessful) {
          if (response.code == 403) {
            throw AppleMusicErrors.permissionDenied()
          }
          val message =
            try {
              JSONObject(responseBody).optJSONArray("errors")?.optJSONObject(0)?.optString("detail")
            } catch (_: Exception) {
              null
            } ?: "Apple Music API error (${response.code})"
          throw AppleMusicErrors.apiError(message)
        }
        if (responseBody.isEmpty()) {
          return@withContext JSONObject()
        }
        return@withContext JSONObject(responseBody)
      }
    }

  private suspend fun getJson(path: String, query: Map<String, String> = emptyMap()): JSONObject =
    request(AppleMusicHttpMethod.GET, path, query)

  private fun mapResourceArray(
    array: JSONArray?,
    mapper: (JSONObject) -> Map<String, Any?>,
  ): List<Map<String, Any?>> {
    if (array == null) return emptyList()
    val result = ArrayList<Map<String, Any?>>(array.length())
    for (i in 0 until array.length()) {
      result.add(mapper(array.getJSONObject(i)))
    }
    return result
  }

  companion object {
    fun isLibraryId(itemId: String): Boolean =
      itemId.startsWith("l.") || itemId.startsWith("i.") || itemId.startsWith("p.")

    private fun buildIdsQuery(resourceIds: Map<String, List<String>>): Map<String, String> {
      val query = linkedMapOf<String, String>()
      resourceIds.forEach { (type, ids) ->
        val filtered = ids.filter { it.isNotBlank() }
        if (filtered.isNotEmpty()) {
          query["ids[$type]"] = filtered.joinToString(",")
        }
      }
      return query
    }

    private fun mapRating(json: JSONObject): Map<String, Any?> {
      val data = json.getJSONArray("data").getJSONObject(0)
      val attributes = data.getJSONObject("attributes")
      return mapOf(
        "id" to data.getString("id"),
        "value" to attributes.getInt("value"),
      )
    }
  }
}
