import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect logs a warning during SSR. GSAP animations must run after
 * layout, so we use useLayoutEffect on the client and fall back to useEffect on
 * the server. Use this in every GSAP hook.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
