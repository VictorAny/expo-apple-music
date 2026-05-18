# Authentication (`Auth`)

How `Auth.authorize()` and `Auth.checkSubscription()` work on **iOS** and **Android**, including developer tokens, return values, and device requirements.

## Quick start

```ts
import { Auth, AuthStatus } from '@wwdrew/expo-apple-music';

// iOS — developer token argument is ignored
const status = await Auth.authorize();

// Android — pass a MusicKit developer JWT from your backend or dev tooling
const status = await Auth.authorize(developerToken, {
  hideStartScreen: false,
  startScreenMessage: '<b>My App</b> wants to connect to Apple Music.',
});

if (status === AuthStatus.AUTHORIZED) {
  const sub = await Auth.checkSubscription(); // iOS only today
}
```

---

## `Auth.authorize(developerToken?, options?)`

Requests access to the user’s Apple Music account.

| Argument | iOS | Android |
| -------- | --- | ------- |
| `developerToken` | Ignored | **Required** — pass a MusicKit developer JWT |
| `options` | Ignored | Optional upsell / deeplink behavior |

Returns `Promise<AuthStatus>` — same string union on both platforms.

### Platform requirements

#### iOS

- **Expo SDK 55**, **iOS 16+**
- Config plugin with `musicUsageDescription` (sets `NSAppleMusicUsageDescription`)
- **MusicKit** enabled on your App ID in the [Apple Developer portal](https://developer.apple.com) (not added by this plugin)
- User can respond to the system media-library permission prompt

There is no separate “is Apple Music installed?” check on iOS — MusicKit is part of the OS.

#### Android

- **Apple Music** app installed (`com.apple.android.music`)
- User signed into an **Apple ID** in the Apple Music app
- An active **Apple Music subscription** (or trial) is usually required to complete auth; without it the SDK may return `restricted`
- A valid **MusicKit developer JWT** (see [Developer token](#developer-token-android))
- **Rebuild after native changes**: `npx expo prebuild` when changing the config plugin or module

The module’s Android library manifest declares `<queries>` for `com.apple.android.music` (merged into your app on build). Required for MusicKit install detection on Android 11+.

### Auth flow (Android)

1. Your app calls `Auth.authorize(developerToken, options?)`.
2. The MusicKit Authentication SDK may show a **connect / upsell** screen (unless `hideStartScreen: true`).
3. The user is sent to the **Apple Music** app to approve access.
4. Apple Music returns via deeplink; the module maps the SDK result to `AuthStatus`.
5. The **developer JWT** passed to `authorize()` is saved in app-private native storage (for playback and REST). On `authorized`, the **music user token** is saved there too (not yet exposed to JavaScript).

There is **no web-based login** on Android native MusicKit — only the Apple Music app or Play Store install flow.

### Android-only options

```ts
type AndroidAuthorizeOptions = {
  /** Default `false` — show Apple’s connect screen before opening Apple Music. */
  hideStartScreen?: boolean;
  /** HTML allowed (Apple `setStartScreenMessage`). Ignored when `hideStartScreen` is true. */
  startScreenMessage?: string;
};
```

---

## Developer token (Android)

A **developer token** is a **signed JWT** you create with your MusicKit **private key** from the Apple Developer portal. It identifies **your app** to Apple’s services.

| | Developer JWT | Music user token |
| - | ------------- | ---------------- |
| **What** | App credentials | Per-user token after sign-in |
| **Who creates it** | Your server (or dev tooling) | Returned by `authorize()` on success |
| **Used for** | Starting Android auth; catalog REST | Library REST (`/v1/me/...`) |
| **Passed to** | `Auth.authorize(token)` or config plugin | Stored natively on Android after `authorized` |

**iOS `authorize()` does not take a developer token** — the first argument is ignored on iOS.

### Providing the token

**Runtime (production and apps)**

```ts
const token = await fetchDeveloperTokenFromYourBackend();
await Auth.authorize(token);
```

**Repo CLI (local dev / example app only)**

See **[docs/CLI.md](./CLI.md)** for setup (`.env.music`), generating tokens, and `--verify` to test a JWT without the Apple Music app.

Quick start:

```sh
cp .env.music.example .env.music   # add Team ID, Key ID, .p8 path
npm run dev-token -- --write-env example/.env.local
npm run dev-token -- --verify "$(grep EXPO_PUBLIC example/.env.local | cut -d= -f2-)"
```

`Auth.authorize()` does **not** validate the developer JWT before opening Apple Music — use the CLI `--verify` flag or complete the in-app flow and check for `authorized`.

### Missing or invalid token

| Situation | Result |
| --------- | ------ |
| No token passed to `authorize()` | Promise **rejects** with `MISSING_DEVELOPER_TOKEN` |
| Invalid / expired JWT | `AuthStatus.UNKNOWN` (`TOKEN_FETCH_ERROR` from SDK) |

Developer tokens expire (typically on the order of months, per your Apple key settings). Refresh from your backend before calling `authorize()`.

Apple’s reference: [Creating a developer token](https://developer.apple.com/documentation/applemusicapi/generating_developer_tokens) and [Android MusicKit](https://developer.apple.com/documentation/musickit/android).

---

## `AuthStatus` return values

Same values on **iOS** and **Android**. Import `AuthStatus` for constants.

| Value | Meaning | Typical cause |
| ----- | ------- | ------------- |
| `authorized` | User completed auth; Android music user token stored natively | Success |
| `denied` | User did not complete auth (dismissed upsell, cancelled in Apple Music, declined iOS prompt) | User action |
| `notDetermined` | Permission not requested yet | iOS before first `authorize()` |
| `restricted` | Account cannot use Apple Music for this flow | Android: no/expired subscription; iOS: parental / device restrictions |
| `unknown` | Error or unrecognized SDK result | Bad developer token, `TOKEN_FETCH_ERROR`, unexpected SDK state |

### Mapping notes (Android)

The MusicKit Authentication SDK uses its own error codes; this module normalizes them to match iOS:

| SDK signal | `AuthStatus` |
| ---------- | ------------ |
| `USER_CANCELLED`, upsell close, Apple Music cancel, empty token | `denied` |
| `NO_SUBSCRIPTION`, `SUBSCRIPTION_EXPIRED` | `restricted` |
| `TOKEN_FETCH_ERROR` | `unknown` |
| Intent with no token/error extras (`UNKNOWN`) | `denied` (user-backed-out) |

**There is no separate `cancelled` status** — user dismissal is always `denied`, matching iOS `SKCloudServiceController` behavior.

### Recommended handling

```ts
import { Auth, AuthStatus } from '@wwdrew/expo-apple-music';

const status = await Auth.authorize(developerToken);

switch (status) {
  case AuthStatus.AUTHORIZED:
    break;
  case AuthStatus.DENIED:
    // User closed upsell or Apple Music, or declined iOS prompt
    break;
  case AuthStatus.RESTRICTED:
    // Offer Apple Music subscription / trial
    break;
  case AuthStatus.NOT_DETERMINED:
    // iOS: call authorize() again when appropriate
    break;
  case AuthStatus.UNKNOWN:
    // Log; retry with fresh developer token on Android
    break;
}
```

---

## `Auth.checkSubscription()`

**iOS only** today. Calls `MusicSubscription.current` and returns:

| Field | Meaning |
| ----- | ------- |
| `canPlayCatalogContent` | User can play catalog with a music player |
| `canBecomeSubscriber` | User can be offered a subscription |
| `hasCloudLibraryEnabled` | Cloud library modifications allowed |
| `isMusicCatalogSubscriptionEligible` | Same as `canBecomeSubscriber` (compat) |

On **Android**, the call rejects with `UNSUPPORTED_PLATFORM` until tier 1.

Typical flow after auth on iOS:

```ts
if (status !== AuthStatus.AUTHORIZED) return;

const sub = await Auth.checkSubscription();
if (!sub.canPlayCatalogContent) {
  // Prompt subscription / trial
}
```

There is **no** `Auth.isAvailable()` — use `authorize()` + `checkSubscription()` (iOS) instead.

---

## Config plugin reference

```ts
type ExpoAppleMusicPluginProps = {
  /** iOS — NSAppleMusicUsageDescription */
  musicUsageDescription?: string;
};
```

---

## Related

- [README.md](../README.md) — install
- [CONTEXT.md](../CONTEXT.md) — catalog vs library, Android tiers
- [MIGRATION.md](../MIGRATION.md) — Lomray migration
