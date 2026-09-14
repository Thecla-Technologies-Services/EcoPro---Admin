import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/side-bar";
import { Header } from "@/components/layout/header";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { CurrencyProvider } from "@/components/shared/currency-context";
import { CountryProvider } from "@/components/shared/country-context";
import { SessionProvider } from "@/components/shared/session-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // The proxy gate is optimistic and matcher-scoped; this is the authoritative
  // check, so a route it happens not to cover still can't render the dashboard.
  if (!session) {
    redirect("/");
  }

  return (
    // Bounding the shell to the viewport is what makes `main` below the real
    // scroll container. Without it the wrapper is only `min-h-svh`, so it grows
    // with the page, the window scrolls instead, and anything sticky inside
    // `main` pins to a box that extends past the bottom of the screen.
    // The currency the dashboard reads in is chosen in the header and applies
    // to every page under it, so the provider sits above both. The country is
    // chosen on the pages that offer it rather than in the header, but is held
    // just as broadly, so those pages agree on one answer across a navigation.
    <SessionProvider session={session}>
      <CurrencyProvider>
        <CountryProvider>
          <SidebarProvider className="h-svh overflow-hidden">
            <AppSidebar />
            <SidebarInset className="overflow-x-hidden!">
              <Header session={session} />
              <main className="flex-1 min-h-0 overflow-y-auto font-dm! overflow-auto text-[#4F4F4F] p-4 md:p-6 lg:p-8 bg-white">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </CountryProvider>
      </CurrencyProvider>
    </SessionProvider>
  );
}
