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
    if let cached = AuthenticatedSessionCache.cachedStorefrontId() {
      return cached
    }

    let session = AuthenticatedSession.current
    if session.hasRestTokens {
      let data = try await AppleMusicRestClient.getDataArray(path: "/v1/me/storefront")
      if let id = data.first?["id"] as? String, !id.isEmpty {
        AuthenticatedSessionCache.setStorefrontId(id)
        return id
      }
    }
    return localeStorefrontId()
  }

  /// Fallback when MusicKit auto-token or `/v1/me/storefront` is unavailable (catalog REST only).
  static func localeStorefrontId() -> String {
    if let region = Locale.current.region?.identifier, !region.isEmpty {
      return region.lowercased()
    }
    return "us"
  }
}
