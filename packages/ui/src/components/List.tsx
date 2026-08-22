import type { ReactNode } from "react";
import { View } from "react-native";
import { spacing } from "../tokens/spacing";

export type ListProps = {
  children: ReactNode;
  gap?: keyof typeof spacing;
};

// Formalizes the vertical-stack-of-rows pattern repeated across Orders,
// Menu, and CRM — one place that owns the spacing between list rows,
// instead of each page hand-rolling `<View style={{ gap: spacing[n] }}>`.
export function List({ children, gap = 3 }: ListProps) {
  return <View style={{ gap: spacing[gap] }}>{children}</View>;
}
