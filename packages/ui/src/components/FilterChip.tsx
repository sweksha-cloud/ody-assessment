import { useState } from "react";
import { Pressable } from "react-native";
import { colors } from "../tokens/colors";
import { focusRingStyle } from "../tokens/focusRing";
import { controlHeight } from "../tokens/layout";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

// A selectable filter pill — deliberately not the primary Button (which
// carries the full gradient fill, reserved for high-emphasis actions).
// Selected reads as pale violet with dark brand text; unselected is a
// plain bordered chip.
export function FilterChip({ label, selected = false, onPress }: FilterChipProps) {
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
      accessibilityState={{ selected }}
      style={[
        {
          minHeight: controlHeight.sm,
          justifyContent: "center",
          paddingVertical: spacing[2],
          paddingHorizontal: spacing[4],
          borderRadius: radii.full,
          borderWidth: 1,
          borderColor: selected ? colors.brand.violet : colors.borderStrong,
          backgroundColor: selected ? colors.brand.paleViolet : hovered ? colors.neutral[50] : colors.surface,
        },
        focused ? focusRingStyle : null,
      ]}
    >
      <Text variant="bodyMedium" color={selected ? "brand" : "secondary"}>
        {label}
      </Text>
    </Pressable>
  );
}
