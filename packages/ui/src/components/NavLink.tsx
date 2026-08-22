import { forwardRef, useState } from "react";
import { Pressable, type PressableProps, StyleSheet, type View } from "react-native";
import { focusRingStyle } from "../tokens/focusRing";
import { controlHeight } from "../tokens/layout";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { GradientView } from "./GradientView";
import { Text } from "./Text";

export type NavLinkProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  active?: boolean;
};

// Routing-agnostic nav link primitive for the dark midnight command bar —
// hover/focus/press/active states live here so every nav bar gets them
// for free. Navigation itself (an expo-router `Link asChild`, a
// react-router `NavLink`, ...) is the caller's concern: this forwards
// whatever props that wrapper injects (onPress, href, target, ...)
// straight to the underlying Pressable.
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
      // `rest` spreads first, our own props last — expo-router's `Link
      // asChild` (via Radix's Slot) clones this element and injects its
      // own `style` prop at runtime; TS hiding `style` from the prop type
      // doesn't stop that injection, and JSX prop order decides the
      // winner. See Button.tsx for the identical defensive ordering.
      {...rest}
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
        {
          // Translucent-white overlay for hover/press on the dark nav
          // surface — a flat light-surface tint would be invisible here.
          backgroundColor: pressed
            ? "rgba(248, 250, 255, 0.14)"
            : hovered
              ? "rgba(248, 250, 255, 0.07)"
              : "transparent",
        },
        focused ? focusRingStyle : null,
      ]}
    >
      <Text variant="bodyMedium" color={active ? "inverse" : "inverseMuted"}>
        {label}
      </Text>
      {/* The active indicator is a small gradient bar, not just a color
          change on the label — "more than color alone." Absolutely
          positioned so it never affects the row's height. */}
      {active ? <GradientView style={styles.activeIndicator} /> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.sm,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minHeight: controlHeight.sm,
    justifyContent: "center",
  },
  activeIndicator: {
    position: "absolute",
    left: spacing[3],
    right: spacing[3],
    bottom: 0,
    height: 2,
    borderRadius: 1,
  },
});
