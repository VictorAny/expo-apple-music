import Foundation

@available(iOS 16.0, *)
enum ExpoBridgeHistory {
  static func getRecentlyPlayedResources(service: HistoryService) async throws -> [String: Any] {
    try await AppleMusicBridgeError.rethrow {
      let tracks = try await service.getRecentlyPlayedResources()
      return BridgeResponses.recentlyPlayedResources(tracks)
    }
  }

  static func getRecentlyPlayedTracks(service: HistoryService, options: NSDictionary) async throws -> [String: Any] {
    try await AppleMusicBridgeError.rethrow {
      let pagination = BridgePagination(from: options)
      let songs = try await service.getRecentlyPlayedTracks(options: pagination)
      return BridgeResponses.songs(songs)
    }
  }

  static func getHeavyRotation(service: HistoryService, options: NSDictionary) async throws -> [String: Any] {
    try await AppleMusicBridgeError.rethrow {
      let pagination = BridgePagination(from: options)
      let items = try await service.getHeavyRotation(limit: pagination.limit)
      return BridgeResponses.recentItems(items)
    }
  }

  static func getRecentlyPlayedStations(service: HistoryService, options: NSDictionary) async throws -> [String: Any] {
    try await AppleMusicBridgeError.rethrow {
      let pagination = BridgePagination(from: options)
      let stations = try await service.getRecentlyPlayedStations(limit: pagination.limit)
      return BridgeResponses.stations(stations)
    }
  }

  static func getRecentlyAdded(service: HistoryService, options: NSDictionary) async throws -> [String: Any] {
    try await AppleMusicBridgeError.rethrow {
      let pagination = BridgePagination(from: options)
      let items = try await service.getRecentlyAdded(limit: pagination.limit, offset: pagination.offset)
      return BridgeResponses.recentItems(items)
    }
  }
}
