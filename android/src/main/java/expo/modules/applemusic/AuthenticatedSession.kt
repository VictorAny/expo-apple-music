package expo.modules.applemusic

import android.content.Context

/**
 * Snapshot of stored developer JWT (see docs/AUTH.md).
 * Music user tokens are app-owned in JS; native may cache the last token for playback SDK (see [MusicKitAuthStorage]).
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

/**
 * In-memory session snapshot for native playback and REST storefront cache.
 * Music user tokens are app-owned in JS; native keeps the last token from authorize
 * or bridge calls for playback SDK + storefront (see [MusicKitAuthStorage]).
 */
internal object AuthenticatedSessionCache {
  @Volatile
  var storefrontId: String? = null

  @Volatile
  var musicUserToken: String? = null

  fun rememberMusicUserToken(token: String?) {
    val trimmed = token?.trim()?.takeIf { it.isNotEmpty() }
    if (trimmed != musicUserToken) {
      musicUserToken = trimmed
      storefrontId = null
    }
  }

  fun invalidate() {
    storefrontId = null
    musicUserToken = null
  }
}

/** Token for playback SDK + `/v1/me/storefront`; updates session cache when explicit. */
internal fun resolvePlaybackMusicUserToken(context: Context, explicit: String?): String {
  explicit?.trim()?.takeIf { it.isNotEmpty() }?.let {
    MusicKitAuthStorage.saveMusicUserToken(context, it)
    return it
  }
  MusicKitAuthStorage.getMusicUserToken(context)?.let { return it }
  throw AppleMusicErrors.missingMusicUserToken()
}
