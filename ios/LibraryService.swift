// LibraryService.swift
// Handles user's Apple Music library operations.

import Foundation
import MusicKit

@available(iOS 16.0, *)
final class LibraryService {

  // MARK: - Options

  func getArtists(options: BridgePagination) async throws -> [[String: Any]] {
    var request = MusicLibraryRequest<Artist>()
    request.limit = options.limit
    request.offset = options.offset
    let response = try await request.response()
    return response.items.map(MusicItemMapper.map)
  }

  func getAlbums(options: BridgePagination) async throws -> [[String: Any]] {
    var request = MusicLibraryRequest<Album>()
    request.limit = options.limit
    request.offset = options.offset
    let response = try await request.response()
    return response.items.map(MusicItemMapper.map)
  }

  // MARK: - Playlists

  func getPlaylists(options: BridgePagination) async throws -> [[String: Any]] {
    var request = MusicLibraryRequest<Playlist>()
    request.limit = options.limit
    request.offset = options.offset

    let response = try await request.response()

    // Load tracks for accurate count
    var playlists: [[String: Any]] = []
    for playlist in response.items {
      let detailed = try await playlist.with([.tracks])
      playlists.append(MusicItemMapper.map(detailed))
    }
    return playlists
  }

  func getPlaylistSongs(playlistId: String) async throws -> [[String: Any]] {
    let musicItemId = MusicItemID(playlistId)

    var request = MusicLibraryRequest<Playlist>()
    request.filter(matching: \.id, equalTo: musicItemId)

    let response = try await request.response()
    guard let playlist = response.items.first else {
      throw LibraryServiceError.playlistNotFound
    }

    let detailed = try await playlist.with([.tracks])
    var songs: [[String: Any]] = []

    if let tracks = detailed.tracks {
      for track in tracks {
        if case .song(let song) = track {
          songs.append(MusicItemMapper.map(song))
        }
      }
    }
    return songs
  }

  // MARK: - Songs

  func getSongs(options: BridgePagination) async throws -> [[String: Any]] {
    var request = MusicLibraryRequest<Song>()
    request.limit = options.limit
    request.offset = options.offset

    let response = try await request.response()
    return response.items.map(MusicItemMapper.map)
  }

  func getMusicVideos(options: BridgePagination) async throws -> [[String: Any]] {
    var request = MusicLibraryRequest<MusicVideo>()
    request.limit = options.limit
    request.offset = options.offset
    let response = try await request.response()
    return response.items.map(MusicItemMapper.map)
  }

  struct LibrarySearchResult {
    let songs: [[String: Any]]
    let albums: [[String: Any]]
    let artists: [[String: Any]]
    let playlists: [[String: Any]]
    let musicVideos: [[String: Any]]
  }

  func search(term: String, types: [String], options: BridgePagination) async throws -> LibrarySearchResult {
    if options.offset > 0 {
      return try await searchViaRest(term: term, types: types, options: options)
    }

    let searchTypes = types.compactMap { Self.librarySearchableType($0) }
    let resolvedTypes: [any MusicLibrarySearchable.Type]
    if searchTypes.isEmpty {
      resolvedTypes = [Song.self, Album.self, Artist.self, Playlist.self, MusicVideo.self]
    } else {
      resolvedTypes = searchTypes
    }

    var request = MusicLibrarySearchRequest(term: term, types: resolvedTypes)
    request.limit = options.limit
    let response = try await request.response()

    return LibrarySearchResult(
      songs: response.songs.map(MusicItemMapper.map),
      albums: response.albums.map(MusicItemMapper.map),
      artists: response.artists.map(MusicItemMapper.map),
      playlists: response.playlists.map(MusicItemMapper.map),
      musicVideos: response.musicVideos.map(MusicItemMapper.map)
    )
  }

  /// MusicKit `MusicLibrarySearchRequest` has no `offset`; REST matches Android pagination.
  private func searchViaRest(
    term: String,
    types: [String],
    options: BridgePagination
  ) async throws -> LibrarySearchResult {
    let typeParam = Array(Set(types.compactMap { Self.librarySearchRestTypeParam($0) })).sorted().joined(
      separator: ",")
    let typesQuery = typeParam.isEmpty ? "library-songs,library-albums" : typeParam

    let json = try await AppleMusicRestClient.get(
      path: "/v1/me/library/search",
      query: [
        "term": term,
        "types": typesQuery,
        "limit": "\(options.limit)",
        "offset": "\(options.offset)",
      ]
    )

    let results = json["results"] as? [String: Any] ?? [:]
    return LibrarySearchResult(
      songs: parseLibrarySearchBucket(results: results, key: "library-songs", mapper: RestJsonMapper.mapSong),
      albums: parseLibrarySearchBucket(results: results, key: "library-albums", mapper: RestJsonMapper.mapAlbum),
      artists: parseLibrarySearchBucket(results: results, key: "library-artists", mapper: RestJsonMapper.mapArtist),
      playlists: parseLibrarySearchBucket(
        results: results, key: "library-playlists", mapper: RestJsonMapper.mapPlaylist),
      musicVideos: parseLibrarySearchBucket(
        results: results, key: "library-music-videos", mapper: RestJsonMapper.mapMusicVideo)
    )
  }

  private func parseLibrarySearchBucket(
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

  private static func librarySearchRestTypeParam(_ type: String) -> String? {
    switch type {
    case "library-songs", "songs": return "library-songs"
    case "library-albums", "albums": return "library-albums"
    case "library-artists", "artists": return "library-artists"
    case "library-playlists", "playlists": return "library-playlists"
    case "library-music-videos", "music-videos", "musicVideos": return "library-music-videos"
    default: return nil
    }
  }

  private static func librarySearchableType(_ type: String) -> (any MusicLibrarySearchable.Type)? {
    switch type {
    case "library-songs", "songs": return Song.self
    case "library-albums", "albums": return Album.self
    case "library-artists", "artists": return Artist.self
    case "library-playlists", "playlists": return Playlist.self
    case "library-music-videos", "music-videos", "musicVideos": return MusicVideo.self
    default: return nil
    }
  }

  // MARK: - Fetch Items by ID

  func fetchSong(id: MusicItemID) async throws -> Song? {
    var request = MusicLibraryRequest<Song>()
    request.filter(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchAlbum(id: MusicItemID) async throws -> Album? {
    var request = MusicLibraryRequest<Album>()
    request.filter(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchPlaylist(id: MusicItemID) async throws -> Playlist? {
    var request = MusicLibraryRequest<Playlist>()
    request.filter(matching: \.id, equalTo: id)
    let response = try await request.response()
    guard let playlist = response.items.first else { return nil }
    return try await playlist.with([.tracks])
  }

  // MARK: - Extract Songs from Playlist

  func extractSongs(from playlist: Playlist) async throws -> [Song] {
    let detailed = try await playlist.with([.tracks])
    guard let tracks = detailed.tracks else { return [] }

    var songs: [Song] = []
    for track in tracks {
      if case .song(let song) = track {
        songs.append(song)
      }
    }
    return songs
  }
}

// MARK: - Errors

enum LibraryServiceError: LocalizedError {
  case playlistNotFound
  case songNotFound
  case albumNotFound
  case noTracksInPlaylist
  case noSongsInPlaylist

  var errorDescription: String? {
    switch self {
    case .playlistNotFound: return "Playlist not found in library"
    case .songNotFound: return "Song not found in library"
    case .albumNotFound: return "Album not found in library"
    case .noTracksInPlaylist: return "No tracks in playlist"
    case .noSongsInPlaylist: return "No songs in playlist"
    }
  }
}
