// Test-only stand-in for expo-linear-gradient — a real gradient fill
// isn't observable in jsdom, so this just renders the same View a real
// component using it needs to lay out and behave correctly.
import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";

export function LinearGradient({ children, style }: { children?: ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>;
}
