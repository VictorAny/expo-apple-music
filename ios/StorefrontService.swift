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
    let data = try await AppleMusicRestClient.getDataArray(path: "/v1/me/storefront")
    guard let id = data.first?["id"] as? String else {
      throw StorefrontError.invalidResponse
    }
    return id
  }
}
