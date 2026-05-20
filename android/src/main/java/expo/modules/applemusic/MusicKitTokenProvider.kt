package expo.modules.applemusic

import android.content.Context
import com.apple.android.sdk.authentication.TokenProvider

internal class MusicKitTokenProvider(
  private val context: Context,
) : TokenProvider {
  private val session: AuthenticatedSession
    get() = AuthenticatedSession.load(context)

  override fun getDeveloperToken(): String =
    session.requireRestCredentials().developerToken

  override fun getUserToken(): String =
    session.requireRestCredentials().musicUserToken
}
