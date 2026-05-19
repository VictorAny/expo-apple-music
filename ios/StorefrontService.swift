// StorefrontService.swift
// Resolves the user's Apple Music storefront via MusicKit-authenticated API requests.

import Foundation
import MusicKit

@available(iOS 16.0, *)
enum StorefrontService {

  enum StorefrontError: LocalizedError {
    case invalidResponse
    case unauthorized

    var errorDescription: String? {
      switch self {
      case .invalidResponse: return "Invalid storefront response from Apple Music"
      case .unauthorized: return "Not authorized for Apple Music"
      }
    }
  }

  static func getStorefrontId() async throws -> String {
    guard let url = URL(string: "https://api.music.apple.com/v1/me/storefront") else {
      throw StorefrontError.invalidResponse
    }

    let urlRequest = URLRequest(url: url)
    let dataRequest = MusicDataRequest(urlRequest: urlRequest)
    let response = try await dataRequest.response()

    guard
      let json = try JSONSerialization.jsonObject(with: response.data) as? [String: Any],
      let data = json["data"] as? [[String: Any]],
      let first = data.first,
      let id = first["id"] as? String
    else {
      throw StorefrontError.invalidResponse
    }

    return id
  }
}
