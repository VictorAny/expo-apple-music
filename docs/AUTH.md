# Authentication (`Auth`)

How `Auth.authorize()` and `Auth.checkSubscription()` work on **iOS**, **Android**, and **web**, including developer tokens, return values, and device requirements.

## Quick start

```ts
import { Auth, AuthStatus } from '@wwdrew/expo-apple-music';

// developerToken: optional on iOS (but recommended for Catalog.search); required on Android / web
const status = await Auth.authorize(developerToken, {
  hideStartScreen: false,
  startScreenMessage: '<b>My App</b> wants to connect to Apple Music.',
});

if (status === AuthStatus.AUTHORIZED) {
  const sub = await Auth.checkSubscription();
}
```

iOS portal, signing, entitlements, JWT, and release: **[IOS_SETUP.md](./IOS_SETUP.md)**.

---

## `Auth.authorize(developerToken?, options?)`

Requests access to the user’s Apple Music account.

| Argument | iOS | Android | Web |
| -------- | --- | ------- | --- |
| `developerToken` | Optional — when provided, stored for REST; **catalog search uses REST** (skips MusicKit auto-token); music user token fetched when authorized | **Required** — pass a MusicKit developer JWT | **Required** — same as Android |
| `options` | Ignored | Optional upsell / deeplink behavior | Ignored |

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

### Web

- **MusicKit JS v3** loaded on first `authorize()` (hosted script from Apple)
- **Developer JWT required** — same as Android; reject with `MISSING_DEVELOPER_TOKEN` if missing
- User signs in through MusicKit’s browser authorize UI (popup to `authorize.music.apple.com`; allow popups for your origin)
- Success is determined from **`music.isAuthorized`** after `music.authorize()` — the SDK return value is often a user token string, not a status label
- **Apple Developer portal:** enable **MusicKit** on your App ID ([Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources) → **Identifiers** → your App ID → **App Services** → MusicKit). There is **no** separate “add web domain” screen like Sign in with Apple — see [Web origin (optional JWT claim)](#web-origin-optional-jwt-claim) below.
- `options` (`hideStartScreen`, `startScreenMessage`) are **ignored** on web
- `checkSubscription()` uses REST inference (library probe), not `MusicSubscription.current`

See [WEB_IMPLEMENTATION.md](./WEB_IMPLEMENTATION.md).

#### Web origin (optional JWT claim)

For production web apps, Apple recommends an optional **`origin`** claim in the developer JWT — an array of allowed browser origins (full URL including scheme and port):

```json
"origin": ["https://music.example.com", "http://localhost:8081"]
```

When present, Apple rejects requests whose `Origin` header does not match a listed value. This is **not** configured in the Developer portal; you add it when signing the JWT ([Generating Developer Tokens](https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens)).

| Token | Behavior |
| ----- | -------- |
| **No `origin` claim** (default from `npm run dev-token`) | Works from any origin — simplest for local dev |
| **With `origin` claim** | Must match the exact URL in the browser (e.g. `http://localhost:8081`, not `8080`) |

Mint a localhost token with the repo CLI:

```sh
npm run dev-token -- --origin http://localhost:8081 --write-env example/.env.local
```

**Local dev checklist:** use the exact origin Expo prints, allow popups, use a normal (non-private) browser window, and ensure the account has an Apple Music subscription. If auth still fails on localhost, see [CLI.md](./CLI.md) (tunnel fallback).

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

## Developer token (MusicKit JWT)

A **developer token** is a **signed JWT** you create with your MusicKit **private key** from the Apple Developer portal. It identifies **your app** to Apple’s services.

| | Developer JWT | Music user token |
| - | ------------- | ---------------- |
| **What** | App credentials | Per-user token after sign-in |
| **Who creates it** | Your server (or dev tooling) | Returned by `authorize()` on success |
| **Used for** | Starting Android auth; catalog REST | Library REST (`/v1/me/...`) |
| **Passed to** | `Auth.authorize(token)` or config plugin | Stored natively on Android after `authorized` |

On **iOS**, the developer token is optional for `authorize()` (media-library permission still works without it). When provided, it is stored for REST and **catalog search** uses the Apple Music API with that JWT instead of MusicKit auto-token (useful when provisioning does not yet include MusicKit).

### Native session (iOS / Android)

After `authorize()`, native code reads an **`AuthenticatedSession`** snapshot (developer JWT, music user token, and transport flags) instead of querying storage ad hoc. `MusicKitAuthStorage` only persists tokens; REST (`AppleMusicRestTransport` / domain `*RestClient`s), catalog search transport, and storefront resolution use the session. Storefront id is cached in memory until tokens change.

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

**iOS** calls `MusicSubscription.current` and returns:

| Field | Meaning |
| ----- | ------- |
| `canPlayCatalogContent` | User can play catalog with a music player |
| `canBecomeSubscriber` | User can be offered a subscription |
| `hasCloudLibraryEnabled` | Cloud library modifications allowed |
| `isMusicCatalogSubscriptionEligible` | Same as `canBecomeSubscriber` (compat) |

On **Android and web**, the call returns best-effort flags inferred from authorization + library access (see [WEB_IMPLEMENTATION.md](./WEB_IMPLEMENTATION.md#checksubscription-on-web)).

Typical flow after auth:

```ts
if (status !== AuthStatus.AUTHORIZED) return;

const sub = await Auth.checkSubscription();
if (!sub.canPlayCatalogContent) {
  // Prompt subscription / trial
}
```

There is **no** `Auth.isAvailable()` — use `authorize()` + `checkSubscription()` (iOS) instead.

---

## iOS troubleshooting (MusicKit / signing)

**Full walkthrough:** **[IOS_SETUP.md](./IOS_SETUP.md)** (portal, entitlements mistakes, signing, developer JWT, release checklist).

Short version: MusicKit is an **App Service** on your App ID — not a MusicKit row in Xcode Capabilities and **not** an entitlement you expect inside the provisioning profile ([Apple DTS](https://developer.apple.com/forums/thread/799000)). Do **not** add `com.apple.developer.applemusickit` / `musickit` to entitlements; that breaks automatic signing. For reliable `Catalog.search`, pass a developer JWT from your backend or [CLI.md](./CLI.md) and call `Auth.authorize(token)` so catalog uses REST.

| Symptom | What to do |
| ------- | ---------- |
| Xcode: profile missing `applemusickit` / `musickit` | Remove those keys from entitlements — see **Entitlements** in [IOS_SETUP.md](./IOS_SETUP.md). |
| Catalog search `404` / “Client not found” | Pass developer JWT + `authorize()`; restart Metro after `.env.local` — see **Developer JWT** in [IOS_SETUP.md](./IOS_SETUP.md). |
| Profile “won’t create” after adding MusicKit to entitlements | Remove bogus entitlement keys; MusicKit is not provisioned that way. |

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
- [IOS_SETUP.md](./IOS_SETUP.md) — **iOS**: signing, Apple Developer portal, JWT, release checklist
- [CONTEXT.md](../CONTEXT.md) — catalog vs library, Android tiers
- [ATTRIBUTION.md](../ATTRIBUTION.md) — inspiration and license (no migration guide)
