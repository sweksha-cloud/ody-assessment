import { forwardRef, useState } from "react";
import { Platform, Pressable, type PressableProps, StyleSheet, type View } from "react-native";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";
import { Text } from "./Text";

export type NavLinkProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  active?: boolean;
};

// Routing-agnostic nav link primitive — hover/focus/press/active states
// live here so every nav bar gets them for free. Navigation itself (an
// expo-router `Link asChild`, a react-router `NavLink`, ...) is the
// caller's concern: this forwards whatever props that wrapper injects
// (onPress, href, target, ...) straight to the underlying Pressable.
// forwardRef is required, not optional polish: expo-router's `Link asChild`
// clones this element and attaches a ref to it for its own layout/focus
// handling — without forwarding, that ref silently fails.
export const NavLink = forwardRef<View, NavLinkProps>(function NavLink(
  { label, active = false, onHoverIn, onHoverOut, onFocus, onBlur, ...rest },
  ref,
) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // aria-selected isn't valid ARIA on role="link" (only option/tab/row/...
  // support it) — "current page" is the right semantic for an active nav
  // link, via aria-current. react-native-web forwards this prop straight
  // to the DOM, but RN's bundled types don't declare it, hence the cast.
  const currentPageProp: Record<string, unknown> = active ? { "aria-current": "page" } : {};

  return (
    <Pressable
      ref={ref}
      accessibilityRole="link"
      {...currentPageProp}
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
      style={({ pressed }) => [
        styles.base,
        { opacity: pressed ? 0.7 : hovered ? 0.85 : 1 },
        focused ? styles.focusRing : null,
      ]}
      {...rest}
    >
      <Text
        variant="bodyMedium"
        color={active ? "primary" : "secondary"}
        style={active ? { textDecorationLine: "underline" } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.sm,
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
