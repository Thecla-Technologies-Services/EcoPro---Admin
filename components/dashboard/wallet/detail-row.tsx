import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/shared/detail-list";

/**
 * Withdrawal / escrow facts — the shared list's `stacked` row, with the label
 * above the value and a hairline between entries.
 */
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
    <DetailList.Row
      variant="stacked"
      label={label}
      value={value}
      valueClassName={valueClassName}
    />
  );
}

/**
 * Terminal step of the escrow flows.
 *
 * These dialogs already own their own shell, so this stays a plain block rather
 * than an `ActionDialog` — it is dropped inside the open dialog's content.
 */
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
          alt=""
          width={90}
          height={90}
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        {description}
      </p>
      <Button
        className="w-full bg-[#2D7A4F] hover:bg-[#235f3d] text-white rounded-full"
        onClick={onDone}
      >
        Done
      </Button>
    </div>
  );
}
