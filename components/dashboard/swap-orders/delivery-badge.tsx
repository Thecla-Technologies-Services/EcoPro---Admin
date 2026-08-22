import { cn } from "@/lib/utils";
import { type DeliveryType } from "@/types/order-swap";

export default function DeliveryBadge({ type }: { type: DeliveryType }) {
  const color = type === "Doorstep Delivery" ? "text-blue-500 border-blue-200 bg-blue-50"
    : type === "Inhouse Pickup" ? "text-purple-500 border-purple-200 bg-purple-50"
    : "text-gray-500 border-gray-200 bg-gray-50";
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", color)}>
      {type}
    </span>
  );
}