# Platform implementation matrix

How each **public JS method** is implemented on iOS vs Android. The TypeScript API is identical; only the native transport differs.

**Policy (iOS):** Use **MusicKit** when it can perform the operation. Use **REST** (`AppleMusicRestClient`) only for gaps (no MusicKit API, or REST-only writes). Both paths must emit the **same bridge object shape** as Android’s `AppleMusicJsonMapper` (see [TYPES.md](./TYPES.md), `fixtures/*.json`).

**Policy (Android):** REST via `*RestClient` + `AppleMusicRestStack` + `AppleMusicJsonMapper` for all data reads/writes; MusicKit AAR for auth and playback.

**Mappers on iOS:**

| Mapper | Source |
|--------|--------|
| `MusicItemMapper` | MusicKit types (native) |
| `RestJsonMapper` | `api.music.apple.com` JSON (REST) |

**Bridge contract (fixture tests):** [BRIDGE_CONTRACT.md](./BRIDGE_CONTRACT.md) — golden `fixtures/` + `fixtures/expected/`; TS and Kotlin adapters must stay aligned.

---

## Auth

| JS API | iOS | Android |
|--------|-----|---------|
| `Auth.authorize()` | Native `SKCloudServiceController` + optional dev JWT → persist user token | MusicKit Auth SDK activity |
| `Auth.checkSubscription()` | Native `MusicSubscription` / capability checks | Heuristic (token + library probe) |
| `Auth.getStorefront()` | REST `GET /v1/me/storefront` | REST |

---

## Catalog

| JS API | iOS | Android |
|--------|-----|---------|
| `Catalog.search()` | **Native** `MusicCatalogSearchRequest` when no dev JWT is stored; **REST** `GET .../catalog/{storefront}/search` when `Auth.authorize(developerToken)` saved a JWT | REST search |
| `Catalog.getSong` / `getAlbum` / `getArtist` / `getPlaylist` / `getStation` / `getMusicVideo` | **Native** `MusicCatalogResourceRequest` | REST catalog resource |
| `Catalog.getAlbumTracks` | REST relationship | REST |
| `Catalog.getArtistAlbums` | REST relationship | REST |
| `Catalog.getPlaylistTracks` | REST relationship | REST |
| `Catalog.getCharts()` | REST charts | REST |

---

## Library (read)

| JS API | iOS | Android |
|--------|-----|---------|
| `Library.getPlaylists()` | **Native** `MusicLibraryRequest<Playlist>` (+ track load for count) | REST |
| `Library.getSongs()` | **Native** `MusicLibraryRequest<Song>` | REST |
| `Library.getPlaylistTracks()` | **Native** library playlist + tracks | REST |
| `Library.getArtists()` | **Native** `MusicLibraryRequest<Artist>` | REST |
| `Library.getAlbums()` | **Native** `MusicLibraryRequest<Album>` | REST |

---

## History

| JS API | iOS | Android |
|--------|-----|---------|
| `History.getRecentlyPlayedResources()` | **Native** `MusicRecentlyPlayedContainerRequest` | REST `GET /v1/me/recent/played` |
| `History.getRecentlyPlayedTracks()` | **Native** `MusicRecentlyPlayedRequest<Song>` | REST |
| `History.getHeavyRotation()` | REST | REST |
| `History.getRecentlyPlayedStations()` | REST | REST |
| `History.getRecentlyAdded()` | REST | REST |

---

## Recommendations

| JS API | iOS | Android |
|--------|-----|---------|
| `Recommendations.get()` (no ids) | **Native** `MusicPersonalRecommendationsRequest` | REST `GET /v1/me/recommendations` |
| `Recommendations.get({ ids })` | REST | REST |
| `Recommendations.getReplay()` | REST `GET /v1/me/music-summaries` | REST |

Heavy rotation: `History.getHeavyRotation()` — not this module ([RECOMMENDATIONS.md](./RECOMMENDATIONS.md)).

---

## Ratings & library mutations

| JS API | iOS | Android |
|--------|-----|---------|
| `Ratings.*` | REST (requires stored dev + user tokens) | REST |
| `LibraryMutations.*` | REST | REST |

---

## Playback

| JS API | iOS | Android |
|--------|-----|---------|
| `Player.setQueue()` | **Native** MusicKit player + catalog/library queue | MusicKit playback AAR |
| `Player.playLibrarySong` / `playLibraryPlaylist` | **Native** (+ library ID resolution in queue service) | REST resolve catalog IDs + queue |
| `Player` transport, `getCurrentState`, hooks | **Native** | Native AAR |

---

## Bridge contract (parity rules)

| Field | Rule |
|-------|------|
| `Song.id` | Prefer catalog playback id from `playParameters` when present; else resource / `MusicItemID.rawValue` |
| `Song.duration` | **Milliseconds** (number) |
| `MusicVideo.duration` | **Milliseconds** (number) |
| `Album.trackCount` | Number |
| `Playlist.trackCount` | Number; prefer API `trackCount`, not loaded `tracks.count` when available |
| Library IDs | `i.`, `l.`, `p.` prefixes — see [RESOURCE_IDS.md](./RESOURCE_IDS.md) |

---

## Known behavioral differences (not mapper bugs)

| Area | Note |
|------|------|
| Recent played containers | Apple caps some `/v1/me/recent/*` responses (e.g. 10 items); native vs REST may differ slightly in ordering |
| `Auth.checkSubscription()` | Android infers flags; iOS uses MusicKit subscription APIs |
| Catalog station queue | iOS native ✅; Android playback AAR ❌ |
| REST on iOS without dev JWT | GET may use `MusicDataRequest` fallback; **writes** require stored tokens |
