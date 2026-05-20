// AuthenticatedSession.swift
// Single view of stored credentials and REST/catalog transport preferences (see docs/AUTH.md).

import Foundation

@available(iOS 16.0, *)
struct AuthenticatedSession {
  let developerToken: String?
  let musicUserToken: String?

  static var current: AuthenticatedSession {
    AuthenticatedSession(
      developerToken: MusicKitAuthStorage.getDeveloperToken(),
      musicUserToken: MusicKitAuthStorage.getMusicUserToken()
    )
  }

  var hasDeveloperToken: Bool {
    guard let developerToken, !developerToken.isEmpty else { return false }
    return true
  }

  var hasMusicUserToken: Bool {
    guard let musicUserToken, !musicUserToken.isEmpty else { return false }
    return true
  }

  /// Developer JWT and music user token — required for `/v1/me/` REST and full URLSession auth.
  var hasRestTokens: Bool {
    hasDeveloperToken && hasMusicUserToken
  }

  /// Catalog search uses Apple Music API when a developer JWT is stored (optional on iOS).
  var prefersRestCatalogSearch: Bool {
    hasDeveloperToken
  }

  /// GET may use MusicKit `MusicDataRequest` when stored REST tokens are incomplete.
  var canUseMusicKitAutoTokenForGet: Bool {
    !hasRestTokens
  }

  /// GET with a stored developer JWT uses URLSession + Bearer (see `AppleMusicRestClient`).
  var prefersStoredDeveloperTokenForGet: Bool {
    hasDeveloperToken
  }

  func pathRequiresMusicUserToken(_ path: String) -> Bool {
    path.hasPrefix("/v1/me/")
  }
}

/// In-memory storefront resolved after auth; cleared when tokens change.
@available(iOS 16.0, *)
enum AuthenticatedSessionCache {
  private static var storefrontId: String?

  static func cachedStorefrontId() -> String? {
    storefrontId
  }

  static func setStorefrontId(_ id: String) {
    storefrontId = id
  }

  static func invalidate() {
    storefrontId = nil
  }
}
