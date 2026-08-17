import { Package, Truck } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { IoCartOutline } from "react-icons/io5";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import SharedStatCard from "@/components/shared/stat-card";
import VerificationTable from "@/components/dashboard/verification/verification-table";

export default function VerificationPage() {
  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="grid gap-2">
        <h1 className="text-2xl md:text-[28px] font-bold">
          Verification Queue
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and approve partner applications
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 ">
        <FadeIn delay={0.1}>
          <SharedStatCard
            label="Total Applications"
            value={12204}
            icon={IoCartOutline}
          />
        </FadeIn>

        <FadeIn delay={0.2}>
          <SharedStatCard label="Pending Review" value={67} icon={Package} />
        </FadeIn>
        <FadeIn delay={0.3}>
          <SharedStatCard label="Approved" value={198} icon={Truck} />
        </FadeIn>
        <FadeIn delay={0.4}>
          <SharedStatCard
            label="Rejected"
            value={145}
            icon={HiOutlineDocumentCheck}
          />
        </FadeIn>
      </div>
      <VerificationTable />
    </div>
  );
}
