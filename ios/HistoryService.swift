// HistoryService.swift
// Listening history — native MusicKit where available, REST for gap-fill endpoints.

import Foundation
import MusicKit

@available(iOS 16.0, *)
final class HistoryService {

  struct PaginationOptions {
    let limit: Int
    let offset: Int

    init(from dictionary: NSDictionary) {
      limit = dictionary["limit"] as? Int ?? 25
      offset = dictionary["offset"] as? Int ?? 0
    }
  }

  func getRecentlyPlayedResources() async throws -> [[String: Any]] {
    let request = MusicRecentlyPlayedContainerRequest()
    let response = try await request.response()
    return response.items.map(MusicItemMapper.map)
  }

  func getRecentlyPlayedTracks(options: PaginationOptions) async throws -> [[String: Any]] {
    var request = MusicRecentlyPlayedRequest<Song>()
    request.limit = options.limit
    let response = try await request.response()
    return response.items.map(MusicItemMapper.map)
  }

  func getHeavyRotation(limit: Int) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/history/heavy-rotation",
      query: ["limit": "\(limit)"]
    )
    return data.map(RestJsonMapper.mapRecentResource)
  }

  func getRecentlyPlayedStations(limit: Int) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/recent/radio-stations",
      query: ["limit": "\(limit)"]
    )
    return data.map(RestJsonMapper.mapStation)
  }

  func getRecentlyAdded(limit: Int, offset: Int) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/library/recently-added",
      query: ["limit": "\(limit)", "offset": "\(offset)"]
    )
    return data.map(RestJsonMapper.mapRecentResource)
  }
}
