# CLI tools (repo development)

Command-line helpers for **local development** of this package. They are **not** published to npm — clone the repo and run them from the repository root.

| Script | Command | Purpose |
| ------ | ------- | ------- |
| Developer JWT | `npm run dev-token` | Sign or verify MusicKit **developer** tokens (`Auth.authorize` on every platform) |

Implementation: [`scripts/generate-developer-token.mjs`](../scripts/generate-developer-token.mjs)

---

## iOS (`Catalog.search` and local dev)

On **iOS**, a developer JWT is optional for `Auth.authorize()` (media library permission can succeed without it). For **reliable** `Catalog.search`, pass a JWT minted with this CLI — the module uses REST catalog search when a token is stored. See [docs/IOS_SETUP.md](./IOS_SETUP.md).

---

## Prerequisites

1. **MusicKit key** in [Apple Developer](https://developer.apple.com/account/resources/authkeys/list) → Keys → create a key with **MusicKit** enabled.
2. Download **`AuthKey_XXXXXXXXXX.p8`** once (cannot be re-downloaded).
3. Note your **Team ID** (issuer) and **Key ID** (`kid`).

Enable **MusicKit** on your App ID if you have not already. The CLI does not configure Apple Developer for you.

---

## One-time setup

```sh
cp .env.music.example .env.music
```

Edit `.env.music` (gitignored):

```env
APPLE_MUSIC_TEAM_ID=YOUR_TEAM_ID
APPLE_MUSIC_KEY_ID=YOUR_KEY_ID
APPLE_MUSIC_PRIVATE_KEY_PATH=./AuthKey_XXXXXXXXXX.p8
```

Place the `.p8` file at the path above. **Never commit** `.p8` files or long-lived JWTs (see `.gitignore`).

---

## Generate a developer token

Print a JWT to stdout (default lifetime **1 day**):

```sh
npm run dev-token
```

### Generate options

| Flag | Description |
| ---- | ----------- |
| `--team-id <id>` | Team ID (`iss` claim). Overrides `APPLE_MUSIC_TEAM_ID`. |
| `--key-id <id>` | Key ID (`kid` header). Overrides `APPLE_MUSIC_KEY_ID`. |
| `--private-key <path>` | Path to `.p8` file. Overrides `APPLE_MUSIC_PRIVATE_KEY_PATH`. |
| `--expires-in <duration>` | Lifetime: `30m`, `12h`, `1d`, etc. Default `1d`. Max ~6 months (Apple limit). |
| `--write-env <path>` | Write `EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=…` to a file. |

Credentials are read from **flags** or **`.env.music`** in the repo root (loaded automatically).

### Example app workflow

```sh
# 1. Mint token into the example env file
npm run dev-token -- --write-env example/.env.local

# 2. Restart Metro so Expo picks up the new env
cd example && npx expo start --clear

# 3. Run the native app and tap Authorize
cd example && npx expo run:ios
# or
cd example && npx expo run:android
```

The example reads `process.env.EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN` and passes it to `Auth.authorize(token)`. On **iOS**, that enables REST catalog search; on **Android** it is required.

### Override credentials without editing `.env.music`

```sh
APPLE_MUSIC_TEAM_ID=… APPLE_MUSIC_KEY_ID=… APPLE_MUSIC_PRIVATE_KEY_PATH=./AuthKey.p8 npm run dev-token
```

---

## Verify a developer token

`Auth.authorize()` does **not** validate the JWT before opening Apple Music. Use **`--verify`** to check a token against Apple’s API **without a device**:

```sh
npm run dev-token -- --verify "<your-jwt>"
```

Verify token from the example env file:

```sh
npm run dev-token -- --verify "$(grep '^EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=' example/.env.local | cut -d= -f2-)"
```

### Verify options

| Flag | Description |
| ---- | ----------- |
| `--verify <jwt>` | Required. The token to check. |
| `--storefront <code>` | Catalog storefront for the test request. Default `us`. |

### What verify does

1. **Decode** the JWT header and payload (`alg`, `kid`, `iss`, `iat`, `exp`).
2. **Warn** if expired, wrong algorithm, or missing claims.
3. **Request** `GET /v1/catalog/{storefront}/search?term=test&types=songs&limit=1` with `Authorization: Bearer <jwt>`.

| API result | Meaning |
| ---------- | ------- |
| HTTP **200** | Developer JWT is valid for Apple Music API (signature, team, key, expiry). |
| HTTP **401** / **403** | Rejected — wrong key, team ID, expired token, or malformed JWT. |
| Decode error | Not a JWT (e.g. a random string). |

A successful verify does **not** guarantee `Auth.authorize()` returns `authorized` — you still need the user to complete the Apple Music app flow (sign-in, subscription, approval). It only confirms the **developer token** is correct.

---

## Help

```sh
npm run dev-token -- --help
# or
node scripts/generate-developer-token.mjs --help
```

---

## Security

| Do | Don’t |
| -- | ----- |
| Keep `.p8` and `.env.music` local and gitignored | Commit private keys or production tokens |
| Use short `--expires-in` for dev tokens | Ship JWTs in app binaries |
| Sign tokens on your **backend** in production | Rely on this CLI in released apps |

---

## Troubleshooting

| Problem | What to try |
| ------- | ------------- |
| `Missing credentials` | Create `.env.music` from `.env.music.example` or pass `--team-id`, `--key-id`, `--private-key`. |
| `Could not read private key` | Check `APPLE_MUSIC_PRIVATE_KEY_PATH` points at your `.p8` file. |
| Verify HTTP 401 | Regenerate with `npm run dev-token`; confirm Team ID and Key ID match the `.p8` key. |
| Example Authorize disabled | Set `EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN` in `example/.env.local` and restart Metro. |
| Authorize opens Apple Music but never `authorized` | Token may still be fine — verify with `--verify`; complete approval in Apple Music with an active subscription. |
| `MISSING_DEVELOPER_TOKEN` in app | Pass a non-empty string to `Auth.authorize(developerToken)` on Android. |

---

## Related

- [AUTH.md](./AUTH.md) — `Auth.authorize()`, `AuthStatus`, Android auth flow
- [README.md](../README.md) — install and usage
