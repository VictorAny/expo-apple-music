import { StyleSheet, Text } from "react-native";
import { theme } from "../lib/theme";

export function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 10,
  },
});
