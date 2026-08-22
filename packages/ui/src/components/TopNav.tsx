import type { ReactNode } from "react";
import { View } from "react-native";
import { colors } from "../tokens/colors";
import { layout } from "../tokens/layout";
import { spacing } from "../tokens/spacing";

export type TopNavProps = {
  brand: ReactNode;
  children: ReactNode;
};

// The persistent top navigation bar's chrome — surface background, bottom
// border, max-width content rail. Callers supply their own brand mark and
// NavLink children; this owns layout only, never routing.
export function TopNav({ brand, children }: TopNavProps) {
  return (
    <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View
        style={{
          maxWidth: layout.maxContentWidth,
          width: "100%",
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: layout.containerPadding,
          paddingVertical: spacing[4],
          gap: spacing[6],
        }}
      >
        {brand}
        <View style={{ flexDirection: "row", gap: spacing[5], flexWrap: "wrap" }}>{children}</View>
      </View>
    </View>
  );
}
