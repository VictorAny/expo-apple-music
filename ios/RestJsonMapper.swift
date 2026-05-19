// RestJsonMapper.swift
// Maps Apple Music API JSON objects to bridge dictionaries (matches Android mapper).

import Foundation

@available(iOS 16.0, *)
enum RestJsonMapper {

  static func mapAlbum(_ resource: [String: Any]) -> [String: Any] {
    let attributes = resource["attributes"] as? [String: Any] ?? [:]
    let trackCount: String
    if let count = attributes["trackCount"] as? Int {
      trackCount = String(count)
    } else if let count = attributes["trackCount"] as? Double {
      trackCount = String(Int(count))
    } else {
      trackCount = "0"
    }
    return [
      "id": resource["id"] as? String ?? "",
      "title": attributes["name"] as? String ?? "",
      "artistName": attributes["artistName"] as? String ?? "",
      "artworkUrl": artworkUrl(attributes["artwork"] as? [String: Any]),
      "trackCount": trackCount,
    ]
  }

  static func mapSong(_ resource: [String: Any]) -> [String: Any] {
    let attributes = resource["attributes"] as? [String: Any] ?? [:]
    let id = catalogPlaybackId(resource) ?? (resource["id"] as? String ?? "")
    return [
      "id": id,
      "title": attributes["name"] as? String ?? "",
      "artistName": attributes["artistName"] as? String ?? "",
      "artworkUrl": artworkUrl(attributes["artwork"] as? [String: Any]),
      "duration": durationString(attributes),
    ]
  }

  static func mapRecentResource(_ resource: [String: Any]) -> [String: Any] {
    let attributes = resource["attributes"] as? [String: Any] ?? [:]
    let apiType = resource["type"] as? String ?? ""
    let itemType: String
    if apiType.contains("album") {
      itemType = "album"
    } else if apiType.contains("playlist") {
      itemType = "playlist"
    } else if apiType.contains("station") {
      itemType = "station"
    } else {
      itemType = "unknown"
    }

    var subtitle = attributes["artistName"] as? String ?? ""
    if subtitle.isEmpty {
      subtitle = attributes["curatorName"] as? String ?? ""
    }
    if subtitle.isEmpty, let description = attributes["description"] as? [String: Any] {
      subtitle = description["standard"] as? String ?? ""
    }

    return [
      "id": resource["id"] as? String ?? "",
      "title": attributes["name"] as? String ?? "",
      "subtitle": subtitle,
      "type": itemType,
    ]
  }

  static func mapPlaylist(_ resource: [String: Any]) -> [String: Any] {
    let attributes = resource["attributes"] as? [String: Any] ?? [:]
    var trackCount = 0
    if let count = attributes["trackCount"] as? Int {
      trackCount = count
    } else if let count = attributes["trackCount"] as? Double {
      trackCount = Int(count)
    }
    var description = attributes["description"] as? String ?? ""
    if description.isEmpty, let desc = attributes["description"] as? [String: Any] {
      description = desc["standard"] as? String ?? ""
    }
    return [
      "id": resource["id"] as? String ?? "",
      "name": attributes["name"] as? String ?? "",
      "description": description,
      "artworkUrl": artworkUrl(attributes["artwork"] as? [String: Any]),
      "trackCount": trackCount,
    ]
  }

  static func mapMusicVideo(_ resource: [String: Any]) -> [String: Any] {
    let attributes = resource["attributes"] as? [String: Any] ?? [:]
    let id = catalogPlaybackId(resource) ?? (resource["id"] as? String ?? "")
    let durationMs = Int(durationString(attributes)) ?? 0
    return [
      "id": id,
      "title": attributes["name"] as? String ?? "",
      "artistName": attributes["artistName"] as? String ?? "",
      "artworkUrl": artworkUrl(attributes["artwork"] as? [String: Any]),
      "duration": durationMs,
    ]
  }

  static func mapStation(_ resource: [String: Any]) -> [String: Any] {
    let attributes = resource["attributes"] as? [String: Any] ?? [:]
    return [
      "id": resource["id"] as? String ?? "",
      "name": attributes["name"] as? String ?? "",
      "artworkUrl": artworkUrl(attributes["artwork"] as? [String: Any]),
    ]
  }

  private static func catalogPlaybackId(_ resource: [String: Any]) -> String? {
    let attributes = resource["attributes"] as? [String: Any] ?? [:]
    guard let playParams = attributes["playParams"] as? [String: Any] else { return nil }
    if let id = playParams["id"] as? String, !id.isEmpty { return id }
    if let catalogId = playParams["catalogId"] as? String, !catalogId.isEmpty { return catalogId }
    return nil
  }

  private static func durationString(_ attributes: [String: Any]) -> String {
    if let millis = attributes["durationInMillis"] as? Int {
      return String(millis)
    }
    if let millis = attributes["durationInMillis"] as? Double {
      return String(Int(millis))
    }
    if let duration = attributes["duration"] as? Double {
      return String(Int(duration * 1000))
    }
    return "0"
  }

  private static func artworkUrl(_ artwork: [String: Any]?, width: Int = 200, height: Int = 200) -> String {
    guard let artwork, let template = artwork["url"] as? String, !template.isEmpty else {
      return ""
    }
    return template
      .replacingOccurrences(of: "{w}", with: "\(width)")
      .replacingOccurrences(of: "{h}", with: "\(height)")
  }
}
