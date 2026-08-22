"use client";
import Image from "next/image";
import { Bell, Search, ChevronDown } from "lucide-react";
import {LogoutDialog} from "@/components/layout/logout-dialog";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { useLogout } from "@/hooks/auth/use-auth-mutations";
import type { AdminSession } from "@/types/auth";

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A"
  );
}

export function Header({ session }: { session: AdminSession | null }) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logoutMutation = useLogout();

  const fullName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") || "Admin";
  const email = session?.email ?? "";
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 lg:pr-12 lg:pl-8">
      <div className="flex items-center gap-3 md:hidden">
        <SidebarTrigger className="-ml-1 " />
        <Image
          src={"/assets/logos/sidebar.webp"}
          alt="Logo"
          width={100}
          height={100}
          className="w-9 h-9"
        />
        <div className="p-2 rounded-md bg-white">
          <Search className="top-1/2 h-5 w-5  text-[#BDBDBD]" />
        </div>
      </div>
      {/* `md` matches the mobile cluster's `md:hidden`. At `sm` the two overlap
          and the bar renders two search controls at once. */}
      <div className="relative hidden min-w-0 flex-1 md:block md:max-w-80">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#BDBDBD]" />
        <Input
          type="text"
          placeholder="Search"
          className="w-full pl-9 bg-white h-9 rounded-full border-0 placeholder:text-[#BDBDBD]  disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex min-w-0 items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="flex min-w-0 items-center gap-2">
          <Link href={"/profile"} className="flex min-w-0 items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={session?.profilePictureUrl ?? ""} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-600 text-white">
                {initialsOf(fullName)}
              </AvatarFallback>
            </Avatar>
            {/* An address long enough to push the chevron off the bar gets
                truncated instead. */}
            <div className="hidden min-w-0 text-left md:block">
              <p className="truncate text-sm font-medium">{fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </Link>
          <Button
            onClick={() => setLogoutOpen(true)}
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={(open: boolean) => setLogoutOpen(open)}
        onConfirm={() => logoutMutation.mutate()}
      />
    </header>
  );
}
