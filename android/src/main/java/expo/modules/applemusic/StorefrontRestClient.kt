package expo.modules.applemusic

import java.util.Locale
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Resolves and caches the user's Apple Music storefront id for catalog paths. */
internal class StorefrontRestClient(
  private val transport: AppleMusicRestTransport,
) {
  suspend fun getStorefront(): String = resolveStorefront(allowLocaleFallback = true)

  /** Resolves storefront from `/v1/me/storefront` only — required before playback. */
  suspend fun requireUserStorefront(): String = resolveStorefront(allowLocaleFallback = false)

  private suspend fun resolveStorefront(allowLocaleFallback: Boolean): String =
    withContext(Dispatchers.IO) {
      AuthenticatedSessionCache.storefrontId?.let { return@withContext it }
      try {
        val json = transport.getJson("/v1/me/storefront")
        val id = json.getJSONArray("data").getJSONObject(0).getString("id")
        AuthenticatedSessionCache.storefrontId = id
        id
      } catch (error: Exception) {
        if (allowLocaleFallback) {
          localeStorefrontId()
        } else {
          throw error
        }
      }
    }

  /** Fallback when `/v1/me/storefront` is unavailable (mirrors iOS [StorefrontService]). */
  private fun localeStorefrontId(): String {
    val region = Locale.getDefault().country
    return if (region.isNotEmpty()) region.lowercase(Locale.US) else "us"
  }
}
