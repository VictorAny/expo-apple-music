package expo.modules.applemusic

import android.content.Context

/**
 * Snapshot of stored MusicKit credentials and REST readiness (see docs/AUTH.md).
 * [MusicKitAuthStorage] persists tokens; services depend on this session, not storage directly.
 */
internal data class AuthenticatedSession(
  val developerToken: String?,
  val musicUserToken: String?,
) {
  val hasDeveloperToken: Boolean
    get() = !developerToken.isNullOrBlank()

  val hasMusicUserToken: Boolean
    get() = !musicUserToken.isNullOrBlank()

  /** Android REST and playback require both tokens after [authorize]. */
  val hasRestCredentials: Boolean
    get() = hasDeveloperToken && hasMusicUserToken

  data class RestCredentials(
    val developerToken: String,
    val musicUserToken: String,
  )

  fun requireRestCredentials(): RestCredentials {
    val developer = developerToken?.takeIf { it.isNotBlank() }
    val user = musicUserToken?.takeIf { it.isNotBlank() }
    if (developer == null || user == null) {
      throw AppleMusicErrors.missingTokens()
    }
    return RestCredentials(developer, user)
  }

  companion object {
    fun load(context: Context): AuthenticatedSession =
      AuthenticatedSession(
        developerToken = MusicKitAuthStorage.getDeveloperToken(context),
        musicUserToken = MusicKitAuthStorage.getMusicUserToken(context),
      )
  }
}

/** In-memory storefront resolved after auth; cleared when tokens change. */
internal object AuthenticatedSessionCache {
  @Volatile
  var storefrontId: String? = null

  fun invalidate() {
    storefrontId = null
  }
}
