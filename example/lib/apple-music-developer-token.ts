/**
 * Example: supply a developer JWT without baking rotation into the library.
 * Production: return a token from Remote Config, your API, or a Cloud Function.
 */
export async function fetchExampleDeveloperToken(): Promise<string> {
  const url = process.env.EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN_URL?.trim();
  if (url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Developer token URL failed: ${res.status}`);
    }
    const body = (await res.json()) as { token?: string };
    const token = body.token?.trim();
    if (token) {
      return token;
    }
    throw new Error("Developer token URL response missing `token` field");
  }

  const env = process.env.EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN?.trim();
  if (env) {
    return env;
  }

  throw new Error(
    "Set EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN or EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN_URL. See docs/CLI.md.",
  );
}
