import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PlayerBar } from "../components/PlayerBar";
import { AppProvider } from "../context/AppContext";
import { theme } from "../lib/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <View style={styles.root}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.card },
              headerTintColor: theme.accent,
              contentStyle: { backgroundColor: theme.bg },
            }}
          >
            <Stack.Screen name="index" options={{ title: "API Explorer" }} />
            <Stack.Screen name="[module]/index" />
            <Stack.Screen
              name="[module]/[method]"
              options={({ route }) => {
                const params = route.params as {
                  module?: string;
                  method?: string;
                };
                return {
                  title: params.method ?? "Demo",
                  headerBackTitle: params.module ?? "Back",
                };
              }}
            />
          </Stack>
          <PlayerBar />
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
});
