import { Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { theme } from "../lib/theme";

export function LogPanel() {
  const { log, clearLog } = useApp();
  if (!log) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Log</Text>
        <Pressable onPress={clearLog} hitSlop={8}>
          <Text style={styles.clear}>Clear</Text>
        </Pressable>
      </View>
      <Text style={styles.log} selectable>
        {log}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: { fontSize: 14, fontWeight: "600", color: theme.text },
  clear: { fontSize: 13, color: theme.accent },
  log: {
    fontFamily: theme.mono,
    fontSize: 11,
    color: "#333",
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
});
