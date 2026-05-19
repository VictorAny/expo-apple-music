import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { theme } from "../lib/theme";

type ItemRowProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function ItemRow({
  title,
  subtitle,
  meta,
  selected,
  onPress,
}: ItemRowProps) {
  const content = (
    <>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </>
  );

  const rowStyle: ViewStyle[] = [
    styles.row,
    selected ? styles.selected : undefined,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={rowStyle}>
        {content}
      </Pressable>
    );
  }
  return <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  selected: {
    borderColor: theme.accent,
    backgroundColor: theme.accentBg,
  },
  title: { fontSize: 15, fontWeight: "600", color: theme.text },
  subtitle: { fontSize: 13, color: "#444", marginTop: 2 },
  meta: {
    fontFamily: theme.mono,
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
});
