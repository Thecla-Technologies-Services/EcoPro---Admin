import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { DISPUTES } from "@/data/disputes";
import { DisputePanel } from "@/components/dashboard/disputes/dispute-panel";

export default async function ViewDisputePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const selected = DISPUTES.find((d) => d.id === id);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-5 mb-6">
        <Link href={"/disputes"}>
          {" "}
          <FaArrowLeft className="size-4!" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-gray-900">
            Dispute
          </h1>
          <p className="text-sm text-gray-400">
            Review and resolve transaction disputes
          </p>
        </div>
      </div>

      <DisputePanel selected={selected!} />
    </div>
  );
}
