// RestJsonMapper.swift
// Maps Apple Music API JSON objects to bridge dictionaries (matches Android mapper).

import Foundation

@available(iOS 16.0, *)
enum RestJsonMapper {

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

  static func mapStation(_ resource: [String: Any]) -> [String: Any] {
    let attributes = resource["attributes"] as? [String: Any] ?? [:]
    return [
      "id": resource["id"] as? String ?? "",
      "name": attributes["name"] as? String ?? "",
      "artworkUrl": artworkUrl(attributes["artwork"] as? [String: Any]),
    ]
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
