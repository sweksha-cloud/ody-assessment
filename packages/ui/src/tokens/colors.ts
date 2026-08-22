// ServiceLine brand palette — "modern hospitality command center."
// Cool violet/cobalt/cyan on a light, subtly-tinted application surface,
// with a dark midnight navigation layer. No orange, no warm-brown/beige
// decorative treatments — this file is the single source of color for
// the entire app; nothing hardcodes a hex outside of here.
//
// Every pairing below was checked against WCAG's contrast formula before
// being adopted (see the project's design notes) — most exceed the 4.5:1
// AA text minimum or the 3:1 non-text/UI-component minimum. `textMuted`
// (3.95:1 on white) is the one value in this file that reads as "large
// text only" under strict AA — kept as specified for supplementary text
// (timestamps, captions), never for anything conveying required meaning.

export const foundation = {
  appBackground: "#F3F5FA",
  backgroundTint: "#EDEFFC",
  surfacePrimary: "#FFFFFF",
  surfaceSecondary: "#F7F8FC",
  surfaceElevated: "#FFFFFF",
  navSurface: "#11152B",
  navSurfaceElevated: "#191E3A",
  textPrimary: "#17182B",
  textSecondary: "#555C70",
  textMuted: "#788095",
  textInverse: "#F8FAFF",
  border: "#DCE0EB",
  borderStrong: "#C8CEDD",
  borderDark: "#2B3155",
} as const;

// A cool blue-gray ramp built entirely from the foundation anchors above
// (plus one derived mid-tone, 400, which also doubles as the Switch's
// off-track color) — for the auxiliary needs the named foundation roles
// don't cover: hover tints, skeleton bases, disabled chrome.
export const neutral = {
  0: "#FFFFFF",
  50: "#F7F8FC",
  100: "#F3F5FA",
  150: "#EDEFFC",
  200: "#DCE0EB",
  300: "#C8CEDD",
  400: "#AAB1C1",
  500: "#9299A8",
  600: "#788095",
  700: "#555C70",
  800: "#2B3155",
  900: "#191E3A",
  950: "#11152B",
} as const;

export const brand = {
  violet: "#7257E8",
  violetHover: "#6247D5",
  violetPressed: "#5036B8",
  cobalt: "#3F66E8",
  cyan: "#36BBD0",
  paleViolet: "#EFECFF",
  paleCobalt: "#E9EFFF",
  paleCyan: "#E5F8FB",
  textOnBrand: "#FFFFFF",
} as const;

// The one primary gradient in the system — reserved for the main CTA,
// small logo details, active nav indicators, selected KPI icon tiles,
// and restrained progress/chart accents. Never applied to every card,
// input, or button (see GradientView's own doc comment).
export const gradient = {
  primaryStart: brand.violet,
  primaryEnd: brand.cobalt,
} as const;

export const success = { fg: "#18795B", bg: "#E4F6EE", border: "#90D4B8" } as const;
export const warning = { fg: "#94600B", bg: "#FFF3D6", border: "#E6C56E" } as const;
// hover/pressed are derived (darkened ~12%/~24%) from `fg` specifically
// for the solid-fill danger Button variant, which needs obvious hover/
// press feedback the same way the gradient primary Button does.
export const danger = { fg: "#C33F5A", bg: "#FDE9EE", border: "#E7A1B0", hover: "#AC374F", pressed: "#943044" } as const;
export const info = { fg: "#256BA5", bg: "#E5F2FC", border: "#96C4E5" } as const;
// Cyan "live/operational" tone — for real-time indicators (a live-status
// dot, an in-progress kitchen ticket), not one of the six order statuses.
export const live = { fg: "#17798A", bg: "#E5F8FB", border: "#8ED6DF" } as const;

export const semantic = { success, warning, danger, info, live } as const;

export const disabledTone = {
  bg: "#E9ECF2",
  border: "#D2D7E1",
  text: "#9299A8",
} as const;

export const focus = {
  ring: "#5876F2",
  glow: "rgba(88, 118, 242, 0.22)",
} as const;

// One entry per OrderStatus value, plus the standalone "live" operational
// tone above. "pending" is deliberately a cool neutral, not a semantic
// color, so it reads as "not yet actioned" rather than any particular
// meaning; "ready" uses the brand family (violetPressed text keeps
// contrast at 7.1:1 on paleCobalt — plain cobalt text was a marginal
// 4.27:1) since it's the order's most important “act now” status short
// of a problem state.
export const statusColors = {
  pending: { bg: foundation.backgroundTint, fg: foundation.textSecondary, border: foundation.borderStrong },
  confirmed: { bg: info.bg, fg: info.fg, border: info.border },
  preparing: { bg: warning.bg, fg: warning.fg, border: warning.border },
  ready: { bg: brand.paleCobalt, fg: brand.violetPressed, border: brand.cobalt },
  completed: { bg: success.bg, fg: success.fg, border: success.border },
  cancelled: { bg: danger.bg, fg: danger.fg, border: danger.border },
} as const;

export const switchTone = {
  onTrack: brand.violet,
  offTrack: neutral[400],
  thumb: "#FFFFFF",
  disabledTrack: "#D7DBE2",
} as const;

export const colors = {
  foundation,
  neutral,
  brand,
  gradient,
  success,
  warning,
  danger,
  info,
  live,
  semantic,
  disabled: disabledTone,
  focus,
  status: statusColors,
  switch: switchTone,

  // Ergonomic aliases for the foundation roles used constantly throughout
  // the app, so most components read `colors.background`/`colors.border`
  // rather than reaching into `colors.foundation.*` every time.
  background: foundation.appBackground,
  backgroundTint: foundation.backgroundTint,
  surface: foundation.surfacePrimary,
  surfaceSecondary: foundation.surfaceSecondary,
  surfaceElevated: foundation.surfaceElevated,
  navSurface: foundation.navSurface,
  navSurfaceElevated: foundation.navSurfaceElevated,
  border: foundation.border,
  borderStrong: foundation.borderStrong,
  borderDark: foundation.borderDark,

  textPrimary: foundation.textPrimary,
  textSecondary: foundation.textSecondary,
  textMuted: foundation.textMuted,
  textInverse: foundation.textInverse,
  textOnBrand: brand.textOnBrand,

  focusRing: focus.ring,
  focusGlow: focus.glow,
} as const;
