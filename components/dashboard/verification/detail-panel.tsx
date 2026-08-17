import { type Applicant } from "@/types/verification";
import { Mail, Phone, MapPin, Download, FileText } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AccountBadge } from "./queue-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! bg-background gap-0 p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10">
        </DialogClose>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-3 lg:p-4 pb-4">
            <div className="flex items-center gap-1">
              <Avatar className="size-16 md:size-22.5 shrink-0">
                <AvatarImage src={applicant?.avatarUrl} />
                <AvatarFallback className="text-xl font-bold bg-muted">
                  {applicant?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg md:text-xl text-foreground font-medium leading-4.5">
                    {applicant?.name}
                  </DialogTitle>
                  <AccountBadge type={applicant?.accountType || "NGO"} />
                </div>
                <DialogDescription className="text-sm md:text-base text-foreground mt-0.5">
                  {applicant?.userId}
                </DialogDescription>
                <StatusBadge status={applicant?.status || "Pending Review"} />
              </div>
            </div>

            {/* Contact info */}
            <div className="text-left md:text-right space-y-1.5 md:space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center md:justify-end gap-1.5 lg:gap-2">
                <Mail className="size-3.5" />
                <span>{applicant?.email}</span>
              </div>
              <div className="flex items-center md:justify-end gap-1.5 lg:gap-2">
                <Phone className="size-3.5" />
                <span>{applicant?.phone}</span>
              </div>
              <div className="flex items-center md:justify-end gap-1.5 lg:gap-2">
                <MapPin className="size-3.5 shrink-0" />
                <span>{applicant?.address}</span>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Bank Accounts */}
          <div className="p-4 pb-4">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">
              Bank Accounts
            </h3>
            <div className="space-y-3 md:space-y-5 px-2 md:px-4 py-4 md:py-6 bg-white rounded-lg border border-border">
              {[
                { label: "Account Name:", value: applicant?.bank?.accountName },
                {
                  label: "Account Number:",
                  value: applicant?.bank?.accountNumber,
                },
                { label: "Bank:", value: applicant?.bank?.bankName },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between  items-center"
                >
                  <span className="text-sm text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Documents */}
          <div className="p-3 md:p-4 flex-1">
            <h3 className="font-semibold text-base md:text-lg mb-4">
              Uploaded Documents
            </h3>
            <div className="space-y-4">
              {applicant?.documents.map((doc) => (
                <div key={doc.label}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="size-4 text-muted-foreground" />
                      <span>{doc.label}</span>
                    </div>
                    <a
                      href={doc.url}
                      className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Download className="size-3.5" />
                      Download
                    </a>
                  </div>
                  {/* Document preview placeholder */}
                  <div className="w-full relative h-40 md:h-60 lg:h-100 2xl:h-120 rounded-xl bg-muted overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80"
                      alt={doc.label}
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="sticky bottom-0 bg-background border-t border-border p-3 md:p-4 flex gap-3 md:justify-end">
            {applicant?.status === "Pending Review" && (
              <>
                <Button
                  variant="outline"
                  className="md:px-4 flex-1 md:flex-none  rounded-full border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
                  onClick={onReject}
                >
                  Reject Application
                </Button>
                <Button
                  className="md:px-4 flex-1 md:flex-none rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={onApprove}
                >
                  Approve Verification
                </Button>
              </>
            )}

            {applicant?.status === "Rejected" && (
              <>
                <Button
                  className="md:px-4 flex-1 md:flex-none rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={onApprove}
                >
                  Approve Verification
                </Button>
              </>
            )}

            {applicant?.status === "Approved" && (
              <Button
                variant="outline"
                className="md:px-4 flex-1 md:flex-none  rounded-full border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={onReject}
              >
                Reject Application
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
