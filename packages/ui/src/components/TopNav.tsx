import { useEffect, useState, type ReactNode } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { colors } from "../tokens/colors";
import { focusRingStyle } from "../tokens/focusRing";
import { breakpoints, layout } from "../tokens/layout";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { Modal } from "./Modal";

export type TopNavProps = {
  brand: ReactNode;
  children: ReactNode;
  // An opaque value that changes when navigation happens (the app passes
  // its current pathname) — purely a change-detection signal used to
  // auto-close the mobile menu after a link is followed. TopNav never
  // inspects it, keeping this component routing-agnostic.
  activeKey?: string;
};

function HamburgerButton({ open, onPress }: { open: boolean; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel="Open navigation menu"
      accessibilityState={{ expanded: open }}
      hitSlop={8}
      style={[
        {
          padding: spacing[2],
          borderRadius: radii.sm,
          backgroundColor: hovered ? "rgba(248, 250, 255, 0.1)" : "transparent",
        },
        focused ? focusRingStyle : null,
      ]}
    >
      {/* Drawn from three plain Views rather than a glyph/icon font —
          renders identically on native and web with no font-availability
          risk. */}
      <View style={{ gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 20, height: 2, borderRadius: 1, backgroundColor: colors.textInverse }} />
        ))}
      </View>
    </Pressable>
  );
}

// The dark midnight command bar's chrome — surface, border, max-width
// content rail. Callers supply their own brand mark and NavLink children;
// this owns layout (including the responsive collapse below the `md`
// breakpoint) only, never routing.
export function TopNav({ brand, children, activeKey }: TopNavProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < breakpoints.md;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [activeKey]);

  return (
    <View style={{ backgroundColor: colors.navSurface, borderBottomWidth: 1, borderBottomColor: colors.borderDark }}>
      <View
        style={{
          maxWidth: layout.maxContentWidth,
          width: "100%",
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: isCompact ? "space-between" : "flex-start",
          paddingHorizontal: layout.containerPadding,
          paddingVertical: spacing[4],
          gap: spacing[6],
        }}
      >
        {brand}
        {isCompact ? (
          <HamburgerButton open={menuOpen} onPress={() => setMenuOpen(true)} />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[5], flexWrap: "wrap" }}>
            {children}
          </View>
        )}
      </View>

      {isCompact ? (
        <Modal visible={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" tone="dark">
          <View style={{ gap: spacing[5], alignItems: "flex-start" }}>{children}</View>
        </Modal>
      ) : null}
    </View>
  );
}
