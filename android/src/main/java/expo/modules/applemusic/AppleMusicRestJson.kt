package expo.modules.applemusic

import org.json.JSONArray
import org.json.JSONObject

/** Top-level list responses must include a `data` array (may be empty). */
internal fun requireDataArray(json: JSONObject, key: String = "data"): JSONArray {
  if (!json.has(key) || json.isNull(key)) {
    throw AppleMusicErrors.apiError("Apple Music API response missing \"$key\"")
  }
  when (val value = json.get(key)) {
    is JSONArray -> return value
    JSONObject.NULL -> return JSONArray()
    else ->
      throw AppleMusicErrors.apiError("Apple Music API response \"$key\" is not an array")
  }
}

/**
 * Map a `data` array (or optional nested search bucket).
 * `null` → empty (type omitted from search). Non-array → reject.
 */
internal fun mapResourceArray(
  array: JSONArray?,
  mapper: (JSONObject) -> Map<String, Any?>,
): List<Map<String, Any?>> {
  if (array == null) return emptyList()
  return buildList(array.length()) {
    for (i in 0 until array.length()) {
      add(mapper(array.getJSONObject(i)))
    }
  }
}

/** Parse required top-level `data`, then map resources. */
internal fun mapTopLevelResourceArray(
  json: JSONObject,
  key: String = "data",
  mapper: (JSONObject) -> Map<String, Any?>,
): List<Map<String, Any?>> = mapResourceArray(requireDataArray(json, key), mapper)
