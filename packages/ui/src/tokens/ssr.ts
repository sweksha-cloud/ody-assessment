import { useEffect, useState } from "react";

// True only after the component has mounted in a real client environment.
// Expo's static web export server-renders pages with no real browser
// window, so anything that branches on `useWindowDimensions()` (or any
// other client-only value) renders differently there than the instant a
// real browser hydrates it — a hydration mismatch (React error #418/#422),
// not just a cosmetic issue. Gating that branch behind this hook keeps the
// first client render identical to the server's; the post-mount effect
// that flips it to true is a normal update, not a hydration mismatch.
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}
