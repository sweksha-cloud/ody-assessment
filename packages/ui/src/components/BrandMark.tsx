import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { colors } from "../tokens/colors";

export type BrandMarkProps = {
  size?: number;
};

// ServiceLine's mark: three offset rounded bars reading as both a
// coordinated order-flow / kitchen-pass ticket rail and an abstract "S".
// Pure vector (react-native-svg), so it's crisp at any size, works
// identically as a small nav glyph or an app icon, and needs no image
// asset. Filled with the one brand gradient — verified to hold >=3:1
// contrast against both the white surface and the midnight nav surface,
// so it needs no separate light/dark variant.
export function BrandMark({ size = 28 }: BrandMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="serviceLineMark" x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.gradient.primaryStart} />
          <Stop offset="1" stopColor={colors.gradient.primaryEnd} />
        </LinearGradient>
      </Defs>
      <Rect x="6" y="6.5" width="16" height="5" rx="2.5" fill="url(#serviceLineMark)" />
      <Rect x="12" y="13.5" width="14" height="5" rx="2.5" fill="url(#serviceLineMark)" />
      <Rect x="6" y="20.5" width="16" height="5" rx="2.5" fill="url(#serviceLineMark)" />
    </Svg>
  );
}
