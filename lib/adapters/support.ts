import type { FeatureSuggestionDto, SupportTicketDto } from "@/types/api/admin";
import type { FeatureSuggestion, SupportTicket } from "@/types/support";
import { PLACEHOLDER, formatDate, humanise } from "@/lib/adapters/shared";

/** Maps a row from `GET /support/tickets` onto a table row. */
export function toSupportTicket(dto: SupportTicketDto): SupportTicket {
  return {
    id: dto.id ?? "",
    category: dto.category ? humanise(dto.category) : PLACEHOLDER,
    description: dto.description ?? PLACEHOLDER,
    attachmentUrl: dto.attachmentUrl ?? undefined,
    // `InProgress` reads as two words in a badge, and the filter beside it is a
    // closed enum, so splitting the token is safe here.
    status: dto.status ? humanise(dto.status) : PLACEHOLDER,
    date: formatDate(dto.createdOn),
    reviewedDate: dto.reviewedOn ? formatDate(dto.reviewedOn) : undefined,
  };
}

/** Maps a row from `GET /support/feature-suggestions` onto a table row. */
export function toFeatureSuggestion(
  dto: FeatureSuggestionDto,
): FeatureSuggestion {
  return {
    id: dto.id ?? "",
    title: dto.title ?? PLACEHOLDER,
    description: dto.description ?? PLACEHOLDER,
    status: dto.status ? humanise(dto.status) : PLACEHOLDER,
    date: formatDate(dto.createdOn),
  };
}
