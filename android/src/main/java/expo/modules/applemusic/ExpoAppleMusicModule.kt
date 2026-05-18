package expo.modules.applemusic

import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.activityresult.AppContextActivityResultLauncher
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoAppleMusicModule : Module() {
  private lateinit var authLauncher: AppContextActivityResultLauncher<MusicKitAuthInput, MusicKitAuthOutput>

  private fun <T> unsupported(): T {
    throw CodedException(
      "UNSUPPORTED_PLATFORM",
      "This API is not implemented on Android yet.",
      null,
    )
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoAppleMusic")

    Events(
      "onPlaybackStateChange",
      "onCurrentSongChange",
      "onPlaybackTimeUpdate",
      "onPlaybackError",
    )

    RegisterActivityContracts {
      authLauncher =
        registerForActivityResult(MusicKitAuthContract { requireNotNull(appContext.reactContext) })
    }

    AsyncFunction("authorization") Coroutine { developerToken: String? ->
      val context = requireNotNull(appContext.reactContext) { "React Application Context is null" }
      val token = AndroidDeveloperToken.resolve(context, developerToken)
      val result = authLauncher.launch(MusicKitAuthInput(token))

      result.musicUserToken?.let { MusicKitAuthStorage.saveMusicUserToken(context, it) }

      result.status
    }

    AsyncFunction("checkSubscription") { unsupported<Map<String, Any?>>() }
    AsyncFunction("catalogSearch") { _: String, _: List<String>, _: Map<String, Any?> ->
      unsupported<Map<String, Any?>>()
    }
    AsyncFunction("setPlaybackQueue") { _: String, _: String -> unsupported<String>() }
    AsyncFunction("getTracksFromLibrary") { unsupported<Map<String, Any?>>() }
    AsyncFunction("configurePlayer") { _: Boolean -> unsupported<Map<String, Any?>>() }
    AsyncFunction("getCurrentState") { unsupported<Map<String, Any?>>() }
    AsyncFunction("getUserPlaylists") { _: Map<String, Any?> -> unsupported<Map<String, Any?>>() }
    AsyncFunction("getLibrarySongs") { _: Map<String, Any?> -> unsupported<Map<String, Any?>>() }
    AsyncFunction("getPlaylistSongs") { _: String, _: Map<String, Any?> ->
      unsupported<Map<String, Any?>>()
    }
    AsyncFunction("playLibrarySong") { _: String -> unsupported<String>() }
    AsyncFunction("playLibraryPlaylist") { _: String, _: Int -> unsupported<String>() }

    Function("play") { unsupported<Unit>() }
    Function("pause") { unsupported<Unit>() }
    Function("skipToNextEntry") { unsupported<Unit>() }
    Function("skipToPreviousEntry") { unsupported<Unit>() }
    Function("restartCurrentEntry") { unsupported<Unit>() }
    Function("seekToTime") { _: Double -> unsupported<Unit>() }
    Function("togglePlayerState") { unsupported<Unit>() }
  }
}
