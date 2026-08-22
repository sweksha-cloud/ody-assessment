import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// Cross-platform "prefers reduced motion" — AccessibilityInfo reads the
// OS-level setting on iOS/Android and react-native-web maps it to the
// `prefers-reduced-motion` media query on web, so this is one hook for
// every platform rather than a `window.matchMedia` web-only branch.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      setReduced(value);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

export const motion = {
  fast: 120,
  base: 180,
  slow: 260,
} as const;
