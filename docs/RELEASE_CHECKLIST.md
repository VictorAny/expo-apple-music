# Release checklist

Use this before tagging **`1.0.0`** on npm. For scope and deferred items, see [V1_PLAN.md](./V1_PLAN.md) and [APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md).

**Current version:** `0.1.0` (`package.json`)

**Last automated audit:** 2026-05-20 — `npm test` and `npm run build` green; code audit for public API, web platform wiring, 403 mapping, storefront cache, and pagination defaults (see §2 / §5).

**Blocking 1.0.0:** manual device QA (§1, §6), web playback/hooks soak (§2), example app on all three platforms (§1), then CHANGELOG + version bump (§7).

---

## 1. v1.0.0 gate (required)

From [V1_PLAN.md §9](./V1_PLAN.md#9-v10-release-criteria):

- [ ] **Coverage matrix:** every **✅** row in [APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md) works on **iOS + Android** (manual device QA)
- [ ] **Web minimum:** `Auth` + `Catalog.search` + library reads + `History` + basic `Player` playback (Safari + Chrome, subscribed Apple ID)
- [x] **Public API stable:** domain modules only (`Auth`, `Catalog`, `Library`, `History`, `Player`, `Ratings`, `LibraryMutations`, `Recommendations`); no `MusicKit` facade re-exported (`src/index.ts`)
- [ ] **No silent failures:** errors reject as `AppleMusicError`; no empty `data` on HTTP/native failure (audit native + web paths)
- [ ] **Example app:** Auth, Catalog, Library, History, Player exercised on iOS, Android, and web
- [ ] **`APPLE_MUSIC_API.md`:** checkboxes match reality (no aspirational ✅)
- [x] **README + [ATTRIBUTION.md](../ATTRIBUTION.md):** standalone scope; no Lomray compatibility claims (verify parity table after doc sync in §4)

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
- [ ] Bridge payloads match `src/types/*` (spot-check vs iOS + Android + web in browser)
- [x] Data calls via MusicKit JS (not raw unauthenticated `fetch` to `api.music.apple.com`) (`WebAppleMusicRestTransport`)
- [ ] Playback + hooks: Safari + Chrome, 30s+ session (seek, skip, leave player running)
- [ ] **README:** platform parity table includes **Web** column
- [ ] **[AUTH.md](./AUTH.md):** web requires developer JWT; no Android-only `authorize` options on web

### Documented platform gaps (verify README/matrix, do not block 1.0)

- [x] Android **catalog station** queue — ❌ documented (README + [APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md))
- [x] iOS catalog station — ✅; web station queue — ⚠️ documented ([APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md) playback row)
- [x] `checkSubscription` — ⚠️ on Android/web (matrix + AUTH.md)

---

## 3. Optional v1 (defer to 1.x if skipping)

- [ ] `Library.getMusicVideos()` — [APPLE_MUSIC_API.md](./APPLE_MUSIC_API.md) ⬜
- [ ] `Library.search()` — ⬜
- [ ] Catalog batch GET by IDs — 🔜 in [V1_PLAN.md](./V1_PLAN.md)

---

## 4. Documentation sync

- [x] [V1_PLAN.md](./V1_PLAN.md) §2 baseline updated (web ✅, domain API, ~coverage %)
- [x] [README.md](../README.md) parity table: **Web** column; names match public API (`Library.getPlaylists`, `Player.setQueue`, …)
- [x] [WEB_IMPLEMENTATION.md](./WEB_IMPLEMENTATION.md) definition-of-done checkboxes checked where complete (browser QA rows still open)
- [ ] Consumer app: [IOS_SETUP.md](./IOS_SETUP.md) §7 release checklist (portal, entitlements, JWT, Archive)

---

## 5. Tests & CI

- [x] `npm test` passes locally (2026-05-20: 9 suites, 33 tests)
- [x] `npm run build` succeeds (`build/` artifacts for publish) (2026-05-20)
- [ ] Mapper fixtures still aligned (`npm run sync:fixtures` if Android JSON changed)
- [ ] (Optional) Add GitHub Actions: lint + test on PR

---

## 6. Manual QA matrix

| Platform | Environment | Smoke |
|----------|-------------|-------|
| iOS 16+ | Physical device, MusicKit on App ID | `Auth.authorize` → `Catalog.search` → `Library.getSongs` → `History.getRecentlyPlayedTracks` → `Player.setQueue` + transport |
| Android | Physical **ARM**, Apple Music app installed | Same flow with **developer JWT** required |
| Web | Chrome + Safari, `example/.env.local` JWT | Same read flow + playback + hooks 30s+ |

**iOS catalog search:** confirm path with and without developer JWT ([IOS_SETUP.md](./IOS_SETUP.md) §6).

---

## 7. Publish

- [ ] [CHANGELOG.md](../CHANGELOG.md) — Unreleased section filled for this tag
- [ ] Version bump in `package.json` (`1.0.0` or `0.2.0` if shipping pre-1.0 beta)
- [ ] `npm run prepublishOnly` / `npm publish` (dry-run: `npm pack` and inspect tarball)
- [ ] Git tag `v1.0.0` (or chosen version) pushed
- [ ] GitHub release notes (if using GitHub)

---

## 8. Pre-1.0 beta option (`0.2.0`)

If shipping before §1 is fully green:

- [ ] README “Preview” callout: web playback ⚠️, Android stations ❌, optional library APIs deferred
- [ ] Tag `0.2.0` (semver: additive API, no 1.0 stability promise)
- [ ] Plan follow-up issue for Phase 6 → `1.0.0`

---

## Quick commands

```sh
npm test
npm run build
cd example && npx expo start --ios    # device
cd example && npx expo start --android
cd example && npx expo start --web
npm pack   # inspect files field before publish
```
