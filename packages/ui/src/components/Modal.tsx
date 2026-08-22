import type { ReactNode } from "react";
import { Modal as RNModal, Pressable, ScrollView, View } from "react-native";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";
import { shadows } from "../tokens/shadows";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

// Built on RN's core Modal (not a web-only dialog kit) so the same
// edit/create flow works on native and RN-Web without structural forks.
export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(26, 22, 17, 0.5)",
          alignItems: "center",
          justifyContent: "center",
          padding: spacing[5],
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            {
              width: "100%",
              maxWidth: 480,
              maxHeight: "85%",
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              padding: spacing[6],
              gap: spacing[5],
            },
            shadows.lg,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="h3">{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <Text variant="h3" color="muted">
                ×
              </Text>
            </Pressable>
          </View>
          <ScrollView>{children}</ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
