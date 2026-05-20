package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidRatingsService
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinition

internal fun ModuleDefinition.registerRatingsBridge(
  ratingsService: () -> AndroidRatingsService,
) {
  AsyncFunction("getRating") Coroutine { resourceType: String, id: String ->
    ratingsService().getRating(resourceType, id)
  }

  AsyncFunction("setRating") Coroutine { resourceType: String, id: String, value: Int ->
    ratingsService().setRating(resourceType, id, value)
  }

  AsyncFunction("clearRating") Coroutine { resourceType: String, id: String ->
    ratingsService().clearRating(resourceType, id)
  }

  AsyncFunction("addToFavorites") Coroutine { resourceIds: Map<String, List<String>> ->
    ratingsService().addToFavorites(resourceIds)
  }

  AsyncFunction("removeFromFavorites") Coroutine { resourceIds: Map<String, List<String>> ->
    ratingsService().removeFromFavorites(resourceIds)
  }
}
