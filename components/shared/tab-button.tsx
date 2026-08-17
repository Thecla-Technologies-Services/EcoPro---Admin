import { cn } from "@/lib/utils";

export default function TabButton({
  active,
  flagged,
  onClick,
  children,
}: {
  active: boolean;
  flagged?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-sm px-4 py-3 rounded-md transition-all font-medium",
        active && !flagged && "bg-primary/7 text-primary",
        active && flagged && "bg-red-100 text-red-600",
        !active && "bg-[#F2F2F2] text-gray-500 hover:bg-gray-200",
      )}
    >
      {children}
    </button>
  );
}