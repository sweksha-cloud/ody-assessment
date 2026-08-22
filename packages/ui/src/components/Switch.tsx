import { useState } from "react";
import { Switch as RNSwitch, View } from "react-native";
import { colors } from "../tokens/colors";
import { focusRingStyle } from "../tokens/focusRing";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type SwitchProps = {
  label?: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

// Two things RN's bundled Switch types don't declare, even though the
// underlying control supports both: react-native-web's web-only
// activeThumbColor for the ON-state thumb (defaulting to a hardcoded
// teal, #009688, when unset — thumbColor alone only covers OFF; this is
// the exact bug behind the previous orange-track/teal-thumb look), and
// onFocus/onBlur (the control is natively focusable on every platform).
// Bundled as a typed prop bag instead of inline JSX attributes, which
// would fail typecheck against SwitchProps.
function extraProps(onFocus: () => void, onBlur: () => void): Record<string, unknown> {
  return { activeThumbColor: colors.switch.thumb, onFocus, onBlur };
}

export function Switch({ label, description, value, onValueChange, disabled }: SwitchProps) {
  const [focused, setFocused] = useState(false);
  const trackColor = disabled ? colors.switch.disabledTrack : colors.switch.offTrack;
  const activeTrackColor = disabled ? colors.switch.disabledTrack : colors.switch.onTrack;

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
        trackColor={{ false: trackColor, true: activeTrackColor }}
        thumbColor={colors.switch.thumb}
        {...extraProps(
          () => setFocused(true),
          () => setFocused(false),
        )}
        ios_backgroundColor={trackColor}
        style={[{ borderRadius: 999 }, focused && !disabled ? focusRingStyle : null]}
      />
    </View>
  );
}
