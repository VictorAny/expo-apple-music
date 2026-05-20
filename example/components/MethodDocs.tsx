import { StyleSheet, Text, View } from "react-native";
import { getMethodDoc } from "../catalog/methodDocs";
import { useMethodMeta } from "../hooks/useMethodMeta";
import { theme } from "../lib/theme";

export function MethodDocs() {
  const { moduleId, methodId } = useMethodMeta();
  if (!moduleId || !methodId) return null;

  const doc = getMethodDoc(moduleId, methodId);
  if (!doc) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.signature}>{doc.signature}</Text>
      <Text style={styles.summary}>{doc.summary}</Text>
      <Text style={styles.description}>{doc.description}</Text>

      {doc.params.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Parameters</Text>
          {doc.params.map((param) => (
            <Text key={param.name} style={styles.param}>
              <Text style={styles.paramName}>
                {param.name}
                {param.required ? "" : "?"}
              </Text>
              <Text style={styles.paramType}> ({param.type})</Text>
              {" — "}
              {param.description}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Returns</Text>
        <Text style={styles.body}>{doc.returns}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Auth</Text>
        <Text style={styles.body}>
          {doc.requiresAuth
            ? "Requires Auth.authorize() before calling."
            : "Callable without prior authorization."}
        </Text>
      </View>

      {doc.platformNotes ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Platform notes</Text>
          {doc.platformNotes.ios ? (
            <Text style={styles.body}>iOS: {doc.platformNotes.ios}</Text>
          ) : null}
          {doc.platformNotes.android ? (
            <Text style={styles.body}>Android: {doc.platformNotes.android}</Text>
          ) : null}
          {doc.platformNotes.web ? (
            <Text style={styles.body}>Web: {doc.platformNotes.web}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  signature: {
    fontFamily: theme.mono,
    fontSize: 14,
    fontWeight: "600",
    color: theme.accent,
    marginBottom: 8,
  },
  summary: { fontSize: 15, fontWeight: "600", color: theme.text, marginBottom: 8 },
  description: { fontSize: 14, color: theme.muted, lineHeight: 20, marginBottom: 12 },
  block: { marginBottom: 12 },
  blockTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  body: { fontSize: 13, color: theme.muted, lineHeight: 18 },
  param: { fontSize: 13, color: theme.muted, lineHeight: 18, marginBottom: 4 },
  paramName: { fontFamily: theme.mono, color: theme.text, fontWeight: "600" },
  paramType: { fontFamily: theme.mono, color: theme.accent },
});
