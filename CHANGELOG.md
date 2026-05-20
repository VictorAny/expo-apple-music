# Changelog

## 1.0.0 — 2026-05-20

First stable release of the cross-platform Apple Music API client for Expo (iOS 16+, Android, Web).

### Breaking changes

- Public API is **domain modules only** (`Auth`, `Catalog`, `Library`, `History`, `Player`, `Ratings`, `LibraryMutations`, `Recommendations`). The legacy `MusicKit` facade was removed in pre-1.0 refactors.

### Features

- **Library:** `Library.getMusicVideos()`, `Library.search()` (library-songs, library-albums, …).
- **Catalog:** `Catalog.getByIds(type, ids)` — batch storefront resource GET (`?ids=`).
- **iOS:** MusicKit playback, native library/history where available, REST for catalog gaps, ratings, mutations, and recommendations replay.
- **Android:** REST data layer + MusicKit playback AAR; developer JWT required for auth.
- **Web:** MusicKit JS bridge for auth, catalog, library, history, ratings, mutations, recommendations, and playback.
- **Catalog:** `Catalog.search`, get-by-id, relationship helpers (`getAlbumTracks`, `getArtistAlbums`, `getPlaylistTracks`), `getCharts`.
- **Example app:** Expo Router explorer with Playground (search → play), per-domain demos, and method docs.

### Bug fixes

- **iOS:** REST catalog search when a developer JWT is stored; catalog queue resolves cloud playback ids; now-playing metadata maps from the queue entry (no 404 re-fetch).
- **Android:** Playback observer survives token reset; auth and storefront resolution stabilized; REST 403 → `permissionDenied`.
- **Web:** MusicKit JS auth and catalog API in Expo web.
- **Example:** Session restore no longer auto-opens the auth flow.

### Documentation

- Platform parity table (iOS / Android / Web), [RELEASE_CHECKLIST.md](./docs/RELEASE_CHECKLIST.md), [IOS_SETUP.md](./docs/IOS_SETUP.md), [AUTH.md](./docs/AUTH.md) web section, [APPLE_MUSIC_API.md](./docs/APPLE_MUSIC_API.md) coverage matrix.

### Known limitations (1.0)

- **Android:** catalog station queue not supported (playback AAR).
- **Web / Android:** `Auth.checkSubscription()` infers flags (no native `MusicSubscription` API).
- **Web:** playback and hooks marked ⚠️ — verify in Safari + Chrome ([docs/QA_SIGNOFF.md](./docs/QA_SIGNOFF.md)).
