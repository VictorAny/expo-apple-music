import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ApiMethod, ApiModule } from "../catalog/apiCatalog";
import { useApp } from "../context/AppContext";
import { isAuthorized } from "../lib/auth";
import { theme } from "../lib/theme";

export function PlaygroundCard() {
  const { authStatus } = useApp();
  const authorized = isAuthorized(authStatus);

  return (
    <Link href="/playground" asChild>
      <Pressable
        style={StyleSheet.flatten([
          styles.card,
          !authorized && styles.disabled,
        ])}
        disabled={!authorized}
      >
        <Text style={styles.name}>Playground</Text>
        <Text style={styles.desc}>
          Search, queue, and play — plus library, history, and recommendations.
        </Text>
        {!authorized ? (
          <Text style={styles.blocked}>Authorize above to open Playground.</Text>
        ) : (
          <Text style={styles.action}>Open →</Text>
        )}
      </Pressable>
    </Link>
  );
}

export function ModuleCard({ mod }: { mod: ApiModule }) {
  return (
    <Link href={`/${mod.id}`} asChild>
      <Pressable style={styles.card}>
        <Text style={styles.name}>{mod.name}</Text>
        <Text style={styles.desc}>{mod.description}</Text>
        <Text style={styles.count}>{mod.methods.length} APIs</Text>
      </Pressable>
    </Link>
  );
}

export function MethodLink({
  moduleId,
  method,
}: {
  moduleId: string;
  method: ApiMethod;
}) {
  return (
    <Link href={`/${moduleId}/${method.id}`} asChild>
      <Pressable style={styles.methodRow}>
        <Text style={styles.methodName}>{method.name}</Text>
        <Text style={styles.methodSig} numberOfLines={2}>
          {method.signature}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  disabled: { opacity: 0.55 },
  name: { fontSize: 18, fontWeight: "600", color: theme.text },
  desc: { fontSize: 13, color: theme.muted, marginTop: 4, lineHeight: 18 },
  count: { fontSize: 12, color: theme.accent, marginTop: 8 },
  action: { fontSize: 12, color: theme.accent, marginTop: 8, fontWeight: "600" },
  blocked: { fontSize: 12, color: theme.muted, marginTop: 8, fontStyle: "italic" },
  methodRow: {
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  methodName: {
    fontFamily: theme.mono,
    fontSize: 15,
    fontWeight: "600",
    color: theme.accent,
  },
  methodSig: {
    fontFamily: theme.mono,
    fontSize: 11,
    color: theme.muted,
    marginTop: 4,
  },
});
