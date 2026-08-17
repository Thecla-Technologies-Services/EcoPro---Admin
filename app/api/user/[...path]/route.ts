import type { NextRequest } from "next/server";
import { forwardToApi } from "@/lib/api/proxy";

/**
 * Forwards `/api/user/*` to the Ecoswap identity service.
 *
 * The admin service has no endpoint that lists staff accounts — its users list
 * only filters by All/Individual/NGO/Delivery/Suspended — so the roles module
 * reads `GET /api/user/get-all` and picks out the admins itself.
 *
 * GET only, deliberately: this prefix also carries account deletion and PIN
 * resets, which no admin screen should be able to reach through here.
 */
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forwardToApi(request, "/api/user", path);
}

export { handler as GET };
