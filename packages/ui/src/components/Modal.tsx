import { useState, type ReactNode } from "react";
import { Modal as RNModal, Pressable, ScrollView, View } from "react-native";
import { colors } from "../tokens/colors";
import { focusRingStyle } from "../tokens/focusRing";
import { radii } from "../tokens/radii";
import { shadows } from "../tokens/shadows";
import { spacing } from "../tokens/spacing";
import { Text, type TextColor } from "./Text";

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // "dark" renders the panel on the midnight surface family — used for
  // the mobile nav menu, so it reads as part of the command bar rather
  // than a generic light dialog interrupting it.
  tone?: "light" | "dark";
};

// Built on RN's core Modal (not a web-only dialog kit) so the same
// edit/create flow works on native and RN-Web without structural forks.
export function Modal({ visible, onClose, title, children, tone = "light" }: ModalProps) {
  const [closeHovered, setCloseHovered] = useState(false);
  const [closeFocused, setCloseFocused] = useState(false);
  const isDark = tone === "dark";
  const titleColor: TextColor = isDark ? "inverse" : "primary";
  const closeColor: TextColor = isDark ? "inverseMuted" : "muted";

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          // A neutral darkened backdrop (navSurface at low opacity) —
          // never a colored/brand-tinted overlay.
          backgroundColor: "rgba(17, 21, 43, 0.55)",
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
              backgroundColor: isDark ? colors.navSurfaceElevated : colors.surface,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.borderDark,
              borderRadius: radii.lg,
              padding: spacing[6],
              gap: spacing[5],
            },
            // Elevated panels get the strongest shadow tier, for clear
            // separation from the darkened backdrop behind them.
            shadows.xl,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="h3" color={titleColor}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              onHoverIn={() => setCloseHovered(true)}
              onHoverOut={() => setCloseHovered(false)}
              onFocus={() => setCloseFocused(true)}
              onBlur={() => setCloseFocused(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              style={[
                {
                  width: 28,
                  height: 28,
                  borderRadius: radii.sm,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: closeHovered ? (isDark ? "rgba(248, 250, 255, 0.1)" : colors.neutral[100]) : "transparent",
                },
                closeFocused ? focusRingStyle : null,
              ]}
            >
              <Text variant="h3" color={closeColor}>
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
