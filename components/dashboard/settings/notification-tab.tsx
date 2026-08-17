'use client';

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useState } from "react";
const notifItems = [
  { key: "disputes",    label: "New Dispute Filed",     desc: "Get notified when a user files a new dispute" },
  { key: "withdrawals", label: "Pending Withdrawals",   desc: "Withdrawals awaiting manual review" },
  { key: "listings",   label: "Flagged Listings",       desc: "Items flagged by users for review" },
  { key: "system",     label: "System Alerts",          desc: "Critical system errors and downtimes" },
];

export default function NotificationsTab({ onSave }: { onSave: () => void }) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(notifItems.map((n) => [n.key, true]))
  );

  return (
    <div className="space-y-6">
      <div className="bg-muted/40 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Payout & Withdrawal Configuration</h2>
          <p className="text-sm text-muted-foreground">Control automated payout processing and risk thresholds</p>
        </div>
        <hr className="border-border" />

        <div className="space-y-1">
          {notifItems.map((item, i) => (
            <div
              key={item.key}
              className={cn(
                "flex items-center justify-between py-4",
                i < notifItems.length - 1 && "border-b border-border"
              )}
            >
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <Switch
                checked={enabled[item.key]}
                onCheckedChange={(v) => setEnabled((p) => ({ ...p, [item.key]: v }))}
                className="bg-muted-foreground! data-[state=checked]:bg-primary!"
              />
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={onSave}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
      >
        Save Settings
      </Button>
    </div>
  );
}