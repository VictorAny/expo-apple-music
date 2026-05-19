import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getModule } from "../../catalog/apiCatalog";
import { MethodLink } from "../../components/ModuleLink";
import { theme } from "../../lib/theme";

export default function ModuleScreen() {
  const { module: moduleId } = useLocalSearchParams<{ module: string }>();
  const mod = moduleId ? getModule(moduleId) : undefined;

  if (!mod) {
    return (
      <View style={styles.centered}>
        <Text>Unknown module.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: mod.name }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.desc}>{mod.description}</Text>
        <Text style={styles.count}>{mod.methods.length} methods</Text>
        {mod.methods.map((method) => (
          <MethodLink key={method.id} moduleId={mod.id} method={method} />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 180 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  desc: { fontSize: 14, color: theme.muted, marginBottom: 8, lineHeight: 20 },
  count: { fontSize: 12, color: theme.accent, marginBottom: 16 },
});
