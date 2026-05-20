import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { isAuthorized, needsDeveloperToken } from "../lib/auth";
import { theme } from "../lib/theme";

export function AuthCard() {
  const { authStatus, hasStoredSession, devToken, authorize } = useApp();
  const authorized = isAuthorized(authStatus);
  const tokenRequired = needsDeveloperToken(Platform.OS);
  const canAuthorize = !tokenRequired || Boolean(devToken?.trim());

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Apple Music</Text>
      <Text style={styles.status}>
        Status: <Text style={styles.statusValue}>{authStatus}</Text>
      </Text>
      {hasStoredSession ? (
        <Text style={styles.hint}>Session restored from native storage.</Text>
      ) : null}
      {!devToken ? (
        <Text style={styles.hint}>
          Set EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN in example/.env.local (npm run
          dev-token — see docs/CLI.md). Required on Android/web; recommended on iOS
          for catalog search.
        </Text>
      ) : null}
      {Platform.OS === "web" ? (
        <Text style={styles.hint}>
          Web: allow popups for localhost. See docs/AUTH.md if authorize fails after
          the popup.
        </Text>
      ) : null}
      <Pressable
        style={[styles.button, (!canAuthorize || authorized) && styles.buttonMuted]}
        onPress={() => void authorize()}
        disabled={!canAuthorize}
      >
        <Text style={styles.buttonText}>
          {authorized ? "Re-authorize" : "Authorize"}
        </Text>
      </Pressable>
      {!canAuthorize ? (
        <Text style={styles.blocked}>
          Add a developer JWT before authorizing on {Platform.OS}.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  heading: { fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 6 },
  status: { fontSize: 14, color: theme.text },
  statusValue: { fontWeight: "600", color: theme.accent },
  hint: { fontSize: 11, color: theme.muted, marginTop: 6, lineHeight: 16 },
  button: {
    marginTop: 12,
    backgroundColor: theme.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonMuted: { opacity: 0.85 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  blocked: { fontSize: 11, color: theme.muted, marginTop: 8 },
});
