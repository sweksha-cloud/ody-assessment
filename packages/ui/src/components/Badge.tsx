import { View } from "react-native";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type BadgeProps = {
  label: string;
  bg: string;
  fg: string;
  border?: string;
  // Renders a small dot before the label in the same `fg` color, so the
  // status is never communicated through background color alone.
  dot?: boolean;
};

export function Badge({ label, bg, fg, border, dot = false }: BadgeProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[1],
        alignSelf: "flex-start",
        backgroundColor: bg,
        borderColor: border ?? bg,
        borderWidth: 1,
        borderRadius: radii.full,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[4],
      }}
    >
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fg }} /> : null}
      <Text variant="label" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}
