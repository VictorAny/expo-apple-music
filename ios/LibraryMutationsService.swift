// LibraryMutationsService.swift
// Library write operations via Apple Music REST API.

import Foundation

@available(iOS 16.0, *)
final class LibraryMutationsService {

  func addToLibrary(musicUserToken: String, resourceIds: [String: [String]]) async throws {
    _ = try await AppleMusicRestClient.request(
      method: .post,
      path: "/v1/me/library",
      musicUserToken: musicUserToken,
      query: RestJsonMapper.buildIdsQuery(resourceIds)
    )
  }

  func createPlaylist(
    musicUserToken: String,
    name: String,
    description: String?,
    isPublic: Bool,
    tracks: [[String: String]]?
  ) async throws -> [String: Any] {
    var attributes: [String: Any] = [
      "name": name,
      "isPublic": isPublic,
    ]
    if let description, !description.isEmpty {
      attributes["description"] = ["standard": description]
    }

    var payload: [String: Any] = ["attributes": attributes]
    if let tracks, !tracks.isEmpty {
      payload["relationships"] = [
        "tracks": [
          "data": tracks.map { ["id": $0["id"] ?? "", "type": $0["type"] ?? ""] }
        ]
      ]
    }

    let json = try await AppleMusicRestClient.request(
      method: .post,
      path: "/v1/me/library/playlists",
      musicUserToken: musicUserToken,
      body: payload
    )
    guard let data = json["data"] as? [[String: Any]], let first = data.first else {
      throw AppleMusicRestClient.RestError.invalidResponse
    }
    return RestJsonMapper.mapPlaylist(first)
  }

  func addTracksToPlaylist(musicUserToken: String, playlistId: String, tracks: [[String: String]]) async throws {
    let data = tracks.map { ["id": $0["id"] ?? "", "type": $0["type"] ?? ""] }
    _ = try await AppleMusicRestClient.request(
      method: .post,
      path: "/v1/me/library/playlists/\(playlistId)/tracks",
      musicUserToken: musicUserToken,
      body: ["data": data]
    )
  }
}
