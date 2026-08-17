"use client";
import { useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap, easings, durations } from "@/lib/gsap";

export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: durations.normal,
          ease: easings.enter,
          clearProps: "all",
        }
      );
    });

    return () => ctx.revert();
  }, [pathname]); 

  return <div ref={ref}>{children}</div>;
}