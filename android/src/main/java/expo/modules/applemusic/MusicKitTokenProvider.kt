package expo.modules.applemusic

import android.content.Context
import com.apple.android.sdk.authentication.TokenProvider

internal class MusicKitTokenProvider(
  private val context: Context,
) : TokenProvider {
  private val session: AuthenticatedSession
    get() = AuthenticatedSession.load(context)

  override fun getDeveloperToken(): String = session.developerToken.orEmpty()

  override fun getUserToken(): String = session.musicUserToken.orEmpty()
}
