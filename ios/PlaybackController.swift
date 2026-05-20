// PlaybackController.swift
// Encapsulates ApplicationMusicPlayer operations with caching for song info.

import AVFoundation
import Foundation
import MusicKit

@available(iOS 16.0, *)
final class PlaybackController {

  // MARK: - Shared Instance

  static let shared = PlaybackController()

  // MARK: - Properties

  private var player: ApplicationMusicPlayer {
    ApplicationMusicPlayer.shared
  }

  var state: MusicKit.MusicPlayer.State {
    player.state
  }

  var playbackTime: TimeInterval {
    get { player.playbackTime }
    set { player.playbackTime = newValue }
  }

  var currentEntry: ApplicationMusicPlayer.Queue.Entry? {
    player.queue.currentEntry
  }

  // MARK: - Song Info Cache

  private var cachedSongId: String?
  private var cachedSongInfo: [String: Any]?

  private lazy var catalogService = CatalogService()

  // MARK: - Initialization

  private init() {}

  /// Clears the song info cache (call when queue changes significantly)
  func clearSongCache() {
    cachedSongId = nil
    cachedSongInfo = nil
  }

  // MARK: - Audio Session Configuration

  func configureAudioSession(mixWithOthers: Bool) throws {
    let session = AVAudioSession.sharedInstance()
    if mixWithOthers {
      try session.setCategory(.playback, mode: .default, options: [.mixWithOthers, .duckOthers])
    } else {
      try session.setCategory(.playback, mode: .default)
    }
    try session.setActive(true)
  }

  // MARK: - Playback Controls

  func play() async throws {
    try await player.play()
  }

  func pause() {
    player.pause()
  }

  func togglePlayback() async throws {
    switch state.playbackStatus {
    case .playing:
      pause()
    case .paused, .stopped, .interrupted:
      try await play()
    default:
      try await play()
    }
  }

  func skipToNext() async throws {
    try await player.skipToNextEntry()
  }

  func skipToPrevious() async throws {
    try await player.skipToPreviousEntry()
  }

  func restartCurrentEntry() {
    player.restartCurrentEntry()
  }

  func seek(to time: TimeInterval) {
    playbackTime = time
  }

  // MARK: - Queue Management

  func setQueue<T: PlayableMusicItem>(_ item: T) async throws {
    player.queue = [item]
    try await player.prepareToPlay()
  }

  func setQueue<T: PlayableMusicItem>(_ items: [T], startingAt item: T) async throws {
    player.queue = ApplicationMusicPlayer.Queue(for: items, startingAt: item)
    try await player.prepareToPlay()
  }

  // MARK: - Current Song Info

  /// Fetches detailed info for the current queue entry from the catalog.
  /// Uses caching to avoid redundant network calls when the song hasn't changed.
  func fetchCurrentSongInfo() async -> [String: Any]? {
    guard let entry = currentEntry else {
      // No current entry - clear cache and return nil
      clearSongCache()
      return nil
    }

    // Extract the current item's ID
    let currentId: String?
    switch entry.item {
    case .song(let song):
      let idString = String(describing: song.id)
      // Skip if ID is empty (identifiers not yet resolved)
      currentId = idString.isEmpty ? nil : idString

    case .musicVideo(let musicVideo):
      let idString = String(describing: musicVideo.id)
      currentId = idString.isEmpty ? nil : idString

    default:
      currentId = nil
    }

    // If no valid ID, return cached info (if any) or nil
    guard let currentId = currentId else {
      return cachedSongInfo
    }

    // Return cached info if same song
    if currentId == cachedSongId, let cached = cachedSongInfo {
      return cached
    }

    // Prefer metadata from the queue entry (avoids catalog re-fetch by cloud playback ids).
    let songInfo: [String: Any]?
    switch entry.item {
    case .song(let song):
      songInfo = await songInfoForQueueEntry(song)

    case .musicVideo(let musicVideo):
      songInfo = await musicVideoInfoForQueueEntry(musicVideo)

    default:
      songInfo = nil
    }

    // Update cache only if we got valid info
    if let songInfo = songInfo {
      cachedSongId = currentId
      cachedSongInfo = songInfo
    }

    return songInfo ?? cachedSongInfo
  }

  private func songInfoForQueueEntry(_ song: Song) async -> [String: Any] {
    let mapped = MusicItemMapper.map(song)
    if hasDisplayMetadata(mapped) {
      return mapped
    }
    return await fetchSongDetailsFallback(song.id) ?? mapped
  }

  private func musicVideoInfoForQueueEntry(_ musicVideo: MusicVideo) async -> [String: Any] {
    let mapped = MusicItemMapper.map(musicVideo)
    if hasDisplayMetadata(mapped) {
      return mapped
    }
    return await fetchMusicVideoDetailsFallback(musicVideo.id) ?? mapped
  }

  private func hasDisplayMetadata(_ mapped: [String: Any]) -> Bool {
    let title = mapped["title"] as? String ?? ""
    return !title.isEmpty
  }

  private func fetchSongDetailsFallback(_ id: MusicItemID) async -> [String: Any]? {
    guard let song = try? await catalogService.fetchSong(id: id) else { return nil }
    return MusicItemMapper.map(song)
  }

  private func fetchMusicVideoDetailsFallback(_ id: MusicItemID) async -> [String: Any]? {
    guard let video = try? await catalogService.fetchMusicVideo(id: id) else { return nil }
    return MusicItemMapper.map(video)
  }
}
