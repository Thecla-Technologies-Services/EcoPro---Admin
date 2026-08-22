"use client";

import * as React from "react";
import { Mail, Phone, MapPin, Download, FileText } from "lucide-react";
import Image from "next/image";
import { DetailList } from "@/components/shared/detail-list";
import { EntityHeader } from "@/components/shared/entity-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/hooks/admin/use-users";
import { toBankAccount } from "@/lib/adapters/verification";
import { type Applicant, type ApplicantFact } from "@/types/verification";
import { cn } from "@/lib/utils";

/**
 * The pieces a verification detail view is built from.
 *
 * `ApplicantDetail` owns only the identity band — the part every view shares —
 * and takes its sections as children, because the two callers need different
 * ones: the review queue shows what it needs to make a decision, while the
 * rider view is read-only and shows the full onboarding record and the
 * provider's result. `DetailBlock`, `FactCard` and `DocumentList` are the
 * section shapes both compose from.
 *
 * The heading elements swap through `titleAs` / `descriptionAs` so a dialog can
 * pass `DialogTitle` and keep Radix's labelling intact, while a page passes a
 * plain heading — without this component knowing which context it is in.
 */

/**
 * The adapters fill anything the API does not know with an em dash, which is
 * fine in a table cell but reads as a stray mark when it lands in a status pill
 * or beside a map pin. Treat it as absent so those slots can be dropped.
 */
export function fact(value: string | undefined) {
  const trimmed = value?.trim();
  return !trimmed || trimmed === "—" ? undefined : trimmed;
}

/**
 * Clips a uuid to its first and last few characters. The middle of a v7 uuid is
 * the least distinguishing part, so the ends are what an admin needs to tell two
 * ids apart or match one against a log line.
 */
