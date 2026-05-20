package expo.modules.applemusic

import android.content.Context

internal class AndroidRatingsService(
  private val ratings: RatingsRestClient,
) {
  constructor(context: Context) : this(AppleMusicRestStack.create(context).ratings)

  suspend fun getRating(resourceType: String, id: String): Map<String, Any?>? =
    ratings.getRating(resourceType, id)

  suspend fun setRating(resourceType: String, id: String, value: Int): Map<String, Any?> =
    ratings.setRating(resourceType, id, value)

  suspend fun clearRating(resourceType: String, id: String) {
    ratings.clearRating(resourceType, id)
  }

  suspend fun addToFavorites(resourceIds: Map<String, List<String>>) {
    ratings.addToFavorites(resourceIds)
  }

  suspend fun removeFromFavorites(resourceIds: Map<String, List<String>>) {
    ratings.removeFromFavorites(resourceIds)
  }
}
