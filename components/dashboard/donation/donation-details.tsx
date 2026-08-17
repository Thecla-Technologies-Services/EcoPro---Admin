"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DeliveryTimeline } from "./delivery-timeline";
import type { DonationRecord, DeliveryMethod } from "@/types/donation";
import { PersonCard } from "../../shared/person-card";
import { ItemCard } from "./item-card";
import { InfoRow } from "./info-row";
import { StatusBadge } from "@/components/shared/status-badge";

function DeliveryBadge({ method }: { method?: DeliveryMethod }) {
  if (!method) return null;
  const color =
    method === "Home Delivery"
      ? "bg-blue-50 text-blue-600"
      : "bg-purple-50 text-purple-600";
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", color)}>
      {method}
    </span>
  );
}

interface DonationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: DonationRecord | null;
}

export function DonationDetailsDialog({
  open,
  onOpenChange,
  donation,
}: DonationDetailsDialogProps) {
  if (!donation) return null;

  const isMonetary = donation.type === "Monetary";
  const isPickup = donation.deliveryMethod === "Pickup";
  const showDeliveryTab = !isMonetary;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-5 max-h-[90vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
       
        </DialogClose>

        {/* Header */}
        <div className="flex items-start gap-2 mb-3 pr-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-sm font-semibold text-gray-900">
                Donation Details
              </DialogTitle>
              {donation.deliveryMethod && (
                <DeliveryBadge method={donation.deliveryMethod} />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {donation.orderId}&nbsp;·&nbsp;Created {donation.createdAt}
            </p>
          </div>
        </div>

        <DialogDescription className="sr-only">
          Donation details for order {donation.orderId}
        </DialogDescription>

        <Tabs key={String(open)} defaultValue="donation">
          <TabsList className="h-auto bg-transparent gap-2 flex-wrap justify-start p-0 mb-4">
            <TabsTrigger
              value="donation"
              className="text-sm px-2 py-3 rounded-md bg-[#F2F2F2] text-gray-500 hover:bg-gray-200 transition-all font-medium
                data-[state=active]:bg-primary/7 data-[state=active]:text-primary
                 data-[state=active]:shadow-none"
            >
              Donation Details
            </TabsTrigger>

            <TabsTrigger
              value="people"
              className="text-sm px-2 py-3 rounded-md bg-[#F2F2F2] text-gray-500 hover:bg-gray-200 transition-all font-medium
                data-[state=active]:bg-primary/7 data-[state=active]:text-primary
                 data-[state=active]:shadow-none"
            >
              Donor &amp; Recipient Details
            </TabsTrigger>

            {showDeliveryTab && (
              <TabsTrigger
                value="delivery"
                className="text-sm px-2 py-3 rounded-md bg-[#F2F2F2] text-gray-500 hover:bg-gray-200 transition-all font-medium
                  data-[state=active]:bg-primary/7 data-[state=active]:text-primary
                   data-[state=active]:shadow-none"
              >
                Delivery Information
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── Donation Details ── */}
          <TabsContent value="donation" className="mt-4 md:mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Donation Information
            </h4>

            {isMonetary ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-800">
                    {donation.description ?? "Donation for you"}
                  </p>
                  <span className="text-xs bg-[#2D7A4F] text-white px-2 py-0.5 rounded-full font-medium">
                    Donate
                  </span>
                </div>
                <div className="flex flex-col divide-y divide-gray-100">
                  <InfoRow
                    label="Amount"
                    value={donation.monetaryAmount ?? ""}
                  />
                  <InfoRow label="Donation Type" value="Monetary" />
                  <InfoRow
                    label="Payment Method"
                    value={donation.paymentMethod ?? "Wallet"}
                  />
                  <InfoRow
                    label="Paid Status"
                    value={donation.paidStatus ?? "Paid"}
                  />
                </div>
              </>
            ) : (
              <>
                <ItemCard
                  title={donation.item}
                  category={donation.itemCategory}
                  image={donation.itemImage}
                />
                <div className="flex flex-col divide-y divide-gray-100">
                  <InfoRow label="Amount" value={donation.amount ?? "Free"} />
                  <InfoRow label="Donation Type" value="Material" />
                  <InfoRow
                    label="Delivery Status"
                    value={
                      <StatusBadge
                        status={donation.deliveryStatus ?? donation.status}
                      />
                    }
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* ── Donor & Recipient / Buyer & Seller ── */}
          <TabsContent value="people" className="mt-4 md:mt-6">
            {isPickup ? (
              <>
                {donation.buyerDetails && (
                  <PersonCard person={donation.buyerDetails} />
                )}
                {donation.sellerDetails && (
                  <PersonCard person={donation.sellerDetails} />
                )}
              </>
            ) : (
              <>
                {donation.donorDetails && (
                  <PersonCard person={donation.donorDetails} />
                )}
                {donation.recipientDetails && (
                  <PersonCard person={donation.recipientDetails} />
                )}
              </>
            )}
          </TabsContent>

          {/* ── Delivery Information ── */}
          {showDeliveryTab && (
            <TabsContent value="delivery" className="mt-4 md:mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Delivery Information
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Delivery Method</p>
                  <p className="text-xs font-medium text-gray-800 mt-0.5">
                    {donation.deliveryCompany ?? "GIG Logistics"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">
                    {isPickup ? "Pickup Address" : "Destination"}
                  </p>
                  <p className="text-xs font-medium text-gray-800 mt-0.5">
                    {donation.pickupAddress ?? donation.destination ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <StatusBadge
                    status={donation.deliveryStatus ?? donation.status}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400">
                    Expected Delivery Date
                  </p>
                  <p className="text-xs font-medium text-gray-800 mt-0.5">
                    {donation.expectedDeliveryDate ?? "—"}
                  </p>
                </div>
              </div>

              {donation.deliveryTimeline && (
                <DeliveryTimeline steps={donation.deliveryTimeline} />
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
