# Migration from `@lomray/react-native-apple-music`

## Install

```sh
npx expo install @wwdrew/expo-apple-music
```

Requires **Expo SDK 55** and **iOS 16+** for catalog and library APIs.

## API surface

Exports match Lomray: `Auth`, `Player`, `MusicKit`, hooks, and types.

## Behavior changes (1.0)

| Area | Lomray | `@wwdrew/expo-apple-music` |
|------|--------|----------------------------|
| Failed `catalogSearch` / library calls | Often empty data + `console.error` | Promise **rejects** with error |
| iOS 15 | Supported with fallbacks | **Not supported** (module minimum iOS 16.0) |
| Android | N/A (iOS-only package) | Stub rejects with `UNSUPPORTED_PLATFORM` |
| Native bridge | React Native `NativeModules` | Expo `requireNativeModule('ExpoAppleMusic')` |
| Config plugin | Optional | Add to `app.config.ts` for `NSAppleMusicUsageDescription` |

## Config plugin

```ts
export default {
  plugins: [
    [
      '@wwdrew/expo-apple-music',
      { musicUsageDescription: 'We use Apple Music to import your library.' },
    ],
  ],
};
```

Enable **MusicKit** on your App ID in the Apple Developer portal (manual step). This plugin does **not** add `com.apple.developer.musickit` entitlements ([upstream issue #14](https://github.com/Lomray-Software/react-native-apple-music/issues/14)).
