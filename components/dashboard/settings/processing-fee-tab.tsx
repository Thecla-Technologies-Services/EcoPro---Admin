"use client";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { IoAlertCircleOutline } from "react-icons/io5";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { processingSchema } from "@/lib/validations/settings";

type ProcessingFeeFormValues = z.input<typeof processingSchema>;

export default function ProcessingFeeTab({ onSave }: { onSave: () => void }) {
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<ProcessingFeeFormValues>({
    resolver: zodResolver(processingSchema),
    defaultValues: {
      feeType: "percentage",
      processingFee: 2.5,
      capMaxFee: true,
      maxFeeAmount: 500000,
      swapFee: 50,
      testItemPrice: 50000,
    },
  });

  const feeType = useWatch({ control, name: "feeType" }) ?? "percentage";
  const processingFee = Number(useWatch({ control, name: "processingFee" }) ?? 0);
  const capMaxFee = useWatch({ control, name: "capMaxFee" }) ?? false;
  const swapFee = Number(useWatch({ control, name: "swapFee" }) ?? 0);
  const testItemPrice = Number(useWatch({ control, name: "testItemPrice" }) ?? 0);

  // Live fee preview
  const itemPrice = testItemPrice || 0;
  const platformFee = feeType === "percentage"
    ? Math.min(itemPrice * (processingFee / 100), capMaxFee ? 500000 : Infinity)
    : processingFee;
  const userPays = itemPrice + platformFee;

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left */}
        <div className="space-y-4">
          {/* Marketplace Sales */}
          <div className="bg-muted/40 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold">Marketplace Sales</h2>
              <p className="text-sm text-muted-foreground">Set how processing fees are calculated for buying and selling items</p>
            </div>

            {/* Fee type toggle */}
            <div className="grid grid-cols-2 bg-primary/10 rounded-xl p-1">
              {["percentage", "flat"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue("feeType", type as "percentage" | "flat")}
                  className={cn(
                    "rounded-lg py-2 text-sm font-medium transition-all capitalize",
                    feeType === type
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type === "percentage" ? "Percentage" : "Flat Rate"}
                </button>
              ))}
            </div>

            {/* Processing fee */}
            <div className="border bg-white border-border rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Processing Fee (%)</p>
              <input
                {...register("processingFee")}
                type="number"
                step="0.1"
                className="bg-transparent text-sm font-medium outline-none w-full"
              />
            </div>
            {errors.processingFee && <p className="text-xs text-destructive">{errors.processingFee.message}</p>}

            {/* Cap max fee */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 border",
                capMaxFee ? "border-primary/30 bg-primary/5" : "border-border"
              )}
            >
              <Checkbox
                checked={capMaxFee}
                onCheckedChange={(v) => setValue("capMaxFee", !!v)}
                className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div>
                <p className="text-sm font-medium">Cap maximum fee</p>
                <p className="text-xs text-muted-foreground">Prevents extremely high fees on expensive items</p>
              </div>
            </div>

            {capMaxFee && (
              <div className="border bg-white border-border rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Max Fee Amount</p>
                <input
                  {...register("maxFeeAmount")}
                  type="number"
                  className="bg-transparent text-sm font-medium outline-none w-full"
                />
              </div>
            )}
          </div>

          {/* Item Swap */}
          <div className="bg-muted/40  rounded-lg md:rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold">Item Swap</h2>
              <p className="text-sm text-muted-foreground">
                Swaps rely on withholding deposits. Set the platform service fee for facilitating a successful swap.
              </p>
            </div>
            <div className="border border-border rounded-xl bg-white px-3 md:px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Flat Swap Fee</p>
              <input
                {...register("swapFee")}
                type="number"
                className="bg-transparent text-sm font-medium outline-none w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">Charged per user when swap is successfully completed</p>
          </div>
        </div>

        {/* Right — Live Preview */}
        <div className="bg-background max-w-md rounded-2xl p-6 space-y-4 h-fit shadow-shadow-subtle">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-sm bg-primary/20 flex items-center justify-center">
              <IoAlertCircleOutline className="size-4.5 text-primary" />
            </div>
            <h2 className="font-semibold">Live Fee Preview</h2>
          </div>

          {/* Test price input */}
          <div className="border bg-white border-border rounded-xl px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Test Item Price</p>
            <input
              {...register("testItemPrice")}
              type="number"
              className="bg-transparent text-sm font-medium outline-none w-full"
            />
          </div>

          {/* Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Item Price</span>
              <span className="font-medium">₦{itemPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Platform Fee<br />
                <span className="text-xs">{`${processingFee || 0}%`}</span>
              </span>
              <span className="font-medium text-primary">+₦{platformFee?.toLocaleString()}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold">User Pays</span>
              <span className="font-bold text-base">₦{userPays?.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <hr className="border-border" />

          <div className="grid gap-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Swap transactions:</p>
            <div className="flex justify-between text-sm bg-primary/5 p-3">
              <span className="text-foreground text-xs font-medium">Platform Fee (per user)</span>
              <span className="font-medium text-primary">₦{(swapFee || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => {}}>
          Discard Changes
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
          Save & Apply Changes
        </Button>
      </div>
    </form>
  );
}