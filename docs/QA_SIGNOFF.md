# Manual QA sign-off (1.0.0)

One session per platform. Use the **example** app (`cd example && npx expo start`). Developer JWT in `example/.env.local` (`npm run dev-token -- --write-env example/.env.local`).

Check each box, note device/browser + date, then tag `v1.0.0`.

---

## iOS (physical device, iOS 16+, MusicKit on App ID)

- [ ] `Auth.authorize(developerToken)` → `authorized`
- [ ] `Catalog.search` (native MusicKit path when App ID registered)
- [ ] Tap search result → `Player.setQueue` + `play` (catalog song)
- [ ] `Library.getSongs` → play a library song
- [ ] `History.getRecentlyPlayedTracks` → play a recent track
- [ ] Transport: pause, resume, skip (if queue has entries)
- [ ] No spurious `[PlaybackController]` 404 logs during playback
- [ ] (Optional) `Catalog.search` **without** JWT — native path; or REST fallback after `authorize(developerToken)`
- [ ] (Optional) `Auth.refreshDeveloperToken(developerToken)` — no user re-auth UI

**Signed:** _______________ **Date:** _______________

---

## Android (physical ARM, Apple Music app installed)

- [ ] `Auth.authorize(developerToken)` → `authorized`
- [ ] `Catalog.search` → queue + play catalog song
- [ ] `Library.getSongs` → play library song
- [ ] `History.getRecentlyPlayedTracks`
- [ ] Transport: pause, play, skip
- [ ] Station queue fails with clear error (expected ❌)

**Signed:** _______________ **Date:** _______________

---

## Web (Chrome + Safari, subscribed Apple ID)

- [ ] `Auth.authorize(developerToken)` (popups allowed for origin)
- [ ] `Catalog.search` → results render
- [ ] `Library.getPlaylists` / `getSongs`
- [ ] `History.getRecentlyPlayedTracks`
- [ ] Catalog song: queue + play
- [ ] Hooks: `usePlaybackState` / `useCurrentSong` update for **30s+** (seek or skip once)
- [ ] Repeat in second browser if first was Chrome-only

**Signed:** _______________ **Date:** _______________

---

## Publish (after all three signed)

```sh
npm test && npm run build
npm pack   # inspect tarball
npm publish
git tag v1.0.0 && git push origin v1.0.0
```

See [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) §7.
