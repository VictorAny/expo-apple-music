package expo.modules.applemusic

import android.content.Context

/** Wires shared REST transport + domain clients for Android services. */
internal class AppleMusicRestStack(context: Context) {
  val transport: AppleMusicRestTransport = OkHttpAppleMusicRestTransport(context)
  val storefront: StorefrontRestClient = StorefrontRestClient(transport)
  val catalog: CatalogRestClient = CatalogRestClient(transport, storefront)
  val library: LibraryRestClient = LibraryRestClient(transport)
  val history: HistoryRestClient = HistoryRestClient(transport)
  val ratings: RatingsRestClient = RatingsRestClient(transport)
  val libraryMutations: LibraryMutationsRestClient = LibraryMutationsRestClient(transport)
  val recommendations: RecommendationsRestClient = RecommendationsRestClient(transport)

  companion object {
    fun create(context: Context): AppleMusicRestStack = AppleMusicRestStack(context)
  }
}
