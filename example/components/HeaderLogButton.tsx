import { Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { theme } from "../lib/theme";

export function HeaderLogButton() {
  const { logUnread, toggleLogVisible, logVisible } = useApp();

  return (
    <Pressable onPress={toggleLogVisible} style={styles.button} hitSlop={8}>
      <Text style={[styles.label, logVisible && styles.labelActive]}>
        Log
      </Text>
      {logUnread ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: { fontSize: 15, color: theme.accent, fontWeight: "600" },
  labelActive: { opacity: 0.7 },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff3b30",
  },
});
