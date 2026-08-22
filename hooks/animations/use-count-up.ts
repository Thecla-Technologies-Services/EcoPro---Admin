import { useEffect, useRef } from "react";
import { gsap, easings, durations } from "@/lib/gsap";

export function useCountUp({
  target,
  prefix = "",
  suffix = "",
}: {
  target: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const counter = { val: 0 };
    const el = ref.current;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        counter,
        { val: 0 },
        {
          val: target,
          duration: durations.slow,
          delay: 0.5,
          ease: easings.smooth,
          onUpdate() {
            el.textContent =
              prefix + Math.round(counter.val).toLocaleString() + suffix;
          },
        },
      );
    });

    return () => ctx.revert();
  }, [target, prefix, suffix]);

  return ref;
}
