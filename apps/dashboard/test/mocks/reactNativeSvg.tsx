// Test-only stand-in for react-native-svg. Its real build pulls in
// Fabric/Paper native component registrations and ESM-only transitive
// deps that jsdom has no use for anyway — nothing about actual pixel
// output is under test here, only that components using BrandMark
// render and behave correctly.
import type { ReactNode } from "react";
import { View } from "react-native";

export default function Svg({ children, ...rest }: { children?: ReactNode; [key: string]: unknown }) {
  return <View {...rest}>{children}</View>;
}

export function Defs({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function LinearGradient({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function Rect() {
  return null;
}

export function Stop() {
  return null;
}
