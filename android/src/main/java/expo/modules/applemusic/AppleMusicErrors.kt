package expo.modules.applemusic

import expo.modules.kotlin.exception.CodedException

internal object AppleMusicErrors {
  fun missingMusicUserToken(): CodedException =
    CodedException(
      AppleMusicErrorCodes.MISSING_MUSIC_USER_TOKEN,
      "Apple Music music user token is required. Call Auth.authorize(developerToken) first, then pass the token from AuthorizeResult on user-scoped APIs (or queue playback after authorize on Android).",
      null,
    )

  fun missingTokens(): CodedException =
    CodedException(
      AppleMusicErrorCodes.PERMISSION_DENIED,
      "Apple Music authorization required. Call Auth.authorize() first.",
      null,
    )

  fun permissionDenied(): CodedException =
    CodedException(
      AppleMusicErrorCodes.PERMISSION_DENIED,
      "Apple Music authorization required or subscription needed (403)",
      null,
    )

  fun apiError(message: String, code: String = AppleMusicErrorCodes.ERROR): CodedException =
    CodedException(code, message, null)

  fun playlistNotFound(): CodedException =
    CodedException(AppleMusicErrorCodes.ERROR, "Playlist not found in library", null)

  fun itemNotFound(item: String, inLibrary: Boolean): CodedException {
    val source = if (inLibrary) "library" else "catalog"
    return CodedException(AppleMusicErrorCodes.ERROR, "$item not found in $source", null)
  }

  fun unknownMediaType(type: String): CodedException =
    CodedException(AppleMusicErrorCodes.ERROR, "Unknown media type: $type", null)

  fun unsupportedLibraryType(type: String): CodedException =
    CodedException(AppleMusicErrorCodes.ERROR, "Unsupported library media type: $type", null)

  fun noSongsInPlaylist(): CodedException =
    CodedException(AppleMusicErrorCodes.ERROR, "No songs in playlist", null)
}
