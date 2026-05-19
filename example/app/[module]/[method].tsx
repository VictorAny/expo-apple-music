import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { getMethod } from "../../catalog/apiCatalog";
import { getMethodDemo } from "../../demos/registry";
import { theme } from "../../lib/theme";

export default function MethodScreen() {
  const { module: moduleId, method: methodId } = useLocalSearchParams<{
    module: string;
    method: string;
  }>();

  const meta =
    moduleId && methodId ? getMethod(moduleId, methodId) : undefined;
  const Demo =
    moduleId && methodId ? getMethodDemo(moduleId, methodId) : undefined;

  if (!meta || !Demo) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Demo not found for this API.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: meta.name }} />
      <View style={styles.wrap}>
        <Demo />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingBottom: 160 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: theme.muted },
});
