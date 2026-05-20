// CatalogSearchStore.swift
// Catalog search transport seam — native MusicKit vs REST (developer JWT).

import Foundation

@available(iOS 16.0, *)
protocol CatalogSearchStore {
  func search(
    term: String,
    types: [String],
    options: CatalogService.SearchOptions
  ) async throws -> CatalogService.SearchResult
}
