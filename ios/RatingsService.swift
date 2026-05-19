// RatingsService.swift
// Personal ratings and favorites via Apple Music REST API.

import Foundation

@available(iOS 16.0, *)
final class RatingsService {

  func getRating(resourceType: String, id: String) async throws -> [String: Any]? {
    do {
      let json = try await AppleMusicRestClient.get(
        path: "/v1/me/ratings/\(resourceType)/\(id)"
      )
      return RestJsonMapper.mapRating(json)
    } catch let error as AppleMusicRestClient.RestError {
      if case .apiError(let message) = error, message.contains("(404)") {
        return nil
      }
      throw error
    }
  }

  func setRating(resourceType: String, id: String, value: Int) async throws -> [String: Any] {
    let body: [String: Any] = [
      "type": "rating",
      "attributes": ["value": value],
    ]
    let json = try await AppleMusicRestClient.request(
      method: .put,
      path: "/v1/me/ratings/\(resourceType)/\(id)",
      body: body
    )
    guard let rating = RestJsonMapper.mapRating(json) else {
      throw AppleMusicRestClient.RestError.invalidResponse
    }
    return rating
  }

  func clearRating(resourceType: String, id: String) async throws {
    _ = try await AppleMusicRestClient.request(
      method: .delete,
      path: "/v1/me/ratings/\(resourceType)/\(id)"
    )
  }

  func addToFavorites(resourceIds: [String: [String]]) async throws {
    _ = try await AppleMusicRestClient.request(
      method: .post,
      path: "/v1/me/favorites",
      query: RestJsonMapper.buildIdsQuery(resourceIds)
    )
  }

  func removeFromFavorites(resourceIds: [String: [String]]) async throws {
    _ = try await AppleMusicRestClient.request(
      method: .delete,
      path: "/v1/me/favorites",
      query: RestJsonMapper.buildIdsQuery(resourceIds)
    )
  }
}
