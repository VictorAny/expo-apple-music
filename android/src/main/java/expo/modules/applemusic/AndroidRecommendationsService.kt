package expo.modules.applemusic

import android.content.Context

internal class AndroidRecommendationsService(
  private val recommendations: RecommendationsRestClient,
) {
  constructor(context: Context) : this(AppleMusicRestStack.create(context).recommendations)

  suspend fun getRecommendations(musicUserToken: String, ids: List<String>?): List<Map<String, Any?>> =
    recommendations.getRecommendations(musicUserToken, ids)

  suspend fun getReplay(musicUserToken: String, year: Int?): List<Map<String, Any?>> =
    recommendations.getReplay(musicUserToken, year)
}
