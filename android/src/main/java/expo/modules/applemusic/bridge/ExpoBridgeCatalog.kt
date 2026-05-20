package expo.modules.applemusic.bridge

import expo.modules.applemusic.AndroidCatalogService
import expo.modules.applemusic.BridgeResponses
import expo.modules.applemusic.PaginationOptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

internal fun ModuleDefinitionBuilder.registerCatalogBridge(
  catalogService: () -> AndroidCatalogService,
) {
  AsyncFunction("catalogSearch") Coroutine { term: String, types: List<String>, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.catalogSearch(catalogService().search(term, types, pagination))
  }

  AsyncFunction("getCatalogSong") Coroutine { id: String ->
    catalogService().getSong(id)
  }

  AsyncFunction("getCatalogAlbum") Coroutine { id: String ->
    catalogService().getAlbum(id)
  }

  AsyncFunction("getCatalogArtist") Coroutine { id: String ->
    catalogService().getArtist(id)
  }

  AsyncFunction("getCatalogPlaylist") Coroutine { id: String ->
    catalogService().getPlaylist(id)
  }

  AsyncFunction("getCatalogStation") Coroutine { id: String ->
    catalogService().getStation(id)
  }

  AsyncFunction("getCatalogMusicVideo") Coroutine { id: String ->
    catalogService().getMusicVideo(id)
  }

  AsyncFunction("getCatalogAlbumTracks") Coroutine { albumId: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.songs(catalogService().getAlbumTracks(albumId, pagination))
  }

  AsyncFunction("getCatalogArtistAlbums") Coroutine { artistId: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.albums(catalogService().getArtistAlbums(artistId, pagination))
  }

  AsyncFunction("getCatalogPlaylistTracks") Coroutine { playlistId: String, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    BridgeResponses.songs(catalogService().getPlaylistTracks(playlistId, pagination))
  }

  AsyncFunction("getCatalogCharts") Coroutine { types: List<String>, options: Map<String, Any?> ->
    val pagination = PaginationOptions.fromMap(options)
    val genre = options["genre"] as? String
    val chart = options["chart"] as? String
    BridgeResponses.catalogCharts(catalogService().getCharts(types, pagination, genre, chart))
  }
}
