import { useState } from "react";
import { TextInput, type TextInputProps, View } from "react-native";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type TextFieldProps = Omit<TextInputProps, "style"> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function TextField({ label, error, helperText, editable = true, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const disabled = editable === false;

  const borderColor = disabled
    ? colors.border
    : hasError
      ? colors.danger[500]
      : focused
        ? colors.brand[500]
        : colors.borderStrong;

  return (
    <View style={{ gap: spacing[2] }}>
      {label ? (
        <Text variant="label" color="secondary">
          {label}
        </Text>
      ) : null}
      <TextInput
        editable={editable}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={{
          borderWidth: focused && !hasError ? 2 : 1,
          borderColor,
          borderRadius: radii.md,
          paddingVertical: spacing[3],
          paddingHorizontal: spacing[4],
          fontSize: 14,
          color: disabled ? colors.textMuted : colors.textPrimary,
          backgroundColor: disabled ? colors.neutral[100] : colors.surface,
        }}
        {...rest}
      />
      {error ? (
        <Text variant="caption" style={{ color: colors.danger[500] }}>
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color="muted">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
