package expo.modules.applemusic

internal data class PaginationOptions(
  val limit: Int,
  val offset: Int,
) {
  companion object {
    fun fromMap(options: Map<String, Any?>): PaginationOptions {
      val limit = (options["limit"] as? Number)?.toInt()?.coerceAtLeast(1) ?: 25
      val offset = (options["offset"] as? Number)?.toInt()?.coerceAtLeast(0) ?: 0
      return PaginationOptions(limit, offset)
    }
  }
}
