"use client";

import { ProfileCard } from "@/components/dashboard/profile/profile-card";

export default function ProfilePage() {
  return (
    <div className="space-y-6 ">
      {/* Page Header */}

      <div className="grid gap-2 md:gap-3">
        <h1 className="text-2xl md:text-[28px] font-semibold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <div className="flex justify-center">
        <ProfileCard />
      </div>
    </div>
  );
}
