import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { API_MODULES } from "../catalog/apiCatalog";
import { AuthBanner } from "../components/AuthBanner";
import { ModuleCard } from "../components/ModuleLink";
import { theme } from "../lib/theme";

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "API Explorer" }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>@wwdrew/expo-apple-music</Text>
        <Text style={styles.subtitle}>
          Browse by module, then pick an API to run a live demo.
        </Text>
        <AuthBanner />
        {API_MODULES.map((mod) => (
          <ModuleCard key={mod.id} mod={mod} />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 180 },
  title: { fontSize: 22, fontWeight: "600", color: theme.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: theme.muted, marginBottom: 16, lineHeight: 20 },
});
