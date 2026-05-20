package expo.modules.applemusic

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/** Library write/mutation Apple Music REST. */
internal class LibraryMutationsRestClient(
  private val transport: AppleMusicRestTransport,
) {
  suspend fun addToLibrary(resourceIds: Map<String, List<String>>): Unit =
    withContext(Dispatchers.IO) {
      transport.request(
        AppleMusicHttpMethod.POST,
        "/v1/me/library",
        query = buildIdsQuery(resourceIds),
      )
    }

  suspend fun createLibraryPlaylist(
    name: String,
    description: String?,
    isPublic: Boolean,
    tracks: List<Map<String, String>>?,
  ): Map<String, Any?> =
    withContext(Dispatchers.IO) {
      val attributes =
        JSONObject()
          .put("name", name)
          .put("isPublic", isPublic)
      if (!description.isNullOrBlank()) {
        attributes.put(
          "description",
          JSONObject().put("standard", description),
        )
      }

      val payload = JSONObject().put("attributes", attributes)
      if (!tracks.isNullOrEmpty()) {
        val trackData = JSONArray()
        tracks.forEach { track ->
          trackData.put(
            JSONObject()
              .put("id", track["id"])
              .put("type", track["type"]),
          )
        }
        payload.put(
          "relationships",
          JSONObject().put(
            "tracks",
            JSONObject().put("data", trackData),
          ),
        )
      }

      val json =
        transport.request(
          AppleMusicHttpMethod.POST,
          "/v1/me/library/playlists",
          body = payload,
        )
      val data = json.optJSONArray("data") ?: JSONArray()
      if (data.length() == 0) {
        throw AppleMusicErrors.apiError("Create playlist returned no data")
      }
      AppleMusicJsonMapper.mapPlaylist(data.getJSONObject(0))
    }

  suspend fun addTracksToLibraryPlaylist(
    playlistId: String,
    tracks: List<Map<String, String>>,
  ): Unit =
    withContext(Dispatchers.IO) {
      val trackData = JSONArray()
      tracks.forEach { track ->
        trackData.put(
          JSONObject()
            .put("id", track["id"])
            .put("type", track["type"]),
        )
      }
      transport.request(
        AppleMusicHttpMethod.POST,
        "/v1/me/library/playlists/$playlistId/tracks",
        body = JSONObject().put("data", trackData),
      )
    }
}
