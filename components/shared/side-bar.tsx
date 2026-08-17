"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoPersonOutline,
  IoAnalyticsOutline,
  IoPersonAddOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoFileTrayFullOutline,
} from "react-icons/io5";
import { BiDonateHeart } from "react-icons/bi";
import { HiOutlineCheckBadge, HiOutlineQueueList } from "react-icons/hi2";

import { MessageSquare, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Image from "next/image";

const navItems = [
  { icon: IoPersonOutline, label: "Dashboard", href: "/overview" },
  { icon: IoPersonAddOutline, label: "Users", href: "/users" },
  { icon: HiOutlineQueueList, label: "Listing", href: "/listings" },
  {
    icon: HiOutlineCheckBadge,
    label: "Verification",
    href: "/verification",
  },
  {
    icon: IoDocumentTextOutline,
    label: "Swap & Ord.",
    href: "/swap-orders",
  },
  { icon: IoWalletOutline, label: "Wallet", href: "/wallet" },
  { icon: BiDonateHeart, label: "Donations", href: "/donations" },
  { icon: MessageSquare, label: "Disputes", href: "/disputes" },
  {
    icon: IoAnalyticsOutline,
    label: "Analytics",
    href: "/analytics",
  },
  {
    icon: IoFileTrayFullOutline,
    label: "Marketing",
    href: "/marketing",
  },
  {
    icon: IoFileTrayFullOutline,
    label: "Roles & Permissions",
    href: "/roles-permissions",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-none w-42.5  bg-background!">
      <SidebarHeader className="p-4 pb-6 md:pb-8">
        <Link href="/overview" className="flex justify-center">
          <Image
            src={"/assets/logos/sidebar.webp"}
            alt="Logo"
            width={100}
            height={100}
            className="w-12.5 h-12.5"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4 md:space-y-6 overflow-auto max-h-[70vh]">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={`${isActive ? "bg-primary/80 text-primary hover:bg-green-100 hover:text-green-800 rounded-full" : ""}
                        
                          " data-[active=true]:text-primary data-[active=true]:bg-primary/15 group-data-[active=true]:bg-primary/80 group-data-[state=open]:text-primary group-data-[state=open]:hover:bg-green-100 group-data-[state=open]:hover:text-green-800 py-2 px-4 md:px-5 h-8 [active=true]:rounded-full!" `}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={`${isActive ? "text-primary" : "text-[#3A3A3A]"}"h-5! w-5! size-5! "`}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className={`${pathname === "/settings" ? "bg-primary/15 text-primary hover:bg-green-100 hover:text-green-800 rounded-full" : ""}
                        
                          " data-[active=true]:text-primary data-[active=true]:bg-primary/15 group-data-[active=true]:bg-primary/15 group-data-[state=open]:text-primary group-data-[state=open]:hover:bg-green-100 group-data-[state=open]:hover:text-green-800 py-2 px-4 md:px-5 h-8 [active=true]:rounded-full!" `}
            >
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
