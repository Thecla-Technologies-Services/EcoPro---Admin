import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
export function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={cn("text-sm font-medium text-gray-900", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

export function SuccessState({
  title,
  description,
  onDone,
}: {
  title: string;
  description: string;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col items-start text-left py-4 px-2">
      <div className="flex justify-start mb-5">
        <Image
          src={"/assets/images/check-circle.gif"}
          alt="Success"
          width={90}
          height={90}
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        {description}
      </p>
      <Button
        variant={"default"}
        className="w-full bg-[#2D7A4F] hover:bg-[#235f3d] text-white rounded-full"
        onClick={onDone}
      >
        Done
      </Button>
    </div>
  );
}
