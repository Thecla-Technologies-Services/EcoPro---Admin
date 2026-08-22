import { ProfileCard } from "@/components/dashboard/profile/profile-card";
import { getSession } from "@/lib/auth/session";

/**
 * The admin's own profile.
 *
 * Server-rendered purely to read the session, which is the only place the
 * signed-in admin's own id exists — the API has no "current user" endpoint, so
 * the record is fetched as `GET /users/{userId}` like any other.
 */
export default async function ProfilePage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div className="grid gap-2 md:gap-3">
        <h1 className="text-2xl font-semibold md:text-[28px]">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <div className="flex justify-center">
        <ProfileCard session={session} />
      </div>
    </div>
  );
}
