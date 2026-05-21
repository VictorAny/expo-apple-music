export function requireMusicToken(
  musicUserToken: string | undefined,
  appendLog: (message: string) => void,
): musicUserToken is string {
  if (!musicUserToken?.trim()) {
    appendLog("Connect Apple Music first (authorize)");
    return false;
  }
  return true;
}
