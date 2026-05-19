import { Button, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { theme } from "../lib/theme";

export function RunButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return <Button title={title} onPress={onPress} disabled={disabled} />;
}

export function NeedSearchHint() {
  return (
    <Text style={styles.hint}>
      Run Catalog → search first to populate song, album, artist, and playlist
      IDs used below.
    </Text>
  );
}

export function SelectedSongHint() {
  const { selectedSong } = useApp();
  if (selectedSong) {
    return (
      <Text style={styles.selected}>
        Selected: {selectedSong.title} (id: {selectedSong.id})
      </Text>
    );
  }
  return <NeedSearchHint />;
}

const styles = StyleSheet.create({
  hint: { fontSize: 12, color: theme.muted, marginBottom: 8 },
  selected: {
    fontFamily: theme.mono,
    fontSize: 11,
    color: theme.text,
    marginBottom: 8,
  },
});
