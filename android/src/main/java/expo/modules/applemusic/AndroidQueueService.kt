package expo.modules.applemusic

import android.content.Context

internal class AndroidQueueService(
  context: Context,
  private val playback: AndroidPlaybackController,
  private val library: LibraryRestClient,
) {
  constructor(context: Context, playback: AndroidPlaybackController) : this(
    context,
    playback,
    AppleMusicRestStack.create(context).library,
  )

  enum class MediaType(val raw: String) {
    SONG("song"),
    ALBUM("album"),
    PLAYLIST("playlist"),
    STATION("station"),
    ;

    companion object {
      fun from(raw: String): MediaType? = entries.find { it.raw == raw }
    }
  }

  suspend fun setQueue(itemId: String, type: String) {
    val mediaType =
      MediaType.from(type) ?: throw AppleMusicErrors.unknownMediaType(type)
    val isLibrary = LibraryIds.isLibraryId(itemId)

    if (isLibrary) {
      throw AppleMusicErrors.apiError(
        "Library queue requires a music user token. Use Player.playLibrarySong or playLibraryPlaylist.",
      )
    } else {
      setCatalogQueue(itemId, mediaType)
    }
  }

  private suspend fun setCatalogQueue(itemId: String, type: MediaType) {
    val provider =
      when (type) {
        MediaType.SONG -> playback.buildSongProvider(itemId)
        MediaType.ALBUM -> playback.buildAlbumProvider(itemId)
        MediaType.PLAYLIST -> playback.buildPlaylistProvider(itemId)
        MediaType.STATION ->
          throw AppleMusicErrors.apiError("Station playback is not supported on Android yet.")
      }
    playback.clearSongCache()
    playback.prepareQueue(provider)
  }

  suspend fun playLibrarySong(musicUserToken: String, songId: String) {
    val catalogId = library.resolveCatalogPlaybackId(musicUserToken, songId, "song")
    playback.clearSongCache()
    playback.prepareQueue(playback.buildSongProvider(catalogId), musicUserToken)
  }

  suspend fun playLibraryPlaylist(musicUserToken: String, playlistId: String, startingAt: Int) {
    val catalogIds = library.resolveLibrarySongCatalogIds(musicUserToken, playlistId)
    if (catalogIds.isEmpty()) {
      throw AppleMusicErrors.noSongsInPlaylist()
    }
    val startIndex =
      when {
        startingAt == -1 -> 0
        startingAt in catalogIds.indices -> startingAt
        else -> 0
      }
    playback.clearSongCache()
    playback.prepareQueue(
      playback.buildSongProvider(*catalogIds.toTypedArray(), startIndex = startIndex),
      musicUserToken,
    )
  }
}
