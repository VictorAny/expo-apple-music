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
      setLibraryQueue(itemId, mediaType)
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

  private suspend fun setLibraryQueue(itemId: String, type: MediaType) {
    when (type) {
      MediaType.STATION -> throw AppleMusicErrors.unsupportedLibraryType("station")
      MediaType.SONG -> {
        val catalogId = library.resolveCatalogPlaybackId(itemId, "song")
        playback.clearSongCache()
        playback.prepareQueue(playback.buildSongProvider(catalogId))
      }
      MediaType.ALBUM -> {
        val catalogId = library.resolveCatalogPlaybackId(itemId, "album")
        playback.clearSongCache()
        playback.prepareQueue(playback.buildAlbumProvider(catalogId))
      }
      MediaType.PLAYLIST -> {
        val catalogId = library.resolveCatalogPlaybackId(itemId, "playlist")
        playback.clearSongCache()
        playback.prepareQueue(playback.buildPlaylistProvider(catalogId))
      }
    }
  }

  suspend fun playLibrarySong(songId: String) {
    val catalogId = library.resolveCatalogPlaybackId(songId, "song")
    playback.clearSongCache()
    playback.prepareQueue(playback.buildSongProvider(catalogId))
  }

  suspend fun playLibraryPlaylist(playlistId: String, startingAt: Int) {
    val catalogIds = library.resolveLibrarySongCatalogIds(playlistId)
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
    )
  }
}
