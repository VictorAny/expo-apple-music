package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidHistoryService
import expo.modules.applemusic.BridgeResponses
import expo.modules.applemusic.PaginationOptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

internal fun ModuleDefinitionBuilder.registerHistoryBridge(
  historyService: () -> AndroidHistoryService,
) {
  AsyncFunction("getRecentlyPlayedResources") Coroutine { musicUserToken: String ->
    BridgeResponses.recentlyPlayedResources(historyService().getRecentlyPlayedResources(musicUserToken))
  }

  AsyncFunction("getRecentlyPlayedTracks") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.songs(historyService().getRecentlyPlayedTracks(musicUserToken, pagination))
  }

  AsyncFunction("getHeavyRotation") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.recentItems(historyService().getHeavyRotation(musicUserToken, pagination))
  }

  AsyncFunction("getRecentlyPlayedStations") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.stations(historyService().getRecentlyPlayedStations(musicUserToken, pagination))
  }

  AsyncFunction("getRecentlyAdded") Coroutine { musicUserToken: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.recentItems(historyService().getRecentlyAdded(musicUserToken, pagination))
  }
}
