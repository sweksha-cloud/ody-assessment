import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { colors } from "../tokens/colors";
import { layout } from "../tokens/layout";
import { spacing } from "../tokens/spacing";

export type PageContainerProps = {
  children: ReactNode;
  // Defaults to the dashboard's shared content rail; pass
  // layout.maxFormWidth (or any value) for a narrower single-column page
  // like Settings, rather than hardcoding a page-local magic number.
  maxWidth?: number;
  gap?: keyof typeof spacing;
};

// The scrollable page shell every screen renders into: centered content
// rail with a shared max width and horizontal gutter, vertical rhythm
// between sections. This is the one place that rail is defined — pages
// stop hand-rolling the same maxWidth/padding/gap wrapper each time.
export function PageContainer({ children, maxWidth = layout.maxContentWidth, gap = 7 }: PageContainerProps) {
  return (
    <ScrollView contentContainerStyle={{ backgroundColor: colors.background, flexGrow: 1 }}>
      <View
        style={{
          maxWidth,
          width: "100%",
          alignSelf: "center",
          padding: layout.containerPadding,
          gap: spacing[gap],
        }}
      >
        {children}
      </View>
    </ScrollView>
  );
}
