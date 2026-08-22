import { View } from "react-native";
import { colors } from "../tokens/colors";
import { radii } from "../tokens/radii";
import { GradientView } from "./GradientView";

export type IconContainerTint = "brand" | "cyan" | "success" | "warning" | "danger" | "neutral";

export type IconContainerProps = {
  // Render-prop rather than a plain node: callers get the tint's exact
  // foreground color instead of guessing/duplicating it themselves.
  children: (fg: string) => React.ReactNode;
  tint?: IconContainerTint;
  size?: number;
};

const TINTS: Record<Exclude<IconContainerTint, "brand">, { bg: string; fg: string }> = {
  cyan: { bg: colors.brand.paleCyan, fg: colors.brand.cyan },
  success: { bg: colors.success.bg, fg: colors.success.fg },
  warning: { bg: colors.warning.bg, fg: colors.warning.fg },
  danger: { bg: colors.danger.bg, fg: colors.danger.fg },
  neutral: { bg: colors.neutral[150], fg: colors.textSecondary },
};

// A compact tinted tile for a glyph/icon-like child — used on KPI cards
// and section headers to carry meaning (brand/cyan/success/warning/
// danger) at a glance. "brand" is the one tint that uses the actual
// gradient fill, per the selected-KPI-icon-treatments allowance; every
// other tint stays a flat pale/foreground pair so the gradient doesn't
// get diluted everywhere.
export function IconContainer({ children, tint = "brand", size = 40 }: IconContainerProps) {
  const box = {
    width: size,
    height: size,
    borderRadius: radii.md,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  if (tint === "brand") {
    return <GradientView style={box}>{children(colors.textOnBrand)}</GradientView>;
  }

  const tone = TINTS[tint];
  return <View style={[box, { backgroundColor: tone.bg }]}>{children(tone.fg)}</View>;
}
