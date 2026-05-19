// CatalogService.swift
// Handles Apple Music catalog search and item fetching.

import Foundation
import MusicKit

@available(iOS 16.0, *)
final class CatalogService {

  enum CatalogServiceError: LocalizedError {
    case notFound(String)

    var errorDescription: String? {
      switch self {
      case .notFound(let item):
        return "\(item) not found"
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
    let storefront = try await StorefrontService.getStorefrontId()
    let path = "/v1/catalog/\(storefront)/albums/\(albumId)/tracks"
    let query = [
      "limit": "\(options.limit)",
      "offset": "\(options.offset)",
    ]
    let data = try await AppleMusicRestClient.getDataArray(path: path, query: query)
    return data.compactMap { resource in
      let type = resource["type"] as? String ?? ""
      guard type.contains("song") else { return nil }
      return RestJsonMapper.mapSong(resource)
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
