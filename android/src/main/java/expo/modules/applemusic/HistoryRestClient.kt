package expo.modules.applemusic

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** History-domain Apple Music REST (recently played, heavy rotation). */
internal class HistoryRestClient(
  private val transport: AppleMusicRestTransport,
) {
  suspend fun getRecentlyPlayed(): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json = transport.getJson("/v1/me/recent/played", mapOf("limit" to "10"))
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapRecentlyPlayed(it) }
    }

  suspend fun getRecentlyPlayedTracks(limit: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          "/v1/me/recent/played/tracks",
          mapOf("limit" to limit.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapSong(it) }
    }

  suspend fun getHeavyRotation(limit: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          "/v1/me/history/heavy-rotation",
          mapOf("limit" to limit.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapRecentResource(it) }
    }

  suspend fun getRecentlyPlayedStations(limit: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          "/v1/me/recent/radio-stations",
          mapOf("limit" to limit.toString()),
        )
      mapResourceArray(json.optJSONArray("data")) { AppleMusicJsonMapper.mapStation(it) }
    }
}
