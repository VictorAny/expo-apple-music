# Recommendations & Replay

Personalized content via `Recommendations.*`. For listening history and heavy rotation, use **`History.*`** ([HISTORY.md](./HISTORY.md)).

## Methods

| Method | Endpoint / source | Notes |
|--------|-------------------|--------|
| `Recommendations.get()` | `GET /v1/me/recommendations` (Android); **MusicKit** `MusicPersonalRecommendationsRequest` (iOS) | Omit `ids` for all recommendations. Pass `ids` for specific `personal-recommendation` resources (REST on both). |
| `Recommendations.getReplay({ year? })` | `GET /v1/me/music-summaries` | Latest eligible year when `year` omitted. Requires enough listening history; may error if ineligible. |

## Heavy rotation

**Not** part of `Recommendations` — use `History.getHeavyRotation()`. Same personalization domain but a different Apple endpoint; may return `[]` intermittently ([HISTORY.md](./HISTORY.md)).

## Auth

Requires an authorized user. REST paths need a **music user token**; iOS REST (Replay, `get({ ids })`) also needs a **developer JWT** stored at `authorize()` time ([AUTH.md](./AUTH.md)).

## Types

- `Recommendation` — title, `resourceTypes`, and nested `playlists` / `albums` / `stations` from recommendation contents.
- `ReplaySummary` — `topSongs`, `topAlbums`, `topArtists` when Apple includes those relationships in the summary resource.
