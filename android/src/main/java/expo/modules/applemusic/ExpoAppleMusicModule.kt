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

  private val ratingsService: AndroidRatingsService
    get() = AndroidRatingsService(reactContext)

  private val libraryMutationsService: AndroidLibraryMutationsService
    get() = AndroidLibraryMutationsService(reactContext)

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
      mapOf(
        "songs" to result.songs,
        "albums" to result.albums,
        "artists" to result.artists,
        "playlists" to result.playlists,
        "stations" to result.stations,
        "musicVideos" to result.musicVideos,
      )
    }

    AsyncFunction("getCatalogSong") Coroutine { id: String ->
      catalogService.getSong(id)
    }

    AsyncFunction("getCatalogAlbum") Coroutine { id: String ->
      catalogService.getAlbum(id)
    }

    AsyncFunction("getCatalogArtist") Coroutine { id: String ->
      catalogService.getArtist(id)
    }

    AsyncFunction("getCatalogPlaylist") Coroutine { id: String ->
      catalogService.getPlaylist(id)
    }

    AsyncFunction("getCatalogStation") Coroutine { id: String ->
      catalogService.getStation(id)
    }

    AsyncFunction("getCatalogMusicVideo") Coroutine { id: String ->
      catalogService.getMusicVideo(id)
    }

    AsyncFunction("getCatalogAlbumTracks") Coroutine { albumId: String, options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val songs = catalogService.getAlbumTracks(albumId, pagination)
      mapOf("songs" to songs)
    }

    AsyncFunction("getCatalogArtistAlbums") Coroutine { artistId: String, options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val albums = catalogService.getArtistAlbums(artistId, pagination)
      mapOf("albums" to albums)
    }

    AsyncFunction("getCatalogPlaylistTracks") Coroutine { playlistId: String, options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val songs = catalogService.getPlaylistTracks(playlistId, pagination)
      mapOf("songs" to songs)
    }

    AsyncFunction("getCatalogCharts") Coroutine { types: List<String>, options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val genre = options["genre"] as? String
      val chart = options["chart"] as? String
      val result = catalogService.getCharts(types, pagination, genre, chart)
      mapOf(
        "songs" to result.songs,
        "albums" to result.albums,
        "playlists" to result.playlists,
        "musicVideos" to result.musicVideos,
      )
    }

    AsyncFunction("setPlaybackQueue") Coroutine { itemId: String, type: String ->
      try {
        queueService.setQueue(itemId, type)
        "Track(s) added to queue"
      } catch (error: Exception) {
        throw AndroidPlaybackController.mapPlaybackException(error)
      }
    }

    AsyncFunction("getStorefront") Coroutine { ->
      mapOf("id" to libraryService.getStorefrontId())
    }

    AsyncFunction("getTracksFromLibrary") Coroutine { ->
      val tracks = libraryService.getRecentlyPlayed()
      mapOf("recentlyPlayedItems" to tracks)
    }

    AsyncFunction("getRecentlyPlayedTracks") Coroutine { options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val songs = libraryService.getRecentlyPlayedTracks(pagination)
      mapOf("songs" to songs)
    }

    AsyncFunction("getLibraryArtists") Coroutine { options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val artists = libraryService.getArtists(pagination)
      mapOf("artists" to artists)
    }

    AsyncFunction("getLibraryAlbums") Coroutine { options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val albums = libraryService.getAlbums(pagination)
      mapOf("albums" to albums)
    }

    AsyncFunction("getHeavyRotation") Coroutine { options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val items = libraryService.getHeavyRotation(pagination)
      mapOf("items" to items)
    }

    AsyncFunction("getRecentlyPlayedStations") Coroutine { options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val stations = libraryService.getRecentlyPlayedStations(pagination)
      mapOf("stations" to stations)
    }

    AsyncFunction("getRecentlyAdded") Coroutine { options: Map<String, Any?> ->
      val pagination = PaginationOptions.fromMap(options)
      val items = libraryService.getRecentlyAdded(pagination)
      mapOf("items" to items)
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

    AsyncFunction("getRating") Coroutine { resourceType: String, id: String ->
      ratingsService.getRating(resourceType, id)
    }

    AsyncFunction("setRating") Coroutine { resourceType: String, id: String, value: Int ->
      ratingsService.setRating(resourceType, id, value)
    }

    AsyncFunction("clearRating") Coroutine { resourceType: String, id: String ->
      ratingsService.clearRating(resourceType, id)
    }

    AsyncFunction("addToFavorites") Coroutine { resourceIds: Map<String, List<String>> ->
      ratingsService.addToFavorites(resourceIds)
    }

    AsyncFunction("removeFromFavorites") Coroutine { resourceIds: Map<String, List<String>> ->
      ratingsService.removeFromFavorites(resourceIds)
    }

    AsyncFunction("addToLibrary") Coroutine { resourceIds: Map<String, List<String>> ->
      libraryMutationsService.addToLibrary(resourceIds)
    }

    AsyncFunction("createLibraryPlaylist") Coroutine { options: Map<String, Any?> ->
      val name = options["name"] as? String ?: ""
      val description = options["description"] as? String
      val isPublic = options["isPublic"] as? Boolean ?: false
      @Suppress("UNCHECKED_CAST")
      val tracks = options["tracks"] as? List<Map<String, String>>
      libraryMutationsService.createPlaylist(name, description, isPublic, tracks)
    }

    AsyncFunction("addTracksToLibraryPlaylist") Coroutine {
      playlistId: String,
      tracks: List<Map<String, String>>,
    ->
      libraryMutationsService.addTracksToPlaylist(playlistId, tracks)
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
      playbackController.restartCurrentEntry { time ->
        sendEvent("onPlaybackTimeUpdate", mapOf("playbackTime" to time))
      }
    }

    Function("seekToTime") { time: Double ->
      playbackController.seekToTime(time) { actual ->
        sendEvent("onPlaybackTimeUpdate", mapOf("playbackTime" to actual))
      }
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
