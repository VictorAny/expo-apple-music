# Attribution

`@wwdrew/expo-apple-music` is its own project. It is **not** a drop-in replacement for any other package and does not aim to preserve third-party API shapes.

## Inspiration

Early exploration and structure were **inspired by** [`@lomray/react-native-apple-music`](https://github.com/Lomray-Software/react-native-apple-music) (Apache-2.0). That project showed one way to wrap Apple Music on React Native; this repo extends the idea toward **full [Apple Music API](https://developer.apple.com/documentation/AppleMusicAPI) coverage** on **iOS, Android, and Web** under Expo.

We are grateful to Lomray Software for publishing their work under Apache-2.0. This package is **not affiliated** with Lomray.

## License

- This repository: [LICENSE](./LICENSE) (Apache-2.0)
- Lomray-derived portions: acknowledged in [NOTICE](./NOTICE)

## Coming from Lomray or `MPMediaLibrary`

There is **no migration guide** and no compatibility layer. Treat this package as a new integration:

- Read [README.md](./README.md) and [docs/AUTH.md](./docs/AUTH.md) for install and auth.
- Read [CONTEXT.md](./CONTEXT.md) for catalog vs library vs history terminology.
- Read [docs/V1_PLAN.md](./docs/V1_PLAN.md) for the public API direction (`Catalog`, `Library`, `History`, `Player`, …).

If you used `@lomray/react-native-apple-music` or `MPMediaQuery`, remap your app to this package’s domain APIs and Apple’s MusicKit / REST model — do not expect matching export names or behavior.
