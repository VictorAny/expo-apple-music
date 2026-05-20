// CatalogService.swift
// Handles Apple Music catalog search and item fetching.

import Foundation
import MusicKit

@available(iOS 16.0, *)
final class CatalogService {

  enum CatalogServiceError: LocalizedError {
    case notFound(String)
    case configurationRequired(String)

    var errorDescription: String? {
      switch self {
      case .notFound(let item):
        return "\(item) not found"
      case .configurationRequired(let message):
        return message
      }
    }
  }

  // MARK: - Search

  struct SearchOptions {
    let limit: Int
    let offset: Int

    init(from dictionary: NSDictionary) {
      limit = dictionary["limit"] as? Int ?? 25
      offset = dictionary["offset"] as? Int ?? 0
    }
  }

  struct SearchResult {
    let songs: [[String: Any]]
    let albums: [[String: Any]]
    let artists: [[String: Any]]
    let playlists: [[String: Any]]
    let stations: [[String: Any]]
    let musicVideos: [[String: Any]]
  }

  func search(term: String, types: [String], options: SearchOptions) async throws -> SearchResult {
    if MusicKitAuthStorage.hasDeveloperToken() {
      return try await searchViaRest(term: term, types: types, options: options)
    }
    do {
      return try await searchViaMusicKit(term: term, types: types, options: options)
    } catch {
      if MusicKitAuthStorage.hasDeveloperToken() {
        return try await searchViaRest(term: term, types: types, options: options)
      }
      if isMusicKitClientNotRegistered(error) {
        throw CatalogServiceError.configurationRequired(Self.missingDeveloperTokenMessage)
      }
      throw error
    }
  }

  private static let missingDeveloperTokenMessage =
    "Apple Music catalog search needs a developer JWT on this device. "
    + "From the repo root: npm run dev-token -- --write-env example/.env.local "
    + "then restart Metro (npx expo start --clear), rebuild, and tap Authorize. "
    + "See docs/CLI.md. (Native MusicKit auto-token returned 404 for this bundle ID.)"

  private func isMusicKitClientNotRegistered(_ error: Error) -> Bool {
    let ns = error as NSError
    if ns.domain == "ICError", ns.code == -8200 { return true }
    if ns.localizedDescription.contains("Client not found") { return true }
    if ns.localizedDescription.contains("developerTokenRequestFailed") { return true }
    if let underlying = ns.userInfo[NSUnderlyingErrorKey] as? NSError,
      underlying.domain == "AMSErrorDomain",
      underlying.code == 301
    {
      return true
    }
    return false
  }

  private func searchViaMusicKit(
    term: String,
    types: [String],
    options: SearchOptions
  ) async throws -> SearchResult {
    let searchTypes = types.compactMap { typeString -> MusicCatalogSearchable.Type? in
      switch typeString {
      case "songs": return Song.self
      case "albums": return Album.self
      case "artists": return Artist.self
      case "playlists": return Playlist.self
      case "stations": return Station.self
      case "music-videos": return MusicVideo.self
      default: return nil
      }
    }

    var request = MusicCatalogSearchRequest(term: term, types: searchTypes)
    request.limit = options.limit
    request.offset = options.offset

    let response = try await request.response()

    return SearchResult(
      songs: response.songs.map(MusicItemMapper.map),
      albums: response.albums.map(MusicItemMapper.map),
      artists: response.artists.map(MusicItemMapper.map),
      playlists: response.playlists.map(MusicItemMapper.map),
      stations: response.stations.map(MusicItemMapper.map),
      musicVideos: response.musicVideos.map(MusicItemMapper.map)
    )
  }

