# iOS setup and release checklist

End-to-end guide for shipping an Expo app that uses `@wwdrew/expo-apple-music` on iOS: Apple Developer configuration, code signing, developer tokens, and the pitfalls that cause “404 Client not found” or provisioning failures.

For API behavior, see [AUTH.md](./AUTH.md). To mint JWTs locally, see [CLI.md](./CLI.md).

---

## 1. Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Apple Developer Program** (paid) | Free accounts cannot use Certificates, Identifiers & Profiles for MusicKit. |
| **Explicit App ID** | Wildcard App IDs do not support per-app MusicKit the way this flow expects. |
| **Bundle identifier** | Must match **exactly** between `app.json` → `expo.ios.bundleIdentifier`, the Xcode target, and the App ID in the portal. |
| **iOS 16+** | Required by this module. |

---

## 2. Apple Developer portal (Identifiers)

1. Open [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources) → **Identifiers** → **+** (or select an existing App ID).
2. Choose **App IDs** → **App**.
3. Set **Bundle ID** to **Explicit** and use the same string as your Expo app (e.g. `com.yourcompany.yourapp`).
4. Open the App ID → **App Services** (or **Capabilities** in older UI).
5. Enable **MusicKit** → **Save**.

That checkbox registers your app with Apple’s Music services for your bundle ID. **It is not mirrored as an entitlement inside the provisioning profile** — see [Apple DTS: “Determining if an entitlement is real”](https://developer.apple.com/forums/thread/799000) and [MusicKit in the portal](https://developer.apple.com/help/account/services/musickit/).

**Global bundle IDs:** If creating a new App ID says the identifier already exists but you do not see it under **your** team, the bundle ID is taken by another account. Pick a new unique ID and update `app.json`.

---

## 3. Entitlements — do **not** add fake MusicKit keys

You may see guides that add keys such as:

- `com.apple.developer.applemusickit`
- `com.apple.developer.musickit`

to `ios.entitlements` or the **Signing & Capabilities** UI.

**Do not add these for MusicKit App Services.** Apple treats MusicKit as an App ID service, not a provisioning entitlement you claim in code. Claiming invalid keys makes **Automatic signing fail** because Xcode looks for a profile that authorizes an entitlement the portal never issues.

**Fix if signing broke after adding MusicKit to entitlements:**

1. Remove MusicKit-related keys from `app.json` → `ios.entitlements` (if present).
2. Ensure the generated `*.entitlements` file under `ios/<AppName>/` has no MusicKit keys (empty `<dict/>` is fine).
3. `npx expo prebuild --clean` (or edit the native project), then clean build in Xcode.

---

## 4. Xcode and code signing

1. Open the workspace: `example/ios/*.xcworkspace` (after prebuild).
2. Target → **Signing & Capabilities** → select your **Team**.
3. Leave **Automatically manage signing** on unless you have a reason for manual profiles.
4. There is **no** separate “MusicKit” row you must add in Capabilities for this setup — MusicKit is enabled on the **App ID** in the portal (section 2).

If profiles were created while the project had bad entitlements, delete stale [development profiles](https://developer.apple.com/account/resources/profiles/list) for that bundle ID and let Xcode regenerate, or clear cached profiles under `~/Library/MobileDevice/Provisioning Profiles` (or Xcode’s derived copies) and rebuild.

---

## 5. Config plugin (Expo)

Install the plugin and set the media-library usage string (required for the system permission dialog):

```ts
// app.config.ts / app.json plugin entry
[
  '@wwdrew/expo-apple-music',
  { musicUsageDescription: 'We use Apple Music to play and search music.' },
],
```

That sets `NSAppleMusicUsageDescription`. Re-run `npx expo prebuild` when you change native config.

---

## 6. Developer JWT (strongly recommended for `Catalog.search` on iOS)

`Auth.authorize()` only needs the user’s consent for **media library access**. That can succeed **without** Apple accepting your bundle ID for **automatic developer token** (MusicKit’s “client” registration).

`Catalog.search()` without a stored developer JWT uses native `MusicCatalogSearchRequest`, which asks Apple’s **Media API Token Service** for a developer token tied to your bundle ID. If that registration is missing or delayed, you get:

```text
Media API Token Service … Not Found (404) … not registered as a valid client identifier
```

**Reliable approach for development and many production apps:** mint a **MusicKit developer JWT** (same as Android) and pass it to `Auth.authorize(developerToken)` on iOS. The module:

- Persists the JWT in native storage when provided.
- Uses **REST** catalog search (`GET /v1/catalog/{storefront}/search`) when a developer token is present, avoiding the failing auto-token path.

### 6.1 Repo / example app

From the **package repo root**:

```sh
cp .env.music.example .env.music
# Edit .env.music: TEAM_ID, KEY_ID, path to AuthKey_*.p8

npm run dev-token -- --write-env example/.env.local
cd example && npx expo start --clear
# separate terminal:
cd example && npx expo run:ios
```

The example reads `EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN` and passes it to `authorize()`.

**Important:**

- **Restart Metro** after changing `.env.local` (Expo bakes `EXPO_PUBLIC_*` at bundle time).
- **Rebuild** the native app after native code changes.
- **Authorize** after adding the token so it is saved (the module stores the JWT even if the user was already authorized).

### 6.2 Production

- Issue short-lived JWTs from **your backend** and call `Auth.authorize(token)` before catalog operations that need REST.
- Do not ship your `.p8` key in the app.

See [Generating developer tokens](https://developer.apple.com/documentation/applemusicapi/generating_developer_tokens).

---

## 7. Release checklist (iOS)

- [ ] App ID in portal matches `expo.ios.bundleIdentifier` (explicit).
- [ ] **MusicKit** enabled under App Services for that App ID.
- [ ] No invalid MusicKit keys in `*.entitlements` / `app.json` `ios.entitlements`.
- [ ] `NSAppleMusicUsageDescription` set via the config plugin.
- [ ] Signing succeeds in Xcode (development and **Archive** / distribution profiles for your chosen channel).
- [ ] `Catalog.search`: either confirm native MusicKit works on device, or provide developer JWT + `authorize(token)` for REST search.
- [ ] Privacy Nutrition Labels / App Store copy as required by Apple for Music / media access.

---

## 8. Troubleshooting

| Symptom | Likely cause | What to try |
|---------|----------------|-------------|
| Xcode: provisioning profile does not include `…applemusickit` / `…musickit` | Entitlements file claims a key profiles do not carry. | Remove MusicKit keys from entitlements; MusicKit is App Services only. See section 3. |
| Automatic signing cannot create a profile | Same as above, or wrong team / bundle ID. | Fix entitlements first; verify Team and bundle ID. |
| `404` / “Client not found” / `developerTokenRequestFailed` on search | Auto-token path; bundle ID not accepted yet by token service. | Pass developer JWT to `authorize()` and ensure env is loaded; see section 6. |
| `authorize` works but search fails | JWT not in JS bundle or not persisted. | `npx expo start --clear`, rebuild, tap Authorize again; confirm `example/.env.local` exists. |
| “Bundle ID already exists” when creating App ID | ID exists on your team (use existing) or globally (pick a new ID). | Edit existing App ID for MusicKit, or change bundle ID everywhere. |

---

## Related

- [AUTH.md](./AUTH.md) — `authorize`, `AuthStatus`, iOS troubleshooting summary
- [CLI.md](./CLI.md) — `npm run dev-token`
- [PLATFORM_IMPLEMENTATION.md](./PLATFORM_IMPLEMENTATION.md) — native vs REST per method
