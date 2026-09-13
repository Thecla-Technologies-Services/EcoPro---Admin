import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "@/lib/auth/session";

/**
 * Exchange rates for the wallet's currency selector.
 *
 * The platform's own API reports the currency a record was made in and nothing
 * else — no rates, no converted amounts — so a rate has to come from outside
 * it. This route is that boundary: the provider and its key stay server-side,
 * and the browser only ever sees the rates themselves.
 *
 * A rate from here is NOT what the platform recorded. It is indicative only,
 * which is why every converted figure is rendered with a `≈` and shown beside
 * the amount the ledger actually holds.
 */
const DEFAULT_PROVIDER = "https://open.er-api.com/v6/latest";

/** An hour is far finer than a dashboard needs, and keeps the provider happy. */
const CACHE_SECONDS = 3600;

/** Guards the base against anything but a currency code. */
const CURRENCY = /^[A-Z]{3}$/;

export async function GET(request: NextRequest) {
  // Rates are cheap, but this sits inside an authenticated dashboard and there
  // is no reason to offer it to anyone who is not signed in.
  if (!(await getToken())) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 },
    );
  }

  const base = (
    request.nextUrl.searchParams.get("base") ?? "NGN"
  ).toUpperCase();

  if (!CURRENCY.test(base)) {
    return NextResponse.json(
      { message: "base must be a three-letter currency code." },
      { status: 400 },
    );
  }

  const provider = process.env.FX_RATES_URL ?? DEFAULT_PROVIDER;
  const key = process.env.FX_API_KEY;

  try {
    const upstream = await fetch(`${provider}/${base}`, {
      headers: key ? { apikey: key } : undefined,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { message: `Rate provider answered ${upstream.status}.` },
        { status: 502 },
      );
    }

    const data = await upstream.json();
    const rates = data?.rates ?? data?.conversion_rates;

    if (!rates || typeof rates !== "object") {
      return NextResponse.json(
        { message: "Rate provider returned no rates." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      base,
      rates,
      // What the provider says it was last refreshed, else when we asked.
      fetchedAt: data?.time_last_update_utc ?? new Date().toISOString(),
    });
  } catch (error) {
    // A provider that is down must not take the wallet page with it — the
    // caller shows recorded amounts and no conversion.
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Rates unavailable.",
      },
      { status: 502 },
    );
  }
}
