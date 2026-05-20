package expo.modules.applemusic

import android.content.Context

internal class AndroidHistoryService(
  private val history: HistoryRestClient,
) {
  constructor(context: Context) : this(AppleMusicRestStack.create(context).history)

  suspend fun getRecentlyPlayedResources(): List<Map<String, Any?>> = history.getRecentlyPlayed()

  suspend fun getRecentlyPlayedTracks(options: PaginationOptions): List<Map<String, Any?>> =
    history.getRecentlyPlayedTracks(options.limit)

  suspend fun getHeavyRotation(options: PaginationOptions): List<Map<String, Any?>> =
    history.getHeavyRotation(options.limit)

  suspend fun getRecentlyPlayedStations(options: PaginationOptions): List<Map<String, Any?>> =
    history.getRecentlyPlayedStations(options.limit)

  suspend fun getRecentlyAdded(options: PaginationOptions): List<Map<String, Any?>> =
    history.getRecentlyAdded(options.limit, options.offset)
}
