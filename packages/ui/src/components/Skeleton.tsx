import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, type ViewStyle } from "react-native";
import { colors } from "../tokens/colors";
import { useReducedMotion } from "../tokens/motion";
import { radii } from "../tokens/radii";

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: keyof typeof radii;
  style?: ViewStyle;
};

// A cool-neutral placeholder shape with a shimmer sweep, standing in for
// not-yet-loaded content. Distinct from Spinner: Spinner says "something
// is happening"; Skeleton previews *where* content will land, so the
// layout doesn't jump once the real data arrives. Compose several of
// these to sketch a card/row shape.
export function Skeleton({ width = "100%", height = 16, radius = "sm", style }: SkeletonProps) {
  const reducedMotion = useReducedMotion();
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 1300, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep, reducedMotion]);

  const translateX = sweep.interpolate({ inputRange: [0, 1], outputRange: [-220, 220] });

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        { width, height, borderRadius: radii[radius], backgroundColor: colors.neutral[150], overflow: "hidden" },
        style,
      ]}
    >
      {reducedMotion ? null : (
        <Animated.View style={[StyleSheet.absoluteFillObject, { width: 120, transform: [{ translateX }] }]}>
          {/* Cool-neutral light sweep — never the brand gradient here;
              skeletons stay neutral, only their shimmer moves. */}
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.55)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}
    </View>
  );
}
