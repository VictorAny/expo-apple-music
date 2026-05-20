// AppleMusicRestClient.swift
// Authenticated requests to api.music.apple.com (URLSession + stored tokens, or MusicDataRequest).

import Foundation
import MusicKit

@available(iOS 16.0, *)
enum AppleMusicHttpMethod: String {
  case get = "GET"
  case post = "POST"
  case put = "PUT"
  case delete = "DELETE"
}

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

  static func request(
    method: AppleMusicHttpMethod,
    path: String,
    query: [String: String] = [:],
    body: [String: Any]? = nil
  ) async throws -> [String: Any] {
    let session = AuthenticatedSession.current
    if method == .get, session.prefersStoredDeveloperTokenForGet {
      return try await requestViaUrlSession(
        session: session, method: method, path: path, query: query, body: body)
    }
    if method == .get, session.canUseMusicKitAutoTokenForGet {
      return try await getViaMusicDataRequest(path: path, query: query)
    }
    return try await requestViaUrlSession(
      session: session, method: method, path: path, query: query, body: body)
  }

  static func get(path: String, query: [String: String] = [:]) async throws -> [String: Any] {
    try await request(method: .get, path: path, query: query)
  }

  static func getDataArray(path: String, query: [String: String] = [:]) async throws -> [[String: Any]] {
    let json = try await get(path: path, query: query)
    return try parseDataArray(from: json)
  }

  /// Top-level list responses must include a `data` array (may be empty).
  static func parseDataArray(from json: [String: Any], key: String = "data") throws -> [[String: Any]] {
    guard json.keys.contains(key) else {
      throw RestError.apiError("Apple Music API response missing \"\(key)\"")
    }
    if json[key] is NSNull {
      return []
    }
    guard let data = json[key] as? [[String: Any]] else {
      throw RestError.apiError("Apple Music API response \"\(key)\" is not an array")
    }
    return data
  }

  private static func getViaMusicDataRequest(
    path: String,
    query: [String: String]
  ) async throws -> [String: Any] {
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
    return try parseResponseData(response.data)
  }

  private static func requestViaUrlSession(
    session: AuthenticatedSession,
    method: AppleMusicHttpMethod,
    path: String,
    query: [String: String],
    body: [String: Any]?
  ) async throws -> [String: Any] {
    guard let developerToken = session.developerToken,
      !developerToken.isEmpty
    else {
      if method == .get {
        return try await getViaMusicDataRequest(path: path, query: query)
      }
      throw RestError.apiError("Apple Music REST requires a stored developer token")
    }

    let userToken = session.musicUserToken
    let requiresUserToken = session.pathRequiresMusicUserToken(path)

    if requiresUserToken, userToken == nil || userToken?.isEmpty == true {
      if method == .get {
        return try await getViaMusicDataRequest(path: path, query: query)
      }
      throw RestError.apiError("Apple Music REST requires stored developer and user tokens")
    }

    guard var components = URLComponents(string: "https://api.music.apple.com\(path)") else {
      throw RestError.invalidURL
    }
    if !query.isEmpty {
      components.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
    }
    guard let url = components.url else {
      throw RestError.invalidURL
    }

    var urlRequest = URLRequest(url: url)
    urlRequest.httpMethod = method.rawValue
    urlRequest.setValue("Bearer \(developerToken)", forHTTPHeaderField: "Authorization")
    if let userToken, !userToken.isEmpty {
      urlRequest.setValue(userToken, forHTTPHeaderField: "Music-User-Token")
    }
    if let body {
      urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
      urlRequest.httpBody = try JSONSerialization.data(withJSONObject: body)
    }

    let (data, response) = try await URLSession.shared.data(for: urlRequest)
    if let http = response as? HTTPURLResponse, !(200...299).contains(http.statusCode) {
      if http.statusCode == 403 {
        throw RestError.apiError(
          "Apple Music authorization required or subscription needed (403)"
        )
      }
      if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
        let errors = json["errors"] as? [[String: Any]],
        let detail = errors.first?["detail"] as? String
      {
        throw RestError.apiError(detail)
      }
      throw RestError.apiError("Apple Music API error (\(http.statusCode))")
    }
    return try parseResponseData(data)
  }

  private static func parseResponseData(_ data: Data) throws -> [String: Any] {
    if data.isEmpty {
      return [:]
    }
    guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
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
}
