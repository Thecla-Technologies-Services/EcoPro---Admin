import type { NextRequest } from "next/server";
import { forwardToApi } from "@/lib/api/proxy";

/**
 * Forwards `/api/marketplace/*` to the Ecoswap Marketplace API.
 *
 * The admin service has no catalogue endpoints of its own, but creating a
 * listing needs a real `categoryId`, which only
 * `GET /api/marketplace/categories` provides. Reads are limited to GET so this
 * route can't be used to mutate marketplace data on a user's behalf.
 */
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forwardToApi(request, "/api/marketplace", path);
}

export { handler as GET };
