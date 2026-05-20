import { StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { isAuthorized } from "../lib/auth";
import { theme } from "../lib/theme";

export function AuthStatusChip() {
  const { authStatus } = useApp();
  const authorized = isAuthorized(authStatus);

  return (
    <View style={[styles.chip, authorized ? styles.ok : styles.pending]}>
      <Text style={styles.text}>{authorized ? "● Authorized" : "○ Not authorized"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  ok: { backgroundColor: "#e8f5e9" },
  pending: { backgroundColor: "#fff3e0" },
  text: { fontSize: 11, fontWeight: "600", color: theme.text },
});
