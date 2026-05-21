package expo.modules.applemusic

import android.content.Context
import com.apple.android.sdk.authentication.TokenProvider

internal class MusicKitTokenProvider(
  private val context: Context,
) : TokenProvider {
  override fun getDeveloperToken(): String = AndroidDeveloperToken.requireStored(context)

  override fun getUserToken(): String =
    MusicKitAuthStorage.getMusicUserToken(context).orEmpty()
}
