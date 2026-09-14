"use client";

import { useUsers } from "@/hooks/admin/use-users";
import { useSession } from "@/components/shared/session-context";
import type { FloatingSelectOption } from "@/components/shared/form/floating-select";

/** The `Role` value that selects staff accounts, spelled as the swagger spells it. */
const ADMIN_ROLE_PARAM = "Admin";

/**
 * The admins a ticket can be handed to: every staff account except the one
 * signed in.
 *
 * Assigning to yourself is picking a ticket up, which Update Status already
 * does, so the current admin is left out rather than offered. Matched on id,
 * with email as the fallback for a session that predates it; with no session in
 * context nobody is left out, since there is nobody to leave out.
 */
export function useAssignableAdmins(): {
  options: FloatingSelectOption[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
} {
  const session = useSession();

  const query = useUsers(undefined, {
    role: ADMIN_ROLE_PARAM,
    // Sent explicitly: the endpoint's default for staff is undocumented.
    excludeAdmins: false,
    pageSize: 100,
  });

  const options = (query.data?.users?.data ?? [])
    .filter(
      (admin) =>
        !session ||
        (admin.id !== session.userId &&
          (!session.email || admin.email !== session.email)),
    )
    .map((admin) => ({
      value: admin.id ?? "",
      label: admin.name ?? admin.email ?? "Unnamed admin",
    }));

  return {
    options,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
  };
}
