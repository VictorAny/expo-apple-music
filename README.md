# @wwdrew/expo-apple-music

Cross-platform Apple Music API client for Expo (SDK 55, iOS 16+, Android, Web).

Inspired by [`@lomray/react-native-apple-music`](https://github.com/Lomray-Software/react-native-apple-music) (Apache-2.0) — see [ATTRIBUTION.md](./ATTRIBUTION.md). Not affiliated with Lomray; **not** a drop-in replacement.

## Install

```sh
npx expo install @wwdrew/expo-apple-music
```

**Peer requirements:** Expo SDK 55 · iOS 16+ · Android with Apple Music app installed (see [Platform parity](#platform-parity)).

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

Sets `NSAppleMusicUsageDescription` on iOS. On Android, pass a MusicKit developer JWT to `Auth.authorize(token)` at runtime (see [docs/AUTH.md](./docs/AUTH.md)).

Android **package visibility** for the Apple Music app comes from this module’s library manifest (merged at build time). The plugin does **not** add MusicKit entitlements on iOS — enable **MusicKit** on your App ID in the [Apple Developer portal](https://developer.apple.com) manually. See [Lomray issue #14](https://github.com/Lomray-Software/react-native-apple-music/issues/14).

## Usage

```ts
import { Auth, AuthStatus, Player, MusicKit } from '@wwdrew/expo-apple-music';

// iOS — developerToken is ignored
const status = await Auth.authorize();

// Android — requires a MusicKit developer JWT
const status = await Auth.authorize(developerToken);

if (status === AuthStatus.AUTHORIZED) {
  await MusicKit.catalogSearch('Beatles', ['songs', 'albums']);
  Player.play();
}
```

**Auth details** (return values, developer token, Android requirements, upsell options): **[docs/AUTH.md](./docs/AUTH.md)**.

**CLI tools** (repo only — generate/verify developer JWTs): **[docs/CLI.md](./docs/CLI.md)**.

Public API direction before 1.0: [docs/V1_PLAN.md](./docs/V1_PLAN.md). Attribution: [ATTRIBUTION.md](./ATTRIBUTION.md).

## Platform parity

The **same TypeScript API** is exposed on iOS and Android. Native implementations differ; a few capabilities are missing or approximate on Android.

| Feature | iOS | Android | Notes |
| --- | :---: | :---: | --- |
| `Auth.authorize()` | ✅ | ✅ | Android requires a [developer JWT](./docs/AUTH.md) at runtime. |
| `Auth.checkSubscription()` | ✅ | ⚠️ | Android infers flags from token + library probe (no `MusicSubscription` API). |
| `Catalog.search()` | ✅ | ✅ | All search types on both platforms; iOS uses native MusicKit search. |
| `Catalog.get*` / `getAlbumTracks()` | ✅ | ✅ | Catalog resource by ID; album tracks via REST on both platforms. |
| `MusicKit.catalogSearch()` | ✅ | ✅ | Deprecated interim alias — use `Catalog.search()`. |
| `getUserPlaylists` / `getLibrarySongs` / `getPlaylistSongs` | ✅ | ✅ | Android uses REST (`/v1/me/library/...`). |
| `getTracksFromLibrary()` | ✅ | ✅ | Android uses `GET /v1/me/recent/played` (API max **10** items per request). |
| `setPlaybackQueue` — song | ✅ | ✅ | |
| `setPlaybackQueue` — album | ✅ | ✅ | |
| `setPlaybackQueue` — playlist | ✅ | ✅ | |
| `setPlaybackQueue` — **station** (catalog) | ✅ | ❌ | Playback AAR queue builder supports songs, albums, and playlists only — no station container type. |
| `setPlaybackQueue` — **station** (library) | ❌ | ❌ | Not supported on either platform (stations are not library items). |
| `playLibrarySong` / `playLibraryPlaylist` | ✅ | ✅ | Android resolves library IDs to catalog playback IDs via REST before queueing. |
| `Player.*` transport + hooks | ✅ | ✅ | Android uses `MediaPlayerController` (playback AAR). Test on a **physical ARM** device (no x86 natives). |
| `configurePlayer()` | ✅ | ⚠️ | Android returns the same shape; audio-session / focus behavior is not fully mirrored. |

**Legend:** ✅ supported · ⚠️ supported with differences · ❌ not supported

Implementation details: [docs/ANDROID_IMPLEMENTATION.md](./docs/ANDROID_IMPLEMENTATION.md). Terminology (catalog vs library): [CONTEXT.md](./CONTEXT.md).

## Android setup

1. Enable **MusicKit** for your app in the [Apple Developer portal](https://developer.apple.com) and issue a developer JWT (see [docs/CLI.md](./docs/CLI.md)).
2. Call `Auth.authorize(developerToken)` — opens the Apple Music app via the MusicKit Authentication SDK.
3. Run on a **physical ARM device** with Apple Music installed and an active subscription.

## License

Apache-2.0 — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
