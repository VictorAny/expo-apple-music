import { Auth, MusicKit, Player, usePlaybackState } from '@wwdrew/expo-apple-music';
import { useCallback, useState } from 'react';
import { Button, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function App() {
  const [authStatus, setAuthStatus] = useState<string>('—');
  const [log, setLog] = useState<string>('');
  const { playbackStatus, playbackTime } = usePlaybackState();

  const appendLog = useCallback((message: string) => {
    setLog((prev) => `${message}\n${prev}`.slice(0, 2000));
  }, []);

  const authorize = async () => {
    try {
      const status = await Auth.authorize();
      setAuthStatus(status);
      appendLog(`authorize: ${status}`);
    } catch (error) {
      appendLog(`authorize error: ${String(error)}`);
    }
  };

  const search = async () => {
    try {
      const result = await MusicKit.catalogSearch('Beatles', ['songs', 'albums'], { limit: 5 });
      appendLog(`search: ${result.songs.length} songs, ${result.albums.length} albums`);
    } catch (error) {
      appendLog(`search error: ${String(error)}`);
    }
  };

  if (Platform.OS === 'android') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Android stub</Text>
        <Button title="Try authorize (should fail)" onPress={authorize} />
        <Text style={styles.log}>{log}</Text>
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
  header: { fontSize: 22, fontWeight: '600' as const, marginBottom: 12 },
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  scroll: { padding: 16 },
  row: { gap: 8, marginVertical: 12 },
  log: { fontFamily: 'Menlo', fontSize: 12, marginTop: 16 },
};
