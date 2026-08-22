import { forwardRef, useState } from "react";
import { Platform, Pressable, type PressableProps, StyleSheet, type View } from "react-native";
import { colors } from "../tokens/colors";
import { controlHeight } from "../tokens/layout";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type NavLinkProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  active?: boolean;
};

const INDICATOR_HEIGHT = 2;

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
      // `rest` spreads first, `style`/accessibility props last: expo-router's
      // `Link asChild` (via Radix's Slot) clones this element and injects
      // its own `style`/`onClick`/href-related props at runtime — TS's
      // `Omit<PressableProps, "style">` only hides `style` from the type,
      // it doesn't stop Slot injecting one anyway. Spread order decides
      // the winner in JSX, so ours must come after or the injected style
      // silently replaces this component's entire visual contract (this
      // is exactly how the active-page border-bar first shipped invisible).
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
          // Background tint for hover/press, matching Button's treatment —
          // plain opacity dimming (the old approach) reads as "disabled,"
          // not "hovered."
          backgroundColor: pressed ? colors.neutral[200] : hovered ? colors.neutral[100] : "transparent",
          borderBottomColor: active ? colors.brand[500] : "transparent",
        },
        focused ? styles.focusRing : null,
      ]}
    >
      <Text variant="bodyMedium" color={active ? "primary" : "secondary"}>
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.sm,
    // A bottom border-bar is the active-page indicator (set per-state
    // above); reserved here at full width so the row's height never
    // shifts between an inactive and an active item.
    borderBottomWidth: INDICATOR_HEIGHT,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minHeight: controlHeight.sm,
    justifyContent: "center",
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
