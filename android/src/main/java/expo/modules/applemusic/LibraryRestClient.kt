package expo.modules.applemusic

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray

/** Library-domain Apple Music REST (user collection reads + playback id resolution). */
internal class LibraryRestClient(
  private val transport: AppleMusicRestTransport,
) {
  suspend fun getLibraryPlaylists(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          "/v1/me/library/playlists",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapPlaylist(it) }
    }

  suspend fun getLibrarySongs(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          "/v1/me/library/songs",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapSong(it) }
    }

  suspend fun getPlaylistTracks(playlistId: String): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json = transport.getJson("/v1/me/library/playlists/$playlistId/tracks")
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

  suspend fun getLibraryArtists(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          "/v1/me/library/artists",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapArtist(it) }
    }

  suspend fun getLibraryAlbums(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          "/v1/me/library/albums",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapAlbum(it) }
    }

  suspend fun getRecentlyAdded(limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          "/v1/me/library/recently-added",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapRecentResource(it) }
    }

  suspend fun probeLibraryAccess(): Boolean =
    withContext(Dispatchers.IO) {
      try {
        transport.getJson("/v1/me/library/songs", mapOf("limit" to "1"))
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
      val json = transport.getJson(path)
      val resource = json.getJSONArray("data").getJSONObject(0)
      AppleMusicJsonMapper.catalogPlaybackId(resource)
        ?: throw AppleMusicErrors.itemNotFound(mediaType.replaceFirstChar { it.uppercase() }, true)
    }

  suspend fun resolveLibrarySongCatalogIds(playlistId: String): List<String> =
    withContext(Dispatchers.IO) {
      val json = transport.getJson("/v1/me/library/playlists/$playlistId/tracks")
      val data = json.optJSONArray("data") ?: JSONArray()
      val ids = mutableListOf<String>()
      for (i in 0 until data.length()) {
        val resource = data.getJSONObject(i)
        if (!resource.optString("type", "").contains("song")) continue
        AppleMusicJsonMapper.catalogPlaybackId(resource)?.let { ids.add(it) }
      }
      ids
    }
}
