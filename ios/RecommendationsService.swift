// RecommendationsService.swift
// Personal recommendations (native MusicKit) and Replay summaries (REST).

import Foundation
import MusicKit

@available(iOS 16.0, *)
final class RecommendationsService {

  func getRecommendations(ids: [String]?) async throws -> [[String: Any]] {
    if let ids, !ids.isEmpty {
      return try await getRecommendationsViaRest(ids: ids)
    }
    return try await getRecommendationsViaMusicKit()
  }

  func getReplay(year: Int?) async throws -> [[String: Any]] {
    var query: [String: String] = [:]
    if let year {
      query["filter[year]"] = "\(year)"
    }
    let data = try await AppleMusicRestClient.getDataArray(
      path: "/v1/me/music-summaries",
      query: query
    )
    return data.map(RestJsonMapper.mapReplaySummary)
  }

  private func getRecommendationsViaMusicKit() async throws -> [[String: Any]] {
    let request = MusicPersonalRecommendationsRequest()
    let response = try await request.response()
    return response.recommendations.map(mapPersonalRecommendation)
  }

  private func getRecommendationsViaRest(ids: [String]) async throws -> [[String: Any]] {
    let json = try await AppleMusicRestClient.get(
      path: "/v1/me/recommendations",
      query: ["ids": ids.joined(separator: ",")]
    )
    let data = try AppleMusicRestClient.parseDataArray(from: json)
    return data.map(RestJsonMapper.mapRecommendation)
  }

  private func mapPersonalRecommendation(_ recommendation: MusicPersonalRecommendation) -> [String: Any] {
    var playlists: [[String: Any]] = []
    var albums: [[String: Any]] = []
    var stations: [[String: Any]] = []

    for item in recommendation.items {
      switch item {
      case .album(let album):
        albums.append(MusicItemMapper.map(album))
      case .playlist(let playlist):
        playlists.append(MusicItemMapper.map(playlist))
      case .station(let station):
        stations.append(MusicItemMapper.map(station))
      @unknown default:
        break
      }
    }

    var resourceTypes: [String] = []
    if !playlists.isEmpty { resourceTypes.append("playlists") }
    if !albums.isEmpty { resourceTypes.append("albums") }
    if !stations.isEmpty { resourceTypes.append("stations") }

    return [
      "id": MusicItemMapper.musicItemId(recommendation.id),
      "title": recommendation.title ?? "",
      "resourceTypes": resourceTypes,
      "playlists": playlists,
      "albums": albums,
      "stations": stations,
    ]
  }
}
