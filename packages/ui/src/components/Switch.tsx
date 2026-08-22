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

// react-native-web's Switch supports a web-only activeThumbColor for the
// ON-state thumb (defaulting to a hardcoded teal, #009688, when unset —
// thumbColor alone only covers OFF), but RN's bundled types don't declare
// it, hence the typed prop bag instead of an inline JSX attribute (which
// would fail typecheck against SwitchProps).
const activeThumbColorProp: Record<string, unknown> = { activeThumbColor: colors.surface };

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
        trackColor={{ false: colors.neutral[400], true: colors.brand[500] }}
        thumbColor={colors.surface}
        {...activeThumbColorProp}
        ios_backgroundColor={colors.neutral[400]}
      />
    </View>
  );
}
