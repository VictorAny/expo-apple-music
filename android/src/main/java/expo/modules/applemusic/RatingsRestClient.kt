package expo.modules.applemusic

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

/** Ratings and favorites Apple Music REST. */
internal class RatingsRestClient(
  private val transport: AppleMusicRestTransport,
) {
  suspend fun getRating(resourceType: String, id: String): Map<String, Any?>? =
    withContext(Dispatchers.IO) {
      try {
        val json = transport.getJson("/v1/me/ratings/$resourceType/$id")
        AppleMusicJsonMapper.mapRating(json)
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
        transport.request(
          AppleMusicHttpMethod.PUT,
          "/v1/me/ratings/$resourceType/$id",
          body = body,
        )
      AppleMusicJsonMapper.mapRating(json)
        ?: throw AppleMusicErrors.apiError("Invalid Apple Music API response")
    }

  suspend fun clearRating(resourceType: String, id: String): Unit =
    withContext(Dispatchers.IO) {
      transport.request(AppleMusicHttpMethod.DELETE, "/v1/me/ratings/$resourceType/$id")
    }

  suspend fun addToFavorites(resourceIds: Map<String, List<String>>): Unit =
    withContext(Dispatchers.IO) {
      transport.request(
        AppleMusicHttpMethod.POST,
        "/v1/me/favorites",
        query = buildIdsQuery(resourceIds),
      )
    }

  suspend fun removeFromFavorites(resourceIds: Map<String, List<String>>): Unit =
    withContext(Dispatchers.IO) {
      transport.request(
        AppleMusicHttpMethod.DELETE,
        "/v1/me/favorites",
        query = buildIdsQuery(resourceIds),
      )
    }
}
