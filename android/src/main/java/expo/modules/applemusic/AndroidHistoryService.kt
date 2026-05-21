package expo.modules.applemusic

import android.content.Context

internal class AndroidHistoryService(
  private val history: HistoryRestClient,
) {
  constructor(context: Context) : this(AppleMusicRestStack.create(context).history)

  suspend fun getRecentlyPlayedResources(musicUserToken: String): List<Map<String, Any?>> =
    history.getRecentlyPlayed(musicUserToken)

  suspend fun getRecentlyPlayedTracks(musicUserToken: String, options: PaginationOptions): List<Map<String, Any?>> =
    history.getRecentlyPlayedTracks(musicUserToken, options.limit)

  suspend fun getHeavyRotation(musicUserToken: String, options: PaginationOptions): List<Map<String, Any?>> =
    history.getHeavyRotation(musicUserToken, options.limit)

  suspend fun getRecentlyPlayedStations(musicUserToken: String, options: PaginationOptions): List<Map<String, Any?>> =
    history.getRecentlyPlayedStations(musicUserToken, options.limit)

  suspend fun getRecentlyAdded(musicUserToken: String, options: PaginationOptions): List<Map<String, Any?>> =
    history.getRecentlyAdded(musicUserToken, options.limit, options.offset)
}
