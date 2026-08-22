import { View } from "react-native";
import { spacing } from "../tokens/spacing";
import { BrandMark } from "./BrandMark";
import { Text, type TextColor } from "./Text";

export type LogoProps = {
  size?: number;
  // Light surface (UI Library showcase) vs. the dark nav bar — decides
  // whether the wordmark uses inverse or primary text tokens.
  tone?: "light" | "dark";
  // "Restaurant Operations"/"Restaurant Ops" only render where the
  // caller has room for them — this never assumes it.
  descriptor?: "full" | "compact" | "none";
};

const DESCRIPTOR_TEXT = { full: "Restaurant Operations", compact: "Restaurant Ops", none: null } as const;

// The BrandMark paired with the ServiceLine wordmark — the one place the
// product identity is assembled, so the nav bar and the UI Library
// showcase render the exact same lockup rather than two lookalikes.
export function Logo({ size = 28, tone = "dark", descriptor = "none" }: LogoProps) {
  const wordmarkColor: TextColor = tone === "dark" ? "inverse" : "primary";
  const descriptorColor: TextColor = tone === "dark" ? "inverseMuted" : "muted";
  const descriptorText = DESCRIPTOR_TEXT[descriptor];

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
      <BrandMark size={size} />
      <View>
        <Text variant="h3" color={wordmarkColor} style={{ letterSpacing: 0.2 }}>
          ServiceLine
        </Text>
        {descriptorText ? (
          <Text variant="caption" color={descriptorColor}>
            {descriptorText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
