"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { ApiError, isUnauthorized } from "@/lib/api/errors";
import { logout } from "@/app/actions/auth";

const LOGIN_ROUTE = "/";

/**
 * Set by QueryProvider once mounted. Keeping it outside the client factory lets
 * the cache handlers reach the current router without rebuilding the client (and
 * losing the cache) on every render.
 */
let handleUnauthorized: (() => void) | null = null;

function onCacheError(error: unknown) {
  // A rejected session is not something a component can recover from — every
  // other query would fail the same way — so bounce to the login screen once.
  if (isUnauthorized(error)) handleUnauthorized?.();
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: onCacheError }),
    mutationCache: new MutationCache({ onError: onCacheError }),
    defaultOptions: {
      queries: {
        // Dashboard data is read often and changes slowly; a short stale window
        // avoids a refetch on every navigation between admin screens.
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Never retry a request the server rejected on purpose (401, 403,
          // validation errors) — only transient failures.
          if (error instanceof ApiError) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();

  // Reuse one client across renders so the cache survives navigation, but
  // create it lazily so it is never shared between requests on the server.
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);
  const router = useRouter();

  useEffect(() => {
    // A page usually has several queries in flight, and a rejected session
    // fails all of them; sign out on the first one only.
    let signingOut = false;

    handleUnauthorized = () => {
      if (signingOut) return;
      signingOut = true;

      queryClient.clear();

      // Clear the cookies server-side *before* navigating. Redirecting on its
      // own is a no-op while a token cookie survives: the proxy gate sends any
      // signed-in visitor from the login route straight back to the dashboard,
      // stranding the admin in a shell whose every query fails.
      void logout().finally(() => {
        router.replace(LOGIN_ROUTE);
        router.refresh();
      });
    };

    return () => {
      handleUnauthorized = null;
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
