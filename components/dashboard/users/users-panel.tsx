"use client";

import { useState } from "react";
import { UserTable } from "@/components/dashboard/users/user-table";
import { UserActionModals } from "@/components/dashboard/users/user-modals";
import { ViewUserSheet } from "@/components/dashboard/users/view-sheet";
import { DataState } from "@/components/shared/data-state";
import type { UsersPanelState } from "@/hooks/admin/use-users-panel";
import type { ModalType, User } from "@/types/user";
import type { DateRangeFilterValue } from "@/types/date";
import { endOfDay } from "@/lib/date";

interface UsersPanelProps {
  /** From `useUsersPanel` — the caller owns it so it can read `metrics` too. */
  panel: UsersPanelState;
  /**
   * Hidden when the list is already pinned to one `Tab`, as it is for the roles
   * module's staff accounts.
   */
  showFilterTabs?: boolean;
  rowLabel?: string;
  /** Accessor keys this list has no data for — see `UserTable`. */
  hiddenColumns?: readonly string[];
  /** Adds "Change Password" to the row menu — staff accounts only. */
  showChangePassword?: boolean;
}

/**
 * A users table with its row actions wired up: the suspend / unsuspend / delete
 * confirmations and the profile sheet.
 *
 * Rendered by both the Users page and the roles module's Admin Users tab, so the
 * two lists stay the same table with the same actions rather than drifting.
 */
export function UsersPanel({
  panel,
  showFilterTabs = true,
  rowLabel,
  hiddenColumns,
  showChangePassword = false,
}: UsersPanelProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  /**
   * The picker deals in `Date`s and the panel's filters in strings, so the
   * chosen range is kept here for the trigger's label and handed to the panel
   * as two ISO timestamps — which is what `GET /users` takes.
   */
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>();

  const openModal = (user: User, type: ModalType) => {
    setSelectedUser(user);
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
  };

  const { query } = panel;

  const changeDateRange = (next: DateRangeFilterValue) => {
    setDateRange(next);
    panel.setFilter("fromDate", next.range.from.toISOString());
    // Closed at the end of the day, so a single-day range covers all of it.
    panel.setFilter("toDate", endOfDay(next.range.to).toISOString());
  };

  return (
    <>
      <DataState>
        <DataState.Error
          when={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
        />
        <DataState.Content>
          <UserTable
            {...panel.table}
            dateRange={dateRange}
            onDateRangeChange={changeDateRange}
            onOpenModal={openModal}
            showFilterTabs={showFilterTabs}
            rowLabel={rowLabel}
            hiddenColumns={hiddenColumns}
            showChangePassword={showChangePassword}
          />
        </DataState.Content>
      </DataState>

      {selectedUser && (
        <UserActionModals
          user={selectedUser}
          modal={modal}
          onClose={closeModal}
        />
      )}

      {selectedUser && (modal === "view" || modal === "edit") ? (
        <ViewUserSheet
          user={selectedUser}
          open
          onClose={closeModal}
          editMode={modal === "edit"}
          onEdit={() => setModal("edit")}
        />
      ) : null}
    </>
  );
}
