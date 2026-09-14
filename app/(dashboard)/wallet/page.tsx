"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletOverview } from "@/components/dashboard/wallet/wallet-overview";
import { WithdrawalRequestTable } from "@/components/dashboard/wallet/withdrawal-request-table";
import { EscrowStatsCards } from "@/components/dashboard/wallet/escrow-statcard";
import { EscrowManagementTable } from "@/components/dashboard/wallet/escrow-management-table";
import { PageHeader } from "@/components/shared/page-header";
import { CountrySelect } from "@/components/shared/country-select";

export default function WalletPage() {
  return (
    <div className="w-full space-y-6">
      <PageHeader>
        <PageHeader.Heading className="gap-0.5">
          <PageHeader.Title className="font-semibold">Wallet</PageHeader.Title>
          <PageHeader.Description>
            Manage withdrawals, escrow, and financial operations
          </PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <CountrySelect />
        </PageHeader.Actions>
      </PageHeader>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 bg-transparent gap-2 flex-wrap h-auto p-0">
          <TabsTrigger
            value="overview"
            className="text-sm px-4 py-2 md:py-3 rounded-lg font-medium h-10 bg-[#F2F2F2] text-gray-500
              data-[state=active]:bg-[#2D7A4F]/10 data-[state=active]:text-[#2D7A4F] 
              data-[state=active]:shadow-none hover:bg-gray-50"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="withdrawal"
            className="text-sm px-4 py-2 md:py-3 rounded-lg font-medium  h-10 bg-[#F2F2F2] text-gray-500
              data-[state=active]:bg-[#2D7A4F]/10 data-[state=active]:text-[#2D7A4F] 
              data-[state=active]:shadow-none hover:bg-gray-50"
          >
            Withdrawal Request (20)
          </TabsTrigger>
          <TabsTrigger
            value="escrow"
            className="text-sm px-4 py-2 md:py-3 rounded-lg font-medium  h-10 bg-[#F2F2F2] text-gray-500
              data-[state=active]:bg-[#2D7A4F]/10 data-[state=active]:text-[#2D7A4F] 
              data-[state=active]:shadow-none hover:bg-gray-50"
          >
            Escrow Management (18)
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-8 md:mt-0" value="overview">
          <WalletOverview />
        </TabsContent>

        <TabsContent className="mt-8 md:mt-0" value="withdrawal">
          <WithdrawalRequestTable />
        </TabsContent>

        <TabsContent className="mt-8 md:mt-0" value="escrow">
          <div>
            <EscrowStatsCards />
            <EscrowManagementTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
