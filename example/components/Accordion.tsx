import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { theme } from "../lib/theme";

type AccordionProps = {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function Accordion({ title, open, onToggle, children }: AccordionProps) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.header} onPress={onToggle}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.chevron}>{open ? "▼" : "▶"}</Text>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    backgroundColor: theme.card,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: { fontSize: 15, fontWeight: "600", color: theme.text },
  chevron: { fontSize: 12, color: theme.muted },
  body: { paddingHorizontal: 14, paddingBottom: 12, gap: 8 },
});
