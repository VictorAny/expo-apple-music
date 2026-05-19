# Apple Music API coverage

Living checklist for `@wwdrew/expo-apple-music` vs the [Apple Music API](https://developer.apple.com/documentation/AppleMusicAPI). Update this file in the same PR that implements an endpoint.

**Legend:** ✅ done · 🚧 in progress · ⬜ planned · ➖ out of scope · N/A web/android/ios column = platform support

**Plan:** [V1_PLAN.md](./V1_PLAN.md)

---

## Auth & storefront

| Capability | JS API | iOS | Android | Web |
|------------|--------|-----|---------|-----|
| Authorize | `Auth.authorize()` | ✅ | ✅ | ⬜ |
| Subscription check | `Auth.checkSubscription()` | ✅ | ⚠️ inferred | ⬜ |
| Storefront | `Auth.getStorefront()` | ✅ | ✅ | ⬜ |

---

## Catalog (`/v1/catalog/{storefront}/...`)

| Capability | JS API | iOS | Android | Web |
|------------|--------|-----|---------|-----|
| Search (songs, albums) | `Catalog.search()` | ✅ | ✅ | ⬜ |
| Search (artists, playlists, stations, music-videos) | `Catalog.search()` | ✅ | ✅ | ⬜ |
| Get resource by ID | `Catalog.getSong` / `getAlbum` / `getArtist` / `getPlaylist` / `getStation` / `getMusicVideo` | ✅ | ✅ | ⬜ |
| Album → tracks | `Catalog.getAlbumTracks()` | ✅ | ✅ | ⬜ |
| Artist → albums | `Catalog.getArtistAlbums()` | ✅ | ✅ | ⬜ |
| Playlist → tracks | `Catalog.getPlaylistTracks()` | ✅ | ✅ | ⬜ |
| Charts | `Catalog.getCharts()` | ✅ | ✅ | ⬜ |

---

## Library (`/v1/me/library/...`)

| Capability | JS API | iOS | Android | Web |
|------------|--------|-----|---------|-----|
| List songs | `Library.getSongs()` | ✅ | ✅ | ⬜ |
| List playlists | `Library.getPlaylists()` | ✅ | ✅ | ⬜ |
| Playlist tracks | `Library.getPlaylistTracks()` | ✅ | ✅ | ⬜ |
| List artists | `Library.getArtists()` | ✅ | ✅ | ⬜ |
| List albums | `Library.getAlbums()` | ✅ | ✅ | ⬜ |
| List music-videos | `Library.getMusicVideos()` | ⬜ | ⬜ | ⬜ |
| Library search | `Library.search()` | ⬜ | ⬜ | ⬜ |

---

## History (`/v1/me/recent/...`)

| Capability | JS API | iOS | Android | Web |
|------------|--------|-----|---------|-----|
| Recently played resources | `History.getRecentlyPlayedResources()` | ✅ | ✅ | ⬜ |
| Recently played tracks | `History.getRecentlyPlayedTracks()` | ✅ | ✅ | ⬜ |
| Recently played stations | `History.getRecentlyPlayedStations()` | ✅ | ✅ | ⬜ |
| Heavy rotation | `History.getHeavyRotation()` | ✅ | ✅ | ⬜ |
| Recently added | `History.getRecentlyAdded()` | ✅ | ✅ | ⬜ |

---

## Ratings, favorites, mutations

| Capability | JS API | iOS | Android | Web |
|------------|--------|-----|---------|-----|
| Ratings | `Ratings.*` | ⬜ | ⬜ | ⬜ |
| Favorites | `Ratings.*` | ⬜ | ⬜ | ⬜ |
| Create / edit playlists | `LibraryMutations.*` | ⬜ | ⬜ | ⬜ |
| Add to library | `LibraryMutations.addToLibrary()` | ⬜ | ⬜ | ⬜ |

---

## Recommendations

| Capability | JS API | iOS | Android | Web |
|------------|--------|-----|---------|-----|
| Recommendations | `Recommendations.get()` | ⬜ | ⬜ | ⬜ |
| Replay | `Recommendations.getReplay()` | ⬜ | ⬜ | ⬜ |

---

## Playback (native SDKs, not REST)

| Capability | JS API | iOS | Android | Web |
|------------|--------|-----|---------|-----|
| Queue catalog / library | `Player.setQueue()` / interim `MusicKit.setPlaybackQueue` | ✅ | ✅ | ⬜ |
| Transport + state + hooks | `Player.*` | ✅ | ✅ | ⬜ |
| Catalog station queue | | ✅ | ➖ | ⬜ |

---

## REST path reference

| Feature | HTTP |
|---------|------|
| Storefront | `GET /v1/me/storefront` |
| Catalog search | `GET /v1/catalog/{storefront}/search` |
| Catalog album tracks | `GET /v1/catalog/{storefront}/albums/{id}/tracks` |
| Catalog artist albums | `GET /v1/catalog/{storefront}/artists/{id}/albums` |
| Catalog playlist tracks | `GET /v1/catalog/{storefront}/playlists/{id}/tracks` |
| Catalog charts | `GET /v1/catalog/{storefront}/charts` |
| Library songs | `GET /v1/me/library/songs` |
| Library artists | `GET /v1/me/library/artists` |
| Library playlists | `GET /v1/me/library/playlists` |
| Playlist tracks | `GET /v1/me/library/playlists/{id}/tracks` |
| Recent resources | `GET /v1/me/recent/played` |
| Recent tracks | `GET /v1/me/recent/played/tracks` |
| Recent stations | `GET /v1/me/recent/played/stations` |
| Heavy rotation | `GET /v1/me/history/heavy-rotation` |
| Recently added | `GET /v1/me/library/recently-added` |
| Recent stations | `GET /v1/me/recent/played/stations` |
| Library albums | `GET /v1/me/library/albums` |

Confirm exact heavy-rotation path against Apple docs when implementing.
