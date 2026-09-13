"use client";

import { useMemo, useState } from "react";
import { Edit2 } from "lucide-react";

import { EditProfileForm } from "./edit-user";
import { DeliveryDocumentsTab } from "./delivery/documents-tab";
import { ProfileView } from "./view-user";
import { ListingTab } from "./listing-tab";
import { WalletHistoryTab } from "./wallet-history";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toInitials } from "@/lib/adapters/shared";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Tab, ViewUserSheetProps } from "@/types/user";
import { OrderList } from "./delivery/order-list";
import { useUser } from "@/hooks/admin/use-users";
import { toUserDetails } from "@/lib/adapters/user";
import { DataState } from "@/components/shared/data-state";
import { Skeleton } from "@/components/ui/skeleton";

const triggerClassName =
  // `shrink-0` so a tab keeps its width in the scrolling row rather than being
  // squeezed until its label wraps.
  "shrink-0 whitespace-nowrap bg-[#F2F2F2] text-gray-500 hover:bg-gray-200 py-4 rounded-md transition-all font-medium data-[state=active]:text-primary data-[state=active]:bg-primary/7 data-[state=active]:shadow-none px-3 text-sm";

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
        content: (
          <DataState>
            <DataState.Error
              when={detailFailed}
              error={detailError}
              onRetry={() => refetchDetail()}
            />
            <DataState.Loading when={detailPending}>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </DataState.Loading>
            <DataState.Content>
              <ProfileView user={user} />
            </DataState.Content>
          </DataState>
        ),
      },
    ];

    /**
     * Every role gets it: the API models listings per account rather than per
     * kind — `totalListings` is on every user's detail record, and
     * `GET /users/{userId}/listings` takes a user id with no role gate. A role
     * that does not list reads as a count of zero and an empty tab, which is
     * the truth rather than a tab withheld on a guess about who may sell.
     */
    items.push({
      value: "Listing" as Tab,
      label: `Listings (${user.totalListings ?? 0})`,
      content: <ListingTab userId={user.id} />,
    });

    // Delivery partners carry two things no other role has: the documents on
    // their partner record, and the orders they have been assigned.
    if (user.role === "Delivery") {
      items.push({
        value: "Documents" as Tab,
        label: "Documents",
        content: <DeliveryDocumentsTab userId={user.id} />,
      });
      items.push({
        value: "Order" as Tab,
        label: "Orders",
        content: <OrderList userId={user.id} />,
      });
    }
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
        {/* Capped against the viewport rather than left to grow: the header and
            the tab strip stay put and the body below them is the one thing that
            scrolls, however long a profile runs. */}
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[85vh] w-full flex-col p-0 sm:max-w-lg"
        >
          {/* Header */}
          {isEditMode ? (
            <div className="flex items-center p-5 border-b border-[#E2E4E9]">
              <DialogTitle>Edit User</DialogTitle>
              <DialogClose className="text-muted-foreground hover:text-foreground" />
            </div>
          ) : (
            <div className="flex items-start gap-3 p-5 border-b border-[#E2E4E9]">
              <DialogTitle className="sr-only">
                {user.name}&apos;s profile
              </DialogTitle>

              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {toInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
                {/* The short account code an admin can read and quote, not the
                    raw uuid the endpoints are addressed by. */}
                <p className="text-xs text-gray-400">{user.code}</p>
              </div>

              <DialogClose className="text-muted-foreground hover:text-foreground" />
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
              {/* The gutter is on this wrapper, not on the scrolling row: it
                  insets the scroll viewport itself, so the row is cut short of
                  the sheet's edge and the gap is visible straight away rather
                  than only once you reach the end of the scroll. */}
              <div className="px-3 md:px-5">
                <TabsList className="scrollbar-hide h-12 w-full justify-start gap-2 overflow-x-auto rounded-none bg-transparent p-0">
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
              </div>

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
        description={`The profile for ${user.name} (${user.code}) has been updated`}
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
