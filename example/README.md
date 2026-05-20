# `expo-apple-music` example app

Dev playground for [`@wwdrew/expo-apple-music`](../README.md).

## iOS (recommended first-time path)

1. **Apple Developer:** Create or reuse an **explicit** App ID matching `expo.ios.bundleIdentifier` in [`app.json`](./app.json). Enable **MusicKit** under **App Services** only — do not add MusicKit keys to entitlements (see [docs/IOS_SETUP.md](../docs/IOS_SETUP.md)).
2. **Developer JWT:** From the **repo root** (not `example/`):
   ```sh
   cp ../.env.music.example ../.env.music   # add Team ID, Key ID, .p8 path
   npm run dev-token -- --write-env example/.env.local
   ```
3. **Run:**
   ```sh
   npx expo start --clear
   npx expo run:ios
   ```
4. Tap **Authorize**, then use **Catalog → Search.**

Without `EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN`, iOS search may hit Apple’s auto-token 404 until the bundle ID is fully registered for MusicKit — the JWT forces REST search.

## Android & web

Set the same env var; Android **requires** it. See [docs/CLI.md](../docs/CLI.md).

## Docs

- [docs/IOS_SETUP.md](../docs/IOS_SETUP.md) — full iOS signing and release checklist  
- [docs/AUTH.md](../docs/AUTH.md) — auth behavior  
- [docs/CLI.md](../docs/CLI.md) — `npm run dev-token`
