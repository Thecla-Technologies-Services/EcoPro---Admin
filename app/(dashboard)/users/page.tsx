"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import { RowActions } from "@/components/shared/row-actions";
import SharedStatCard from "@/components/shared/stat-card";
import { UsersPanel } from "@/components/dashboard/users/users-panel";
import { AddUserDialog } from "@/components/dashboard/users/add-user";
import { CreateNgoDialog } from "@/components/dashboard/users/ngo/create-ngo-dialog";
import { CreateDeliveryPartnerDialog } from "@/components/dashboard/users/delivery/create-delivery-partner-dialog";
import { useUsersPanel } from "@/hooks/admin/use-users-panel";
import {
  IoPeopleOutline,
  IoCartOutline,
  IoPersonRemoveOutline,
  IoPersonAddOutline,
} from "react-icons/io5";

/**
 * The admin API has no endpoint that creates a rider — it only reads the ones
 * awaiting verification — so the dialog's submit rejects here rather than
 * showing the credentials for an account that was never opened. Swap this for
 * the mutation when the endpoint lands.
 */
async function createDeliveryPartner(): Promise<void> {
  throw new Error(
    "Delivery partners cannot be created yet — the admin API has no create-rider endpoint. The details above were not saved.",
  );
}

export default function UsersManagementPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [ngoOpen, setNgoOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  // Staff accounts are managed in the roles module, so they are dropped here
  // rather than mixed in with the platform's own users.
  const panel = useUsersPanel({ excludeAdmins: true });
  const { metrics, query } = panel;

  return (
    <div className="space-y-6">
      <PageHeader className="md:items-center">
        <PageHeader.Heading>
          <PageHeader.Title className="md:text-2xl">
            Users Management
          </PageHeader.Title>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Button
            className="bg-primary flex-1 md:flex-none text-white gap-2 rounded-full px-5"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add New User
          </Button>
          <RowActions>
            <RowActions.Item
              icon={IoPersonAddOutline}
              onSelect={() => setNgoOpen(true)}
            >
              Add NGO
            </RowActions.Item>
            <RowActions.Item
              icon={IoPeopleOutline}
              onSelect={() => setDeliveryOpen(true)}
            >
              Add Delivery Partner
            </RowActions.Item>
          </RowActions>
        </PageHeader.Actions>
      </PageHeader>

      <StatGrid className="gap-4">
        <SharedStatCard
          label="Total Users"
          value={metrics?.totalUsers ?? 0}
          icon={IoPeopleOutline}
          isLoading={query.isPending}
        />
        <SharedStatCard
          label="NGO Partners"
          value={metrics?.ngoPartners ?? 0}
          icon={HiOutlineBuildingOffice2}
          isLoading={query.isPending}
        />
        <SharedStatCard
          label="Delivery Partners"
          value={metrics?.deliveryPartners ?? 0}
          icon={IoCartOutline}
          isLoading={query.isPending}
        />
        <SharedStatCard
          label="Suspended"
          value={metrics?.suspendedCount ?? 0}
          icon={IoPersonRemoveOutline}
          isLoading={query.isPending}
        />
      </StatGrid>

      {/* Search + Table */}
      <UsersPanel panel={panel} />

      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <CreateNgoDialog open={ngoOpen} onOpenChange={setNgoOpen} />

      <CreateDeliveryPartnerDialog
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
        onCreated={createDeliveryPartner}
      />
    </div>
  );
}
