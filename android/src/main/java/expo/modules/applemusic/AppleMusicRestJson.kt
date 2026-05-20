package expo.modules.applemusic

import org.json.JSONArray
import org.json.JSONObject

internal fun mapResourceArray(
  array: JSONArray?,
  mapper: (JSONObject) -> Map<String, Any?>,
): List<Map<String, Any?>> {
  if (array == null) return emptyList()
  val result = ArrayList<Map<String, Any?>>(array.length())
  for (i in 0 until array.length()) {
    result.add(mapper(array.getJSONObject(i)))
  }
  return result
}
