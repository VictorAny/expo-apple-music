// RecommendationsService.swift
// Personal recommendations and Replay via Apple Music REST.

import Foundation

@available(iOS 16.0, *)
final class RecommendationsService {

  func getRecommendations(musicUserToken: String, ids: [String]?) async throws -> [[String: Any]] {
    var query: [String: String] = [:]
    if let ids, !ids.isEmpty {
      query["ids"] = ids.joined(separator: ",")
    }
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/recommendations",
      musicUserToken: musicUserToken,
      query: query
    )
    return data.map(RestJsonMapper.mapRecommendation)
  }

  func getReplay(musicUserToken: String, year: Int?) async throws -> [[String: Any]] {
    var query: [String: String] = [:]
    if let year {
      query["filter[year]"] = "\(year)"
    }
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/music-summaries",
      musicUserToken: musicUserToken,
      query: query
    )
    return data.map(RestJsonMapper.mapReplaySummary)
  }
}
