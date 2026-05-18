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
  }

  fun getDeveloperToken(context: Context): String? =
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_DEVELOPER_TOKEN, null)

  fun saveMusicUserToken(context: Context, token: String) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_MUSIC_USER_TOKEN, token)
      .apply()
  }

  fun getMusicUserToken(context: Context): String? =
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_MUSIC_USER_TOKEN, null)

  fun clearMusicUserToken(context: Context) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_MUSIC_USER_TOKEN)
      .apply()
  }

  fun clearDeveloperToken(context: Context) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_DEVELOPER_TOKEN)
      .apply()
  }

  fun clearAll(context: Context) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .clear()
      .apply()
  }
}
