import { useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, type ViewStyle } from "react-native";
import { colors } from "../tokens/colors";
import { focusRingStyle } from "../tokens/focusRing";
import { useReducedMotion } from "../tokens/motion";
import { radii } from "../tokens/radii";
import { shadows } from "../tokens/shadows";
import { spacing } from "../tokens/spacing";

// The surface-hierarchy vocabulary: not every card is an identical white
// rounded box. "surface" is the default passive white card; "tinted" is
// a quieter summary/grouping surface; "borderOnly" is a flat section
// (border/background separation, no shadow — no elevation at all);
// "dark" is a high-attention panel on the midnight surface family.
export type CardTone = "surface" | "tinted" | "borderOnly" | "dark";

export type CardProps = {
  children: ReactNode;
  padding?: keyof typeof spacing;
  elevation?: keyof typeof shadows;
  tone?: CardTone;
  // Distinguishes an interactive card (clickable row/tile) from a passive
  // one: border emphasis + lift on hover, press feedback, a visible focus
  // ring, and a real onPress. Respects reduced-motion (0-duration instead
  // of an animated transform when the user has that OS setting on).
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

const TONE_STYLES: Record<CardTone, { bg: string; border: string }> = {
  surface: { bg: colors.surface, border: colors.border },
  tinted: { bg: colors.surfaceSecondary, border: colors.border },
  borderOnly: { bg: "transparent", border: colors.border },
  dark: { bg: colors.navSurfaceElevated, border: colors.borderDark },
};

export function Card({ children, padding = 6, elevation = "sm", tone = "surface", interactive = false, onPress, style }: CardProps) {
  const toneStyle = TONE_STYLES[tone];
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const lift = useRef(new Animated.Value(0)).current;

  const baseStyle: ViewStyle = {
    backgroundColor: toneStyle.bg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: interactive && hovered ? colors.brand.violet : toneStyle.border,
    padding: spacing[padding],
  };
  const shadowStyle = tone === "borderOnly" ? shadows.none : shadows[interactive && hovered ? "md" : elevation];

  if (!interactive) {
    return <Animated.View style={[baseStyle, shadowStyle, style]}>{children}</Animated.View>;
  }

  function animateTo(toValue: number) {
    Animated.timing(lift, { toValue, duration: reducedMotion ? 0 : 140, useNativeDriver: false }).start();
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      onHoverIn={() => {
        setHovered(true);
        animateTo(1);
      }}
      onHoverOut={() => {
        setHovered(false);
        animateTo(0);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            baseStyle,
            shadowStyle,
            {
              transform: [
                { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
                { scale: pressed ? 0.995 : 1 },
              ],
            },
            focused ? focusRingStyle : null,
            style,
          ]}
        >
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}
