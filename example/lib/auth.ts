import { AuthStatus } from "@wwdrew/expo-apple-music";

export function isAuthorized(authStatus: string): boolean {
  return authStatus === AuthStatus.AUTHORIZED;
}

export function needsDeveloperToken(platform: string): boolean {
  return platform === "android" || platform === "web";
}
