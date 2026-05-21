// CatalogSearchStoreFactory.swift
// Native MusicKit search first; REST fallback only when auto-token fails and a developer JWT is stored.

import Foundation

@available(iOS 16.0, *)
enum CatalogSearchStoreFactory {

  static func search(
    term: String,
    types: [String],
    options: CatalogService.SearchOptions
  ) async throws -> CatalogService.SearchResult {
    do {
      return try await MusicKitCatalogSearchStore().search(
        term: term, types: types, options: options)
    } catch {
      if MusicKitCatalogSearchStore.isClientNotRegistered(error),
        AuthenticatedSession.current.hasDeveloperToken
      {
        return try await RestCatalogSearchStore().search(
          term: term, types: types, options: options)
      }
      if MusicKitCatalogSearchStore.isClientNotRegistered(error) {
        throw CatalogService.CatalogServiceError.configurationRequired(
          MusicKitCatalogSearchStore.missingDeveloperTokenMessage)
      }
      throw error
    }
  }
}
