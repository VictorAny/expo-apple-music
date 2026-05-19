import { Platform, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { theme } from "../lib/theme";

export function AuthBanner() {
  const { authStatus, hasStoredSession, devToken } = useApp();
  return (
    <View style={styles.wrap}>
      <Text style={styles.status}>
        Auth: <Text style={styles.value}>{authStatus}</Text>
      </Text>
      {hasStoredSession ? (
        <Text style={styles.hint}>
          Session restored — most demos work without re-authorizing.
        </Text>
      ) : null}
      {Platform.OS === "android" && !devToken ? (
        <Text style={styles.hint}>
          Android needs EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN in .env.local
          (see docs/CLI.md).
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  status: { fontSize: 13, color: theme.text },
  value: { fontWeight: "600" },
  hint: { fontSize: 11, color: theme.muted, marginTop: 4 },
});
