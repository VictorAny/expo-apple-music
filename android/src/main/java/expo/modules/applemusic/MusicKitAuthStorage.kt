package expo.modules.applemusic

import android.content.Context

internal object MusicKitAuthStorage {
  private const val PREFS_NAME = "expo.modules.applemusic.auth"
  private const val KEY_MUSIC_USER_TOKEN = "musicUserToken"

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
}
