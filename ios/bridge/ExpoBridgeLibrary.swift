import Foundation

@available(iOS 16.0, *)
enum ExpoBridgeLibrary {
  static func getUserPlaylists(service: LibraryService, options: NSDictionary) async throws -> [String: Any] {
    let pagination = BridgePagination(from: options)
    let playlists = try await service.getPlaylists(options: pagination)
    return BridgeResponses.playlists(playlists)
  }

  static func getLibrarySongs(service: LibraryService, options: NSDictionary) async throws -> [String: Any] {
    let pagination = BridgePagination(from: options)
    let songs = try await service.getSongs(options: pagination)
    return BridgeResponses.songs(songs)
  }

  static func getPlaylistSongs(service: LibraryService, playlistId: String) async throws -> [String: Any] {
    let songs = try await service.getPlaylistSongs(playlistId: playlistId)
    return BridgeResponses.songs(songs)
  }

  static func getLibraryArtists(service: LibraryService, options: NSDictionary) async throws -> [String: Any] {
    let pagination = BridgePagination(from: options)
    let artists = try await service.getArtists(options: pagination)
    return BridgeResponses.artists(artists)
  }

  static func getLibraryAlbums(service: LibraryService, options: NSDictionary) async throws -> [String: Any] {
    let pagination = BridgePagination(from: options)
    let albums = try await service.getAlbums(options: pagination)
    return BridgeResponses.albums(albums)
  }
}
