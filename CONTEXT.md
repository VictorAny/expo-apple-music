# Project context — @wwdrew/expo-apple-music

Reference for humans and agents. Use this file to avoid mixing up **catalog** vs **library** and to align Android work with agreed priorities.

## Commits

This repo uses [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description` (e.g. `fix(android): …`, `feat(ios): …`, `docs: …`). Use an optional scope when the change is platform- or area-specific.

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

**Auth documentation:** [docs/AUTH.md](./docs/AUTH.md) — developer JWT (Android), `AuthStatus` return values, platform requirements, config plugin, upsell options.

### Catalog — store (`MusicKit`)

| Method                                 | Domain                     | Purpose                                      |
| -------------------------------------- | -------------------------- | -------------------------------------------- |
| `catalogSearch(term, types, options?)` | **Catalog**                | Search Apple Music store (`songs`, `albums`) |
| `setPlaybackQueue(itemId, type)`       | Catalog playback (usually) | Queue catalog item by store ID               |

### Library — user account (`MusicKit`)

| Method                                         | Domain               | Purpose                                                 |
| ---------------------------------------------- | -------------------- | ------------------------------------------------------- |
| `getUserPlaylists(options?)`                   | **Library**          | User’s playlists                                        |
| `getLibrarySongs(options?)`                    | **Library**          | User’s library songs                                    |
| `getPlaylistSongs(playlistId, options?)`       | **Library**          | Tracks in one of the user’s playlists                   |
| `getTracksFromLibrary()`                       | **Library**          | Recently played (and related library containers on iOS) |
| `playLibrarySong(songId)`                      | **Library playback** | Play a library song (lower priority on Android)         |
| `playLibraryPlaylist(playlistId, startingAt?)` | **Library playback** | Play a library playlist (lower priority on Android)     |

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
- Config plugin: developer token / storefront for Android

## Common mistakes to avoid

1. Calling **catalog search** “library search” or “search my playlists” — wrong domain.
2. Putting **catalog search** in tier 0 when the product need is **getUserPlaylists** / library lists — use tiers above.
3. Assuming Android MusicKit equals iOS MusicKit — Android splits auth SDK, playback SDK, and HTTP API.
4. Expecting **library playback** parity before tier 0/1 library **read** + auth are done.

## Related docs

- [README.md](./README.md) — install and usage
- [docs/AUTH.md](./docs/AUTH.md) — `authorize()`, developer token, `AuthStatus`, Android auth flow
- [MIGRATION.md](./MIGRATION.md) — Lomray migration notes
