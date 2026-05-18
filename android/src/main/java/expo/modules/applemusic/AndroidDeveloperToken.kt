package expo.modules.applemusic

import android.content.Context
import android.content.pm.PackageManager
import expo.modules.kotlin.exception.CodedException

internal object AndroidDeveloperToken {
  private const val META_DATA_KEY = "expo.modules.applemusic.DEVELOPER_TOKEN"

  fun resolve(context: Context, explicitToken: String?): String {
    val trimmed = explicitToken?.trim()
    if (!trimmed.isNullOrEmpty()) {
      return trimmed
    }

    return readFromManifest(context)
      ?: throw CodedException(
        "MISSING_DEVELOPER_TOKEN",
        "Android MusicKit auth requires a developer JWT. Pass Auth.authorize(developerToken) or set the config plugin option androidDeveloperToken.",
        null,
      )
  }

  private fun readFromManifest(context: Context): String? {
    val appInfo =
      context.packageManager.getApplicationInfo(
        context.packageName,
        PackageManager.GET_META_DATA,
      )
    val value = appInfo.metaData?.getString(META_DATA_KEY)?.trim()
    return value?.takeIf { it.isNotEmpty() }
  }
}
