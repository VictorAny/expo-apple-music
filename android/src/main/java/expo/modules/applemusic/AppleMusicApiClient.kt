package expo.modules.applemusic

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
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
    withContext(Dispatchers.IO) {
      val storefront = getStorefront()
      val json =
        getJson(
          "/v1/catalog/$storefront/albums/$albumId/tracks",
          mapOf(
            "limit" to limit.toString(),
            "offset" to offset.toString(),
          ),
        )
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

  private fun getJson(path: String, query: Map<String, String> = emptyMap()): JSONObject {
    val (developerToken, userToken) = requireTokens()
    val urlBuilder =
      HttpUrl.Builder()
        .scheme("https")
        .host("api.music.apple.com")
        .encodedPath(path)

    query.forEach { (key, value) -> urlBuilder.addQueryParameter(key, value) }

    val request =
      Request.Builder()
        .url(urlBuilder.build())
        .header("Authorization", "Bearer $developerToken")
        .header("Music-User-Token", userToken)
        .get()
        .build()

    http.newCall(request).execute().use { response ->
      val body = response.body?.string().orEmpty()
      if (!response.isSuccessful) {
        val message =
          try {
            JSONObject(body).optJSONArray("errors")?.optJSONObject(0)?.optString("detail")
          } catch (_: Exception) {
            null
          } ?: "Apple Music API error (${response.code})"
        throw AppleMusicErrors.apiError(message)
      }
      return JSONObject(body)
    }
  }

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
  }
}
