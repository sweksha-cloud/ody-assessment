import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { colors } from "../tokens/colors";

export type GradientViewProps = {
  children?: ReactNode;
  style?: ViewStyle;
};

// The one reusable violet -> cobalt gradient surface in the system —
// reserved for the primary CTA, small logo details, the active nav
// indicator, selected KPI icon tiles, and restrained progress/chart
// accents (see colors.gradient's doc comment). Never used for every
// card, input, or button; most surfaces in the app stay flat.
//
// Built on expo-linear-gradient (a real native module on iOS/Android,
// and CSS gradients under the hood on web via react-native-web) rather
// than a platform-branched CSS-string hack, so this works identically
// everywhere without a web-only special case.
export function GradientView({ children, style }: GradientViewProps) {
  return (
    <LinearGradient
      colors={[colors.gradient.primaryStart, colors.gradient.primaryEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