function shorten(id: string) {
  return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

const ID_CLASS =
  "mt-1 text-sm font-medium leading-snug tracking-[0.25px] text-foreground md:text-base";

/** Label/value rows sit in a white, borderless card on the tinted body. */
const CARD = "rounded-xl border-0 bg-white px-4 py-6";
const LABEL = "text-base font-medium text-foreground";
const VALUE = "text-base font-bold text-foreground";

/** Only images preview inline; PDFs are left to the download link. */
function isImage(contentType: string | undefined) {
  return !!contentType?.startsWith("image/");
}

/** A titled section. The design runs the body as one column of these. */
export function DetailBlock({
  when = true,
  title,
  children,
  className,
}: {
  when?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!when) return null;

  return (
    <section className={cn("space-y-4", className)}>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

/**
 * A white card of label/value facts. `empty` is shown in place of the rows when
 * there are none, so a section the API cannot fill says so rather than
 * rendering a blank card.
 */
export function FactCard({
  items,
  empty,
}: {
  items: readonly ApplicantFact[];
  empty?: React.ReactNode;
}) {
  if (!items.length && empty) {
    return (
      <p className="rounded-xl bg-white px-4 py-6 text-base text-muted-foreground">
        {empty}
      </p>
    );
  }

  return (
    <DetailList boxed className={CARD}>
      <DetailList.Rows
        items={items}
        labelClassName={LABEL}
        valueClassName={VALUE}
      />
    </DetailList>
  );
}

/** The submitted documents, previewed where the API gives a URL to preview. */
export function DocumentList({
  documents,
  empty = "No documents were submitted.",
}: {
  documents: Applicant["documents"] | undefined;
  empty?: React.ReactNode;
}) {
  if (!documents?.length) {
    return <p className="text-base text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="space-y-5">
      {documents.map((doc) => (
        <div key={doc.label} className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText
                className={cn(
                  "size-5 shrink-0",
                  doc.provided ? "text-muted-foreground" : "text-destructive",
                )}
              />
              <span className="text-base font-medium tracking-[-0.15px] text-[#171717]">
                {doc.label}
              </span>
            </div>

            {doc.url ? (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="flex shrink-0 items-center gap-1 text-base font-medium tracking-[-0.15px] text-[#009966] transition-colors hover:text-[#009966]/80"
              >
                <Download className="size-5" />
                Download
              </a>
            ) : (
              // Rider profiles report only whether a file exists — the API
              // exposes no URL to open, download or preview.
              <span
                className={cn(
                  "shrink-0 text-base font-medium",
                  doc.provided ? "text-[#009966]" : "text-destructive",
                )}
              >
                {doc.provided ? "Submitted" : "Not submitted"}
              </span>
            )}
          </div>

          {doc.url && isImage(doc.contentType) && (
            <div className="relative h-60 w-full overflow-hidden rounded-xl bg-white md:h-100">
              <Image
                src={doc.url}
                alt={doc.label}
                fill
                unoptimized
                className="size-full object-cover"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * The applicant's payout account.
 *
 * Fetched from the user detail endpoint only when the applicant did not already
 * bring one — organizations always do. `fact` guards the placeholder id a rider
 * gets when no directory record matched: it is truthy, so without it the hook
 * would request a user called "—".
 */
export function useApplicantBank(applicant: Applicant | null) {
  const details = useUser(
    applicant?.bank ? undefined : fact(applicant?.userId),
  );
  return applicant?.bank ?? toBankAccount(details.data?.bankDetails);
}

export function ApplicantDetail({
  applicant,
  titleAs: Title = "h2",
  descriptionAs: Description = "p",
  badge = <StatusBadge status={applicant?.accountType || "Delivery"} />,
  children,
}: {
  applicant: Applicant | null;
  /** `DialogTitle` inside a dialog, a heading on a page. */
  titleAs?: React.ElementType;
  descriptionAs?: React.ElementType;
  /**
   * Sits beside the name. Defaults to the account type, which tells an NGO from
   * a rider in the mixed review queue; pass `null` where every record is the
   * same kind and the pill only repeats the page.
   */
  badge?: React.ReactNode;
  /** The sections below the identity band. */
  children?: React.ReactNode;
}) {
  const status = fact(applicant?.status);

  return (
    <>
      {/* The only rule in the design is under the identity band. */}
      <div className="border-b border-[#CFD2D8] px-3 py-4 lg:px-4 lg:py-5">
        <EntityHeader>
          <EntityHeader.Identity
            name={applicant?.name}
            avatarUrl={applicant?.avatarUrl}
            className="items-start gap-2"
            title={
              <div className="flex min-w-0 items-center gap-2">
                <Title className="min-w-0 text-lg font-medium leading-tight tracking-[0.25px] break-words text-foreground md:text-2xl">
                  {applicant?.name}
                </Title>
                {badge && <div className="shrink-0">{badge}</div>}
              </div>
            }
            description={
              // The design shows a short account code. Riders only have one if
              // the directory issued it; otherwise the raw uuid is clipped to
              // keep it off a second line, with the whole value on hover and on
              // keyboard focus for anyone who needs to read or copy it.
              applicant?.userCode ? (
                <Description className={cn(ID_CLASS, "break-words")}>
                  {applicant.userCode}
                </Description>
              ) : (
                <Description className={ID_CLASS}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-mono decoration-dotted decoration-from-font underline-offset-2">
                        {shorten(applicant?.userId ?? "")}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="font-mono break-all">
                      {applicant?.userId}
                    </TooltipContent>
                  </Tooltip>
                </Description>
              )
            }
          >
            {status && (
              <div className="mt-2">
                <StatusBadge status={status} />
              </div>
            )}
          </EntityHeader.Identity>

          {/* `pr-8` keeps the first fact clear of a dialog's close button. */}
          <EntityHeader.Meta className="text-[#404040] md:space-y-3 md:pr-8">
            <EntityHeader.MetaItem icon={Mail} iconClassName="size-4">
              {applicant?.email}
            </EntityHeader.MetaItem>
            <EntityHeader.MetaItem icon={Phone} iconClassName="size-4">
              {applicant?.phone}
            </EntityHeader.MetaItem>

            <EntityHeader.MetaItem icon={MapPin} iconClassName="size-4">
              {applicant?.address}
            </EntityHeader.MetaItem>
          </EntityHeader.Meta>
        </EntityHeader>
      </div>

      <div className="flex-1 space-y-5 px-3 py-4 lg:px-4 lg:py-5">
        {children}
      </div>
    </>
  );
}
