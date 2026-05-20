package expo.modules.applemusic

import android.content.Context

internal class AndroidRecommendationsService(
  private val recommendations: RecommendationsRestClient,
) {
  constructor(context: Context) : this(AppleMusicRestStack.create(context).recommendations)

  suspend fun getRecommendations(ids: List<String>?): List<Map<String, Any?>> =
    recommendations.getRecommendations(ids)

  suspend fun getReplay(year: Int?): List<Map<String, Any?>> = recommendations.getReplay(year)
}
