import { cn } from "@/lib/utils";

export function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-start py-1.5">
      <span className="text-xs text-gray-400 w-32 shrink-0">{label}</span>
      <span className={cn("text-xs text-gray-800 text-right", valueClassName)}>
        {value}
      </span>
    </div>
  );
}