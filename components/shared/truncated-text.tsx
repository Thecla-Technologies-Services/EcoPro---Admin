"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Text that reveals itself on hover, but only when it is actually clipped.
 *
 * Whether a label overflows depends on the space it is given and the font it
 * renders in, so it is measured rather than declared: a list of "the long ones"
 * is only ever right for the width and typeface it was written against.
 *
 * ```tsx
 * <TruncatedText side="right">{item.label}</TruncatedText>
 * ```
 *
 * The element itself is not styled — truncation comes from whatever class the
 * parent applies (`truncate`, `line-clamp-*`), which is what this then detects.
 */
export function TruncatedText({
  children,
  side = "top",
  className,
}: {
  /** Kept to a string so it can be both rendered and measured. */
  children: string;
  side?: React.ComponentProps<typeof TooltipContent>["side"];
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () =>
      setIsTruncated(node.scrollWidth > node.clientWidth + 1);

    // ResizeObserver reports the element's current size on observe, so the
    // first measurement comes from the callback rather than from a setState in
    // this effect's body.
    const observer = new ResizeObserver(measure);
    observer.observe(node);

    /**
     * A late webfont changes how wide the text draws without changing the box
     * it draws into, so the observer above never fires for it — the clipped
     * width stays put while the text behind it grows.
     */
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [children]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span ref={ref} className={className}>
          {children}
        </span>
      </TooltipTrigger>
      {/* Rendered conditionally rather than swapping the trigger out, so the
          measured span is never unmounted and remounted under its own ref. */}
      {isTruncated && <TooltipContent side={side}>{children}</TooltipContent>}
    </Tooltip>
  );
}
