import { Platform } from "react-native";
import { neutral } from "./colors";

function hexToRgba(hex: string, alpha: number) {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// RN-Web wants the CSS `boxShadow` shorthand; native (iOS/Android) has no
// such prop and needs shadow*/elevation instead — Platform.select keeps
// both correct without a deprecation warning on either target.
function shadow(offsetY: number, blur: number, opacity: number, elevation: number) {
  return Platform.select({
    web: { boxShadow: `0px ${offsetY}px ${blur}px ${hexToRgba(neutral[900], opacity)}` },
    default: {
      shadowColor: neutral[900],
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur / 2,
      elevation,
    },
  });
}

export const shadows = {
  none: {},
  sm: shadow(1, 4, 0.08, 1),
  md: shadow(4, 16, 0.12, 3),
  lg: shadow(8, 40, 0.16, 8),
} as const;
