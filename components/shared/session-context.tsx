"use client";

import * as React from "react";
import type { AdminSession } from "@/types/auth";

/**
 * The signed-in admin, for the client components that need to know who they are.
 *
 * The session itself is a set of httpOnly cookies read on the server, so a page
 * deep in the tree cannot ask for it — `app/(dashboard)/layout.tsx` reads it
 * once and hands it down through here, rather than each feature prop-drilling
 * it from the page that happens to render them.
 */
const SessionContext = React.createContext<AdminSession | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: AdminSession | null;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * The signed-in admin, or null outside the dashboard shell.
 *
 * Null rather than a thrown error: a component that only wants to leave the
 * current admin out of a list should still render when it cannot tell who that
 * is — it just cannot leave anyone out.
 */
export function useSession(): AdminSession | null {
  return React.useContext(SessionContext);
}
