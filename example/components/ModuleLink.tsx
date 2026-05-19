import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import type { ApiMethod, ApiModule } from "../catalog/apiCatalog";
import { theme } from "../lib/theme";

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
  name: { fontSize: 18, fontWeight: "600", color: theme.text },
  desc: { fontSize: 13, color: theme.muted, marginTop: 4, lineHeight: 18 },
  count: { fontSize: 12, color: theme.accent, marginTop: 8 },
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
