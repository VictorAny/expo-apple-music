import { StyleSheet, Text, View } from "react-native";
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
      {!devToken ? (
        <Text style={styles.hint}>
          Set EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN in example/.env.local
          (npm run dev-token — see docs/CLI.md). Required on Android/web; on iOS
          avoids MusicKit provisioning for catalog search.
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
