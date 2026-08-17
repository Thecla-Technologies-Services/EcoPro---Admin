"use client";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type PayoutForm, payoutSchema } from "@/lib/validations/settings";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IoShieldOutline } from "react-icons/io5";

export default function PayoutTab({ onSave }: { onSave: () => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PayoutForm>({
    resolver: zodResolver(payoutSchema) as Resolver<PayoutForm>,
    defaultValues: { autoWithdrawals: true, manualThreshold: 30000 },
  });

  const autoWithdrawals = useWatch({
    control,
    name: "autoWithdrawals",
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className=" bg-muted/40 rounded-lg md:rounded-2xl">
      <div className="space-y-5 md:space-y-6 py-4 md:py-6">
        <div className="px-4 md:px-6 ">
          <h2 className="text-lg font-semibold">
            Payout & Withdrawal Configuration
          </h2>
          <p className="text-sm text-muted-foreground">
            Control automated payout processing and risk thresholds
          </p>
        </div>
        <hr className="border-border" />

        <div className="bg-background px-3 md:px-6  space-y-5  md:space-y-6">
          {/* Toggle */}
          <div className="flex items-center rounded-lg p-3 md:p-4 justify-between bg-white">
            <div>
              <p className="font-semibold text-foreground">Enable Automatic Withdrawals</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                When enabled, user withdrawal requests are processed immediately
                via the payment gateway.
              </p>
            </div>
            <Switch
              checked={autoWithdrawals}
              onCheckedChange={(v) => setValue("autoWithdrawals", v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          {/* Threshold */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IoShieldOutline className="size-4 text-amber-500" />
              <Label className="font-medium text-sm">Manual Review Threshold (₦)</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Withdrawals above this amount will pause for Admin Approval, even
              if Auto-Withdrawal is ON.
            </p>
            <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-2.5 w-56">
              <span className="text-sm text-muted-foreground">₦</span>
              <input
                {...register("manualThreshold")}
                type="number"
                className="flex-1 bg-transparent text-sm font-medium outline-none"
              />
            </div>
            {errors.manualThreshold && (
              <p className="text-xs text-destructive">
                {errors.manualThreshold.message}
              </p>
            )}
          </div>
          <hr className="border-border" />{" "}
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </form>
  );
}
