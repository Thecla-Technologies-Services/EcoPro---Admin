"use client";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type EcoForm, ecoSchema } from "@/lib/validations/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EcoTab({ onSave }: { onSave: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EcoForm>({
    resolver: zodResolver(ecoSchema) as Resolver<EcoForm>,
    defaultValues: {
      pointsPerItem: 10,
      pointsPerKg: 5,
      redemptionThreshold: 1500,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="bg-muted/40 rounded-lg md:rounded-2xl py-5 space-y-5">
        <div className="px-4">
          <h2 className="text-lg font-semibold">Eco-impact & Rewards Engine</h2>
          <p className="text-sm text-muted-foreground">
            Configure point conversion rules and redemption thresholds
          </p>
        </div>
        <hr className="border-border" />

        <div className="space-y-5 px-4">
          <h3 className="font-semibold text-base">Conversion Rules</h3>

          {/* Points per item */}
          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">
              Points per Item Listed
            </Label>
            <div className="flex items-center gap-3">
              <span className="text-sm md:text-base text-foreground whitespace-nowrap">
                1 Item Listed =
              </span>
              <Input
                {...register("pointsPerItem")}
                className="w-24 rounded-lg h-10 md:h-10.5 px-3 py-2 text-sm md:text-base"
                type="number"
              />
              <span className="text-sm md:text-base text-foreground">
                Points
              </span>
            </div>
            {errors.pointsPerItem && (
              <p className="text-xs text-destructive">
                {errors.pointsPerItem.message}
              </p>
            )}
          </div>

          {/* Points per kg */}
          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">
              Points per Kg Waste Diverted
            </Label>
            <div className="flex items-center gap-3">
              <span className="text-sm md:text-base text-foreground whitespace-nowrap">
                1 kg Waste Diverted =
              </span>
              <Input
                {...register("pointsPerKg")}
                className="w-24 h-10 md:h-10.5 rounded-lg px-3 py-2 text-sm md:text-base"
                type="number"
              />
              <span className="text-sm md:text-base text-foreground">
                Points
              </span>
            </div>
            {errors.pointsPerKg && (
              <p className="text-xs text-destructive">
                {errors.pointsPerKg.message}
              </p>
            )}
          </div>

          {/* Redemption threshold */}
          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">
              Redemption Threshold
            </Label>
            <div className="flex items-center gap-3">
              <span className="text-sm md:text-base text-foreground whitespace-nowrap">
                Free Swap Voucher =
              </span>
              <Input
                {...register("redemptionThreshold")}
                className="w-28 h-10 md:h-10.5  text-sm md:text-base px-3 py-2 rounded-lg"
                type="number"
              />
              <span className="text-sm md:text-base text-foreground">
                Points
              </span>
            </div>
            {errors.redemptionThreshold && (
              <p className="text-xs text-destructive">
                {errors.redemptionThreshold.message}
              </p>
            )}
          </div>

          {/* Voucher stat */}
          <div className="bg-primary/10 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground">
              Voucher Usage This Month
            </p>
            <p className="text-4xl font-bold text-primary mt-1">247</p>
            <p className="text-sm text-foreground mt-1">
              Free processing fee vouchers redeemed
            </p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
      >
        Save Settings
      </Button>
    </form>
  );
}
