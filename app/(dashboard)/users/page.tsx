"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import { RowActions } from "@/components/shared/row-actions";
import SharedStatCard from "@/components/shared/stat-card";
import { UsersPanel } from "@/components/dashboard/users/users-panel";
import { CreateCharityPartnerDialog } from "@/components/dashboard/users/charity-partner/create-charity-partner-dialog";
import { CreateDeliveryPartnerDialog } from "@/components/dashboard/users/delivery/create-delivery-partner-dialog";
import { useUsersPanel } from "@/hooks/admin/use-users-panel";
import {
  useCreateDeliveryPartner,
  useUploadDeliveryPartnerDocument,
} from "@/hooks/admin/use-delivery-partners";
import { useCreateOrganization } from "@/hooks/admin/use-organizations";
import type { DeliveryPartnerCreatedResult } from "@/components/dashboard/users/delivery/create-delivery-partner-dialog";
import type { DeliveryPartnerFormValues } from "@/types/user";
import {
  IoPeopleOutline,
  IoCartOutline,
  IoPersonRemoveOutline,
} from "react-icons/io5";

/**
 * The type every uploaded delivery-partner document is filed under.
 *
 * `upload-document` requires one, and the form asks for "verification
 * documents" without distinguishing them — the field sits directly under the
 * CAC registration number, so that is what they are. The endpoint's other
 * value, `RegistrationProof`, has no field asking for it.
 */
const DELIVERY_DOCUMENT_TYPE = "CacCertificate" as const;

export default function UsersManagementPage() {
  const [charityPartnerOpen, setCharityPartnerOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  // Staff accounts are managed in the roles module, so they are dropped here
  // rather than mixed in with the platform's own users.
  const panel = useUsersPanel({ excludeAdmins: true });
  const { metrics, query } = panel;

  const createDeliveryPartner = useCreateDeliveryPartner();
  const uploadDocument = useUploadDeliveryPartnerDocument();
  const createOrganization = useCreateOrganization();

  /**
   * Creates the partner, then uploads its documents against the new account.
   *
   * Two calls rather than one because the create endpoint takes no files. They
   * are reported separately for the same reason: a document that fails to
   * upload leaves a partner that exists, so the failure is named in the success
   * dialog rather than raised as though nothing had been saved.
   */
  async function handleCreateDeliveryPartner(
    values: DeliveryPartnerFormValues,
  ): Promise<DeliveryPartnerCreatedResult> {
    const response = await createDeliveryPartner.mutateAsync({
      contactPersonName: values.contactPersonName,
      email: values.email,
      phoneNumber: values.phone,
      businessName: values.businessName,
      registrationNumber: values.registrationNumber,
      utr: values.utrNumber,
      bankName: values.bankName,
      bankCode: values.bankCode,
      accountNumber: values.bankAccountNumber,
      accountName: values.accountHolderName,
      country: values.country,
      // The API models a UK region and a Nigerian state as the same field.
      state: values.state ?? values.region,
      lga: values.lga,
      city: values.city,
      area: values.area,
      verifyEmailAutomatically: values.verifyEmailAutomatically,
    });

    const userId = response.profile?.userId;

    if (!userId || values.documents.length === 0) {
      return {
        response,
        // Without a userId there is nothing to upload against, so every
        // document is unaccounted for rather than silently dropped.
        failedDocuments: userId
          ? undefined
          : values.documents.map((f) => f.name),
      };
    }

    const failedDocuments: string[] = [];

    // Sequential: one rejected upload should not cancel the rest, and the
    // account it is uploading against was only just created.
    for (const file of values.documents) {
      try {
        await uploadDocument.mutateAsync({
          userId,
          documentType: DELIVERY_DOCUMENT_TYPE,
          file,
        });
      } catch {
        failedDocuments.push(file.name);
      }
    }

    return { response, failedDocuments };
  }

  return (
    <div className="space-y-6">
      <PageHeader className="md:items-center">
        <PageHeader.Heading>
          <PageHeader.Title className="md:text-2xl">
            User Management
          </PageHeader.Title>
        </PageHeader.Heading>
        <PageHeader.Actions>
          {/* One menu rather than a button beside a kebab: the button opens
              the partner items the kebab used to hold. */}
          <RowActions
            trigger={
              <Button className="bg-primary flex-1 md:flex-none text-white gap-2 rounded-full px-5">
                <Plus className="w-4 h-4" />
                Add New User
                <ChevronDown className="w-4 h-4" />
              </Button>
            }
          >
            <RowActions.Item
              icon={HiOutlineBuildingOffice2}
              onSelect={() => setCharityPartnerOpen(true)}
            >
              Add Charity Partner
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
          label="Charity Partners"
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

      <CreateCharityPartnerDialog
        open={charityPartnerOpen}
        onOpenChange={setCharityPartnerOpen}
        onCreated={async (values) => {
          await createOrganization.mutateAsync({
            organizationName: values.organisationName,
            registrationNumber: values.registrationNumber,
            contactPersonName: values.contactPersonName,
            contactEmail: values.contactEmail,
            contactPhoneNumber: values.contactPhone,
            organizationAddress: values.organizationAddress,
            postalCode: values.postalCode,
            profileImage: values.profileImage,
            documents: values.documents,
          });
        }}
      />

      <CreateDeliveryPartnerDialog
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
        onCreated={handleCreateDeliveryPartner}
      />
    </div>
  );
}
