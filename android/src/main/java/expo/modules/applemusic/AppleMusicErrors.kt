package expo.modules.applemusic

import expo.modules.kotlin.exception.CodedException

internal object AppleMusicErrors {
  fun missingTokens(): CodedException =
    CodedException(
      "permissionDenied",
      "Apple Music authorization required. Call Auth.authorize() first.",
      null,
    )

  fun apiError(message: String, code: String = "ERROR"): CodedException =
    CodedException(code, message, null)

  fun playlistNotFound(): CodedException =
    CodedException("ERROR", "Playlist not found in library", null)

  fun itemNotFound(item: String, inLibrary: Boolean): CodedException {
    val source = if (inLibrary) "library" else "catalog"
    return CodedException("ERROR", "$item not found in $source", null)
  }

  fun unknownMediaType(type: String): CodedException =
    CodedException("ERROR", "Unknown media type: $type", null)

  fun unsupportedLibraryType(type: String): CodedException =
    CodedException("ERROR", "Unsupported library media type: $type", null)

  fun noSongsInPlaylist(): CodedException =
    CodedException("ERROR", "No songs in playlist", null)
}
