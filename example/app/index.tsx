import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { API_MODULES } from "../catalog/apiCatalog";
import { AuthCard } from "../components/AuthCard";
import { ModuleCard, PlaygroundCard } from "../components/ModuleLink";
import { SectionHeader } from "../components/SectionHeader";
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
          Authorize, try Playground, or browse the API reference.
        </Text>
        <AuthCard />
        <SectionHeader title="Get started" />
        <PlaygroundCard />
        <SectionHeader title="API reference" />
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
