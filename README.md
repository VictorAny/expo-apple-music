# @wwdrew/expo-apple-music

Cross-platform Apple Music API client for Expo (SDK 55, iOS 16+, Android, Web).

Inspired by [`@lomray/react-native-apple-music`](https://github.com/Lomray-Software/react-native-apple-music) (Apache-2.0) — see [ATTRIBUTION.md](./ATTRIBUTION.md). Not affiliated with Lomray; **not** a drop-in replacement.

## Install

```sh
npx expo install @wwdrew/expo-apple-music
```

**Peer requirements:** Expo SDK 55 · iOS 16+ · Android with Apple Music app installed · Web with MusicKit JS (see [Platform parity](#platform-parity)).

## Config plugin

```ts
// app.config.ts
export default {
  plugins: [
    [
      '@wwdrew/expo-apple-music',
      { musicUsageDescription: 'We use Apple Music to import your library.' },
    ],
  ],
};
```

Sets `NSAppleMusicUsageDescription` on iOS. Pass an optional MusicKit **developer JWT** to `Auth.authorize(token)` on iOS for reliable catalog search (REST); Android and web require it. See [docs/AUTH.md](./docs/AUTH.md) and **[docs/IOS_SETUP.md](./docs/IOS_SETUP.md)** (signing, portal, entitlements, release checklist).

Android **package visibility** for the Apple Music app comes from this module’s library manifest (merged at build time).

**iOS:** Enable **MusicKit** on your App ID (App Services) in the [Apple Developer portal](https://developer.apple.com). Do **not** add `com.apple.developer.applemusickit` / `musickit` to entitlements — that breaks automatic signing ([Apple DTS](https://developer.apple.com/forums/thread/799000)).

## Usage

```ts
import { Auth, AuthStatus, Catalog, CatalogSearchType, Player } from '@wwdrew/expo-apple-music';

// iOS: optional developer JWT (recommended for Catalog.search — see docs/IOS_SETUP.md)
// Android / web: developer JWT required
const status = await Auth.authorize(developerToken);

if (status === AuthStatus.AUTHORIZED) {
  await Catalog.search('Beatles', [CatalogSearchType.SONGS, CatalogSearchType.ALBUMS]);
  Player.play();
}
```

**iOS setup** (signing, MusicKit in the portal, JWT, release): **[docs/IOS_SETUP.md](./docs/IOS_SETUP.md)**  
**Auth details**: **[docs/AUTH.md](./docs/AUTH.md)**  
**CLI** (mint JWTs locally): **[docs/CLI.md](./docs/CLI.md)**

Public API direction before 1.0: [docs/V1_PLAN.md](./docs/V1_PLAN.md). Attribution: [ATTRIBUTION.md](./ATTRIBUTION.md).

## Platform parity

The **same TypeScript API** is exposed on **iOS, Android, and web**. Native implementations differ; a few capabilities are missing or approximate on Android and web.

| Feature | iOS | Android | Web | Notes |
| --- | :---: | :---: | :---: | --- |
| `Auth.authorize()` | ✅ | ✅ | ✅ | Android and web require a [developer JWT](./docs/AUTH.md). iOS: optional JWT, recommended for `Catalog.search`. |
| `Auth.checkSubscription()` | ✅ | ⚠️ | ⚠️ | Android/web infer flags from auth + library probe (no `MusicSubscription` API). |
| `Catalog.search()` | ✅ | ✅ | ✅ | iOS uses **REST** when a dev JWT was passed to `authorize()`, else native MusicKit ([details](./docs/PLATFORM_IMPLEMENTATION.md#catalog)). |
| `Catalog.get*` / relationship helpers / `getCharts()` | ✅ | ✅ | ✅ | Catalog by ID, relationships, and charts via REST / MusicKit JS. |
| `Library.getPlaylists` / `getSongs` / `getPlaylistTracks` / `getArtists` / `getAlbums` | ✅ | ✅ | ✅ | Library reads via REST (or native on iOS where applicable). |
| `History.*` (recent, heavy rotation, recently added) | ✅ | ✅ | ✅ | Recent resources capped at **10** per request on Android (API limit). |
| `Ratings.*` / `LibraryMutations.*` | ✅ | ✅ | ✅ | REST write paths. iOS needs developer JWT for REST mutations. |
| `Recommendations.get` / `getReplay` | ✅ | ✅ | ✅ | iOS uses MusicKit for `get()` without `ids`; Replay is REST everywhere. |
| `Player.setQueue()` — song / album / playlist | ✅ | ✅ | ⚠️ | Web uses MusicKit JS player; verify in Safari + Chrome before 1.0. |
| `Player.setQueue()` — **station** (catalog) | ✅ | ❌ | ⚠️ | Android playback AAR has no station container; web station queue needs soak QA. |
| `Player.playLibrarySong` / `playLibraryPlaylist` | ✅ | ✅ | ⚠️ | Android resolves library IDs to catalog playback IDs via REST before queueing. |
| `Player.*` transport + hooks | ✅ | ✅ | ⚠️ | Web: MusicKit JS events; 30s+ session QA before 1.0 ([RELEASE_CHECKLIST](./docs/RELEASE_CHECKLIST.md)). |
| `Player.configurePlayer()` | ✅ | ⚠️ | ⚠️ | Returns `PlayerConfig` shape; audio-session / focus behavior not fully mirrored on Android or web. |

**Legend:** ✅ supported · ⚠️ supported with differences · ❌ not supported

Coverage matrix: [docs/APPLE_MUSIC_API.md](./docs/APPLE_MUSIC_API.md). **Release gate:** [docs/RELEASE_CHECKLIST.md](./docs/RELEASE_CHECKLIST.md). Implementation: [docs/ANDROID_IMPLEMENTATION.md](./docs/ANDROID_IMPLEMENTATION.md), [docs/WEB_IMPLEMENTATION.md](./docs/WEB_IMPLEMENTATION.md). **iOS native vs REST:** [docs/PLATFORM_IMPLEMENTATION.md](./docs/PLATFORM_IMPLEMENTATION.md). Terminology: [CONTEXT.md](./CONTEXT.md).

## iOS setup

1. Portal: explicit App ID → **MusicKit** (App Services). No MusicKit keys in entitlements — [docs/IOS_SETUP.md](./docs/IOS_SETUP.md).
2. Mint a developer JWT for dev: [docs/CLI.md](./docs/CLI.md) → pass to `Auth.authorize(token)` (recommended for `Catalog.search`).
3. `npx expo prebuild` when changing plugins; clean build after entitlement mistakes.

## Android setup

1. Enable **MusicKit** for your app in the [Apple Developer portal](https://developer.apple.com) and issue a developer JWT (see [docs/CLI.md](./docs/CLI.md)).
2. Call `Auth.authorize(developerToken)` — opens the Apple Music app via the MusicKit Authentication SDK.
3. Run on a **physical ARM device** with Apple Music installed and an active subscription.

## Web setup

1. Enable **MusicKit** on your App ID (same portal toggle as iOS).
2. Mint a developer JWT ([docs/CLI.md](./docs/CLI.md)); optional `origin` claim for localhost — see [docs/AUTH.md](./docs/AUTH.md).
3. `cd example && npx expo start --web` with `EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN` in `example/.env.local`.
4. Test in **Safari and Chrome** with an Apple Music subscription; playback and hooks need manual QA before 1.0 ([docs/RELEASE_CHECKLIST.md](./docs/RELEASE_CHECKLIST.md)).

## License

Apache-2.0 — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
