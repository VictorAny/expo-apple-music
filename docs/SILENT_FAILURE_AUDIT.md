# Silent-failure audit (1.0.0)

Audit date: 2026-05-20. Gate: [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) §1 “No silent failures”.

## Policy

Bridge methods must **reject** with `AppleMusicError` (`code`, `message`, optional `operation`) on auth, HTTP, and native failures. Empty arrays/objects are allowed only when the Apple API returns a successful empty result.

## Findings

| Area | Behavior | Verdict |
|------|----------|---------|
| TypeScript `callNative` | Wraps native errors via `normalizeNativeError` | ✅ |
| iOS `AppleMusicRestClient` | Non-2xx → `RestError.apiError`; missing tokens → throw | ✅ |
| Android `AppleMusicRestTransport` | Non-2xx → `AppleMusicErrors` | ✅ |
| Web `WebAppleMusicRestTransport` | Errors propagate to `callNative` | ✅ |
| `Ratings.getRating` | HTTP 404 → `null` (no rating yet) | ✅ intentional |
| iOS `getDataArray` | Missing `data` key on **successful** JSON → `[]` | ✅ empty collection |
| iOS `restCatalogSongResource` | Used only for queue id resolution fallback; failure → `nil` then `itemNotFound` | ✅ |
| PlaybackController metadata | Queue entry mapped first; catalog fetch is fallback only | ✅ |

## Spot-check before publish

On each platform, force a failure (revoke auth, bad JWT, airplane mode) and confirm the promise **rejects** with a readable `message`, not an empty `songs` / `playlists` array.

## Related

- [BRIDGE_CONTRACT.md](./BRIDGE_CONTRACT.md) — fixture parity tests (`npm test`)
- `getErrorMessage()` — format errors in app UI
