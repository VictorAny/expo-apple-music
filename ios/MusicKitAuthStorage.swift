// MusicKitAuthStorage.swift
// Persists developer and music user tokens for Apple Music REST (parity with Android).

import Foundation

@available(iOS 16.0, *)
enum MusicKitAuthStorage {
  private static let developerTokenKey = "expo.modules.applemusic.developerToken"
  private static let musicUserTokenKey = "expo.modules.applemusic.musicUserToken"

  static func saveDeveloperToken(_ token: String) {
    UserDefaults.standard.set(token, forKey: developerTokenKey)
  }

  static func getDeveloperToken() -> String? {
    UserDefaults.standard.string(forKey: developerTokenKey)
  }

  static func saveMusicUserToken(_ token: String) {
    UserDefaults.standard.set(token, forKey: musicUserTokenKey)
  }

  static func getMusicUserToken() -> String? {
    UserDefaults.standard.string(forKey: musicUserTokenKey)
  }

  static func clearMusicUserToken() {
    UserDefaults.standard.removeObject(forKey: musicUserTokenKey)
  }

  static func clearDeveloperToken() {
    UserDefaults.standard.removeObject(forKey: developerTokenKey)
  }

  static func hasDeveloperToken() -> Bool {
    guard let developer = getDeveloperToken(), !developer.isEmpty else { return false }
    return true
  }

  static func hasRestTokens() -> Bool {
    guard hasDeveloperToken() else { return false }
    guard let user = getMusicUserToken(), !user.isEmpty else { return false }
    return true
  }
}
