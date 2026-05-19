import ExpoModulesCore

@available(iOS 16.0, *)
public class ExpoAppleMusicModule: Module {
  private let playbackController = PlaybackController.shared
  private let subscriptionService = SubscriptionService()
  private let catalogService = CatalogService()
  private lazy var queueService = QueueService(
    playbackController: playbackController,
    catalogService: catalogService
  )
  private lazy var libraryService = LibraryService()
  private lazy var historyService = HistoryService()

  private var playbackObserver: PlaybackObserver?

  public func definition() -> ModuleDefinition {
    Name("ExpoAppleMusic")

    Events(
      "onPlaybackStateChange",
      "onCurrentSongChange",
      "onPlaybackTimeUpdate",
      "onPlaybackError"
    )

    OnStartObserving {
      let observer = PlaybackObserver(playbackController: self.playbackController)
      observer.delegate = self
      observer.startObserving()
      self.playbackObserver = observer
    }

    OnStopObserving {
      self.playbackObserver?.stopObserving()
      self.playbackObserver = nil
    }

    AsyncFunction("authorization") { (_ developerToken: String?, _ startScreenMessage: String?, _ hideStartScreen: Bool?) -> String in
      let status = await self.subscriptionService.requestAuthorization()
      return status.rawValue
    }

    AsyncFunction("checkSubscription") { () -> [String: Any] in
      do {
        let details = try await self.subscriptionService.checkSubscription()
        return details.toDictionary()
      } catch {
        if let subError = SubscriptionService.wrapSubscriptionError(error) {
          throw Exception(
            name: subError.code,
            description: subError.message,
            code: subError.code
          )
        }
        throw Exception(name: "ERROR", description: error.localizedDescription)
      }
    }

    AsyncFunction("catalogSearch") {
      (term: String, types: [String], options: [String: Any]) -> [String: Any] in
      let searchOptions = CatalogService.SearchOptions(from: options as NSDictionary)
      let result = try await self.catalogService.search(
        term: term,
        types: types,
        options: searchOptions
      )
      return ["songs": result.songs, "albums": result.albums]
    }

    AsyncFunction("setPlaybackQueue") { (itemId: String, type: String) -> String in
      try await self.queueService.setQueue(itemId: itemId, type: type)
      return "Track(s) added to queue"
    }

    AsyncFunction("getStorefront") { () -> [String: Any] in
      let id = try await StorefrontService.getStorefrontId()
      return ["id": id]
    }

    AsyncFunction("getTracksFromLibrary") { () -> [String: Any] in
      let tracks = try await self.libraryService.getRecentlyPlayed()
      return ["recentlyPlayedItems": tracks]
    }

    AsyncFunction("getRecentlyPlayedTracks") { (options: [String: Any]) -> [String: Any] in
      let paginationOptions = LibraryService.PaginationOptions(from: options as NSDictionary)
      let songs = try await self.libraryService.getRecentlyPlayedTracks(options: paginationOptions)
      return ["songs": songs]
    }

    AsyncFunction("getLibraryArtists") { (options: [String: Any]) -> [String: Any] in
      let paginationOptions = LibraryService.PaginationOptions(from: options as NSDictionary)
      let artists = try await self.libraryService.getArtists(options: paginationOptions)
      return ["artists": artists]
    }

    AsyncFunction("getLibraryAlbums") { (options: [String: Any]) -> [String: Any] in
      let paginationOptions = LibraryService.PaginationOptions(from: options as NSDictionary)
      let albums = try await self.libraryService.getAlbums(options: paginationOptions)
      return ["albums": albums]
    }

    AsyncFunction("getHeavyRotation") { (options: [String: Any]) -> [String: Any] in
      let paginationOptions = LibraryService.PaginationOptions(from: options as NSDictionary)
      let items = try await self.historyService.getHeavyRotation(limit: paginationOptions.limit)
      return ["items": items]
    }

    AsyncFunction("getRecentlyPlayedStations") { (options: [String: Any]) -> [String: Any] in
      let paginationOptions = LibraryService.PaginationOptions(from: options as NSDictionary)
      let stations = try await self.historyService.getRecentlyPlayedStations(
        limit: paginationOptions.limit
      )
      return ["stations": stations]
    }

    AsyncFunction("getRecentlyAdded") { (options: [String: Any]) -> [String: Any] in
      let paginationOptions = LibraryService.PaginationOptions(from: options as NSDictionary)
      let items = try await self.historyService.getRecentlyAdded(
        limit: paginationOptions.limit,
        offset: paginationOptions.offset
      )
      return ["items": items]
    }

    AsyncFunction("configurePlayer") { (mixWithOthers: Bool) -> [String: Any] in
      try self.playbackController.configureAudioSession(mixWithOthers: mixWithOthers)
      return ["mixWithOthers": mixWithOthers]
    }

    Function("play") {
      Task {
        do {
          try await self.playbackController.play()
        } catch {
          self.emitPlaybackError(error, operation: "play")
        }
      }
    }

    Function("pause") {
      self.playbackController.pause()
    }

    Function("skipToNextEntry") {
      Task {
        do {
          try await self.playbackController.skipToNext()
        } catch {
          self.emitPlaybackError(error, operation: "skipToNext")
        }
      }
    }

    Function("skipToPreviousEntry") {
      Task {
        do {
          try await self.playbackController.skipToPrevious()
        } catch {
          self.emitPlaybackError(error, operation: "skipToPrevious")
        }
      }
    }

    Function("restartCurrentEntry") {
      Task { @MainActor in
        self.playbackController.restartCurrentEntry()
        self.playbackTimeDidUpdate(0)
      }
    }

    Function("seekToTime") { (time: Double) in
      Task { @MainActor in
        self.playbackController.seek(to: time)
        self.playbackTimeDidUpdate(time)
      }
    }

    Function("togglePlayerState") {
      Task {
        do {
          try await self.playbackController.togglePlayback()
        } catch {
          self.emitPlaybackError(error, operation: "togglePlayback")
        }
      }
    }

    AsyncFunction("getCurrentState") { () -> [String: Any] in
      let state = self.playbackController.state
      let songInfo = await self.playbackController.fetchCurrentSongInfo()

      var result: [String: Any] = [
        "playbackRate": state.playbackRate,
        "playbackStatus": MusicItemMapper.describePlaybackStatus(state.playbackStatus),
        "playbackTime": self.playbackController.playbackTime,
      ]
      if let songInfo = songInfo {
        result["currentSong"] = songInfo
      }
      return result
    }

    AsyncFunction("getUserPlaylists") { (options: [String: Any]) -> [String: Any] in
      let paginationOptions = LibraryService.PaginationOptions(from: options as NSDictionary)
      let playlists = try await self.libraryService.getPlaylists(options: paginationOptions)
      return ["playlists": playlists]
    }

    AsyncFunction("getLibrarySongs") { (options: [String: Any]) -> [String: Any] in
      let paginationOptions = LibraryService.PaginationOptions(from: options as NSDictionary)
      let songs = try await self.libraryService.getSongs(options: paginationOptions)
      return ["songs": songs]
    }

    AsyncFunction("getPlaylistSongs") {
      (playlistId: String, options: [String: Any]) -> [String: Any] in
      let songs = try await self.libraryService.getPlaylistSongs(playlistId: playlistId)
      return ["songs": songs]
    }

    AsyncFunction("playLibrarySong") { (songId: String) -> String in
      try await self.queueService.playLibrarySong(songId: songId)
      return "Library song added to queue"
    }

    AsyncFunction("playLibraryPlaylist") { (playlistId: String, startingAt: Int) -> String in
      try await self.queueService.playLibraryPlaylist(
        playlistId: playlistId,
        startingAt: startingAt
      )
      return "Library playlist added to queue"
    }
  }

  private func emitPlaybackError(_ error: Error, operation: String) {
    let nsError = error as NSError
    sendEvent(
      "onPlaybackError",
      [
        "message": error.localizedDescription,
        "code": nsError.code,
        "domain": nsError.domain,
        "operation": operation,
      ]
    )
  }
}

@available(iOS 16.0, *)
extension ExpoAppleMusicModule: PlaybackObserverDelegate {
  @MainActor
  func playbackStateDidChange(_ state: PlaybackObserver.PlaybackInfo) {
    var body: [String: Any] = [
      "playbackRate": state.playbackRate,
      "playbackStatus": state.playbackStatus,
      "playbackTime": state.playbackTime,
    ]
    if let song = state.currentSong {
      body["currentSong"] = song
    }
    sendEvent("onPlaybackStateChange", body)
  }

  @MainActor
  func currentSongDidChange(_ songInfo: [String: Any]?) {
    guard let songInfo = songInfo else { return }
    sendEvent("onCurrentSongChange", ["currentSong": songInfo])
  }

  @MainActor
  func playbackTimeDidUpdate(_ time: TimeInterval) {
    sendEvent("onPlaybackTimeUpdate", ["playbackTime": time])
  }
}
