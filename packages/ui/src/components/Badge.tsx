import { View } from "react-native";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type BadgeProps = {
  label: string;
  bg: string;
  fg: string;
  border?: string;
};

export function Badge({ label, bg, fg, border }: BadgeProps) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: bg,
        borderColor: border ?? bg,
        borderWidth: 1,
        borderRadius: radii.full,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[4],
      }}
    >
      <Text variant="label" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}
