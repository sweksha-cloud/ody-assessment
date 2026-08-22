import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";
import { shadows } from "../tokens/shadows";
import { spacing } from "../tokens/spacing";

export type ListRowProps = {
  left: ReactNode;
  right?: ReactNode;
  // Card-style chrome (background/border/radius/shadow) for a standalone
  // row — set false for a row nested inside an existing Card (e.g. menu
  // items grouped under a category card), where only row spacing matters.
  surface?: boolean;
  style?: ViewStyle;
};

// The left/right row shape repeated across Orders, Menu items, and the CRM
// customer list: a flexible label/meta block on the left, a right-aligned
// value block on the right. Callers keep their own interactive controls
// (buttons, switches) inside either slot — this only owns the layout.
export function ListRow({ left, right, surface = true, style }: ListRowProps) {
  return (
    <View
      style={[
        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing[4] },
        surface
          ? [
              {
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[6],
              },
              shadows.sm,
            ]
          : { paddingVertical: spacing[2] },
        style,
      ]}
    >
      <View style={{ flex: 1, gap: spacing[1] }}>{left}</View>
      {right ? <View style={{ alignItems: "flex-end", gap: spacing[1] }}>{right}</View> : null}
    </View>
  );
}
