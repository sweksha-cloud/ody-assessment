import type { ReactNode } from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { colors } from "../tokens/colors";
import { typography, type TypographyVariant } from "../tokens/typography";

export type TextColor =
  | "primary"
  | "secondary"
  | "muted"
  | "onBrand"
  | "danger"
  | "success"
  | "warning"
  | "info"
  | "brand"
  // For text placed directly on the dark midnight nav surface — the
  // light-surface primary/secondary/muted colors are illegible there.
  | "inverse"
  | "inverseMuted";

const colorMap: Record<TextColor, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  onBrand: colors.textOnBrand,
  danger: colors.danger.fg,
  success: colors.success.fg,
  warning: colors.warning.fg,
  info: colors.info.fg,
  brand: colors.brand.violet,
  inverse: colors.textInverse,
  inverseMuted: colors.neutral[300],
};

export type TextComponentProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  children?: ReactNode;
};

export function Text({ variant = "body", color = "primary", style, children, ...rest }: TextComponentProps) {
  return (
    <RNText style={[typography[variant], { color: colorMap[color] }, style]} {...rest}>
      {children}
    </RNText>
  );
}
