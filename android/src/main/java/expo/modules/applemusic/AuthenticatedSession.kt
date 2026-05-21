package expo.modules.applemusic

import android.content.Context

/**
 * Snapshot of stored developer JWT (see docs/AUTH.md).
 * Music user tokens are app-owned — passed per call, not persisted by native.
 */
internal data class AuthenticatedSession(
  val developerToken: String?,
) {
  val hasDeveloperToken: Boolean
    get() = !developerToken.isNullOrBlank()

  companion object {
    fun load(context: Context): AuthenticatedSession =
      AuthenticatedSession(
        developerToken = MusicKitAuthStorage.getDeveloperToken(context),
      )
  }
}

/** In-memory storefront resolved after auth; cleared when developer token changes. */
internal object AuthenticatedSessionCache {
  @Volatile
  var storefrontId: String? = null

  fun invalidate() {
    storefrontId = null
  }
}
