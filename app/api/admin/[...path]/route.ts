import type { NextRequest } from "next/server";
import { forwardToApi } from "@/lib/api/forward";

/**
 * Forwards `/api/admin/*` to the Ecoswap Admin API.
 *
 * Example: fetch("/api/admin/users?page=1") -> GET {API}/api/admin/users?page=1
 */
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forwardToApi(request, "/api/admin", path);
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
