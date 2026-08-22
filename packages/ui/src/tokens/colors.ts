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
export const statusColors = {
  pending: { bg: neutral[100], fg: neutral[700], border: neutral[300] },
  confirmed: { bg: info[100], fg: info[700], border: info[500] },
  preparing: { bg: warning[100], fg: warning[700], border: warning[500] },
  ready: { bg: brand[100], fg: brand[700], border: brand[500] },
  completed: { bg: success[100], fg: success[700], border: success[500] },
  cancelled: { bg: danger[100], fg: danger[700], border: danger[500] },
} as const;

export const colors = {
  brand,
  neutral,
  success,
  warning,
  danger,
  info,
  status: statusColors,

  background: neutral[50],
  surface: neutral[0],
  border: neutral[200],
  borderStrong: neutral[300],

  textPrimary: neutral[900],
  textSecondary: neutral[600],
  textMuted: neutral[400],
  textOnBrand: neutral[0],

  focusRing: brand[400],
} as const;
