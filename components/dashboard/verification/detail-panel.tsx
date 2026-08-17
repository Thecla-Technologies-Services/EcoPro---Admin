import { type Applicant } from "@/types/verification";
import { Mail, Phone, MapPin, Download, FileText } from "lucide-react";
import Image from "next/image";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AccountBadge } from "./queue-item";
import { DetailDialog } from "@/components/shared/detail-dialog";
import { DetailList } from "@/components/shared/detail-list";
import { EntityHeader } from "@/components/shared/entity-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

/**
 * Only images can be previewed inline; PDFs and anything else are left to the
 * download link rather than rendered into a broken `<img>`.
 */
function isImage(contentType: string | undefined) {
  return !!contentType?.startsWith("image/");
}

export default function DetailPanel({
  applicant,
  onApprove,
  open,
  onOpenChange,
  onReject,
}: {
  applicant: Applicant | null;
  onApprove: () => void;
  onReject: () => void;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const status = applicant?.status;

  const rejectButton = (
    <Button
      variant="outline"
      className="md:px-4 flex-1 md:flex-none rounded-full border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
      onClick={onReject}
    >
      Reject Application
    </Button>
  );

  const approveButton = (
    <Button
      className="md:px-4 flex-1 md:flex-none rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={onApprove}
    >
      Approve Verification
    </Button>
  );

  return (
    <DetailDialog open={open} onOpenChange={onOpenChange}>
      <DetailDialog.Section className="pb-4">
        <EntityHeader>
          <EntityHeader.Identity
            name={applicant?.name}
            avatarUrl={applicant?.avatarUrl}
            title={
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg md:text-xl text-foreground font-medium leading-4.5">
                  {applicant?.name}
                </DialogTitle>
                <AccountBadge type={applicant?.accountType || "NGO"} />
              </div>
            }
            description={
              <DialogDescription className="text-sm md:text-base text-foreground mt-0.5">
                {applicant?.userId}
              </DialogDescription>
            }
          >
            <StatusBadge status={status || "Pending Review"} />
          </EntityHeader.Identity>

          <EntityHeader.Meta>
            <EntityHeader.MetaItem icon={Mail}>
              {applicant?.email}
            </EntityHeader.MetaItem>
            <EntityHeader.MetaItem icon={Phone}>
              {applicant?.phone}
            </EntityHeader.MetaItem>
            <EntityHeader.MetaItem icon={MapPin}>
              {applicant?.address}
            </EntityHeader.MetaItem>
          </EntityHeader.Meta>
        </EntityHeader>
      </DetailDialog.Section>

      {/* Only NGO applications carry payout details. */}
      <DetailDialog.Section when={!!applicant?.bank} title="Bank Accounts">
        <DetailList boxed>
          <DetailList.Row
            label="Account Name:"
            value={applicant?.bank?.accountName}
          />
          <DetailList.Row
            label="Account Number:"
            value={applicant?.bank?.accountNumber}
          />
          <DetailList.Row label="Bank:" value={applicant?.bank?.bankName} />
        </DetailList>
      </DetailDialog.Section>

      {/* Organization registration, or a rider's automated identity checks. */}
      <DetailDialog.Section
        when={!!applicant?.details?.length}
        title="Application Details"
      >
        <DetailList boxed>
          <DetailList.Rows items={applicant?.details ?? []} />
        </DetailList>
      </DetailDialog.Section>

      <DetailDialog.Section when={!!applicant?.rejectionReason}>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Rejection Reason
        </h3>
        <p className="text-sm text-muted-foreground">
          {applicant?.rejectionReason}
        </p>
      </DetailDialog.Section>

      <DetailDialog.Section
        title="Uploaded Documents"
        divided={false}
        className="flex-1"
      >
        <div className="space-y-4">
          {applicant?.documents.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No documents were submitted with this application.
            </p>
          )}

          {applicant?.documents.map((doc) => (
            <div key={doc.label}>
              <div className="flex items-center justify-between mb-3 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText
                    className={cn(
                      "size-4",
                      doc.provided
                        ? "text-muted-foreground"
                        : "text-destructive",
                    )}
                  />
                  <span>{doc.label}</span>
                </div>

                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Download className="size-3.5" />
                    Download
                  </a>
                ) : (
                  // Rider profiles report only whether a file exists — the API
                  // exposes no URL to open or download.
                  <span
                    className={cn(
                      "text-sm shrink-0",
                      doc.provided ? "text-primary" : "text-destructive",
                    )}
                  >
                    {doc.provided ? "Submitted" : "Not submitted"}
                  </span>
                )}
              </div>

              {doc.url && isImage(doc.contentType) && (
                <div className="w-full relative h-40 md:h-60 lg:h-100 2xl:h-120 rounded-xl bg-muted overflow-hidden">
                  <Image
                    src={doc.url}
                    alt={doc.label}
                    fill
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </DetailDialog.Section>

      <DetailDialog.Footer>
        {status === "Pending Review" && (
          <>
            {rejectButton}
            {approveButton}
          </>
        )}
        {status === "Rejected" && approveButton}
        {status === "Approved" && rejectButton}
      </DetailDialog.Footer>
    </DetailDialog>
  );
}
