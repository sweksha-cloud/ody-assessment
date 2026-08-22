import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, type PressableProps, StyleSheet, View } from "react-native";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontVariant: "body" | "bodyMedium" }> = {
  sm: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], fontVariant: "body" },
  md: { paddingVertical: spacing[3], paddingHorizontal: spacing[5], fontVariant: "bodyMedium" },
  lg: { paddingVertical: spacing[4], paddingHorizontal: spacing[6], fontVariant: "bodyMedium" },
};

function variantColors(variant: ButtonVariant, state: "default" | "hovered" | "pressed" | "disabled") {
  const base = {
    primary: { bg: colors.brand[500], border: colors.brand[500], text: colors.textOnBrand },
    secondary: { bg: colors.surface, border: colors.borderStrong, text: colors.textPrimary },
    ghost: { bg: "transparent", border: "transparent", text: colors.textPrimary },
    danger: { bg: colors.danger[500], border: colors.danger[500], text: colors.textOnBrand },
  }[variant];

  if (state === "disabled") {
    return { bg: colors.neutral[100], border: colors.neutral[200], text: colors.textMuted };
  }
  if (state === "pressed") {
    const pressedBg = {
      primary: colors.brand[600],
      secondary: colors.neutral[100],
      ghost: colors.neutral[100],
      danger: colors.danger[700],
    }[variant];
    return { ...base, bg: pressedBg };
  }
  if (state === "hovered") {
    const hoveredBg = {
      primary: colors.brand[600],
      secondary: colors.neutral[50],
      ghost: colors.neutral[50],
      danger: colors.danger[700],
    }[variant];
    return { ...base, bg: hoveredBg };
  }
  return base;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isDisabled = Boolean(disabled) || loading;
  const { paddingVertical, paddingHorizontal, fontVariant } = sizeStyles[size];

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onHoverIn={(e) => {
        setHovered(true);
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setHovered(false);
        onHoverOut?.(e);
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={({ pressed }) => {
        const state = isDisabled ? "disabled" : pressed ? "pressed" : hovered ? "hovered" : "default";
        const c = variantColors(variant, state);
        return [
          styles.base,
          {
            backgroundColor: c.bg,
            borderColor: c.border,
            paddingVertical,
            paddingHorizontal,
            width: fullWidth ? "100%" : undefined,
            opacity: isDisabled && variant === "ghost" ? 0.5 : 1,
          },
          focused && !isDisabled ? styles.focusRing : null,
        ];
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "secondary" || variant === "ghost" ? colors.brand[500] : colors.textOnBrand} />
      ) : (
        <View style={styles.content}>
          <Text variant={fontVariant} color={isDisabled ? "muted" : variant === "secondary" || variant === "ghost" ? "primary" : "onBrand"}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  focusRing: Platform.select({
    web: { outlineWidth: 2, outlineColor: colors.focusRing, outlineStyle: "solid", outlineOffset: 2 },
    default: {
      shadowColor: colors.focusRing,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
  }),
});
