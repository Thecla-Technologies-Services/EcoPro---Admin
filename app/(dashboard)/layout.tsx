import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/side-bar'
import { Header } from '@/components/layout/header'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // The proxy gate is optimistic and matcher-scoped; this is the authoritative
  // check, so a route it happens not to cover still can't render the dashboard.
  if (!session) {
    redirect('/')
  }

  return (
    // Bounding the shell to the viewport is what makes `main` below the real
    // scroll container. Without it the wrapper is only `min-h-svh`, so it grows
    // with the page, the window scrolls instead, and anything sticky inside
    // `main` pins to a box that extends past the bottom of the screen.
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className='overflow-x-hidden!'>
        <Header session={session} />
        <main className="flex-1 min-h-0 overflow-y-auto font-dm! overflow-auto text-[#4F4F4F] p-4 md:p-6 lg:p-8 bg-white">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
