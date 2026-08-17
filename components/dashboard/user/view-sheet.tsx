"use client";

import { useMemo, useState } from "react";
import { Edit2, } from "lucide-react";

import { EditProfileForm } from "./edit-user";
import { ProfileView } from "./view-user";
import { ListingTab } from "./listing-tab";
import { WalletHistoryTab } from "./wallet-history";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { Dialog, DialogContent,   DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Tab, ViewUserSheetProps } from "@/types/user";
import { OrderList } from "./delivery/order-list";
import { useUser } from "@/hooks/admin/use-users";
import { toUserDetails } from "@/lib/adapters/user";
import { QueryError } from "@/components/shared/query-error";
import { Skeleton } from "@/components/ui/skeleton";

const triggerClassName =
  "bg-[#F2F2F2] text-gray-500 hover:bg-gray-200 py-4 rounded-md transition-all font-medium data-[state=active]:text-primary data-[state=active]:bg-primary/7 data-[state=active]:shadow-none px-3 text-sm";

export function ViewUserSheet({
  user: row,
  open,
  onClose,
  editMode = false,
}: ViewUserSheetProps) {
  const [tab, setTab] = useState<Tab>("Profile");
  const [isEditMode, setIsEditMode] = useState(editMode);
  const [saveConfirm, setSaveConfirm] = useState(false);

  // The table row has enough to render the header immediately; the detail
  // endpoint fills in phone, bank details, KYC and the activity figures.
  const {
    data: detailData,
    isPending: detailPending,
    isError: detailFailed,
    error: detailError,
    refetch: refetchDetail,
  } = useUser(open ? row.id : undefined);
  const user = detailData ? toUserDetails(detailData, row) : row;

  const tabs = useMemo(() => {
    const items = [
      {
        value: "Profile" as Tab,
        label: "Profile",
        content: detailPending ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : detailFailed ? (
          <QueryError error={detailError} onRetry={() => refetchDetail()} />
        ) : (
          <ProfileView user={user} />
        ),
      },
    ];

    if (user.role === "Delivery") {
      items.push({
        value: "Documents" as Tab,
        label: "Documents",
        content: <ListingTab userId={user.id} />,
      });
      items.push({
        value: "Order" as Tab,
        label: "Orders",
        content: <OrderList />,
      });
    } else if (user?.role === "NGO") {
      items.push({
        value: "Listing" as Tab,
        label: `Listing (${user.totalListings ?? 0})`,
        content: <ListingTab userId={user.id} />,
      });
    } else if (user?.role === "Individual")
      items.push({
        value: "Listing" as Tab,
        label: `Listings (${user.totalListings ?? 0})`,
        content: <ListingTab userId={user.id} />,
      });
    items.push({
      value: "WalletHistory" as Tab,
      label: "Wallet History",
      content: (
        <WalletHistoryTab
          userId={user.id}
          balance={user.balance}
          ecoPoints={user.ecoPoints}
        />
      ),
    });

    return items;
  }, [user, detailPending, detailFailed, detailError, refetchDetail]);

  const handleClose = () => {
    setTab("Profile");
    setIsEditMode(false);
    onClose();
  };

  return (
    <>
      <Dialog
        key={`${user.id}-${String(open)}`}
        open={open}
        onOpenChange={handleClose}
      >
        <DialogContent className="w-full sm:max-w-lg p-0 flex flex-col">
          {/* Header */}
          {isEditMode ? (
            <div className="p-5 border-b border-gray-100">
              <DialogTitle>Edit User</DialogTitle>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-5 border-b border-gray-100">
              <DialogTitle className="sr-only">
                {user.name}&apos;s profile
              </DialogTitle>

              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-400">{user.id}</p>
              </div>

             <DialogClose className="text-muted-foreground hover:text-foreground">
            
            </DialogClose>
            </div>
          )}

          {/* Body */}
          {isEditMode ? (
            <div className="flex-1 overflow-y-auto px-3 md:px-5 pb-5 pt-3">
              <EditProfileForm
                user={user}
                onSave={() => setSaveConfirm(true)}
                onCancel={() => setIsEditMode(false)}
              />
            </div>
          ) : (
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as Tab)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <TabsList className="w-full h-12 px-3 md:px-5 gap-2 justify-start rounded-none bg-transparent">
                {tabs.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className={triggerClassName}
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-y-auto px-3 md:px-5 pb-5">
                {tabs
                  .filter((item) => item.value === tab)
                  .map((item) => (
                    <TabsContent
                      key={item.value}
                      value={item.value}
                      className="mt-6"
                      forceMount
                    >
                      {item.content}
                    </TabsContent>
                  ))}
              </div>

              {tab === "Profile" && (
                <div className="px-3 md:px-5 pb-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={handleClose}
                  >
                    Close
                  </Button>

                  <Button
                    className="flex-1 rounded-full gap-2"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit User
                  </Button>
                </div>
              )}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={saveConfirm}
        onOpenChange={setSaveConfirm}
        title="Changes Saved Successfully"
        description={`The profile for ${user.name} (${user.id}) has been updated`}
        status="confirmed"
      >
        <Button
          className="w-full rounded-full"
          onClick={() => {
            setSaveConfirm(false);
            handleClose();
          }}
        >
          Done
        </Button>
      </ConfirmActionDialog>
    </>
  );
}
