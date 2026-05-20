package expo.modules.applemusic.bridge

import android.content.Context
import expo.modules.applemusic.AndroidDeveloperToken
import expo.modules.applemusic.AndroidPlaybackController
import expo.modules.applemusic.AndroidSubscriptionService
import expo.modules.applemusic.BridgeResponses
import expo.modules.applemusic.MusicKitAuthInput
import expo.modules.applemusic.MusicKitAuthOutput
import expo.modules.applemusic.MusicKitAuthStorage
import expo.modules.kotlin.activityresult.AppContextActivityResultLauncher
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinition

internal fun ModuleDefinition.registerAuthBridge(
  reactContext: () -> Context,
  authLauncher: () -> AppContextActivityResultLauncher<MusicKitAuthInput, MusicKitAuthOutput>,
  subscriptionService: () -> AndroidSubscriptionService,
  libraryService: () -> expo.modules.applemusic.AndroidLibraryService,
) {
  AsyncFunction("authorization") Coroutine {
    developerToken: String?,
    startScreenMessage: String?,
    hideStartScreen: Boolean?,
  ->
    val context = reactContext()
    val token = AndroidDeveloperToken.require(developerToken)
    MusicKitAuthStorage.saveDeveloperToken(context, token)
    val message = startScreenMessage?.trim()?.takeIf { it.isNotEmpty() }
    val result =
      authLauncher().launch(
        MusicKitAuthInput(
          developerToken = token,
          startScreenMessage = message,
          hideStartScreen = hideStartScreen ?: false,
        ),
      )

    result.musicUserToken?.let { MusicKitAuthStorage.saveMusicUserToken(context, it) }
    if (result.status == "authorized") {
      AndroidPlaybackController.warmUp(context)
    }
    result.status
  }

  AsyncFunction("checkSubscription") Coroutine { ->
    subscriptionService().checkSubscription()
  }

  AsyncFunction("getStorefront") Coroutine { ->
    BridgeResponses.storefront(libraryService().getStorefrontId())
  }
}
