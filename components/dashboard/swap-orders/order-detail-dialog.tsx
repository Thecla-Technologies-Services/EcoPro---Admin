import { Dialog, DialogContent,   DialogClose} from "@/components/ui/dialog";
import DeliveryBadge from "./delivery-badge";
import { StatusBadge } from "../../shared/status-badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Order } from "@/types/order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonCard } from "@/components/shared/person-card";

export default function OrderDetailDialog({
  order,
  open,
  onClose,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-xl! w-full p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}

        <div className="flex items-center justify-between p-4 md:p-6 border-b shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">
              Order Details
            </h2>
            <DeliveryBadge type={order.deliveryType} />
          </div>
              <DialogClose className="text-muted-foreground hover:text-foreground" />
        </div>

        <div className="p-4 md:p-6">
          <p className="text-sm font-semibold text-gray-800">{order.id}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Created Feb 7, 2025 &nbsp;·&nbsp; 2:35 PM
          </p>{" "}
        </div>

        <Tabs
          defaultValue="order-information"
          className="flex flex-col flex-1 overflow-hidden border-none!"
        >
          <div className="overflow-x-auto">
            <TabsList className="h-auto border-none! px-3 md:px-6! bg-transparent gap-2 flex w-full justify-start">
              {[
                { value: "order-information", label: "Order Information" },
                { value: "buyer-seller", label: "Buyer & Seller Details" },
                {
                  value: "delivery-information",
                  label: "Delivery Information",
                },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs md:text-sm px-3 md:px-4 py-2 md:py-3.5 rounded-md font-medium border border-transparent bg-background data-[state=active]:bg-primary/7 data-[state=active]:text-primary data-[state=active]:shadow-none text-gray-500 hover:text-gray-700 transition-all"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent
              value="order-information"
              className="mt-0 px-3 md:px-6 py-5"
            >
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Order Information
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  <AvatarImage
                    className="w-full h-full object-cover"
                    src="/product-images/product-1.png"
                    alt={order.item}
                  />
                  <AvatarFallback className="w-full h-full rounded-lg! object-cover">
                    {order.item.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.item}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.category}
                      </p>
                    </div>
                    <span className="bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {order.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Amount",
                    value: `₦${order.amount.toLocaleString()}.00`,
                  },
                  { label: "Payment Method", value: order.paymentMethod },
                  { label: "Paid Status", value: order.paidStatus },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="buyer-seller"
              className="mt-0 px-3 md:px-6 py-5 space-y-6"
            >
              {[
                {
                  role: "Buyer",
                  name: "Samuel Adebayo",
                  email: order.buyerEmail,
                  userId: order.buyerUserId,
                },
                {
                  role: "Seller",
                  name: "Taiwo Igbira",
                  email: order.sellerEmail,
                  userId: order.sellerUserId,
                },
              ].map(({ role, name, email, userId }) => (
                <div key={role}>
                  <PersonCard person={{ role, name, email, userId }} />
                </div>
              ))}
            </TabsContent>

            <TabsContent
              value="delivery-information"
              className="mt-0 px-3 md:px-6 py-5"
            >
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Delivery Information
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Delivery Method
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.deliveryMethod}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Pickup Address
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.pickupAddress}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Expected Delivery Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.expectedDelivery}
                  </p>
                </div>
              </div>

              {/* Tracking timeline */}
              <div className="space-y-0">
                {order.trackingSteps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full  flex items-center justify-center shrink-0 border-2 border-[#8F8F8F]",
                          step.status === "done"
                            ? "bg-primary border-primary"
                            : step.status === "active"
                              ? "bg-[#1565C0] border-2 p-2 border-[#1565C0]"
                              : "bg-white border-gray-300",
                        )}
                      >
                        {step.status === "done" && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      {i < order.trackingSteps.length - 1 && (
                        <div
                          className={cn(
                            "w-0.5 flex-1 min-h-7",
                            step.status === "done"
                              ? "bg-primary"
                              : "bg-[#8F8F8F]",
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-800">
                        {step.label}
                      </p>
                      {step.note && (
                        <p className="text-xs text-[#1565C0] mt-0.5">
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
