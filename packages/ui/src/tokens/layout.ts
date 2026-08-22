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
  containerPadding: 16,
  gutter: 16,
} as const;
