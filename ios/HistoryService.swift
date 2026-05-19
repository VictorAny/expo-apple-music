// HistoryService.swift
// History endpoints via Apple Music REST API (MusicDataRequest).

import Foundation

@available(iOS 16.0, *)
final class HistoryService {

  func getHeavyRotation(limit: Int) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/history/heavy-rotation",
      query: ["limit": "\(limit)"]
    )
    return data.map(RestJsonMapper.mapRecentResource)
  }

  func getRecentlyPlayedStations(limit: Int) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/recent/played/stations",
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
