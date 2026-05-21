package expo.modules.applemusic

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** History-domain Apple Music REST (recently played, heavy rotation). */
internal class HistoryRestClient(
  private val transport: AppleMusicRestTransport,
) {
  suspend fun getRecentlyPlayed(musicUserToken: String): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(musicUserToken, "/v1/me/recent/played", mapOf("limit" to "10"))
      mapTopLevelResourceArray(json) { AppleMusicJsonMapper.mapRecentlyPlayed(it) }
    }

  suspend fun getRecentlyPlayedTracks(musicUserToken: String, limit: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          musicUserToken,
          "/v1/me/recent/played/tracks",
          mapOf("limit" to limit.toString()),
        )
      mapTopLevelResourceArray(json) { AppleMusicJsonMapper.mapSong(it) }
    }

  suspend fun getHeavyRotation(musicUserToken: String, limit: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          musicUserToken,
          "/v1/me/history/heavy-rotation",
          mapOf("limit" to limit.toString()),
        )
      mapTopLevelResourceArray(json) { AppleMusicJsonMapper.mapRecentResource(it) }
    }

  suspend fun getRecentlyPlayedStations(musicUserToken: String, limit: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          musicUserToken,
          "/v1/me/recent/radio-stations",
          mapOf("limit" to limit.toString()),
        )
      mapTopLevelResourceArray(json) { AppleMusicJsonMapper.mapStation(it) }
    }

  suspend fun getRecentlyAdded(musicUserToken: String, limit: Int, offset: Int): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val json =
        transport.getJson(
          musicUserToken,
          "/v1/me/library/recently-added",
          mapOf("limit" to limit.toString(), "offset" to offset.toString()),
        )
      mapTopLevelResourceArray(json) { AppleMusicJsonMapper.mapRecentResource(it) }
    }
}
