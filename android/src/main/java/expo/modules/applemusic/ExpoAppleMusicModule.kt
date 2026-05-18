package expo.modules.applemusic

import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoAppleMusicModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAppleMusic")

    Events(
      "onPlaybackStateChange",
      "onCurrentSongChange",
      "onPlaybackTimeUpdate",
      "onPlaybackError",
    )

    val unsupported: () -> Nothing = {
      throw CodedException("UNSUPPORTED_PLATFORM", "Apple MusicKit is only supported on iOS in 1.0.")
    }

    AsyncFunction("authorization") { unsupported() }
    AsyncFunction("checkSubscription") { unsupported() }
    AsyncFunction("catalogSearch") { _: String, _: List<String>, _: Map<String, Any?> -> unsupported() }
    AsyncFunction("setPlaybackQueue") { _: String, _: String -> unsupported() }
    AsyncFunction("getTracksFromLibrary") { unsupported() }
    AsyncFunction("configurePlayer") { _: Boolean -> unsupported() }
    AsyncFunction("getCurrentState") { unsupported() }
    AsyncFunction("getUserPlaylists") { _: Map<String, Any?> -> unsupported() }
    AsyncFunction("getLibrarySongs") { _: Map<String, Any?> -> unsupported() }
    AsyncFunction("getPlaylistSongs") { _: String, _: Map<String, Any?> -> unsupported() }
    AsyncFunction("playLibrarySong") { _: String -> unsupported() }
    AsyncFunction("playLibraryPlaylist") { _: String, _: Int -> unsupported() }

    Function("play") { unsupported() }
    Function("pause") { unsupported() }
    Function("skipToNextEntry") { unsupported() }
    Function("skipToPreviousEntry") { unsupported() }
    Function("restartCurrentEntry") { unsupported() }
    Function("seekToTime") { _: Double -> unsupported() }
    Function("togglePlayerState") { unsupported() }
  }
}
