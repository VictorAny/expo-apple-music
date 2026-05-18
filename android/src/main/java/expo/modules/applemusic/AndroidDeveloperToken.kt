package expo.modules.applemusic

import expo.modules.kotlin.exception.CodedException

internal object AndroidDeveloperToken {
  fun require(developerToken: String?): String {
    val trimmed = developerToken?.trim()
    if (!trimmed.isNullOrEmpty()) {
      return trimmed
    }

    throw CodedException(
      "MISSING_DEVELOPER_TOKEN",
      "Android MusicKit auth requires a developer JWT. Pass Auth.authorize(developerToken).",
      null,
    )
  }
}
