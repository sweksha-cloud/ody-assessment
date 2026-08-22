import { useEffect, useRef } from "react";
import { Animated, type ViewStyle } from "react-native";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: keyof typeof radii;
  style?: ViewStyle;
};

// A gray placeholder shape that pulses in place of not-yet-loaded content.
// Distinct from Spinner: Spinner says "something is happening"; Skeleton
// previews *where* content will land, so the layout doesn't jump once the
// real data arrives. Compose several of these to sketch a card/row shape.
export function Skeleton({ width = "100%", height = 16, radius = "sm", style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: false }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        { width, height, borderRadius: radii[radius], backgroundColor: colors.neutral[200], opacity },
        style,
      ]}
    />
  );
}
