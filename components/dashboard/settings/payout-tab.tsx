"use client";
import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type PayoutForm, payoutSchema } from "@/lib/validations/settings";
import {
  usePayoutSettings,
  useUpdatePayoutSettings,
} from "@/hooks/admin/use-payouts";
import { toErrorMessage } from "@/lib/api/errors";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { IoShieldOutline } from "react-icons/io5";

/** Used until the API answers, so the fields are never blank-then-filled. */
const FALLBACK: PayoutForm = { autoWithdrawals: true, manualThreshold: 30000 };

export default function PayoutTab({ onSave }: { onSave: () => void }) {
  const settings = usePayoutSettings();
  const update = useUpdatePayoutSettings();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PayoutForm>({
    resolver: zodResolver(payoutSchema) as Resolver<PayoutForm>,
    defaultValues: FALLBACK,
  });

  // The settings arrive after the first render, so the form is seeded rather
  // than initialised — `reset` is what makes the saved values the new baseline.
  useEffect(() => {
    if (!settings.data) return;
    reset({
      autoWithdrawals: settings.data.isInstantPayoutEnabled ?? false,
      manualThreshold:
        settings.data.reviewThresholdAmount ?? FALLBACK.manualThreshold,
    });
  }, [settings.data, reset]);

  const autoWithdrawals = useWatch({
    control,
    name: "autoWithdrawals",
  });

  /**
   * `currency` is sent back unchanged. The update body carries it, but nothing
   * on this screen sets it — dropping it would clear the platform's currency as
   * a side effect of moving a threshold.
   */
  async function onSubmit(values: PayoutForm) {
    await update.mutateAsync({
      isInstantPayoutEnabled: values.autoWithdrawals,
      reviewThresholdAmount: values.manualThreshold,
      currency: settings.data?.currency,
    });
    onSave();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" bg-muted/40 rounded-lg md:rounded-2xl"
    >
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
              <p className="font-semibold text-foreground">
                Enable Automatic Withdrawals
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                When enabled, user withdrawal requests are processed immediately
                via the payment gateway.
              </p>
            </div>
            {settings.isPending ? (
              <Skeleton className="h-6 w-11 rounded-full" />
            ) : (
              <Switch
                checked={autoWithdrawals}
                onCheckedChange={(v) => setValue("autoWithdrawals", v)}
                className="data-[state=checked]:bg-primary"
              />
            )}
          </div>
          {/* Threshold */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IoShieldOutline className="size-4 text-amber-500" />
              <Label className="font-medium text-sm">
                Manual Review Threshold ({settings.data?.currency ?? "₦"})
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Withdrawals above this amount will pause for Admin Approval, even
              if Auto-Withdrawal is ON.
            </p>
            <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-2.5 w-56">
              <span className="text-sm text-muted-foreground">
                {settings.data?.currency ?? "₦"}
              </span>
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

          {/* A failed load must not read as "these are your settings": the
              fields show the fallback, so what they are is worth saying. */}
          {settings.isError && (
            <p role="alert" className="text-xs text-destructive">
              Could not load the saved payout settings ({toErrorMessage(settings.error)}).
              The values shown are defaults, not what is configured.
            </p>
          )}

          {update.isError && (
            <p role="alert" className="text-xs text-destructive">
              {toErrorMessage(update.error)}
            </p>
          )}

          <hr className="border-border" />{" "}
          <Button
            type="submit"
            isLoading={update.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </form>
  );
}
