// RestCatalogSearchStore.swift
// Catalog search via Apple Music REST API (aligned with Android catalog paths).

import Foundation

@available(iOS 16.0, *)
struct RestCatalogSearchStore: CatalogSearchStore {

  func search(
    term: String,
    types: [String],
    options: CatalogService.SearchOptions
  ) async throws -> CatalogService.SearchResult {
    let storefront = StorefrontService.getCatalogStorefront()
    let typeParam = Array(Set(types.compactMap { catalogSearchTypeParam($0) })).sorted().joined(
      separator: ",")
    let typesQuery = typeParam.isEmpty ? "songs,albums" : typeParam

    let json = try await AppleMusicRestClient.get(
      path: "/v1/catalog/\(storefront)/search",
      query: [
        "term": term,
        "types": typesQuery,
        "limit": "\(options.limit)",
        "offset": "\(options.offset)",
      ]
    )

    let results = json["results"] as? [String: Any] ?? [:]

    return CatalogService.SearchResult(
      songs: parseSearchBucket(results: results, key: "songs", mapper: RestJsonMapper.mapSong),
      albums: parseSearchBucket(results: results, key: "albums", mapper: RestJsonMapper.mapAlbum),
      artists: parseSearchBucket(results: results, key: "artists", mapper: RestJsonMapper.mapArtist),
      playlists: parseSearchBucket(
        results: results, key: "playlists", mapper: RestJsonMapper.mapPlaylist),
      stations: parseSearchBucket(results: results, key: "stations", mapper: RestJsonMapper.mapStation),
      musicVideos: parseSearchBucket(
        results: results, key: "music-videos", mapper: RestJsonMapper.mapMusicVideo)
    )
  }

  private func catalogSearchTypeParam(_ type: String) -> String? {
    switch type {
    case "songs", "albums", "artists", "playlists", "stations", "music-videos": return type
    default: return nil
    }
  }

  private func parseSearchBucket(
    results: [String: Any],
    key: String,
    mapper: ([String: Any]) -> [String: Any]
  ) -> [[String: Any]] {
    guard let bucket = results[key] as? [String: Any],
      let data = bucket["data"] as? [[String: Any]]
    else {
      return []
    }
    return data.map(mapper)
  }
}
