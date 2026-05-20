import Foundation

@available(iOS 16.0, *)
enum ExpoBridgeRecommendations {
  static func getRecommendations(service: RecommendationsService, ids: [String]?) async throws -> [String: Any] {
    let recommendations = try await service.getRecommendations(ids: ids)
    return BridgeResponses.recommendations(recommendations)
  }

  static func getReplay(service: RecommendationsService, year: Int?) async throws -> [String: Any] {
    let summaries = try await service.getReplay(year: year)
    return BridgeResponses.replaySummaries(summaries)
  }
}
