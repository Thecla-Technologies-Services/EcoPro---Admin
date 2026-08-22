"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { isForbidden } from "@/lib/api/errors";
import type { ListingMediaDto } from "@/types/api/marketplace";

/**
 * POST /api/marketplace/listings/{listingId}/media
 *
 * The endpoint takes one file per request, so a listing with several images
 * means several calls — see `uploadListingImages` for the sequencing.
 */
export function useUploadListingMedia() {
  return useMutation({
    mutationFn: ({ listingId, file }: { listingId: string; file: File }) => {
      const body = new FormData();
      // The multipart field is `File`, capitalised, as the endpoint declares it.
      body.append("File", file);

      return apiFetch<ListingMediaDto>(`/listings/${listingId}/media`, {
        method: "POST",
        body,
        service: "marketplace",
      });
    },
  });
}

/**
 * Uploads each image in turn and reports how many failed.
 *
 * Sequential rather than parallel: the endpoint assigns `sortOrder` per call, so
 * firing them at once would let the images land in an arbitrary order. A failure
 * does not abort the rest — the listing already exists at this point, so saving
 * four of five images beats saving none and leaving the admin to guess which.
 */
export async function uploadListingImages(
  listingId: string,
  files: File[],
  upload: (input: { listingId: string; file: File }) => Promise<ListingMediaDto>
) {
  const failed: string[] = [];
  /**
   * The endpoint is scoped to the listing's own owner, and the Marketplace API
   * exposes no admin equivalent, so an admin token can be refused outright. That
   * is a permission problem rather than a bad file, and naming the files would
   * only send someone off checking formats and sizes.
   */
  let forbidden = false;

  for (const file of files) {
    try {
      await upload({ listingId, file });
    } catch (reason) {
      console.error("[listings] image upload failed", file.name, reason);
      failed.push(file.name);
      forbidden ||= isForbidden(reason);
    }
  }

  return { failed, forbidden };
}
