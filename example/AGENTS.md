# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## API errors in the example app

Bridge rejections are `AppleMusicError` objects (also `instanceof Error` after `callNative`). Never log them with `String(error)` — use `formatApiError` from `example/lib/format-error.ts` (or `getErrorMessage` from the package).
