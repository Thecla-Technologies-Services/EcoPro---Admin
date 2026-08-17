import { useEffect, useRef } from "react";
import { gsap, easings, durations } from "@/lib/gsap";

export function useFadeIn(delay = 0) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: durations.enter,
          ease: easings.enter,
          delay,
        }
      );
    });

    return () => ctx.revert(); // cleanup — critical in Next.js
  }, [delay]);

  return ref;
}