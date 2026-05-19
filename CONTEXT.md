# Project context — @wwdrew/expo-apple-music

Reference for humans and agents. Use this file to avoid mixing up **catalog** vs **library** and to align Android work with agreed priorities.

## Commits

This repo uses [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description` (e.g. `fix(android): …`, `feat(ios): …`, `docs: …`). Use an optional scope when the change is platform- or area-specific.

## TypeScript naming

Do **not** prefix types with `I` or `T`. Use plain names (`Song`, `Album`, `PaginationOptions`). See **[docs/TYPES.md](./docs/TYPES.md)**.

## Terminology

| Term               | Meaning                                                                                            | **Not** this                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Catalog**        | Apple Music’s global store — all artists, albums, songs available on the service                   | The signed-in user’s personal collection                                        |
| **Library**        | The authenticated user’s Apple Music account data — their songs, playlists, recently played, etc.  | Public/store search                                                             |
| **Catalog search** | `MusicKit.catalogSearch()` — search the **store** (e.g. `"Beatles"` → songs/albums in Apple Music) | Searching “my playlists” or “my library” for an artist                          |
| **Library APIs**   | `getUserPlaylists`, `getLibrarySongs`, `getPlaylistSongs`, `getTracksFromLibrary`                  | Catalog search                                                                  |
| **Auth**           | Sign the user into Apple Music and obtain permission/tokens to access **their** data               | Catalog browse without a user (developer token alone is not “auth” for library) |

**Rule of thumb:** If it’s under `MusicKit` and the method name contains **Library** or **Playlist** (user-owned), it’s **library**. If the method is **catalogSearch**, it’s **catalog** (store).

## JS API map (by domain)

### Auth (`Auth`)

| Method                | Domain              | Purpose                                                       |
| --------------------- | ------------------- | ------------------------------------------------------------- |
| `authorize()`         | Auth                | User signs in / grants access                                 |
| `checkSubscription()` | Auth / subscription | Can they play catalog, become subscriber, cloud library, etc. |
| `getStorefront()`     | Auth                | User’s storefront id (e.g. `us`)                              |

**Auth documentation:** [docs/AUTH.md](./docs/AUTH.md) — developer JWT (Android), `AuthStatus` return values, platform requirements, config plugin, upsell options.

### Catalog — store (`MusicKit`)

| Method                                 | Domain                     | Purpose                                      |
| -------------------------------------- | -------------------------- | -------------------------------------------- |
| `Catalog.search(term, types, options?)` | **Catalog**                | Search Apple Music store (`songs`, `albums`, `artists`, `playlists`, `stations`, `music-videos`) |
| `Catalog.getSong` / `getAlbum` / … | **Catalog**                | Fetch catalog resource by ID |
| `Catalog.getAlbumTracks` / `getArtistAlbums` / `getPlaylistTracks` | **Catalog** | Catalog relationship endpoints |
| `setPlaybackQueue(itemId, type)`       | Catalog playback (usually) | Queue catalog item by store ID               |

### Library — user account (`Library` / interim `MusicKit`)

| Method                                         | Domain               | Purpose                          |
| ---------------------------------------------- | -------------------- | -------------------------------- |
| `Library.getPlaylists(options?)`               | **Library**          | User’s playlists                 |
| `Library.getSongs(options?)`                   | **Library**          | User’s library songs             |
| `Library.getPlaylistTracks(playlistId, …)`     | **Library**          | Tracks in a playlist             |
| `Library.getArtists(options?)`                 | **Library**          | User’s library artists           |
| `playLibrarySong(songId)`                      | **Library playback** | Play a library song              |
| `playLibraryPlaylist(playlistId, startingAt?)` | **Library playback** | Play a library playlist          |

### History — listening (`History` / interim `MusicKit`)

| Method | Domain | Purpose |
| ------ | ------ | ------- |
| `History.getRecentlyPlayedResources()` | **History** | Recent albums / playlists / stations |
| `History.getRecentlyPlayedTracks(options?)` | **History** | Recent songs (listening history) |
| `History.getHeavyRotation(options?)` | **History** | Heavy rotation resources |
| `History.getRecentlyPlayedStations(options?)` | **History** | Recent radio stations |
| `History.getRecentlyAdded(options?)` | **History** | Recently added library items |
| `Library.getAlbums(options?)` | **Library** | User's library albums |

### Playback (`Player` + hooks)

Transport controls and events — used after something is queued; not “search” or “list library.”

## Platform implementation (high level)

| Capability            | iOS (current)                         | Android (target)                                                   |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| Auth                  | `SKCloudServiceController` + MusicKit | MusicKit **Authentication** SDK (intent → Apple Music app)         |
| **Library** read APIs | Native MusicKit requests              | **Apple Music REST API** (`/v1/me/library/...`) + music user token |
| **Catalog** search    | Native `MusicCatalogSearchRequest`    | **Apple Music REST API** (`/v1/catalog/{storefront}/search`)       |
| Catalog playback      | Native player                         | `MediaPlayerController` + `CatalogPlaybackQueueItemProvider`       |
| Library playback      | Native player queue                   | TBD / spike; **deprioritized**                                     |

Android also requires a **developer token** (typically from your backend) in addition to the user token. iOS does not use that pattern in this module today.

Errors should be normalized to `AppleMusicError` (`code`, `message`, optional `operation`) at the native boundary where possible.

## Android delivery tiers

Priorities for Android implementation (agreed). **Tier 0** before **Tier 1**.

### Tier 0 — must have first

- `Auth.authorize()` — sign in, store music user token
- **Library read APIs** (user’s account data):
  - `getUserPlaylists`
  - `getLibrarySongs`
  - `getPlaylistSongs`
  - `getTracksFromLibrary` (if endpoint parity confirmed)

These need auth + REST client + JSON mapping to existing TS types.

### Tier 1 — important, after tier 0

- `MusicKit.catalogSearch()` — **store** search (not “my playlists”)
- `Auth.checkSubscription()` — approximate mapping from auth/API
- Catalog playback: `setPlaybackQueue` + `Player.*` + playback events/hooks

### Tier 2 — later

- `playLibrarySong` / `playLibraryPlaylist` — library playback (validate IDs + playback SDK on device)
- Full error normalization across all paths
- Storefront / other Android config as needed

## Common mistakes to avoid

1. Calling **catalog search** “library search” or “search my playlists” — wrong domain.
2. Putting **catalog search** in tier 0 when the product need is **getUserPlaylists** / library lists — use tiers above.
3. Assuming Android MusicKit equals iOS MusicKit — Android splits auth SDK, playback SDK, and HTTP API.
4. Expecting **library playback** parity before tier 0/1 library **read** + auth are done.

## v1 direction

Full [Apple Music API](https://developer.apple.com/documentation/AppleMusicAPI) coverage before **1.0.0** — see **[docs/V1_PLAN.md](./docs/V1_PLAN.md)** (phases, domain API shape, coverage matrix, iOS REST strategy). Standalone package; no compatibility with other wrappers — [ATTRIBUTION.md](./ATTRIBUTION.md).

## Related docs

- [docs/V1_PLAN.md](./docs/V1_PLAN.md) — v1.0 completion plan
- [README.md](./README.md) — install and usage
- [docs/AUTH.md](./docs/AUTH.md) — `authorize()`, developer token, `AuthStatus`, Android auth flow
- [docs/CLI.md](./docs/CLI.md) — `npm run dev-token` (generate / verify developer JWT)
- [docs/ANDROID_IMPLEMENTATION.md](./docs/ANDROID_IMPLEMENTATION.md) — Android full iOS parity (REST + playback AAR; agent handoff)
- [docs/WEB_IMPLEMENTATION.md](./docs/WEB_IMPLEMENTATION.md) — Web parity (MusicKit JS; same REST contract as Android)
- [ATTRIBUTION.md](./ATTRIBUTION.md) — inspiration and license; no migration guide
- [docs/HISTORY.md](./docs/HISTORY.md) — history endpoints and API limits
- [docs/TYPES.md](./docs/TYPES.md) — TypeScript naming (no `I`/`T` prefixes)
