package expo.modules.applemusic

import android.content.Context

internal object MusicKitAuthStorage {
  private const val PREFS_NAME = "expo.modules.applemusic.auth"
  private const val KEY_DEVELOPER_TOKEN = "developerToken"
  private const val KEY_MUSIC_USER_TOKEN = "musicUserToken"

  fun saveDeveloperToken(context: Context, token: String) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_DEVELOPER_TOKEN, token)
      .apply()
    invalidateSession(context)
  }

  /** Persists for native playback SDK (iOS [MusicKitAuthStorage] parity); JS still owns long-term storage. */
  fun saveMusicUserToken(context: Context, token: String) {
    val trimmed = token.trim()
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_MUSIC_USER_TOKEN, trimmed)
      .apply()
    AuthenticatedSessionCache.rememberMusicUserToken(trimmed)
  }

  fun getMusicUserToken(context: Context): String? {
    AuthenticatedSessionCache.musicUserToken?.let { return it }
    val stored =
      context
        .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .getString(KEY_MUSIC_USER_TOKEN, null)
        ?.trim()
        ?.takeIf { it.isNotEmpty() }
    if (stored != null) {
      AuthenticatedSessionCache.rememberMusicUserToken(stored)
    }
    return stored
  }

  private fun invalidateSession(context: Context) {
    AuthenticatedSessionCache.invalidate()
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_MUSIC_USER_TOKEN)
      .apply()
    AndroidPlaybackController.resetInstance()
  }

  fun getDeveloperToken(context: Context): String? =
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_DEVELOPER_TOKEN, null)

  fun clearDeveloperToken(context: Context) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_DEVELOPER_TOKEN)
      .apply()
    invalidateSession(context)
  }

  fun clearAll(context: Context) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .clear()
      .apply()
    invalidateSession(context)
  }
}
