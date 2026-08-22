import { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, View } from "react-native";
import { colors } from "../tokens/colors";
import { controlHeight } from "../tokens/layout";
import { radii } from "../tokens/radii";
import { spacing } from "../tokens/spacing";
import { Modal } from "./Modal";
import { Text } from "./Text";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export type SelectProps<T extends string> = {
  label?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
};

// Custom Select built on core Modal + FlatList (not a web-only <select> or
// portal-based kit) — the plan calls this out explicitly since RN has no
// native dropdown primitive that works identically on native and RN-Web.
export function Select<T extends string>({ label, value, options, onChange, disabled, placeholder }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: spacing[2] }}>
      {label ? (
        <Text variant="label" color="secondary">
          {label}
        </Text>
      ) : null}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityRole="button"
        style={[
          styles.trigger,
          {
            backgroundColor: disabled ? colors.neutral[100] : hovered ? colors.neutral[50] : colors.surface,
            opacity: disabled ? 0.6 : 1,
          },
          focused && !disabled ? styles.focusRing : null,
        ]}
      >
        <Text variant="body" color={selected ? "primary" : "muted"}>
          {selected?.label ?? placeholder ?? "Select…"}
        </Text>
        <Text variant="body" color="muted">
          ▾
        </Text>
      </Pressable>

      <Modal visible={open} onClose={() => setOpen(false)} title={label ?? "Select an option"}>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          ItemSeparatorComponent={() => <View style={{ height: spacing[2] }} />}
          renderItem={({ item }) => (
            <SelectOptionRow
              label={item.label}
              selected={item.value === value}
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
            />
          )}
        />
      </Modal>
    </View>
  );
}

function SelectOptionRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        {
          paddingVertical: spacing[3],
          paddingHorizontal: spacing[4],
          borderRadius: radii.md,
          minHeight: controlHeight.md,
          justifyContent: "center",
          backgroundColor: selected ? colors.brand[100] : pressed || hovered ? colors.neutral[100] : "transparent",
        },
        focused ? styles.focusRing : null,
      ]}
    >
      <Text variant="bodyMedium" color={selected ? "primary" : "secondary"}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    minHeight: controlHeight.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  focusRing: Platform.select({
    web: { outlineWidth: 2, outlineColor: colors.focusRing, outlineStyle: "solid", outlineOffset: 2 },
    default: {
      shadowColor: colors.focusRing,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
  }),
});
