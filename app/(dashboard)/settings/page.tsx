"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import EcoTab from "@/components/dashboard/settings/ecotab";
import PayoutTab from "@/components/dashboard/settings/payout-tab";
import SecurityTab from "@/components/dashboard/settings/security-tab";
import ProcessingFeeTab from "@/components/dashboard/settings/processing-fee-tab";
import NotificationsTab from "@/components/dashboard/settings/notification-tab";
export default function SettingsPage() {
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSave = () => setSuccessOpen(true);

  return (
    <div className="w-full space-y-6">
      <div className="grid gap-2">
        <h1 className="text-2xl md:text-[28px] font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure platform settings and rewards
        </p>
      </div>

      <Tabs defaultValue="eco">
        <div className="overflow-x-auto overflow-y-hidden">
          <TabsList className="bg-transparent border-b border-border mb-6 w-full justify-start rounded-none h-auto p-0 gap-0">
            {[
              { value: "eco", label: "Eco-Impact & Rewards" },
              { value: "payout", label: "Payout & Withdrawals" },
              { value: "security", label: "Security & Login" },
              { value: "notifs", label: "Notifications" },
              { value: "processing", label: "Processing Fee" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent px-4 pb-3 text-sm font-medium text-muted-foreground [state=active]:bg-transparent! hover:text-foreground transition-colors"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="eco">
          <EcoTab onSave={handleSave} />
        </TabsContent>
        <TabsContent value="payout">
          <PayoutTab onSave={handleSave} />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab onSave={handleSave} />
        </TabsContent>
        <TabsContent value="notifs">
          <NotificationsTab onSave={handleSave} />
        </TabsContent>
        <TabsContent value="processing">
          <ProcessingFeeTab onSave={handleSave} />
        </TabsContent>
      </Tabs>

      <ConfirmActionDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title={"Settings Saved Successfully"}
        description={
          "Your changes have been applied and are now active across the platform."
        }
        iconClassName={true ? "text-primary" : "text-muted-foreground"}
      >
        <Button
          className="w-full rounded-full bg-primary ..."
          onClick={() => setSuccessOpen(false)}
        >
          Done
        </Button>
      </ConfirmActionDialog>
    </div>
  );
}
