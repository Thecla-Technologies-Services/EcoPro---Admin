"use client";

import { Button } from "@/components/ui/button";

interface ActionItemProps {
  icon: string;
  title: string;
  description: string;
  timeAgo: string;
  actionLabel?: string;
  actionColor?: "green" | "blue";
}

export function ActionItem({
  icon: Icon,
  title,
  description,
  timeAgo,
  actionLabel = "Review",
}: ActionItemProps) {
//   const buttonClass =
//     actionColor === "green"
//       ? "text-green-600 border-green-600 hover:bg-green-50"
//       : "text-blue-600 border-blue-600 hover:bg-blue-50";

  return (
    <div className="grid grid-cols-[1fr_85px] gap-3 md:grid-cols-[1fr_85px_80px] py-2  px-0 md:p-2 text-[#4F4F4F] items-center first:pt-0 last:pb-0">
      <div className="flex items-center gap-2 md:gap-3 ">
        <p className="text-3xl">{Icon}</p>

        <div className="flex-1">
          <p className="font-medium text-[#4F4F4F]">{title}</p>
          <p className="text-sm text-[#4F4F4F]  mt-1">{description}</p>
        </div>
      </div>

      <p className="text-sm font-medium hidden md:inline-block">{timeAgo}</p>

      <div className="flex flex-col items-end  gap-2 ml-4">
        <p className="text-xs font-medium md:hidden inline-block">{timeAgo}</p>
        <Button className={` text-left md:text-center `} variant='link'>{actionLabel}</Button>
      </div>
    </div>
  );
}
