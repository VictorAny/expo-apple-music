package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidRatingsService
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

internal fun ModuleDefinitionBuilder.registerRatingsBridge(
  ratingsService: () -> AndroidRatingsService,
) {
  AsyncFunction("getRating") Coroutine { musicUserToken: String, resourceType: String, id: String ->
    ratingsService().getRating(musicUserToken, resourceType, id)
  }

  AsyncFunction("setRating") Coroutine { musicUserToken: String, resourceType: String, id: String, value: Int ->
    ratingsService().setRating(musicUserToken, resourceType, id, value)
  }

  AsyncFunction("clearRating") Coroutine { musicUserToken: String, resourceType: String, id: String ->
    ratingsService().clearRating(musicUserToken, resourceType, id)
  }

  AsyncFunction("addToFavorites") Coroutine { musicUserToken: String, resourceIds: Map<String, List<String>> ->
    ratingsService().addToFavorites(musicUserToken, resourceIds)
  }

  AsyncFunction("removeFromFavorites") Coroutine { musicUserToken: String, resourceIds: Map<String, List<String>> ->
    ratingsService().removeFromFavorites(musicUserToken, resourceIds)
  }
}
