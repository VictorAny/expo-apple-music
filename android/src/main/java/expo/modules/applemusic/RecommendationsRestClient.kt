package expo.modules.applemusic

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Recommendations and Replay Apple Music REST. */
internal class RecommendationsRestClient(
  private val transport: AppleMusicRestTransport,
) {
  suspend fun getRecommendations(musicUserToken: String, ids: List<String>?): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val query =
        if (!ids.isNullOrEmpty()) {
          mapOf("ids" to ids.joinToString(","))
        } else {
          emptyMap()
        }
      val json = transport.getJson(
          musicUserToken,
          "/v1/me/recommendations", query)
      mapTopLevelResourceArray(json) { AppleMusicJsonMapper.mapRecommendation(it) }
    }

  suspend fun getReplay(musicUserToken: String, year: Int?): List<Map<String, Any?>> =
    withContext(Dispatchers.IO) {
      val query =
        if (year != null) {
          mapOf("filter[year]" to year.toString())
        } else {
          emptyMap()
        }
      val json = transport.getJson(
          musicUserToken,
          "/v1/me/music-summaries", query)
      mapTopLevelResourceArray(json) { AppleMusicJsonMapper.mapReplaySummary(it) }
    }
}
