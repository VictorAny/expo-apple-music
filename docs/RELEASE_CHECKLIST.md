# Release checklist

Use this before tagging **`1.0.0`** on npm. For scope and deferred items, see [V1_PLAN.md](./V1_PLAN.md) and [APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md).

**Current version:** `1.0.0` (`package.json`)

**Last automated audit:** 2026-05-21 — `npm test` (14 suites, 58 tests), `npm run build`, and `npm run pack:check` green; CI in `.github/workflows/ci.yml`.

**Blocking publish:** complete [QA_SIGNOFF.md](./QA_SIGNOFF.md) on iOS, Android, and web, then `npm publish` + git tag (§7).

---

## 1. v1.0.0 gate (required)

From [V1_PLAN.md §9](./V1_PLAN.md#9-v10-release-criteria):

- [ ] **Coverage matrix:** every **✅** row in [APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md) works on **iOS + Android** — sign [QA_SIGNOFF.md](./QA_SIGNOFF.md)
- [ ] **Web minimum:** `Auth` + `Catalog.search` + library reads + `History` + basic `Player` playback (Safari + Chrome) — sign [QA_SIGNOFF.md](./QA_SIGNOFF.md)
- [x] **Public API stable:** domain modules only (`Auth`, `Catalog`, `Library`, `History`, `Player`, `Ratings`, `LibraryMutations`, `Recommendations`); no `MusicKit` facade re-exported (`src/index.ts`)
- [x] **No silent failures:** audit in [SILENT_FAILURE_AUDIT.md](./SILENT_FAILURE_AUDIT.md); forced-error spot-check in [QA_SIGNOFF.md](./QA_SIGNOFF.md)
- [ ] **Example app:** Auth, Catalog, Library, History, Player exercised on iOS, Android, and web — sign [QA_SIGNOFF.md](./QA_SIGNOFF.md)
- [x] **`APPLE_MUSIC_API.md`:** checkboxes match implemented API (⬜ = deferred optional v1, not aspirational ✅)
- [x] **README + [ATTRIBUTION.md](../ATTRIBUTION.md):** standalone scope; parity table includes Web column

---

## 2. Phase 6 — hardening

- [x] **Error normalization audit** — map 403 → `permissionDenied` (iOS `AppleMusicRestClient`, Android `AppleMusicRestTransport`, web `WebAppleMusicRestTransport`); spot-check subscription/token paths on device
- [x] **Storefront cache** — in-memory cache (`storefront-rest-client.ts`, iOS `AuthenticatedSession`); verify no redundant calls in network trace during QA
- [x] **Pagination defaults** — `DEFAULT_PAGINATION_LIMIT` / `OFFSET` = 25 / 0 (`src/api/pagination.ts`); JSDoc on `PaginationOptions`
- [x] **`Auth.checkSubscription()`** — Android/web inference in [AUTH.md](./AUTH.md); README parity table notes ⚠️
- [x] **`Player.configurePlayer()`** — JSDoc on module; README parity row ⚠️ (no false parity claims)

### Web ([WEB_IMPLEMENTATION.md](./WEB_IMPLEMENTATION.md) definition of done)

- [x] `"web"` in `expo-module.config.json`; Metro resolves web module (`src/native-module.web.ts`)
- [x] No bridge method throws `UNSUPPORTED_PLATFORM` except documented ❌ (grep: only constants in `native-module*.ts`)
- [x] Bridge payloads match `src/types/*` — fixture tests (`npm test` → `bridge-contract.test.ts`); browser spot-check in [QA_SIGNOFF.md](./QA_SIGNOFF.md)
- [x] Data calls via MusicKit JS (not raw unauthenticated `fetch` to `api.music.apple.com`) (`WebAppleMusicRestTransport`)
- [ ] Playback + hooks: Safari + Chrome, 30s+ session (seek, skip, leave player running) — [QA_SIGNOFF.md](./QA_SIGNOFF.md)
- [x] **README:** platform parity table includes **Web** column
- [x] **[AUTH.md](./AUTH.md):** web requires developer JWT; no Android-only `authorize` options on web

### Documented platform gaps (verify README/matrix, do not block 1.0)

- [x] Android **catalog station** queue — ❌ documented (README + [APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md))
- [x] iOS catalog station — ✅; web station queue — ⚠️ documented ([APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md) playback row)
- [x] `checkSubscription` — ⚠️ on Android/web (matrix + AUTH.md)

---

## 3. Optional v1 (implemented in 1.0.0)

- [x] `Library.getMusicVideos()` — [APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md)
- [x] `Library.search()` — [APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md)
- [x] `Catalog.getByIds(type, ids)` — batch catalog GET via REST on all platforms

---

## 4. Documentation sync

- [x] [V1_PLAN.md](./V1_PLAN.md) §2 baseline updated (web ✅, domain API, ~coverage %)
- [x] [README.md](../README.md) parity table: **Web** column; names match public API (`Library.getPlaylists`, `Player.setQueue`, …)
- [x] [WEB_IMPLEMENTATION.md](./WEB_IMPLEMENTATION.md) definition-of-done checkboxes checked where complete (browser QA rows still open)
- [ ] Consumer app: [IOS_SETUP.md](./IOS_SETUP.md) §7 release checklist (portal, entitlements, Archive) — **your** App Store app, not this package
- [ ] Consumer app: developer JWT signing/rotation documented and implemented per [AUTH.md § Production apps](./AUTH.md#production-apps-your-responsibility--not-this-library) — **not** provided by this package

---

## 5. Tests & CI

- [x] `npm test` passes locally (2026-05-20: 10 suites, 36 tests)
- [x] `npm run build` succeeds (`build/` artifacts for publish) (2026-05-20)
- [x] Mapper fixtures aligned (`npm run sync:fixtures`)
- [x] GitHub Actions: lint + test on PR (`.github/workflows/ci.yml`)

---

## 6. Manual QA matrix

Use [QA_SIGNOFF.md](./QA_SIGNOFF.md) (consolidated checklist).

| Platform | Environment | Smoke |
|----------|-------------|-------|
| iOS 16.4+ | Physical device, MusicKit on App ID | `Auth.authorize` → `Catalog.search` → `Library.getSongs` → `History.getRecentlyPlayedTracks` → `Player.setQueue` + transport |
| Android | Physical **ARM**, Apple Music app installed | Same flow with **developer JWT** required |
| Web | Chrome + Safari, `example/.env.local` JWT | Same read flow + playback + hooks 30s+ |

**iOS catalog search:** confirm path with and without developer JWT ([IOS_SETUP.md](./IOS_SETUP.md) §6).

---

## 7. Publish

- [x] [CHANGELOG.md](../CHANGELOG.md) — 1.0.0 section filled
- [x] Version bump in `package.json` (`1.0.0`)
- [ ] `npm run pack:check` then `npm publish` (tarball excludes `example/`, `docs/`, `src/`, `android/build/` — see [RELEASING.md](./RELEASING.md))
- [ ] Git tag `v1.0.0` pushed
- [ ] GitHub release notes (if using GitHub)

---

## 8. Pre-1.0 beta option (`0.2.0`)

Skipped — shipping **1.0.0** after [QA_SIGNOFF.md](./QA_SIGNOFF.md).

---

## Quick commands

```sh
npm test
npm run build
npm run pack:check
cd example && npx expo start --ios    # device
cd example && npx expo start --android
cd example && npx expo start --web
```

Release automation (when QA is done): enable [RELEASING.md](./RELEASING.md) / `.github/workflows/release-please.yml`.
