import {
  useCurrentSong,
  useIsPlaying,
  usePlaybackState,
} from "@wwdrew/expo-apple-music";
import { StyleSheet, Text, View } from "react-native";
import { ApiScreen } from "../components/ApiScreen";
import { theme } from "../lib/theme";

function HookValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function UseCurrentSongDemo() {
  const { song } = useCurrentSong();
  return (
    <ApiScreen
      hint="Values update when you queue playback. The player bar uses this hook too."
      headerExtra={
        <>
          <HookValue
            label="song"
            value={song ? `${song.title} — ${song.artistName}` : "(none)"}
          />
          {song ? <HookValue label="id" value={song.id} /> : null}
        </>
      }
    />
  );
}

export function UseIsPlayingDemo() {
  const { isPlaying } = useIsPlaying();
  return (
    <ApiScreen headerExtra={<HookValue label="isPlaying" value={String(isPlaying)} />} />
  );
}

export function UsePlaybackStateDemo() {
  const { playbackStatus, playbackTime } = usePlaybackState();
  return (
    <ApiScreen
      headerExtra={
        <>
          <HookValue label="playbackStatus" value={playbackStatus} />
          <HookValue label="playbackTime" value={`${playbackTime.toFixed(1)}s`} />
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  label: {
    fontFamily: theme.mono,
    fontSize: 12,
    color: theme.accent,
    marginBottom: 4,
  },
  value: { fontSize: 14, color: theme.text },
});
