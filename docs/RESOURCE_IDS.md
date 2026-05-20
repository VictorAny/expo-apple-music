# Resource IDs (catalog vs library)

Apple uses **different identifiers** for catalog store resources vs items in the user’s library. The JS API passes IDs through as strings; native code must not mangle them.

## Prefixes (library)

| Prefix | Typical resource |
|--------|------------------|
| `i.` | Library song |
| `l.` | Library album (less common in docs; also seen for other library types) |
| `p.` | Library playlist |

Helper: `isLibraryItem(id)` in TypeScript (`src/utils/is-library-item.ts`), `isLibraryId` in `src/api/library-ids.ts`, and `LibraryIds.isLibraryId` on Android.

Numeric-only IDs (e.g. `1441164424`) are usually **catalog** storefront IDs.

## Catalog playback id (`Song.id` / queue)

For **songs** and **music videos**, the bridge `id` field prefers the **catalog playback id** when Apple provides it in `attributes.playParams` (`id` or `catalogId`). That matches Android `AppleMusicJsonMapper.catalogPlaybackId` and iOS `RestJsonMapper` / `MusicItemMapper.catalogPlaybackId(from:)`.

- **Catalog search / get-by-id:** id is the storefront catalog id.
- **Library songs:** bridge `id` may be catalog id (if `playParameters` present) or library id (`i.…`) — same on REST and native when mappers are aligned.
- **Playback:** `Player.setQueue` and library play helpers accept catalog or library ids per platform queue rules.

## Ratings paths

Ratings REST paths use separate segments for catalog vs library, e.g.:

- `songs` vs `library-songs`
- `albums` vs `library-albums`

See `RatingResourceType` in `src/types/rating.ts`.
