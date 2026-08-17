import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";

const currency = (value: number | undefined) =>
  `₦${(value ?? 0).toLocaleString()}`;

const kycVariants: Record<string, string> = {
  verified: "bg-green-50 text-primary",
  pending: "bg-amber-50 text-amber-600",
  rejected: "bg-red-50 text-red-500",
};

export function ProfileView({ user }: { user: User }) {
  /**
   * Which figures are shown depends on the role, but every value now comes from
   * `GET /api/admin/users/{userId}`. The detail DTO has no donation or order
   * counts, so NGO and Delivery reuse the listing/sold figures it does return.
   */
  const stats = {
    Individual: [
      { label: "Total Listings", value: String(user.totalListings ?? 0) },
      { label: "Total Sold", value: String(user.totalSold ?? 0) },
      { label: "Total Purchased", value: String(user.totalPurchased ?? 0) },
      { label: "Wallet Funds", value: currency(user.balance) },
    ],
    NGO: [
      { label: "Total Listings", value: String(user.totalListings ?? 0) },
      { label: "Wallet Funds", value: currency(user.balance) },
    ],
    Delivery: [
      { label: "Total Listings", value: String(user.totalListings ?? 0) },
      { label: "Total Sold", value: String(user.totalSold ?? 0) },
      { label: "Wallet Funds", value: currency(user.balance) },
    ],
  };

  const roleStats = stats[user?.role as keyof typeof stats] ?? [];
  const kycStatus = user.kycStatus ?? "Unknown";

  return (
    <div className=" space-y-5 ">
      <div
        className={cn(
          "grid  gap-2",
          user?.role === "NGO" ? "grid-cols-2" : "grid-cols-3"
        )}
      >
        {roleStats.map((s) => (
          <div
            key={s.label}
            className="bg-background rounded-md py-3 md:py-5 px-3 md:px-4 text-left"
          >
            <p className="text-xs font-medium text-[#6C6C6C]">{s.label}</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-5 max-h-60 overflow-y-auto">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">
            Basic Information
          </p>
          <div className="grid grid-cols-[1fr_150px] gap-x-4 gap-y-3">
            {[
              ["First Name", user.name.split(" ")[0]],
              ["Last Name", user.name.split(" ").slice(1).join(" ") || "—"],
              ["Email Address", user.email],
              ["Account Role", String(user.role)],
              ["Phone Number", user.phone ?? "—"],
              ["User ID", user.code],
              [
                "Signup Date",
                user.signupDate
                  ? new Date(user.signupDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—",
              ],
              ["Last Active", user.lastActive ?? "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-gray-400">{k}</p>
                <p className="text-sm font-medium text-gray-800">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">
            Account Status & Verification
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Account Status</p>
              <p className="text-sm font-medium text-gray-800">{user.status}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Email Verified</p>
              <p className="text-sm font-medium text-gray-800">
                {user.emailVerified === undefined
                  ? "—"
                  : user.emailVerified
                    ? "Yes"
                    : "No"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">KYC Status</p>
              <Badge
                className={cn(
                  "border-0 rounded-full text-xs",
                  kycVariants[kycStatus.toLowerCase()] ??
                    "bg-[#F3F5F5] text-[#3A3A3A]"
                )}
              >
                {kycStatus}
              </Badge>
            </div>
          </div>
        </div>

        {user?.role !== "Individual" && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Bank Details
            </p>
            {user.accountNumber || user.bankName ? (
              <div className="grid grid-cols-[0.7fr_150px] gap-x-4 gap-y-3">
                {[
                  ["Account Holder Name", user.accountHolderName],
                  ["Account Number", user.accountNumber],
                  ["Bank Name", user.bankName],
                  ["Sort Code", user.sortCode],
                  ["IBAN", user.iban],
                  ["SWIFT/BIC Code", user.swiftCode],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {v || "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No bank details on file.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
