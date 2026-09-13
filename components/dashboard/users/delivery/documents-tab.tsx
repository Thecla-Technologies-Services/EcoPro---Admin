"use client";

import { Download, FileText } from "lucide-react";
import { DataState } from "@/components/shared/data-state";
import { useDeliveryPartner } from "@/hooks/admin/use-delivery-partners";
import { toDeliveryPartnerDocument } from "@/lib/adapters/delivery-partner";

/**
 * A delivery partner's uploaded documents, from
 * `GET /api/admin/delivery-partners/get/{userId}`.
 *
 * That record is the only place they exist — the user endpoints carry none of
 * it, which is why this tab reads a different endpoint from the rest of the
 * sheet. Each entry carries a real URL, so a document is offered rather than
 * merely reported.
 */
export function DeliveryDocumentsTab({ userId }: { userId?: string }) {
  const { data, isPending, isError, error, refetch } =
    useDeliveryPartner(userId);

  const documents = (data?.documents ?? []).map(toDeliveryPartnerDocument);

  return (
    <div className="mt-4">
      <DataState>
        <DataState.Error
          when={isError}
          error={error}
          onRetry={() => refetch()}
        />
        <DataState.Loading when={isPending} rows={3} rowClassName="h-16" />
        <DataState.Empty when={!documents.length}>
          No documents have been uploaded for this partner.
        </DataState.Empty>
        <DataState.Content className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3"
            >
              <FileText className="size-5 shrink-0 text-muted-foreground" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {doc.label}
                </p>
                {/* The file's own name and weight, when the API gives them —
                    two documents of the same type are otherwise identical. */}
                <p className="truncate text-xs text-muted-foreground">
                  {[doc.fileName, doc.size, doc.uploadedOn]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {doc.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 text-sm font-medium text-[#009966] transition-colors hover:text-[#009966]/80"
                >
                  <Download className="size-4" />
                  Download
                </a>
              ) : (
                // A record with no retrievable file: saying so beats a dead
                // link that looks like it should work.
                <span className="shrink-0 text-sm text-muted-foreground">
                  Unavailable
                </span>
              )}
            </div>
          ))}
        </DataState.Content>
      </DataState>
    </div>
  );
}
