// System font stack (no custom font loading) — deliberate scope choice for a
// take-home; RN falls back to the platform default, RN-Web to the browser's.
export const typography = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: "700" as const },
  h1: { fontSize: 28, lineHeight: 35, fontWeight: "700" as const },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: "600" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const },
} as const;

export type TypographyVariant = keyof typeof typography;
