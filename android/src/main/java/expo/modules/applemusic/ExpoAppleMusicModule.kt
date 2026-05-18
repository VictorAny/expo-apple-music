package expo.modules.applemusic

import com.apple.android.music.playback.model.MediaPlayerException
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.activityresult.AppContextActivityResultLauncher
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class ExpoAppleMusicModule : Module() {
  private lateinit var authLauncher: AppContextActivityResultLauncher<MusicKitAuthInput, MusicKitAuthOutput>
  private var playbackObserver: AndroidPlaybackObserver? = null

  private val moduleScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

  private val reactContext
    get() = requireNotNull(appContext.reactContext) { "React Application Context is null" }

  private val playbackController: AndroidPlaybackController
    get() =
      AndroidPlaybackController.getInstance(reactContext).also { controller ->
        if (controller.playbackErrorHandler == null) {
          controller.playbackErrorHandler = { error, operation ->
            emitPlaybackError(error, operation)
          }
        }
      }

  private val catalogService: AndroidCatalogService
    get() = AndroidCatalogService(reactContext)

  private val libraryService: AndroidLibraryService
    get() = AndroidLibraryService(reactContext)

  private val subscriptionService: AndroidSubscriptionService
    get() = AndroidSubscriptionService(reactContext)

  private val queueService: AndroidQueueService
    get() = AndroidQueueService(reactContext, playbackController)

  override fun definition() = ModuleDefinition {
    Name("ExpoAppleMusic")

    Events(
      "onPlaybackStateChange",
      "onCurrentSongChange",
      "onPlaybackTimeUpdate",
      "onPlaybackError",
    )

    OnStartObserving {
      val observer = AndroidPlaybackObserver(playbackController)
      observer.delegate =
        object : AndroidPlaybackObserverDelegate {
          override fun onPlaybackStateChange(body: Map<String, Any?>) {
            sendEvent("onPlaybackStateChange", body)
          }

          override fun onCurrentSongChange(body: Map<String, Any?>) {
            sendEvent("onCurrentSongChange", body)
          }

          override fun onPlaybackTimeUpdate(playbackTime: Double) {
            sendEvent("onPlaybackTimeUpdate", mapOf("playbackTime" to playbackTime))
          }

          override fun onPlaybackError(body: Map<String, Any?>) {
            sendEvent("onPlaybackError", body)
          }
        }
      observer.startObserving()
      playbackObserver = observer
    }

    OnStopObserving {
      playbackObserver?.stopObserving()
      playbackObserver = null
    }

    RegisterActivityContracts {
      authLauncher =
        registerForActivityResult(
          MusicKitAuthContract {
            appContext.throwingActivity
          },
        )
    }

    AsyncFunction("authorization") Coroutine {
      developerToken: String?,
      startScreenMessage: String?,
      hideStartScreen: Boolean?,
    ->
      val context = reactContext
      val token = AndroidDeveloperToken.require(developerToken)
      MusicKitAuthStorage.saveDeveloperToken(context, token)
      val message = startScreenMessage?.trim()?.takeIf { it.isNotEmpty() }
      val result =
        authLauncher.launch(
          MusicKitAuthInput(
            developerToken = token,
            startScreenMessage = message,
            hideStartScreen = hideStartScreen ?: false,
          ),
        )

      result.musicUserToken?.let { MusicKitAuthStorage.saveMusicUserToken(context, it) }
      if (result.status == "authorized") {
        AndroidPlaybackController.warmUp(context)
      }
      result.status
    }

    AsyncFunction("checkSubscription") Coroutine { ->
      subscriptionService.checkSubscription()
    }

    AsyncFunction("catalogSearch") Coroutine {
      term: String,
      types: List<String>,
      options: Map<String, Any?>,
    ->
      val pagination = PaginationOptions.fromMap(options)
      val result = catalogService.search(term, types, pagination)
      mapOf("songs" to result.songs, "albums" to result.albums)
    }

    AsyncFunction("setPlaybackQueue") Coroutine { itemId: String, type: String ->
      try {
        queueService.setQueue(itemId, type)
        "Track(s) added to queue"
      } catch (error: Exception) {
        throw AndroidPlaybackController.mapPlaybackException(error)
      }
    }

    AsyncFunction("getTracksFromLibrary") Coroutine { ->
      val tracks = libraryService.getRecentlyPlayed()
      mapOf("recentlyPlayedItems" to tracks)
    }

    AsyncFunction("configurePlayer") { mixWithOthers: Boolean ->
      playbackController.configurePlayer(mixWithOthers)
    }

    AsyncFunction("getCurrentState") {
      playbackController.currentState()
    }

    AsyncFunction("getUserPlaylists") Coroutine { options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val playlists = libraryService.getPlaylists(pagination)
      mapOf("playlists" to playlists)
    }

    AsyncFunction("getLibrarySongs") Coroutine { options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val songs = libraryService.getSongs(pagination)
      mapOf("songs" to songs)
    }

    AsyncFunction("getPlaylistSongs") Coroutine { playlistId: String, options: Map<String, Any?> ->
      val songs = libraryService.getPlaylistSongs(playlistId)
      mapOf("songs" to songs)
    }

    AsyncFunction("playLibrarySong") Coroutine { songId: String ->
      queueService.playLibrarySong(songId)
      "Library song added to queue"
    }

    AsyncFunction("playLibraryPlaylist") Coroutine { playlistId: String, startingAt: Int ->
      queueService.playLibraryPlaylist(playlistId, startingAt)
      "Library playlist added to queue"
    }

    Function("play") {
      runPlayback("play") { playbackController.play() }
    }

    Function("pause") {
      playbackController.pause()
    }

    Function("skipToNextEntry") {
      runPlayback("skipToNext") { playbackController.skipToNext() }
    }

    Function("skipToPreviousEntry") {
      runPlayback("skipToPrevious") { playbackController.skipToPrevious() }
    }

    Function("restartCurrentEntry") {
      playbackController.restartCurrentEntry()
    }

    Function("seekToTime") { time: Double ->
      playbackController.seekToTime(time)
    }

    Function("togglePlayerState") {
      runPlayback("togglePlayback") { playbackController.togglePlayback() }
    }
  }

  private fun runPlayback(operation: String, block: () -> Unit) {
    moduleScope.launch {
      try {
        block()
      } catch (error: MediaPlayerException) {
        emitPlaybackError(error, operation)
      } catch (error: Exception) {
        emitPlaybackError(error, operation)
      }
    }
  }

  private fun emitPlaybackError(error: Exception, operation: String) {
    val code =
      when (error) {
        is MediaPlayerException -> error.errorCode
        is CodedException -> error.code
        else -> 0
      }
    sendEvent(
      "onPlaybackError",
      mapOf(
        "message" to (error.message ?: "Playback error"),
        "code" to code,
        "domain" to error.javaClass.simpleName,
        "operation" to operation,
      ),
    )
  }
}
