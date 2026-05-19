import { type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useMethodMeta } from "../hooks/useMethodMeta";
import { theme } from "../lib/theme";
import { AuthBanner } from "./AuthBanner";
import { LogPanel } from "./LogPanel";

type ApiScreenProps = {
  children?: ReactNode;
  actions?: ReactNode;
  hint?: string;
};

export function ApiScreen({ children, actions, hint }: ApiScreenProps) {
  const { method } = useMethodMeta();
  if (!method) {
    return (
      <View style={styles.centered}>
        <Text>Unknown API method.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <AuthBanner />
      <Text style={styles.signature}>{method.signature}</Text>
      <Text style={styles.summary}>{method.summary}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
      {children}
      <LogPanel />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  signature: {
    fontFamily: theme.mono,
    fontSize: 14,
    fontWeight: "600",
    color: theme.accent,
    marginBottom: 8,
  },
  summary: { fontSize: 14, color: theme.muted, lineHeight: 20, marginBottom: 12 },
  hint: { fontSize: 12, color: theme.muted, fontStyle: "italic", marginBottom: 12 },
  actions: { gap: 8, marginBottom: 16 },
});
