package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidRecommendationsService
import expo.modules.applemusic.BridgeResponses
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinition

internal fun ModuleDefinition.registerRecommendationsBridge(
  recommendationsService: () -> AndroidRecommendationsService,
) {
  AsyncFunction("getRecommendations") Coroutine { ids: List<String>? ->
    BridgeResponses.recommendations(recommendationsService().getRecommendations(ids))
  }

  AsyncFunction("getReplay") Coroutine { year: Int? ->
    BridgeResponses.replaySummaries(recommendationsService().getReplay(year))
  }
}
