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
  private lazy var ratingsService = RatingsService()
  private lazy var libraryMutationsService = LibraryMutationsService()
  private lazy var recommendationsService = RecommendationsService()

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

      // MARK: - Auth

      AsyncFunction("authorization") { (developerToken: String?, _ startScreenMessage: String?, _ hideStartScreen: Bool?) -> String in
        if let token = developerToken, !token.isEmpty {
          MusicKitAuthStorage.saveDeveloperToken(token)
        }
        let status = await self.subscriptionService.requestAuthorization()
        if status == .authorized, let token = developerToken, !token.isEmpty {
          await self.subscriptionService.refreshMusicUserToken(developerToken: token)
        }
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

      AsyncFunction("getStorefront") { () -> [String: Any] in
        let id = try await StorefrontService.getStorefrontId()
        return BridgeResponses.storefront(id: id)
      }

      // MARK: - Catalog

      AsyncFunction("catalogSearch") { (term: String, types: [String], options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeCatalog.catalogSearch(
          service: self.catalogService,
          term: term,
          types: types,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getCatalogSong") { (id: String) -> [String: Any] in
        try await self.catalogService.getSong(id: id)
      }

      AsyncFunction("getCatalogAlbum") { (id: String) -> [String: Any] in
        try await self.catalogService.getAlbum(id: id)
      }

      AsyncFunction("getCatalogArtist") { (id: String) -> [String: Any] in
        try await self.catalogService.getArtist(id: id)
      }

      AsyncFunction("getCatalogPlaylist") { (id: String) -> [String: Any] in
        try await self.catalogService.getPlaylist(id: id)
      }

      AsyncFunction("getCatalogStation") { (id: String) -> [String: Any] in
        try await self.catalogService.getStation(id: id)
      }

      AsyncFunction("getCatalogMusicVideo") { (id: String) -> [String: Any] in
        try await self.catalogService.getMusicVideo(id: id)
      }

      AsyncFunction("getCatalogAlbumTracks") { (albumId: String, options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeCatalog.getCatalogAlbumTracks(
          service: self.catalogService,
          albumId: albumId,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getCatalogArtistAlbums") { (artistId: String, options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeCatalog.getCatalogArtistAlbums(
          service: self.catalogService,
          artistId: artistId,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getCatalogPlaylistTracks") { (playlistId: String, options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeCatalog.getCatalogPlaylistTracks(
          service: self.catalogService,
          playlistId: playlistId,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getCatalogCharts") { (types: [String], options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeCatalog.getCatalogCharts(
          service: self.catalogService,
          types: types,
          options: options
        )
      }

      // MARK: - Library

      AsyncFunction("getUserPlaylists") { (options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeLibrary.getUserPlaylists(
          service: self.libraryService,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getLibrarySongs") { (options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeLibrary.getLibrarySongs(
          service: self.libraryService,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getPlaylistSongs") { (playlistId: String, options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeLibrary.getPlaylistSongs(
          service: self.libraryService,
          playlistId: playlistId
        )
      }

      AsyncFunction("getLibraryArtists") { (options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeLibrary.getLibraryArtists(
          service: self.libraryService,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getLibraryAlbums") { (options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeLibrary.getLibraryAlbums(
          service: self.libraryService,
          options: options as NSDictionary
        )
      }

      // MARK: - History

      AsyncFunction("getRecentlyPlayedResources") { () -> [String: Any] in
        try await ExpoBridgeHistory.getRecentlyPlayedResources(service: self.historyService)
      }

      AsyncFunction("getRecentlyPlayedTracks") { (options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeHistory.getRecentlyPlayedTracks(
          service: self.historyService,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getHeavyRotation") { (options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeHistory.getHeavyRotation(
          service: self.historyService,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getRecentlyPlayedStations") { (options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeHistory.getRecentlyPlayedStations(
          service: self.historyService,
          options: options as NSDictionary
        )
      }

      AsyncFunction("getRecentlyAdded") { (options: [String: Any]) -> [String: Any] in
        try await ExpoBridgeHistory.getRecentlyAdded(
          service: self.historyService,
          options: options as NSDictionary
        )
      }

      // MARK: - Player

      AsyncFunction("setPlaybackQueue") { (itemId: String, type: String) -> String in
        try await self.queueService.setQueue(itemId: itemId, type: type)
        return "Track(s) added to queue"
      }

      AsyncFunction("configurePlayer") { (mixWithOthers: Bool) -> [String: Any] in
        try self.playbackController.configureAudioSession(mixWithOthers: mixWithOthers)
        return BridgeResponses.configurePlayer(mixWithOthers: mixWithOthers)
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

      // MARK: - Ratings

      AsyncFunction("getRating") { (resourceType: String, id: String) -> [String: Any]? in
        try await self.ratingsService.getRating(resourceType: resourceType, id: id)
      }

      AsyncFunction("setRating") { (resourceType: String, id: String, value: Int) -> [String: Any] in
        try await self.ratingsService.setRating(resourceType: resourceType, id: id, value: value)
      }

      AsyncFunction("clearRating") { (resourceType: String, id: String) -> Void in
        try await self.ratingsService.clearRating(resourceType: resourceType, id: id)
      }

      AsyncFunction("addToFavorites") { (resourceIds: [String: [String]]) -> Void in
        try await self.ratingsService.addToFavorites(resourceIds: resourceIds)
      }

      AsyncFunction("removeFromFavorites") { (resourceIds: [String: [String]]) -> Void in
        try await self.ratingsService.removeFromFavorites(resourceIds: resourceIds)
      }

      // MARK: - Library mutations

      AsyncFunction("addToLibrary") { (resourceIds: [String: [String]]) -> Void in
        try await self.libraryMutationsService.addToLibrary(resourceIds: resourceIds)
      }

      AsyncFunction("createLibraryPlaylist") { (options: [String: Any]) -> [String: Any] in
        let name = options["name"] as? String ?? ""
        let description = options["description"] as? String
        let isPublic = options["isPublic"] as? Bool ?? false
        let tracks = options["tracks"] as? [[String: String]]
        return try await self.libraryMutationsService.createPlaylist(
          name: name,
          description: description,
          isPublic: isPublic,
          tracks: tracks
        )
      }

      AsyncFunction("addTracksToLibraryPlaylist") { (playlistId: String, tracks: [[String: String]]) -> Void in
        try await self.libraryMutationsService.addTracksToPlaylist(
          playlistId: playlistId,
          tracks: tracks
        )
      }

      // MARK: - Recommendations

      AsyncFunction("getRecommendations") { (ids: [String]?) -> [String: Any] in
        try await ExpoBridgeRecommendations.getRecommendations(
          service: self.recommendationsService,
          ids: ids
        )
      }

    AsyncFunction("getReplay") { (year: Int?) -> [String: Any] in
      try await ExpoBridgeRecommendations.getReplay(
        service: self.recommendationsService,
        year: year
      )
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
