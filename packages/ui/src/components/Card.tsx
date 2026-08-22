import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";
import { shadows } from "../tokens/shadows";
import { spacing } from "../tokens/spacing";

export type CardProps = {
  children: ReactNode;
  padding?: keyof typeof spacing;
  elevation?: keyof typeof shadows;
  style?: ViewStyle;
};

export function Card({ children, padding = 6, elevation = "sm", style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing[padding],
        },
        shadows[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}