  private func searchViaRest(
    term: String,
    types: [String],
    options: SearchOptions
  ) async throws -> SearchResult {
    let storefront = try await StorefrontService.getStorefrontId()
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

    return SearchResult(
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

  // MARK: - Fetch Single Items

  func getSong(id: String) async throws -> [String: Any] {
    guard let song = try await fetchSong(id: MusicItemID(id)) else {
      throw CatalogServiceError.notFound("Song")
    }
    return MusicItemMapper.map(song)
  }

  func getAlbum(id: String) async throws -> [String: Any] {
    guard let album = try await fetchAlbum(id: MusicItemID(id)) else {
      throw CatalogServiceError.notFound("Album")
    }
    return MusicItemMapper.map(album)
  }

  func getArtist(id: String) async throws -> [String: Any] {
    guard let artist = try await fetchArtist(id: MusicItemID(id)) else {
      throw CatalogServiceError.notFound("Artist")
    }
    return MusicItemMapper.map(artist)
  }

  func getPlaylist(id: String) async throws -> [String: Any] {
    guard let playlist = try await fetchPlaylist(id: MusicItemID(id)) else {
      throw CatalogServiceError.notFound("Playlist")
    }
    return MusicItemMapper.map(playlist)
  }

  func getStation(id: String) async throws -> [String: Any] {
    guard let station = try await fetchStation(id: MusicItemID(id)) else {
      throw CatalogServiceError.notFound("Station")
    }
    return MusicItemMapper.map(station)
  }

  func getMusicVideo(id: String) async throws -> [String: Any] {
    guard let musicVideo = try await fetchMusicVideo(id: MusicItemID(id)) else {
      throw CatalogServiceError.notFound("Music video")
    }
    return MusicItemMapper.map(musicVideo)
  }

  func getAlbumTracks(albumId: String, options: SearchOptions) async throws -> [[String: Any]] {
    try await getCatalogRelationship(
      path: "/albums/\(albumId)/tracks",
      options: options,
      typeContains: "song",
      mapper: RestJsonMapper.mapSong
    )
  }

  func getArtistAlbums(artistId: String, options: SearchOptions) async throws -> [[String: Any]] {
    try await getCatalogRelationship(
      path: "/artists/\(artistId)/albums",
      options: options,
      typeContains: "album",
      mapper: RestJsonMapper.mapAlbum
    )
  }

  func getPlaylistTracks(playlistId: String, options: SearchOptions) async throws -> [[String: Any]] {
    try await getCatalogRelationship(
      path: "/playlists/\(playlistId)/tracks",
      options: options,
      typeContains: "song",
      mapper: RestJsonMapper.mapSong
    )
  }

  struct ChartsResult {
    let songs: [[String: Any]]
    let albums: [[String: Any]]
    let playlists: [[String: Any]]
    let musicVideos: [[String: Any]]
  }

  func getCharts(
    types: [String],
    options: SearchOptions,
    genre: String?,
    chart: String?
  ) async throws -> ChartsResult {
    let storefront = try await StorefrontService.getStorefrontId()
    var query: [String: String] = [
      "types": types.isEmpty ? "songs,albums" : types.joined(separator: ","),
      "limit": "\(options.limit)",
      "offset": "\(options.offset)",
    ]
    if let genre, !genre.isEmpty { query["genre"] = genre }
    if let chart, !chart.isEmpty { query["chart"] = chart }

    let json = try await AppleMusicRestClient.get(
      path: "/v1/catalog/\(storefront)/charts",
      query: query
    )
    let results = json["results"] as? [String: Any] ?? [:]

    return ChartsResult(
      songs: parseChartsEntries(results: results, key: "songs", typeContains: "song", mapper: RestJsonMapper.mapSong),
      albums: parseChartsEntries(results: results, key: "albums", typeContains: "album", mapper: RestJsonMapper.mapAlbum),
      playlists: parseChartsEntries(
        results: results, key: "playlists", typeContains: "playlist", mapper: RestJsonMapper.mapPlaylist),
      musicVideos: parseChartsEntries(
        results: results, key: "music-videos", typeContains: "music-video", mapper: RestJsonMapper.mapMusicVideo)
    )
  }

  private func parseChartsEntries(
    results: [String: Any],
    key: String,
    typeContains: String,
    mapper: ([String: Any]) -> [String: Any]
  ) -> [[String: Any]] {
    guard let charts = results[key] as? [[String: Any]] else { return [] }
    var items: [[String: Any]] = []
    for chart in charts {
      guard let data = chart["data"] as? [[String: Any]] else { continue }
      for resource in data {
        let type = resource["type"] as? String ?? ""
        guard type.contains(typeContains) else { continue }
        items.append(mapper(resource))
      }
    }
    return items
  }

  private func getCatalogRelationship(
    path: String,
    options: SearchOptions,
    typeContains: String,
    mapper: ([String: Any]) -> [String: Any]
  ) async throws -> [[String: Any]] {
    let storefront = try await StorefrontService.getStorefrontId()
    let fullPath = "/v1/catalog/\(storefront)\(path)"
    let query = [
      "limit": "\(options.limit)",
      "offset": "\(options.offset)",
    ]
    let data = try await AppleMusicRestClient.getDataArray(path: fullPath, query: query)
    return data.compactMap { resource in
      let type = resource["type"] as? String ?? ""
      guard type.contains(typeContains) else { return nil }
      return mapper(resource)
    }
  }

  func fetchSong(id: MusicItemID) async throws -> Song? {
    let request = MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchAlbum(id: MusicItemID) async throws -> Album? {
    let request = MusicCatalogResourceRequest<Album>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchArtist(id: MusicItemID) async throws -> Artist? {
    let request = MusicCatalogResourceRequest<Artist>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchPlaylist(id: MusicItemID) async throws -> Playlist? {
    let request = MusicCatalogResourceRequest<Playlist>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchStation(id: MusicItemID) async throws -> Station? {
    let request = MusicCatalogResourceRequest<Station>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchMusicVideo(id: MusicItemID) async throws -> MusicVideo? {
    let request = MusicCatalogResourceRequest<MusicVideo>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }
}
