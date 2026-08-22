import { View } from "react-native";
import { colors } from "../tokens/colors";
import { spacing } from "../tokens/spacing";
import { GradientView } from "./GradientView";
import { Text } from "./Text";

export type RankedBarProps = {
  label: string;
  value: number;
  maxValue: number;
  valueLabel: string;
};

// A restrained ranked-bar: real relative magnitude (value/maxValue from
// actual data — never a decorative/fake metric), rendered as a filled
// track using the one brand gradient, per its "restrained chart accents"
// allowance.
export function RankedBar({ label, value, maxValue, valueLabel }: RankedBarProps) {
  const pct = maxValue > 0 ? Math.max(4, Math.round((value / maxValue) * 100)) : 0;
  return (
    <View style={{ gap: spacing[2] }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text variant="body">{label}</Text>
        <Text variant="bodyMedium" color="secondary" style={{ fontVariant: ["tabular-nums"] }}>
          {valueLabel}
        </Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.neutral[150], overflow: "hidden" }}>
        <GradientView style={{ width: `${pct}%`, height: "100%", borderRadius: 3 }} />
      </View>
    </View>
  );
}
