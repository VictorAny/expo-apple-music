import Foundation

@available(iOS 16.0, *)
enum ExpoBridgeCatalog {
  static func catalogSearch(
    service: CatalogService,
    term: String,
    types: [String],
    options: NSDictionary
  ) async throws -> [String: Any] {
    let pagination = BridgePagination(from: options)
    let searchOptions = CatalogService.SearchOptions(limit: pagination.limit, offset: pagination.offset)
    let result = try await service.search(term: term, types: types, options: searchOptions)
    return BridgeResponses.catalogSearch(result)
  }

  static func getCatalogAlbumTracks(
    service: CatalogService,
    albumId: String,
    options: NSDictionary
  ) async throws -> [String: Any] {
    let pagination = BridgePagination(from: options)
    let searchOptions = CatalogService.SearchOptions(limit: pagination.limit, offset: pagination.offset)
    let songs = try await service.getAlbumTracks(albumId: albumId, options: searchOptions)
    return BridgeResponses.songs(songs)
  }

  static func getCatalogArtistAlbums(
    service: CatalogService,
    artistId: String,
    options: NSDictionary
  ) async throws -> [String: Any] {
    let pagination = BridgePagination(from: options)
    let searchOptions = CatalogService.SearchOptions(limit: pagination.limit, offset: pagination.offset)
    let albums = try await service.getArtistAlbums(artistId: artistId, options: searchOptions)
    return BridgeResponses.albums(albums)
  }

  static func getCatalogPlaylistTracks(
    service: CatalogService,
    playlistId: String,
    options: NSDictionary
  ) async throws -> [String: Any] {
    let pagination = BridgePagination(from: options)
    let searchOptions = CatalogService.SearchOptions(limit: pagination.limit, offset: pagination.offset)
    let songs = try await service.getPlaylistTracks(playlistId: playlistId, options: searchOptions)
    return BridgeResponses.songs(songs)
  }

  static func getCatalogCharts(
    service: CatalogService,
    types: [String],
    options: [String: Any]
  ) async throws -> [String: Any] {
    let pagination = BridgePagination(from: options as NSDictionary)
    let searchOptions = CatalogService.SearchOptions(limit: pagination.limit, offset: pagination.offset)
    let genre = options["genre"] as? String
    let chart = options["chart"] as? String
    let result = try await service.getCharts(types: types, options: searchOptions, genre: genre, chart: chart)
    return BridgeResponses.catalogCharts(result)
  }
}
