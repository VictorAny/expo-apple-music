package expo.modules.applemusic.bridge

import com.apple.android.music.playback.model.MediaPlayerException
import expo.modules.applemusic.AndroidPlaybackController
import expo.modules.applemusic.AndroidQueueService
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

internal fun ModuleDefinition.registerPlayerBridge(
  moduleScope: CoroutineScope,
  playbackController: () -> AndroidPlaybackController,
  queueService: () -> AndroidQueueService,
  emitPlaybackError: (Exception, String) -> Unit,
  emitPlaybackTimeUpdate: (Double) -> Unit,
) {
  AsyncFunction("setPlaybackQueue") Coroutine { itemId: String, type: String ->
    try {
      queueService().setQueue(itemId, type)
      "Track(s) added to queue"
    } catch (error: Exception) {
      throw AndroidPlaybackController.mapPlaybackException(error)
    }
  }

  AsyncFunction("playLibrarySong") Coroutine { songId: String ->
    queueService().playLibrarySong(songId)
    "Library song added to queue"
  }

  AsyncFunction("playLibraryPlaylist") Coroutine { playlistId: String, startingAt: Int ->
    queueService().playLibraryPlaylist(playlistId, startingAt)
    "Library playlist added to queue"
  }

  AsyncFunction("configurePlayer") { mixWithOthers: Boolean ->
    playbackController().configurePlayer(mixWithOthers)
  }

  AsyncFunction("getCurrentState") {
    playbackController().currentState()
  }

  Function("play") {
    runPlayback(moduleScope, emitPlaybackError, "play") { playbackController().play() }
  }

  Function("pause") {
    playbackController().pause()
  }

  Function("skipToNextEntry") {
    runPlayback(moduleScope, emitPlaybackError, "skipToNext") { playbackController().skipToNext() }
  }

  Function("skipToPreviousEntry") {
    runPlayback(moduleScope, emitPlaybackError, "skipToPrevious") { playbackController().skipToPrevious() }
  }

  Function("restartCurrentEntry") {
    playbackController().restartCurrentEntry { time -> emitPlaybackTimeUpdate(time) }
  }

  Function("seekToTime") { time: Double ->
    playbackController().seekToTime(time) { actual -> emitPlaybackTimeUpdate(actual) }
  }

  Function("togglePlayerState") {
    runPlayback(moduleScope, emitPlaybackError, "togglePlayback") { playbackController().togglePlayback() }
  }
}

private fun runPlayback(
  scope: CoroutineScope,
  emitPlaybackError: (Exception, String) -> Unit,
  operation: String,
  block: () -> Unit,
) {
  scope.launch {
    try {
      block()
    } catch (error: MediaPlayerException) {
      emitPlaybackError(error, operation)
    } catch (error: Exception) {
      emitPlaybackError(error, operation)
    }
  }
}
