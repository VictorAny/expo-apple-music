package expo.modules.applemusic

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
/** Resolves and caches the user's Apple Music storefront id for catalog paths. */
internal class StorefrontRestClient(
  private val transport: AppleMusicRestTransport,
) {
  suspend fun getStorefront(): String =
    withContext(Dispatchers.IO) {
      AuthenticatedSessionCache.storefrontId?.let { return@withContext it }
      val json = transport.getJson("/v1/me/storefront")
      val id = json.getJSONArray("data").getJSONObject(0).getString("id")
      AuthenticatedSessionCache.storefrontId = id
      id
    }
}
