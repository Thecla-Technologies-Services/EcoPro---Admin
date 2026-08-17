import { AppPlacement } from "@/types/marketing";
import { cn } from "@/lib/utils";

const PLACEMENT_STYLE: Record<AppPlacement, string> = {
  "Home Dashboard Top": "top-0",
  "Home Dashboard Middle": "top-[195px]",
  "Home Dashboard Bottom": "bottom-[60px]",
  "Listing Page Top": "top-0",
  "Listing Page Bottom": "bottom-[60px]",
  "Swap Page Top": "top-0",
};

// Phone screen label per placement
const PLACEMENT_SCREEN_LABEL: Record<AppPlacement, string> = {
  "Home Dashboard Top": "Home",
  "Home Dashboard Middle": "Home",
  "Home Dashboard Bottom": "Home",
  "Listing Page Top": "Listings",
  "Listing Page Bottom": "Listings",
  "Swap Page Top": "Swap",
};

// ─── Phone mockup ─────────────────────────────────────────────────────────────

export function PhoneMockup({
  bannerUrl,
  placement,
}: {
  bannerUrl: string | null;
  placement: AppPlacement;
}) {
  const positionClass = PLACEMENT_STYLE[placement];
  const screenLabel = PLACEMENT_SCREEN_LABEL[placement];

  return (
    <div className="flex flex-col w-full  h-full">
      <p className="text-xs text-start w-full text-gray-400 mb-4 font-medium tracking-wide uppercase">
        Live App Preview
      </p>

      {/* Phone shell */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative mx-auto" style={{ width: 320, height: 640 }}>
          {/* Outer frame */}
          <div
            className="absolute inset-0 rounded-[36px] bg-gray-900 shadow-2xl"
            style={{ border: "8px solid #1a1a1a" }}
          />

          {/* Dynamic island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />

          {/* Screen */}
          <div className="absolute inset-2 rounded-[28px] bg-gray-50 overflow-hidden">
            {/* Fake app chrome — status bar */}
            <div className="h-10 bg-white flex items-center px-3 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {screenLabel}
              </span>
            </div>

            {/* App content area — fake skeleton rows */}
            <div className="relative h-full bg-gray-50">
              {/* Skeleton content */}
              <div className="px-2 pt-2 flex flex-col gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <div className="w-8 h-8 rounded-md bg-gray-200 shrink-0" />
                    <div className="flex-1 flex flex-col gap-1">
                      <div
                        className="h-1.5 bg-gray-200 rounded-full"
                        style={{ width: `${60 + (i % 3) * 15}%` }}
                      />
                      <div className="h-1.5 bg-gray-100 rounded-full w-2/3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Banner overlay — positioned by placement */}
              <div
                className={cn(
                  "absolute left-0 right-0 z-10 mx-1 transition-all duration-300",
                  positionClass,
                )}
              >
                {bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bannerUrl}
                    alt="Banner preview"
                    className="w-full rounded-md object-cover shadow-md"
                    style={{ height: 56 }}
                  />
                ) : (
                  <div className="w-full h-14 rounded-md bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 shadow-md flex items-center justify-center">
                    <span className="text-[8px] text-gray-400 font-medium">
                      Banner Preview
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side buttons */}
          <div className="absolute -right-2.5 top-20 w-1 h-8 bg-gray-700 rounded-r-sm" />
          <div className="absolute -left-2.5 top-16 w-1 h-6 bg-gray-700 rounded-l-sm" />
          <div className="absolute -left-2.5 top-24 w-1 h-6 bg-gray-700 rounded-l-sm" />
          <div className="absolute -left-2.5 top-32 w-1 h-6 bg-gray-700 rounded-l-sm" />
        </div>
      </div>
    </div>
  );
}
