package expo.modules.applemusic

import android.content.Context

internal class AndroidCatalogService(context: Context) {
  private val api = AppleMusicApiClient(context)

  data class SearchResult(
    val songs: List<Map<String, Any?>>,
    val albums: List<Map<String, Any?>>,
  )

  suspend fun search(
    term: String,
    types: List<String>,
    options: PaginationOptions,
  ): SearchResult {
    val (songs, albums) = api.catalogSearch(term, types, options.limit, options.offset)
    return SearchResult(songs, albums)
  }
}
