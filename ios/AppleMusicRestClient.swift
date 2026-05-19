// AppleMusicRestClient.swift
// Authenticated GET requests to api.music.apple.com via MusicKit.

import Foundation
import MusicKit

@available(iOS 16.0, *)
enum AppleMusicRestClient {

  enum RestError: LocalizedError {
    case invalidURL
    case invalidResponse
    case apiError(String)

    var errorDescription: String? {
      switch self {
      case .invalidURL: return "Invalid Apple Music API URL"
      case .invalidResponse: return "Invalid Apple Music API response"
      case .apiError(let message): return message
      }
    }
  }

  static func get(path: String, query: [String: String] = [:]) async throws -> [String: Any] {
    guard var components = URLComponents(string: "https://api.music.apple.com\(path)") else {
      throw RestError.invalidURL
    }
    if !query.isEmpty {
      components.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
    }
    guard let url = components.url else {
      throw RestError.invalidURL
    }

    let urlRequest = URLRequest(url: url)
    let dataRequest = MusicDataRequest(urlRequest: urlRequest)
    let response = try await dataRequest.response()

    guard let json = try JSONSerialization.jsonObject(with: response.data) as? [String: Any] else {
      throw RestError.invalidResponse
    }

    if let errors = json["errors"] as? [[String: Any]],
      let first = errors.first,
      let detail = first["detail"] as? String
    {
      throw RestError.apiError(detail)
    }

    return json
  }

  static func getDataArray(path: String, query: [String: String] = [:]) async throws -> [[String: Any]] {
    let json = try await get(path: path, query: query)
    guard let data = json["data"] as? [[String: Any]] else {
      return []
    }
    return data
  }
}
