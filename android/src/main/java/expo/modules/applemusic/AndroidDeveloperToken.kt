package expo.modules.applemusic

import android.content.Context
import expo.modules.kotlin.exception.CodedException

internal object AndroidDeveloperToken {
  fun require(developerToken: String?): String {
    val trimmed = developerToken?.trim()
    if (!trimmed.isNullOrEmpty()) {
      return trimmed
    }

    throw CodedException(
      AppleMusicErrorCodes.MISSING_DEVELOPER_TOKEN,
      "Android MusicKit auth requires a developer JWT. Pass Auth.authorize(developerToken).",
      null,
    )
  }

  fun requireStored(context: Context): String {
    val trimmed = MusicKitAuthStorage.getDeveloperToken(context)?.trim()
    if (!trimmed.isNullOrEmpty()) {
      return trimmed
    }
    throw CodedException(
      AppleMusicErrorCodes.MISSING_DEVELOPER_TOKEN,
      "Android MusicKit requires a stored developer JWT. Call Auth.authorize(developerToken) first.",
      null,
    )
  }
}

internal fun requireMusicUserToken(musicUserToken: String?): String {
  val trimmed = musicUserToken?.trim()
  if (!trimmed.isNullOrEmpty()) {
    return trimmed
  }
  throw AppleMusicErrors.missingMusicUserToken()
}
