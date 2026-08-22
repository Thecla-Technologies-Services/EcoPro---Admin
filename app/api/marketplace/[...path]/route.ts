import { NextResponse, type NextRequest } from "next/server";
import { forwardToApi } from "@/lib/api/proxy";

/**
 * The only marketplace writes this proxy will forward.
 *
 * The route is otherwise read-only on purpose — it runs with the signed-in
 * admin's token, so a catch-all POST would let the dashboard mutate marketplace
 * data on a user's behalf. Listing media is the one exception the admin service
 * has no equivalent for: `CreateAdminListingRequestDto` accepts no files, and
 * `POST /api/marketplace/listings/{id}/media` is the only upload endpoint.
 */
const WRITABLE_PATHS = [/^listings\/[^/]+\/media$/];

function isWritable(path: string[]) {
  const joined = path.join("/");
  return WRITABLE_PATHS.some((pattern) => pattern.test(joined));
}

/**
 * Forwards `/api/marketplace/*` to the Ecoswap Marketplace API.
 *
 * The admin service has no catalogue endpoints of its own, but creating a
 * listing needs a real `categoryId`, which only
 * `GET /api/marketplace/categories` provides.
 */
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (request.method !== "GET" && !isWritable(path)) {
    return NextResponse.json(
      {
        isSuccess: false,
        statusCode: "MethodNotAllowed",
        message: "This marketplace endpoint is read-only.",
        data: null,
      },
      { status: 405 }
    );
  }

  return forwardToApi(request, "/api/marketplace", path);
}

export { handler as GET, handler as POST };
