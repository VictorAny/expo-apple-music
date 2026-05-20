import { Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { isAuthorized } from "../lib/auth";
import { theme } from "../lib/theme";

export function RunButton({
  title,
  onPress,
  disabled,
  requiresAuth = true,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  requiresAuth?: boolean;
}) {
  const { authStatus } = useApp();
  const blocked = requiresAuth && !isAuthorized(authStatus);
  const isDisabled = disabled || blocked;

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>
          {title}
        </Text>
      </Pressable>
      {blocked ? (
        <Text style={styles.hint}>Authorize on home to try this.</Text>
      ) : null}
    </View>
  );
}

export function DisabledHint({ children }: { children: string }) {
  return <Text style={styles.hint}>{children}</Text>;
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  button: {
    backgroundColor: theme.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#c9c9c9" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  buttonTextDisabled: { color: "#666" },
  hint: { fontSize: 11, color: theme.muted, marginTop: 4, marginBottom: 8 },
});
