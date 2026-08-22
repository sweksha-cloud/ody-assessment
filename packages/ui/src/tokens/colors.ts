// Warm, saturated brand palette — deliberately not a neutral SaaS gray system.
// Semantic colors are reserved for meaning (status, success/warning/danger)
// and never reused decoratively, so they stay legible everywhere they appear.

export const brand = {
  50: "#FFF4ED",
  100: "#FFE6D5",
  200: "#FFC9A8",
  300: "#FFA36B",
  400: "#FF7A33",
  500: "#E8590C",
  600: "#C2440A",
  700: "#9A350C",
  800: "#7C2D10",
  900: "#672710",
} as const;

// Warm-tinted neutral scale (matches the brand's warmth instead of a cold gray).
export const neutral = {
  0: "#FFFFFF",
  50: "#FFFBF7",
  100: "#F5EFE9",
  200: "#E8DFD6",
  300: "#D3C6B8",
  400: "#A99885",
  500: "#7D6E5E",
  600: "#5C5044",
  700: "#423A31",
  800: "#2B241D",
  900: "#1A1611",
} as const;

export const success = {
  100: "#DFF5E6",
  500: "#1E9E5A",
  700: "#136B3D",
} as const;

export const warning = {
  100: "#FDECC8",
  500: "#D98C0A",
  700: "#8F5C05",
} as const;

export const danger = {
  100: "#FBE0DE",
  500: "#D64545",
  700: "#992C2C",
} as const;

export const info = {
  100: "#DCEAF7",
  500: "#2E7DBE",
  700: "#1E5580",
} as const;

// One entry per OrderStatus value — the only place status -> color is decided.
// "pending" gets a stronger neutral than the semantic scale below (bg/fg/border
// one step darker than a plain "100/700/300" reading) so it doesn't read as a
// washed-out, indeterminate pill next to the saturated statuses around it.
export const statusColors = {
  pending: { bg: neutral[200], fg: neutral[800], border: neutral[400] },
  confirmed: { bg: info[100], fg: info[700], border: info[500] },
  preparing: { bg: warning[100], fg: warning[700], border: warning[500] },
  ready: { bg: brand[100], fg: brand[700], border: brand[500] },
  completed: { bg: success[100], fg: success[700], border: success[500] },
  cancelled: { bg: danger[100], fg: danger[700], border: danger[500] },
} as const;

// Standardized bg/fg/border triples for the four semantic meanings — the
// single place a "success banner" or "danger inline message" picks its
// three colors from, instead of each call site reaching into success[700]
// vs success[500] ad hoc. Same 100/700/500 shape as statusColors above.
export const semantic = {
  success: { bg: success[100], fg: success[700], border: success[500] },
  warning: { bg: warning[100], fg: warning[700], border: warning[500] },
  danger: { bg: danger[100], fg: danger[700], border: danger[500] },
  info: { bg: info[100], fg: info[700], border: info[500] },
} as const;

export const colors = {
  brand,
  neutral,
  success,
  warning,
  danger,
  info,
  status: statusColors,
  semantic,

  // background sits one step below surface (was nearly indistinguishable
  // at neutral[50], ~1.03:1) so cards visibly separate from the page.
  background: neutral[100],
  surface: neutral[0],
  // border (decorative hairlines/card edges, reinforced by shadow) vs.
  // borderStrong (the sole boundary cue on interactive controls like
  // TextField/Select, held to WCAG 1.4.11's ~3:1 non-text contrast target).
  border: neutral[300],
  borderStrong: neutral[500],

  textPrimary: neutral[900],
  textSecondary: neutral[600],
  // was neutral[400] (2.79:1 vs white — fails WCAG AA); neutral[500] clears
  // the 4.5:1 normal-text minimum.
  textMuted: neutral[500],
  textOnBrand: neutral[0],

  // was brand[400] (2.60:1 vs white — under the 3:1 non-text minimum for
  // focus indicators); brand[500] clears it against both white and the
  // new background tone.
  focusRing: brand[500],
} as const;
