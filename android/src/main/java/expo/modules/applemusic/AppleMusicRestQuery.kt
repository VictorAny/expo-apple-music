package expo.modules.applemusic

internal fun buildIdsQuery(resourceIds: Map<String, List<String>>): Map<String, String> {
  val query = linkedMapOf<String, String>()
  resourceIds.forEach { (type, ids) ->
    val filtered = ids.filter { it.isNotBlank() }
    if (filtered.isNotEmpty()) {
      query["ids[$type]"] = filtered.joinToString(",")
    }
  }
  return query
}
