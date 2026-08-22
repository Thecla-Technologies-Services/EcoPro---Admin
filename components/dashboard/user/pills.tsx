import type { ListingFilter } from "@/types/user";
import { IoPricetagOutline } from "react-icons/io5";
import { IoMdRepeat } from "react-icons/io";
import { cn } from "@/lib/utils";

/**
 * Accepts any string because listing types come from the API. An unrecognised
 * value renders its own label rather than falling through to "Donate".
 */
export function ListingTypeBadge({ type }: { type: ListingFilter | string }) {
  if (type === "Sell")
    return (
      <div className="text-xs text-primary flex items-center gap-1 bg-[#E8F5E9] rounded-full w-fit px-2 py-0.5">
        <IoPricetagOutline className="text-primary rotate-y-180 size-3.5" />{" "}
        <span className="font-semibold">For Sale</span>
      </div>
    );
  if (type === "Swap")
    return (
      <div className="text-xs text-[#1565C0] font-semibold flex items-center gap-1 bg-[#E3F2FD] rounded-full w-fit px-2 py-0.5">
        <IoMdRepeat className="text-[#1565C0] size-3.5" /> Swap
      </div>
    );
  if (type === "Pending")
    return (
      <div className="text-xs text-[#6A2AD0] font-semibold flex items-center gap-1 bg-[#6A2AD033] rounded-full w-fit px-2 py-0.5">
        Pending
      </div>
    );
  if (type === "In Transit")
    return (
      <div className="text-xs text-[#1565C0] font-semibold flex items-center gap-1 bg-[#E3F2FD] rounded-full w-fit px-2 py-0.5">
        In Transit
      </div>
    );
  if (type === "Delivered")
    return (
      <div className="text-xs text-[#2E7D32] font-semibold flex items-center gap-1 bg-[#E8F5E9] rounded-full w-fit px-2 py-0.5">
        Delivered
      </div>
    );
  if (type === "Not Delivered")
    return (
      <div className="text-xs text-[#FD3131] font-semibold flex items-center gap-1 bg-[#F6E3E3] rounded-full w-fit px-2 py-0.5">
        Not Delivered
      </div>
    );
  if (type === "Donate")
    return (
      <div className="text-xs text-purple-500 font-semibold flex items-center gap-1 bg-[#F3E5F5] rounded-full w-fit px-2 py-0.5">
        <div>🎁</div> Donate
      </div>
    );
  return (
    <div className="text-xs text-[#3A3A3A] font-semibold flex items-center gap-1 bg-[#F3F5F5] rounded-full w-fit px-2 py-0.5">
      {type}
    </div>
  );
}

export function FilterPills<T extends string>({
  options,
  active,
  onChange,
}: {
  options: T[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
            active === o
              ? "bg-primary text-white border-primary"
              : "bg-transparent text-gray-500 border-gray-200 hover:border-gray-300",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
