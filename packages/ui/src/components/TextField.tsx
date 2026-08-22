import { useState } from "react";
import { Platform, TextInput, type TextInputProps, View } from "react-native";
import { colors } from "../tokens/colors";
import { controlHeight } from "../tokens/layout";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { typography } from "../tokens/typography";
import { Text } from "./Text";

export type TextFieldProps = Omit<TextInputProps, "style"> & {
  label?: string;
  error?: string;
  helperText?: string;
};

// Outer glow for the focused state — additive to the ring border, never
// a layout-shifting border-width change, so an error/helper message
// appearing or disappearing (and focus itself) never reflows the form.
const focusGlow = Platform.select({
  web: { boxShadow: `0 0 0 3px ${colors.focusGlow}` },
  default: {
    shadowColor: colors.focus.ring,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export function TextField({ label, error, helperText, editable = true, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const disabled = editable === false;

  const borderColor = disabled
    ? colors.border
    : hasError
      ? colors.danger.fg
      : focused
        ? colors.focus.ring
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
        style={[
          {
            borderWidth: 1,
            borderColor,
            borderRadius: radii.md,
            minHeight: controlHeight.md,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            fontSize: 14,
            color: disabled ? colors.textMuted : colors.textPrimary,
            backgroundColor: disabled ? colors.disabled.bg : colors.surface,
          },
          focused && !hasError ? focusGlow : null,
        ]}
        {...rest}
      />
      {/* Reserves the message line's height whether or not a message is
          shown, so an error appearing/disappearing never shifts the
          controls below it. */}
      <View style={{ minHeight: typography.caption.lineHeight }}>
        {error ? (
          <Text variant="caption" style={{ color: colors.danger.fg }}>
            {error}
          </Text>
        ) : helperText ? (
          <Text variant="caption" color="muted">
            {helperText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
