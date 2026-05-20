import { Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { theme } from "../lib/theme";

export function GlobalLogDrawer() {
  const { log, logVisible, clearLog } = useApp();

  if (!log && !logVisible) return null;

  return (
    <View style={[styles.wrap, logVisible ? styles.expanded : styles.collapsed]}>
      <View style={styles.header}>
        <Text style={styles.title}>Log</Text>
        {log ? (
          <Pressable onPress={clearLog} hitSlop={8}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
      {logVisible ? (
        <Text style={styles.log} selectable>
          {log || "No log entries yet."}
        </Text>
      ) : (
        <Text style={styles.preview} numberOfLines={1}>
          {log.split("\n")[0] ?? ""}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  collapsed: { paddingBottom: 4 },
  expanded: { paddingBottom: 8, maxHeight: 160 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { fontSize: 13, fontWeight: "600", color: theme.text },
  clear: { fontSize: 12, color: theme.accent },
  preview: {
    fontFamily: theme.mono,
    fontSize: 11,
    color: theme.muted,
  },
  log: {
    fontFamily: theme.mono,
    fontSize: 11,
    color: "#333",
    lineHeight: 16,
  },
});
