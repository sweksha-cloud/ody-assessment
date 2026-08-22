import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";
import { shadows } from "../tokens/shadows";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type ToastVariant = "info" | "success" | "warning" | "danger";

type ToastState = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_COLORS: Record<ToastVariant, { bg: string; fg: string }> = {
  info: { bg: colors.info.fg, fg: colors.textOnBrand },
  success: { bg: colors.success.fg, fg: colors.textOnBrand },
  warning: { bg: colors.warning.fg, fg: colors.textOnBrand },
  danger: { bg: colors.danger.fg, fg: colors.textOnBrand },
};

const AUTO_DISMISS_MS = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }, [opacity]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      setToast({ id: Date.now(), message, variant });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      dismissTimer.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    },
    [opacity, dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <View style={styles.container} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.toast,
              shadows.lg,
              { backgroundColor: VARIANT_COLORS[toast.variant].bg, opacity },
            ]}
          >
            <Text variant="bodyMedium" style={{ color: VARIANT_COLORS[toast.variant].fg }}>
              {toast.message}
            </Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing[8],
    alignItems: "center",
  },
  toast: {
    borderRadius: radii.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    maxWidth: 480,
  },
});
