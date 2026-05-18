package expo.modules.applemusic

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.apple.android.music.playback.controller.MediaPlayerController
import com.apple.android.music.playback.controller.MediaPlayerControllerFactory
import com.apple.android.music.playback.model.MediaContainerType
import com.apple.android.music.playback.model.MediaItemType
import com.apple.android.music.playback.model.MediaPlayerException
import com.apple.android.music.playback.model.PlayerMediaItem
import com.apple.android.music.playback.model.PlayerQueueItem
import com.apple.android.music.playback.queue.CatalogPlaybackQueueItemProvider
import com.apple.android.music.playback.queue.PlaybackQueueInsertionType
import com.apple.android.music.playback.queue.PlaybackQueueItemProvider
import expo.modules.kotlin.exception.CodedException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

internal class AndroidPlaybackController private constructor(
  context: Context,
) {
  private val appContext = context.applicationContext
  private val mainHandler = Handler(Looper.getMainLooper())

  private val controller: MediaPlayerController by lazy {
    AppleMusicNativeLoader.ensureLoaded()
    MediaPlayerControllerFactory.createLocalController(
      appContext,
      MusicKitTokenProvider(appContext),
    ).also { player ->
      player.addListener(globalErrorListener)
    }
  }

  private var cachedSongId: String? = null
  private var cachedSongInfo: Map<String, Any?>? = null

  var playbackErrorHandler: ((MediaPlayerException, String) -> Unit)? = null

  private val globalErrorListener =
    object : MediaPlayerController.Listener {
      override fun onPlaybackError(
        player: MediaPlayerController,
        error: MediaPlayerException,
      ) {
        Log.e(TAG, "playback error type=${error.type} code=${error.errorCode}", error)
        playbackErrorHandler?.invoke(error, "playback")
      }

      override fun onPlayerStateRestored(player: MediaPlayerController) {}
      override fun onPlaybackStateChanged(
        player: MediaPlayerController,
        previousState: Int,
        newState: Int,
      ) {
      }
      override fun onPlaybackStateUpdated(player: MediaPlayerController) {}
      override fun onBufferingStateChanged(player: MediaPlayerController, buffering: Boolean) {}
      override fun onCurrentItemChanged(
        player: MediaPlayerController,
        previous: PlayerQueueItem?,
        current: PlayerQueueItem?,
      ) {
      }
      override fun onItemEnded(
        player: MediaPlayerController,
        item: PlayerQueueItem,
        endPosition: Long,
      ) {
      }
      override fun onMetadataUpdated(player: MediaPlayerController, item: PlayerQueueItem) {}
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

  fun addListener(listener: MediaPlayerController.Listener) {
    controller.addListener(listener)
  }

  fun removeListener(listener: MediaPlayerController.Listener) {
    controller.removeListener(listener)
  }

  /** API parity with iOS `configureAudioSession`; playback focus is handled by [MediaPlayerController]. */
  fun configurePlayer(mixWithOthers: Boolean): Map<String, Any?> =
    mapOf("mixWithOthers" to mixWithOthers)

  /**
   * [MediaPlayerController.prepare] loads queue items asynchronously — wait for
   * [onPlaybackQueueItemsAdded] before returning to JS.
   */
  suspend fun prepareQueue(provider: PlaybackQueueItemProvider) {
    requirePlaybackTokens()
    val player = controller
    withContext(Dispatchers.Main) {
      suspendCancellableCoroutine { continuation ->
        lateinit var timeoutRunnable: Runnable

        val prepareListener =
          object : MediaPlayerController.Listener {
            private fun cleanup() {
              player.removeListener(this)
              mainHandler.removeCallbacks(timeoutRunnable)
            }

            private fun finishSuccess() {
              if (!continuation.isActive) return
              cleanup()
              continuation.resume(Unit)
            }

            private fun finishError(error: Exception) {
              if (!continuation.isActive) return
              cleanup()
              continuation.resumeWithException(mapPlaybackException(error))
            }

            override fun onPlaybackQueueItemsAdded(
              player: MediaPlayerController,
              queueInsertionType: Int,
              containerIndex: Int,
              itemCount: Int,
            ) {
              if (itemCount > 0) finishSuccess()
            }

            override fun onPlaybackError(
              player: MediaPlayerController,
              error: MediaPlayerException,
            ) {
              finishError(error)
            }

            override fun onPlayerStateRestored(player: MediaPlayerController) {}
            override fun onPlaybackStateChanged(
              player: MediaPlayerController,
              previousState: Int,
              newState: Int,
            ) {
            }
            override fun onPlaybackStateUpdated(player: MediaPlayerController) {}
            override fun onBufferingStateChanged(player: MediaPlayerController, buffering: Boolean) {}
            override fun onCurrentItemChanged(
              player: MediaPlayerController,
              previous: PlayerQueueItem?,
              current: PlayerQueueItem?,
            ) {
            }
            override fun onItemEnded(
              player: MediaPlayerController,
              item: PlayerQueueItem,
              endPosition: Long,
            ) {
            }
            override fun onMetadataUpdated(player: MediaPlayerController, item: PlayerQueueItem) {}
            override fun onPlaybackQueueChanged(
              player: MediaPlayerController,
              items: MutableList<PlayerQueueItem>,
            ) {
            }
            override fun onPlaybackRepeatModeChanged(player: MediaPlayerController, mode: Int) {}
            override fun onPlaybackShuffleModeChanged(player: MediaPlayerController, mode: Int) {}
          }

        timeoutRunnable =
          Runnable {
            if (!continuation.isActive) return@Runnable
            player.removeListener(prepareListener)
            if (player.playbackQueueItemCount > 0) {
              continuation.resume(Unit)
            } else {
              continuation.resumeWithException(
                CodedException(
                  "PLAYBACK_ERROR",
                  "Playback queue stayed empty after prepare",
                  null,
                ),
              )
            }
          }

        continuation.invokeOnCancellation {
          player.removeListener(prepareListener)
          mainHandler.removeCallbacks(timeoutRunnable)
        }

        player.addListener(prepareListener)
        mainHandler.postDelayed(timeoutRunnable, PREPARE_TIMEOUT_MS)

        try {
          player.prepare(
            provider,
            PlaybackQueueInsertionType.INSERTION_TYPE_CLEAR_AND_REPLACE,
            true,
          )
        } catch (error: Exception) {
          player.removeListener(prepareListener)
          mainHandler.removeCallbacks(timeoutRunnable)
          if (continuation.isActive) {
            continuation.resumeWithException(mapPlaybackException(error))
          }
        }
      }
    }
  }

  fun play() {
    mainHandler.post { controller.play() }
  }

  fun pause() {
    mainHandler.post { controller.pause() }
  }

  fun togglePlayback() {
    mainHandler.post {
      when (controller.playbackState) {
        com.apple.android.music.playback.model.PlaybackState.PLAYING -> controller.pause()
        else -> controller.play()
      }
    }
  }

  fun skipToNext() {
    mainHandler.post { controller.skipToNextItem() }
  }

  fun skipToPrevious() {
    mainHandler.post { controller.skipToPreviousItem() }
  }

  fun restartCurrentEntry() {
    mainHandler.post { controller.seekToPosition(0) }
  }

  fun seekToTime(seconds: Double) {
    mainHandler.post { controller.seekToPosition((seconds * 1000).toLong()) }
  }

  fun buildSongProvider(vararg catalogIds: String, startIndex: Int = 0): PlaybackQueueItemProvider {
    val ids = catalogIds.map { it.trim() }.filter { it.isNotEmpty() }.toTypedArray()
    if (ids.isEmpty()) {
      throw AppleMusicErrors.apiError("No catalog song ids for playback queue")
    }
    return CatalogPlaybackQueueItemProvider.Builder()
      .items(MediaItemType.SONG, *ids)
      .apply {
        if (startIndex > 0) startItemIndex(startIndex)
      }
      .build()
  }

  fun buildAlbumProvider(catalogId: String): PlaybackQueueItemProvider =
    CatalogPlaybackQueueItemProvider.Builder()
      .containers(MediaContainerType.ALBUM, catalogId.trim())
      .build()

  fun buildPlaylistProvider(catalogId: String): PlaybackQueueItemProvider =
    CatalogPlaybackQueueItemProvider.Builder()
      .containers(MediaContainerType.PLAYLIST, catalogId.trim())
      .build()

  fun warmUp() {
    AppleMusicNativeLoader.ensureLoaded()
    controller
  }

  fun clearSongCache() {
    cachedSongId = null
    cachedSongInfo = null
  }

  fun currentState(): Map<String, Any?> {
    val playbackStatus = AppleMusicJsonMapper.describePlaybackStatus(controller.playbackState)
    val playbackTime = controller.currentPosition.coerceAtLeast(0) / 1000.0
    val result =
      mutableMapOf<String, Any?>(
        "playbackRate" to controller.playbackRate,
        "playbackStatus" to playbackStatus,
        "playbackTime" to playbackTime,
      )
    fetchCurrentSongInfo()?.let { result["currentSong"] = it }
    return result
  }

  fun fetchCurrentSongInfo(): Map<String, Any?>? {
    val item: PlayerMediaItem = controller.currentItem?.item ?: return run {
      clearSongCache()
      null
    }

    val currentId =
      item.subscriptionStoreId?.takeIf { it.isNotEmpty() }
        ?: item.a()?.takeIf { !it.isNullOrEmpty() }

    if (currentId == null) return cachedSongInfo

    if (currentId == cachedSongId && cachedSongInfo != null) {
      return cachedSongInfo
    }

    val songInfo = AppleMusicJsonMapper.mapPlayerMediaItem(item)
    cachedSongId = currentId
    cachedSongInfo = songInfo
    return songInfo
  }

  private fun requirePlaybackTokens() {
    val developer = MusicKitAuthStorage.getDeveloperToken(appContext)
    val user = MusicKitAuthStorage.getMusicUserToken(appContext)
    if (developer.isNullOrBlank() || user.isNullOrBlank()) {
      throw AppleMusicErrors.missingTokens()
    }
  }

  companion object {
    private const val TAG = "ExpoAppleMusic"
    private const val PREPARE_TIMEOUT_MS = 20_000L

    @Volatile
    private var instance: AndroidPlaybackController? = null

    fun getInstance(context: Context): AndroidPlaybackController =
      instance
        ?: synchronized(this) {
          instance ?: AndroidPlaybackController(context.applicationContext).also { instance = it }
        }

    fun warmUp(context: Context) {
      try {
        getInstance(context).warmUp()
      } catch (error: Exception) {
        Log.w(TAG, "playback warmUp failed", error)
      }
    }

    fun mapPlaybackException(error: Exception): CodedException =
      when (error) {
        is CodedException -> error
        is MediaPlayerException ->
          CodedException(
            "PLAYBACK_ERROR",
            error.message ?: "Media playback failed (type=${error.type}, code=${error.errorCode})",
            null,
          )
        else -> CodedException("PLAYBACK_ERROR", error.message ?: "Playback failed", null)
      }
  }
}
