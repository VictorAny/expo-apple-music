# @wwdrew/expo-apple-music

Apple MusicKit wrapper for Expo (SDK 55, iOS 16+).

Based on [`@lomray/react-native-apple-music`](https://github.com/Lomray-Software/react-native-apple-music) (Apache-2.0). Not affiliated with Lomray.

## Install

```sh
npx expo install @wwdrew/expo-apple-music
```

**Peer requirements:** Expo SDK 55, iOS 16+ for catalog and library features.

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

The plugin sets `NSAppleMusicUsageDescription` only. It does **not** add MusicKit entitlements — enable **MusicKit** on your App ID in the [Apple Developer portal](https://developer.apple.com) manually. See [Lomray issue #14](https://github.com/Lomray-Software/react-native-apple-music/issues/14).

## Usage

```ts
import { Auth, Player, MusicKit } from '@wwdrew/expo-apple-music';

const status = await Auth.authorize();
await MusicKit.catalogSearch('Beatles', ['songs', 'albums']);
Player.play();
```

See [MIGRATION.md](./MIGRATION.md) when moving from `@lomray/react-native-apple-music`.

## Android

1.0 ships an autolinking-safe stub. Native calls reject with `UNSUPPORTED_PLATFORM`.

## License

Apache-2.0 — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
