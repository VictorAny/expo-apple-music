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

See [MIGRATION.md](./MIGRATION.md) when moving from `@lomray/react-native-apple-music`.

## Android

**Tier 0 (in progress):** `Auth.authorize()` via the MusicKit Authentication SDK (Apple Music app, developer JWT). Library/catalog APIs and `checkSubscription()` still reject with `UNSUPPORTED_PLATFORM` until implemented. See [CONTEXT.md](./CONTEXT.md) and [docs/AUTH.md](./docs/AUTH.md).

## License

Apache-2.0 — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
