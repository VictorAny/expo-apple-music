package expo.modules.applemusic

import android.content.Context
import com.apple.android.sdk.authentication.TokenProvider

internal class MusicKitTokenProvider(
  private val context: Context,
  private val musicUserTokenSupplier: () -> String,
) : TokenProvider {
  override fun getDeveloperToken(): String = AndroidDeveloperToken.requireStored(context)

  override fun getUserToken(): String = musicUserTokenSupplier()
}
