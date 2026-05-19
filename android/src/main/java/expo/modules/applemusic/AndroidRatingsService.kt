package expo.modules.applemusic

import android.content.Context

internal class AndroidRatingsService(context: Context) {
  private val api = AppleMusicApiClient(context)

  suspend fun getRating(resourceType: String, id: String): Map<String, Any?>? =
    api.getRating(resourceType, id)

  suspend fun setRating(resourceType: String, id: String, value: Int): Map<String, Any?> =
    api.setRating(resourceType, id, value)

  suspend fun clearRating(resourceType: String, id: String) {
    api.clearRating(resourceType, id)
  }

  suspend fun addToFavorites(resourceIds: Map<String, List<String>>) {
    api.addToFavorites(resourceIds)
  }

  suspend fun removeFromFavorites(resourceIds: Map<String, List<String>>) {
    api.removeFromFavorites(resourceIds)
  }
}
