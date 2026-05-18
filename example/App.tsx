import {
  Auth,
  CatalogSearchType,
  MusicKit,
  Player,
  usePlaybackState,
} from "@wwdrew/expo-apple-music";
import { useCallback, useState } from "react";
import { Button, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [authStatus, setAuthStatus] = useState<string>("—");
  const [log, setLog] = useState<string>("");
  const { playbackStatus, playbackTime } = usePlaybackState();

  const appendLog = useCallback((message: string) => {
    setLog((prev) => `${message}\n${prev}`.slice(0, 2000));
  }, []);

  async function authorize(developerToken?: string) {
    try {
      const status = await Auth.authorize(developerToken, {
        startScreenMessage:
          "Start screen message for <b>Expo Apple MusicExample App</b>",
      });
      setAuthStatus(status);
      appendLog(`authorize: ${status}`);
    } catch (error) {
      appendLog(`authorize error: ${String(error)}`);
    }
  }

  async function search() {
    try {
      const result = await MusicKit.catalogSearch(
        "Beatles",
        [CatalogSearchType.SONGS, CatalogSearchType.ALBUMS],
        { limit: 5 },
      );
      appendLog(
        `search: ${result.songs.length} songs, ${result.albums.length} albums`,
      );
    } catch (error) {
      appendLog(`search error: ${String(error)}`);
    }
  }

  if (Platform.OS === "android") {
    const devToken = process.env.EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.header}>Android auth (Tier 0)</Text>
          <Text>Auth: {authStatus}</Text>
          <Text style={styles.hint}>
            See docs/CLI.md: npm run dev-token -- --write-env example/.env.local
            then restart Metro.
          </Text>
          <Button
            title="Authorize"
            onPress={() => authorize(devToken)}
            disabled={!devToken}
          />
          <Text style={styles.log}>{log}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>@wwdrew/expo-apple-music</Text>
        <Text>Auth: {authStatus}</Text>
        <Text>
          Playback: {playbackStatus} @ {Math.floor(playbackTime)}s
        </Text>
        <View style={styles.row}>
          <Button title="Authorize" onPress={authorize} />
          <Button title="Search" onPress={search} />
          <Button title="Play" onPress={() => Player.play()} />
          <Button title="Pause" onPress={() => Player.pause()} />
        </View>
        <Text style={styles.log}>{log}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: { fontSize: 22, fontWeight: "600" as const, marginBottom: 12 },
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  scroll: { padding: 16 },
  row: { gap: 8, marginVertical: 12 },
  log: { fontFamily: "Menlo", fontSize: 12, marginTop: 16 },
  hint: { fontSize: 12, color: "#555", marginVertical: 8 },
};
