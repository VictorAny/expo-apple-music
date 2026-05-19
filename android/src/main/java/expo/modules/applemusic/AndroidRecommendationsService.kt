package expo.modules.applemusic

import android.content.Context

internal class AndroidRecommendationsService(context: Context) {
  private val api = AppleMusicApiClient(context)

  suspend fun getRecommendations(ids: List<String>?): List<Map<String, Any?>> =
    api.getRecommendations(ids)

  suspend fun getReplay(year: Int?): List<Map<String, Any?>> = api.getReplay(year)
}
