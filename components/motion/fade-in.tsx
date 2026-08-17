"use client";
import { useRef, useEffect, ReactNode } from "react";
import { gsap, easings, durations } from "@/lib/gsap";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: durations.enter, ease: easings.enter, delay }
      );
    });
    return () => ctx.revert();
  }, [delay]);

  return <div ref={ref} className={className}>{children}</div>;
}