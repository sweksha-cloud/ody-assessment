import { Switch as RNSwitch, View } from "react-native";
import { colors } from "../tokens/colors";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type SwitchProps = {
  label?: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function Switch({ label, description, value, onValueChange, disabled }: SwitchProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[4] }}>
      {label ? (
        <View style={{ flexShrink: 1, gap: spacing[1] }}>
          <Text variant="bodyMedium">{label}</Text>
          {description ? (
            <Text variant="caption" color="secondary">
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.neutral[300], true: colors.brand[400] }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.neutral[300]}
      />
    </View>
  );
}
