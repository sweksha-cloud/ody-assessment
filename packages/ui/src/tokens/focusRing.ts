import { Platform } from "react-native";
import { colors } from "./colors";

// The single visible-keyboard-focus treatment shared by every interactive
// primitive (Button, NavLink, Select, TextField, ...) — a solid cobalt
// ring plus a soft outer glow. Centralized here instead of each component
// repeating its own Platform.select so the "what does focus look like"
// answer only lives in one place.
export const focusRingStyle = Platform.select({
  web: {
    outlineWidth: 2,
    outlineColor: colors.focus.ring,
    outlineStyle: "solid" as const,
    outlineOffset: 2,
    boxShadow: `0 0 0 3px ${colors.focus.glow}`,
  },
  default: {
    shadowColor: colors.focus.ring,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
});
