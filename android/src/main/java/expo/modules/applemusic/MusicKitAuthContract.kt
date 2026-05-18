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
    return manager.createIntentBuilder(input.developerToken).build()
  }

  override fun parseResult(
    input: MusicKitAuthInput,
    resultCode: Int,
    intent: Intent?,
  ): MusicKitAuthOutput {
    if (resultCode != Activity.RESULT_OK || intent == null) {
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
          else -> "unknown"
        }
      return MusicKitAuthOutput(status = status)
    }

    val token = result.musicUserToken
    if (token.isNullOrBlank()) {
      return MusicKitAuthOutput(status = "unknown")
    }

    return MusicKitAuthOutput(status = "authorized", musicUserToken = token)
  }
}
