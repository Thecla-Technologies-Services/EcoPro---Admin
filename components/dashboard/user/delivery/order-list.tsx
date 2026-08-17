"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FilterPills, ListingTypeBadge } from "../pills";
import type { ListingFilter } from "@/types/user";
import { deliveryPartnerOrders } from "@/data/user";

export function OrderList() {
  const [filter, setFilter] = useState<ListingFilter>("All");

  const displayed =
    filter === "All"
      ? deliveryPartnerOrders
      : deliveryPartnerOrders.filter((l) => l.status === filter);

  return (
    <div className="space-y-4">
      <FilterPills
        options={
          [
            "All",
            "Pending",
            "Delivered",
            "In Transit",
            "Not Delivered",
          ] as ListingFilter[]
        }
        active={filter}
        onChange={setFilter}
      />

      <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
        {displayed.map((order) => (
          <div key={order.id} className="rounded-xl bg-neutral-50 p-3">
            <div className="flex gap-3">
              <div className="relative h-auto w-25 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                <Image
                  src={order.imageUrl}
                  alt={order.itemName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {order.itemName}
                      </p>
                      <p className="text-xs text-foreground">
                        {order.itemSubtitle}
                      </p>
                      <p className="text-xs text-foreground">
                        Condition: {order.condition}
                      </p>

                      <ListingTypeBadge type={order.status} />
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold text-emerald-600">
                      {order.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                {order.status === "Not Delivered" && order.reason && (
                  <div className="mt-2 text-xs">
                    <span className="text-neutral-400">Reason</span>
                    <p className="text-neutral-700">{order.reason}</p>
                  </div>
                )}

                <div className="mt-2  flex items-center justify-between text-xs text-neutral-500">
                  <div className="space-y-2">
                    <p className="text-[#868686] font-medium text-xs">Pickup</p>
                    <p className="font-medium text-foreground text-sm">
                      {order.pickup}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-foreground" />
                  <div className="text-right space-y-2">
                    <p className="text-[#868686] font-medium text-xs">
                      Drop-off
                    </p>
                    <p className="font-medium text-foreground text-sm">
                      {order.dropoff}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {displayed.length === 0 && (
          <div className="flex flex-col gap-4 items-center justify-center py-16">
            <Image
              src="/assets/images/all-listing-empty.png"
              alt="No listings"
              width={90}
              height={90}
            />

            <p className="text-sm md:text-base font-medium text-foreground">
              No Listed Items for now
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
