// CatalogSearchStoreFactory.swift
// Picks catalog search transport from auth session state (developer JWT stored or not).

import Foundation

@available(iOS 16.0, *)
enum CatalogSearchStoreFactory {

  static func primaryStore() -> any CatalogSearchStore {
    if MusicKitAuthStorage.hasDeveloperToken() {
      return RestCatalogSearchStore()
    }
    return MusicKitCatalogSearchStore()
  }

  static func search(
    term: String,
    types: [String],
    options: CatalogService.SearchOptions
  ) async throws -> CatalogService.SearchResult {
    let store = primaryStore()
    do {
      return try await store.search(term: term, types: types, options: options)
    } catch {
      if store is MusicKitCatalogSearchStore, MusicKitAuthStorage.hasDeveloperToken() {
        return try await RestCatalogSearchStore().search(
          term: term, types: types, options: options)
      }
      if store is MusicKitCatalogSearchStore,
        MusicKitCatalogSearchStore.isClientNotRegistered(error)
      {
        throw CatalogService.CatalogServiceError.configurationRequired(
          MusicKitCatalogSearchStore.missingDeveloperTokenMessage)
      }
      throw error
    }
  }
}
