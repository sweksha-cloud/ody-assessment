import { useState } from "react";
import { ActivityIndicator, Pressable, type PressableProps, StyleSheet, type ViewStyle, View } from "react-native";
import { colors } from "../tokens/colors";
import { focusRingStyle } from "../tokens/focusRing";
import { controlHeight } from "../tokens/layout";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { GradientView } from "./GradientView";
import { Text, type TextColor } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  // Overrides the parent's cross-axis stretch (e.g. a flex:1 column
  // defaulting children to full width) — for a Button used inline as a
  // clickable label rather than a full-width CTA. Leave unset everywhere
  // else; existing full-width-looking buttons rely on the stretch default.
  alignSelf?: ViewStyle["alignSelf"];
};

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontVariant: "body" | "bodyMedium" }> = {
  sm: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], fontVariant: "body" },
  md: { paddingVertical: spacing[3], paddingHorizontal: spacing[5], fontVariant: "bodyMedium" },
  lg: { paddingVertical: spacing[4], paddingHorizontal: spacing[6], fontVariant: "bodyMedium" },
};

type ButtonState = "default" | "hovered" | "pressed" | "disabled";
type Tone = { bg: string; border: string; text: TextColor; scrim?: string };

// primary uses the gradient fill (rendered separately, see GradientView
// below) with a translucent midnight scrim for hover/press feedback —
// "obvious" per the component spec, without needing discrete gradient
// color stops per state.
function toneFor(variant: ButtonVariant, state: ButtonState): Tone {
  if (state === "disabled") {
    return { bg: colors.disabled.bg, border: colors.disabled.border, text: "muted" };
  }
  if (variant === "secondary") {
    const bg = state === "pressed" ? colors.neutral[100] : state === "hovered" ? colors.neutral[50] : colors.surface;
    return { bg, border: colors.borderStrong, text: "primary" };
  }
  if (variant === "ghost") {
    const bg = state === "pressed" ? colors.neutral[200] : state === "hovered" ? colors.neutral[100] : "transparent";
    return { bg, border: "transparent", text: "primary" };
  }
  if (variant === "danger") {
    const bg = state === "pressed" ? colors.danger.pressed : state === "hovered" ? colors.danger.hover : colors.danger.fg;
    return { bg, border: bg, text: "onBrand" };
  }
  const scrim =
    state === "pressed" ? "rgba(17, 21, 43, 0.24)" : state === "hovered" ? "rgba(17, 21, 43, 0.1)" : undefined;
  return { bg: "transparent", border: "transparent", text: "onBrand", scrim };
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  alignSelf,
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
  const isGradient = variant === "primary" && !isDisabled;
  const { paddingVertical, paddingHorizontal, fontVariant } = sizeStyles[size];

  return (
    <Pressable
      // `rest` first, our own props last — if this Button is ever used as
      // an expo-router `Link asChild` child (as NavLink already is), Slot
      // injects its own `style` prop when cloning; ours must win. See
      // NavLink.tsx for the concrete bug this ordering prevents.
      {...rest}
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
        const state: ButtonState = isDisabled ? "disabled" : pressed ? "pressed" : hovered ? "hovered" : "default";
        const tone = toneFor(variant, state);
        return [
          styles.base,
          {
            borderColor: tone.border,
            backgroundColor: isGradient ? "transparent" : tone.bg,
            minHeight: controlHeight[size],
            width: fullWidth ? "100%" : undefined,
            alignSelf,
          },
          // The focus ring lives on this outer Pressable (not the inner
          // gradient-clipping wrapper below) so a native shadow-based ring
          // is never clipped by that wrapper's overflow:hidden.
          focused && !isDisabled ? focusRingStyle : null,
        ];
      }}
    >
      {({ pressed }) => {
        const state: ButtonState = isDisabled ? "disabled" : pressed ? "pressed" : hovered ? "hovered" : "default";
        const tone = toneFor(variant, state);
        return (
          <View
            style={[
              styles.content,
              { paddingVertical, paddingHorizontal, borderRadius: radii.md },
              isGradient ? styles.gradientClip : null,
            ]}
          >
            {isGradient ? <GradientView style={StyleSheet.absoluteFillObject} /> : null}
            {isGradient && tone.scrim ? (
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: tone.scrim }]} />
            ) : null}
            {loading ? (
              <ActivityIndicator size="small" color={tone.text === "onBrand" ? colors.textOnBrand : colors.brand.violet} />
            ) : (
              <Text variant={fontVariant} color={tone.text}>
                {label}
              </Text>
            )}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  gradientClip: {
    overflow: "hidden",
  },
});
