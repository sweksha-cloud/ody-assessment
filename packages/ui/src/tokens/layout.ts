// Breakpoints and content-width rules so the same screens work on a phone
// and a wide desktop browser tab (this app runs on native + RN-Web).
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const layout = {
  maxContentWidth: 1120,
  // Narrower rail for single-column form pages (Settings) — a prop
  // override on PageContainer, not a per-page magic number.
  maxFormWidth: 640,
  containerPadding: 16,
  gutter: 16,
} as const;

// Shared heights for Button/TextField/Select so mixed rows (a button next
// to a text field) line up, and so every tappable control clears a
// reasonable touch target — sm intentionally stays below the 44px "ideal"
// since it's used for dense in-row actions, not primary CTAs.
export const controlHeight = {
  sm: 36,
  md: 40,
  lg: 48,
} as const;
