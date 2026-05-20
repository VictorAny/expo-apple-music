import { MusicItem, Player } from "@wwdrew/expo-apple-music";

export async function queueAndPlay(
  itemId: string,
  type: MusicItem,
  appendLog: (message: string) => void,
): Promise<void> {
  await Player.configurePlayer(false);
  await Player.setQueue(itemId, type);
  Player.play();
  const state = await Player.getCurrentState();
  const track = state.currentSong?.title ?? itemId;
  appendLog(`playing "${track}" — status: ${state.playbackStatus}`);
}
