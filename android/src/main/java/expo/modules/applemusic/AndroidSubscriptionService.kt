package expo.modules.applemusic

import android.content.Context

/**
 * Approximates iOS [MusicSubscription] fields — there is no equivalent on Android.
 */
internal class AndroidSubscriptionService(
  private val context: Context,
) {
  private val api = AppleMusicApiClient(context)

  suspend fun checkSubscription(): Map<String, Any?> {
    if (!AuthenticatedSession.load(context).hasMusicUserToken) {
      throw AppleMusicErrors.missingTokens()
    }

    val libraryOk = api.probeLibraryAccess()
    val canPlay = libraryOk

    return mapOf(
      "canPlayCatalogContent" to canPlay,
      "canBecomeSubscriber" to false,
      "hasCloudLibraryEnabled" to libraryOk,
      "isMusicCatalogSubscriptionEligible" to false,
    )
  }
}
