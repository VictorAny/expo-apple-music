// MusicKitCatalogSearchStore.swift
// Catalog search via native MusicCatalogSearchRequest.

import Foundation
import MusicKit

@available(iOS 16.0, *)
struct MusicKitCatalogSearchStore: CatalogSearchStore {

  static let missingDeveloperTokenMessage =
    "Apple Music catalog search needs a developer JWT on this device. "
    + "From the repo root: npm run dev-token -- --write-env example/.env.local "
    + "then restart Metro (npx expo start --clear), rebuild, and tap Authorize. "
    + "See docs/CLI.md. (Native MusicKit auto-token returned 404 for this bundle ID.)"

  func search(
    term: String,
    types: [String],
    options: CatalogService.SearchOptions
  ) async throws -> CatalogService.SearchResult {
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

    return CatalogService.SearchResult(
      songs: response.songs.map(MusicItemMapper.map),
      albums: response.albums.map(MusicItemMapper.map),
      artists: response.artists.map(MusicItemMapper.map),
      playlists: response.playlists.map(MusicItemMapper.map),
      stations: response.stations.map(MusicItemMapper.map),
      musicVideos: response.musicVideos.map(MusicItemMapper.map)
    )
  }

  static func isClientNotRegistered(_ error: Error) -> Bool {
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
}
