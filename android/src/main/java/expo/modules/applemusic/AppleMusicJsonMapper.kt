package expo.modules.applemusic

import org.json.JSONObject

/**
 * Maps Apple Music API JSON resources to bridge dictionaries matching [ios/MusicItemMapper.swift].
 */
internal object AppleMusicJsonMapper {
  fun mapSong(resource: JSONObject): Map<String, Any?> {
    val attributes = resource.optJSONObject("attributes") ?: JSONObject()
    val id = catalogPlaybackId(resource) ?: resource.optString("id", "")
    return mapOf(
      "id" to id,
      "title" to attributes.optString("name", ""),
      "artistName" to attributes.optString("artistName", ""),
      "artworkUrl" to artworkUrl(attributes.optJSONObject("artwork")),
      "duration" to durationString(attributes),
    )
  }

  fun mapAlbum(resource: JSONObject): Map<String, Any?> {
    val attributes = resource.optJSONObject("attributes") ?: JSONObject()
    return mapOf(
      "id" to resource.optString("id", ""),
      "title" to attributes.optString("name", ""),
      "artistName" to attributes.optString("artistName", ""),
      "artworkUrl" to artworkUrl(attributes.optJSONObject("artwork")),
      "trackCount" to (attributes.optInt("trackCount", 0)).toString(),
    )
  }

  fun mapArtist(resource: JSONObject): Map<String, Any?> {
    val attributes = resource.optJSONObject("attributes") ?: JSONObject()
    return mapOf(
      "id" to resource.optString("id", ""),
      "name" to attributes.optString("name", ""),
      "artworkUrl" to artworkUrl(attributes.optJSONObject("artwork")),
    )
  }

  fun mapPlaylist(resource: JSONObject): Map<String, Any?> {
    val attributes = resource.optJSONObject("attributes") ?: JSONObject()
    val trackCount =
      when {
        attributes.has("trackCount") -> attributes.optInt("trackCount", 0)
        else -> 0
      }
    return mapOf(
      "id" to resource.optString("id", ""),
      "name" to attributes.optString("name", ""),
      "description" to (attributes.optString("description", "").ifEmpty {
        attributes.optJSONObject("description")?.optString("standard", "") ?: ""
      }),
      "artworkUrl" to artworkUrl(attributes.optJSONObject("artwork")),
      "trackCount" to trackCount,
    )
  }

  fun mapRecentResource(resource: JSONObject): Map<String, Any?> {
    val attributes = resource.optJSONObject("attributes") ?: JSONObject()
    val apiType = resource.optString("type", "")
    val itemType =
      when {
        apiType.contains("album") -> "album"
        apiType.contains("playlist") -> "playlist"
        apiType.contains("station") -> "station"
        else -> "unknown"
      }
    val subtitle =
      attributes.optString("artistName", "").ifEmpty {
        attributes.optString("curatorName", "").ifEmpty {
          attributes.optJSONObject("description")?.optString("standard", "") ?: ""
        }
      }
    return mapOf(
      "id" to resource.optString("id", ""),
      "title" to attributes.optString("name", ""),
      "subtitle" to subtitle,
      "type" to itemType,
    )
  }

  fun mapRecentlyPlayed(resource: JSONObject): Map<String, Any?> = mapRecentResource(resource)

  fun mapStation(resource: JSONObject): Map<String, Any?> {
    val attributes = resource.optJSONObject("attributes") ?: JSONObject()
    return mapOf(
      "id" to resource.optString("id", ""),
      "name" to attributes.optString("name", ""),
      "artworkUrl" to artworkUrl(attributes.optJSONObject("artwork")),
    )
  }

  fun mapMusicVideo(resource: JSONObject): Map<String, Any?> {
    val attributes = resource.optJSONObject("attributes") ?: JSONObject()
    val id = catalogPlaybackId(resource) ?: resource.optString("id", "")
    return mapOf(
      "id" to id,
      "title" to attributes.optString("name", ""),
      "artistName" to attributes.optString("artistName", ""),
      "artworkUrl" to artworkUrl(attributes.optJSONObject("artwork")),
      "duration" to durationString(attributes).toLongOrNull() ?: 0L,
    )
  }

  fun mapPlayerMediaItem(item: com.apple.android.music.playback.model.PlayerMediaItem): Map<String, Any?> =
    mapOf(
      "id" to item.subscriptionStoreId.orEmpty().ifEmpty { item.a().orEmpty() },
      "title" to item.title.orEmpty(),
      "artistName" to item.artistName.orEmpty(),
      "artworkUrl" to (item.getArtworkUrl(200, 200) ?: ""),
      "duration" to (item.duration / 1000).toString(),
    )

  fun describePlaybackStatus(state: Int): String =
    when (state) {
      com.apple.android.music.playback.model.PlaybackState.PLAYING -> "playing"
      com.apple.android.music.playback.model.PlaybackState.PAUSED -> "paused"
      com.apple.android.music.playback.model.PlaybackState.STOPPED -> "stopped"
      else -> "unknown"
    }

  private fun durationString(attributes: JSONObject): String {
    val millis =
      when {
        attributes.has("durationInMillis") -> attributes.optLong("durationInMillis", 0)
        attributes.has("duration") -> (attributes.optDouble("duration", 0.0) * 1000).toLong()
        else -> 0L
      }
    return millis.toString()
  }

  /** Catalog song id for [CatalogPlaybackQueueItemProvider] (playParams when present). */
  fun catalogPlaybackId(resource: JSONObject): String? {
    val playParams = resource.optJSONObject("attributes")?.optJSONObject("playParams") ?: return null
    return playParams.optString("id", "").takeIf { it.isNotEmpty() }
      ?: playParams.optString("catalogId", "").takeIf { it.isNotEmpty() }
  }

  private fun artworkUrl(artwork: JSONObject?, width: Int = 200, height: Int = 200): String {
    if (artwork == null) return ""
    val template = artwork.optString("url", "")
    if (template.isEmpty()) return ""
    return template
      .replace("{w}", width.toString())
      .replace("{h}", height.toString())
  }
}
