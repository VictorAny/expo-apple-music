package expo.modules.applemusic

import android.os.Handler
import android.os.Looper
import com.apple.android.music.playback.controller.MediaPlayerController
import com.apple.android.music.playback.model.MediaPlayerException
import com.apple.android.music.playback.model.PlayerQueueItem
import com.apple.android.music.playback.model.PlaybackState

internal interface AndroidPlaybackObserverDelegate {
  fun onPlaybackStateChange(body: Map<String, Any?>)
  fun onCurrentSongChange(body: Map<String, Any?>)
  fun onPlaybackTimeUpdate(playbackTime: Double)
  fun onPlaybackError(body: Map<String, Any?>)
}

internal class AndroidPlaybackObserver(
  private val playback: AndroidPlaybackController,
) {
  private val mainHandler = Handler(Looper.getMainLooper())
  private var observing = false
  private var lastReportedStatus: String? = null
  private var timeRunnable: Runnable? = null

  var delegate: AndroidPlaybackObserverDelegate? = null

  private val listener =
    object : MediaPlayerController.Listener {
      override fun onPlaybackStateChanged(
        player: MediaPlayerController,
        previousState: Int,
        newState: Int,
      ) {
        emitStateIfChanged()
        manageTimeUpdates(newState == PlaybackState.PLAYING)
      }

      override fun onPlaybackStateUpdated(player: MediaPlayerController) {
        emitStateIfChanged()
      }

      override fun onCurrentItemChanged(
        player: MediaPlayerController,
        previous: PlayerQueueItem?,
        current: PlayerQueueItem?,
      ) {
        mainHandler.postDelayed({ emitCurrentSong() }, 100)
      }

      override fun onMetadataUpdated(player: MediaPlayerController, item: PlayerQueueItem) {
        emitCurrentSong()
      }

      override fun onPlaybackError(player: MediaPlayerController, error: MediaPlayerException) {
        delegate?.onPlaybackError(
          mapOf(
            "message" to (error.message ?: "Playback error"),
            "code" to error.errorCode,
            "domain" to "MediaPlayer",
            "operation" to "playback",
          ),
        )
      }

      override fun onPlayerStateRestored(player: MediaPlayerController) {}
      override fun onBufferingStateChanged(player: MediaPlayerController, buffering: Boolean) {}
      override fun onItemEnded(player: MediaPlayerController, item: PlayerQueueItem, endPosition: Long) {}
      override fun onPlaybackQueueChanged(
        player: MediaPlayerController,
        items: MutableList<PlayerQueueItem>,
      ) {
      }
      override fun onPlaybackQueueItemsAdded(
        player: MediaPlayerController,
        queueInsertionType: Int,
        containerIndex: Int,
        itemCount: Int,
      ) {
      }
      override fun onPlaybackRepeatModeChanged(player: MediaPlayerController, mode: Int) {}
      override fun onPlaybackShuffleModeChanged(player: MediaPlayerController, mode: Int) {}
    }

  fun startObserving() {
    if (observing) return
    observing = true
    playback.addListener(listener)
    emitStateIfChanged()
    emitCurrentSong()
  }

  fun stopObserving() {
    if (!observing) return
    observing = false
    playback.removeListener(listener)
    stopTimeUpdates()
    lastReportedStatus = null
  }

  private fun emitStateIfChanged() {
    val state = playback.currentState()
    val status = state["playbackStatus"] as? String ?: return
    if (status == lastReportedStatus) return
    lastReportedStatus = status
    delegate?.onPlaybackStateChange(state)
  }

  private fun emitCurrentSong() {
    val song = playback.fetchCurrentSongInfo() ?: return
    delegate?.onCurrentSongChange(mapOf("currentSong" to song))
  }

  private fun manageTimeUpdates(playing: Boolean) {
    if (playing) startTimeUpdates() else stopTimeUpdates()
  }

  private fun startTimeUpdates() {
    if (timeRunnable != null) return
    val runnable =
      object : Runnable {
        override fun run() {
          if (!observing) return
          val time = playback.currentState()["playbackTime"] as? Double ?: 0.0
          delegate?.onPlaybackTimeUpdate(time)
          mainHandler.postDelayed(this, 1000)
        }
      }
    timeRunnable = runnable
    mainHandler.post(runnable)
  }

  private fun stopTimeUpdates() {
    timeRunnable?.let { mainHandler.removeCallbacks(it) }
    timeRunnable = null
  }
}
