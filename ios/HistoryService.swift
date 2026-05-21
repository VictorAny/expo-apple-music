// HistoryService.swift
// Listening history via Apple Music REST (app-supplied music user token).

import Foundation

@available(iOS 16.0, *)
final class HistoryService {

  func getRecentlyPlayedResources(musicUserToken: String) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/recent/played",
      musicUserToken: musicUserToken,
      query: ["limit": "10"]
    )
    return data.map(RestJsonMapper.mapRecentlyPlayed)
  }

  func getRecentlyPlayedTracks(musicUserToken: String, options: BridgePagination) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/recent/played/tracks",
      musicUserToken: musicUserToken,
      query: ["limit": "\(options.limit)"]
    )
    return data.map(RestJsonMapper.mapSong)
  }

  func getHeavyRotation(musicUserToken: String, limit: Int) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/history/heavy-rotation",
      musicUserToken: musicUserToken,
      query: ["limit": "\(limit)"]
    )
    return data.map(RestJsonMapper.mapRecentResource)
  }

  func getRecentlyPlayedStations(musicUserToken: String, limit: Int) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/recent/radio-stations",
      musicUserToken: musicUserToken,
      query: ["limit": "\(limit)"]
    )
    return data.map(RestJsonMapper.mapStation)
  }

  func getRecentlyAdded(musicUserToken: String, limit: Int, offset: Int) async throws -> [[String: Any]] {
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/library/recently-added",
      musicUserToken: musicUserToken,
      query: ["limit": "\(limit)", "offset": "\(offset)"]
    )
    return data.map(RestJsonMapper.mapRecentResource)
  }
}
