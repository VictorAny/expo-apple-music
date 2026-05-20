package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidHistoryService
import expo.modules.applemusic.BridgeResponses
import expo.modules.applemusic.PaginationOptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

internal fun ModuleDefinitionBuilder.registerHistoryBridge(
  historyService: () -> AndroidHistoryService,
) {
  AsyncFunction("getRecentlyPlayedResources") Coroutine { ->
    BridgeResponses.recentlyPlayedResources(historyService().getRecentlyPlayedResources())
  }

  AsyncFunction("getRecentlyPlayedTracks") Coroutine { options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.songs(historyService().getRecentlyPlayedTracks(pagination))
  }

  AsyncFunction("getHeavyRotation") Coroutine { options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.recentItems(historyService().getHeavyRotation(pagination))
  }

  AsyncFunction("getRecentlyPlayedStations") Coroutine { options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.stations(historyService().getRecentlyPlayedStations(pagination))
  }

  AsyncFunction("getRecentlyAdded") Coroutine { options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.recentItems(historyService().getRecentlyAdded(pagination))
  }
}
