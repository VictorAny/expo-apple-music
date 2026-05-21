package expo.modules.applemusic

import android.content.Context

internal class AndroidRatingsService(
  private val ratings: RatingsRestClient,
) {
  constructor(context: Context) : this(AppleMusicRestStack.create(context).ratings)

  suspend fun getRating(musicUserToken: String, resourceType: String, id: String): Map<String, Any?>? =
    ratings.getRating(musicUserToken, resourceType, id)

  suspend fun setRating(musicUserToken: String, resourceType: String, id: String, value: Int): Map<String, Any?> =
    ratings.setRating(musicUserToken, resourceType, id, value)

  suspend fun clearRating(musicUserToken: String, resourceType: String, id: String) {
    ratings.clearRating(musicUserToken, resourceType, id)
  }

  suspend fun addToFavorites(musicUserToken: String, resourceIds: Map<String, List<String>>) {
    ratings.addToFavorites(musicUserToken, resourceIds)
  }

  suspend fun removeFromFavorites(musicUserToken: String, resourceIds: Map<String, List<String>>) {
    ratings.removeFromFavorites(musicUserToken, resourceIds)
  }
}
