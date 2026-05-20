import { StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../lib/theme";

type IdFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  hint?: string;
};

export function IdField({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
}: IdFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "catalog or library id"}
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "600", color: theme.text, marginBottom: 4 },
  input: {
    fontFamily: theme.mono,
    fontSize: 13,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.card,
    color: theme.text,
  },
  hint: { fontSize: 11, color: theme.muted, marginTop: 4 },
});
