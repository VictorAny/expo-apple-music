package expo.modules.applemusic

import android.app.Activity
import android.content.Context
import android.content.Intent
import com.apple.android.sdk.authentication.AuthenticationFactory
import com.apple.android.sdk.authentication.TokenError
import com.apple.android.sdk.authentication.TokenResult
import expo.modules.kotlin.activityresult.AppContextActivityResultContract
import java.io.Serializable

internal data class MusicKitAuthInput(
  val developerToken: String,
  val startScreenMessage: String? = null,
  val hideStartScreen: Boolean = false,
) : Serializable

internal data class MusicKitAuthOutput(
  val status: String,
  val musicUserToken: String? = null,
) : Serializable

internal class MusicKitAuthContract(
  private val contextProvider: () -> Context,
) : AppContextActivityResultContract<MusicKitAuthInput, MusicKitAuthOutput> {
  override fun createIntent(context: Context, input: MusicKitAuthInput): Intent {
    val manager = AuthenticationFactory.createAuthenticationManager(context)
    val builder =
      manager
        .createIntentBuilder(input.developerToken)
        .setHideStartScreen(input.hideStartScreen)

    if (!input.hideStartScreen) {
      val message = input.startScreenMessage?.trim()
      if (!message.isNullOrEmpty()) {
        builder.setStartScreenMessage(message)
      }
    }

    return builder.build()
  }

  override fun parseResult(
    input: MusicKitAuthInput,
    resultCode: Int,
    intent: Intent?,
  ): MusicKitAuthOutput {
    // SDK cancel paths: upsell X (USER_CANCELLED intent), Apple Music back (no intent / empty token).
    if (intent == null) {
      return MusicKitAuthOutput(status = "denied")
    }

    val manager = AuthenticationFactory.createAuthenticationManager(contextProvider())
    return mapTokenResult(manager.handleTokenResult(intent))
  }

  private fun mapTokenResult(result: TokenResult): MusicKitAuthOutput {
    if (result.isError) {
      val status =
        when (result.error) {
          TokenError.USER_CANCELLED -> "denied"
          TokenError.NO_SUBSCRIPTION, TokenError.SUBSCRIPTION_EXPIRED -> "restricted"
          TokenError.TOKEN_FETCH_ERROR -> "unknown"
          // handleTokenResult() uses UNKNOWN when the intent has no token or error extras.
          TokenError.UNKNOWN -> "denied"
        }
      return MusicKitAuthOutput(status = status)
    }

    val token = result.musicUserToken
    if (token.isNullOrBlank()) {
      // Apple Music cancel can return RESULT_OK with an empty music_user_token extra.
      return MusicKitAuthOutput(status = "denied")
    }

    return MusicKitAuthOutput(status = "authorized", musicUserToken = token)
  }
}
